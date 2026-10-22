const provided = value => typeof value === 'string' && value.trim() ? value.trim() : 'Not provided';
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const recordId = value => typeof value === 'string' ? value : value?._id || value?.id;
const objectId = value => typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);

// Generic placeholder, never a sample person's portrait or an external request.
export const doctorPhotoPlaceholder = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 430"><rect width="330" height="430" fill="#E8ECF2"/><circle cx="165" cy="150" r="48" fill="#BEC7D5"/><path d="M65 340v-35a100 100 0 01200 0v35" fill="#BEC7D5"/></svg>')}`;

export const profileError = (status, message) => Object.assign(new Error(message), {
  response: { status, data: { message } },
});

export function readDoctorAccount(response, expectedId) {
  const doctor = response?.doctor;
  const id = recordId(doctor);
  if (response?.success !== true || !doctor || Array.isArray(doctor) || !objectId(id)) {
    throw profileError(500, 'Doctor profile response is unavailable.');
  }
  if ((expectedId && id !== expectedId) || (doctor.role && doctor.role !== 'doctor') || doctor.isActive === false) {
    throw profileError(403, 'Doctor profile does not match this session.');
  }
  return doctor;
}

export function readDoctorAffiliations(response, doctorId) {
  if (response?.success !== true || !Array.isArray(response.clinics)) {
    throw profileError(500, 'Clinic affiliations are unavailable.');
  }
  const clinics = [];
  let incomplete = false;
  for (const link of response.clinics) {
    if (!link || recordId(link.doctorId) !== doctorId) {
      throw profileError(403, 'Clinic affiliations could not be verified for this doctor.');
    }
    const clinic = link.clinicId;
    if (!clinic || typeof clinic !== 'object' || !objectId(recordId(clinic))) { incomplete = true; continue; }
    if (clinic.isActive === false) continue;
    if (!clinics.some(row => recordId(row) === recordId(clinic))) clinics.push(clinic);
  }
  return { clinics, count: incomplete ? null : clinics.length, incomplete };
}

export function doctorHours(schedule, demo = false) {
  if (demo) return weekdays.map(day => ({ day, time: '09:00 – 13:00 (Demo)' }));
  const day = typeof schedule?.day === 'string' ? schedule.day.trim() : '';
  const days = weekdays.includes(day) || !['Saturday', 'Sunday'].includes(day) ? weekdays : [day, ...weekdays.slice(1)];
  return days.map(label => ({ day: label, time: label === day && provided(schedule?.startTime) !== 'Not provided' &&
    provided(schedule?.endTime) !== 'Not provided' ? `${schedule.startTime.trim()} — ${schedule.endTime.trim()}` : 'Not provided' }));
}

export function doctorProfileView(doctor, affiliations, demo = false) {
  const clinics = affiliations?.clinics || [];
  const count = affiliations?.count ?? null;
  return {
    name: provided(doctor?.name) === 'Not provided' ? 'Doctor unavailable' : doctor.name.trim(),
    specialization: provided(doctor?.specialization), email: provided(doctor?.email), phone: provided(doctor?.phone),
    experience: demo ? '8 years (Demo)' : 'Not provided', qualification: demo ? 'MBBS, MD (Demo)' : 'Not provided',
    fee: demo ? '₹650 (Demo)' : 'Not provided',
    about: demo ? 'Demo professional summary for preview only. Account identity comes from your authenticated profile.' : 'Not provided',
    languages: demo ? ['English (Demo)', 'Hindi (Demo)'] : ['Not provided'],
    clinics: clinics.length ? clinics.map(clinic => provided(clinic.clinicName) === 'Not provided' ? 'Clinic name not provided' : clinic.clinicName.trim())
      : [count === 0 ? 'No assigned clinics' : 'Not provided'],
    clinicCount: count, clinicCountLabel: count === null ? 'Not provided' : `${count} ${demo ? 'Demo Clinics' : 'Active Clinics'}`,
    clinicHeading: count === null ? 'Not provided' : `${count} ${demo ? 'DEMO CLINICS' : 'CLINICS'}`,
    affiliationLabel: demo ? 'Demo affiliation' : count === null ? 'Affiliation unavailable' : count === 0 ? 'Not assigned' : 'Active affiliation',
  };
}
