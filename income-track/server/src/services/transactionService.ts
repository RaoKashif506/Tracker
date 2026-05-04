import { transactionRepository } from "../repositories/transactionRepository.js";

export const transactionService = {
  async list(input: {
    userId: string;
    type?: "expense" | "income";
    category?: string;
    from?: Date;
    to?: Date;
    search?: string;
    page: number;
    limit: number;
  }) {
    const result = await transactionRepository.list(input);
    return {
      transactions: result.rows.map((item: any) => ({
        id: item._id.toString(),
        type: item.type,
        amount: item.amount,
        category: item.category
          ? {
              id: item.category._id.toString(),
              name: item.category.name,
              color: item.category.color,
              icon: item.category.icon
            }
          : null,
        description: item.description,
        notes: item.notes,
        date: item.date
      })),
      pagination: {
        page: input.page,
        limit: input.limit,
        total: result.total,
        pages: Math.ceil(result.total / input.limit)
      }
    };
  },
  async create(input: {
    userId: string;
    type: "expense" | "income";
    amount: number;
    category: string;
    description: string;
    notes?: string;
    date: Date;
  }) {
    const created = await transactionRepository.create(input);
    return transactionRepository.findByIdAndUser(created.id, input.userId);
  },
  getById(userId: string, id: string) {
    return transactionRepository.findByIdAndUser(id, userId);
  },
  updateById(userId: string, id: string, patch: Record<string, unknown>) {
    return transactionRepository.updateByIdAndUser(id, userId, patch);
  },
  removeById(userId: string, id: string) {
    return transactionRepository.deleteByIdAndUser(id, userId);
  }
};
