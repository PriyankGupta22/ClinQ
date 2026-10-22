import Doctor from "../models/Doctor.model.js";
import Queue from "../models/Queue.model.js";
import QueueEntry from "../models/QueueEntity.model.js";

const MINUTE = 60 * 1000;
const inactiveStatuses = new Set(["completed", "cancelled", "no_show", "skipped"]);

const byEmergencyThenSchedule = (left, right) => {
  if (left.priority !== right.priority) return left.priority === "emergency" ? -1 : 1;
  if (left.priority === "emergency") {
    return new Date(left.priorityChangedAt || left.createdAt) - new Date(right.priorityChangedAt || right.createdAt);
  }
  const scheduledDifference = new Date(left.appointmentTime) - new Date(right.appointmentTime);
  return scheduledDifference || (new Date(left.createdAt) - new Date(right.createdAt));
};

/**
 * Rebuilds the actionable part of a queue from its current state. Historical
 * entries retain their timestamps and positions; the active consultation stays
 * in place, emergencies lead the waiting patients, then normal patients keep
 * scheduled/FIFO order.
 */
const updateQueue = async (doctorId, clinicId, date, now = new Date()) => {
  if (!doctorId || !clinicId || !date) throw new Error("Incomplete queue fields");

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new Error("No such doctor");

  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const nextDay = new Date(day);
  nextDay.setDate(nextDay.getDate() + 1);
  const queue = await Queue.findOne({ doctorId, clinicId, date: { $gte: day, $lt: nextDay } });
  if (!queue) throw new Error("No such queue");

  const entries = await QueueEntry.find({ _id: { $in: queue.entries } });
  const active = entries.find((entry) => entry.status === "consulting");
  const waiting = entries.filter((entry) => entry.status === "waiting").sort(byEmergencyThenSchedule);
  const historical = entries.filter((entry) => inactiveStatuses.has(entry.status));
  const durationMinutes = Number(doctor.schedule?.appointmentDuration || 10);

  // Do not allow an overdue active consultation to make the next estimate end
  // in the past. It occupies the doctor until at least "now".
  let nextAvailable = new Date(now);
  if (active) {
    const startedAt = new Date(active.consultationStartedAt || active.appointmentTime);
    const expectedEnd = new Date(startedAt.getTime() + durationMinutes * MINUTE);
    nextAvailable = expectedEnd > now ? expectedEnd : new Date(now);
  }

  // Keep completed/no-show/skipped positions untouched, and place the pending
  // section immediately after them. This prevents old rows from being rewritten.
  const highestHistoricalPosition = historical.reduce((highest, entry) => Math.max(highest, entry.queueNumber || 0), 0);
  let nextPosition = Math.max(highestHistoricalPosition, active?.queueNumber || 0) + 1;

  const writes = [];
  for (const entry of waiting) {
    const scheduled = new Date(entry.appointmentTime);
    // Emergencies are eligible as soon as the doctor is free; normals never
    // move earlier than their scheduled appointment time.
    const start = entry.priority === "emergency" ? new Date(nextAvailable) : new Date(Math.max(nextAvailable, scheduled));
    entry.queueNumber = nextPosition++;
    entry.estimatedStartTime = start;
    entry.estimatedEndTime = new Date(start.getTime() + durationMinutes * MINUTE);
    entry.estimatedWaitingTime = Math.max(0, Math.ceil((start.getTime() - now.getTime()) / MINUTE));
    writes.push(entry.save());
    nextAvailable = entry.estimatedEndTime;
  }
  await Promise.all(writes);
  return queue;
};

const startNextWaitingPatient = async (doctorId, clinicId, date, now = new Date()) => {
  const rangeStart = new Date(date);
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeEnd.getDate() + 1);
  const active = await QueueEntry.exists({
    doctorId, clinicId, date: { $gte: rangeStart, $lt: rangeEnd }, status: "consulting",
  });
  if (active) return null;

  const candidates = await QueueEntry.find({
    doctorId,
    clinicId,
    date: { $gte: rangeStart, $lt: rangeEnd },
    status: "waiting",
  }).sort({ queueNumber: 1, createdAt: 1, _id: 1 });

  const next = candidates.find((entry) => entry.priority === "emergency" || new Date(entry.appointmentTime) <= now);
  if (!next) return null;

  const claimed = await QueueEntry.findOneAndUpdate(
    { _id: next._id, status: "waiting" },
    { $set: { status: "consulting", consultationStartedAt: now } },
    { new: true }
  );
  return claimed;
};

export { inactiveStatuses };
export { startNextWaitingPatient };
export default updateQueue;
