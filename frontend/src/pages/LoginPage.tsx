import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, Layers, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [taiKhoan, setTaiKhoan] = useState<string>('');
  const [matKhau, setMatKhau] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Realtime Inline Validation State
  const [touched, setTouched] = useState<{ taiKhoan?: boolean; matKhau?: boolean }>({});
  const [errors, setErrors] = useState<{ taiKhoan?: string; matKhau?: string }>({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateField = (field: 'taiKhoan' | 'matKhau', value: string) => {
    let err = '';
    if (field === 'taiKhoan') {
      const val = value.trim();
      if (!val) {
        err = 'Vui lòng nhập Email hoặc Số điện thoại';
      } else if (val.includes('@')) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(val)) {
          err = 'Email không đúng định dạng hợp lệ (Ví dụ: name@example.com)';
        }
      } else if (/^[0-9+]+$/.test(val)) {
        const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
        if (!phoneRegex.test(val)) {
          err = 'Số điện thoại không đúng định dạng (Ví dụ: 0912345678)';
        }
      }
    } else if (field === 'matKhau') {
      if (!value) {
        err = 'Vui lòng nhập mật khẩu';
      } else if (value.length < 6) {
        err = 'Mật khẩu phải từ 6 ký tự trở lên';
      }
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
    return err;
  };

  const handleBlur = (field: 'taiKhoan' | 'matKhau', value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleChange = (field: 'taiKhoan' | 'matKhau', value: string) => {
    if (field === 'taiKhoan') setTaiKhoan(value);
    if (field === 'matKhau') setMatKhau(value);

    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ taiKhoan: true, matKhau: true });

    const err1 = validateField('taiKhoan', taiKhoan);
    const err2 = validateField('matKhau', matKhau);

    if (err1 || err2) {
      toast.error('Vui lòng kiểm tra và sửa các thông tin bị lỗi');
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="form-group">
            <div className="flex items-center justify-between">
              <label className="form-label">Email hoặc Số điện thoại *</label>
              {touched.taiKhoan && !errors.taiKhoan && taiKhoan.trim() && (
                <span className="text-xs text-brand-emerald font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ</span>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Nhập email hoặc SĐT..."
                value={taiKhoan}
                onChange={(e) => handleChange('taiKhoan', e.target.value)}
                onBlur={(e) => handleBlur('taiKhoan', e.target.value)}
                className={`form-input pl-11 transition-all ${
                  touched.taiKhoan && errors.taiKhoan 
                    ? 'border-rose-500 focus:border-rose-500 bg-rose-500/5' 
                    : touched.taiKhoan && !errors.taiKhoan && taiKhoan.trim()
                    ? 'border-emerald-500/50'
                    : ''
                }`}
                required
              />
            </div>
            {touched.taiKhoan && errors.taiKhoan && (
              <p className="text-xs text-brand-rose font-medium mt-1 flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.taiKhoan}
              </p>
            )}
          </div>

          <div className="form-group">
            <div className="flex items-center justify-between">
              <label className="form-label">Mật khẩu *</label>
              <div className="flex items-center gap-2">
                {touched.matKhau && !errors.matKhau && matKhau && (
                  <span className="text-xs text-brand-emerald font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ</span>
                )}
                <Link to="/forgot-password" className="text-xs text-brand-primary font-medium hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu..."
                value={matKhau}
                onChange={(e) => handleChange('matKhau', e.target.value)}
                onBlur={(e) => handleBlur('matKhau', e.target.value)}
                className={`form-input pl-11 pr-11 transition-all ${
                  touched.matKhau && errors.matKhau 
                    ? 'border-rose-500 focus:border-rose-500 bg-rose-500/5' 
                    : touched.matKhau && !errors.matKhau && matKhau
                    ? 'border-emerald-500/50'
                    : ''
                }`}
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
            {touched.matKhau && errors.matKhau && (
              <p className="text-xs text-brand-rose font-medium mt-1 flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.matKhau}
              </p>
            )}
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
