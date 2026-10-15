import express from "express";

import {
  registerDoctor,
  loginDoctor,
  getDoctorMe,
  getDoctorClinics,
  refreshDoctorAccessToken,
} from "../controllers/doctorAuth.controllers.js";

import {
  doctorAuthMiddleware,
} from "../middleware/doctorAuth.middleware.js";

const router = express.Router();

router.post("/register", registerDoctor);

router.post("/login", loginDoctor);

router.post("/refresh", refreshDoctorAccessToken);

router.get("/me", doctorAuthMiddleware, getDoctorMe);

router.get("/clinics", doctorAuthMiddleware, getDoctorClinics);

export default router;
