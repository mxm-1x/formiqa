"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initIO = void 0;
let io = null;
const initIO = (ioInstance) => {
    io = ioInstance;
};
exports.initIO = initIO;
const getIO = () => {
    if (!io)
        throw new Error("Socket.io not initialized!");
    return io;
};
exports.getIO = getIO;
//# sourceMappingURL=ioInstance.js.map