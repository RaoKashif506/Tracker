'use client';

import { useDashboardSummary } from '@/lib/api-client';
import { Spinner } from '@/components/ui/spinner';
import { Target } from 'lucide-react';

export function TopCategories() {
  const { data: summary, isLoading } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const categories = summary?.topCategories || [];

  return (
    <div className="bg-white rounded-lg border border-border p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Target className="h-4 w-4 text-gray-700" />
        </div>
        <h3 className="font-semibold text-gray-900">Top Spending Categories</h3>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-gray-500">No spending data yet.</p>
      ) : (
        <div className="space-y-3">
          {categories.map((cat, index) => (
            <div
              key={`${cat.name}-${index}`}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-gray-900 text-white text-xs font-semibold flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  ${cat.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500">{cat.count ?? 0} transactions</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
