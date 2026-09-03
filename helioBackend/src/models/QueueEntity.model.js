import mongoose from "mongoose";

const queueEntrySchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },

    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    queueNumber: {
      type: Number,
      required: true,
    },

    priority: {
      type: String,
      enum: ["normal", "emergency"],
      default: "normal",
    },

    appointmentTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["waiting", "consulting", "completed", "no_show", "skipped"],
      default: "waiting",
    },

    estimatedStartTime: {
      type: Date,
    },

    estimatedWaitingTime: {
      type: Number,
    },

    travelTime: {
      type: Number,
    },

    canReachOnTime: {
      type: Boolean,
    },

    checkedInAt: {
      type: Date,
    },

    consultationStartedAt: {
      type: Date,
    },

    consultationEndedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const QueueEntry = mongoose.model("QueueEntry", queueEntrySchema);

export default QueueEntry;