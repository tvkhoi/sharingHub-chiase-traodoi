import { api } from './api';
import type { NegotiationMessage } from '../types';

export const negotiationService = {
  /** Lấy danh sách lịch sử tin nhắn thương lượng theo mã đề xuất */
  async getMessages(proposalId: string): Promise<NegotiationMessage[]> {
    const res = await api.get<NegotiationMessage[]>(`/proposals/${proposalId}/messages`);
    return res.data;
  },

  /** Gửi tin nhắn thương lượng mới cho mã đề xuất tương ứng */
  async sendMessage(proposalId: string, noi_dung: string): Promise<NegotiationMessage> {
    const res = await api.post<NegotiationMessage>(`/proposals/${proposalId}/messages`, { noi_dung });
    return res.data;
  },
};
