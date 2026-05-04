import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { categoryService } from "../services/categoryService.js";
import { sendSuccess } from "../utils/apiResponse.js";
export const categoryRouter = Router();
categoryRouter.get("/", requireAuth, async (_req, res) => {
    const categories = await categoryService.list();
    return sendSuccess(res, { categories });
});
