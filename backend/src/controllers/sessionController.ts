// src/controllers/sessionController.ts
import { Request, Response } from "express";
import prisma from "../db/prisma";
import { generateSessionCode } from "../utils/generateCode";
import { AuthRequest } from "../middleware/authMiddleware";

export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { title, visibility } = req.body;

    let code = generateSessionCode();
    let exists = await prisma.session.findUnique({ where: { code } });
    let retries = 0;
    while (exists && retries < 5) {
      code = generateSessionCode();
      exists = await prisma.session.findUnique({ where: { code } });
      retries++;
    }

    if (exists) {
      return res.status(500).json({ error: "Failed to generate unique session code" });
    }

    const session = await prisma.session.create({
      data: {
        userId: req.user.id,
        title: title || "Untitled Session",
        visibility: visibility || "public",
        code,
      },
    });

    return res.status(201).json({ session });
  } catch (err: any) {
    console.error("createSession error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getSessionByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    if (!code) return res.status(400).json({ error: "Missing session code" });

    const session = await prisma.session.findUnique({
      where: { code },
      select: { id: true, code: true, title: true, isActive: true, createdAt: true, userId: true },
    });

    if (!session) return res.status(404).json({ error: "Session not found" });

    return res.json({ session });
  } catch (err: any) {
    console.error("getSessionByCode error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/sessions  -> list sessions for authenticated user
export const listSessions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const page = parseInt((req.query.page as string) || "1");
    const pageSize = parseInt((req.query.pageSize as string) || "10");

    const sessions = await prisma.session.findMany({
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

    const total = await prisma.session.count({
      where: { userId: req.user.id },
    });

    return res.json({
      sessions,
      meta: { page, pageSize, total },
    });
  } catch (err) {
    console.error("listSessions error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const endSession = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid session id" });

    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    const updated = await prisma.session.update({
      where: { id },
      data: { isActive: false, endedAt: new Date() },
    });

    return res.json({ session: updated });
  } catch (err: any) {
    console.error("endSession error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteSession = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid session id" });

    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    // Delete all responses associated with questions in this session
    await prisma.response.deleteMany({
      where: {
        question: {
          sessionId: id
        }
      }
    });

    // Delete all questions associated with this session
    await prisma.question.deleteMany({
      where: { sessionId: id }
    });

    // Delete all feedback associated with this session
    await prisma.feedback.deleteMany({
      where: { sessionId: id }
    });

    // Finally delete the session
    await prisma.session.delete({
      where: { id }
    });

    return res.json({ message: "Session deleted successfully" });
  } catch (err: any) {
    console.error("deleteSession error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/sessions/:id/analytics
 * Returns:
 *  - totalFeedback
 *  - avgSentiment
 *  - countsByType (emoji/text)
 *  - topEmojis (map)
 *  - feedbackPerMinute (last N minutes)
 */



