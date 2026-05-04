import { Router } from "express";
import { Types } from "mongoose";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { sendError, sendSuccess, zodDetails } from "../utils/apiResponse.js";
import { createTransactionSchema, transactionFilterSchema, updateTransactionSchema } from "../validation/transactions.js";
import { transactionService } from "../services/transactionService.js";

export const transactionRouter = Router();

transactionRouter.get("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = transactionFilterSchema.safeParse({
    type: req.query.type ?? undefined,
    category: req.query.category ?? undefined,
    from: req.query.from ?? undefined,
    to: req.query.to ?? undefined,
    search: req.query.search ?? undefined,
    page: req.query.page ?? "1",
    limit: req.query.limit ?? "10"
  });
  if (!parsed.success) return sendError(res, "VALIDATION_ERROR", "Validation failed", 422, zodDetails(parsed.error));
  const result = await transactionService.list({ userId: req.auth!.userId, ...parsed.data });
  return sendSuccess(res, result);
});

transactionRouter.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createTransactionSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, "VALIDATION_ERROR", "Validation failed", 422, zodDetails(parsed.error));
  const created = await transactionService.create({ userId: req.auth!.userId, ...parsed.data });
  return sendSuccess(res, { transaction: created }, 201, "Transaction created");
});

transactionRouter.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) return sendError(res, "NOT_FOUND", "Transaction not found", 404);
  const tx = await transactionService.getById(req.auth!.userId, req.params.id);
  if (!tx) return sendError(res, "NOT_FOUND", "Transaction not found", 404);
  return sendSuccess(res, { transaction: tx });
});

transactionRouter.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const parsed = updateTransactionSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, "VALIDATION_ERROR", "Validation failed", 422, zodDetails(parsed.error));
  const updated = await transactionService.updateById(req.auth!.userId, req.params.id, parsed.data);
  if (!updated) return sendError(res, "NOT_FOUND", "Transaction not found", 404);
  return sendSuccess(res, { transaction: updated }, 200, "Transaction updated");
});

transactionRouter.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const deleted = await transactionService.removeById(req.auth!.userId, req.params.id);
  if (!deleted) return sendError(res, "NOT_FOUND", "Transaction not found", 404);
  return sendSuccess(res, {}, 200, "Transaction deleted");
});
