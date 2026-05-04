import { Schema, model, Types } from "mongoose";

const budgetSchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true, ref: "User", index: true },
    categoryId: { type: Types.ObjectId, required: true, ref: "Category" },
    amount: { type: Number, required: true, min: 0 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true }
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, categoryId: 1, month: 1, year: 1 }, { unique: true });

export const BudgetModel = model("Budget", budgetSchema);
