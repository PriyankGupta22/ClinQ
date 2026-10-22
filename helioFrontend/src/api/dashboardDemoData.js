// Local preview records only. No database, storage, network or authentication writes.
const id = n => n.toString(16).padStart(24, '0');
const label = date => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
const shift = (date, days) => {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return label(value);
};
const indiaDate = now => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(now);
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && label(new Date(`${value}T00:00:00Z`)) === value;
const uniquePatients = rows => new Set(rows.map(row => row.userId?._id).filter(Boolean)).size;
const statusCounts = rows => Object.fromEntries(['scheduled', 'completed', 'cancelled'].map(status =>
  [status, rows.filter(row => row.status === status).length]));
const active = row => ['waiting', 'consulting'].includes(row.status);
const oldest = rows => [...rows].sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate) || a._id.localeCompare(b._id));
const queueOrder = rows => [...rows].sort((a, b) => a.queueNumber - b.queueNumber || a._id.localeCompare(b._id));

export function demoError(status, message) {
  return Object.assign(new Error(message), { response: { status, data: { message } } });
}

// This is a local preview eligibility check, NOT signature verification or a
// replacement for backend JWT authorization. No token is issued or persisted.
export function readDemoIdentity(token, kind, now = Date.now()) {
  if (!token) throw demoError(401, 'Sign in before viewing dashboard demo data.');
  let claims;
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts.every(Boolean)) throw new Error();
    claims = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof claims.id !== 'string' || !/^[a-fA-F0-9]{24}$/.test(claims.id) || !Number.isFinite(claims.exp) || claims.exp * 1000 <= now ||
        (claims.nbf !== undefined && (!Number.isFinite(claims.nbf) || claims.nbf * 1000 > now))) throw new Error();
  } catch {
    throw demoError(401, 'Your session has expired or is invalid. Please sign in again.');
  }
  if (claims.role !== ({ clinic: 'clinicAdmin', doctor: 'doctor', patient: 'patient' })[kind]) {
    throw demoError(403, 'This session cannot view this dashboard.');
  }
  return claims.id;
}

export function createDashboardDemoDataset(now = new Date(), owner = {}) {
  const today = indiaDate(now);
  const clinics = [
    { _id: id(101), clinicName: 'Saanjh Family Clinic (Demo)', address: { street: '12 Kalpana Lane', city: 'Pune', state: 'Maharashtra', pincode: '411038' } },
    { _id: id(102), clinicName: 'Nira Wellness Centre (Demo)', address: { street: '8 Amaltas Avenue', city: 'Pune', state: 'Maharashtra', pincode: '411021' } },
  ];
  const doctors = [
    ['Dr. Meera Kulkarni', 'General Medicine'], ['Dr. Aarav Menon', 'Cardiology'],
    ['Dr. Kavya Iyer', 'Dermatology'], ['Dr. Rohan Deshmukh', 'Orthopaedics'],
    ['Dr. Nisha Banerjee', 'Paediatrics'], ['Dr. Vihaan Shah', 'ENT'],
  ].map(([name, specialization], index) => ({ _id: id(201 + index), name, specialization,
    schedule: { day: 'Monday–Saturday', startTime: '09:00', endTime: '17:00' } }));
  const patients = ['Ananya Joshi', 'Kabir Nair', 'Ishita Sen', 'Arjun Rao', 'Diya Patel', 'Reyansh Gupta',
    'Sana Shaikh', 'Aditya Bhat', 'Avni Reddy', 'Dev Mehta', 'Tara Das', 'Neil Verma']
    .map((name, index) => ({ _id: id(301 + index), name, email: `demo.patient${index + 1}@example.test` }));
  const principals = { clinic: clinics[0], doctor: doctors[0], patient: patients[0] };
  if (principals[owner.kind] && owner.subjectId) {
    const peers = ({ clinic: clinics, doctor: doctors, patient: patients })[owner.kind];
    peers.slice(1).forEach((row, index) => {
      if (row._id === owner.subjectId) row._id = id(9001 + index);
    });
    principals[owner.kind]._id = owner.subjectId;
  }
  const offsets = [-9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 0, 1, -6, -3, -1, 0, 2, 4,
    -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 0, 0, 0, 1, 2, 3, 4, 5];
  const personal = new Set([0, 4, 8, 10, 14, 17, 23, 30]);
  const reasons = ['Blood pressure follow-up', 'Seasonal allergy review', 'Routine health review',
    'Knee discomfort assessment', 'Skin rash follow-up', 'Medication review'];
  const appointments = offsets.map((offset, index) => ({
    _id: id(1001 + index), appointmentDate: shift(today, offset),
    // Explicit calendar labels model bookings; queue records hold actual times.
    userId: patients[personal.has(index) ? 0 : 1 + index % (patients.length - 1)],
    doctorId: doctors[index < 18 ? 0 : 1 + (index - 18) % 5],
    clinicId: clinics[index >= 12 && index < 18 ? 1 : 0],
    reason: index < 18 ? reasons[index % reasons.length] : ['Chest discomfort review', 'Skin rash follow-up',
      'Knee discomfort assessment', 'Child health follow-up', 'Seasonal allergy review'][(index - 18) % 5],
    status: offset < 0 ? (index % 7 === 0 ? 'cancelled' : 'completed') :
      offset === 0 && [9, 28, 30].includes(index) ? 'completed' : 'scheduled',
  }));
  const counters = new Map();
  const queues = appointments.filter(row => row.appointmentDate <= today && row.status !== 'cancelled').map((row, index) => {
    const key = `${row.appointmentDate}/${row.clinicId._id}/${row.doctorId._id}`;
    const queueNumber = (counters.get(key) || 0) + 1;
    counters.set(key, queueNumber);
    const time = `${row.appointmentDate}T${String(9 + Math.floor(index / 4) % 7).padStart(2, '0')}:${String(index % 4 * 15).padStart(2, '0')}:00+05:30`;
    const status = row.status === 'completed' ? 'completed' :
      row.clinicId === clinics[1] || row._id === appointments[27]._id ? 'consulting' : 'waiting';
    return { _id: id(2001 + index), appointmentId: row._id, userId: row.userId, doctorId: row.doctorId,
      clinicId: row.clinicId, date: row.appointmentDate, queueNumber, status, appointmentTime: time,
      estimatedStartTime: status === 'waiting' ? time : null, estimatedEndTime: 15,
      consultationStartedAt: status !== 'waiting' ? time : null,
      consultationEndedAt: status === 'completed' ? new Date(Date.parse(time) + 15 * 60000).toISOString() : null };
  });
  return { today, clinics, doctors, patients, appointments, queues };
}

export function generateDashboardDemo({ kind, subjectId, search = '', now = new Date(), dataset, profile }) {
  if (!['clinic', 'doctor', 'patient'].includes(kind) || !/^[a-fA-F0-9]{24}$/.test(subjectId)) {
    throw demoError(401, 'Invalid dashboard identity.');
  }
  const records = dataset || createDashboardDemoDataset(now, { kind, subjectId });
  const { today, clinics, doctors } = records;
  // Roster identities remain fictional; the authenticated principal never is.
  // Only the caller's existing backend profile may supply account fields.
  const identity = profile && (profile._id || profile.id) === subjectId ? profile : {};
  const query = new URLSearchParams(search);
  const filterKey = kind === 'clinic' ? 'doctorId' : 'clinicId';
  if ([...query.keys()].some(key => ![filterKey, 'date', 'month'].includes(key) || query.getAll(key).length !== 1)) {
    throw demoError(400, 'Invalid dashboard parameters.');
  }
  const date = query.get('date') ?? today;
  const month = query.get('month') ?? today.slice(0, 7);
  if (!validDate(date) || !/^\d{4}-\d{2}$/.test(month) || !validDate(`${month}-01`)) {
    throw demoError(400, 'Invalid calendar month or date.');
  }
  const ownKey = ({ clinic: 'clinicId', doctor: 'doctorId', patient: 'userId' })[kind];
  const ownProfile = { _id: subjectId, email: identity.email || '', ...(kind === 'clinic'
    ? { clinicName: identity.clinicName || identity.name || '' }
    : { name: identity.name || '', ...(kind === 'doctor' ? { specialization: identity.specialization || '' } : {}) }) };
  // Records may be synthetic, but references to the signed-in account must use
  // the same real (or unavailable) identity as the account header.
  const withOwnIdentity = row => ({ ...row, [ownKey]: ownProfile });
  const all = records.appointments.filter(row => row[ownKey]?._id === subjectId).map(withOwnIdentity);
  const ownedQueues = records.queues.filter(row => row[ownKey]?._id === subjectId).map(withOwnIdentity);
  const options = kind === 'clinic' ? doctors : kind === 'doctor' ? clinics :
    clinics.filter(clinic => [...all, ...ownedQueues].some(row => row.clinicId?._id === clinic._id));
  const filter = query.get(filterKey);
  if (query.has(filterKey) && (!/^[a-fA-F0-9]{24}$/.test(filter) || !options.some(row => row._id === filter))) {
    throw demoError(403, 'This selection is not associated with this demo account.');
  }
  const rows = all.filter(row => !filter || row[filterKey]?._id === filter);
  const queues = ownedQueues.filter(row => !filter || row[filterKey]?._id === filter);
  const todayRows = rows.filter(row => row.appointmentDate === today);
  const todayQueues = queueOrder(queues.filter(row => row.date === today));
  const selectedRows = oldest(rows.filter(row => row.appointmentDate === date));
  const selectedQueues = queueOrder(queues.filter(row => row.date === date));
  const upcoming = oldest(rows.filter(row => row.appointmentDate >= today && row.status === 'scheduled'));
  const completedQueues = todayQueues.filter(row => row.status === 'completed');
  const trend10Days = Array.from({ length: 10 }, (_, index) => {
    const day = shift(today, index - 9);
    const dayRows = rows.filter(row => row.appointmentDate === day);
    const counts = statusCounts(dayRows);
    return { date: day, ...counts, appointments: counts.scheduled + counts.completed,
      ...(kind === 'patient' ? {} : { patients: uniquePatients(dayRows.filter(row => row.status !== 'cancelled')) }) };
  });
  const metric = kind === 'patient' ? 'completed' : 'patients';
  const currentDay = trend10Days[9][metric], previousDay = trend10Days[8][metric];
  const calendarDays = [];
  for (let day = `${month}-01`; day.slice(0, 7) === month; day = shift(day, 1)) {
    const dayRows = rows.filter(row => row.appointmentDate === day);
    calendarDays.push({ date: day, appointments: dayRows.length, ...statusCounts(dayRows) });
  }
  const response = {
    success: true, dashboard: kind, appliedFilters: { [ownKey]: subjectId, ...(filter ? { [filterKey]: filter } : {}) },
    trend10Days, comparison: { metric: kind === 'patient' ? 'completedAppointments' : 'activePatients',
      currentDay, previousDay, difference: currentDay - previousDay,
      percentageChange: previousDay === 0 ? null : (currentDay - previousDay) / previousDay * 100 },
    calendar: { month, coverage: { start: `${month}-01`, endExclusive: shift(calendarDays.at(-1).date, 1),
      complete: true, timezone: 'Asia/Kolkata' }, days: calendarDays },
    selectedDay: { date, appointments: selectedRows.slice(0, 20), queueEntries: selectedQueues.slice(0, 20),
      appointmentCount: selectedRows.length, queueCount: selectedQueues.length, limit: 20,
      appointmentsTruncated: selectedRows.length > 20, queuesTruncated: selectedQueues.length > 20 },
    dailyQueue: { date: today, queueEntries: todayQueues.slice(0, 20), total: todayQueues.length,
      limit: 20, truncated: todayQueues.length > 20 },
    consultationStats: { basis: 'queueDate', completedConsultations: completedQueues.length,
      patientsServed: uniquePatients(completedQueues),
      consultingConsultations: todayQueues.filter(row => row.status === 'consulting').length },
  };
  if (kind === 'patient') return { ...response, patient: ownProfile,
    selectorClinics: options, selectorCoverage: { limit: 100, truncated: false },
    stats: { totalAppointments: rows.length, upcomingAppointments: upcoming.length,
      completedAppointments: rows.filter(row => row.status === 'completed').length,
      activeQueues: todayQueues.filter(active).length },
    upcomingAppointmentsList: upcoming.slice(0, 20), queueEntries: todayQueues.filter(active).slice(0, 20),
    appointmentHistory: oldest(rows.filter(row => row.appointmentDate < today ||
      (row.appointmentDate === today && row.status !== 'scheduled'))).reverse().slice(0, 50) };
  const counts = statusCounts(todayRows);
  const stats = { appointmentsToday: todayRows.length, patientsToday: uniquePatients(todayRows),
    activeAppointmentsToday: counts.scheduled + counts.completed,
    activePatientsToday: trend10Days[9].patients, scheduledToday: counts.scheduled,
    completedToday: counts.completed, cancelledToday: counts.cancelled,
    waitingPatients: todayQueues.filter(row => row.status === 'waiting').length,
    consultingPatients: todayQueues.filter(row => row.status === 'consulting').length };
  Object.assign(response, { stats, statusBreakdown: counts, trend: trend10Days.slice(-7),
    todayAppointments: oldest(todayRows).slice(0, 20), upcomingAppointments: upcoming.slice(0, 20) });
  if (kind === 'doctor') return { ...response, doctor: ownProfile, clinics: options };
  const scopedDoctors = options.filter(row => !filter || row._id === filter);
  return { ...response, clinic: { id: subjectId, name: ownProfile.clinicName, email: ownProfile.email },
    stats: { ...stats, activeDoctors: scopedDoctors.length }, doctors: options,
    doctorStats: scopedDoctors.map(doctor => {
      const appointments = todayRows.filter(row => row.doctorId?._id === doctor._id);
      const personalQueues = todayQueues.filter(row => row.doctorId?._id === doctor._id);
      return { doctorId: doctor._id, appointmentsToday: appointments.length,
        activeAppointmentsToday: appointments.filter(row => row.status !== 'cancelled').length,
        waitingPatients: personalQueues.filter(row => row.status === 'waiting').length,
        consultingPatients: personalQueues.filter(row => row.status === 'consulting').length,
        completedConsultations: personalQueues.filter(row => row.status === 'completed').length,
        patientsServed: uniquePatients(personalQueues.filter(row => row.status === 'completed')) };
    }), doctorAvailability: options.map(doctor => ({ doctorId: doctor._id,
      status: todayQueues.some(row => row.doctorId?._id === doctor._id && row.status === 'consulting') ? 'consulting' : 'unknown',
      basis: 'storedQueueStatus', livePresence: false })) };
}
