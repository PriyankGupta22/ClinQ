import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Clinic from "../src/models/Clinic.model.js";
import Doctor from "../src/models/Doctor.model.js";
import DoctorClinic from "../src/models/DoctorClinic.model.js";
import User from "../src/models/User.models.js";
import Appointment from "../src/models/Appointment.model.js";
import Queue from "../src/models/Queue.model.js";
import QueueEntry from "../src/models/QueueEntity.model.js";
import updateQueue from "../src/utils/queue.utils.js";

if (process.env.ALLOW_QUEUE_SEED !== "true") {
  throw new Error("Set ALLOW_QUEUE_SEED=true to run the development queue seed.");
}

const atTime = (day, hour, minute) => {
  const value = new Date(day);
  value.setHours(hour, minute, 0, 0);
  return value;
};

const upsert = (Model, filter, update) => Model.findOneAndUpdate(filter, { $set: update }, { new: true, upsert: true, setDefaultsOnInsert: true });

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const seedDay = process.env.QUEUE_SEED_DATE ? new Date(`${process.env.QUEUE_SEED_DATE}T00:00:00`) : new Date();
  seedDay.setHours(0, 0, 0, 0);
  if (Number.isNaN(seedDay.getTime())) throw new Error("QUEUE_SEED_DATE must be YYYY-MM-DD");

  const password = await bcrypt.hash("QueueDemo123!", 10);
  const clinic = await upsert(Clinic, { email: "queue-demo-clinic@clinqlocal.test" }, {
    clinicName: "ClinQ Queue Demo Clinic", email: "queue-demo-clinic@clinqlocal.test", password,
    phone: "9000000001", description: "Development-only queue seed", isActive: true,
    role: "clinicAdmin", address: { street: "1 Demo Lane", city: "Demo City", state: "Demo State", pincode: "110001" }
  });
  const doctor = await upsert(Doctor, { email: "queue-demo-doctor@clinqlocal.test" }, {
    name: "Queue Demo Doctor", email: "queue-demo-doctor@clinqlocal.test", password,
    phone: "9000000002", specialization: "General Medicine", isActive: true, role: "doctor",
    schedule: { day: "Monday", startTime: "09:00", endTime: "18:00", appointmentDuration: 10 }
  });
  await DoctorClinic.findOneAndUpdate({ doctorId: doctor._id, clinicId: clinic._id }, { $setOnInsert: { doctorId: doctor._id, clinicId: clinic._id } }, { upsert: true });

  const names = ["Aarav Mehta", "Diya Sharma", "Kabir Singh", "Meera Iyer", "Rohan Das", "Sara Khan", "Vikram Rao", "Nisha Patel", "Ishaan Gupta"];
  const users = [];
  for (let index = 0; index < names.length; index += 1) {
    users.push(await upsert(User, { email: `queue-demo-patient-${index + 1}@clinqlocal.test` }, { name: names[index], email: `queue-demo-patient-${index + 1}@clinqlocal.test`, password, role: "patient" }));
  }

  const appointmentTimes = [
    atTime(seedDay, 9, 0), atTime(seedDay, 9, 10), atTime(seedDay, 9, 20), atTime(seedDay, 9, 30), atTime(seedDay, 9, 40),
    atTime(seedDay, 9, 5), atTime(seedDay, 8, 30), atTime(seedDay, 8, 40), atTime(seedDay, 8, 50)
  ];
  const statuses = ["scheduled", "scheduled", "scheduled", "scheduled", "scheduled", "scheduled", "completed", "scheduled", "scheduled"];
  const appointments = [];
  for (let index = 0; index < users.length; index += 1) {
    appointments.push(await upsert(Appointment, { userId: users[index]._id, doctorId: doctor._id, clinicId: clinic._id, appointmentDate: appointmentTimes[index] }, {
      userId: users[index]._id, doctorId: doctor._id, clinicId: clinic._id, appointmentDate: appointmentTimes[index], status: statuses[index], reason: "Development queue scenario"
    }));
  }

  const queue = await Queue.findOneAndUpdate({ clinicId: clinic._id, doctorId: doctor._id, date: seedDay }, { $setOnInsert: { clinicId: clinic._id, doctorId: doctor._id, date: seedDay, entries: [] } }, { new: true, upsert: true });
  const entryStates = ["consulting", "waiting", "waiting", "waiting", "waiting", "waiting", "completed", "skipped", "no_show"];
  const priorities = ["normal", "normal", "normal", "normal", "normal", "emergency", "normal", "normal", "normal"];
  const entryIds = [];
  for (let index = 0; index < appointments.length; index += 1) {
    const entry = await QueueEntry.findOneAndUpdate({ appointmentId: appointments[index]._id }, { $set: {
      appointmentId: appointments[index]._id, userId: users[index]._id, doctorId: doctor._id, clinicId: clinic._id, date: seedDay,
      queueNumber: index + 1, appointmentTime: appointmentTimes[index], status: entryStates[index], priority: priorities[index],
      priorityChangedAt: priorities[index] === "emergency" ? atTime(seedDay, 9, 5) : undefined,
      consultationStartedAt: index === 0 ? new Date(Date.now() - 15 * 60 * 1000) : undefined,
      consultationEndedAt: index === 6 ? atTime(seedDay, 8, 40) : undefined,
    } }, { new: true, upsert: true, setDefaultsOnInsert: true });
    entryIds.push(entry._id);
  }
  queue.entries = entryIds;
  await queue.save();
  await updateQueue(doctor._id, clinic._id, seedDay);
  console.log(`Queue demo seeded for ${seedDay.toISOString().slice(0, 10)}. Clinic: ${clinic._id}, doctor: ${doctor._id}`);
} finally {
  await mongoose.disconnect();
}
