"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
// @ts-ignore - sentiment has no types
const sentiment_1 = __importDefault(require("sentiment"));
const sentiment = new sentiment_1.default();
// --------------------------
// MAIN SOCKET HANDLER
// --------------------------
const registerSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        // --------------------------
        // JOIN SESSION
        // --------------------------
        socket.on("join-session", async ({ sessionCode }) => {
            try {
                if (!sessionCode) {
                    socket.emit("error", { message: "Session code is required" });
                    return;
                }
                const session = await prisma_1.default.session.findUnique({
                    where: { code: sessionCode },
                });
                if (!session) {
                    socket.emit("error", { message: "Invalid session code" });
                    return;
                }
                if (!session.isActive) {
                    socket.emit("error", { message: "Session is no longer active" });
                    return;
                }
                const room = `session:${session.id}`;
                socket.join(room);
                // Attach session to socket
                socket.sessionId = session.id;
                socket.sessionCode = sessionCode;
                // presence count
                const count = (await io.in(room).fetchSockets()).length;
                io.to(room).emit("presence-update", { onlineCount: count });
                socket.emit("session-joined", {
                    session: {
                        id: session.id,
                        code: session.code,
                        title: session.title,
                    },
                });
                console.log(`Socket ${socket.id} joined ${room}`);
            }
            catch (error) {
                console.error("join-session error:", error);
                socket.emit("error", { message: "Failed to join session" });
            }
        });
        // --------------------------
        // SUBMIT FEEDBACK
        // --------------------------
        socket.on("submit-feedback", async (data) => {
            try {
                const sessionId = socket.sessionId;
                if (!sessionId) {
                    socket.emit("error", { message: "Join a session first" });
                    return;
                }
                const { type, emoji, message } = data;
                if (!type) {
                    socket.emit("error", { message: "Feedback type is required" });
                    return;
                }
                // Sentiment analysis
                let sentimentScore = null;
                if (message && message.length > 0) {
                    const result = sentiment.analyze(message);
                    sentimentScore = result.score;
                }
                const feedback = await prisma_1.default.feedback.create({
                    data: {
                        sessionId,
                        type,
                        emoji: emoji || null,
                        message: message || null,
                        sentimentScore,
                    },
                });
                const room = `session:${sessionId}`;
                const payload = {
                    id: feedback.id,
                    type: feedback.type,
                    emoji: feedback.emoji,
                    message: feedback.message,
                    sentimentScore: feedback.sentimentScore,
                    createdAt: feedback.createdAt,
                };
                // Broadcast to all presenter dashboards
                io.to(room).emit("new-feedback", payload);
                // Acknowledge submission back to user
                socket.emit("feedback-submitted", {
                    success: true,
                    feedbackId: feedback.id,
                });
                console.log(`Feedback submitted to session ${sessionId}`);
            }
            catch (error) {
                console.error("submit-feedback error:", error);
                socket.emit("error", { message: "Failed to submit feedback" });
            }
        });
        // --------------------------
        // DISCONNECT => update presence
        // --------------------------
        socket.on("disconnect", async () => {
            const sessionId = socket.sessionId;
            if (sessionId) {
                const room = `session:${sessionId}`;
                const sockets = await io.in(room).fetchSockets();
                io.to(room).emit("presence-update", {
                    onlineCount: sockets.length,
                });
            }
            console.log("Client disconnected:", socket.id);
        });
    });
};
exports.registerSocketHandlers = registerSocketHandlers;
//# sourceMappingURL=socketHandlers.js.map