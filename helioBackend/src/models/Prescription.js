import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        strength: {
            type: String,
            trim: true,
            default: ""
        },

        dosage: {
            type: String,
            required: true,
            trim: true
        },

        frequency: {
            type: String,
            required: true,
            trim: true
        },

        duration: {
            type: String,
            required: true,
            trim: true
        },

        timing: {
            type: String,
            trim: true,
            default: ""
        },

        instructions: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        _id: true
    }
);

const prescriptionSchema = new mongoose.Schema(
    {
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true,
            unique: true
        },

        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
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

        diagnosis: {
            type: String,
            trim: true,
            default: ""
        },

        medicines: {
            type: [medicineSchema],
            default: []
        },

        advice: {
            type: String,
            trim: true,
            default: ""
        },

        notes: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Prescription = mongoose.model(
    "Prescription",
    prescriptionSchema
);

export default Prescription;