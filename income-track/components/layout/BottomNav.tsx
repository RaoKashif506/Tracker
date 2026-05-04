'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Plus, User, Wallet, LineChart, Receipt } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/add-expense', label: 'Add', icon: Plus },
  { href: '/expenses', label: 'Transactions', icon: Receipt },
  { href: '/budgets', label: 'Budgets', icon: Wallet },
  { href: '/analytics', label: 'Analytics', icon: LineChart },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border lg:hidden">
      <div className="flex items-center gap-1 overflow-x-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center py-3 px-2 text-[10px] font-medium transition-colors min-w-20 shrink-0',
                isActive
                  ? 'text-blue-600 border-t-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
