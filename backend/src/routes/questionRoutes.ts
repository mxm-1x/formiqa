import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createQuestion,
  listQuestions,
  endQuestion,
  activateQuestion,
} from "../controllers/questionController";
import { submitResponse, listResponses } from "../controllers/responseController";

const router = Router();

// Presenter creates a question
router.post("/sessions/:id/questions", authMiddleware, createQuestion);

// Presenter lists questions for a session
router.get("/sessions/:id/questions", authMiddleware, listQuestions);

// Viewer submits response to question
router.post("/questions/:qid/responses", submitResponse);

// Presenter lists responses for a question
router.get("/questions/:qid/responses", authMiddleware, listResponses);

// Presenter ends question
router.post("/questions/:qid/end", authMiddleware, endQuestion);

// Presenter activates question
router.post("/questions/:qid/activate", authMiddleware, activateQuestion);

export default router;
