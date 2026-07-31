import { api } from './api';
import type { User } from '../types';

export interface RegisterDto {
  email: string;
  mat_khau: string;
  xac_nhan_mat_khau?: string;
  ho_ten: string;
  so_dien_thoai?: string;
  dia_chi?: string;
  mo_ta_ca_nhan?: string;
  anh_dai_dien?: string;
}

export interface LoginDto {
  tai_khoan: string;
  mat_khau: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export const authService = {
  /** Đăng ký tài khoản người dùng mới */
  async register(data: RegisterDto): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  /** Đăng nhập hệ thống */
  async login(data: LoginDto): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  /** Lấy thông tin cá nhân của người dùng hiện tại */
  async getMe(): Promise<User> {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  /** Cập nhật thông tin hồ sơ cá nhân của người dùng */
  async updateProfile(data: {
    ho_ten?: string;
    so_dien_thoai?: string;
    dia_chi?: string;
    mo_ta_ca_nhan?: string;
    anh_dai_dien?: string;
  }): Promise<User> {
    const res = await api.put('/users/profile', data);
    return res.data;
  },

  /** Lấy hồ sơ công khai của một người dùng theo ID */
  async getUserProfile(userId: string): Promise<User> {
    const res = await api.get(`/users/profile/${userId}`);
    return res.data;
  },
};
