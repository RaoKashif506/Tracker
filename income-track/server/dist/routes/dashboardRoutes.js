import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { dashboardService } from "../services/dashboardService.js";
import { sendSuccess } from "../utils/apiResponse.js";
export const dashboardRouter = Router();
dashboardRouter.get("/summary", requireAuth, async (req, res) => {
    const summary = await dashboardService.summary(req.auth.userId);
    return sendSuccess(res, { summary });
});
