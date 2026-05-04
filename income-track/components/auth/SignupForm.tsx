'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignup } from '@/lib/api-client';
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

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { mutate: signup, isPending, error } = useSignup();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (password !== confirmPassword) {
      setValidationErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    signup(
      { fullName, email, password },
      {
        onSuccess: () => {
          router.push('/');
        },
        onError: (error: ApiError) => {
          if (error.response?.data?.error?.details) {
            setValidationErrors(error.response.data.error.details);
          } else if (error.response?.data?.error?.message) {
            setValidationErrors({
              submit: error.response.data.error.message,
            });
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
            {validationErrors.submit || (error as ApiError)?.response?.data?.error?.message || 'Signup failed'}
          </span>
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-1">
          Full Name
        </label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          disabled={isPending}
        />
        {validationErrors.fullName && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.fullName}</p>
        )}
      </div>

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

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isPending}
        />
        {validationErrors.confirmPassword && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.confirmPassword}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  );
}
