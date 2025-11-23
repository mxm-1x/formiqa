"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// import { prisma } from "../utils/prisma";
const prisma_1 = __importDefault(require("../db/prisma"));
const jwt_1 = require("../utils/jwt");
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: "Email already registered" });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, SALT_ROUNDS);
        const user = await prisma_1.default.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
        });
        const token = (0, jwt_1.signJwt)({ id: user.id, email: user.email });
        // Remove sensitive fields from response
        const userOut = { id: user.id, name: user.name, email: user.email, role: user.role };
        return res.status(201).json({ token, user: userOut });
    }
    catch (err) {
        console.error("signup error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Email and password are required" });
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!ok)
            return res.status(400).json({ error: "Invalid credentials" });
        const token = (0, jwt_1.signJwt)({ id: user.id, email: user.email });
        const userOut = { id: user.id, name: user.name, email: user.email, role: user.role };
        return res.json({ token, user: userOut });
    }
    catch (err) {
        console.error("login error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.login = login;
const me = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const user = await prisma_1.default.user.findUnique({ where: { id: req.user.id } });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const userOut = { id: user.id, name: user.name, email: user.email, role: user.role };
        return res.json({ user: userOut });
    }
    catch (err) {
        console.error("me error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.me = me;
//# sourceMappingURL=authController.js.map