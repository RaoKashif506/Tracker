import type { Response } from "express";
import { ZodError } from "zod";

export function sendSuccess<T>(res: Response, data: T, status = 200, message?: string) {
  return res.status(status).json({
    success: true,
    data,
    message
  });
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  status = 400,
  details?: Record<string, unknown>
) {
  return res.status(status).json({
    error: {
      code,
      message,
      details
    }
  });
}

export function zodDetails(error: ZodError) {
  const details: Record<string, unknown> = {};
  for (const issue of error.issues) {
    details[issue.path.join(".") || "root"] = issue.message;
  }
  return details;
}
