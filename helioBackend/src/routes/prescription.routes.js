import express from "express";

import {
    createPrescription,
    getPrescriptionById,
    getPatientPrescriptions,
    getDoctorPrescriptions,
    getMyDoctorAppointments,
    getClinicStorePrescriptions,
    updateClinicStorePrescriptionStatus,
    updatePrescription,
    deletePrescription,
} from "../controllers/prescription.controllers.js";

import authMiddleWare from "../middleware/auth.middleware.js";

const router = express.Router();


// Create a prescription
router.post(
    "/",
    authMiddleWare,
    createPrescription
);

// Appointment picker used when the doctor creates a prescription.
router.get("/doctor/appointments", authMiddleWare, getMyDoctorAppointments);

// Clinic-admin accounts represent the clinic's store/pharmacy queue.
router.get("/store/queue", authMiddleWare, getClinicStorePrescriptions);
router.patch("/store/:prescriptionId/status", authMiddleWare, updateClinicStorePrescriptionStatus);


// Get a single prescription
router.get(
    "/:prescriptionId",
    authMiddleWare,
    getPrescriptionById
);


// Get all prescriptions of logged-in patient
router.get(
    "/patient/my-prescriptions",
    authMiddleWare,
    getPatientPrescriptions
);


// Get all prescriptions created by logged-in doctor
router.get(
    "/doctor/my-prescriptions",
    authMiddleWare,
    getDoctorPrescriptions
);


// Update prescription
router.put(
    "/:prescriptionId",
    authMiddleWare,
    updatePrescription
);


// Delete prescription
router.delete(
    "/:prescriptionId",
    authMiddleWare,
    deletePrescription
);


export default router;
