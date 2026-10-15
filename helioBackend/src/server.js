import express from "express"
import cors from "cors"
import connectDataBase from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js"
import clinicRoutes from "./routes/clinic.routes.js"
import appointmentRoutes from "./routes/appointments.routes.js"
import clinicAuthRoutes from "./routes/clinicAuth.routes.js"
import queueRoutes from "./routes/queue.routes.js"
import prescriptionsRoutes from "./routes/prescription.routes.js"
import doctorAuthRoutes from "./routes/doctorAuth.routes.js"
import messageRoutes from "./routes/message.routes.js"
import jwt from "jsonwebtoken";
import DoctorClinic from "./models/DoctorClinic.model.js";
import { conversationRoom, createClinicPatientMessage, createMessage, createPatientClinicMessage, patientConversationRoom } from "./controllers/message.controllers.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config()

const app = express();

const allowedOrigins = "http://localhost:5173";
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

io.use((socket, next) => {
    if (!socket.handshake.auth?.token) return next();
    try {
        const user = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
        if (!["doctor", "clinicAdmin", "patient"].includes(user.role)) return next(new Error("Unauthorized"));
        socket.user = { id: user.id, role: user.role };
        next();
    } catch {
        next(new Error("Unauthorized"));
    }
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    if (socket.user) socket.join(`messages:user:${socket.user.role}:${socket.user.id}`);

    socket.on("joinQueue", ({ clinicId, doctorId, date }) => {
        const room = `queue:${clinicId}:${doctorId}:${date}`;

        socket.join(room);

        console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on("joinConversation", async ({ counterpartId }, done = () => {}) => {
        try {
            if (!socket.user) throw new Error("Authentication required");
            const link = await (socket.user.role === "doctor"
                ? DoctorClinic.findOne({ doctorId: socket.user.id, clinicId: counterpartId })
                : DoctorClinic.findOne({ clinicId: socket.user.id, doctorId: counterpartId }));
            if (!link) throw new Error("Conversation is not available");
            socket.join(conversationRoom(link.clinicId, link.doctorId));
            done({ ok: true });
        } catch (error) { done({ ok: false, message: error.message }); }
    });

    socket.on("sendMessage", async ({ counterpartId, content }, done = () => {}) => {
        try {
            if (!socket.user) throw new Error("Authentication required");
            const { message } = await createMessage({ user: socket.user, counterpartId, content });
            io.to(conversationRoom(message.clinicId, message.doctorId))
                .to(`messages:user:doctor:${message.doctorId}`)
                .to(`messages:user:clinicAdmin:${message.clinicId}`)
                .emit("message:new", message);
            done({ ok: true, message });
        } catch (error) { done({ ok: false, message: error.message }); }
    });

    socket.on("joinPatientClinicConversation", ({ clinicId }, done = () => {}) => {
        try {
            if (!socket.user || socket.user.role !== "patient") throw new Error("Patient access required");
            socket.join(patientConversationRoom(clinicId, socket.user.id));
            done({ ok: true });
        } catch (error) { done({ ok: false, message: error.message }); }
    });

    socket.on("sendPatientClinicMessage", async ({ clinicId, content }, done = () => {}) => {
        try {
            if (!socket.user) throw new Error("Authentication required");
            const { message } = await createPatientClinicMessage({ user: socket.user, clinicId, content });
            io.to(patientConversationRoom(message.clinicId, message.patientId))
                .to(`messages:user:patient:${message.patientId}`)
                .to(`messages:user:clinicAdmin:${message.clinicId}`)
                .emit("patient-clinic-message:new", message);
            done({ ok: true, message });
        } catch (error) { done({ ok: false, message: error.message }); }
    });

    socket.on("sendClinicPatientMessage", async ({ patientId, content }, done = () => {}) => {
        try {
            if (!socket.user) throw new Error("Authentication required");
            const { message } = await createClinicPatientMessage({ user: socket.user, patientId, content });
            io.to(patientConversationRoom(message.clinicId, message.patientId))
                .to(`messages:user:patient:${message.patientId}`)
                .to(`messages:user:clinicAdmin:${message.clinicId}`)
                .emit("patient-clinic-message:new", message);
            done({ ok: true, message });
        } catch (error) { done({ ok: false, message: error.message }); }
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

app.use("/api/prescription", prescriptionsRoutes)
app.use("/api/doctor-auth", doctorAuthRoutes)
app.use("/api/messages", messageRoutes)

app.get("/", (req, res) => {
    res.send("Healio Backend Running");
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
