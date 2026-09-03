import express from "express"
import authMiddleWare from "../middleware/auth.middleware.js"
import { createAppointment, getMyAppointments, getDoctorAppointments, updateAppointmentStatus } from "../controllers/appointment.controllers.js"
import { addQueueEntry } from "../controllers/queue.controllers.js"

const router = express.Router()

router.post("/appointment", authMiddleWare, [createAppointment, addQueueEntry])

router.get("/my-appointments", authMiddleWare, getMyAppointments)

router.get("/doctor-appointments", authMiddleWare, getDoctorAppointments)

router.put("/status", authMiddleWare, updateAppointmentStatus)

export default router