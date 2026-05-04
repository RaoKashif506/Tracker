import { Types } from "mongoose";
import { TransactionModel } from "../models/Transaction.js";
function buildFilter(input) {
    const query = {
        userId: new Types.ObjectId(input.userId)
    };
    if (input.type)
        query.type = input.type;
    if (input.category)
        query.category = new Types.ObjectId(input.category);
    if (input.from || input.to) {
        query.date = {
            ...(input.from ? { $gte: input.from } : {}),
            ...(input.to ? { $lte: input.to } : {})
        };
    }
    if (input.search) {
        query.$or = [
            { description: { $regex: input.search, $options: "i" } },
            { notes: { $regex: input.search, $options: "i" } }
        ];
    }
    return query;
}
export const transactionRepository = {
    async list(input) {
        const filter = buildFilter(input);
        const skip = (input.page - 1) * input.limit;
        const [total, rows] = await Promise.all([
            TransactionModel.countDocuments(filter),
            TransactionModel.find(filter).populate("category").sort({ date: -1 }).skip(skip).limit(input.limit)
        ]);
        return { total, rows };
    },
    create(input) {
        return TransactionModel.create({
            ...input,
            userId: new Types.ObjectId(input.userId),
            category: new Types.ObjectId(input.category)
        });
    },
    findByIdAndUser(id, userId) {
        return TransactionModel.findOne({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) }).populate("category");
    },
    updateByIdAndUser(id, userId, patch) {
        const safePatch = {
            ...patch,
            ...(patch.category ? { category: new Types.ObjectId(String(patch.category)) } : {})
        };
        return TransactionModel.findOneAndUpdate({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) }, safePatch, { new: true }).populate("category");
    },
    deleteByIdAndUser(id, userId) {
        return TransactionModel.findOneAndDelete({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) });
    },
    async monthSummary(userId, monthStart, monthEnd) {
        return TransactionModel.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(userId),
                    date: { $gte: monthStart, $lte: monthEnd }
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" }
                }
            }
        ]);
    },
    deleteByUserId(userId) {
        return TransactionModel.deleteMany({ userId: new Types.ObjectId(userId) });
    }
};
