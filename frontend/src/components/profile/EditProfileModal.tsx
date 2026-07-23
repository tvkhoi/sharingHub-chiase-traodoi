import React, { useState, useRef } from 'react';
import type { User } from '../../types';
import { uploadService } from '../../services/upload.service';
import { authService } from '../../services/auth.service';
import { X, Camera, User as UserIcon, Phone, MapPin, FileText, Loader2, Save } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-color shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-color">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-brand-primary" />
            Chỉnh Sửa Hồ Sơ Cá Nhân
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-secondary hover:text-primary hover:bg-slate-800/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-extrabold text-white shadow-xl overflow-hidden border-2 border-indigo-400/40">
                {anhDaiDien ? (
                  <img src={anhDaiDien} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  hoTen?.charAt(0).toUpperCase() || 'U'
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg border-2 border-slate-900 transition-all hover:scale-105 disabled:opacity-50"
                title="Thay đổi ảnh đại diện"
              >
                <Camera className="w-4 h-4" />
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
              className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
            >
              {uploadingAvatar ? 'Đang tải ảnh lên...' : 'Tải ảnh đại diện mới từ máy tính'}
            </button>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-secondary flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-brand-primary" />
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              placeholder="Nhập họ và tên của bạn"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-primary focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-secondary flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-emerald" />
              Số điện thoại
            </label>
            <input
              type="tel"
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
              placeholder="Ví dụ: 0987654321"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-primary focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-secondary flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-rose" />
              Địa chỉ
            </label>
            <input
              type="text"
              value={diaChi}
              onChange={(e) => setDiaChi(e.target.value)}
              placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-primary focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Bio / Personal Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-secondary flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-amber" />
              Mô tả bản thân / Tiểu sử
            </label>
            <textarea
              rows={3}
              value={moTaCaNhan}
              onChange={(e) => setMoTaCaNhan(e.target.value)}
              placeholder="Chia sẻ một chút thông tin về bạn..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-primary focus:border-indigo-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-color">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-secondary hover:text-primary bg-slate-800/40 hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingAvatar}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
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
