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
  otp: string;
}

export interface LoginDto {
  tai_khoan: string;
  mat_khau: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  mat_khau_moi: string;
  xac_nhan_mat_khau_moi?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export const authService = {
  async sendOtp(email: string): Promise<{ message: string; otpSimulated?: string }> {
    const res = await api.post('/auth/send-otp', { email });
    return res.data;
  },

  async forgotPasswordSendOtp(email: string): Promise<{ message: string; otpDev?: string }> {
    const res = await api.post('/auth/forgot-password/send-otp', { email });
    return res.data;
  },

  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    const res = await api.post('/auth/forgot-password/reset', data);
    return res.data;
  },

  async verifyOtp(email: string, otp: string): Promise<{ message: string; verified: boolean }> {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

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

  async getUserProfile(userId: string): Promise<User> {
    const res = await api.get(`/users/profile/${userId}`);
    return res.data;
  },
};
