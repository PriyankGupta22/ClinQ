import { test, before, beforeEach, after, mock } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile, readdir } from 'node:fs/promises';
import { createHash, randomBytes } from 'node:crypto';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import router from '../src/routes/dashboard.routes.js';
import { ids, oid, NOW, day, dateLabel, appointment, fixtures } from './dashboard-fixtures.js';
import { installDatabaseMock } from './dashboard-mock-db.js';

// Run serially: model execution hooks and the fixture database are process-local.
// No dotenv import, database connection, server.js execution, or shared DB writes.
const state = { data: null, calls: [], failure: null };
const roles = { clinic: 'clinicAdmin', doctor: 'doctor', patient: 'patient' };
const principals = { clinic: ids.c1, doctor: ids.d1, patient: ids.u1 };
const originalSecret = process.env.JWT_SECRET;
let server, base, sourceHashes;

async function hashes() {
    const root = new URL('../src/', import.meta.url);
    const result = {};
    for (const path of await readdir(root, { recursive: true })) {
        if (path.endsWith('.js')) result[path] = createHash('sha256')
            .update(await readFile(new URL(path.replaceAll('\\', '/'), root))).digest('hex');
    }
    return result;
}

before(async () => {
    sourceHashes = await hashes();
    process.env.JWT_SECRET = randomBytes(32).toString('hex');
    mock.timers.enable({ apis: ['Date'], now: NOW });
    installDatabaseMock(mock, state);
    // Fail closed if the tested path attempts a database connection or write.
    mock.method(mongoose, 'connect', () => { throw new Error('Live DB connections forbidden'); });
    for (const method of ['insertOne', 'insertMany', 'updateOne', 'updateMany', 'deleteOne',
        'deleteMany', 'findOneAndUpdate', 'findOneAndDelete', 'bulkWrite', 'createIndex', 'createIndexes']) {
        if (typeof mongoose.Collection.prototype[method] === 'function') {
            mock.method(mongoose.Collection.prototype, method, () => { throw new Error('DB writes forbidden'); });
        }
    }
    const app = express();
    app.use(express.json());
    app.use('/api/dashboard', router);
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    base = `http://127.0.0.1:${server.address().port}/api/dashboard`;
});
beforeEach(() => { state.data = fixtures(); state.calls = []; state.failure = null; });
after(async () => {
    try {
        if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
        assert.deepEqual(await hashes(), sourceHashes, 'Production source files changed during tests');
    } finally {
        mock.restoreAll();
        mock.timers.reset();
        if (originalSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = originalSecret;
    }
});

const token = (kind, payload = {}, options = {}) => jwt.sign({
    id: String(principals[kind]), role: roles[kind], ...payload
}, process.env.JWT_SECRET, { expiresIn: '15m', ...options });
async function request(kind, options = {}) {
    const header = options.header === null ? {} : {
        Authorization: options.header ?? `Bearer ${token(kind)}`
    };
    const response = await fetch(`${base}/${kind}${options.query ?? ''}`, { headers: header });
    const body = await response.json();
    assert(!JSON.stringify(body).includes('PRIVATE_'), 'Private fixture content leaked');
    return { status: response.status, body };
}
const hasKeys = (object, fields) => fields.forEach(key => assert(Object.hasOwn(object, key), `Missing ${key}`));
const idList = rows => rows.map(row => String(row._id));
function contract(kind, body) {
    assert.equal(body.success, true);
    assert.equal(body.dashboard, kind);
    hasKeys(body, [kind, 'stats', ...(kind === 'patient' ? ['upcomingAppointmentsList', 'queueEntries'] : ['upcomingAppointments'])]);
    if (kind === 'clinic') {
        hasKeys(body, ['doctors']);
        hasKeys(body.clinic, ['id', 'name']);
        hasKeys(body.stats, ['patientsToday', 'appointmentsToday', 'activeDoctors', 'waitingPatients',
            'consultingPatients', 'completedToday', 'cancelledToday']);
    } else if (kind === 'doctor') {
        hasKeys(body, ['clinics']);
        hasKeys(body.doctor, ['_id', 'name', 'specialization', 'schedule']);
        hasKeys(body.stats, ['appointmentsToday', 'patientsToday', 'completedToday', 'waitingPatients', 'consultingPatients']);
    } else {
        hasKeys(body.patient, ['_id', 'name', 'email']);
        hasKeys(body.stats, ['totalAppointments', 'upcomingAppointments', 'completedAppointments', 'activeQueues']);
    }
}

test('server mounts dashboard router at the expected prefix (static inspection)', async () => {
    const source = await readFile(new URL('../src/server.js', import.meta.url), 'utf8');
    assert.match(source, /import dashboardRoutes from ["']\.\/routes\/dashboard\.routes\.js["']/);
    assert.match(source, /app\.use\(["']\/api\/dashboard["'],\s*dashboardRoutes\)/);
});

test('all synthetic fixtures satisfy the existing Mongoose schemas', async () => {
    for (const [name, rows] of Object.entries(state.data)) {
        for (const row of rows) {
            await new mongoose.models[name](row).validate();
        }
    }
});

test('clinic success: contract, unique patients, status metrics, per-doctor counts and privacy', async () => {
    const { status, body } = await request('clinic', { query: `?clinicId=${ids.c2}` });
    assert.equal(status, 200); contract('clinic', body);
    assert.equal(body.stats.appointmentsToday, 5);
    assert.equal(body.stats.patientsToday, 3); // Repeated u1 visits count once; legacy includes cancelled.
    assert.equal(body.stats.activePatientsToday, 2);
    assert.equal(body.stats.activeAppointmentsToday, 3);
    assert.deepEqual(body.statusBreakdown, { scheduled: 2, completed: 1, cancelled: 2 });
    assert.equal(body.stats.completedToday, 1); assert.equal(body.stats.cancelledToday, 2);
    assert.equal(body.stats.waitingPatients, 2); assert.equal(body.stats.consultingPatients, 1);
    assert.equal(body.stats.activeDoctors, 3);
    assert.deepEqual(body.doctorStats.map(({ consultingPatients, completedConsultations, patientsServed, ...legacy }) => legacy), [
        { doctorId: String(ids.d1), appointmentsToday: 2, activeAppointmentsToday: 2, waitingPatients: 1 },
        { doctorId: String(ids.d2), appointmentsToday: 3, activeAppointmentsToday: 1, waitingPatients: 1 },
        { doctorId: String(ids.d4), appointmentsToday: 0, activeAppointmentsToday: 0, waitingPatients: 0 }
    ]);
    assert.equal(body.todayAppointments.length, 5);
    for (const row of [...body.todayAppointments, ...body.upcomingAppointments]) {
        assert.equal(row.clinicId._id, String(ids.c1));
        assert.deepEqual(Object.keys(row.userId).sort(), ['_id', 'name']);
    }
    assert.equal(body.upcomingAppointments.length, 3);
    assert(body.upcomingAppointments.every(row => row.status === 'scheduled'));
    for (const call of state.calls) {
        const key = call.model === 'Clinic' ? '_id' : 'clinicId';
        assert.equal(String(call.scope[key]), String(ids.c1));
    }
});

test('doctor success: assigned patients, own queues, associated clinics and legacy fields', async () => {
    const { status, body } = await request('doctor', { query: `?doctorId=${ids.d2}` });
    assert.equal(status, 200); contract('doctor', body);
    assert.equal(body.stats.appointmentsToday, 3); assert.equal(body.stats.patientsToday, 2);
    assert.deepEqual(body.statusBreakdown, { scheduled: 2, completed: 1, cancelled: 0 });
    assert.equal(body.stats.waitingPatients, 2); assert.equal(body.stats.consultingPatients, 1);
    assert.deepEqual(idList(body.clinics), [String(ids.c1), String(ids.c2)]);
    assert.equal(body.todayAppointments.length, 3);
    assert(body.todayAppointments.every(row => row.doctorId._id === String(ids.d1)));
    for (const row of body.todayAppointments) assert.deepEqual(Object.keys(row.userId).sort(), ['_id', 'name']);
    for (const call of state.calls) {
        assert.equal(String(call.scope[call.model === 'Doctor' ? '_id' : 'doctorId']), String(ids.d1));
    }
});

test('seven-day trends: zero-fill, unique daily patients, boundaries and excluded cancellations', async () => {
    for (const kind of ['clinic', 'doctor']) {
        const { body } = await request(kind);
        assert.deepEqual(body.trend.map(row => row.date), Array.from({ length: 7 }, (_, n) => dateLabel(day(n - 6))));
        assert.equal(body.trend[0].appointments, 1); assert.equal(body.trend[0].patients, 1);
        assert.deepEqual(body.trend[1], { date: dateLabel(day(-5)), appointments: 0, patients: 0,
            scheduled: 0, completed: 0, cancelled: 0 });
        assert.equal(body.trend[5].appointments, 1); assert.equal(body.trend[5].patients, 1);
        assert.equal(body.trend[6].appointments, 3); assert.equal(body.trend[6].patients, 2);
        assert.equal(body.trend[6].cancelled, kind === 'clinic' ? 2 : 0);
        assert.equal(body.trend.reduce((sum, row) => sum + row.appointments, 0), 5);
    }
});

test('doctor cancellation metrics separate active counts from legacy totals', async () => {
    const { status, body } = await request('doctor', { header: `Bearer ${token('doctor', { id: String(ids.d2) })}` });
    assert.equal(status, 200);
    assert.deepEqual(body.statusBreakdown, { scheduled: 1, completed: 0, cancelled: 2 });
    assert.equal(body.stats.appointmentsToday, 3); assert.equal(body.stats.activeAppointmentsToday, 1);
    assert.equal(body.stats.patientsToday, 2); assert.equal(body.stats.activePatientsToday, 1);
    assert.equal(body.trend[6].appointments, 1); assert.equal(body.trend[6].patients, 1);
    assert.equal(body.upcomingAppointments.length, 1);
});

test('completed and cancelled history includes today, but future cancellations are not upcoming', async () => {
    const { body } = await request('patient', { header: `Bearer ${token('patient', { id: String(ids.u2) })}` });
    assert(body.appointmentHistory.some(row => row._id === String(oid(103)) && row.status === 'cancelled'));
    assert(body.appointmentHistory.some(row => row._id === String(oid(106)) && row.status === 'completed'));
    assert(body.upcomingAppointmentsList.every(row => row.status === 'scheduled'));
    state.data.Appointment.push(appointment(999, ids.c1, ids.d1, ids.u2, 1, 'cancelled'));
    const next = (await request('patient', { header: `Bearer ${token('patient', { id: String(ids.u2) })}` })).body;
    assert.deepEqual(next.upcomingAppointmentsList, body.upcomingAppointmentsList);
    assert.deepEqual(next.appointmentHistory, body.appointmentHistory);
    assert.equal(next.stats.totalAppointments, body.stats.totalAppointments + 1);
});

test('patient success: own history/upcoming/queues, counts, ordering and privacy', async () => {
    const { status, body } = await request('patient', { query: `?userId=${ids.u2}` });
    assert.equal(status, 200); contract('patient', body);
    assert.deepEqual(body.stats, { totalAppointments: 4, upcomingAppointments: 2, completedAppointments: 1, activeQueues: 2 });
    assert.deepEqual(idList(body.appointmentHistory), [String(oid(102)), String(oid(107))]);
    assert.deepEqual(idList(body.upcomingAppointmentsList), [String(oid(101)), String(oid(109))]);
    assert.equal(body.queueEntries.length, 2);
    for (const row of [...body.appointmentHistory, ...body.upcomingAppointmentsList]) {
        assert.equal(row.userId._id, String(ids.u1));
    }
    const ownQueueIds = state.data.QueueEntry.filter(row => row.userId.equals(ids.u1)).map(row => String(row._id));
    assert.deepEqual(idList(body.queueEntries), ownQueueIds);
    assert(!JSON.stringify(body).includes('patient1@example.test'));
    for (const call of state.calls) {
        if (call.model === 'Clinic') {
            assert(call.scope._id.$in.every(id => [String(ids.c1)].includes(String(id))));
            continue;
        }
        assert.equal(String(call.scope[call.model === 'User' ? '_id' : 'userId']), String(ids.u1));
    }
});

for (const kind of ['clinic', 'doctor', 'patient']) {
    test(`${kind}: ten-day calendar boundaries, zero fill and legacy trend`, async () => {
        state.data.Appointment.push(
            appointment(3001, ids.c1, ids.d1, ids.u1, -9, 'completed'),
            appointment(3002, ids.c1, ids.d1, ids.u1, -10, 'completed'),
            appointment(3003, ids.c1, ids.d1, ids.u1, -9, 'scheduled', 23),
            appointment(3004, ids.c1, ids.d1, ids.u2, -9, 'cancelled'));
        const { status, body } = await request(kind);
        assert.equal(status, 200);
        assert.deepEqual(body.trend10Days.map(row => row.date), Array.from({ length: 10 }, (_, n) => dateLabel(day(n - 9))));
        assert.equal(body.trend10Days[0].appointments, 2);
        assert.equal(body.trend10Days[0].completed, 1);
        assert.equal(body.trend10Days[1].appointments, 0);
        if (kind === 'patient') {
            assert(!Object.hasOwn(body.trend10Days[0], 'patients'));
            assert.equal(body.trend10Days[0].cancelled, 0);
            assert.equal(body.comparison.metric, 'completedAppointments');
        } else {
            assert.deepEqual(body.trend, body.trend10Days.slice(-7));
            assert.equal(body.trend10Days[0].patients, 1);
            assert.equal(body.trend10Days[0].cancelled, 1);
        }
    });

    test(`${kind}: comparison uses appointment data and handles zero baseline`, async () => {
        const before = (await request(kind)).body;
        assert.equal(before.comparison.currentDay, kind === 'patient' ? 1 : 2);
        assert.equal(before.comparison.previousDay, kind === 'patient' ? 0 : 1);
        assert.equal(before.comparison.difference, 1);
        assert.equal(before.comparison.percentageChange, kind === 'patient' ? null : 100);
        state.data.Appointment = [];
        const { body } = await request(kind);
        assert.equal(body.comparison.percentageChange, null);
        assert.equal(body.comparison.difference, 0);
    });

    for (const query of ['?month=2026-13', '?month=2026-00', '?month=0000-01', '?month=2026-2',
        '?date=2026-02-29', '?date=2026-04-31', '?date=2026-11-31', '?date=invalid',
        '?date=2026-11-01&date=2026-11-02', '?month[x]=2026-11', '?month=']) {
        test(`${kind}: rejects calendar input ${query} before database reads`, async () => {
            const { status } = await request(kind, { query });
            assert.equal(status, 400);
            assert.equal(state.calls.length, 0);
        });
    }

    test(`${kind}: calendar month, leap date and selected-day coverage`, async () => {
        const { status, body } = await request(kind, { query: '?month=2026-11&date=2026-11-01' });
        assert.equal(status, 200);
        assert.equal(body.calendar.days.length, 30);
        assert.deepEqual(body.calendar.coverage, { start: '2026-11-01', endExclusive: '2026-12-01', complete: true, timezone: 'server-local' });
        assert.equal(body.calendar.days[0].appointments, kind === 'clinic' ? 5 : kind === 'doctor' ? 3 : 2);
        assert.equal(body.selectedDay.appointmentCount, body.calendar.days[0].appointments);
        assert.equal(body.selectedDay.appointmentsTruncated, false);
        const leap = await request(kind, { query: '?month=2028-02&date=2028-02-29' });
        assert.equal(leap.status, 200); assert.equal(leap.body.calendar.days.length, 29);
        assert.equal(leap.body.selectedDay.appointmentCount, 0);
    });

    test(`${kind}: selected-day and daily queue results are bounded with full counts`, async () => {
        for (let n = 0; n < 25; n++) {
            const item = appointment(4000 + n, ids.c1, ids.d1, ids.u1, 0, 'scheduled');
            state.data.Appointment.push(item);
            state.data.QueueEntry.push({ ...state.data.QueueEntry[0], _id: oid(6000 + n), appointmentId: item._id, queueNumber: 50 + n });
        }
        const { body } = await request(kind);
        assert.equal(body.selectedDay.appointments.length, 20);
        assert.equal(body.selectedDay.queueEntries.length, 20);
        assert.equal(body.selectedDay.appointmentsTruncated, true);
        assert.equal(body.selectedDay.queuesTruncated, true);
        assert.equal(body.dailyQueue.truncated, true);
        assert(body.dailyQueue.total > 20);
        assert.equal(body.calendar.days[0].appointments, body.selectedDay.appointmentCount);
        const row = body.dailyQueue.queueEntries[0];
        hasKeys(row, ['_id', 'queueNumber', 'status', 'appointmentTime', 'estimatedStartTime']);
        assert.equal(typeof row.estimatedEndTime, 'number');
        assert(!Object.hasOwn(row, 'nextPatient'));
    });

    test(`${kind}: reads do not mutate fixtures and expose only safe populated fields`, async () => {
        const snapshot = JSON.stringify(state.data);
        const { status, body } = await request(kind);
        assert.equal(status, 200);
        assert.equal(JSON.stringify(state.data), snapshot);
        for (const row of body.selectedDay.queueEntries) {
            assert.deepEqual(Object.keys(row.userId).sort(), ['_id', 'name']);
            if (kind === 'patient') assert.equal(row.userId._id, String(ids.u1));
        }
        assert(!JSON.stringify(body).includes('password'));
    });
}

for (const [kind, key, id, unauthorized] of [
    ['clinic', 'doctorId', ids.d1, ids.d3],
    ['doctor', 'clinicId', ids.c1, oid(999)],
    ['patient', 'clinicId', ids.c1, ids.c2]
]) {
    test(`${kind}: authorized ${key} filter applies consistently and preserves options`, async () => {
        const unfiltered = (await request(kind)).body;
        const { status, body } = await request(kind, { query: `?${key}=${id}` });
        assert.equal(status, 200);
        assert.equal(body.appliedFilters[key], String(id));
        const optionsKey = kind === 'clinic' ? 'doctors' : kind === 'doctor' ? 'clinics' : 'selectorClinics';
        assert.deepEqual(body[optionsKey], unfiltered[optionsKey]);
        assert.equal(body.stats.appointmentsToday ?? body.selectedDay.appointmentCount, 2);
        assert.equal(body.calendar.days[0].appointments, 2);
        const lists = [body.selectedDay.appointments, body.selectedDay.queueEntries, body.dailyQueue.queueEntries,
            body.todayAppointments ?? body.upcomingAppointmentsList];
        for (const rows of lists) for (const row of rows) assert.equal(row[key]._id, String(id));
        if (kind === 'clinic') {
            assert.equal(body.stats.activeDoctors, 1);
            assert(body.doctorStats.every(row => row.doctorId === String(id)));
            assert.equal(body.doctorAvailability.find(row => row.doctorId === String(ids.d2)).status, 'unknown');
        }
    });
    test(`${kind}: unassociated ${key} returns 403`, async () => {
        const { status } = await request(kind, { query: `?${key}=${unauthorized}` });
        assert.equal(status, 403);
        assert(state.calls.every(call => ['findOne'].includes(call.operation)));
    });
    for (const value of ['bad', '', '123456789012', `${id}&${key}=${id}`, `${id}%00`]) {
        test(`${kind}: malformed selector ${value} fails before database access`, async () => {
            const { status } = await request(kind, { query: `?${key}=${value}` });
            assert.equal(status, 400); assert.equal(state.calls.length, 0);
        });
    }
}

test('consultation metrics use queue status independently, deduplicate patients and retain dates', async () => {
    const source = state.data.QueueEntry.find(row => row.status === 'completed');
    state.data.QueueEntry.push({ ...source, _id: oid(7000), appointmentId: oid(7100),
        consultationStartedAt: day(0, 9), consultationEndedAt: day(0, 10) });
    const { body } = await request('clinic');
    assert.equal(body.stats.completedToday, 1);
    assert.equal(body.consultationStats.completedConsultations, 2);
    assert.equal(body.consultationStats.patientsServed, 1);
    assert.equal(body.consultationStats.basis, 'queueDate');
    const doctor = body.doctorStats.find(row => row.doctorId === String(ids.d2));
    assert.equal(doctor.completedConsultations, 2); assert.equal(doctor.patientsServed, 1);
    assert.equal(body.doctorAvailability.find(row => row.doctorId === String(ids.d1)).status, 'consulting');
    assert.equal(body.doctorAvailability.find(row => row.doctorId === String(ids.d2)).status, 'unknown');
    assert.equal(body.doctorAvailability[0].livePresence, false);
    const queue = body.selectedDay.queueEntries.find(row => row._id === String(oid(7000)));
    assert.equal(queue.consultationStartedAt, day(0, 9).toISOString());
    assert.equal(queue.consultationEndedAt, day(0, 10).toISOString());
});

test('new queue projections safely tolerate missing doctor, clinic and patient references', async () => {
    state.data.Doctor = state.data.Doctor.filter(row => !row._id.equals(ids.d2));
    state.data.Clinic = state.data.Clinic.filter(row => !row._id.equals(ids.c2));
    state.data.User = state.data.User.filter(row => !row._id.equals(ids.u3));
    const clinic = await request('clinic'); assert.equal(clinic.status, 200);
    assert(clinic.body.selectedDay.queueEntries.some(row => row.doctorId === null));
    const doctor = await request('doctor'); assert.equal(doctor.status, 200);
    assert(doctor.body.dailyQueue.queueEntries.some(row => row.clinicId === null && row.userId === null));
});

test('local midnight boundaries include the full calendar day across DST', async () => {
    const lastInstant = new Date(day(1).getTime() - 1);
    state.data.Appointment = [
        { ...appointment(8001, ids.c1, ids.d1, ids.u1, 0, 'completed'), appointmentDate: lastInstant },
        appointment(8002, ids.c1, ids.d1, ids.u1, 1, 'completed'),
        { ...appointment(8003, ids.c1, ids.d1, ids.u1, -1, 'completed'), appointmentDate: new Date(day(0).getTime() - 1) }
    ];
    for (const kind of ['clinic', 'doctor', 'patient']) {
        const { status, body } = await request(kind);
        assert.equal(status, 200);
        assert.equal(body.trend10Days[9].completed, 1);
        assert.equal(body.trend10Days[8].completed, 1);
        assert.equal(body.selectedDay.appointmentCount, 1);
        assert.equal(body.selectedDay.appointments[0].appointmentDate, lastInstant.toISOString());
    }
});

test('patient clinic filtering scopes every dataset and retains all own clinic options', async () => {
    const item = appointment(8101, ids.c2, ids.d1, ids.u1, 0, 'completed');
    state.data.Appointment.push(item);
    state.data.QueueEntry.push({ ...state.data.QueueEntry[0], _id: oid(8102), appointmentId: item._id,
        clinicId: ids.c2, status: 'completed' });
    const { status, body } = await request('patient', { query: `?clinicId=${ids.c2}` });
    assert.equal(status, 200);
    assert.deepEqual(idList(body.selectorClinics), [String(ids.c1), String(ids.c2)]);
    assert.equal(body.stats.totalAppointments, 1);
    assert.equal(body.stats.completedAppointments, 1);
    assert.equal(body.stats.activeQueues, 0);
    assert.equal(body.trend10Days[9].completed, 1);
    assert.equal(body.trend10Days[8].appointments, 0);
    assert.equal(body.calendar.days[0].appointments, 1);
    assert.equal(body.consultationStats.completedConsultations, 1);
    assert.equal(body.dailyQueue.total, 1);
    assert.equal(body.appointmentHistory[0]._id, String(item._id));
});

test('clinic and doctor filters scope trends, comparisons and consultation counts', async () => {
    for (const [kind, query] of [['clinic', `?doctorId=${ids.d1}`], ['doctor', `?clinicId=${ids.c1}`]]) {
        const { body } = await request(kind, { query });
        assert.equal(body.stats.waitingPatients, 1);
        assert.equal(body.trend10Days[9].patients, 1);
        assert.equal(body.comparison.currentDay, 1);
        assert.equal(body.comparison.difference, 0);
        assert.equal(body.consultationStats.completedConsultations, 0);
        assert.equal(body.consultationStats.consultingConsultations, 1);
    }
});

test('patient clinic options are capped with explicit coverage and use own queue-only associations', async () => {
    for (let n = 0; n < 105; n++) {
        const clinicId = oid(9000 + n);
        state.data.Clinic.push({ ...state.data.Clinic[0], _id: clinicId, clinicName: `Synthetic option ${n}` });
        state.data.QueueEntry.push({ ...state.data.QueueEntry[0], _id: oid(10000 + n), clinicId });
    }
    const { status, body } = await request('patient');
    assert.equal(status, 200);
    assert.equal(body.selectorClinics.length, 100);
    assert.deepEqual(body.selectorCoverage, { limit: 100, truncated: true });
    assert(!body.selectorClinics.some(row => row._id === String(ids.c2)));
});

test('negative percentage changes and completed visits are not fabricated from queues', async () => {
    state.data.Appointment = [appointment(8201, ids.c1, ids.d1, ids.u1, -1, 'completed')];
    for (const kind of ['clinic', 'doctor', 'patient']) {
        const { body } = await request(kind);
        assert.equal(body.comparison.currentDay, 0);
        assert.equal(body.comparison.previousDay, 1);
        assert.equal(body.comparison.percentageChange, -100);
        assert.equal(body.trend10Days[9].completed, 0);
        assert.equal(body.consultationStats.consultingConsultations, 1);
    }
});

test('selected-day reads distinguish historical queues from today and leave legacy data unchanged', async () => {
    const previous = { ...state.data.QueueEntry[0], _id: oid(8301), date: day(-1), status: 'completed' };
    state.data.QueueEntry.push(previous);
    const before = (await request('doctor')).body;
    const { body } = await request('doctor', { query: `?month=2026-10&date=${dateLabel(day(-1))}` });
    assert.equal(body.selectedDay.queueCount, 1);
    assert.equal(body.selectedDay.queueEntries[0]._id, String(previous._id));
    assert.deepEqual(body.stats, before.stats);
    assert.deepEqual(body.trend, before.trend);
    assert.deepEqual(body.consultationStats, before.consultationStats);
    assert.equal(body.calendar.days.length, 31);
});

for (const kind of ['clinic', 'doctor', 'patient']) test(`${kind}: query injection and duplicate months are rejected before reads`, async () => {
    const key = kind === 'clinic' ? 'doctorId' : 'clinicId';
    for (const query of [`?${key}[$ne]=x`, '?month=2026-11&month=2026-12', '?date=0000-01-01']) {
        state.calls = [];
        const { status } = await request(kind, { query });
        assert.equal(status, 400); assert.equal(state.calls.length, 0);
    }
});

for (const [kind, model, operation] of [
    ['patient', 'Appointment', 'aggregate'], ['patient', 'QueueEntry', 'aggregate'],
    ['patient', 'Clinic', 'find'], ['doctor', 'QueueEntry', 'find'], ['clinic', 'QueueEntry', 'find'],
    ['clinic', 'Appointment', 'countDocuments']
]) test(`${kind}: new ${model}.${operation} failure is generic`, async () => {
    state.failure = { model, operation };
    const { status, body } = await request(kind);
    assert.equal(status, 500); assert.deepEqual(body, { message: `Failed to load ${kind} dashboard` });
});

for (const kind of Object.keys(roles)) {
    test(`${kind}: empty appointment and queue collections`, async () => {
        state.data.Appointment = []; state.data.QueueEntry = [];
        const { status, body } = await request(kind);
        assert.equal(status, 200); contract(kind, body);
        assert.deepEqual(body[kind === 'patient' ? 'upcomingAppointmentsList' : 'upcomingAppointments'], []);
        if (kind === 'patient') {
            assert.deepEqual(body.appointmentHistory, []); assert.deepEqual(body.queueEntries, []);
            assert(Object.values(body.stats).every(value => value === 0));
        } else {
            assert.deepEqual(body.todayAppointments, []);
            assert.equal(body.stats.appointmentsToday, 0); assert.equal(body.stats.patientsToday, 0);
            assert.equal(body.stats.waitingPatients, 0); assert.equal(body.stats.consultingPatients, 0);
            assert.equal(body.trend.length, 7);
            assert(body.trend.every(row => row.appointments === 0 && row.patients === 0 && row.cancelled === 0));
        }
    });
    const authCases = [
        ['missing token', () => null, 401],
        ['malformed token', () => 'Bearer malformed.jwt', 401],
        ['incorrect signature', () => `Bearer ${jwt.sign({ id: String(principals[kind]), role: roles[kind] }, 'isolated-wrong-key')}`, 401],
        ['expired token', () => `Bearer ${token(kind, {}, { expiresIn: -1 })}`, 401],
        ['wrong role', () => `Bearer ${token(kind, { role: 'wrong' })}`, 403],
        ['missing ID', () => `Bearer ${token(kind, { id: undefined })}`, 401],
        ['invalid ID', () => `Bearer ${token(kind, { id: 'not-an-object-id', role: 'wrong' })}`, 401],
        ['object ID injection', () => `Bearer ${token(kind, { id: { $ne: null } })}`, 401],
        ['non-object payload', () => `Bearer ${jwt.sign('synthetic-string', process.env.JWT_SECRET)}`, 401]
    ];
    for (const [label, header, expected] of authCases) test(`${kind}: ${label}`, async () => {
        const { status, body } = await request(kind, { header: header() });
        assert.equal(status, expected); assert.deepEqual(Object.keys(body), ['message']);
        assert.equal(state.calls.length, 0, 'Rejected authentication must not reach any DB query');
    });
    test(`${kind}: nonexistent authenticated record returns 404`, async () => {
        const { status } = await request(kind, { header: `Bearer ${token(kind, { id: String(oid(9999)) })}` });
        assert.equal(status, 404);
    });
}

for (const [kind, model, operation] of [
    ['clinic', 'Clinic', 'findOne'], ['clinic', 'DoctorClinic', 'find'],
    ['clinic', 'Appointment', 'aggregate'], ['clinic', 'QueueEntry', 'aggregate'], ['clinic', 'Appointment', 'find'],
    ['doctor', 'Doctor', 'findOne'], ['doctor', 'DoctorClinic', 'find'],
    ['doctor', 'Appointment', 'aggregate'], ['doctor', 'QueueEntry', 'countDocuments'], ['doctor', 'Appointment', 'find'],
    ['patient', 'User', 'findOne'], ['patient', 'Appointment', 'countDocuments'],
    ['patient', 'Appointment', 'find'], ['patient', 'QueueEntry', 'find'], ['patient', 'QueueEntry', 'countDocuments']
]) test(`${kind}: ${model}.${operation} failure returns generic 500`, async () => {
    state.failure = { model, operation };
    const { status, body } = await request(kind);
    assert.equal(status, 500);
    assert.deepEqual(body, { message: `Failed to load ${kind} dashboard` });
});

test('bounded appointment/history/queue lists retain full counts and stable sort order', async () => {
    for (let n = 0; n < 65; n++) {
        const today = appointment(1000 + n, ids.c1, ids.d1, ids.u1, 0, 'scheduled');
        state.data.Appointment.push(today, appointment(2000 + n, ids.c1, ids.d1, ids.u1, -2, 'completed'));
        state.data.QueueEntry.push({ ...state.data.QueueEntry[0], _id: oid(5000 + n), appointmentId: today._id, queueNumber: 100 + n });
    }
    for (const kind of ['clinic', 'doctor', 'patient']) {
        const { status, body } = await request(kind); assert.equal(status, 200);
        const upcoming = body[kind === 'patient' ? 'upcomingAppointmentsList' : 'upcomingAppointments'];
        assert.equal(upcoming.length, 20);
        assert.deepEqual(idList(upcoming), idList((await request(kind)).body[kind === 'patient' ? 'upcomingAppointmentsList' : 'upcomingAppointments']));
        if (kind === 'patient') {
            assert.equal(body.appointmentHistory.length, 50); assert.equal(body.queueEntries.length, 20);
            assert.equal(body.stats.activeQueues, 67); assert.equal(body.stats.upcomingAppointments, 67);
            assert.equal(body.stats.completedAppointments, 66); assert.equal(body.stats.totalAppointments, 134);
        } else {
            assert.equal(body.todayAppointments.length, 20);
            assert.equal(body.stats.appointmentsToday, (kind === 'clinic' ? 5 : 3) + 65);
        }
    }
});

test('inactive linked records are omitted, and missing populated patients do not expose data', async () => {
    state.data.Doctor.find(row => row._id.equals(ids.d4)).isActive = false;
    state.data.User = state.data.User.filter(row => !row._id.equals(ids.u3));
    const { status, body } = await request('clinic'); assert.equal(status, 200);
    assert.equal(body.stats.activeDoctors, 2);
    assert.equal(body.todayAppointments.find(row => row._id === String(oid(105))).userId, null);
});
