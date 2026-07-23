import { api } from './api';
import type { Proposal, Transaction, PaginatedResponse } from '../types';

export interface CreateProposalPayload {
  bai_dang_id: string;
  so_luong_yeu_cau: number;
  loi_nhan?: string;
  tai_san_doi_ung?: string;
  tien_doi_ung?: number;
}

export const proposalsService = {
  async createProposal(payload: CreateProposalPayload): Promise<Proposal> {
    const res = await api.post<Proposal>('/proposals', payload);
    return res.data;
  },

  async getSentProposals(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Proposal>> {
    const res = await api.get<PaginatedResponse<Proposal>>('/proposals/sent', { params });
    return res.data;
  },

  async getReceivedProposals(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Proposal>> {
    const res = await api.get<PaginatedResponse<Proposal>>('/proposals/received', { params });
    return res.data;
  },

  async acceptProposal(proposalId: string): Promise<{ success: boolean; message: string; giao_dich: Transaction }> {
    const res = await api.put<{ success: boolean; message: string; giao_dich: Transaction }>(`/proposals/${proposalId}/accept`);
    return res.data;
  },

  async rejectProposal(proposalId: string, ly_do_tu_choi?: string): Promise<Proposal> {
    const res = await api.put<Proposal>(`/proposals/${proposalId}/reject`, { ly_do_tu_choi });
    return res.data;
  },
};
