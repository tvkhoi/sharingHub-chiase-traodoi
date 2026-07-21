import React, { useEffect, useState } from 'react';
import { transactionsService } from '../services/transactions.service';
import { reviewsService } from '../services/reviews.service';
import type { Transaction } from '../types';
import { useAuth } from '../context/AuthContext';
import { RatingStars } from '../components/reviews/RatingStars';
import toast from 'react-hot-toast';
import { Repeat, CheckCircle2, Clock, Truck, Star } from 'lucide-react';
import { createPortal } from 'react-dom';

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Review modal state
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [diemSao, setDiemSao] = useState<number>(5);
  const [nhanXet, setNhanXet] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await transactionsService.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Lỗi lấy danh sách giao dịch:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (txId: string) => {
    try {
      const res = await transactionsService.confirmTransaction(txId);
      toast.success(res.message || 'Xác nhận bước giao dịch thành công!');
      fetchTransactions();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Xác nhận thất bại!';
      toast.error(msg);
    }
  };

  const handleSendReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;

    setSubmittingReview(true);
    try {
      await reviewsService.createReview({
        giao_dich_id: selectedTx.giao_dich_id,
        diem_sao: diemSao,
        nhan_xet: nhanXet || undefined,
      });

      toast.success('Đã gửi đánh giá sao cho đối phương thành công!');
      setSelectedTx(null);
      fetchTransactions();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gửi đánh giá thất bại!';
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary">Theo Dõi Giao Dịch Bàn Giao</h1>
        <p className="text-sm text-secondary mt-1 sm:mt-0">Xác nhận bàn giao & tiếp nhận tài sản để hoàn tất quy trình tích điểm uy tín</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-6 h-36 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="glass-card text-center py-16 px-4">
          <Repeat className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-primary mb-1">Chưa có giao dịch nào</h3>
          <p className="text-sm text-secondary">
            Các giao dịch sẽ tự động xuất hiện ở đây khi chủ bài đăng chấp nhận đề xuất trao đổi.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {transactions.map((tx) => {
            const isOwner = user?.nguoi_dung_id === tx.nguoi_so_huu_id;
            const isCompleted = tx.trang_thai === 'HOAN_TAT';

            return (
              <div key={tx.giao_dich_id} className="glass-card p-6 rounded-3xl border border-color shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-color">
                  <div>
                    <span className="text-xs font-mono text-brand-primary">Mã GD: #{tx.giao_dich_id.substring(0, 8)}</span>
                    <h3 className="font-bold text-lg sm:text-xl text-primary mt-1">
                      {tx.de_xuat?.bai_dang?.ten_tai_san || 'Giao dịch tài sản'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <span className="badge badge-emerald py-1 px-3 text-xs"><CheckCircle2 className="w-4 h-4" /> HOÀN TẤT</span>
                    ) : tx.trang_thai === 'DANG_GIAO' ? (
                      <span className="badge badge-indigo py-1 px-3 text-xs"><Truck className="w-4 h-4" /> ĐANG VẬN CHUYỂN / GIAO NHẬN</span>
                    ) : (
                      <span className="badge badge-amber py-1 px-3 text-xs"><Clock className="w-4 h-4" /> CHỜ CHỦ SỞ HỮU BÀN GIAO</span>
                    )}
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border ${tx.xac_nhan_nguoi_so_huu ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-card-hover border-color'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-secondary">Bước 1: Chủ sở hữu bàn giao</span>
                      {tx.xac_nhan_nguoi_so_huu ? (
                        <span className="text-xs font-bold text-brand-emerald flex items-center gap-1 w-fit"><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> Đã bàn giao</span>
                      ) : (
                        <span className="text-xs text-brand-amber w-fit">Chưa xác nhận</span>
                      )}
                    </div>
                    <p className="text-sm text-secondary mt-2">
                      Chủ bài đăng: <span className="font-semibold text-primary">{tx.nguoi_so_huu?.ho_so?.ho_ten || 'Thành viên'}</span>
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${tx.xac_nhan_nguoi_tiep_nhan ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-card-hover border-color'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-secondary">Bước 2: Người nhận tiếp nhận</span>
                      {tx.xac_nhan_nguoi_tiep_nhan ? (
                        <span className="text-xs font-bold text-brand-emerald flex items-center gap-1 w-fit"><CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> Đã tiếp nhận</span>
                      ) : (
                        <span className="text-xs text-brand-amber w-fit">Chưa xác nhận</span>
                      )}
                    </div>
                    <p className="text-sm text-secondary mt-2">
                      Người tiếp nhận: <span className="font-semibold text-primary">{tx.nguoi_tiep_nhan?.ho_so?.ho_ten || 'Thành viên'}</span>
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-color flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-xs text-muted">
                    Thời điểm tạo: {new Date(tx.ngay_tao).toLocaleString('vi-VN')}
                  </span>

                  <div className="flex gap-3 w-full sm:w-auto">
                    {!isCompleted && (
                      <button
                        onClick={() => handleConfirm(tx.giao_dich_id)}
                        className="btn btn-emerald text-sm w-full sm:w-auto justify-center"
                      >
                        {isOwner ? 'Xác nhận Đã Bàn Giao' : 'Xác nhận Đã Nhận Đồ'}
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="btn btn-primary text-sm w-full sm:w-auto justify-center"
                      >
                        <Star className="w-4 h-4 text-amber-300 fill-amber-300 flex-shrink-0" />
                        Viết Đánh Giá Uy Tín
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Write Review */}
      {selectedTx && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-color shadow-2xl animate-fade-in">
            <h2 className="text-xl font-bold text-primary mb-2">Đánh Giá Uy Tín Giao Dịch</h2>
            <p className="text-xs text-secondary mb-4">Giao dịch: {selectedTx.de_xuat?.bai_dang?.ten_tai_san}</p>

            <form onSubmit={handleSendReview} className="space-y-4">
              <div className="form-group text-center">
                <label className="form-label mb-2">Chọn số sao đánh giá (1 - 5 sao)</label>
                <div className="flex justify-center">
                  <RatingStars rating={diemSao} interactive size={32} onRate={(r) => setDiemSao(r)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nhận xét chi tiết</label>
                <textarea
                  rows={3}
                  placeholder="Cảm nhận về thái độ, đúng hẹn, hiện trạng tài sản đúng như mô tả..."
                  value={nhanXet}
                  onChange={(e) => setNhanXet(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="btn btn-outline flex-1"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-emerald flex-1"
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
