import axios from 'axios';
import { socketService } from './socket.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Trình đánh chặn yêu cầu (Request Interceptor): Đính kèm JWT Token từ localStorage nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Trình đánh chặn phản hồi (Response Interceptor): Xử lý lỗi 401 Unauthorized toàn hệ thống
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Xóa token và thông tin người dùng khi bị 401 nếu chưa ở trang đăng nhập
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        socketService.disconnect();
      }
    }
    return Promise.reject(error);
  }
);
