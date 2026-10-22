import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { request } from '../../api/client';
import { dashboardDemoEnabled, requestDashboard } from '../../api/dashboardRequest';
import { invalidateAuthenticatedIdentity, loadAuthenticatedIdentity, readAuthenticatedIdentity,
  subscribeAuthenticatedIdentity } from '../../api/authenticatedIdentity';
import { doctorHours, doctorProfileView, profileError, readDoctorAccount, readDoctorAffiliations } from './doctorProfileData';

let profileSession = { token: '', revision: 0 };
const readSession = () => {
  const token = localStorage.getItem('doctorAccessToken') || '';
  if (token !== profileSession.token) profileSession = { token, revision: profileSession.revision + 1 };
  return profileSession;
};
const errorText = error => ({ 401: 'Your doctor session has expired or is invalid. Please sign in again.',
  403: 'Access denied for this doctor profile.', 404: 'Doctor profile not found.' })[error.response?.status] ||
  'Unable to load the doctor profile. Please try again later.';

export default function useDoctorProfile() {
  const session = useSyncExternalStore(subscribeAuthenticatedIdentity, readSession);
  const [result, setResult] = useState(null);
  const pending = useRef(null);

  useEffect(() => {
    let active = true;
    const current = () => active && readSession() === session;
    if (!session.token) return () => { active = false; };
    const load = async () => {
      if (dashboardDemoEnabled) {
        // Local-only dashboard preview preserves the authenticated name/email/
        // specialization; unsupported profile details are explicitly Demo.
        const response = await requestDashboard('GET', '/api/dashboard/doctor', undefined, session.token);
        const doctor = readDoctorAccount(response);
        return { doctor, affiliations: { clinics: response.clinics, count: response.clinics.length }, demo: true };
      }
      await loadAuthenticatedIdentity('doctor', session.token);
      if (readSession() !== session) throw profileError(401, 'Session changed.');
      const expected = readAuthenticatedIdentity('doctor', session.token)?._id;
      const [account, links] = await Promise.allSettled([
        request('get', '/api/doctor-auth/me', null, session.token),
        request('get', '/api/doctor-auth/clinics', null, session.token),
      ]);
      if (account.status === 'rejected') throw account.reason;
      if (links.status === 'rejected' && [401, 403].includes(links.reason.response?.status)) throw links.reason;
      const doctor = readDoctorAccount(account.value, expected);
      if (links.status === 'rejected') return { doctor, warning: 'Clinic affiliations could not be loaded.', demo: false };
      try {
        const affiliations = readDoctorAffiliations(links.value, doctor._id || doctor.id);
        return { doctor, affiliations, warning: affiliations.incomplete ? 'Some clinic references are unavailable.' : '', demo: false };
      } catch {
        return { doctor, warning: 'Clinic affiliations could not be verified.', demo: false };
      }
    };
    // Deduplicate only the in-flight request during StrictMode effect replay.
    if (pending.current?.session !== session) {
      const entry = { session, promise: load() };
      pending.current = entry;
      const clear = () => { if (pending.current === entry) pending.current = null; };
      entry.promise.then(clear, clear);
    }
    pending.current.promise.then(data => {
      if (current()) setResult({ session, ...data });
    }).catch(error => {
      if (!current()) return;
      if ([401, 403].includes(error.response?.status)) invalidateAuthenticatedIdentity('doctor', session.token);
      setResult({ session, error: errorText(error) });
    });
    return () => { active = false; };
  }, [session]);

  const data = session.token && result?.session === session ? result : null;
  const message = !session.token ? 'Sign in to view your doctor profile.' : !data ? 'Loading doctor profile…' : data.error || data.warning || '';
  return { profile: doctorProfileView(data?.doctor, data?.affiliations, data?.demo),
    schedule: doctorHours(data?.doctor?.schedule, data?.demo), message };
}
