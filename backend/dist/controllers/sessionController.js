"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSession = exports.endSession = exports.listSessions = exports.getSessionByCode = exports.createSession = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const generateCode_1 = require("../utils/generateCode");
const createSession = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const { title, visibility } = req.body;
        let code = (0, generateCode_1.generateSessionCode)();
        let exists = await prisma_1.default.session.findUnique({ where: { code } });
        let retries = 0;
        while (exists && retries < 5) {
            code = (0, generateCode_1.generateSessionCode)();
            exists = await prisma_1.default.session.findUnique({ where: { code } });
            retries++;
        }
        if (exists) {
            return res.status(500).json({ error: "Failed to generate unique session code" });
        }
        const session = await prisma_1.default.session.create({
            data: {
                userId: req.user.id,
                title: title || "Untitled Session",
                visibility: visibility || "public",
                code,
            },
        });
        return res.status(201).json({ session });
    }
    catch (err) {
        console.error("createSession error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.createSession = createSession;
const getSessionByCode = async (req, res) => {
    try {
        const { code } = req.params;
        if (!code)
            return res.status(400).json({ error: "Missing session code" });
        const session = await prisma_1.default.session.findUnique({
            where: { code },
            select: { id: true, code: true, title: true, isActive: true, createdAt: true, userId: true },
        });
        if (!session)
            return res.status(404).json({ error: "Session not found" });
        return res.json({ session });
    }
    catch (err) {
        console.error("getSessionByCode error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.getSessionByCode = getSessionByCode;
// GET /api/sessions  -> list sessions for authenticated user
const listSessions = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const page = parseInt(req.query.page || "1");
        const pageSize = parseInt(req.query.pageSize || "10");
        const sessions = await prisma_1.default.session.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                title: true,
                code: true,
                isActive: true,
                createdAt: true,
                endedAt: true,
            },
        });
        const total = await prisma_1.default.session.count({
            where: { userId: req.user.id },
        });
        return res.json({
            sessions,
            meta: { page, pageSize, total },
        });
    }
    catch (err) {
        console.error("listSessions error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.listSessions = listSessions;
const endSession = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ error: "Invalid session id" });
        const session = await prisma_1.default.session.findUnique({ where: { id } });
        if (!session)
            return res.status(404).json({ error: "Session not found" });
        if (session.userId !== req.user.id)
            return res.status(403).json({ error: "Forbidden" });
        const updated = await prisma_1.default.session.update({
            where: { id },
            data: { isActive: false, endedAt: new Date() },
        });
        return res.json({ session: updated });
    }
    catch (err) {
        console.error("endSession error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.endSession = endSession;
const deleteSession = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ error: "Invalid session id" });
        const session = await prisma_1.default.session.findUnique({ where: { id } });
        if (!session)
            return res.status(404).json({ error: "Session not found" });
        if (session.userId !== req.user.id)
            return res.status(403).json({ error: "Forbidden" });
        // Delete all responses associated with questions in this session
        await prisma_1.default.response.deleteMany({
            where: {
                question: {
                    sessionId: id
                }
            }
        });
        // Delete all questions associated with this session
        await prisma_1.default.question.deleteMany({
            where: { sessionId: id }
        });
        // Delete all feedback associated with this session
        await prisma_1.default.feedback.deleteMany({
            where: { sessionId: id }
        });
        // Finally delete the session
        await prisma_1.default.session.delete({
            where: { id }
        });
        return res.json({ message: "Session deleted successfully" });
    }
    catch (err) {
        console.error("deleteSession error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.deleteSession = deleteSession;
/**
 * GET /api/sessions/:id/analytics
 * Returns:
 *  - totalFeedback
 *  - avgSentiment
 *  - countsByType (emoji/text)
 *  - topEmojis (map)
 *  - feedbackPerMinute (last N minutes)
 */
//# sourceMappingURL=sessionController.js.map