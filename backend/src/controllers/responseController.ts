import { Request, Response } from "express";
import prisma from "../db/prisma";
// @ts-ignore
import Sentiment from "sentiment";
import { getIO } from "../socket/ioInstance";
import { AuthRequest } from "../middleware/authMiddleware";

const sentiment = new Sentiment();

type SubmitResponseBody = {
  selectedOpt?: string | null; // for MCQ
  textAnswer?: string | null;  // for text questions
};

export const submitResponse = async (req: Request, res: Response) => {
  try {
    const { qid } = req.params;
    if (!qid) return res.status(400).json({ error: "Question ID required" });
    const { selectedOpt, textAnswer } = req.body as SubmitResponseBody;

    // find question
    const question = await prisma.question.findUnique({ where: { id: qid! } });
    if (!question) return res.status(404).json({ error: "Question not found" });
    if (!question.isActive) return res.status(400).json({ error: "Question closed" });

    // validate payload
    if (question.type === "mcq") {
      if (!selectedOpt) return res.status(400).json({ error: "selectedOpt required for MCQ" });

      // Check if selectedOpt is an index (number string like "0", "1", "2")
      const optIndex = parseInt(selectedOpt);
      if (!isNaN(optIndex)) {
        // It's an index - validate it's within bounds
        if (optIndex < 0 || optIndex >= question.options.length) {
          return res.status(400).json({ error: "Invalid option index" });
        }
      } else {
        // It's option text - validate it exists in options
        if (!question.options.includes(selectedOpt)) {
          return res.status(400).json({ error: "Invalid option" });
        }
      }
    } else { // text
      if (!textAnswer || !textAnswer.trim()) return res.status(400).json({ error: "textAnswer required" });
    }

    // sentiment for text
    let sentimentScore: number | null = null;
    if (textAnswer) {
      sentimentScore = sentiment.analyze(textAnswer).score;
    }

    const resp = await prisma.response.create({
      data: {
        questionId: qid,
        selectedOpt: selectedOpt || null,
        textAnswer: textAnswer || null,
        sentimentScore,
      },
    });

    // Log activity to database
    try {
      await prisma.activityLog.create({
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
    } catch (e) {
      console.error("Failed to log activity:", e);
    }

    // emit real-time to presenters in session room
    try {
      const io = getIO();
      io.to(`session:${question.sessionId}`).emit("new-response", {
        id: resp.id,
        questionId: qid,
        selectedOpt: resp.selectedOpt,
        textAnswer: resp.textAnswer,
        sentimentScore: resp.sentimentScore,
        createdAt: resp.createdAt,
      });
    } catch (e) {
      console.warn("Socket emit failed (new-response)", e);
    }

    return res.status(201).json({ success: true, responseId: resp.id });
  } catch (err: any) {
    console.error("submitResponse error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const listResponses = async (req: AuthRequest, res: Response) => {
  try {
    const { qid } = req.params;
    if (!qid) return res.status(400).json({ error: "Question ID required" });
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const question = await prisma.question.findUnique({ where: { id: qid! } });
    if (!question) return res.status(404).json({ error: "Question not found" });

    const session = await prisma.session.findUnique({ where: { id: question.sessionId } });
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    const responses = await prisma.response.findMany({
      where: { questionId: qid! },
      orderBy: { createdAt: "desc" },
    });

    // For MCQ, build aggregated counts
    let aggregates: any = null;
    if (question.type === "mcq") {
      try {
        // simple aggregation by selectedOpt
        const rows = await prisma.$queryRaw<
          Array<{ selectedOpt: string | null; cnt: number }>
        >`SELECT "selectedOpt", COUNT(*) AS cnt FROM "Response" WHERE "questionId" = ${qid} GROUP BY "selectedOpt"`;
        aggregates = rows;
      } catch (e) {
        console.error("Error aggregating MCQ responses:", e);
        // Return empty aggregates on error
        aggregates = [];
      }
    }

    return res.json({ question, responses, aggregates });
  } catch (err: any) {
    console.error("listResponses error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
