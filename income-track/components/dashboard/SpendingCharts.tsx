'use client';

import { useDashboardChartData } from '@/lib/api-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

type Range = '7d' | '30d' | '90d';
type CategoryDatum = {
  name: string;
  value: number;
};

export function SpendingCharts() {
  const [range, setRange] = useState<Range>('30d');
  const { data: chartData, isLoading } = useDashboardChartData(range);
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!chartData) {
    return null;
  }

  const dailyData = chartData.dailySpending || [];
  const categoryData = (chartData.categoryBreakdown || []) as CategoryDatum[];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(['7d', '30d', '90d'] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              range === r
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg p-4 border border-border">
        <h3 className="font-semibold text-gray-900 mb-4">Daily Spending Trend</h3>
        {dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => `$${Number(value).toFixed(2)}`}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No spending data</p>
        )}
      </div>

      <div className="bg-white rounded-lg p-4 border border-border">
        <h3 className="font-semibold text-gray-900 mb-4">Expense By Category</h3>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 70 : 100}
                label={!isMobile}
              >
                {categoryData.map((entry: CategoryDatum, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `$${Number(value).toFixed(2)}`}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No category data</p>
        )}
      </div>
    </div>
  );
}
