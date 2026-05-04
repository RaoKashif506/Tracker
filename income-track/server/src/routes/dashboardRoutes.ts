import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { dashboardService } from "../services/dashboardService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", requireAuth, async (req: AuthRequest, res) => {
  const summary = await dashboardService.summary(req.auth!.userId);
  return sendSuccess(res, { summary });
});
