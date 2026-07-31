import { api } from './api';
import type { Transaction, PaginatedResponse } from '../types';

export const transactionsService = {
  /** Lấy danh sách tất cả các giao dịch của người dùng hiện tại */
  async getTransactions(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Transaction>> {
    const res = await api.get<PaginatedResponse<Transaction>>('/transactions', { params });
    return res.data;
  },

  /** Lấy thông tin chi tiết của một giao dịch theo ID */
  async getTransactionById(id: string): Promise<Transaction> {
    const res = await api.get<Transaction>(`/transactions/${id}`);
    return res.data;
  },

  /** Xác nhận hoàn thành giao dịch từ phía người dùng */
  async confirmTransaction(id: string): Promise<{ success: boolean; message: string; giao_dich: Transaction }> {
    const res = await api.put<{ success: boolean; message: string; giao_dich: Transaction }>(`/transactions/${id}/confirm`);
    return res.data;
  },

  /** Hủy bỏ giao dịch và ghi nhận lý do hủy */
  async cancelTransaction(id: string, ly_do_huy?: string): Promise<Transaction> {
    const res = await api.put<Transaction>(`/transactions/${id}/cancel`, { ly_do_huy });
    return res.data;
  },
};
