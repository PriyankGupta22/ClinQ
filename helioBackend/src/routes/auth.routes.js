import express from "express"
import { registerUser, loginUser, getMe, refreshAccessToken } from "../controllers/auth.controllers.js"
import authMiddleWare from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/register", registerUser)

router.post("/login", loginUser)

router.get("/me", authMiddleWare, getMe)

router.post("/refresh", refreshAccessToken)

export default router