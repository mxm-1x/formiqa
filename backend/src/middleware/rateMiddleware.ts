// src/middleware/rateLimit.ts
import rateLimit from "express-rate-limit";

export const feedbackRateLimiter = rateLimit({
  windowMs: 15 * 1000, // 15 seconds window
  max: 6, // limit each IP to 6 requests per windowMs
  message: { error: "Too many feedback submissions, slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});
