import { Router } from "express";
import { sendError, sendSuccess, zodDetails } from "../utils/apiResponse.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { changePasswordSchema, updateProfileSchema } from "../validation/auth.js";
import { profileService } from "../services/profileService.js";

export const profileRouter = Router();

profileRouter.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await profileService.getProfile(req.auth!.userId);
    return sendSuccess(res, { user: { id: user.id, fullName: user.fullName, email: user.email } });
  } catch (error) {
    return sendError(res, "PROFILE_ERROR", (error as Error).message, 404);
  }
});

profileRouter.patch("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, "VALIDATION_ERROR", "Validation failed", 422, zodDetails(parsed.error));
  try {
    const user = await profileService.updateProfile(req.auth!.userId, parsed.data);
    return sendSuccess(res, { user: { id: user.id, fullName: user.fullName, email: user.email } }, 200, "Profile updated");
  } catch (error) {
    return sendError(res, "PROFILE_ERROR", (error as Error).message, 400);
  }
});

profileRouter.post("/change-password", requireAuth, async (req: AuthRequest, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, "VALIDATION_ERROR", "Validation failed", 422, zodDetails(parsed.error));
  try {
    await profileService.changePassword(req.auth!.userId, parsed.data.currentPassword, parsed.data.newPassword);
    return sendSuccess(res, {}, 200, "Password changed");
  } catch (error) {
    return sendError(res, "PROFILE_ERROR", (error as Error).message, 400);
  }
});

profileRouter.delete("/", requireAuth, async (req: AuthRequest, res) => {
  await profileService.deleteAccount(req.auth!.userId);
  res.clearCookie("auth_token");
  return sendSuccess(res, {}, 200, "Account deleted");
});
