import express from "express"
import connectDataBase from "./config/db.js";
import dotenv from "dotenv";

dotenv.config()

const app = express();

const PORT = process.env.PORT;

connectDataBase()

app.get("/", (req, res) => {
    res.send("Healio Backend Running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});