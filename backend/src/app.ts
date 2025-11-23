// src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/authRoutes";
import sessionRoutes from "./routes/sessionRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import { feedbackRateLimiter } from "./middleware/rateMiddleware";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// health
app.get("/healthz", (req, res) => res.send({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);

// apply rate limiter ONLY to the POST feedback route
// feedbackRoutes defines router.post("/:code", submitFeedback)
app.use("/api/feedback", (req, res, next) => {
  if (req.method === "POST") {
    return feedbackRateLimiter(req as any, res as any, next as any);
  }
  next();
}, feedbackRoutes);

export default app;
