import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User as UserIcon, Phone, MapPin, Layers, Eye, EyeOff, KeyRound } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [matKhau, setMatKhau] = useState<string>('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [hoTen, setHoTen] = useState<string>('');
  const [soDienThoai, setSoDienThoai] = useState<string>('');
  const [diaChi, setDiaChi] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !matKhau || !xacNhanMatKhau || !hoTen || !soDienThoai) {
      toast.error('Vui lòng điền các trường thông tin bắt buộc (*)');
      return;
    }

    // Validate Email format (5e.2)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Email không đúng định dạng hợp lệ (Ví dụ: name@example.com)');
      return;
    }

    // Validate Phone number format (5e.2)
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(soDienThoai.trim())) {
      toast.error('Số điện thoại không đúng định dạng hợp lệ (Ví dụ: 0912345678)');
      return;
    }

    if (matKhau.length < 6) {
      toast.error('Mật khẩu phải có tối thiểu 6 ký tự');
      return;
    }

    if (matKhau !== xacNhanMatKhau) {
      toast.error('Mật khẩu và xác nhận mật khẩu không trùng khớp. Vui lòng nhập lại.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        email,
        mat_khau: matKhau,
        xac_nhan_mat_khau: xacNhanMatKhau,
        ho_ten: hoTen,
        so_dien_thoai: soDienThoai,
        dia_chi: diaChi || undefined,
      });

      login(res.access_token, res.user);
      toast.success('Đăng ký tài khoản thành công!');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Hệ thống không thể tạo tài khoản do lỗi xử lý. Vui lòng thử lại sau!';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="glass-panel max-w-lg w-full p-5 sm:p-8 rounded-3xl border border-color shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 mx-auto mb-4">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-primary">Tạo Tài Khoản Mới</h2>
          <p className="text-sm text-secondary mt-1">Tham gia cộng đồng chia sẻ & trao đổi tài sản ShareHub</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Họ và tên *</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Nhập họ tên của bạn..."
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
                className="form-input pl-11"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-11"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
                <input
                  type="tel"
                  placeholder="0912345678"
                  value={soDienThoai}
                  onChange={(e) => setSoDienThoai(e.target.value)}
                  className="form-input pl-11"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Mật khẩu *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự..."
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

            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu *</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu..."
                  value={xacNhanMatKhau}
                  onChange={(e) => setXacNhanMatKhau(e.target.value)}
                  className="form-input pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-muted hover:text-primary transition-colors"
                  title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Địa chỉ khu vực</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Ví dụ: Quận 5, TP.HCM..."
                value={diaChi}
                onChange={(e) => setDiaChi(e.target.value)}
                className="form-input pl-11"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-emerald w-full py-3 text-base font-semibold mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tạo tài khoản...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Hoàn Tất Đăng Ký
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-secondary">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-brand-emerald hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};
