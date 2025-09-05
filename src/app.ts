import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import authRouter from "./routers/auth.router";
import userRouter from "./routers/user.router";
import eventRouter from "./routers/event.router";
import transactionRouter from "./routers/transaction.router";
import voucherRouter from "./routers/voucher.router";
import couponRouter from "./routers/coupon.router";
import reviewRouter from "./routers/review.router";
import dashboardRouter from "./routers/dashboard.router";
import notificationRouter from "./routers/notification.router";
import healthRouter from "./routers/health.router";
import errorHandler from "./middleware/errorHandler";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Event Management API is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/events", eventRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/vouchers", voucherRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api", healthRouter);

app.use(errorHandler);

export default app;
