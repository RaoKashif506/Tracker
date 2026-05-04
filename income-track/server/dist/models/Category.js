import { Schema, model } from "mongoose";
const categorySchema = new Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["expense", "income"], required: true },
    color: { type: String, required: true },
    icon: { type: String, required: true }
}, { timestamps: true });
export const CategoryModel = model("Category", categorySchema);
