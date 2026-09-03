import jwt from "jsonwebtoken";

const clinicAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "No authorization header"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.role !== "clinicAdmin") {
            return res.status(403).json({
                message: "Clinic access required"
            });
        }

        req.clinic = decoded;

        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

export default clinicAuthMiddleware;