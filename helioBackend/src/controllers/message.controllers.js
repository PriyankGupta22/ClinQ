import DoctorClinic from "../models/DoctorClinic.model.js";
import Message from "../models/Message.model.js";
import Clinic from "../models/Clinic.model.js";
import User from "../models/User.models.js";

export const conversationRoom = (clinicId, doctorId) =>
  `messages:${clinicId}:${doctorId}`;

export const patientConversationRoom = (clinicId, patientId) =>
  `patient-messages:${clinicId}:${patientId}`;

const validateMessageContent = (content) => {
  const text = typeof content === "string" ? content.trim() : "";
  if (!text) throw Object.assign(new Error("Message content is required"), { status: 400 });
  if (text.length > 2000) throw Object.assign(new Error("Message must be 2000 characters or fewer"), { status: 400 });
  return text;
};

const getPatientClinic = async (clinicId) => Clinic.findOne({ _id: clinicId, isActive: true }).select("_id");

export const getPatientClinicMessages = async (req, res) => {
  try {
    if (req.messageUser.role !== "patient") return res.status(403).json({ message: "Patient access required" });
    const clinic = await getPatientClinic(req.params.clinicId);
    if (!clinic) return res.status(404).json({ message: "Clinic not found" });
    const messages = await Message.find({ clinicId: clinic._id, patientId: req.messageUser.id }).sort({ createdAt: 1 }).lean();
    return res.json({ messages });
  } catch {
    return res.status(500).json({ message: "Unable to load messages" });
  }
};

export const createPatientClinicMessage = async ({ user, clinicId, content }) => {
  if (user.role !== "patient") throw Object.assign(new Error("Patient access required"), { status: 403 });
  const text = typeof content === "string" ? content.trim() : "";
  if (!text) throw Object.assign(new Error("Message content is required"), { status: 400 });
  if (text.length > 2000) throw Object.assign(new Error("Message must be 2000 characters or fewer"), { status: 400 });
  const clinic = await getPatientClinic(clinicId);
  if (!clinic) throw Object.assign(new Error("Clinic not found"), { status: 404 });
  const message = await Message.create({ clinicId: clinic._id, patientId: user.id, senderId: user.id, senderRole: "patient", content: text });
  return { message, clinic };
};

export const postPatientClinicMessage = async (req, res) => {
  try {
    const { message } = await createPatientClinicMessage({ user: req.messageUser, clinicId: req.params.clinicId, content: req.body.content });
    const io = req.app.get("io");
    io?.to(patientConversationRoom(message.clinicId, message.patientId))
      .to(`messages:user:patient:${message.patientId}`)
      .to(`messages:user:clinicAdmin:${message.clinicId}`)
      .emit("patient-clinic-message:new", message);
    return res.status(201).json({ message });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || "Unable to send message" });
  }
};

export const getClinicPatientConversations = async (req, res) => {
  try {
    if (req.messageUser.role !== "clinicAdmin") return res.status(403).json({ message: "Clinic access required" });
    const messages = await Message.find({ clinicId: req.messageUser.id, patientId: { $ne: null } })
      .populate("patientId", "name email")
      .sort({ createdAt: -1 })
      .lean();
    const conversations = [];
    const seenPatients = new Set();
    for (const message of messages) {
      const patient = message.patientId;
      if (!patient || seenPatients.has(String(patient._id))) continue;
      seenPatients.add(String(patient._id));
      conversations.push({ patient, lastMessage: message });
    }
    return res.json({ conversations });
  } catch {
    return res.status(500).json({ message: "Unable to load patient conversations" });
  }
};

export const getClinicPatientMessages = async (req, res) => {
  try {
    if (req.messageUser.role !== "clinicAdmin") return res.status(403).json({ message: "Clinic access required" });
    const patient = await User.findOne({ _id: req.params.patientId, role: "patient" }).select("_id name email");
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    const messages = await Message.find({ clinicId: req.messageUser.id, patientId: patient._id }).sort({ createdAt: 1 }).lean();
    return res.json({ patient, messages });
  } catch {
    return res.status(500).json({ message: "Unable to load patient messages" });
  }
};

export const createClinicPatientMessage = async ({ user, patientId, content }) => {
  if (user.role !== "clinicAdmin") throw Object.assign(new Error("Clinic access required"), { status: 403 });
  const text = validateMessageContent(content);
  const patient = await User.findOne({ _id: patientId, role: "patient" }).select("_id name email");
  if (!patient) throw Object.assign(new Error("Patient not found"), { status: 404 });
  const hasConversation = await Message.exists({ clinicId: user.id, patientId: patient._id });
  if (!hasConversation) throw Object.assign(new Error("Patient conversation is not available"), { status: 403 });
  const message = await Message.create({ clinicId: user.id, patientId: patient._id, senderId: user.id, senderRole: "clinicAdmin", content: text });
  return { message, patient };
};

export const postClinicPatientMessage = async (req, res) => {
  try {
    const { message } = await createClinicPatientMessage({ user: req.messageUser, patientId: req.params.patientId, content: req.body.content });
    const io = req.app.get("io");
    io?.to(patientConversationRoom(message.clinicId, message.patientId))
      .to(`messages:user:patient:${message.patientId}`)
      .to(`messages:user:clinicAdmin:${message.clinicId}`)
      .emit("patient-clinic-message:new", message);
    return res.status(201).json({ message });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || "Unable to send message" });
  }
};

export const getConversationLink = async (user, counterpartId) => {
  const query = user.role === "doctor"
    ? { doctorId: user.id, clinicId: counterpartId }
    : { clinicId: user.id, doctorId: counterpartId };
  return DoctorClinic.findOne(query);
};

export const createMessage = async ({ user, counterpartId, content }) => {
  const text = typeof content === "string" ? content.trim() : "";
  if (!text) throw Object.assign(new Error("Message content is required"), { status: 400 });
  if (text.length > 2000) throw Object.assign(new Error("Message must be 2000 characters or fewer"), { status: 400 });

  const link = await getConversationLink(user, counterpartId);
  if (!link) throw Object.assign(new Error("You can only message an associated clinic or doctor"), { status: 403 });

  const message = await Message.create({
    clinicId: link.clinicId,
    doctorId: link.doctorId,
    senderId: user.id,
    senderRole: user.role,
    content: text,
  });
  return { message, link };
};

export const getConversations = async (req, res) => {
  try {
    const isDoctor = req.messageUser.role === "doctor";
    const links = await DoctorClinic.find(isDoctor ? { doctorId: req.messageUser.id } : { clinicId: req.messageUser.id })
      .populate(isDoctor ? "clinicId" : "doctorId", isDoctor ? "clinicName address isActive" : "name specialization isActive")
      .sort({ updatedAt: -1 });

    const conversations = await Promise.all(links.filter((link) => {
      const counterpart = isDoctor ? link.clinicId : link.doctorId;
      return counterpart && counterpart.isActive !== false;
    }).map(async (link) => {
      const lastMessage = await Message.findOne({ clinicId: link.clinicId, doctorId: link.doctorId }).sort({ createdAt: -1 }).lean();
      const counterpart = isDoctor ? link.clinicId : link.doctorId;
      return { counterpart, lastMessage };
    }));
    return res.json({ conversations });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load conversations" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const link = await getConversationLink(req.messageUser, req.params.counterpartId);
    if (!link) return res.status(403).json({ message: "Conversation is not available" });
    const messages = await Message.find({ clinicId: link.clinicId, doctorId: link.doctorId }).sort({ createdAt: 1 }).lean();
    return res.json({ messages });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load messages" });
  }
};

export const postMessage = async (req, res) => {
  try {
    const { message } = await createMessage({ user: req.messageUser, counterpartId: req.params.counterpartId, content: req.body.content });
    const io = req.app.get("io");
    io?.to(conversationRoom(message.clinicId, message.doctorId))
      .to(`messages:user:doctor:${message.doctorId}`)
      .to(`messages:user:clinicAdmin:${message.clinicId}`)
      .emit("message:new", message);
    return res.status(201).json({ message });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || "Unable to send message" });
  }
};
