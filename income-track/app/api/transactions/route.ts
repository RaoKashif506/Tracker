import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Transaction } from '@/lib/models/Transaction';
import { getCurrentUser } from '@/lib/auth/jwt';
import { createTransactionSchema, transactionFilterSchema } from '@/lib/validation/transaction';
import { successResponse, handleZodError, unauthorized, errorResponse } from '@/lib/api-utils';
import mongoose from 'mongoose';

type CategoryDoc = {
  _id: mongoose.Types.ObjectId;
  name: string;
  color: string;
  icon: string;
};

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorized();
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const filterData = {
      type: searchParams.get('type'),
      category: searchParams.get('category'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      search: searchParams.get('search'),
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    };

    const filterResult = transactionFilterSchema.safeParse(filterData);
    if (!filterResult.success) {
      return handleZodError(filterResult.error);
    }

    const { type, category, from, to, search, page, limit } = filterResult.data;
    const skip = (page - 1) * limit;

    const query: {
      userId: mongoose.Types.ObjectId;
      type?: 'expense' | 'income';
      category?: mongoose.Types.ObjectId;
      date?: { $gte?: Date; $lte?: Date };
      $or?: Array<{ description?: { $regex: string; $options: string }; notes?: { $regex: string; $options: string } }>;
    } = { userId: new mongoose.Types.ObjectId(currentUser.userId) };

    if (type) query.type = type;
    if (category) query.category = new mongoose.Types.ObjectId(category);
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = from;
      if (to) query.date.$lte = to;
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('category')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse({
      transactions: transactions.map((t) => {
        const category = t.category as CategoryDoc;
        return {
        id: t._id.toString(),
        type: t.type,
        amount: t.amount,
        category: {
          id: category._id.toString(),
          name: category.name,
          color: category.color,
          icon: category.icon,
        },
        description: t.description,
        notes: t.notes,
        date: t.date,
      };
      }),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Transactions] Error:', error);
    return errorResponse('SERVER_ERROR', 'An error occurred while fetching transactions', undefined, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorized();
    }

    await connectDB();

    const body = await request.json();
    const validationResult = createTransactionSchema.safeParse(body);

    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const { type, amount, category, description, notes, date } = validationResult.data;

    const transaction = await Transaction.create({
      userId: new mongoose.Types.ObjectId(currentUser.userId),
      type,
      amount,
      category: new mongoose.Types.ObjectId(category),
      description,
      notes,
      date,
    });

const populated = await transaction.populate('category');

    const categoryDoc = populated.category as CategoryDoc;

    return successResponse(
      {
        transaction: {
          id: populated._id.toString(),
          type: populated.type,
          amount: populated.amount,
          category: {
            id: categoryDoc._id.toString(),
            name: categoryDoc.name,
            color: categoryDoc.color,
            icon: categoryDoc.icon,
          },
          description: populated.description,
          notes: populated.notes,
          date: populated.date,
        },
      },
      'Transaction created successfully',
      201
    );
  } catch (error) {
    console.error('[Create Transaction] Error:', error);
    return errorResponse('SERVER_ERROR', 'An error occurred while creating transaction', undefined, 500);
  }
}
