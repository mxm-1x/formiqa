"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
console.log("JWT USED:", process.env.JWT_SECRET);
const jwt_1 = require("../utils/jwt");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ error: "Missing Authorization Header" });
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({ error: "Invalid Authorization Header Format" });
        }
        const token = parts[1];
        const payload = (0, jwt_1.verifyJwt)(token);
        if (!payload) {
            return res.status(401).json({ error: "Invalid or Expired Token" });
        }
        req.user = { id: payload.id, email: payload.email };
        next();
    }
    catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map