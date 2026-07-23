import { api } from './api';
import type { Transaction, PaginatedResponse } from '../types';

export const transactionsService = {
  async getTransactions(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Transaction>> {
    const res = await api.get<PaginatedResponse<Transaction>>('/transactions', { params });
    return res.data;
  },

  async getTransactionById(id: string): Promise<Transaction> {
    const res = await api.get<Transaction>(`/transactions/${id}`);
    return res.data;
  },

  async confirmTransaction(id: string): Promise<{ success: boolean; message: string; giao_dich: Transaction }> {
    const res = await api.put<{ success: boolean; message: string; giao_dich: Transaction }>(`/transactions/${id}/confirm`);
    return res.data;
  },

  async cancelTransaction(id: string, ly_do_huy?: string): Promise<Transaction> {
    const res = await api.put<Transaction>(`/transactions/${id}/cancel`, { ly_do_huy });
    return res.data;
  },
};
