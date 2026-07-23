import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
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

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 rounded-3xl border border-color shadow-2xl relative space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-color pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-brand-primary">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">
                Chỉnh Sửa Hồ Sơ Cá Nhân
              </h2>
              <p className="text-xs text-muted">Cập nhật thông tin cá nhân và ảnh đại diện</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted hover:text-primary hover:bg-card-hover rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center justify-center py-2 gap-3 text-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl overflow-hidden border-2 border-indigo-500/30">
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
                className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg border-2 border-slate-900 transition-all hover:scale-110 disabled:opacity-50 cursor-pointer"
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
              className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              {uploadingAvatar ? 'Đang tải ảnh lên...' : 'Tải ảnh đại diện mới từ máy tính'}
            </button>
          </div>

          {/* Grid layout for Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-brand-primary" />
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
                placeholder="Nhập họ và tên"
                className="form-input text-sm w-full"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-brand-emerald" />
                Số điện thoại
              </label>
              <input
                type="tel"
                value={soDienThoai}
                onChange={(e) => setSoDienThoai(e.target.value)}
                placeholder="Ví dụ: 0987654321"
                className="form-input text-sm w-full"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-secondary flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-rose" />
              Địa chỉ
            </label>
            <input
              type="text"
              value={diaChi}
              onChange={(e) => setDiaChi(e.target.value)}
              placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh"
              className="form-input text-sm w-full"
            />
          </div>

          {/* Bio / Personal Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-secondary flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-amber" />
              Mô tả bản thân / Tiểu sử
            </label>
            <textarea
              rows={3}
              value={moTaCaNhan}
              onChange={(e) => setMoTaCaNhan(e.target.value)}
              placeholder="Chia sẻ một chút thông tin về bạn..."
              className="form-input text-sm w-full resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-color">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-outline text-xs rounded-xl px-5 py-2.5"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingAvatar}
              className="btn btn-primary text-xs rounded-xl px-6 py-2.5 flex items-center gap-2"
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
    </div>,
    document.body
  );
};
