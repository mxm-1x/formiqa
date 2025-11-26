import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
export declare const createQuestion: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listQuestions: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const endQuestion: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const activateQuestion: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=questionController.d.ts.map