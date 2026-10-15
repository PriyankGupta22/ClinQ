import Clinic from "../models/Clinic.model.js";
import Doctor from "../models/Doctor.model.js";
import Queue from "../models/Queue.model.js";
import QueueEntry from "../models/QueueEntity.model.js";

const updateQueue = async (doctorId, clinicId, date) => {
    try {
        if (!doctorId || !clinicId || !date) {
            throw new Error("Incomplete fields");
        }

        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            throw new Error("No such doctor");
        }

        const clinic = await Clinic.findById(clinicId);

        if (!clinic) {
            throw new Error("No such clinic");
        }

        const queue = await Queue.findOne({
            doctorId,
            clinicId,
            date
        });

        if (!queue) {
            throw new Error("No such queue");
        }

        const entries = await QueueEntry.find({ _id: { $in: queue.entries } }).sort({ queueNumber: 1 });
        const active = entries.find((entry) => entry.status === "consulting");
        let nextStart = active?.consultationStartedAt || active?.appointmentTime || new Date();
        if (active) nextStart = new Date(nextStart.getTime() + Number(doctor.schedule.appointmentDuration || 10) * 60000);
        for (const entry of entries) {
            if (entry.status !== "waiting") continue;
            const scheduled = new Date(entry.appointmentTime);
            const start = nextStart > scheduled ? nextStart : scheduled;
            entry.estimatedStartTime = start;
            entry.estimatedEndTime = new Date(start.getTime() + Number(doctor.schedule.appointmentDuration || 10) * 60000);
            await entry.save();
            nextStart = entry.estimatedEndTime;
        }

        return queue;
    } catch (error) {
        console.log(
            "Something wrong in updateQueue function in queue.util.js",
            error
        );

        throw error;
    }
};

export default updateQueue;
