import { CategoryModel } from "../models/Category.js";

export const categoryRepository = {
  list() {
    return CategoryModel.find().sort({ name: 1 });
  },
  insertMany(seed: Array<{ name: string; type: "expense" | "income"; color: string; icon: string }>) {
    return CategoryModel.insertMany(seed, { ordered: false });
  },
  count() {
    return CategoryModel.countDocuments();
  }
};
