import express from "express"
import { addQueueEntry, completeConsultation, getMyDoctorQueue, getQueue, markQueueEntryEmergency, startConsultation, updateQueueEntryStatus } from "../controllers/queue.controllers.js"
import authMiddleware from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/addQueue", authMiddleware, addQueueEntry)

router.get("/getQueue/:clinicId/:doctorId/:date", authMiddleware, getQueue)
router.get("/doctor/my-queue/:date", authMiddleware, getMyDoctorQueue)
router.patch("/appointment/:appointmentId/emergency", authMiddleware, markQueueEntryEmergency)

router.patch("/queue/:queueEntryId/start", authMiddleware, startConsultation);

router.patch("/queue/:queueEntryId/complete", authMiddleware, completeConsultation);
router.patch("/queue/:queueEntryId/status", authMiddleware, updateQueueEntryStatus);

export default router
