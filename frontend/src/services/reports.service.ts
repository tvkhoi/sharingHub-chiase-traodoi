import { api } from './api';
import type { Report } from '../types';

export interface CreateReportPayload {
  bai_dang_bi_bao_cao_id?: string;
  nguoi_dung_bi_bao_cao_id?: string;
  ly_do_bao_cao: string;
  mo_ta_chi_tiet?: string;
  minh_chung?: string;
}

export interface ProcessReportPayload {
  trang_thai_xu_ly: 'DA_XU_LY' | 'TU_CHOI';
  loai_bien_phap?: 'KHONG_VI_PHAM' | 'AN_BAI_DANG' | 'KHOA_TAI_KHOAN';
  noi_dung_xu_ly?: string;
}

export const reportsService = {
  async createReport(payload: CreateReportPayload): Promise<Report> {
    const res = await api.post<Report>('/reports', payload);
    return res.data;
  },

  async getAllReportsAdmin(): Promise<Report[]> {
    const res = await api.get<Report[]>('/reports');
    return res.data;
  },

  async getReportByIdAdmin(id: string): Promise<Report> {
    const res = await api.get<Report>(`/reports/${id}`);
    return res.data;
  },

  async processReportAdmin(id: string, payload: ProcessReportPayload): Promise<Report> {
    const res = await api.post<Report>(`/reports/${id}/action`, payload);
    return res.data;
  },
};
