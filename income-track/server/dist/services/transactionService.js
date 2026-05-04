import { transactionRepository } from "../repositories/transactionRepository.js";
export const transactionService = {
    async list(input) {
        const result = await transactionRepository.list(input);
        return {
            transactions: result.rows.map((item) => ({
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
    async create(input) {
        const created = await transactionRepository.create(input);
        return transactionRepository.findByIdAndUser(created.id, input.userId);
    },
    getById(userId, id) {
        return transactionRepository.findByIdAndUser(id, userId);
    },
    updateById(userId, id, patch) {
        return transactionRepository.updateByIdAndUser(id, userId, patch);
    },
    removeById(userId, id) {
        return transactionRepository.deleteByIdAndUser(id, userId);
    }
};
