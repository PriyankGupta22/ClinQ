import express from "express";
import { getConversations, getMessages, postMessage, getPatientClinicMessages, postPatientClinicMessage, getClinicPatientConversations, getClinicPatientMessages, postClinicPatientMessage } from "../controllers/message.controllers.js";
import { messageAuthMiddleware } from "../middleware/messageAuth.middleware.js";

const router = express.Router();
router.use(messageAuthMiddleware);
router.get("/conversations", getConversations);
router.get("/patient-clinic/:clinicId", getPatientClinicMessages);
router.post("/patient-clinic/:clinicId", postPatientClinicMessage);
router.get("/clinic-patients", getClinicPatientConversations);
router.get("/clinic-patients/:patientId", getClinicPatientMessages);
router.post("/clinic-patients/:patientId", postClinicPatientMessage);
router.get("/:counterpartId", getMessages);
router.post("/:counterpartId", postMessage);

export default router;
