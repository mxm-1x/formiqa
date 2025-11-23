"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const ioInstance_1 = require("./socket/ioInstance");
const app_1 = __importDefault(require("./app"));
const socketHandlers_1 = require("./socket/socketHandlers");
const PORT = process.env.PORT || 3000;
const server = http_1.default.createServer(app_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
(0, ioInstance_1.initIO)(io);
(0, socketHandlers_1.registerSocketHandlers)(io);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map