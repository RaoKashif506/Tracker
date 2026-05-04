import { budgetRepository } from "../repositories/budgetRepository.js";
export const budgetService = {
    list(userId, month, year) {
        return budgetRepository.listForUser(userId, month, year);
    },
    upsert(input) {
        return budgetRepository.upsert(input);
    }
};
