import mongoose from "mongoose";
import Appointment from "../models/Appointment.model.js";
import DoctorClinic from "../models/DoctorClinic.model.js";
import Doctor from "../models/Doctor.model.js";
import Clinic from "../models/Clinic.model.js";
import User from "../models/User.models.js";
import QueueEntry from "../models/QueueEntity.model.js";

const LIST_LIMIT = 20;
const HISTORY_LIMIT = 50;

// Use server-local calendar days, matching the existing queue controllers.
// One snapshot and half-open ranges keep all request metrics consistent.
// Upcoming includes today's scheduled date-only bookings, as before.
const dashboardDates = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const days = Array.from({ length: 10 }, (_, index) => {
        const from = new Date(start);
        from.setDate(from.getDate() - 9 + index);
        const to = new Date(from);
        to.setDate(to.getDate() + 1);
        const date = [from.getFullYear(), String(from.getMonth() + 1).padStart(2, "0"),
            String(from.getDate()).padStart(2, "0")].join("-");
        return { start: from, end: to, date };
    });
    return { start, end, days };
};

const authenticatedId = (req, res, role) => {
    const id = req.dashboardUser?.id;
    if (typeof id !== "string" || !/^[a-fA-F0-9]{24}$/.test(id)) {
        res.status(401).json({ message: "Invalid authenticated ID" });
        return null;
    }
    if (req.dashboardUser.role !== role) {
        res.status(403).json({ message: "Access denied" });
        return null;
    }
    // Aggregation pipelines require explicit ObjectIds (no automatic casting).
    return new mongoose.Types.ObjectId(id);
};

const appointmentDetails = (query, history = false) => query
    .select("userId doctorId clinicId appointmentDate reason status createdAt updatedAt")
    .populate("doctorId", "name specialization")
    .populate("clinicId", "clinicName address")
    .populate("userId", "name")
    .sort({ appointmentDate: history ? -1 : 1, _id: history ? -1 : 1 })
    .limit(history ? HISTORY_LIMIT : LIST_LIMIT)
    .lean();

// Aggregate counts rather than loading an unbounded appointment list.
// Explicit local-day boundaries keep grouping consistent even across DST.
const appointmentMetrics = async (scope, dates, includeDoctors = false) => {
    const today = { appointmentDate: { $gte: dates.start, $lt: dates.end } };
    const day = { $switch: {
        branches: dates.days.map(range => ({
            case: { $and: [
                { $gte: ["$appointmentDate", range.start] },
                { $lt: ["$appointmentDate", range.end] }
            ] },
            then: range.date
        })),
        default: null
    } };
    const facets = {
        statuses: [
            { $match: today },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ],
        patientsToday: [
            { $match: today },
            { $group: { _id: "$userId" } },
            { $count: "count" }
        ],
        dailyStatuses: [
            { $group: { _id: { date: day, status: "$status" }, count: { $sum: 1 } } }
        ],
        dailyPatients: [
            { $match: { status: { $in: ["scheduled", "completed"] } } },
            { $group: { _id: { date: day, userId: "$userId" } } },
            { $group: { _id: "$_id.date", count: { $sum: 1 } } }
        ]
    };
    if (includeDoctors) facets.doctors = [
        { $match: today },
        { $group: {
            _id: "$doctorId", appointmentsToday: { $sum: 1 },
            activeAppointmentsToday: { $sum: { $cond: [
                { $in: ["$status", ["scheduled", "completed"]] }, 1, 0
            ] } }
        } }
    ];
    const [result] = await Appointment.aggregate([
        { $match: { ...scope, appointmentDate: { $gte: dates.days[0].start, $lt: dates.end } } },
        { $facet: facets }
    ]);
    const statusBreakdown = { scheduled: 0, completed: 0, cancelled: 0 };
    for (const item of result.statuses) statusBreakdown[item._id] = item.count;
    const trend = dates.days.map(({ date }) => {
        const counts = { scheduled: 0, completed: 0, cancelled: 0 };
        for (const item of result.dailyStatuses) {
            if (item._id.date === date) counts[item._id.status] = item.count;
        }
        return {
            date,
            // Active trends exclude cancellations; legacy totals retain them.
            appointments: counts.scheduled + counts.completed,
            patients: result.dailyPatients.find(item => item._id === date)?.count ?? 0,
            ...counts
        };
    });
    return {
        stats: {
            appointmentsToday: Object.values(statusBreakdown).reduce((sum, count) => sum + count, 0),
            patientsToday: result.patientsToday[0]?.count ?? 0,
            activeAppointmentsToday: statusBreakdown.scheduled + statusBreakdown.completed,
            activePatientsToday: trend[9].patients,
            scheduledToday: statusBreakdown.scheduled,
            completedToday: statusBreakdown.completed,
            cancelledToday: statusBreakdown.cancelled
        },
        statusBreakdown, trend: trend.slice(-7), trend10Days: trend, doctors: result.doctors ?? []
    };
};

const dateLabel = value => [value.getFullYear(), String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0")].join("-");
const nextDay = value => { const end = new Date(value); end.setDate(end.getDate() + 1); return end; };

// Parse local calendar values without Date's overflow normalization or UTC parsing.
const parseDate = value => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split("-").map(Number);
    if (year < 1 || year > 9998) return null;
    const date = new Date(0);
    date.setHours(0, 0, 0, 0);
    date.setFullYear(year, month - 1, day);
    return dateLabel(date) === value ? date : null;
};

const queryOptions = (req, res, kind, dates) => {
    const query = req.query ?? {};
    const filterKey = kind === "clinic" ? "doctorId" : "clinicId";
    if (Object.keys(query).some(key => ["month", "date", filterKey].some(name => key.startsWith(`${name}[`)))) {
        res.status(400).json({ message: "Dashboard parameters must be scalar values" }); return null;
    }
    const rawId = query[filterKey];
    if (rawId !== undefined && (typeof rawId !== "string" || !/^[a-fA-F0-9]{24}$/.test(rawId))) {
        res.status(400).json({ message: `Invalid ${filterKey}` }); return null;
    }
    const month = query.month ?? dateLabel(dates.start).slice(0, 7);
    const monthStart = typeof month === "string" && /^\d{4}-\d{2}$/.test(month) ? parseDate(`${month}-01`) : null;
    const selected = query.date === undefined ? dates.start : parseDate(query.date);
    if (!monthStart || !selected) {
        res.status(400).json({ message: "Invalid calendar month or date" }); return null;
    }
    const monthEnd = new Date(monthStart); monthEnd.setMonth(monthEnd.getMonth() + 1);
    return { filterKey, filterId: rawId === undefined ? null : new mongoose.Types.ObjectId(rawId),
        month, monthStart, monthEnd, selected };
};

const queueDetails = query => query
    .select("appointmentId userId clinicId doctorId date queueNumber status appointmentTime estimatedStartTime estimatedEndTime consultationStartedAt consultationEndedAt")
    .populate("userId", "name").populate("clinicId", "clinicName").populate("doctorId", "name")
    .sort({ queueNumber: 1, _id: 1 }).limit(LIST_LIMIT).lean();

const comparison = (rows, patient) => {
    const key = patient ? "completed" : "patients";
    const currentDay = rows[9][key], previousDay = rows[8][key];
    return { metric: patient ? "completedAppointments" : "activePatients", currentDay, previousDay,
        difference: currentDay - previousDay,
        percentageChange: previousDay === 0 ? null : (currentDay - previousDay) / previousDay * 100 };
};

// Fixed-size calendar facets return at most 31 rows, independent of booking volume.
const calendarCounts = async (scope, options) => {
    const days = [];
    for (let date = new Date(options.monthStart); date < options.monthEnd; date = nextDay(date)) days.push(date);
    const [result] = await Appointment.aggregate([
        { $match: { ...scope, appointmentDate: { $gte: options.monthStart, $lt: options.monthEnd } } },
        { $group: { _id: { date: { $switch: {
            branches: days.map(date => ({ case: { $and: [
                { $gte: ["$appointmentDate", date] }, { $lt: ["$appointmentDate", nextDay(date)] }
            ] }, then: dateLabel(date) })), default: null
        } }, status: "$status" }, count: { $sum: 1 } } },
        { $facet: { counts: [{ $group: { _id: "$_id.date", total: { $sum: "$count" },
            scheduled: { $sum: { $cond: [{ $in: ["$_id.status", ["scheduled"]] }, "$count", 0] } },
            completed: { $sum: { $cond: [{ $in: ["$_id.status", ["completed"]] }, "$count", 0] } },
            cancelled: { $sum: { $cond: [{ $in: ["$_id.status", ["cancelled"]] }, "$count", 0] } }
        } }] } }
    ]);
    return { month: options.month, coverage: { start: dateLabel(options.monthStart),
        endExclusive: dateLabel(options.monthEnd), complete: true, timezone: "server-local" },
    days: days.map(date => { const row = result.counts.find(item => item._id === dateLabel(date));
        return { date: dateLabel(date), appointments: row?.total ?? 0, scheduled: row?.scheduled ?? 0,
            completed: row?.completed ?? 0, cancelled: row?.cancelled ?? 0 }; }) };
};

const dashboardExtras = async (scope, dates, options, metrics, kind) => {
    const selectedRange = { $gte: options.selected, $lt: nextDay(options.selected) };
    const appointmentScope = { ...scope, appointmentDate: selectedRange };
    const queueScope = { ...scope, date: selectedRange };
    const todayQueueScope = { ...scope, date: { $gte: dates.start, $lt: dates.end } };
    const [calendar, appointments, appointmentCount, queues, queueCount, consultationResult, dailyQueueEntries, dailyQueueCount] = await Promise.all([
        calendarCounts(scope, options), appointmentDetails(Appointment.find(appointmentScope)),
        Appointment.countDocuments(appointmentScope), queueDetails(QueueEntry.find(queueScope)),
        QueueEntry.countDocuments(queueScope),
        QueueEntry.aggregate([
            { $match: todayQueueScope },
            { $facet: {
                statuses: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
                served: [{ $match: { status: "completed" } }, { $group: { _id: "$userId" } },
                    { $match: { _id: { $ne: null } } }, { $count: "count" }],
                doctors: [
                    { $group: { _id: { doctorId: "$doctorId", userId: "$userId" },
                        consulting: { $sum: { $cond: [{ $in: ["$status", ["consulting"]] }, 1, 0] } },
                        completed: { $sum: { $cond: [{ $in: ["$status", ["completed"]] }, 1, 0] } } } },
                    { $group: { _id: "$_id.doctorId", consultingPatients: { $sum: "$consulting" },
                        completedConsultations: { $sum: "$completed" },
                        patientsServed: { $sum: { $cond: [{ $and: [
                            { $gte: ["$completed", 1] }, { $ne: ["$_id.userId", null] }
                        ] }, 1, 0] } } } }
                ]
            } }
        ]),
        queueDetails(QueueEntry.find(todayQueueScope)), QueueEntry.countDocuments(todayQueueScope)
    ]);
    const consultation = consultationResult[0];
    const perDoctor = new Map(consultation.doctors.map(({ _id, ...counts }) => [String(_id), { doctorId: _id, ...counts }]));
    const trend10Days = metrics.trend10Days.map(row => {
        if (kind !== "patient") return row;
        const { patients: _patients, ...personal } = row; return personal;
    });
    return { trend10Days, comparison: comparison(trend10Days, kind === "patient"),
        consultationStats: { basis: "queueDate", completedConsultations: consultation.statuses.find(row => row._id === "completed")?.count ?? 0,
            patientsServed: consultation.served[0]?.count ?? 0,
            consultingConsultations: consultation.statuses.find(row => row._id === "consulting")?.count ?? 0 },
        calendar, selectedDay: { date: dateLabel(options.selected), appointments, queueEntries: queues,
            appointmentCount, queueCount, limit: LIST_LIMIT,
            appointmentsTruncated: appointmentCount > appointments.length, queuesTruncated: queueCount > queues.length },
        dailyQueue: { date: dateLabel(dates.start), queueEntries: dailyQueueEntries, total: dailyQueueCount,
            limit: LIST_LIMIT, truncated: dailyQueueCount > dailyQueueEntries.length },
        appliedFilters: Object.fromEntries(Object.entries(scope).map(([key, value]) => [key, String(value)])),
        perDoctor };
};

// Options are independent of the selected filter; only the patient's own associations qualify.
const patientClinicOptions = async userId => {
    const sources = await Promise.all([Appointment, QueueEntry].map(model => model.aggregate([
        { $match: { userId } }, { $group: { _id: "$clinicId" } }, { $sort: { _id: 1 } }, { $limit: 101 }
    ])));
    const ids = [...new Set(sources.flat().filter(row => row._id != null).map(row => String(row._id)))].sort();
    const clinics = await Clinic.find({ _id: { $in: ids.slice(0, 100) } }).select("clinicName address").sort({ _id: 1 }).limit(100).lean();
    return { clinics, limit: 100, truncated: sources.some(rows => rows.length > 100) || ids.length > 100 };
};

export const clinicDashboard = async (req, res) => {
    try {
        const clinicId = authenticatedId(req, res, "clinicAdmin");
        if (!clinicId) return;
        const dates = dashboardDates();
        const options = queryOptions(req, res, "clinic", dates);
        if (!options) return;
        const scope = { clinicId };
        if (options.filterId) {
            if (!await DoctorClinic.findOne({ clinicId, doctorId: options.filterId }).select("_id").lean()) {
                return res.status(403).json({ message: "Doctor is not assigned to this clinic" });
            }
            scope.doctorId = options.filterId;
        }
        const dateFilter = { $gte: dates.start, $lt: dates.end };
        const clinic = await Clinic.findOne({ _id: clinicId, isActive: true })
            .select("clinicName email").lean();
        if (!clinic) return res.status(404).json({ message: "Clinic not found" });

        const [metrics, doctorLinks, queueCounts, todayAppointments, upcomingAppointments] = await Promise.all([
            appointmentMetrics(scope, dates, true),
            DoctorClinic.find({ clinicId }).select("doctorId")
                .populate({ path: "doctorId", match: { isActive: true }, select: "name specialization schedule" }).lean(),
            QueueEntry.aggregate([
                { $match: { ...scope, date: dateFilter, status: { $in: ["waiting", "consulting"] } } },
                { $group: { _id: { doctorId: "$doctorId", status: "$status" }, count: { $sum: 1 } } }
            ]),
            appointmentDetails(Appointment.find({ ...scope, appointmentDate: dateFilter })),
            appointmentDetails(Appointment.find({ ...scope, appointmentDate: { $gte: dates.start }, status: "scheduled" }))
        ]);
        // Retain counts for previously assigned doctors with activity today,
        // and include zero counts for all currently linked active doctors.
        const perDoctor = new Map();
        const ensureDoctor = id => {
            const key = String(id);
            if (!perDoctor.has(key)) perDoctor.set(key, {
                doctorId: id, appointmentsToday: 0, activeAppointmentsToday: 0, waitingPatients: 0
            });
            return perDoctor.get(key);
        };
        const doctors = doctorLinks.map(link => link.doctorId).filter(Boolean);
        doctors.filter(doctor => !options.filterId || String(doctor._id) === String(options.filterId)).forEach(doctor => ensureDoctor(doctor._id));
        metrics.doctors.forEach(({ _id, ...counts }) => Object.assign(ensureDoctor(_id), counts));
        let waitingPatients = 0;
        let consultingPatients = 0;
        for (const item of queueCounts) {
            if (item._id.status === "waiting") {
                waitingPatients += item.count;
                ensureDoctor(item._id.doctorId).waitingPatients = item.count;
            } else consultingPatients += item.count;
        }
        const { perDoctor: consultations, ...extras } = await dashboardExtras(scope, dates, options, metrics, "clinic");
        for (const item of consultations.values()) Object.assign(ensureDoctor(item.doctorId), item);
        const doctorStats = [...perDoctor.values()].map(item => ({ consultingPatients: 0,
            completedConsultations: 0, patientsServed: 0, ...item }));
        return res.json({
            ...extras,
            success: true, dashboard: "clinic",
            clinic: { id: clinic._id, name: clinic.clinicName },
            stats: { ...metrics.stats, activeDoctors: doctors.filter(doctor => !options.filterId ||
                String(doctor._id) === String(options.filterId)).length, waitingPatients, consultingPatients },
            doctors, doctorStats,
            doctorAvailability: doctors.map(doctor => ({ doctorId: doctor._id,
                status: options.filterId && String(doctor._id) !== String(options.filterId) ? "unknown" :
                    (consultations.get(String(doctor._id))?.consultingPatients > 0 ? "consulting" : "unknown"),
                basis: "storedQueueStatus", livePresence: false })),
            statusBreakdown: metrics.statusBreakdown, trend: metrics.trend,
            todayAppointments, upcomingAppointments
        });
    } catch {
        return res.status(500).json({ message: "Failed to load clinic dashboard" });
    }
};

export const doctorDashboard = async (req, res) => {
    try {
        const doctorId = authenticatedId(req, res, "doctor");
        if (!doctorId) return;
        const dates = dashboardDates();
        const options = queryOptions(req, res, "doctor", dates);
        if (!options) return;
        const scope = { doctorId };
        if (options.filterId) {
            if (!await DoctorClinic.findOne({ doctorId, clinicId: options.filterId }).select("_id").lean()) {
                return res.status(403).json({ message: "Clinic is not assigned to this doctor" });
            }
            scope.clinicId = options.filterId;
        }
        const dateFilter = { $gte: dates.start, $lt: dates.end };
        const doctor = await Doctor.findOne({ _id: doctorId, isActive: true })
            .select("name specialization schedule").lean();
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });

        const [clinicLinks, metrics, waitingPatients, consultingPatients, todayAppointments, upcomingAppointments] = await Promise.all([
            DoctorClinic.find({ doctorId }).select("clinicId")
                .populate({ path: "clinicId", match: { isActive: true }, select: "clinicName address" }).lean(),
            appointmentMetrics(scope, dates),
            QueueEntry.countDocuments({ ...scope, date: dateFilter, status: "waiting" }),
            QueueEntry.countDocuments({ ...scope, date: dateFilter, status: "consulting" }),
            appointmentDetails(Appointment.find({ ...scope, appointmentDate: dateFilter })),
            appointmentDetails(Appointment.find({ ...scope, appointmentDate: { $gte: dates.start }, status: "scheduled" }))
        ]);
        const { perDoctor: _perDoctor, ...extras } = await dashboardExtras(scope, dates, options, metrics, "doctor");
        return res.json({
            ...extras,
            success: true, dashboard: "doctor", doctor,
            clinics: clinicLinks.map(link => link.clinicId).filter(Boolean),
            stats: { ...metrics.stats, waitingPatients, consultingPatients },
            statusBreakdown: metrics.statusBreakdown, trend: metrics.trend,
            todayAppointments, upcomingAppointments
        });
    } catch {
        return res.status(500).json({ message: "Failed to load doctor dashboard" });
    }
};

export const patientDashboard = async (req, res) => {
    try {
        const userId = authenticatedId(req, res, "patient");
        if (!userId) return;
        const dates = dashboardDates();
        const { start, end } = dates;
        const options = queryOptions(req, res, "patient", dates);
        if (!options) return;
        const scope = { userId };
        if (options.filterId) {
            const association = { userId, clinicId: options.filterId };
            if (!await Appointment.findOne(association).select("_id").lean() &&
                !await QueueEntry.findOne(association).select("_id").lean()) {
                return res.status(403).json({ message: "Clinic is not associated with this patient" });
            }
            scope.clinicId = options.filterId;
        }
        const patient = await User.findById(userId).select("name email").lean();
        if (!patient) return res.status(404).json({ message: "Patient not found" });
        const queueFilter = { ...scope, date: { $gte: start, $lt: end }, status: { $in: ["waiting", "consulting"] } };
        const [totalAppointments, upcomingAppointmentsCount, completedAppointments,
            upcomingAppointments, queueEntries, activeQueues, appointmentHistory] = await Promise.all([
            Appointment.countDocuments(scope),
            Appointment.countDocuments({ ...scope, appointmentDate: { $gte: start }, status: "scheduled" }),
            Appointment.countDocuments({ ...scope, status: "completed" }),
            appointmentDetails(Appointment.find({ ...scope, appointmentDate: { $gte: start }, status: "scheduled" })),
            QueueEntry.find(queueFilter)
                .select("appointmentId clinicId doctorId date queueNumber status appointmentTime estimatedStartTime estimatedEndTime consultationStartedAt consultationEndedAt")
                .populate("clinicId", "clinicName").populate("doctorId", "name")
                .sort({ queueNumber: 1, _id: 1 }).limit(LIST_LIMIT).lean(),
            // Count independently so capping the list does not truncate this stat.
            QueueEntry.countDocuments(queueFilter),
            appointmentDetails(Appointment.find({ ...scope, $or: [
                { appointmentDate: { $lt: start } },
                { status: { $in: ["completed", "cancelled"] }, appointmentDate: { $lt: end } }
            ] }), true)
        ]);
        const metrics = await appointmentMetrics(scope, dates);
        const { perDoctor: _perDoctor, ...extras } = await dashboardExtras(scope, dates, options, metrics, "patient");
        const selectorOptions = await patientClinicOptions(userId);
        return res.json({
            ...extras,
            selectorClinics: selectorOptions.clinics,
            selectorCoverage: { limit: selectorOptions.limit, truncated: selectorOptions.truncated },
            success: true, dashboard: "patient", patient,
            stats: {
                totalAppointments, upcomingAppointments: upcomingAppointmentsCount,
                completedAppointments, activeQueues
            },
            upcomingAppointmentsList: upcomingAppointments,
            queueEntries, appointmentHistory
        });
    } catch {
        return res.status(500).json({ message: "Failed to load patient dashboard" });
    }
};
