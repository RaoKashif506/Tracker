import { Types } from "mongoose";
import { BudgetModel } from "../models/Budget.js";
export const budgetRepository = {
    listForUser(userId, month, year) {
        return BudgetModel.find({ userId: new Types.ObjectId(userId), month, year }).populate("categoryId");
    },
    upsert(input) {
        return BudgetModel.findOneAndUpdate({
            userId: new Types.ObjectId(input.userId),
            categoryId: new Types.ObjectId(input.categoryId),
            month: input.month,
            year: input.year
        }, { amount: input.amount }, { upsert: true, new: true, setDefaultsOnInsert: true }).populate("categoryId");
    }
};
