"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = exports.signJwt = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || 'mxmnew_secret';
const signJwt = (payload, expiresIn = "7d") => {
    // @ts-ignore
    return (0, jsonwebtoken_1.sign)(payload, JWT_SECRET, { expiresIn });
};
exports.signJwt = signJwt;
const verifyJwt = (token) => {
    try {
        const data = (0, jsonwebtoken_1.verify)(token, JWT_SECRET);
        return data;
    }
    catch (error) {
        return null;
    }
};
exports.verifyJwt = verifyJwt;
//# sourceMappingURL=jwt.js.map