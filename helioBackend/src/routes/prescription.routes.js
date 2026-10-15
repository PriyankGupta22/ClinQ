import express from "express";

import {
    createPrescription,
    getPrescriptionById,
    getPatientPrescriptions,
    getDoctorPrescriptions,
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
