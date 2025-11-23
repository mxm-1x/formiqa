import http from "http";
import { Server } from "socket.io";
import { ServerToClientEvents, ClientToServerEvents } from "./socket/types";
import { initIO } from "./socket/ioInstance";

import app from "./app";
import { registerSocketHandlers } from "./socket/socketHandlers";
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

initIO(io);
registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
