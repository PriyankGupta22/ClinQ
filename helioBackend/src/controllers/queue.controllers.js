import Appointment from "../models/Appointment.model.js";
import Clinic from "../models/Clinic.model.js";
import Doctor from "../models/Doctor.model.js";
import DoctorClinic from "../models/DoctorClinic.model.js";
import QueueEntry from "../models/QueueEntity.model.js";
import Queue from "../models/Queue.model.js";
import updateQueue from "../utils/queue.utils.js";

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
        const userId = req.user.id;
        const { doctorId, clinicId } = req.body;

        if (!clinicId || !doctorId) {
            return res.status(400).json({
                message: "Clinic and doctor are required"
            });
        }

        const appointment = await Appointment.findOne({
            userId,
            doctorId,
            clinicId
        });

        if (!appointment) {
            return res.status(400).json({
                message: "Appointment not made"
            });
        }

        const clinic = await Clinic.findById(clinicId);

        if (!clinic) {
            return res.status(400).json({
                message: "No clinic like this exists"
            });
        }

        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(400).json({
                message: "No doctor like this exists"
            });
        }

        const doctorClinic = await DoctorClinic.findOne({
            clinicId,
            doctorId
        });

        if (!doctorClinic) {
            return res.status(400).json({
                message: "This doctor is not in this clinic"
            });
        }

        const date = getDayStart(appointment.appointmentDate);
        const dateRange = getDayRange(date);

        if (!dateRange) {
            return res.status(400).json({ message: "Valid appointment date is required" });
        }

        const lastEntry = await QueueEntry
            .findOne({
                doctorId,
                clinicId,
                date: { $gte: dateRange.start, $lt: dateRange.end }
            })
            .sort({ queueNumber: -1 });

        const queueNumber = lastEntry
            ? lastEntry.queueNumber + 1
            : 1;

        const [hours, minutes] = doctor.schedule.startTime
            .split(":")
            .map(Number);

            console.log("appointmentDate:", appointment.appointmentDate);
console.log("doctor schedule:", doctor.schedule);
console.log("startTime:", doctor.schedule.startTime);

        const appointmentTime = new Date(appointment.appointmentDate);

        appointmentTime.setHours(hours, minutes, 0, 0);

        appointmentTime.setMinutes(
            appointmentTime.getMinutes() +
            Number(doctor.schedule.appointmentDuration) *
            (queueNumber - 1)
        );

        const queueEntry = await QueueEntry.create({
            appointmentId: appointment._id,
            userId,
            doctorId,
            clinicId,
            date,
            queueNumber,
            priority: "normal",
            appointmentTime,
            status: "waiting"
        });

        let queue = await Queue.findOne({
            clinicId,
            doctorId,
            date: { $gte: dateRange.start, $lt: dateRange.end }
        });

        if (!queue) {
            queue = await Queue.create({
                clinicId,
                doctorId,
                date,
                entries: [queueEntry._id]
            });
        } else {
            queue.entries.push(queueEntry._id);
            await queue.save();
        }

        await updateQueue(doctorId, clinicId, date);
        queue = await broadcastQueue(req, clinicId, doctorId, date, "Patient added to queue");

        return res.status(200).json({
            message: "Patient added to queue successfully",
            queue,
            queueEntry
        });

    } catch (error) {
        console.log("Error in adding queue entry:", error);

        return res.status(500).json({
            message: "Error in adding queue entry"
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

        queueEntry.status = "completed";
        queueEntry.consultationEndedAt = new Date();

        await queueEntry.save();

        await updateQueue(queueEntry.doctorId, queueEntry.clinicId, queueEntry.date);

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
