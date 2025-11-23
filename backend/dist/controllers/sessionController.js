"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = exports.endSession = exports.listSessions = exports.getSessionByCode = exports.createSession = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const generateCode_1 = require("../utils/generateCode");
const date_fns_1 = require("date-fns");
const createSession = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const { title, visibility } = req.body;
        let code = (0, generateCode_1.generateSessionCode)();
        let exists = await prisma_1.default.session.findUnique({ where: { code } });
        while (exists) {
            code = (0, generateCode_1.generateSessionCode)();
            exists = await prisma_1.default.session.findUnique({ where: { code } });
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
/**
 * GET /api/sessions/:id/analytics
 * Returns:
 *  - totalFeedback
 *  - avgSentiment
 *  - countsByType (emoji/text)
 *  - topEmojis (map)
 *  - feedbackPerMinute (last N minutes)
 */
const getAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ error: "Invalid session id" });
        const minutesWindow = Number(req.query.minutes) || 30;
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const session = await prisma_1.default.session.findUnique({ where: { id } });
        if (!session)
            return res.status(404).json({ error: "Session not found" });
        if (session.userId !== req.user.id)
            return res.status(403).json({ error: "Forbidden" });
        const totalFeedback = await prisma_1.default.feedback.count({ where: { sessionId: id } });
        // Average sentiment
        const avgAgg = await prisma_1.default.feedback.aggregate({
            where: { sessionId: id, sentimentScore: { not: null } },
            _avg: { sentimentScore: true },
        });
        const avgSentiment = avgAgg._avg.sentimentScore ?? 0;
        // Counts by feedback type
        const countsByType = await prisma_1.default.$queryRaw `SELECT "type", COUNT(*) as cnt
      FROM "Feedback"
      WHERE "sessionId" = ${id}
      GROUP BY "type"`;
        // Top emojis
        const topEmojis = await prisma_1.default.$queryRaw `SELECT emoji, COUNT(*) as cnt
      FROM "Feedback"
      WHERE "sessionId" = ${id}
        AND emoji IS NOT NULL
      GROUP BY emoji
      ORDER BY cnt DESC
      LIMIT 10`;
        // Timeseries (past N minutes)
        const since = (0, date_fns_1.subMinutes)(new Date(), minutesWindow);
        const rawTimes = await prisma_1.default.$queryRaw `SELECT date_trunc('minute', "createdAt") AS period,
              COUNT(*) as cnt
        FROM "Feedback"
        WHERE "sessionId" = ${id}
          AND "createdAt" >= ${since}
        GROUP BY period
        ORDER BY period ASC`;
        // Build consistent minute-by-minute timeseries
        const timeseries = [];
        for (let i = 0; i <= minutesWindow; i++) {
            const minuteDate = new Date(since.getTime() + i * 60000);
            // Key format: YYYY-MM-DDTHH:mm
            const key = minuteDate.toISOString().slice(0, 16);
            // Find match — convert period to ISO safely
            const found = rawTimes.find((r) => {
                const p = r.period instanceof Date ? r.period.toISOString() : String(r.period);
                return p.slice(0, 16) === key;
            });
            timeseries.push({
                minute: key,
                count: found ? Number(found.cnt) : 0,
            });
        }
        return res.json({
            totalFeedback,
            avgSentiment,
            countsByType,
            topEmojis,
            timeseries,
        });
    }
    catch (err) {
        console.error("getAnalytics error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.getAnalytics = getAnalytics;
//# sourceMappingURL=sessionController.js.map