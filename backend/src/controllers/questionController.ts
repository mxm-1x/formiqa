import { Request, Response } from "express";
import prisma from "../db/prisma";
import { AuthRequest } from "../middleware/authMiddleware";
import { getIO } from "../socket/ioInstance";

type CreateQuestionBody = {
  type: "text" | "mcq";
  title: string;
  options?: string[]; // required for mcq
};

export const createQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { id: sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ error: "Session ID required" });
    console.log("createQuestion called with sessionId:", sessionId, "user:", req.user?.id);
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { type, title, options } = req.body as CreateQuestionBody;
    console.log("Request body:", { type, title, options });
    if (!type || !title) return res.status(400).json({ error: "type and title required" });

    // verify session ownership
    const session = await prisma.session.findUnique({ where: { id: sessionId! } });
    console.log("Session found:", session ? "yes" : "no");
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    if (type === "mcq" && (!options || options.length < 2)) {
      return res.status(400).json({ error: "MCQ requires at least 2 options" });
    }

    console.log("About to create question:", { sessionId, type, title, options: options || [] });
    const question = await prisma.question.create({
      data: {
        sessionId,
        type,
        title,
        options: options || [],
      },
    });
    console.log("Question created successfully:", question.id);

    // broadcast to session room
    try {
      const io = getIO();
      io.to(`session:${sessionId}`).emit("new-question", {
        id: question.id,
        sessionId,
        type: question.type,
        title: question.title,
        options: question.options,
        createdAt: question.createdAt,
      });
    } catch (e) {
      console.warn("Socket emit failed (new-question)", e);
    }

    return res.status(201).json({ question });
  } catch (err: any) {
    console.error("createQuestion error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const listQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { id: sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ error: "Session ID required" });
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const session = await prisma.session.findUnique({ where: { id: sessionId! } });
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    const questions = await prisma.question.findMany({
      where: { sessionId: sessionId! },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ questions });
  } catch (err: any) {
    console.error("listQuestions error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const endQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { qid } = req.params;
    if (!qid) return res.status(400).json({ error: "Question ID required" });
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const question = await prisma.question.findUnique({ where: { id: qid! } });
    if (!question) return res.status(404).json({ error: "Question not found" });

    // verify ownership via session
    const session = await prisma.session.findUnique({ where: { id: question.sessionId } });
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    const updated = await prisma.question.update({
      where: { id: qid! },
      data: { isActive: false, endedAt: new Date() },
    });

    try {
      const io = getIO();
      io.to(`session:${question.sessionId}`).emit("question-ended", { questionId: qid });
    } catch (e) {
      console.warn("Socket emit failed (question-ended)", e);
    }

    return res.json({ question: updated });
  } catch (err: any) {
    console.error("endQuestion error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const activateQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { qid } = req.params;
    if (!qid) return res.status(400).json({ error: "Question ID required" });
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const question = await prisma.question.findUnique({ where: { id: qid! } });
    if (!question) return res.status(404).json({ error: "Question not found" });

    // verify ownership via session
    const session = await prisma.session.findUnique({ where: { id: question.sessionId } });
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    // Update question to active
    const updated = await prisma.question.update({
      where: { id: qid! },
      data: { isActive: true },
    });

    // broadcast to session room - emit as activate event for viewers, not new-question
    try {
      const io = getIO();
      io.to(`session:${question.sessionId}`).emit("question-activated", {
        id: updated.id,
        sessionId: updated.sessionId,
        type: updated.type,
        title: updated.title,
        options: updated.options,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
      });
      console.log("Emitted question-activated to room session:", question.sessionId);
    } catch (e) {
      console.warn("Socket emit failed (question-activated)", e);
    }

    return res.json({ question: updated });
  } catch (err: any) {
    console.error("activateQuestion error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
