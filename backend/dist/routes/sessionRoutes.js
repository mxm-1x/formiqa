"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/sessionRoutes.ts
const express_1 = require("express");
const sessionController_1 = require("../controllers/sessionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const sessionFeedbackController_1 = require("../controllers/sessionFeedbackController");
const router = (0, express_1.Router)();
// POST /api/sessions -> create
router.post("/", authMiddleware_1.authMiddleware, sessionController_1.createSession);
// GET /api/sessions -> list user's sessions
router.get("/", authMiddleware_1.authMiddleware, sessionController_1.listSessions);
// GET /api/sessions/code/:code -> get session by code (public)
router.get("/code/:code", sessionController_1.getSessionByCode);
// GET /api/sessions/:id/feedbacks -> list feedbacks for session (presenter)
router.get("/:id/feedbacks", authMiddleware_1.authMiddleware, sessionFeedbackController_1.getSessionFeedbacks);
// GET /api/sessions/:id/analytics -> analytics
router.get("/:id/analytics", authMiddleware_1.authMiddleware, sessionController_1.getAnalytics);
// POST /api/sessions/:id/end -> end session
router.post("/:id/end", authMiddleware_1.authMiddleware, sessionController_1.endSession);
router.get("/", authMiddleware_1.authMiddleware, sessionController_1.listSessions);
exports.default = router;
//# sourceMappingURL=sessionRoutes.js.map