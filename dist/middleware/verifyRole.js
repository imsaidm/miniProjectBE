"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRole = verifyRole;
function verifyRole(...roles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.role) {
            return res.status(401).json({ message: 'Unauthorized: no user info' });
        }
        if (!roles.includes(user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient privileges' });
        }
        next();
    };
}
exports.default = verifyRole;
//# sourceMappingURL=verifyRole.js.map