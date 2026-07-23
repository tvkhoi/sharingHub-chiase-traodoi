import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { reviewsService } from '../services/reviews.service';
import { useAuth } from '../context/AuthContext';
import type { User, Review } from '../types';
import { RatingStars } from '../components/reviews/RatingStars';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { Star, CheckCircle2, Phone, MapPin, Mail, MessageSquare, Edit } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, updateUser } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (id) fetchProfileAndReviews(id);
  }, [id]);

  const fetchProfileAndReviews = async (userId: string) => {
    setLoading(true);
    try {
      const [uData, rData] = await Promise.all([
        authService.getUserProfile(userId),
        reviewsService.getUserReviews(userId),
      ]);
      setProfileUser(uData);
      setReviews(rData);
    } catch (err) {
      console.error('Lỗi lấy hồ sơ người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdated = (updatedUser: User) => {
    updateUser(updatedUser);
    setProfileUser((prev) => (prev ? { ...prev, ...updatedUser } : updatedUser));
    if (id) fetchProfileAndReviews(id);
  };

  if (loading || !profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const reputation = profileUser.uy_tin;
  const isOwner = currentUser?.nguoi_dung_id === profileUser.nguoi_dung_id;
  const displayPhone = profileUser.so_dien_thoai || profileUser.ho_so?.so_dien_thoai;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Header Profile Info Card */}
      <div className="glass-panel p-8 rounded-3xl border border-color shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl flex-shrink-0">
            {profileUser.ho_so?.anh_dai_dien ? (
              <img src={profileUser.ho_so.anh_dai_dien} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              profileUser.ho_so?.ho_ten?.charAt(0).toUpperCase() || 'U'
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h1 className="text-2xl font-bold text-primary">{profileUser.ho_so?.ho_ten || 'Thành viên'}</h1>
              {isOwner && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn btn-outline text-xs rounded-xl flex items-center justify-center gap-1.5 px-3 py-1.5 hover:border-indigo-500 hover:text-indigo-400 transition-colors self-center sm:self-auto"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Chỉnh sửa hồ sơ
                </button>
              )}
            </div>

            <p className="text-sm text-secondary mt-1 max-w-lg">
              {profileUser.ho_so?.mo_ta_ca_nhan || 'Chưa cập nhật mô tả bản thân.'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs text-muted">
              {profileUser.email && (
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-brand-primary" /> {profileUser.email}</span>
              )}
              {displayPhone && (
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-brand-emerald" /> {displayPhone}</span>
              )}
              {profileUser.ho_so?.dia_chi && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-rose" /> {profileUser.ho_so.dia_chi}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reputation Profile Stats */}
      {reputation && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-6 rounded-2xl text-center">
            <Star className="w-8 h-8 text-brand-amber fill-amber-400 mx-auto mb-2" />
            <div className="text-2xl font-extrabold text-brand-amber">{reputation.diem_trung_binh} / 5.0</div>
            <span className="text-xs text-muted font-semibold">Điểm uy tín trung bình</span>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center">
            <MessageSquare className="w-8 h-8 text-brand-primary mx-auto mb-2" />
            <div className="text-2xl font-extrabold text-brand-primary">{reputation.tong_so_danh_gia}</div>
            <span className="text-xs text-muted font-semibold">Tổng lượt đánh giá cộng đồng</span>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center">
            <CheckCircle2 className="w-8 h-8 text-brand-emerald mx-auto mb-2" />
            <div className="text-2xl font-extrabold text-brand-emerald">{reputation.so_giao_dich_hoan_tat}</div>
            <span className="text-xs text-muted font-semibold">Giao dịch đã hoàn tất</span>
          </div>
        </div>
      )}

      {/* Reviews History List */}
      <div className="glass-card p-6 rounded-3xl">
        <h2 className="text-xl font-bold text-primary mb-4">Lịch Sử Đánh Giá Từ Thành Viên khác</h2>

        {reviews.length === 0 ? (
          <p className="text-sm text-secondary text-center py-8">Chưa có đánh giá nào được ghi nhận cho thành viên này.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.danh_gia_id} className="p-4 rounded-2xl bg-card-hover border border-color flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RatingStars rating={rev.diem_sao} size={16} />
                    <span className="text-xs font-bold text-primary">
                      {rev.nguoi_danh_gia?.ho_so?.ho_ten || 'Thành viên'}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted">
                    {new Date(rev.ngay_danh_gia).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                {rev.nhan_xet && <p className="text-sm text-secondary italic">"{rev.nhan_xet}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal for Owner */}
      {isOwner && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentUser={profileUser}
          onSuccess={handleProfileUpdated}
        />
      )}
    </div>
  );
};
