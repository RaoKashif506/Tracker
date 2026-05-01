import { TransactionForm } from '@/components/transactions/TransactionForm';

export default function AddExpensePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Transaction</h1>
        <p className="text-gray-600 mt-1">Record a new income or expense</p>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-6 border border-border">
        <div className="max-w-2xl">
          <TransactionForm />
        </div>
      </div>
    </div>
  );
}
