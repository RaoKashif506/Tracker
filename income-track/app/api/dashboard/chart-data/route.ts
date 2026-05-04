import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Transaction } from '@/lib/models/Transaction';
import { getCurrentUser } from '@/lib/auth/jwt';
import { successResponse, unauthorized, errorResponse } from '@/lib/api-utils';
import mongoose from 'mongoose';

type CategoryDoc = {
  _id: mongoose.Types.ObjectId;
  name: string;
  color: string;
};

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorized();
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Parse range
    let days = 30;
    if (range === '7d') days = 7;
    else if (range === '30d') days = 30;
    else if (range === '90d') days = 90;

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const userId = new mongoose.Types.ObjectId(currentUser.userId);
    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate },
      type: 'expense',
    }).populate('category');

    // Group by day
    const dailyData: Record<string, { date: string; amount: number }> = {};

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = { date: dateStr, amount: 0 };
    }

    // Accumulate amounts
    transactions.forEach((t) => {
      const dateStr = t.date.toISOString().split('T')[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].amount += t.amount;
      }
    });

    const chartData = Object.values(dailyData);

    // Category breakdown
    const categoryData: Record<string, { name: string; value: number; color: string }> = {};
    for (const transaction of transactions) {
      const category = transaction.category as CategoryDoc | undefined;
      if (!category) continue;

      const categoryId = category._id.toString();
      if (!categoryData[categoryId]) {
        categoryData[categoryId] = {
          name: category.name,
          value: 0,
          color: category.color,
        };
      }
      categoryData[categoryId].value += transaction.amount;
    }

    return successResponse({
      chartData: {
        dailySpending: chartData,
        categoryBreakdown: Object.values(categoryData),
      },
    });
  } catch (error) {
    console.error('[Dashboard Chart] Error:', error);
    return errorResponse('SERVER_ERROR', 'An error occurred while fetching chart data', undefined, 500);
  }
}
