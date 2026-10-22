// Synthetic data only. No connection string, login credentials, or real people.
import mongoose from 'mongoose';

export const oid = n => new mongoose.Types.ObjectId(n.toString(16).padStart(24, '0'));
export const ids = { c1: oid(1), c2: oid(2), c3: oid(3), d1: oid(11), d2: oid(12),
    d3: oid(13), d4: oid(14), u1: oid(21), u2: oid(22), u3: oid(23) };
// November 1 also exercises a DST transition when run with TZ=America/New_York.
export const NOW = new Date(2026, 10, 1, 12);
export const day = (offset, hour = 0) => {
    const value = new Date(NOW);
    value.setDate(value.getDate() + offset);
    value.setHours(hour, 0, 0, 0);
    return value;
};
export const dateLabel = date => [date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
export const appointment = (n, clinicId, doctorId, userId, offset, status, hour = 0) => ({
    _id: oid(100 + n), clinicId, doctorId, userId, appointmentDate: day(offset, hour),
    status, reason: `Synthetic visit ${n}`, createdAt: day(-10), updatedAt: day(0)
});

export function fixtures() {
    const { c1, c2, c3, d1, d2, d3, d4, u1, u2, u3 } = ids;
    const Clinic = [c1, c2, c3].map((_id, index) => ({
        _id, clinicName: `Test Clinic ${index}`, email: `clinic${index}@example.test`,
        password: 'PRIVATE_PASSWORD_SENTINEL', isActive: index !== 2,
        phone: '0000000000', role: 'clinicAdmin',
        address: { city: 'Test City', state: 'Test State', pincode: '000000' }
    }));
    const Doctor = [d1, d2, d3, d4].map((_id, index) => ({
        _id, name: `Test Doctor ${index}`, specialization: 'Test specialty', isActive: true,
        email: `doctor${index}@example.test`, password: 'PRIVATE_PASSWORD_SENTINEL',
        phone: '0000000000', role: 'doctor',
        schedule: { day: 'Monday', startTime: '09:00', endTime: '17:00', appointmentDuration: 10 }
    }));
    const User = [u1, u2, u3].map((_id, index) => ({
        _id, name: `Test Patient ${index}`, email: `patient${index}@example.test`,
        password: 'PRIVATE_PASSWORD_SENTINEL', role: 'patient'
    }));
    const DoctorClinic = [[c1, d1], [c1, d2], [c1, d4], [c2, d1], [c2, d3], [c3, d1]]
        .map(([clinicId, doctorId], index) => ({ _id: oid(50 + index), clinicId, doctorId }));
    const Appointment = [
        appointment(1, c1, d1, u1, 0, 'scheduled'),
        appointment(2, c1, d1, u1, 0, 'completed', 10),
        appointment(3, c1, d2, u2, 0, 'cancelled'),
        appointment(4, c1, d2, u2, 0, 'scheduled', 11),
        appointment(5, c1, d2, u3, 0, 'cancelled', 12),
        appointment(6, c1, d1, u2, -1, 'completed'),
        appointment(7, c1, d1, u1, -6, 'scheduled'),
        appointment(8, c1, d1, u2, -7, 'completed'),
        appointment(9, c1, d1, u1, 1, 'scheduled'),
        appointment(10, c2, d1, u3, 0, 'scheduled'),
        appointment(11, c2, d3, u2, 0, 'scheduled')
    ];
    const QueueEntry = [[1, 'waiting'], [4, 'waiting'], [2, 'consulting'],
        [10, 'waiting'], [11, 'waiting'], [5, 'completed']].map(([n, status], index) => {
        const a = Appointment.find(row => row._id.equals(oid(100 + n)));
        return { _id: oid(200 + index), appointmentId: a._id, clinicId: a.clinicId,
            doctorId: a.doctorId, userId: a.userId, date: day(0), appointmentTime: day(0, 9),
            queueNumber: index + 1, status, estimatedStartTime: day(0, 9),
            estimatedEndTime: new Date(day(0, 9).getTime() + 10 * 60000) };
    });
    return { Clinic, Doctor, User, DoctorClinic, Appointment, QueueEntry };
}
