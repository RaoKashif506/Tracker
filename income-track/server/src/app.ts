import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./config/env.js";
import { authRouter } from "./routes/authRoutes.js";
import { transactionRouter } from "./routes/transactionRoutes.js";
import { categoryRouter } from "./routes/categoryRoutes.js";
import { dashboardRouter } from "./routes/dashboardRoutes.js";
import { profileRouter } from "./routes/profileRoutes.js";
import { budgetRouter } from "./routes/budgetRoutes.js";

export const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/profile", profileRouter);
app.use("/api/budgets", budgetRouter);
