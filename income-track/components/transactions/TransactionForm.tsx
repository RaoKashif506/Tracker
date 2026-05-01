'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCategories, useCreateTransaction, useUpdateTransaction, useTransaction } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

interface TransactionFormProps {
  transactionId?: string;
  isEdit?: boolean;
}

type TransactionFormValues = {
  type: 'expense' | 'income';
  amount: string;
  categoryId: string;
  description: string;
  notes: string;
  date: string;
};

type TransactionData = {
  id?: string;
  type: 'expense' | 'income';
  amount: number;
  category: { id: string };
  description: string;
  notes?: string | null;
  date: string | Date;
};

type ApiError = {
  response?: {
    data?: {
      error?: {
        details?: Record<string, string>;
      };
    };
  };
};

type TransactionPayload = {
  type: 'expense' | 'income';
  amount: number;
  category: string;
  description: string;
  notes?: string;
  date: Date;
};

function getInitialValues(transaction: TransactionData | undefined, isEdit: boolean): TransactionFormValues {
  if (isEdit && transaction) {
    return {
      type: transaction.type,
      amount: transaction.amount.toString(),
      categoryId: transaction.category.id,
      description: transaction.description,
      notes: transaction.notes || '',
      date: new Date(transaction.date).toISOString().split('T')[0],
    };
  }

  return {
    type: 'expense',
    amount: '',
    categoryId: '',
    description: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  };
}

export function TransactionForm({ transactionId, isEdit = false }: TransactionFormProps) {
  const { data: transaction, isLoading: isLoadingTransaction } = useTransaction(transactionId || '');
  const initialValues = React.useMemo(() => getInitialValues(transaction, isEdit), [transaction, isEdit]);

  if (isEdit && isLoadingTransaction) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <TransactionFormFields
      key={isEdit ? transaction?.id ?? transactionId ?? 'loading' : 'new'}
      initialValues={initialValues}
      transactionId={transactionId}
      isEdit={isEdit}
    />
  );
}

function TransactionFormFields({
  initialValues,
  transactionId,
  isEdit,
}: {
  initialValues: TransactionFormValues;
  transactionId?: string;
  isEdit: boolean;
}) {
  const router = useRouter();
  const [type, setType] = React.useState(initialValues.type);
  const [amount, setAmount] = React.useState(initialValues.amount);
  const [categoryId, setCategoryId] = React.useState(initialValues.categoryId);
  const [description, setDescription] = React.useState(initialValues.description);
  const [notes, setNotes] = React.useState(initialValues.notes);
  const [date, setDate] = React.useState(initialValues.date);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
  } = useCategories(type);
  const { mutate: createTransaction, isPending: isCreating } = useCreateTransaction();
  const { mutate: updateTransaction, isPending: isUpdating } = useUpdateTransaction();
  const isPending = isCreating || isUpdating;
  const categoryOptions = categories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const data: TransactionPayload = {
      type,
      amount: parseFloat(amount),
      category: categoryId,
      description,
      notes: notes || undefined,
      date: new Date(date),
    };

    if (isEdit && transactionId) {
      updateTransaction(
        { id: transactionId, data },
        {
          onSuccess: () => {
            router.push('/expenses');
          },
          onError: (error: ApiError) => {
            if (error.response?.data?.error?.details) {
              setValidationErrors(error.response.data.error.details);
            }
          },
        }
      );
    } else {
      createTransaction(data, {
        onSuccess: () => {
          router.push('/expenses');
        },
        onError: (error: ApiError) => {
          if (error.response?.data?.error?.details) {
            setValidationErrors(error.response.data.error.details);
          }
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as 'expense' | 'income');
              setCategoryId('');
            }}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-2">
            Amount
          </label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={isPending}
          />
          {validationErrors.amount && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.amount}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          Category
        </label>
        <Select value={categoryId || undefined} onValueChange={setCategoryId} disabled={isPending}>
          <SelectTrigger className="w-full" id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingCategories && (
              <SelectItem value="loading" disabled>
                Loading categories...
              </SelectItem>
            )}
            {!isLoadingCategories && isCategoriesError && (
              <SelectItem value="error" disabled>
                Failed to load categories
              </SelectItem>
            )}
            {!isLoadingCategories && !isCategoriesError && categoryOptions.length === 0 && (
              <SelectItem value="empty" disabled>
                No categories found
              </SelectItem>
            )}
            {categoryOptions.map((cat) => (
              <SelectItem key={cat.id} value={cat.id} textValue={cat.name}>
                <span className="inline-flex items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validationErrors.category && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.category}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you spend on?"
          disabled={isPending}
        />
        {validationErrors.description && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-2">
            Date
          </label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-2">
            Notes (Optional)
          </label>
          <Input
            id="notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional details"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1"
        >
          {isPending ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              {isEdit ? 'Updating...' : 'Adding...'}
            </>
          ) : isEdit ? (
            'Update Transaction'
          ) : (
            'Add Transaction'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
