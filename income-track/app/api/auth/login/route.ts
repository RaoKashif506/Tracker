import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken, setAuthCookie } from '@/lib/auth/jwt';
import { loginSchema } from '@/lib/validation/auth';
import { successResponse, handleZodError, errorResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const { email, password } = validationResult.data;

    // Find user by email (include password field for verification)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', undefined, 401);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', undefined, 401);
    }

    // Generate JWT and set cookie
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    await setAuthCookie(token);

    return successResponse({
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
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

    console.error('[Login] Error:', error);
    return errorResponse('SERVER_ERROR', 'An error occurred during login', undefined, 500);
  }
}
