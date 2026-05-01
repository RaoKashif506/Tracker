'use client';

import { SpendingCharts } from '@/components/dashboard/SpendingCharts';
import { useDashboardSummary } from '@/lib/api-client';
import { Spinner } from '@/components/ui/spinner';
import { TrendingDown, TrendingUp } from 'lucide-react';

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AnalyticsPage() {
  const { data: summary, isLoading } = useDashboardSummary();
  const monthlyChange = summary?.monthlyChange ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Visualize your spending patterns over time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full h-28 flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-border p-4 sm:p-5">
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-2xl font-semibold text-emerald-600 mt-1">
                ${formatCurrency(summary?.totalIncome || 0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">All time</p>
            </div>
            <div className="bg-white rounded-lg border border-border p-4 sm:p-5">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-semibold text-red-500 mt-1">
                ${formatCurrency(summary?.totalExpenses || 0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">All time</p>
            </div>
            <div className="bg-white rounded-lg border border-border p-4 sm:p-5">
              <p className="text-sm text-gray-500">Monthly Change</p>
              <div className="flex items-center gap-2 mt-1">
                {monthlyChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                )}
                <p className={`text-2xl font-semibold ${monthlyChange >= 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {Math.abs(monthlyChange)}%
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-1">vs last month</p>
            </div>
          </>
        )}
      </div>

      <SpendingCharts />
    </div>
  );
}
