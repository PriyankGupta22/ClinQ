import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderRole: { type: String, enum: ["doctor", "clinicAdmin", "patient"], required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

messageSchema.index({ clinicId: 1, doctorId: 1, createdAt: 1 });
messageSchema.index({ clinicId: 1, patientId: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
