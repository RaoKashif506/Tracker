import { Schema, model, Types } from "mongoose";
const transactionSchema = new Schema({
    userId: { type: Types.ObjectId, required: true, ref: "User", index: true },
    type: { type: String, enum: ["expense", "income"], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: Types.ObjectId, required: true, ref: "Category" },
    description: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    date: { type: Date, required: true }
}, { timestamps: true });
transactionSchema.index({ userId: 1, date: -1 });
export const TransactionModel = model("Transaction", transactionSchema);
