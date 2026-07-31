import { api } from './api';
import type { Report, PaginatedResponse } from '../types';

export interface CreateReportPayload {
  bai_dang_bi_bao_cao_id?: string;
  nguoi_dung_bi_bao_cao_id?: string;
  ly_do_bao_cao: string;
  mo_ta_chi_tiet?: string;
  minh_chung?: string;
  danh_sach_minh_chung?: Array<{
    duong_dan_tep: string;
    ten_tep?: string;
    loai_tep?: string;
    kich_thuoc_tep?: number;
    thu_tu_hien_thi?: number;
  }>;
  loai_bao_cao?: string;
}

export interface ProcessReportPayload {
  trang_thai_xu_ly: 'DA_XU_LY' | 'TU_CHOI';
  loai_bien_phap?: 'KHONG_VI_PHAM' | 'AN_BAI_DANG' | 'KHOA_TAI_KHOAN' | 'KHOI_PHUC_BAI_DANG';
  noi_dung_xu_ly?: string;
  ghi_chu_xu_ly?: string;
}

export const reportsService = {
  /** Gửi báo cáo vi phạm về bài đăng hoặc người dùng */
  async createReport(payload: CreateReportPayload): Promise<Report> {
    const res = await api.post<Report>('/reports', payload);
    return res.data;
  },

  /** Lấy danh sách tất cả báo cáo vi phạm (Dành cho Quản trị viên) */
  async getAllReportsAdmin(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Report>> {
    const res = await api.get<PaginatedResponse<Report>>('/reports', { params });
    return res.data;
  },

  /** Lấy thông tin chi tiết báo cáo vi phạm theo ID (Dành cho Quản trị viên) */
  async getReportByIdAdmin(id: string): Promise<Report> {
    const res = await api.get<Report>(`/reports/${id}`);
    return res.data;
  },

  /** Xử lý báo cáo vi phạm và áp dụng biện pháp (Dành cho Quản trị viên) */
  async processReportAdmin(id: string, payload: ProcessReportPayload): Promise<Report> {
    const res = await api.post<Report>(`/reports/${id}/action`, payload);
    return res.data;
  },
};
