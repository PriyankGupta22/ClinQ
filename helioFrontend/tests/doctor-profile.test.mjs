import test from 'node:test';
import assert from 'node:assert/strict';
import { doctorHours, doctorPhotoPlaceholder, doctorProfileView, readDoctorAccount, readDoctorAffiliations }
  from '../src/components/doctorFrontend/doctorProfileData.js';

const id = 'a'.repeat(24);
const doctor = { _id: id, role: 'doctor', name: 'Dr. Aditi Rao', specialization: 'Neurology',
  email: 'aditi@example.test', phone: '+91 90000 00001', schedule: { day: 'Tuesday', startTime: '10:30', endTime: '13:45' } };
const clinic = { _id: 'b'.repeat(24), clinicName: 'Authorized Clinic', isActive: true };
const response = { success: true, clinics: [{ doctorId: id, clinicId: clinic }] };
const status = code => error => error.response?.status === code;

test('maps authenticated name, specialization, email, phone and authorized clinics', () => {
  const account = readDoctorAccount({ success: true, doctor }, id);
  const links = readDoctorAffiliations(response, id);
  const profile = doctorProfileView(account, links);
  for (const key of ['name', 'specialization', 'email', 'phone']) assert.equal(profile[key], doctor[key]);
  assert.deepEqual(profile.clinics, [clinic.clinicName]);
  assert.equal(profile.clinicCount, 1);
});
test('unsupported fields remain neutral even if an unexpected response supplies sample values', () => {
  const profile = doctorProfileView({ ...doctor, qualification: 'SAMPLE', experience: 99, fee: 500, about: 'SAMPLE', languages: ['SAMPLE'] });
  for (const key of ['experience', 'qualification', 'fee', 'about']) assert.equal(profile[key], 'Not provided');
  assert.deepEqual(profile.languages, ['Not provided']);
});
test('all missing profile/contact fields have neutral placeholders', () => {
  const profile = doctorProfileView(null);
  assert.equal(profile.name, 'Doctor unavailable');
  for (const key of ['specialization', 'email', 'phone', 'qualification', 'fee']) assert.equal(profile[key], 'Not provided');
  assert.equal(profile.clinicCount, null);
});
test('stored single-day hours are shown exactly and other slots remain unavailable', () => {
  const hours = doctorHours(doctor.schedule);
  assert.equal(hours.length, 5);
  assert.equal(hours.find(row => row.day === 'Tuesday').time, '10:30 — 13:45');
  assert(hours.filter(row => row.day !== 'Tuesday').every(row => row.time === 'Not provided'));
});
test('weekend schedule is retained without inventing weekday availability', () => {
  const hours = doctorHours({ day: 'Saturday', startTime: '14:00', endTime: '17:00' });
  assert.equal(hours.length, 5);
  assert.equal(hours[0].day, 'Saturday');
  assert.equal(hours[0].time, '14:00 — 17:00');
  assert(hours.slice(1).every(row => row.time === 'Not provided'));
});
test('missing or partial schedule never creates sample hours', () => {
  for (const schedule of [null, {}, { day: 'Monday' }, { startTime: '09:00', endTime: '17:00' }]) {
    assert(doctorHours(schedule).every(row => row.time === 'Not provided'));
  }
});
test('empty affiliation list is distinct from unavailable affiliations', () => {
  const links = readDoctorAffiliations({ success: true, clinics: [] }, id);
  assert.equal(doctorProfileView(doctor, links).clinicCount, 0);
  assert.deepEqual(doctorProfileView(doctor, links).clinics, ['No assigned clinics']);
  assert.equal(doctorProfileView(doctor).clinicCount, null);
});
test('null populated clinic references are safe and make the count unavailable', () => {
  const links = readDoctorAffiliations({ success: true, clinics: [{ doctorId: id, clinicId: null }] }, id);
  assert.equal(links.count, null);
  assert.equal(links.incomplete, true);
});
test('inactive and duplicate clinics do not fabricate active affiliations', () => {
  const links = readDoctorAffiliations({ success: true, clinics: [...response.clinics, ...response.clinics,
    { doctorId: id, clinicId: { ...clinic, _id: 'c'.repeat(24), isActive: false } }] }, id);
  assert.equal(links.count, 1);
});
test('rejects affiliation records belonging to another doctor', () => {
  assert.throws(() => readDoctorAffiliations({ success: true, clinics: [{ doctorId: 'f'.repeat(24), clinicId: clinic }] }, id), status(403));
});
test('rejects malformed account metadata and wrong identity/role/inactive account', () => {
  for (const result of [null, { success: true }, { success: true, doctor: [] }]) {
    assert.throws(() => readDoctorAccount(result), status(500));
  }
  for (const value of [{ ...doctor, role: 'patient' }, { ...doctor, isActive: false }, { ...doctor, _id: 'f'.repeat(24) }]) {
    assert.throws(() => readDoctorAccount({ success: true, doctor: value }, id), status(403));
  }
});
test('rejects malformed clinic response instead of inventing a zero count', () => {
  for (const value of [null, {}, { success: true, clinics: null }]) assert.throws(() => readDoctorAffiliations(value, id), status(500));
});
test('demo details remain labelled and preserve actual account identity', () => {
  const profile = doctorProfileView(doctor, { clinics: [clinic], count: 1 }, true);
  for (const key of ['name', 'specialization', 'email', 'phone']) assert.equal(profile[key], doctor[key]);
  for (const key of ['experience', 'qualification', 'fee', 'about']) assert.match(profile[key], /Demo/);
  assert(profile.languages.every(value => value.includes('Demo')));
  assert(doctorHours(null, true).every(row => row.time.includes('Demo')));
});
test('photo placeholder never contacts an avatar service or depicts another account photo', () => {
  assert(doctorPhotoPlaceholder.startsWith('data:image/svg+xml,'));
  assert(!doctorPhotoPlaceholder.includes('pravatar'));
  const svg = decodeURIComponent(doctorPhotoPlaceholder.split(',')[1]);
  assert(!/<image|(?:href|src)=/i.test(svg));
});
