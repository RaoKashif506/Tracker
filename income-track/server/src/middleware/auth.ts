import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";
import { sendError } from "../utils/apiResponse.js";

export type AuthRequest = Request & {
  auth?: {
    userId: string;
    email: string;
  };
};

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies.auth_token as string | undefined;
  if (!token) return sendError(res, "UNAUTHORIZED", "Unauthorized", 401);
  try {
    req.auth = verifyToken(token);
    next();
  } catch {
    return sendError(res, "UNAUTHORIZED", "Unauthorized", 401);
  }
}
