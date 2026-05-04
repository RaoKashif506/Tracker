'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';

type ApiError = {
  response?: {
    data?: {
      error?: {
        message?: string;
        details?: Record<string, string>;
      };
    };
  };
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending, error } = useLogin();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    login(
      { email, password },
      {
        onSuccess: () => {
          router.push('/');
        },
        onError: (error: ApiError) => {
          if (error.response?.data?.error?.details) {
            setValidationErrors(error.response.data.error.details);
          }
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-100 text-red-800 rounded-md">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">
            {(error as ApiError)?.response?.data?.error?.message || 'Login failed'}
          </span>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={isPending}
        />
        {validationErrors.email && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isPending}
        />
        {validationErrors.password && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.password}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
