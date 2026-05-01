'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Expense</h1>
            <p className="text-gray-600">Track and manage your expenses</p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
