import { connectDB } from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import { getCurrentUser } from '@/lib/auth/jwt';
import { successResponse, unauthorized } from '@/lib/api-utils';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorized();
    }

    await connectDB();

    const user = await User.findById(currentUser.userId);
    if (!user) {
      return unauthorized();
    }

    return successResponse({
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('[Me] Error:', error);
    return unauthorized();
  }
}
