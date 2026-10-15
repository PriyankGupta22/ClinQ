import express from "express"
import clinicAuthMiddleware from "../middleware/clinicAuth.middleware.js"
import { searchClinics, addDoctorController, getClinicDoctors, removeDoctorFromClinic, updateDoctorSchedule, getPublicClinics, getPublicClinicDoctors, getClinicAppointments, getClinicDashboardStats, searchRegisteredDoctors } from "../controllers/clinic.controllers.js"

const router = express.Router()

router.get("/search", searchClinics)

router.get("/public", getPublicClinics)

router.get("/public/:clinicId/doctors", getPublicClinicDoctors)

router.get("/appointments", clinicAuthMiddleware, getClinicAppointments)

router.get("/dashboard-stats", clinicAuthMiddleware, getClinicDashboardStats)

router.get("/doctor/search", clinicAuthMiddleware, searchRegisteredDoctors)

router.post("/doctor", clinicAuthMiddleware, addDoctorController)

router.get("/doctor", clinicAuthMiddleware, getClinicDoctors)

router.delete("/doctor/:doctorId", clinicAuthMiddleware, removeDoctorFromClinic)

router.put("/doctor/:doctorId/schedule", clinicAuthMiddleware, updateDoctorSchedule)

export default router
