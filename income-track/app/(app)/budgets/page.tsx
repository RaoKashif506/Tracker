'use client';

import { useCategories, useTransactions } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CircleDot } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'smart-expense-budgets';

type BudgetTransaction = {
  amount: number;
  category?: { id: string } | null;
};

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function loadBudgets(): Record<string, number> {
  if (typeof window === 'undefined') {
    return {};
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {};
  }

  try {
    const parsed = JSON.parse(stored) as Record<string, number>;
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load budgets', error);
  }

  return {};
}

export default function BudgetsPage() {
  const startOfMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }, []);
  const endOfPeriod = useMemo(() => new Date().toISOString(), []);

  const { data: categories, isLoading: isLoadingCategories } = useCategories('expense');
  const { data: transactionData, isLoading: isLoadingTransactions } = useTransactions({
    type: 'expense',
    from: startOfMonth,
    to: endOfPeriod,
    limit: 1000,
    page: 1,
  });

  const [budgets, setBudgets] = useState<Record<string, number>>(() => loadBudgets());
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  }, [budgets]);

  const totals = useMemo(() => {
    const map: Record<string, number> = {};
    const rows = (transactionData?.transactions || []) as BudgetTransaction[];
    rows.forEach((transaction) => {
      const categoryId = transaction.category?.id;
      if (!categoryId) return;
      map[categoryId] = (map[categoryId] || 0) + transaction.amount;
    });
    return map;
  }, [transactionData]);

  const isLoading = isLoadingCategories || isLoadingTransactions;
  const expenseCategories = categories || [];

  // Calculate total budget and spent
  const totalBudget = Object.values(budgets).reduce((sum, v) => sum + v, 0);
  const totalSpent = Object.entries(budgets).reduce((sum, [catId, budget]) => sum + (totals[catId] || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const progress = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Budget Overview Card */}
      <div className="bg-white rounded-xl border border-border p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <CircleDot className="w-5 h-5" />
            Budget Overview
          </div>
          <Button
            className="rounded-lg px-4 py-2 font-semibold text-base"
            onClick={() => setIsAdding((prev) => !prev)}
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">+</span> Add Budget
            </span>
          </Button>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-base">Total Monthly Budget</span>
            <span className="font-bold text-lg">${formatCurrency(totalBudget)}</span>
          </div>
          <Progress value={progress} />
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Spent: ${formatCurrency(totalSpent)}</span>
            <span className="text-gray-600">Remaining: ${formatCurrency(Math.max(0, totalRemaining))}</span>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white rounded-lg border border-border p-4 sm:p-6">
          <h2 className="text-base font-semibold text-gray-900">Add New Budget</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={newCategoryId || undefined} onValueChange={setNewCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category: { id: string; name: string }) => (
                    <SelectItem key={category.id} value={category.id} textValue={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Monthly Limit</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            {addError && <p className="text-xs text-red-600">{addError}</p>}

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  setAddError(null);
                  const amountValue = Number(newAmount);
                  if (!newCategoryId) {
                    setAddError('Select a category');
                    return;
                  }
                  if (!Number.isFinite(amountValue) || amountValue <= 0) {
                    setAddError('Enter a valid amount');
                    return;
                  }
                  setBudgets((prev) => ({
                    ...prev,
                    [newCategoryId]: amountValue,
                  }));
                  setNewCategoryId('');
                  setNewAmount('');
                  setIsAdding(false);
                }}
              >
                Add Budget
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setNewCategoryId('');
                  setNewAmount('');
                  setAddError(null);
                  setIsAdding(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <Spinner />
          </div>
        ) : expenseCategories.length === 0 ? (
          <div className="bg-white rounded-lg border border-border p-6 text-sm text-gray-500">
            No expense categories found.
          </div>
        ) : (
          expenseCategories.map((category: { id: string; name: string; color?: string }) => {
            const spent = totals[category.id] || 0;
            const budget = budgets[category.id] || 0;
            const progress = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

            return (
              <div key={category.id} className="bg-white rounded-lg border border-border p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-xs text-gray-500">
                        {budget > 0
                          ? `${formatCurrency(spent)} of ${formatCurrency(budget)} spent`
                          : `${formatCurrency(spent)} spent`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={budget === 0 ? '' : budget}
                      onChange={(e) => {
                        const nextValue = Number(e.target.value);
                        setBudgets((prev) => ({
                          ...prev,
                          [category.id]: Number.isFinite(nextValue) ? nextValue : 0,
                        }));
                      }}
                      placeholder="Set budget"
                      className="w-28"
                    />
                  </div>
                </div>

                <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
