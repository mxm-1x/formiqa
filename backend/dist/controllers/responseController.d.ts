import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
export declare const submitResponse: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listResponses: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=responseController.d.ts.map