import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Category } from '@/lib/models/Category';
import { defaultCategories } from '@/lib/data/default-categories';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const totalCategories = await Category.countDocuments({});
    if (totalCategories === 0) {
      await Category.insertMany(defaultCategories);
    }

    let query = {};
    if (type && (type === 'expense' || type === 'income')) {
      query = { type };
    }

    const categories = await Category.find(query).sort({ name: 1 });

    return successResponse({
      categories: categories.map((cat) => ({
        id: cat._id.toString(),
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
      })),
    });
  } catch (error) {
    console.error('[Categories] Error:', error);
    return errorResponse('SERVER_ERROR', 'An error occurred while fetching categories', undefined, 500);
  }
}
