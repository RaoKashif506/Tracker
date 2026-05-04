import axios, { AxiosInstance } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Auth API
export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { fullName: string; email: string; password: string }) => {
      const response = await api.post('/auth/signup', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.post('/auth/login', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      queryClient.removeQueries();
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.data.user;
    },
    retry: false,
  });
}

// Categories API
export function useCategories(type?: 'expense' | 'income') {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      const params = type ? { type } : {};
      const response = await api.get('/categories', { params });
      return response.data.data.categories;
    },
  });
}

// Transactions API
export interface TransactionFilters {
  type?: 'expense' | 'income';
  category?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const response = await api.get('/transactions', {
        params: filters,
      });
      return response.data.data;
    },
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const response = await api.get(`/transactions/${id}`);
      return response.data.data.transaction;
    },
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      type: 'expense' | 'income';
      amount: number;
      category: string;
      description: string;
      notes?: string;
      date: Date;
    }) => {
      const response = await api.post('/transactions', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        type?: 'expense' | 'income';
        amount?: number;
        category?: string;
        description?: string;
        notes?: string;
        date?: Date;
      };
    }) => {
      const response = await api.put(`/transactions/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Dashboard API
export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const response = await api.get('/dashboard/summary');
      return response.data.data.summary;
    },
  });
}

export function useDashboardChartData(range: '7d' | '30d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['dashboard', 'chart', range],
    queryFn: async () => {
      const response = await api.get('/dashboard/chart-data', {
        params: { range },
      });
      return response.data.data.chartData;
    },
  });
}
