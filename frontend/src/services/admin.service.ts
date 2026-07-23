import { api } from './api';
import type { User, Asset, AssetCategory } from '../types';

export interface SystemStats {
  users: { total: number; active: number; locked: number };
  assets: { total: number; available: number };
  transactions: { total: number; completed: number };
  reports: { total: number; pending: number };
}

export const adminService = {
  // 1. Get System Statistics
  getSystemStats: async (): Promise<SystemStats> => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  // 2. Get Users List
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    vai_tro?: string;
    trang_thai?: string;
  }): Promise<{ items: User[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  // 3. Update User Status (Lock / Unlock)
  updateUserStatus: async (userId: string, trang_thai: 'HOAT_DONG' | 'BI_KHOA'): Promise<User> => {
    const res = await api.patch(`/admin/users/${userId}/status`, { trang_thai });
    return res.data;
  },

  // 4. Get Assets List for Moderation
  getAssetsAdmin: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    trang_thai?: string;
  }): Promise<{ items: Asset[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
    const res = await api.get('/admin/assets', { params });
    return res.data;
  },

  // 5. Update Asset Status (Lock / Unlock)
  updateAssetStatusAdmin: async (
    assetId: string,
    trang_thai: 'KHA_DUNG' | 'DA_KHOA_SO' | 'DA_KET_THUC',
  ): Promise<Asset> => {
    const res = await api.patch(`/admin/assets/${assetId}/status`, { trang_thai });
    return res.data;
  },

  // 6. Category Management
  createCategory: async (data: { ten_danh_muc: string; mo_ta?: string; bieu_tuong?: string }): Promise<AssetCategory> => {
    const res = await api.post('/admin/categories', data);
    return res.data;
  },

  updateCategory: async (
    id: string,
    data: { ten_danh_muc?: string; mo_ta?: string; bieu_tuong?: string; trang_thai?: string },
  ): Promise<AssetCategory> => {
    const res = await api.put(`/admin/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/admin/categories/${id}`);
  },
};
