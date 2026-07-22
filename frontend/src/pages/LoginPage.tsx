import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, Layers, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [taiKhoan, setTaiKhoan] = useState<string>('');
  const [matKhau, setMatKhau] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taiKhoan || !matKhau) {
      toast.error('Vui lòng nhập đầy đủ tài khoản và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login({ tai_khoan: taiKhoan, mat_khau: matKhau });
      login(res.access_token, res.user);
      toast.success(`Chào mừng ${res.user.ho_so?.ho_ten || 'bạn'} trở lại!`);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại. Kiểm tra lại thông tin!';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="glass-panel max-w-md w-full p-5 sm:p-8 rounded-3xl border border-color shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-4">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-primary">Đăng Nhập Tài Khoản</h2>
          <p className="text-sm text-secondary mt-1">Truy cập hệ thống chia sẻ & trao đổi tài sản ShareHub</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Email hoặc Số điện thoại</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Nhập email hoặc SĐT..."
                value={taiKhoan}
                onChange={(e) => setTaiKhoan(e.target.value)}
                className="form-input pl-11"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu..."
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                className="form-input pl-11 pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-muted hover:text-primary transition-colors"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 text-base font-semibold mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xử lý...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Đăng Nhập
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-secondary">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-brand-primary hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
