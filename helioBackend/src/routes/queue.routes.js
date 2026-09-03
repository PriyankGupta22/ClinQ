import express from "express"
import { addQueueEntry, completeConsultation, getQueue, startConsultation } from "../controllers/queue.controllers.js"
import authMiddleware from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/addQueue", authMiddleware, addQueueEntry)

router.get("/getQueue/:clinicId/:doctorId/:date", authMiddleware, getQueue)

router.patch("/queue/:queueEntryId/start", authMiddleware, startConsultation);

router.patch("/queue/:queueEntryId/complete", authMiddleware, completeConsultation);

export default router