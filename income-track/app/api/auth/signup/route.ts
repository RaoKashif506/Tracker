import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import { hashPassword } from '@/lib/auth/password';
import { generateToken, setAuthCookie } from '@/lib/auth/jwt';
import { signupSchema } from '@/lib/validation/auth';
import { successResponse, handleZodError, handleDbError, errorResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validationResult = signupSchema.safeParse(body);

    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const { fullName, email, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse('USER_EXISTS', 'Email is already registered', undefined, 409);
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    // Generate JWT and set cookie
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    await setAuthCookie(token);

    return successResponse(
      {
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
        },
      },
      'User created successfully',
      201
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return handleDbError(error);
    }

    if (error instanceof Error && error.message.includes('MONGODB_URI environment variable is not configured')) {
      return errorResponse(
        'CONFIG_ERROR',
        'MongoDB is not configured. Create .env.local with MONGODB_URI and restart the dev server.',
        undefined,
        503
      );
    }

    if (
      error instanceof Error &&
      (error.message.includes('ECONNREFUSED') ||
        error.message.includes('querySrv') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('MongoServerSelectionError'))
    ) {
      return errorResponse(
        'DATABASE_UNAVAILABLE',
        'Cannot connect to MongoDB. Start MongoDB or update MONGODB_URI in .env.local, then restart the dev server.',
        undefined,
        503
      );
    }

    console.error('[Signup] Error:', error);
    return errorResponse('SERVER_ERROR', 'An error occurred during signup', undefined, 500);
  }
}
