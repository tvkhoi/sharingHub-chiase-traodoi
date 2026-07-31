import { api } from './api';
import type { Proposal, Transaction, PaginatedResponse } from '../types';

export interface CreateProposalPayload {
  bai_dang_id: string;
  so_luong_yeu_cau: number;
  loi_nhan?: string;
  tai_san_doi_ung: string;
  tien_doi_ung?: number;
}

export const proposalsService = {
  /** Tạo một đề xuất trao đổi/chia sẻ tài sản mới */
  async createProposal(payload: CreateProposalPayload): Promise<Proposal> {
    const res = await api.post<Proposal>('/proposals', payload);
    return res.data;
  },

  /** Lấy danh sách các đề xuất mà mình đã gửi đi */
  async getSentProposals(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Proposal>> {
    const res = await api.get<PaginatedResponse<Proposal>>('/proposals/sent', { params });
    return res.data;
  },

  /** Lấy danh sách các đề xuất mà mình nhận được từ người khác */
  async getReceivedProposals(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Proposal>> {
    const res = await api.get<PaginatedResponse<Proposal>>('/proposals/received', { params });
    return res.data;
  },

  /** Chấp nhận một đề xuất (Hệ thống sẽ tự động khởi tạo giao dịch) */
  async acceptProposal(proposalId: string): Promise<{ success: boolean; message: string; giao_dich: Transaction }> {
    const res = await api.put<{ success: boolean; message: string; giao_dich: Transaction }>(`/proposals/${proposalId}/accept`);
    return res.data;
  },

  /** Từ chối một đề xuất trao đổi */
  async rejectProposal(proposalId: string, ly_do_tu_choi?: string): Promise<Proposal> {
    const res = await api.put<Proposal>(`/proposals/${proposalId}/reject`, { ly_do_tu_choi });
    return res.data;
  },
};
