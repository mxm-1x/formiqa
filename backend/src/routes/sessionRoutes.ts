// src/routes/sessionRoutes.ts
import { Router } from "express";
import { createSession, getSessionByCode, endSession, listSessions, getAnalytics } from "../controllers/sessionController";
import { authMiddleware } from "../middleware/authMiddleware";
import { getSessionFeedbacks } from "../controllers/sessionFeedbackController";


const router = Router();

// POST /api/sessions -> create
router.post("/", authMiddleware, createSession);

// GET /api/sessions -> list user's sessions
router.get("/", authMiddleware, listSessions);

// GET /api/sessions/code/:code -> get session by code (public)
router.get("/code/:code", getSessionByCode);

// GET /api/sessions/:id/feedbacks -> list feedbacks for session (presenter)
router.get("/:id/feedbacks", authMiddleware, getSessionFeedbacks);

// GET /api/sessions/:id/analytics -> analytics
router.get("/:id/analytics", authMiddleware, getAnalytics);

// POST /api/sessions/:id/end -> end session
router.post("/:id/end", authMiddleware, endSession);
router.get("/", authMiddleware, listSessions);

export default router;
