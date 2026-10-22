import mongoose from "mongoose";

const queueSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    delayApplied: {
      type: Number,
      default: 0
    },
    
    entries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QueueEntry",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Queue creation uses an upsert; this index guarantees concurrent bookings
// cannot create two queues for the same clinic, doctor and day.
queueSchema.index({ clinicId: 1, doctorId: 1, date: 1 }, { unique: true });

const Queue = mongoose.model("Queue", queueSchema);

export default Queue;
