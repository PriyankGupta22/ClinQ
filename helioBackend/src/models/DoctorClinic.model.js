import mongoose from "mongoose";

const doctorClinicSchema = new mongoose.Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },

        clinicId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Clinic",
            required: true
        }
    },
    {
        timestamps: true
    }
);

doctorClinicSchema.index(
    { doctorId: 1, clinicId: 1 },
    { unique: true }
);

const DoctorClinic = mongoose.model(
    "DoctorClinic",
    doctorClinicSchema
);

export default DoctorClinic;