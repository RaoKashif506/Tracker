import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { budgetService } from "../services/budgetService.js";
import { sendError, sendSuccess, zodDetails } from "../utils/apiResponse.js";

const budgetSchema = z.object({
  categoryId: z.string(),
  amount: z.number().nonnegative(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000)
});

export const budgetRouter = Router();

budgetRouter.get("/", requireAuth, async (req: AuthRequest, res) => {
  const month = Number(req.query.month ?? new Date().getMonth() + 1);
  const year = Number(req.query.year ?? new Date().getFullYear());
  const budgets = await budgetService.list(req.auth!.userId, month, year);
  return sendSuccess(res, { budgets });
});

budgetRouter.put("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = budgetSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, "VALIDATION_ERROR", "Validation failed", 422, zodDetails(parsed.error));
  const budget = await budgetService.upsert({ userId: req.auth!.userId, ...parsed.data });
  return sendSuccess(res, { budget }, 200, "Budget saved");
});
