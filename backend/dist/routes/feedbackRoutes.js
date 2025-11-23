"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedbackController_1 = require("../controllers/feedbackController");
const router = (0, express_1.Router)();
router.post("/:code", feedbackController_1.submitFeedback);
exports.default = router;
//# sourceMappingURL=feedbackRoutes.js.map