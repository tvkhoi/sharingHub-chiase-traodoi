import { api } from './api';
import type { NegotiationMessage } from '../types';

export const negotiationService = {
  async getMessages(proposalId: string): Promise<NegotiationMessage[]> {
    const res = await api.get<NegotiationMessage[]>(`/proposals/${proposalId}/messages`);
    return res.data;
  },

  async sendMessage(proposalId: string, noi_dung: string): Promise<NegotiationMessage> {
    const res = await api.post<NegotiationMessage>(`/proposals/${proposalId}/messages`, { noi_dung });
    return res.data;
  },
};
