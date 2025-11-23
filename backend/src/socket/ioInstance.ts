import { Server } from "socket.io";

let io: Server | null = null;

export const initIO = (ioInstance: Server) => {
    io = ioInstance;
};

export const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
};
