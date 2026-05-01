'use client';

import { useMemo, useState } from 'react';
import { useDashboardSummary, useTransactions } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Download, Share2, Wallet, TrendingDown, TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { TopCategories } from '@/components/dashboard/TopCategories';

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString();
}

type TransactionRow = {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category?: { name?: string } | null;
  description: string;
  notes?: string | null;
  date: string | Date;
};

type TransactionsResponse = {
  data?: {
    transactions?: TransactionRow[];
  };
  error?: { message?: string };
};

function buildCsv(rows: TransactionRow[]) {
  const headers = ['Date', 'Description', 'Type', 'Category', 'Amount', 'Notes'];
  const lines = rows.map((row) => [
    formatDate(row.date),
    row.description,
    row.type,
    row.category?.name || '',
    row.amount,
    row.notes || '',
  ]);

  const escape = (value: string | number) => {
    const str = String(value);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  return [headers, ...lines]
    .map((row) => row.map(escape).join(','))
    .join('\n');
}

export function DashboardOverview() {
  const { data: summary, isLoading: isSummaryLoading } = useDashboardSummary();
  const { data: transactionData, isLoading: isTransactionsLoading } = useTransactions({ limit: 5, page: 1 });
  const [isExporting, setIsExporting] = useState(false);
  const [shareLabel, setShareLabel] = useState('Share');
  const [exportError, setExportError] = useState<string | null>(null);

  const transactions = transactionData?.transactions || [];
  const monthLabel = useMemo(
    () =>
      new Date().toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    []
  );

  const monthlyBalance = (summary?.currentMonthIncome || 0) - (summary?.currentMonthExpenses || 0);

  const handleExport = async () => {
    const defaultExportError = 'An error occurred while fetching transactions';
    setIsExporting(true);
    setExportError(null);
    try {
      const response = await fetch('/api/transactions?limit=1000&page=1');
      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as TransactionsResponse | null;
        setExportError(errorPayload?.error?.message || defaultExportError);
        return;
      }
      const payload = (await response.json()) as TransactionsResponse;
      const rows = payload?.data?.transactions || [];
      if (rows.length === 0) {
        setExportError('No transactions to export');
        return;
      }
      const csv = buildCsv(rows);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed', error);
      setExportError(defaultExportError);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: 'Smart Expense Tracker',
        text: 'Dashboard overview',
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareLabel('Copied');
        setTimeout(() => setShareLabel('Share'), 2000);
      }
    } catch (error) {
      console.error('Share failed', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview for {monthLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
            {shareLabel}
          </Button>
        </div>
        {exportError && (
          <p className="text-xs text-red-600">{exportError}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isSummaryLoading ? (
          <div className="col-span-full h-32 flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-border p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Monthly Balance</p>
                  <p className="text-2xl font-semibold text-emerald-600 mt-1">
                    ${formatCurrency(monthlyBalance)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Income - Expenses</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-border p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Income</p>
                  <p className="text-2xl font-semibold text-emerald-600 mt-1">
                    ${formatCurrency(summary?.currentMonthIncome || 0)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">This month</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-border p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Expenses</p>
                  <p className="text-2xl font-semibold text-red-500 mt-1">
                    ${formatCurrency(summary?.currentMonthExpenses || 0)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">This month</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCategories />

        <div className="bg-white rounded-lg border border-border p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
            <Link href="/expenses" className="text-sm text-gray-500 hover:text-gray-900">
              View all
            </Link>
          </div>

          {isTransactionsLoading ? (
            <div className="h-48 flex items-center justify-center">
              <Spinner />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-sm text-gray-500">No transactions yet.</div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction: TransactionRow) => (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-2 rounded-lg bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'expense' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        {transaction.type === 'expense' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${transaction.type === 'expense' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {transaction.type === 'expense' ? '-' : '+'}${formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.category?.name || 'Uncategorized'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
