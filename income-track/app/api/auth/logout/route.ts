import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/jwt';

export async function POST() {
  try {
    await clearAuthCookie();

    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Logout] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: 'An error occurred during logout',
        },
      },
      { status: 500 }
    );
  }
}
