import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

export const authenticateSocket = (token) => {
  if (socket.auth?.token === token) return socket;
  socket.auth = { token };
  if (socket.connected) socket.disconnect().connect();
  return socket;
};

export default socket;
