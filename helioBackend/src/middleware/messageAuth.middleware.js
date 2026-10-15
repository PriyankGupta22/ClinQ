import jwt from "jsonwebtoken";

export const messageAuthMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const user = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
    if (!["doctor", "clinicAdmin", "patient"].includes(user.role)) {
      return res.status(403).json({ message: "Messaging access required" });
    }
    req.messageUser = { id: user.id, role: user.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
