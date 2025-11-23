"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSessionCode = void 0;
const generateSessionCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateSessionCode = generateSessionCode;
//# sourceMappingURL=generateCode.js.map