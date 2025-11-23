// src/controllers/sessionFeedbackController.ts
import { Request, Response } from "express";
import  prisma  from "../db/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

export const getSessionFeedbacks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid session id" });

    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Number(req.query.pageSize) || 50);

    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where: { sessionId: id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.feedback.count({ where: { sessionId: id } }),
    ]);

    return res.json({ feedbacks, meta: { page, pageSize, total } });
  } catch (err: any) {
    console.error("getSessionFeedbacks error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
