import { CategoryModel } from "../models/Category.js";
export const categoryRepository = {
    list() {
        return CategoryModel.find().sort({ name: 1 });
    },
    insertMany(seed) {
        return CategoryModel.insertMany(seed, { ordered: false });
    },
    count() {
        return CategoryModel.countDocuments();
    }
};
