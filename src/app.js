"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const user_router_1 = __importDefault(require("./routers/user.router"));
const event_router_1 = __importDefault(require("./routers/event.router"));
const transaction_router_1 = __importDefault(require("./routers/transaction.router"));
const voucher_router_1 = __importDefault(require("./routers/voucher.router"));
const coupon_router_1 = __importDefault(require("./routers/coupon.router"));
const review_router_1 = __importDefault(require("./routers/review.router"));
const dashboard_router_1 = __importDefault(require("./routers/dashboard.router"));
const notification_router_1 = __importDefault(require("./routers/notification.router"));
const health_router_1 = __importDefault(require("./routers/health.router"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.status(200).json({ status: "ok", message: "Event Management API is running" });
});
app.use("/api/auth", auth_router_1.default);
app.use("/api/users", user_router_1.default);
app.use("/api/events", event_router_1.default);
app.use("/api/transactions", transaction_router_1.default);
app.use("/api/vouchers", voucher_router_1.default);
app.use("/api/coupons", coupon_router_1.default);
app.use("/api/reviews", review_router_1.default);
app.use("/api/dashboard", dashboard_router_1.default);
app.use("/api/notifications", notification_router_1.default);
app.use("/api", health_router_1.default);
app.use(errorHandler_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map