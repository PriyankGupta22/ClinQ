import test from 'node:test';
import assert from 'node:assert/strict';
import { createDashboardDemoDataset, generateDashboardDemo, readDemoIdentity } from '../src/api/dashboardDemoData.js';

const now = new Date('2026-10-22T06:00:00Z');
const subjectId = 'abcdef0123456789abcdef01';
const build = (kind, search = '', dataset) => generateDashboardDemo({ kind, subjectId, search, now, dataset });
const token = claims => `header.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.synthetic`;
const valid = role => ({ id: subjectId, role, exp: now.getTime() / 1000 + 60 });
const status = code => error => error.response?.status === code;

for (const kind of ['clinic', 'doctor', 'patient']) {
  test(`${kind}: populated contract, ten calendar days and metrics derived from records`, () => {
    const dataset = createDashboardDemoDataset(now, { kind, subjectId });
    const response = build(kind, '', dataset);
    assert.equal(response.dashboard, kind);
    assert.equal(response.trend10Days.length, 10);
    assert.equal(response.trend10Days[0].date, '2026-10-13');
    assert.equal(response.trend10Days[9].date, '2026-10-22');
    const key = { clinic: 'clinicId', doctor: 'doctorId', patient: 'userId' }[kind];
    const rows = dataset.appointments.filter(row => row[key]._id === subjectId);
    assert.equal(rows.length, { clinic: 30, doctor: 18, patient: 8 }[kind]);
    for (const day of response.calendar.days) assert.equal(day.appointments,
      rows.filter(row => row.appointmentDate === day.date).length);
    for (const day of response.trend10Days) {
      for (const state of ['scheduled', 'completed', 'cancelled']) assert.equal(day[state],
        rows.filter(row => row.appointmentDate === day.date && row.status === state).length);
      assert.equal(day.appointments, day.scheduled + day.completed);
      if (kind === 'patient') assert(!Object.hasOwn(day, 'patients'));
    }
    if (kind === 'patient') {
      assert.equal(response.stats.totalAppointments, rows.length);
      assert.equal(response.stats.completedAppointments, rows.filter(row => row.status === 'completed').length);
      assert.equal(response.stats.activeQueues, response.queueEntries.length);
      assert(response.upcomingAppointmentsList.every(row => row.status === 'scheduled' && row.userId._id === subjectId));
    } else {
      assert.equal(response.stats.appointmentsToday, response.todayAppointments.length);
      assert.equal(response.stats.completedToday, response.todayAppointments.filter(row => row.status === 'completed').length);
      assert(response.upcomingAppointments.every(row => row.status === 'scheduled'));
    }
  });

  test(`${kind}: selector options stable, scoped rows and General reset`, () => {
    const general = build(kind);
    const options = general.doctors || general.clinics || general.selectorClinics;
    const key = kind === 'clinic' ? 'doctorId' : 'clinicId';
    const selected = build(kind, `?${key}=${options[0]._id}`);
    assert.equal(selected.appliedFilters[key], options[0]._id);
    assert.deepEqual(selected.doctors || selected.clinics || selected.selectorClinics, options);
    for (const row of selected.selectedDay.appointments) assert.equal(row[key]._id, options[0]._id);
    assert.deepEqual(build(kind), general);
    assert.throws(() => build(kind, `?${key}=${'f'.repeat(24)}`), status(403));
  });

  test(`${kind}: calendar navigation, selected-day queues and appointment association`, () => {
    const response = build(kind, '?month=2026-11&date=2026-10-22');
    assert.equal(response.calendar.month, '2026-11');
    assert.equal(response.calendar.days.length, 30);
    assert.equal(response.selectedDay.date, '2026-10-22');
    for (const queue of response.selectedDay.queueEntries) {
      assert(response.selectedDay.appointments.some(row => row._id === queue.appointmentId));
      assert.equal(typeof queue.estimatedEndTime, 'number');
      assert.equal(queue.date, response.selectedDay.date);
    }
    assert.throws(() => build(kind, '?date=2026-02-30'), status(400));
    assert.throws(() => build(kind, '?month=2026-13'), status(400));
    assert.throws(() => build(kind, '?date=2026-10-22&date=2026-10-21'), status(400));
  });

  test(`${kind}: empty records, zero charts and unavailable comparison baseline`, () => {
    const dataset = createDashboardDemoDataset(now, { kind, subjectId });
    dataset.appointments = []; dataset.queues = [];
    const response = build(kind, '', dataset);
    assert.equal(response.trend10Days.length, 10);
    assert(response.trend10Days.every(row => row.appointments === 0 && row.completed === 0));
    assert.equal(response.comparison.percentageChange, null);
    assert.equal(response.selectedDay.appointmentCount, 0);
    assert.equal(response.dailyQueue.total, 0);
  });

  test(`${kind}: capped appointment/queue lists retain independent full counts`, () => {
    const dataset = createDashboardDemoDataset(now, { kind, subjectId });
    const key = { clinic: 'clinicId', doctor: 'doctorId', patient: 'userId' }[kind];
    const source = dataset.appointments.find(row => row[key]._id === subjectId);
    dataset.appointments = Array.from({ length: 65 }, (_, i) => ({ ...source, _id: String(i).padStart(24, '0'),
      appointmentDate: dataset.today, status: 'scheduled' }));
    const queue = dataset.queues.find(row => row[key]._id === subjectId);
    dataset.queues = dataset.appointments.map((row, i) => ({ ...queue, _id: String(i + 100).padStart(24, '0'),
      appointmentId: row._id, date: dataset.today, status: 'waiting' }));
    const response = build(kind, '', dataset);
    assert.equal(response.selectedDay.appointments.length, 20);
    assert.equal(response.selectedDay.appointmentCount, 65);
    assert.equal(response.selectedDay.queueEntries.length, 20);
    assert.equal(response.selectedDay.queueCount, 65);
    assert.equal(response.selectedDay.appointmentsTruncated, true);
    assert.equal(response.dailyQueue.total, 65);
    const list = response.upcomingAppointmentsList || response.upcomingAppointments;
    assert.equal(list.length, 20);
    if (kind === 'patient') {
      assert.equal(response.stats.totalAppointments, 65);
      assert.equal(response.stats.upcomingAppointments, 65);
      assert.equal(response.stats.activeQueues, 65);
    }
  });
}

test('clinic per-doctor metrics reconcile with full clinic totals', () => {
  const response = build('clinic');
  assert.equal(response.doctors.length, 6);
  for (const key of ['appointmentsToday', 'waitingPatients', 'consultingPatients']) {
    assert.equal(response.doctorStats.reduce((sum, row) => sum + row[key], 0), response.stats[key]);
  }
});
test('doctor has two assigned clinics and patient has eight personal bookings', () => {
  assert.equal(build('doctor').clinics.length, 2);
  assert.equal(build('patient').stats.totalAppointments, 8);
});
test('history limit is 50 and personal completed count remains uncapped', () => {
  const dataset = createDashboardDemoDataset(now, { kind: 'patient', subjectId });
  const source = dataset.appointments.find(row => row.userId._id === subjectId);
  dataset.appointments = Array.from({ length: 65 }, (_, i) => ({ ...source, _id: String(i).padStart(24, '0'), status: 'completed' }));
  const response = build('patient', '', dataset);
  assert.equal(response.appointmentHistory.length, 50);
  assert.equal(response.stats.completedAppointments, 65);
});
test('demo calendar uses India date across UTC midnight', () => {
  assert.equal(createDashboardDemoDataset(new Date('2026-10-21T20:00:00Z')).today, '2026-10-22');
  assert.equal(createDashboardDemoDataset(new Date('2026-10-22T19:00:00Z')).today, '2026-10-23');
});
test('each role requires its own non-expired session and subject', () => {
  for (const [kind, role] of Object.entries({ doctor: 'doctor', patient: 'patient', clinic: 'clinicAdmin' })) {
    assert.equal(readDemoIdentity(token(valid(role)), kind, now.getTime()), subjectId);
    for (const other of ['doctor', 'patient', 'clinicAdmin'].filter(value => value !== role)) {
      assert.throws(() => readDemoIdentity(token(valid(other)), kind, now.getTime()), status(403));
    }
    assert.throws(() => readDemoIdentity(token({ ...valid(role), exp: now.getTime() / 1000 }), kind, now.getTime()), status(401));
    assert.throws(() => readDemoIdentity(token({ ...valid(role), nbf: now.getTime() / 1000 + 1 }), kind, now.getTime()), status(401));
    assert.throws(() => readDemoIdentity(token({ ...valid(role), id: 'invalid' }), kind, now.getTime()), status(401));
  }
  for (const value of ['', 'broken', 'a.e30.b']) assert.throws(() => readDemoIdentity(value, 'doctor', now.getTime()), status(401));
});
test('a new identity rebases every personal row without mutating previous responses', () => {
  const first = build('patient');
  const second = generateDashboardDemo({ kind: 'patient', subjectId: 'f'.repeat(24), now });
  assert(first.upcomingAppointmentsList.every(row => row.userId._id === subjectId));
  assert(second.upcomingAppointmentsList.every(row => row.userId._id === 'f'.repeat(24)));
});
test('subject IDs matching a synthetic peer cannot merge patient or doctor records', () => {
  for (const [kind, value, count] of [['patient', 302, 8], ['doctor', 202, 18]]) {
    const owner = value.toString(16).padStart(24, '0');
    const dataset = createDashboardDemoDataset(now, { kind, subjectId: owner });
    const key = kind === 'patient' ? 'userId' : 'doctorId';
    assert.equal(dataset.appointments.filter(row => row[key]._id === owner).length, count);
  }
});
test('all queue records match a non-cancelled appointment and clinic has waiting and consulting', () => {
  const dataset = createDashboardDemoDataset(now);
  for (const queue of dataset.queues) {
    const appointment = dataset.appointments.find(row => row._id === queue.appointmentId);
    assert(appointment);
    assert.notEqual(appointment.status, 'cancelled');
    assert.equal(queue.date, appointment.appointmentDate);
    for (const key of ['userId', 'clinicId', 'doctorId']) assert.equal(queue[key]._id, appointment[key]._id);
  }
  const clinic = generateDashboardDemo({ kind: 'clinic', subjectId: dataset.clinics[0]._id, now, dataset });
  assert(clinic.stats.waitingPatients > 0);
  assert(clinic.stats.consultingPatients > 0);
});
for (const kind of ['clinic', 'doctor', 'patient']) {
  test(`${kind}: demo account identity is neutral without an authenticated profile`, () => {
    const response = build(kind);
    assert.equal(response[kind].name, '');
    assert.equal(response[kind].email, '');
    if (kind === 'doctor') assert.equal(response.doctor.specialization, '');
    assert(response.trend10Days.some(row => row.appointments > 0));
  });
  test(`${kind}: only the matching authenticated profile supplies name and email`, () => {
    const profile = { _id: subjectId, name: 'Authenticated Account', email: 'actual@example.test', specialization: 'Neurology' };
    const response = generateDashboardDemo({ kind, subjectId, now, profile });
    assert.equal(response[kind].name, profile.name);
    assert.equal(response[kind].email, profile.email);
    if (kind === 'doctor') assert.equal(response.doctor.specialization, profile.specialization);
    const other = generateDashboardDemo({ kind, subjectId, now, profile: { ...profile, _id: 'b'.repeat(24) } });
    assert.equal(other[kind].name, '');
    assert.equal(other[kind].email, '');
  });
  test(`${kind}: own references in appointments and queues retain real identity without mutating fixtures`, () => {
    const dataset = createDashboardDemoDataset(now, { kind, subjectId });
    const original = JSON.stringify(dataset);
    const profile = { _id: subjectId, name: 'Actual Account', email: 'actual@example.test', specialization: 'Neurology' };
    const response = generateDashboardDemo({ kind, subjectId, now, dataset, profile });
    const key = { clinic: 'clinicId', doctor: 'doctorId', patient: 'userId' }[kind];
    const rows = [...response.selectedDay.appointments, ...response.selectedDay.queueEntries,
      ...(response.upcomingAppointments || response.upcomingAppointmentsList), ...(response.appointmentHistory || [])];
    assert(rows.length > 0);
    for (const row of rows) {
      assert.equal(row[key][kind === 'clinic' ? 'clinicName' : 'name'], profile.name);
      assert.equal(row[key].email, profile.email);
    }
    assert.equal(JSON.stringify(dataset), original);
  });
}
