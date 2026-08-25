import express from "express"
import { registerUser } from "../controllers/auth.controllers"
import { loginUser } from "../controllers/auth.controllers"

const router = express.Router()

router.post("/register", registerUser)

router.get("login", loginUser)

export default router