import express from "express"
import { clinicLogin, clinicRegister, clinicRefreshAccessToken, clinicMe } from "../controllers/clinicAuth.controllers.js"
import clinicAuthMiddleware from "../middleware/clinicAuth.middleware.js"

const router = express.Router()

router.post("/register", clinicRegister)

router.post("/login", clinicLogin)

router.post("/refresh", clinicRefreshAccessToken)

router.get("/clinicMe", clinicAuthMiddleware, clinicMe)

export default router