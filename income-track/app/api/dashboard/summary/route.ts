import { connectDB } from '@/lib/db/mongodb';
import { Transaction } from '@/lib/models/Transaction';
import { getCurrentUser } from '@/lib/auth/jwt';
import { successResponse, unauthorized, errorResponse } from '@/lib/api-utils';
import mongoose from 'mongoose';

type CategoryDoc = {
  _id: mongoose.Types.ObjectId;
  name: string;
  color: string;
  icon: string;
};

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorized();
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(currentUser.userId);
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get totals
    const allTransactions = await Transaction.find({ userId });
    const totalIncome = allTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = allTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Current month
    const currentMonthTransactions = allTransactions.filter(
      (t) => t.date >= currentMonth
    );
    const currentMonthExpenses = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const currentMonthIncome = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    // Last month
    const lastMonthTransactions = allTransactions.filter(
      (t) => t.date >= lastMonth && t.date <= lastMonthEnd
    );
    const lastMonthExpenses = lastMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate percentage change
    const monthlyChange =
      lastMonthExpenses > 0
        ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
        : 0;

    // Top categories
    const categoryTotals: Record<string, { name: string; amount: number; color: string; icon: string; count: number }> = {};
    for (const transaction of currentMonthTransactions.filter((t) => t.type === 'expense')) {
      const cat = await Transaction.findById(transaction._id).populate('category');
      const category = cat?.category as CategoryDoc | undefined;
      if (!category) continue;

      const categoryId = category._id.toString();
      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = {
          name: category.name,
          amount: 0,
          color: category.color,
          icon: category.icon,
          count: 0,
        };
      }
      categoryTotals[categoryId].amount += transaction.amount;
      categoryTotals[categoryId].count += 1;
    }

    const topCategories = Object.values(categoryTotals)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return successResponse({
      summary: {
        currentBalance: totalIncome - totalExpenses,
        totalIncome,
        totalExpenses,
        currentMonthExpenses,
        currentMonthIncome,
        lastMonthExpenses,
        monthlyChange: Math.round(monthlyChange * 100) / 100,
        topCategories,
      },
    });
  } catch (error) {
    console.error('[Dashboard Summary] Error:', error);
    return errorResponse('SERVER_ERROR', 'An error occurred while fetching summary', undefined, 500);
  }
}
