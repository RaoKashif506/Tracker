import { Types } from "mongoose";
import { TransactionModel } from "../models/Transaction.js";

type FilterInput = {
  userId: string;
  type?: "expense" | "income";
  category?: string;
  from?: Date;
  to?: Date;
  search?: string;
};

function buildFilter(input: FilterInput) {
  const query: Record<string, unknown> = {
    userId: new Types.ObjectId(input.userId)
  };
  if (input.type) query.type = input.type;
  if (input.category) query.category = new Types.ObjectId(input.category);
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
  async list(input: FilterInput & { page: number; limit: number }) {
    const filter = buildFilter(input);
    const skip = (input.page - 1) * input.limit;
    const [total, rows] = await Promise.all([
      TransactionModel.countDocuments(filter),
      TransactionModel.find(filter).populate("category").sort({ date: -1 }).skip(skip).limit(input.limit)
    ]);
    return { total, rows };
  },
  create(input: {
    userId: string;
    type: "expense" | "income";
    amount: number;
    category: string;
    description: string;
    notes?: string;
    date: Date;
  }) {
    return TransactionModel.create({
      ...input,
      userId: new Types.ObjectId(input.userId),
      category: new Types.ObjectId(input.category)
    });
  },
  findByIdAndUser(id: string, userId: string) {
    return TransactionModel.findOne({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) }).populate("category");
  },
  updateByIdAndUser(id: string, userId: string, patch: Record<string, unknown>) {
    const safePatch = {
      ...patch,
      ...(patch.category ? { category: new Types.ObjectId(String(patch.category)) } : {})
    };
    return TransactionModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      safePatch,
      { new: true }
    ).populate("category");
  },
  deleteByIdAndUser(id: string, userId: string) {
    return TransactionModel.findOneAndDelete({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) });
  },
  async monthSummary(userId: string, monthStart: Date, monthEnd: Date) {
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
  deleteByUserId(userId: string) {
    return TransactionModel.deleteMany({ userId: new Types.ObjectId(userId) });
  }
};
