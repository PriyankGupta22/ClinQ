import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { readApiError, request } from "../../api/client";
import { dashboardDemoEnabled, requestDashboard } from "../../api/dashboardRequest";
import { subscribeAuthenticatedIdentity } from "../../api/authenticatedIdentity";

const DoctorClinicContext = createContext(null);
const readToken = () => localStorage.getItem("doctorAccessToken") || "";
const noClinics = [];

export function DoctorClinicProvider({ children }) {
  const token = useSyncExternalStore(subscribeAuthenticatedIdentity, readToken);
  const [result, setResult] = useState(null);
  const [selection, setSelection] = useState(null);
  const current = token && result?.token === token ? result : null;
  const clinics = current?.clinics || noClinics;
  const selectedClinicId = selection?.token === token && clinics.some(clinic => clinic.id === selection.id)
    ? selection.id : current?.selectedClinicId || "";
  const loading = Boolean(token && !current);
  const error = current?.error || "";

  useEffect(() => {
    let active = true;
    const isCurrent = () => active && token === readToken();
    if (!token) return () => { active = false; };

    const load = dashboardDemoEnabled
      ? requestDashboard("get", "/api/dashboard/doctor", null, token).then(data => ({
        clinics: (data.clinics || []).map(clinic => ({ clinicId: clinic })),
      }))
      : request("get", "/api/doctor-auth/clinics", null, token);
    load
      .then((data) => {
        if (!isCurrent()) return;
        const availableClinics = (data?.clinics || []).filter(link => link?.clinicId?._id &&
          link.clinicId.isActive !== false).map((link) => ({
          id: link.clinicId._id,
          name: link.clinicId.clinicName,
          address: link.clinicId.address,
        }));
        const stored = localStorage.getItem("doctorSelectedClinicId");
        const nextId = availableClinics.some(clinic => clinic.id === stored) ? stored : availableClinics[0]?.id || "";
        setResult({ token, clinics: availableClinics, selectedClinicId: nextId });
      })
      .catch((requestError) => {
        if (isCurrent()) setResult({ token, clinics: [], error: readApiError(requestError).message || "Could not load your clinics." });
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    // Persist only after verifying the available clinics. A dashboard selection
    // made while affiliations are loading wins over the saved/default clinic.
    if (!token || loading || dashboardDemoEnabled || token !== readToken()) return;
    if (selectedClinicId) localStorage.setItem("doctorSelectedClinicId", selectedClinicId);
    else localStorage.removeItem("doctorSelectedClinicId");
  }, [token, loading, selectedClinicId]);

  const selectClinic = useCallback((clinicId) => {
    if (!clinicId || (!loading && !clinics.some((clinic) => clinic.id === clinicId))) return;
    setSelection({ token, id: clinicId });
  }, [clinics, token, loading]);

  const value = useMemo(() => ({
    clinics,
    selectedClinicId,
    selectedClinic: clinics.find((clinic) => clinic.id === selectedClinicId) || null,
    loading,
    error,
    selectClinic,
  }), [clinics, selectedClinicId, loading, error, selectClinic]);

  return <DoctorClinicContext.Provider value={value}>{children}</DoctorClinicContext.Provider>;
}

export function useDoctorClinic() {
  const context = useContext(DoctorClinicContext);
  if (!context) throw new Error("useDoctorClinic must be used inside DoctorClinicProvider");
  return context;
}

export function withDoctorClinic(path, clinicId) {
  if (!clinicId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}clinicId=${encodeURIComponent(clinicId)}`;
}
