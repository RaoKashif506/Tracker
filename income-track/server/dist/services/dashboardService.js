import { transactionRepository } from "../repositories/transactionRepository.js";
export const dashboardService = {
    async summary(userId) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const grouped = await transactionRepository.monthSummary(userId, monthStart, monthEnd);
        const income = grouped.find((g) => g._id === "income")?.total ?? 0;
        const expense = grouped.find((g) => g._id === "expense")?.total ?? 0;
        return {
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            income,
            expense,
            balance: income - expense
        };
    }
};
