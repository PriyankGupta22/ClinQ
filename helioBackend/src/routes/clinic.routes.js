import express from "express"
import clinicAuthMiddleware from "../middleware/clinicAuth.middleware.js"
import { addDoctorController, getClinicDoctors, removeDoctorFromClinic, updateDoctorSchedule, getPublicClinics, getPublicClinicDoctors, getClinicAppointments, getClinicDashboardStats } from "../controllers/clinic.controllers.js"

const router = express.Router()

router.get("/public", getPublicClinics)

router.get("/public/:clinicId/doctors", getPublicClinicDoctors)

router.get("/appointments", clinicAuthMiddleware, getClinicAppointments)

router.get("/dashboard-stats", clinicAuthMiddleware, getClinicDashboardStats)

router.post("/doctor", clinicAuthMiddleware, addDoctorController)

router.get("/doctor", clinicAuthMiddleware, getClinicDoctors)

router.delete("/doctor/:doctorId", clinicAuthMiddleware, removeDoctorFromClinic)

router.put("/doctor/:doctorId/schedule", clinicAuthMiddleware, updateDoctorSchedule)

export default router