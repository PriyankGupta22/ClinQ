import { useEffect } from "react";
import socket from "../socket";

const Queue = () => {

    const clinicId = "6a96d0c268cba150859cd928";
    const doctorId = "6a96d464bb3fdf5081a5bedd";
    const date = "2026-08-31T18:30:00.000Z";

    useEffect(() => {

        console.log("Queue component loaded");

        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
        });

        socket.emit("joinQueue", {
            clinicId,
            doctorId,
            date
        });

        console.log("joinQueue emitted");

        socket.on("queueUpdated", (data) => {
            console.log("Queue updated:", data);
        });

        return () => {
            socket.off("connect");
            socket.off("queueUpdated");
        };

    }, []);

    return <div>Queue</div>;
};

export default Queue;