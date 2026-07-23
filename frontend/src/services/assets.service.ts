import { api } from './api';
import type { Asset, AssetCategory, PaginatedResponse } from '../types';

export interface CreateAssetPayload {
  danh_muc_id: string;
  ten_tai_san: string;
  mo_ta_hien_trang: string;
  so_luong_tong: number;
  hinh_thuc_chia_se: 'CHO_TANG' | 'TRAO_DOI';
  hinh_thuc_trao_doi?: 'TAI_SAN' | 'TIEN';
  dia_diem: string;
  hinh_anh: string[];
}

export interface QueryAssetParams {
  danh_muc_id?: string;
  hinh_thuc_chia_se?: string;
  trang_thai?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const assetsService = {
  async getCategories(): Promise<AssetCategory[]> {
    const res = await api.get<AssetCategory[]>('/categories');
    return res.data;
  },

  async getAssets(params?: QueryAssetParams): Promise<PaginatedResponse<Asset>> {
    const res = await api.get<PaginatedResponse<Asset>>('/assets', { params });
    return res.data;
  },

  async getAssetById(id: string): Promise<Asset> {
    const res = await api.get<Asset>(`/assets/${id}`);
    return res.data;
  },

  async getMyAssets(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Asset>> {
    const res = await api.get<PaginatedResponse<Asset>>('/assets/my', { params });
    return res.data;
  },

  async createAsset(payload: CreateAssetPayload): Promise<Asset> {
    const res = await api.post<Asset>('/assets', payload);
    return res.data;
  },

  async updateAsset(id: string, payload: Partial<CreateAssetPayload>): Promise<Asset> {
    const res = await api.put<Asset>(`/assets/${id}`, payload);
    return res.data;
  },

  async deleteAsset(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete<{ success: boolean; message: string }>(`/assets/${id}`);
    return res.data;
  },
};
