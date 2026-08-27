import express from "express"
import cors from "cors"
import connectDataBase from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js"

dotenv.config()

const app = express();

const PORT = process.env.PORT;

connectDataBase()

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
)

app.use(express.json())

app.use("/api/auth", authRoutes)

app.get("/", (req, res) => {
    res.send("Healio Backend Running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});