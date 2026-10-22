import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    dosage: {
      type: String,
      required: true,
      trim: true,
    },

    frequency: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: String,
      required: true,
      trim: true,
    },

    instructions: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },

    diagnosis: {
      type: String,
      trim: true,
    },

    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],

    medicines: {
      type: [medicineSchema],
      default: [],
    },

    tests: [
      {
        type: String,
        trim: true,
      },
    ],

    advice: {
      type: String,
      trim: true,
    },

    followUpDate: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
    },

    feverChart: {
      type: Map,
      of: Number,
      default: {},
    },

    // A prescription is made available to the clinic's medicine store as soon
    // as the doctor issues it.  Keeping this state on the prescription makes
    // the same record the source of truth for doctor, patient and store views.
    storeStatus: {
      type: String,
      enum: ["pending", "dispensed", "unavailable"],
      default: "pending",
    },

    sentToStoreAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Prescriptions = mongoose.model(
  "Prescriptions",
  prescriptionSchema
);

export default Prescriptions;
