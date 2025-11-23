import { Request, Response } from "express";
import bcrypt from "bcryptjs";
// import { prisma } from "../utils/prisma";
import prisma from "../db/prisma";
import jwt from "jsonwebtoken";
import { signJwt } from "../utils/jwt";
import { AuthRequest } from "../middleware/authMiddleware";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    const token = signJwt({ id: user.id, email: user.email });
    // Remove sensitive fields from response
    const userOut = { id: user.id, name: user.name, email: user.email, role: user.role };

    return res.status(201).json({ token, user: userOut });
  } catch (err: any) {
    console.error("signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = signJwt({ id: user.id, email: user.email });
    const userOut = { id: user.id, name: user.name, email: user.email, role: user.role };

    return res.json({ token, user: userOut });
  } catch (err: any) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const userOut = { id: user.id, name: user.name, email: user.email, role: user.role };
    return res.json({ user: userOut });
  } catch (err: any) {
    console.error("me error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};