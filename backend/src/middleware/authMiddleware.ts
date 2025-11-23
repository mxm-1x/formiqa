console.log("JWT USED:", process.env.JWT_SECRET);

import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "Missing Authorization Header" });

        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({ error: "Invalid Authorization Header Format" });
        }

        const token = parts[1];
        const payload = verifyJwt(token!);
        if (!payload) {
            return res.status(401).json({ error: "Invalid or Expired Token" });
        }

        req.user = { id: payload.id, email: payload.email };
        next();
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};