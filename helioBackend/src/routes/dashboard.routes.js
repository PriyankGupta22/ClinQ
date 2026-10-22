
import express from "express";
import jwt from "jsonwebtoken";

import {
    clinicDashboard,
    doctorDashboard,
    patientDashboard
} from "../controllers/dashboard.controllers.js";

const router = express.Router();

const authorize = (requiredRole) => {
    return (req, res, next) => {
        try {
            const header = req.headers.authorization;

            if (!header?.startsWith("Bearer ")) {
                return res.status(401).json({
                    message: "Authentication required"
                });
            }

            const token = header.slice(7);
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            if (
                !decoded ||
                typeof decoded !== "object" ||
                Array.isArray(decoded) ||
                typeof decoded.id !== "string" ||
                !/^[a-fA-F0-9]{24}$/.test(decoded.id)
            ) {
                return res.status(401).json({
                    message: "Invalid or expired token"
                });
            }

            if (
                decoded.role !== requiredRole
            ) {
                return res.status(403).json({
                    message: "Access denied"
                });
            }

            req.dashboardUser = {
                id: decoded.id,
                role: decoded.role
            };

            next();

        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }
    };
};

router.get(
    "/clinic",
    authorize("clinicAdmin"),
    clinicDashboard
);

router.get(
    "/doctor",
    authorize("doctor"),
    doctorDashboard
);

router.get(
    "/patient",
    authorize("patient"),
    patientDashboard
);

export default router;
