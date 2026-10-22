import Appointment from "../models/Appointment.model.js";
import Clinic from "../models/Clinic.model.js";
import Doctor from "../models/Doctor.model.js";
import DoctorClinic from "../models/DoctorClinic.model.js";
import QueueEntry from "../models/QueueEntity.model.js";
import Queue from "../models/Queue.model.js";
import updateQueue, { startNextWaitingPatient } from "../utils/queue.utils.js";

const getDayStart = (value) => {
    const dateText = String(value);
    const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
    const day = dateParts
        ? new Date(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3]))
        : new Date(value);
    if (Number.isNaN(day.getTime())) return null;
    day.setHours(0, 0, 0, 0);
    return day;
};

const getRoomDate = (value) => {
    const date = new Date(value);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
};

const getDayRange = (value) => {
    const start = getDayStart(value);
    if (!start) return null;
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
};

const loadQueue = (clinicId, doctorId, date) => {
    const range = getDayRange(date);
    return Queue.findOne({ clinicId, doctorId, date: { $gte: range.start, $lt: range.end } })
    .populate({
        path: "entries",
        options: { sort: { queueNumber: 1 } },
        populate: [
            { path: "userId", select: "name email" },
            { path: "doctorId", select: "name specialization schedule" }
        ]
    });
};

const broadcastQueue = async (req, clinicId, doctorId, date, message) => {
    const queue = await loadQueue(clinicId, doctorId, date);
    const room = `queue:${clinicId}:${doctorId}:${getRoomDate(date)}`;
    req.app.get("io").to(room).emit("queueUpdated", { message, queue });
    return queue;
};

export const addQueueEntry = async (req, res) => {
    try {
        const appointment = req.appointment || await Appointment.findById(req.body.appointmentId);
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        const { userId, doctorId, clinicId } = appointment;
        const date = getDayStart(appointment.appointmentDate);
        const dateRange = getDayRange(date);
        if (!dateRange) return res.status(400).json({ message: "Valid appointment date is required" });

        // Idempotency prevents retrying a booking request from adding the same
        // patient to a queue twice.
        const existingEntry = await QueueEntry.findOne({ appointmentId: appointment._id });
        if (existingEntry) {
            const queue = await loadQueue(clinicId, doctorId, date);
            return res.status(200).json({ message: "Patient is already in the queue", queue, queueEntry: existingEntry });
        }

        const emergency = req.body.priority === "emergency" || req.body.isEmergency === true;
        let appointmentTime = new Date(appointment.appointmentDate);
        // The current booking form supplies a date only. Assign a stable slot
        // from the doctor's configured start time so queue order is still by
        // scheduled time, rather than the order requests reach the server.
        if (appointmentTime.getHours() === 0 && appointmentTime.getMinutes() === 0) {
            const doctor = await Doctor.findById(doctorId);
            const [hours, minutes] = String(doctor?.schedule?.startTime || "09:00").split(":").map(Number);
            const normalBookingsBeforeThis = await QueueEntry.countDocuments({
                clinicId, doctorId, date: { $gte: dateRange.start, $lt: dateRange.end }, priority: "normal"
            });
            appointmentTime = new Date(date);
            appointmentTime.setHours(hours, minutes + normalBookingsBeforeThis * Number(doctor?.schedule?.appointmentDuration || 10), 0, 0);
        }
        let queueEntry;
        try {
            queueEntry = await QueueEntry.create({
                appointmentId: appointment._id,
                userId,
                doctorId,
                clinicId,
                date,
                // A temporary value is replaced by updateQueue after the entry is
                // atomically attached to its clinic/doctor/day queue.
                queueNumber: 0,
                priority: emergency ? "emergency" : "normal",
                priorityChangedAt: emergency ? new Date() : undefined,
                appointmentTime,
                status: "waiting"
            });
        } catch (error) {
            // The unique appointment index turns concurrent retries into an
            // idempotent result instead of creating duplicate queue positions.
            if (error?.code !== 11000) throw error;
            queueEntry = await QueueEntry.findOne({ appointmentId: appointment._id });
        }

        let queue = await Queue.findOneAndUpdate(
            { clinicId, doctorId, date: { $gte: dateRange.start, $lt: dateRange.end } },
            { $setOnInsert: { clinicId, doctorId, date, entries: [] }, $addToSet: { entries: queueEntry._id } },
            { new: true, upsert: true }
        );

        await updateQueue(doctorId, clinicId, date);
        queue = await broadcastQueue(req, clinicId, doctorId, date, "Patient added to queue");

        return res.status(200).json({
            message: "Patient added to queue successfully",
            queue,
            queueEntry
        });

    } catch (error) {
        console.error("Error in adding queue entry:", error);

        return res.status(500).json({
            message: "Error in adding queue entry",
            error: error.message
        });
    }
};



export const getQueue = async (req, res) => {
    try {
        const { clinicId, doctorId, date: requestedDate } = req.params;

        if (!clinicId || !doctorId || !requestedDate) {
            return res.status(400).json({
                message: "Clinic, doctor and date are required"
            });
        }

        if (req.user.role === "doctor") {
            const doctorClinic = await DoctorClinic.findOne({ doctorId: req.user.id, clinicId });
            if (String(req.user.id) !== String(doctorId) || !doctorClinic) {
                return res.status(403).json({ message: "You are not assigned to this clinic queue" });
            }
        }

        const queue = await loadQueue(clinicId, doctorId, requestedDate);

        if (!queue) {
            return res.status(200).json({
                message: "Queue fetched successfully",
                queue: { entries: [] }
            });
        }

        return res.status(200).json({
            message: "Queue fetched successfully",
            queue
        });

    } catch (error) {
        console.log("Error in getting queue:", error);

        return res.status(500).json({
            message: "Error in getting queue"
        });
    }
};

// Doctor dashboard queue: combines the doctor's queue entries across clinics
// for one day, so the UI can open the correct patient prescription directly.
export const getMyDoctorQueue = async (req, res) => {
    try {
        if (req.user.role !== "doctor") {
            return res.status(403).json({ message: "Doctor access required" });
        }

        const range = getDayRange(req.params.date);
        if (!range) return res.status(400).json({ message: "Valid date is required" });

        const { clinicId } = req.query;
        if (clinicId) {
            const doctorClinic = await DoctorClinic.findOne({ doctorId: req.user.id, clinicId });
            if (!doctorClinic) {
                return res.status(403).json({ message: "You are not assigned to this clinic" });
            }
        }

        const entries = await QueueEntry.find({
            doctorId: req.user.id,
            date: { $gte: range.start, $lt: range.end },
            ...(clinicId ? { clinicId } : {}),
        })
            .populate("userId", "name email")
            .populate("clinicId", "clinicName")
            .populate("appointmentId", "appointmentDate reason")
            .sort({ appointmentTime: 1, queueNumber: 1 });

        return res.json({ success: true, entries });
    } catch (error) {
        console.error("Get doctor queue error:", error);
        return res.status(500).json({ message: "Failed to load doctor queue" });
    }
};

export const markQueueEntryEmergency = async (req, res) => {
    try {
        const queueEntry = await QueueEntry.findOne({ appointmentId: req.params.appointmentId });
        if (!queueEntry) return res.status(404).json({ message: "Queue entry not found" });

        const isPatient = req.user.role === "patient" && String(queueEntry.userId) === String(req.user.id);
        const isClinicStaff = req.user.role === "clinicAdmin" && String(queueEntry.clinicId) === String(req.user.id);
        if (!isPatient && !isClinicStaff) return res.status(403).json({ message: "You cannot change this queue priority" });
        if (queueEntry.status !== "waiting") return res.status(400).json({ message: "Only waiting appointments can be marked emergency" });

        queueEntry.priority = "emergency";
        queueEntry.priorityChangedAt = new Date();
        await queueEntry.save();
        await updateQueue(queueEntry.doctorId, queueEntry.clinicId, queueEntry.date);
        const queue = await broadcastQueue(req, queueEntry.clinicId, queueEntry.doctorId, queueEntry.date, "Emergency priority updated");
        return res.json({ success: true, message: "Appointment marked as emergency", queue });
    } catch (error) {
        console.error("Emergency priority error:", error);
        return res.status(500).json({ message: "Failed to update emergency priority" });
    }
};


export const startConsultation = async (req, res) => {
    try {
        const { queueEntryId } = req.params;

        const queueEntry = await QueueEntry.findById(queueEntryId);

        if (!queueEntry) {
            return res.status(404).json({
                message: "Queue entry not found"
            });
        }
        if (req.user.role !== "doctor" || String(queueEntry.doctorId) !== String(req.user.id)) {
            return res.status(403).json({ message: "Only the assigned doctor can start this consultation" });
        }

        if (queueEntry.status !== "waiting") {
            return res.status(400).json({
                message: "Patient is not waiting"
            });
        }

        const activeConsultation = await QueueEntry.findOne({
            doctorId: queueEntry.doctorId,
            clinicId: queueEntry.clinicId,
            date: queueEntry.date,
            status: "consulting"
        });
        if (activeConsultation) return res.status(409).json({ message: "Another patient is already consulting" });

        const nextWaiting = await QueueEntry.findOne({
            doctorId: queueEntry.doctorId,
            clinicId: queueEntry.clinicId,
            date: queueEntry.date,
            status: "waiting"
        }).sort({ queueNumber: 1 });
        if (!nextWaiting || String(nextWaiting._id) !== String(queueEntry._id)) {
            return res.status(409).json({ message: "Start the next eligible patient in the queue" });
        }

        // Start consultation
        queueEntry.status = "consulting";
        queueEntry.consultationStartedAt = new Date();

        await queueEntry.save();

        // Recalculate complete queue
        await updateQueue(queueEntry.doctorId, queueEntry.clinicId, queueEntry.date);
        const updatedQueue = await broadcastQueue(req, queueEntry.clinicId, queueEntry.doctorId, queueEntry.date, "Consultation started");

        return res.status(200).json({
            message: "Consultation started",
            queue: updatedQueue
        });

    } catch (error) {
        console.log("Error in starting consultation:", error);

        return res.status(500).json({
            message: "Error in starting consultation"
        });
    }
};


export const completeConsultation = async (req, res) => {
    try {
        const { queueEntryId } = req.params;

        const queueEntry = await QueueEntry.findById(queueEntryId);

        if (!queueEntry) {
            return res.status(404).json({
                message: "Queue entry not found"
            });
        }
        if (req.user.role !== "doctor" || String(queueEntry.doctorId) !== String(req.user.id)) {
            return res.status(403).json({ message: "Only the assigned doctor can complete this consultation" });
        }

        if (queueEntry.status !== "consulting") {
            return res.status(400).json({
                message: "Patient is not currently consulting"
            });
        }

        const endedAt = new Date();
        const claimed = await QueueEntry.findOneAndUpdate(
            { _id: queueEntry._id, status: "consulting" },
            { $set: { status: "completed", consultationEndedAt: endedAt } },
            { new: true }
        );
        if (!claimed) return res.status(409).json({ message: "Consultation was already completed" });
        await Appointment.findByIdAndUpdate(queueEntry.appointmentId, { status: "completed" });
        await startNextWaitingPatient(queueEntry.doctorId, queueEntry.clinicId, queueEntry.date, endedAt);
        await updateQueue(queueEntry.doctorId, queueEntry.clinicId, queueEntry.date, endedAt);

        const updatedQueue = await broadcastQueue(req, queueEntry.clinicId, queueEntry.doctorId, queueEntry.date, "Consultation completed");

        return res.status(200).json({
            message: "Consultation completed",
            queue: updatedQueue,
            queueEntry
        });

    } catch (error) {
        console.log("Error in completing consultation:", error);

        return res.status(500).json({
            message: "Error in completing consultation"
        });
    }
};

export const updateQueueEntryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["no_show", "skipped", "cancelled"].includes(status)) {
            return res.status(400).json({ message: "Unsupported queue status" });
        }
        const entry = await QueueEntry.findById(req.params.queueEntryId);
        if (!entry) return res.status(404).json({ message: "Queue entry not found" });
        const doctorAllowed = req.user.role === "doctor" && String(entry.doctorId) === String(req.user.id);
        const clinicAllowed = req.user.role === "clinicAdmin" && String(entry.clinicId) === String(req.user.id);
        if (!doctorAllowed && !clinicAllowed) return res.status(403).json({ message: "Not authorized to update this queue entry" });
        if (entry.status !== "waiting") return res.status(400).json({ message: "Only waiting patients can be updated this way" });

        entry.status = status;
        await entry.save();
        if (status === "cancelled") await Appointment.findByIdAndUpdate(entry.appointmentId, { status: "cancelled" });
        await startNextWaitingPatient(entry.doctorId, entry.clinicId, entry.date);
        await updateQueue(entry.doctorId, entry.clinicId, entry.date);
        const queue = await broadcastQueue(req, entry.clinicId, entry.doctorId, entry.date, `Queue entry marked ${status}`);
        return res.json({ success: true, queue, queueEntry: entry });
    } catch (error) {
        console.error("Update queue status error:", error);
        return res.status(500).json({ message: "Failed to update queue status" });
    }
};
