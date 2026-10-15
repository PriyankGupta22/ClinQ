import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        // Kept optional so clinic-created legacy doctor records remain valid.
        // A doctor must set it before using the doctor login.
        password: {
            type: String,
            select: false
        },

        role: {
            type: String,
            default: "doctor"
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        specialization: {
            type: String,
            required: true,
            trim: true
        },
        // A doctor can register before any clinic assigns availability.
        // `default: undefined` is important: it prevents Mongoose from creating
        // an empty nested object and applying the child required validators.
        schedule: {
            type: new mongoose.Schema({
                day: {
                    type: String,
                    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    required: true
                },
                startTime: { type: String, required: true },
                endTime: { type: String, required: true },
                appointmentDuration: { type: Number, default: 10 }
            }, { _id: false }),
            default: undefined
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
