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

    // FIFO tie-breaker for emergency entries. It is set when an appointment
    // enters or is promoted into the emergency queue.
    priorityChangedAt: {
      type: Date,
    },

    appointmentTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["waiting", "consulting", "completed", "cancelled", "no_show", "skipped"],
      default: "waiting",
    },

    estimatedStartTime: {
      type: Date,
    },

    estimatedEndTime: {
      type: Date,
    },

    estimatedWaitingTime: {
      type: Number,
      default: 0,
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

// One appointment can only have one queue entry, even if a booking request is
// retried by the client.
queueEntrySchema.index({ appointmentId: 1 }, { unique: true });
queueEntrySchema.index({ clinicId: 1, doctorId: 1, date: 1, queueNumber: 1 });

const QueueEntry = mongoose.model("QueueEntry", queueEntrySchema);

export default QueueEntry;
