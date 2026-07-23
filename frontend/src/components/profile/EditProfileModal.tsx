import React, { useState, useRef } from 'react';
import type { User } from '../../types';
import { uploadService } from '../../services/upload.service';
import { authService } from '../../services/auth.service';
import { X, Camera, User as UserIcon, Phone, MapPin, FileText, Loader2, Save, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSuccess: (updatedUser: User) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hoTen, setHoTen] = useState(currentUser.ho_so?.ho_ten || '');
  const [anhDaiDien, setAnhDaiDien] = useState(currentUser.ho_so?.anh_dai_dien || '');
  const [soDienThoai, setSoDienThoai] = useState(currentUser.so_dien_thoai || currentUser.ho_so?.so_dien_thoai || '');
  const [diaChi, setDiaChi] = useState(currentUser.ho_so?.dia_chi || '');
  const [moTaCaNhan, setMoTaCaNhan] = useState(currentUser.ho_so?.mo_ta_ca_nhan || '');

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp tin hình ảnh hợp lệ (PNG, JPG, WEBP...)');
      return;
    }

    try {
      setUploadingAvatar(true);
      const res = await uploadService.uploadSingle(file);
      setAnhDaiDien(res.url);
      toast.success('Tải ảnh đại diện mới thành công!');
    } catch (err: any) {
      console.error('Lỗi tải ảnh đại diện:', err);
      toast.error(err.response?.data?.message || 'Không thể tải ảnh lên, vui lòng thử lại');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoTen.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }

    try {
      setSubmitting(true);
      const res: any = await authService.updateProfile({
        ho_ten: hoTen.trim(),
        anh_dai_dien: anhDaiDien.trim() || undefined,
        so_dien_thoai: soDienThoai.trim() || undefined,
        dia_chi: diaChi.trim() || undefined,
        mo_ta_ca_nhan: moTaCaNhan.trim() || undefined,
      });

      toast.success('Cập nhật thông tin hồ sơ thành công!');
      const updatedUser = res.user || res;
      onSuccess(updatedUser);
      onClose();
    } catch (err: any) {
      console.error('Lỗi cập nhật hồ sơ:', err);
      toast.error(err.response?.data?.message || 'Không thể cập nhật hồ sơ, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Dialog Card - Viewport Centered */}
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 sm:w-10 sm:h-10 mx-auto mb-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <UserIcon className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
            Chỉnh Sửa Hồ Sơ Cá Nhân
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cập nhật thông tin cá nhân và ảnh đại diện</p>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 custom-scrollbar">
          {/* Avatar Upload Section - Responsive Centered */}
          <div className="flex flex-col items-center justify-center py-1 gap-2.5 text-center">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-white shadow-lg overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800">
                {anhDaiDien ? (
                  <img src={anhDaiDien} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  hoTen?.charAt(0).toUpperCase() || 'U'
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-7 h-7 text-white animate-spin" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-md ring-2 ring-white dark:ring-slate-900 transition-all hover:scale-110 disabled:opacity-50 cursor-pointer"
                title="Thay đổi ảnh đại diện"
              >
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              {uploadingAvatar ? 'Đang tải ảnh lên...' : 'Tải ảnh đại diện mới từ máy tính'}
            </button>
          </div>

          {/* Grid layout for Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
                placeholder="Nhập họ và tên"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                Số điện thoại
              </label>
              <input
                type="tel"
                value={soDienThoai}
                onChange={(e) => setSoDienThoai(e.target.value)}
                placeholder="Ví dụ: 0987654321"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Địa chỉ
            </label>
            <input
              type="text"
              value={diaChi}
              onChange={(e) => setDiaChi(e.target.value)}
              placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            />
          </div>

          {/* Bio / Personal Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              Mô tả bản thân / Tiểu sử
            </label>
            <textarea
              rows={3}
              value={moTaCaNhan}
              onChange={(e) => setMoTaCaNhan(e.target.value)}
              placeholder="Chia sẻ một chút thông tin về bạn..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center sm:justify-end gap-3 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all cursor-pointer text-center"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingAvatar}
              className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
