'use client';

import { useTransactions, useDeleteTransaction, useCategories } from '@/lib/api-client';
import { useState, useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import clsx from 'clsx';

interface TransactionsListProps {
  initialFilters?: {
    type?: 'expense' | 'income';
  };
}

type TransactionItem = {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category?: { name?: string } | null;
  description: string;
  notes?: string | null;
  date: string | Date;
};

export function TransactionsList({ initialFilters = {} }: TransactionsListProps) {
  const [type, setType] = useState<'expense' | 'income' | undefined>(initialFilters.type);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  const { data: transactionData, isLoading } = useTransactions({
    type,
    category: category || undefined,
    search: search || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
    page,
    limit: 20,
  });

  const { data: expenseCategories } = useCategories('expense');
  const { data: incomeCategories } = useCategories('income');
  const categories = useMemo(() => {
    if (type === 'expense') return expenseCategories || [];
    if (type === 'income') return incomeCategories || [];
    return [...(expenseCategories || []), ...(incomeCategories || [])];
  }, [expenseCategories, incomeCategories, type]);

  const { mutate: deleteTransaction } = useDeleteTransaction();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      setDeletingId(id);
      deleteTransaction(id, {
        onSuccess: () => {
          setDeletingId(null);
        },
        onError: () => {
          setDeletingId(null);
        },
      });
    }
  };

  const transactions = transactionData?.transactions || [];
  const pagination = transactionData?.pagination;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-4 sm:p-6 border border-border space-y-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-2">Type</label>
            <div className="inline-flex rounded-full border border-border bg-slate-100 p-1">
              {[
                { value: undefined, label: 'All' },
                { value: 'expense', label: 'Expense' },
                { value: 'income', label: 'Income' },
              ].map((option) => {
                const isSelected = option.value === type;
                return (
                  <button
                    key={option.label}
                    type="button"
                    className={clsx(
                      'rounded-full px-4 py-2 text-sm font-medium transition',
                      isSelected
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:bg-white'
                    )}
                    onClick={() => {
                      setType(option.value as 'expense' | 'income' | undefined);
                      setPage(1);
                      setCategory('');
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-border rounded-md"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium mb-2">
              Search
            </label>
            <Input
              id="search"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search transactions..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label htmlFor="from" className="block text-sm font-medium mb-2">
                From
              </label>
              <Input
                id="from"
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div>
              <label htmlFor="to" className="block text-sm font-medium mb-2">
                To
              </label>
              <Input
                id="to"
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <Spinner />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No transactions found</p>
            <Link href="/add-expense">
              <Button>Add Your First Transaction</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="p-4 sm:p-6 space-y-3">
              {transactions.map((transaction: TransactionItem) => (
                <div
                  key={transaction.id}
                  className="rounded-lg border border-border bg-gray-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'expense'
                            ? 'bg-red-100'
                            : 'bg-emerald-100'
                        }`}
                      >
                        {transaction.type === 'expense' ? (
                          <ArrowDownLeft className="w-5 h-5 text-red-600" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <Badge variant="secondary" className="text-xs">
                        {transaction.category?.name || 'Uncategorized'}
                      </Badge>
                      <p
                        className={`text-sm font-semibold ${
                          transaction.type === 'expense'
                            ? 'text-red-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {transaction.type === 'expense' ? '-' : '+'}$
                        {transaction.amount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <div className="flex items-center gap-2">
                        <Link href={`/expenses/${transaction.id}`}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(transaction.id)}
                          disabled={deletingId === transaction.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {transaction.notes && (
                    <p className="text-xs text-gray-500 mt-2">{transaction.notes}</p>
                  )}
                </div>
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-border flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                    disabled={page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
