import { budgetRepository } from "../repositories/budgetRepository.js";

export const budgetService = {
  list(userId: string, month: number, year: number) {
    return budgetRepository.listForUser(userId, month, year);
  },
  upsert(input: { userId: string; categoryId: string; amount: number; month: number; year: number }) {
    return budgetRepository.upsert(input);
  }
};
