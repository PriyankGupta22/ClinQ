import express from "express"
import cors from "cors"
import connectDataBase from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js"
import clinicRoutes from "./routes/clinic.routes.js"
import appointmentRoutes from "./routes/appointments.routes.js"
import clinicAuthRoutes from "./routes/clinicAuth.routes.js"
import queueRoutes from "./routes/queue.routes.js"
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config()

const app = express();

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
const corsOrigin = (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
    }

    return callback(new Error("Origin is not allowed by CORS"));
};

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: corsOrigin,
        credentials: true
    }
});

app.set("io", io);

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("joinQueue", ({ clinicId, doctorId, date }) => {
        const room = `queue:${clinicId}:${doctorId}:${date}`;

        socket.join(room);

        console.log(`Socket ${socket.id} joined room: ${room}`);
    });
});

const PORT = process.env.PORT;

connectDataBase()

app.use(
    cors({
        origin: corsOrigin,
        credentials: true,
    })
)

app.use(express.json())

app.use("/api/auth", authRoutes)

app.use("/api/cliniAuthRoutes", clinicAuthRoutes)

app.use("/api/clinic", clinicRoutes)

app.use("/api/appointment", appointmentRoutes)

app.use("/api/queue", queueRoutes)

app.get("/", (req, res) => {
    res.send("Healio Backend Running");
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});