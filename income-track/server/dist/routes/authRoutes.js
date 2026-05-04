import { Router } from "express";
import { authService } from "../services/authService.js";
import { sendError, sendSuccess, zodDetails } from "../utils/apiResponse.js";
import { loginSchema, signupSchema } from "../validation/auth.js";
import { authRateLimiter } from "../middleware/rateLimit.js";
import { requireAuth } from "../middleware/auth.js";
export const authRouter = Router();
authRouter.post("/signup", authRateLimiter, async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success)
        return sendError(res, "VALIDATION_ERROR", "Validation failed", 422, zodDetails(parsed.error));
    try {
        const { user, token } = await authService.signup(parsed.data);
        res.cookie("auth_token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
        return sendSuccess(res, { user: { id: user.id, fullName: user.fullName, email: user.email } }, 201, "Signup successful");
    }
    catch (error) {
        return sendError(res, "SIGNUP_FAILED", error.message, 400);
    }
});
authRouter.post("/login", authRateLimiter, async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
        return sendError(res, "VALIDATION_ERROR", "Validation failed", 422, zodDetails(parsed.error));
    try {
        const { user, token } = await authService.login(parsed.data);
        res.cookie("auth_token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
        return sendSuccess(res, { user: { id: user.id, fullName: user.fullName, email: user.email } }, 200, "Login successful");
    }
    catch (error) {
        return sendError(res, "LOGIN_FAILED", error.message, 401);
    }
});
authRouter.post("/logout", requireAuth, async (_req, res) => {
    res.clearCookie("auth_token");
    return sendSuccess(res, {}, 200, "Logged out");
});
authRouter.get("/me", requireAuth, async (req, res) => {
    return sendSuccess(res, { user: req.auth });
});
