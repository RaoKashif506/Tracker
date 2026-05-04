import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Transaction } from '@/lib/models/Transaction';
import { getCurrentUser } from '@/lib/auth/jwt';
import { updateTransactionSchema } from '@/lib/validation/transaction';
import { successResponse, handleZodError, unauthorized, notFound, forbidden, errorResponse } from '@/lib/api-utils';
import mongoose from 'mongoose';

async function getTransaction(id: string, userId: string) {
  const transaction = await Transaction.findById(id).populate('category');
  if (!transaction) {
    return null;
  }
  if (transaction.userId.toString() !== userId) {
    return 'forbidden';
  }
  return transaction;
}

function formatTransaction(t: any) {
  return {
    id: t._id.toString(),
    type: t.type,
    amount: t.amount,
    category: {
      id: t.category._id.toString(),
      name: t.category.name,
      color: t.category.color,
      icon: t.category.icon,
    },
    description: t.description,
    notes: t.notes,
    date: t.date,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorized();
    }

    await connectDB();

    const transaction = await getTransaction(id, currentUser.userId);
    if (!transaction) {
      return notFound();
    }
    if (transaction === 'forbidden') {
      return forbidden();
    }

    return successResponse({
      transaction: formatTransaction(transaction),
    });
  } catch (error) {
    console.error('[Get Transaction] Error:', error);
    return errorResponse('SERVER_ERROR', 'An error occurred while fetching transaction', undefined, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorized();
    }

    await connectDB();

    const transaction = await getTransaction(id, currentUser.userId);
    if (!transaction) {
      return notFound();
    }
    if (transaction === 'forbidden') {
      return forbidden();
    }

    const body = await request.json();
    const validationResult = updateTransactionSchema.safeParse(body);

    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const updateData = validationResult.data;

    if (updateData.category) {
      updateData.category = new mongoose.Types.ObjectId(updateData.category) as any;
    }

    const updated = await Transaction.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate('category');

    return successResponse(
      {
        transaction: formatTransaction(updated),
      },
      'Transaction updated successfully'
    );
  } catch (error) {
    console.error('[Update Transaction] Error:', error);
    return errorResponse('SERVER_ERROR', 'An error occurred while updating transaction', undefined, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorized();
    }

    await connectDB();

    const transaction = await getTransaction(id, currentUser.userId);
    if (!transaction) {
      return notFound();
    }
    if (transaction === 'forbidden') {
      return forbidden();
    }

    await Transaction.findByIdAndDelete(id);

    return successResponse(
      { id },
      'Transaction deleted successfully'
    );
  } catch (error) {
    console.error('[Delete Transaction] Error:', error);
    return errorResponse('SERVER_ERROR', 'An error occurred while deleting transaction', undefined, 500);
  }
}
