import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';
import { KeyRound, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, Send, RefreshCw, ShieldCheck } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [matKhauMoi, setMatKhauMoi] = useState<string>('');
  const [xacNhanMatKhauMoi, setXacNhanMatKhauMoi] = useState<string>('');

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Send OTP, Step 2: Verify OTP & Reset Password
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [countdown, setCountdown] = useState<number>(0);

  // Validation states
  const [touched, setTouched] = useState<{
    email?: boolean;
    otp?: boolean;
    matKhauMoi?: boolean;
    xacNhanMatKhauMoi?: boolean;
  }>({});

  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
    matKhauMoi?: string;
    xacNhanMatKhauMoi?: string;
  }>({});

  const navigate = useNavigate();

  // Countdown timer effect
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const validateEmail = (val: string) => {
    const clean = val.trim();
    if (!clean) {
      return 'Vui lòng nhập địa chỉ Email';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(clean)) {
      return 'Email không đúng định dạng hợp lệ (Ví dụ: name@example.com)';
    }
    return '';
  };

  const validateField = (field: string, val: string, allValues?: any) => {
    let err = '';
    if (field === 'email') {
      err = validateEmail(val);
    } else if (field === 'otp') {
      const clean = val.trim();
      if (!clean) err = 'Vui lòng nhập mã OTP 6 chữ số';
      else if (!/^\d{6}$/.test(clean)) err = 'Mã OTP phải bao gồm đúng 6 chữ số';
    } else if (field === 'matKhauMoi') {
      if (!val) err = 'Vui lòng nhập mật khẩu mới';
      else if (val.length < 6) err = 'Mật khẩu mới phải từ 6 ký tự trở lên';
    } else if (field === 'xacNhanMatKhauMoi') {
      const pass = allValues?.matKhauMoi || matKhauMoi;
      if (!val) err = 'Vui lòng nhập xác nhận mật khẩu mới';
      else if (val !== pass) err = 'Mật khẩu xác nhận không trùng khớp';
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
    return err;
  };

  const handleBlur = (field: string, val: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, val);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setTouched((prev) => ({ ...prev, email: true }));
    const err = validateEmail(email);
    if (err) {
      setErrors((prev) => ({ ...prev, email: err }));
      toast.error(err);
      return;
    }

    setSendingOtp(true);

    try {
      const res = await authService.forgotPasswordSendOtp(email.trim());
      toast.success(res.message);
      setStep(2);
      setCountdown(60);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gửi mã OTP thất bại. Vui lòng kiểm tra lại email!';
      toast.error(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      email: true,
      otp: true,
      matKhauMoi: true,
      xacNhanMatKhauMoi: true,
    });

    const errEmail = validateField('email', email);
    const errOtp = validateField('otp', otp);
    const errPass = validateField('matKhauMoi', matKhauMoi);
    const errConfirm = validateField('xacNhanMatKhauMoi', xacNhanMatKhauMoi);

    if (errEmail || errOtp || errPass || errConfirm) {
      toast.error('Vui lòng kiểm tra và sửa các ô bị lỗi');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        mat_khau_moi: matKhauMoi,
        xac_nhan_mat_khau_moi: xacNhanMatKhauMoi,
      });

      toast.success(res.message || 'Đổi mật khẩu thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-color shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-primary">Quên Mật Khẩu</h2>
          <p className="text-sm text-secondary mt-1">
            {step === 1
              ? 'Nhập địa chỉ Gmail để nhận mã xác thực OTP khôi phục tài khoản'
              : `Nhập mã OTP vừa gửi tới ${email} và thiết lập mật khẩu mới`}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 1 ? 'w-10 bg-indigo-600' : 'w-4 bg-gray-300 dark:bg-gray-700'
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 2 ? 'w-10 bg-indigo-600' : 'w-4 bg-gray-300 dark:bg-gray-700'
            }`}
          />
        </div>

        {/* Step 1: Input Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5" noValidate>
            <div className="form-group">
              <div className="flex items-center justify-between">
                <label className="form-label">Địa chỉ Email đăng ký *</label>
                {touched.email && !errors.email && email.trim() && (
                  <span className="text-xs text-brand-emerald font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
                <input
                  type="email"
                  placeholder="Nhập email của bạn (Ví dụ: user@gmail.com)..."
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) validateField('email', e.target.value);
                  }}
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

            <button
              type="submit"
              disabled={sendingOtp}
              className="btn btn-primary w-full py-3 text-base font-semibold shadow-lg shadow-indigo-500/25"
            >
              {sendingOtp ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang gửi mã OTP tới Gmail...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Gửi Mã Xác Thực OTP
                </span>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP & Reset Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
            {/* Email display and change */}
            <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-secondary truncate">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate font-medium text-primary">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-brand-primary font-semibold hover:underline shrink-0"
              >
                Đổi Email
              </button>
            </div>

            {/* OTP Code */}
            <div className="form-group">
              <div className="flex items-center justify-between">
                <label className="form-label">Mã xác thực OTP (6 chữ số) *</label>
                {touched.otp && !errors.otp && otp.trim() && (
                  <span className="text-xs text-brand-emerald font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Khớp định dạng
                  </span>
                )}
              </div>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Nhập 6 số OTP..."
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setOtp(val);
                    if (touched.otp) validateField('otp', val);
                  }}
                  onBlur={(e) => handleBlur('otp', e.target.value)}
                  className={`form-input pl-11 font-mono text-base font-bold transition-all ${
                    otp ? 'tracking-[0.3em] uppercase' : 'tracking-normal normal-case'
                  } ${
                    touched.otp && errors.otp
                      ? 'border-rose-500 focus:border-rose-500 bg-rose-500/5'
                      : touched.otp && !errors.otp && otp.trim().length === 6
                      ? 'border-emerald-500/50'
                      : ''
                  }`}
                  required
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                {touched.otp && errors.otp ? (
                  <p className="text-xs text-brand-rose font-medium flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.otp}
                  </p>
                ) : (
                  <span className="text-[11px] text-muted">Mã OTP gồm 6 chữ số gửi qua Gmail</span>
                )}

                <button
                  type="button"
                  disabled={countdown > 0 || sendingOtp}
                  onClick={() => handleSendOtp()}
                  className="text-xs text-brand-primary font-semibold hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 ml-auto"
                >
                  <RefreshCw className={`w-3 h-3 ${sendingOtp ? 'animate-spin' : ''}`} />
                  {countdown > 0 ? `Gửi lại mã (${countdown}s)` : 'Gửi lại mã OTP'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group">
              <div className="flex items-center justify-between">
                <label className="form-label">Mật khẩu mới *</label>
                {touched.matKhauMoi && !errors.matKhauMoi && matKhauMoi && (
                  <span className="text-xs text-brand-emerald font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                  value={matKhauMoi}
                  onChange={(e) => {
                    setMatKhauMoi(e.target.value);
                    if (touched.matKhauMoi) validateField('matKhauMoi', e.target.value);
                    if (touched.xacNhanMatKhauMoi) validateField('xacNhanMatKhauMoi', xacNhanMatKhauMoi, { matKhauMoi: e.target.value });
                  }}
                  onBlur={(e) => handleBlur('matKhauMoi', e.target.value)}
                  className={`form-input pl-11 pr-11 transition-all ${
                    touched.matKhauMoi && errors.matKhauMoi
                      ? 'border-rose-500 focus:border-rose-500 bg-rose-500/5'
                      : touched.matKhauMoi && !errors.matKhauMoi && matKhauMoi
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
              {touched.matKhauMoi && errors.matKhauMoi && (
                <p className="text-xs text-brand-rose font-medium mt-1 flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.matKhauMoi}
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="form-group">
              <div className="flex items-center justify-between">
                <label className="form-label">Xác nhận mật khẩu mới *</label>
                {touched.xacNhanMatKhauMoi && !errors.xacNhanMatKhauMoi && xacNhanMatKhauMoi && (
                  <span className="text-xs text-brand-emerald font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Trùng khớp
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-5 h-5 text-muted" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu mới..."
                  value={xacNhanMatKhauMoi}
                  onChange={(e) => {
                    setXacNhanMatKhauMoi(e.target.value);
                    if (touched.xacNhanMatKhauMoi) validateField('xacNhanMatKhauMoi', e.target.value);
                  }}
                  onBlur={(e) => handleBlur('xacNhanMatKhauMoi', e.target.value)}
                  className={`form-input pl-11 pr-11 transition-all ${
                    touched.xacNhanMatKhauMoi && errors.xacNhanMatKhauMoi
                      ? 'border-rose-500 focus:border-rose-500 bg-rose-500/5'
                      : touched.xacNhanMatKhauMoi && !errors.xacNhanMatKhauMoi && xacNhanMatKhauMoi
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
              {touched.xacNhanMatKhauMoi && errors.xacNhanMatKhauMoi && (
                <p className="text-xs text-brand-rose font-medium mt-1 flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.xacNhanMatKhauMoi}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full py-3 text-base font-semibold mt-2 shadow-lg shadow-indigo-500/25"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang cập nhật mật khẩu...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5" />
                  Xác Nhận & Đổi Mật Khẩu
                </span>
              )}
            </button>
          </form>
        )}

        {/* Navigation back to login */}
        <div className="mt-6 text-center text-sm text-secondary pt-4 border-t border-color">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-secondary hover:text-brand-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang Đăng Nhập
          </Link>
        </div>
      </div>
    </div>
  );
};
