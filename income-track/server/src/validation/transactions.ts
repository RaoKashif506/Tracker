import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.number().positive(),
  category: z.string(),
  description: z.string().min(1),
  notes: z.string().optional(),
  date: z.coerce.date()
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionFilterSchema = z.object({
  type: z.enum(["expense", "income"]).optional(),
  category: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10)
});
