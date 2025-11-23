"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitFeedback = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
// @ts-ignore - sentiment does not provide types
const sentiment_1 = __importDefault(require("sentiment"));
const ioInstance_1 = require("../socket/ioInstance");
const sentiment = new sentiment_1.default();
const submitFeedback = async (req, res) => {
    try {
        const { code } = req.params; // <-- correct way
        if (!code)
            return res.status(400).json({ error: "Invalid session code" });
        const { type, emoji, message } = req.body;
        if (!type) {
            return res.status(400).json({ error: "Feedback type is required" });
        }
        // 1. Find the session using code (not sessionId)
        const session = await prisma_1.default.session.findUnique({
            where: { code },
        });
        if (!session) {
            return res.status(404).json({ error: "Invalid session code" });
        }
        if (!session.isActive) {
            return res.status(400).json({ error: "Session is inactive" });
        }
        // 2. Calculate sentiment score
        let sentimentScore = null;
        if (message && typeof message === "string" && message.trim().length > 0) {
            const result = sentiment.analyze(message);
            sentimentScore = result.score;
        }
        // 3. Store feedback in DB
        const feedback = await prisma_1.default.feedback.create({
            data: {
                sessionId: session.id,
                type,
                emoji: emoji || null,
                message: message || null,
                sentimentScore,
            },
        });
        // 4. Emit new feedback to the presenter dashboard in real-time
        const io = (0, ioInstance_1.getIO)();
        const room = `session:${session.id}`;
        io.to(room).emit("new-feedback", {
            id: feedback.id,
            type: feedback.type,
            emoji: feedback.emoji,
            message: feedback.message,
            sentimentScore: feedback.sentimentScore,
            createdAt: feedback.createdAt,
        });
        // 5. Send REST response
        return res.status(201).json({
            success: true,
            feedbackId: feedback.id,
        });
    }
    catch (err) {
        console.error("submitFeedback error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.submitFeedback = submitFeedback;
//# sourceMappingURL=feedbackController.js.map