"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenMiddleware = tokenMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'changeme!';
function tokenMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: token missing' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: token missing' });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (typeof payload === 'object' && payload !== null) {
            req.user = payload;
            next();
        }
        else {
            return res.status(401).json({ message: 'Unauthorized: token malformed' });
        }
    }
    catch (err) {
        return res.status(401).json({ message: 'Unauthorized: token invalid' });
    }
}
exports.default = tokenMiddleware;
//# sourceMappingURL=token.js.map