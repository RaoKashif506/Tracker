'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { BarChart3, Wallet, PlusCircle, Receipt, LineChart, User } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/add-expense', label: 'Add Transaction', icon: PlusCircle },
  { href: '/expenses', label: 'Transactions', icon: Receipt },
  { href: '/budgets', label: 'Budgets', icon: Wallet },
  { href: '/analytics', label: 'Analytics', icon: LineChart },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 border-r border-border bg-white">
      <div className="flex h-full w-full flex-col">
        <div className="px-6 py-6">
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            Smart Expense
            <br />
            Tracker
          </h1>
          <p className="text-sm text-gray-500 mt-2">Manage your finances smartly</p>
        </div>

        <nav className="px-4 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
