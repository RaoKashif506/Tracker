'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg p-4 sm:p-6 border border-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.fullName}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Account Information</h3>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Currently read-only. Contact support to change.</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Currently read-only. Contact support to change.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-border">
            <h3 className="font-semibold text-gray-900 mb-4">Session Management</h3>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full"
              variant="destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-2">Pro Tip</p>
            <p>Use the bottom navigation to quickly access Dashboard, Add Transactions, and Profile settings on mobile devices.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
