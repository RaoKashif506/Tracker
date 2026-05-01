'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useCurrentUser, useLogout } from '@/lib/api-client';

interface User {
  id: string;
  fullName: string;
  email: string;
}

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  isError: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, isError } = useCurrentUser();
  const { mutateAsync: logout } = useLogout();

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isError,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
