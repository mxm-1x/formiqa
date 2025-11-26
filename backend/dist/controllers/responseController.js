"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listResponses = exports.submitResponse = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
// @ts-ignore
const sentiment_1 = __importDefault(require("sentiment"));
const ioInstance_1 = require("../socket/ioInstance");
const sentiment = new sentiment_1.default();
const submitResponse = async (req, res) => {
    try {
        const { qid } = req.params;
        if (!qid)
            return res.status(400).json({ error: "Question ID required" });
        const { selectedOpt, textAnswer } = req.body;
        // find question
        const question = await prisma_1.default.question.findUnique({ where: { id: qid } });
        if (!question)
            return res.status(404).json({ error: "Question not found" });
        if (!question.isActive)
            return res.status(400).json({ error: "Question closed" });
        // validate payload
        if (question.type === "mcq") {
            if (!selectedOpt)
                return res.status(400).json({ error: "selectedOpt required for MCQ" });
            // Check if selectedOpt is an index (number string like "0", "1", "2")
            const optIndex = parseInt(selectedOpt);
            if (!isNaN(optIndex)) {
                // It's an index - validate it's within bounds
                if (optIndex < 0 || optIndex >= question.options.length) {
                    return res.status(400).json({ error: "Invalid option index" });
                }
            }
            else {
                // It's option text - validate it exists in options
                if (!question.options.includes(selectedOpt)) {
                    return res.status(400).json({ error: "Invalid option" });
                }
            }
        }
        else { // text
            if (!textAnswer || !textAnswer.trim())
                return res.status(400).json({ error: "textAnswer required" });
        }
        // sentiment for text
        let sentimentScore = null;
        if (textAnswer) {
            sentimentScore = sentiment.analyze(textAnswer).score;
        }
        const resp = await prisma_1.default.response.create({
            data: {
                questionId: qid,
                selectedOpt: selectedOpt || null,
                textAnswer: textAnswer || null,
                sentimentScore,
            },
        });
        // Log activity to database
        try {
            await prisma_1.default.activityLog.create({
                data: {
                    sessionId: question.sessionId,
                    activityType: "response",
                    metadata: {
                        questionId: qid,
                        responseId: resp.id,
                        type: question.type,
                        selectedOpt: resp.selectedOpt,
                    },
                },
            });
        }
        catch (e) {
            console.error("Failed to log activity:", e);
        }
        // emit real-time to presenters in session room
        try {
            const io = (0, ioInstance_1.getIO)();
            io.to(`session:${question.sessionId}`).emit("new-response", {
                id: resp.id,
                questionId: qid,
                selectedOpt: resp.selectedOpt,
                textAnswer: resp.textAnswer,
                sentimentScore: resp.sentimentScore,
                createdAt: resp.createdAt,
            });
        }
        catch (e) {
            console.warn("Socket emit failed (new-response)", e);
        }
        return res.status(201).json({ success: true, responseId: resp.id });
    }
    catch (err) {
        console.error("submitResponse error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.submitResponse = submitResponse;
const listResponses = async (req, res) => {
    try {
        const { qid } = req.params;
        if (!qid)
            return res.status(400).json({ error: "Question ID required" });
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const question = await prisma_1.default.question.findUnique({ where: { id: qid } });
        if (!question)
            return res.status(404).json({ error: "Question not found" });
        const session = await prisma_1.default.session.findUnique({ where: { id: question.sessionId } });
        if (!session)
            return res.status(404).json({ error: "Session not found" });
        if (session.userId !== req.user.id)
            return res.status(403).json({ error: "Forbidden" });
        const responses = await prisma_1.default.response.findMany({
            where: { questionId: qid },
            orderBy: { createdAt: "desc" },
        });
        // For MCQ, build aggregated counts
        let aggregates = null;
        if (question.type === "mcq") {
            try {
                // simple aggregation by selectedOpt
                const rows = await prisma_1.default.$queryRaw `SELECT "selectedOpt", COUNT(*) AS cnt FROM "Response" WHERE "questionId" = ${qid} GROUP BY "selectedOpt"`;
                aggregates = rows;
            }
            catch (e) {
                console.error("Error aggregating MCQ responses:", e);
                // Return empty aggregates on error
                aggregates = [];
            }
        }
        return res.json({ question, responses, aggregates });
    }
    catch (err) {
        console.error("listResponses error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.listResponses = listResponses;
//# sourceMappingURL=responseController.js.map