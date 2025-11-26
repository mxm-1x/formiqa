"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const questionController_1 = require("../controllers/questionController");
const responseController_1 = require("../controllers/responseController");
const router = (0, express_1.Router)();
// Presenter creates a question
router.post("/sessions/:id/questions", authMiddleware_1.authMiddleware, questionController_1.createQuestion);
// Presenter lists questions for a session
router.get("/sessions/:id/questions", authMiddleware_1.authMiddleware, questionController_1.listQuestions);
// Viewer submits response to question
router.post("/questions/:qid/responses", responseController_1.submitResponse);
// Presenter lists responses for a question
router.get("/questions/:qid/responses", authMiddleware_1.authMiddleware, responseController_1.listResponses);
// Presenter ends question
router.post("/questions/:qid/end", authMiddleware_1.authMiddleware, questionController_1.endQuestion);
// Presenter activates question
router.post("/questions/:qid/activate", authMiddleware_1.authMiddleware, questionController_1.activateQuestion);
exports.default = router;
//# sourceMappingURL=questionRoutes.js.map