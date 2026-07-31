import { api } from './api';
import type { Review } from '../types';

export interface CreateReviewPayload {
  giao_dich_id: string;
  diem_sao: number;
  nhan_xet?: string;
}

export const reviewsService = {
  /** Tạo đánh giá và nhận xét cho một giao dịch đã hoàn tất */
  async createReview(payload: CreateReviewPayload): Promise<{ success: boolean; message: string; danh_gia: Review }> {
    const res = await api.post<{ success: boolean; message: string; danh_gia: Review }>('/reviews', payload);
    return res.data;
  },

  /** Lấy danh sách các đánh giá của một người dùng theo ID */
  async getUserReviews(userId: string): Promise<Review[]> {
    const res = await api.get<Review[]>(`/reviews/user/${userId}`);
    return res.data;
  },
};
