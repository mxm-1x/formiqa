"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackRateLimiter = void 0;
// src/middleware/rateLimit.ts
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.feedbackRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 1000, // 15 seconds window
    max: 6, // limit each IP to 6 requests per windowMs
    message: { error: "Too many feedback submissions, slow down." },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateMiddleware.js.map