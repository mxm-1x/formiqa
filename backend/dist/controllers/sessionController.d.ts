import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
export declare const createSession: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getSessionByCode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listSessions: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const endSession: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * GET /api/sessions/:id/analytics
 * Returns:
 *  - totalFeedback
 *  - avgSentiment
 *  - countsByType (emoji/text)
 *  - topEmojis (map)
 *  - feedbackPerMinute (last N minutes)
 */
export declare const getAnalytics: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=sessionController.d.ts.map