import { Types } from "mongoose";
import { BudgetModel } from "../models/Budget.js";

export const budgetRepository = {
  listForUser(userId: string, month: number, year: number) {
    return BudgetModel.find({ userId: new Types.ObjectId(userId), month, year }).populate("categoryId");
  },
  upsert(input: { userId: string; categoryId: string; amount: number; month: number; year: number }) {
    return BudgetModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(input.userId),
        categoryId: new Types.ObjectId(input.categoryId),
        month: input.month,
        year: input.year
      },
      { amount: input.amount },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("categoryId");
  }
};
