import { TransactionsList } from '@/components/transactions/TransactionsList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ExpensesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">View and manage all your transactions</p>
        </div>
        <Link href="/add-expense">
          <Button>Add Transaction</Button>
        </Link>
      </div>

      <TransactionsList />
    </div>
  );
}
