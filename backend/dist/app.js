"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const sessionRoutes_1 = __importDefault(require("./routes/sessionRoutes"));
const feedbackRoutes_1 = __importDefault(require("./routes/feedbackRoutes"));
const rateMiddleware_1 = require("./middleware/rateMiddleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express_1.default.json());
// health
app.get("/healthz", (req, res) => res.send({ status: "ok" }));
app.use("/api/auth", authRoutes_1.default);
app.use("/api/sessions", sessionRoutes_1.default);
// apply rate limiter ONLY to the POST feedback route
// feedbackRoutes defines router.post("/:code", submitFeedback)
app.use("/api/feedback", (req, res, next) => {
    if (req.method === "POST") {
        return (0, rateMiddleware_1.feedbackRateLimiter)(req, res, next);
    }
    next();
}, feedbackRoutes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map