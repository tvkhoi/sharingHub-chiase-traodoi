import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';
import { Mail, Lock, User as UserIcon, Phone, MapPin, Layers, Eye, EyeOff, KeyRound, AlertCircle, CheckCircle2, Send } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [matKhau, setMatKhau] = useState<string>('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [hoTen, setHoTen] = useState<string>('');
  const [soDienThoai, setSoDienThoai] = useState<string>('');
  const [diaChi, setDiaChi] = useState<string>('');

  // Realtime Inline Validation State
  type FieldName = 'hoTen' | 'email' | 'soDienThoai' | 'matKhau' | 'xacNhanMatKhau';
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    hoTen: false,
    email: false,
    soDienThoai: false,
    matKhau: false,
    xacNhanMatKhau: false,
  });
  const [errors, setErrors] = useState<Record<FieldName, string>>({
    hoTen: '',
    email: '',
    soDienThoai: '',
    matKhau: '',
    xacNhanMatKhau: '',
  });

  // OTP Verification State
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('');
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const validateField = (field: FieldName, value: string, currentValues?: { matKhau?: string }) => {
    let err = '';
    const targetPassword = currentValues?.matKhau !== undefined ? currentValues.matKhau : matKhau;

    if (field === 'hoTen') {
      const val = value.trim();
      if (!val) {
        err = 'Vui lòng nhập họ và tên của bạn';
      } else if (val.length < 2) {
        err = 'Họ tên phải từ 2 ký tự trở lên';
      }
    } else if (field === 'email') {
      const val = value.trim();
      if (!val) {
        err = 'Vui lòng nhập địa chỉ email';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          err = 'Email không đúng định dạng hợp lệ (Ví dụ: name@example.com)';
        }
      }
    } else if (field === 'soDienThoai') {
      const val = value.trim();
      if (!val) {
        err = 'Vui lòng nhập số điện thoại';
      } else {
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
      // Recheck confirm password if already touched
      if (touched.xacNhanMatKhau && xacNhanMatKhau) {
        setErrors((prev) => ({
          ...prev,
          xacNhanMatKhau: xacNhanMatKhau !== value ? 'Mật khẩu và xác nhận mật khẩu không trùng khớp' : '',
        }));
      }
    } else if (field === 'xacNhanMatKhau') {
      if (!value) {
        err = 'Vui lòng nhập lại mật khẩu xác nhận';
      } else if (value !== targetPassword) {
        err = 'Mật khẩu và xác nhận mật khẩu không trùng khớp';
      }
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
    return err;
  };

  const handleBlur = (field: FieldName, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleChange = (field: FieldName, value: string) => {
    if (field === 'hoTen') setHoTen(value);
    if (field === 'email') setEmail(value);
    if (field === 'soDienThoai') setSoDienThoai(value);
    if (field === 'matKhau') setMatKhau(value);
    if (field === 'xacNhanMatKhau') setXacNhanMatKhau(value);

    if (touched[field]) {
      validateField(field, value, { matKhau: field === 'matKhau' ? value : matKhau });
    }
  };

  const handleSendOtpAndOpenModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      hoTen: true,
      email: true,
      soDienThoai: true,
      matKhau: true,
      xacNhanMatKhau: true,
    });

    const errHoTen = validateField('hoTen', hoTen);
    const errEmail = validateField('email', email);
    const errPhone = validateField('soDienThoai', soDienThoai);
    const errPass = validateField('matKhau', matKhau);
    const errConfirm = validateField('xacNhanMatKhau', xacNhanMatKhau);

    if (errHoTen || errEmail || errPhone || errPass || errConfirm) {
      toast.error('Vui lòng kiểm tra và sửa các thông tin bị lỗi trước khi nhận mã OTP');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await authService.sendOtp(email.trim());
      toast.success(res.message);
      if (res.otpSimulated) {
        setSimulatedOtp(res.otpSimulated);
      }
      setShowOtpModal(true);
      startResendTimer();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại Email!';
      toast.error(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length !== 6) {
      toast.error('Vui lòng nhập đầy đủ mã OTP 6 số!');
      return;
    }

    setVerifyingOtp(true);
    try {
      // 1. Verify OTP via EmailService
      await authService.verifyOtp(email.trim(), otpInput.trim());

      // 2. Complete Account Registration
      const res = await authService.register({
        email: email.trim(),
        mat_khau: matKhau,
        xac_nhan_mat_khau: xacNhanMatKhau,
        ho_ten: hoTen.trim(),
        so_dien_thoai: soDienThoai.trim(),
        dia_chi: diaChi.trim() || undefined,
      });

      login(res.access_token, res.user);
      toast.success('Xác thực Email & Đăng ký tài khoản thành công!');
      setShowOtpModal(false);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn!';
      toast.error(msg);
    } finally {
      setVerifyingOtp(false);
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

        <form onSubmit={handleSendOtpAndOpenModal} className="space-y-4" noValidate>
          {/* Họ và tên */}
          <div className="form-group">
            <div className="flex items-center justify-between">
              <label className="form-label">Họ và tên *</label>
              {touched.hoTen && !errors.hoTen && hoTen.trim() && (
                <span className="text-xs text-brand-emerald font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ</span>
              )}
            </div>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Nhập họ tên của bạn..."
                value={hoTen}
                onChange={(e) => handleChange('hoTen', e.target.value)}
                onBlur={(e) => handleBlur('hoTen', e.target.value)}
                className={`form-input pl-11 transition-all ${
                  touched.hoTen && errors.hoTen 
                    ? 'border-rose-500 focus:border-rose-500 bg-rose-500/5' 
                    : touched.hoTen && !errors.hoTen && hoTen.trim()
                    ? 'border-emerald-500/50'
                    : ''
                }`}
                required
              />
            </div>
            {touched.hoTen && errors.hoTen && (
              <p className="text-xs text-brand-rose font-medium mt-1 flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.hoTen}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="form-group">
              <div className="flex items-center justify-between">
                <label className="form-label">Email *</label>
                {touched.email && !errors.email && email.trim() && (
                  <span className="text-xs text-brand-emerald font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ</span>
                )}
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={(e) => handleBlur('email', e.target.value)}
                  className={`form-input pl-11 transition-all ${
                    touched.email && errors.email 
                      ? 'border-rose-500 focus:border-rose-500 bg-rose-500/5' 
                      : touched.email && !errors.email && email.trim()
                      ? 'border-emerald-500/50'
                      : ''
                  }`}
                  required
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-xs text-brand-rose font-medium mt-1 flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.email}
                </p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="form-group">
              <div className="flex items-center justify-between">
                <label className="form-label">Số điện thoại *</label>
                {touched.soDienThoai && !errors.soDienThoai && soDienThoai.trim() && (
                  <span className="text-xs text-brand-emerald font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ</span>
                )}
              </div>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
                <input
                  type="tel"
                  placeholder="0912345678"
                  value={soDienThoai}
                  onChange={(e) => handleChange('soDienThoai', e.target.value)}
                  onBlur={(e) => handleBlur('soDienThoai', e.target.value)}
                  className={`form-input pl-11 transition-all ${
                    touched.soDienThoai && errors.soDienThoai 
                      ? 'border-rose-500 focus:border-rose-500 bg-rose-500/5' 
                      : touched.soDienThoai && !errors.soDienThoai && soDienThoai.trim()
                      ? 'border-emerald-500/50'
                      : ''
                  }`}
                  required
                />
              </div>
              {touched.soDienThoai && errors.soDienThoai && (
                <p className="text-xs text-brand-rose font-medium mt-1 flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.soDienThoai}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mật khẩu */}
            <div className="form-group">
              <div className="flex items-center justify-between">
                <label className="form-label">Mật khẩu *</label>
                {touched.matKhau && !errors.matKhau && matKhau && (
                  <span className="text-xs text-brand-emerald font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ</span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự..."
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

            {/* Xác nhận mật khẩu */}
            <div className="form-group">
              <div className="flex items-center justify-between">
                <label className="form-label">Xác nhận mật khẩu *</label>
                {touched.xacNhanMatKhau && !errors.xacNhanMatKhau && xacNhanMatKhau && (
                  <span className="text-xs text-brand-emerald font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ</span>
                )}
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu..."
                  value={xacNhanMatKhau}
                  onChange={(e) => handleChange('xacNhanMatKhau', e.target.value)}
                  onBlur={(e) => handleBlur('xacNhanMatKhau', e.target.value)}
                  className={`form-input pl-11 pr-11 transition-all ${
                    touched.xacNhanMatKhau && errors.xacNhanMatKhau 
                      ? 'border-rose-500 focus:border-rose-500 bg-rose-500/5' 
                      : touched.xacNhanMatKhau && !errors.xacNhanMatKhau && xacNhanMatKhau
                      ? 'border-emerald-500/50'
                      : ''
                  }`}
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
              {touched.xacNhanMatKhau && errors.xacNhanMatKhau && (
                <p className="text-xs text-brand-rose font-medium mt-1 flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.xacNhanMatKhau}
                </p>
              )}
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
            disabled={sendingOtp}
            className="btn btn-emerald w-full py-3 text-base font-semibold mt-2"
          >
            {sendingOtp ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang gửi mã OTP đến Email...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Gửi Mã OTP & Xác Thực Email
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

        {/* Modal Overlay: OTP Email Verification */}
        {showOtpModal && createPortal(
          <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-color shadow-2xl animate-fade-in relative">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-brand-primary flex items-center justify-center mx-auto mb-3 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                  <Mail className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-primary">Xác Thực Email Chính Chủ</h2>
                <p className="text-xs text-secondary mt-1">
                  Mã OTP 6 số đã được gửi tới email <span className="font-semibold text-brand-primary">{email}</span>
                </p>
              </div>

              {simulatedOtp && (
                <div className="mb-5 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center">
                  <span className="text-xs text-secondary block font-medium">Mã OTP gửi về Email thực tế:</span>
                  <span className="text-2xl font-mono font-extrabold text-brand-primary tracking-widest">{simulatedOtp}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
                <div className="form-group">
                  <label className="form-label text-center block">Nhập mã OTP 6 số từ Email *</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="------"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                    className="form-input text-center font-mono text-2xl font-bold tracking-[0.5em] py-3 uppercase"
                    autoFocus
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="btn btn-outline flex-1"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={verifyingOtp}
                    className="btn btn-emerald flex-1"
                  >
                    {verifyingOtp ? 'Đang kích hoạt...' : 'Xác Nhận & Đăng Ký'}
                  </button>
                </div>

                <div className="text-center pt-2">
                  {resendTimer > 0 ? (
                    <span className="text-xs text-muted">Gửi lại mã OTP mới sau {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtpAndOpenModal}
                      className="text-xs font-semibold text-brand-primary hover:underline"
                    >
                      Gửi lại mã OTP mới
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};
