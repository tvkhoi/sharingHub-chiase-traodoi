import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { assetsService } from '../services/assets.service';
import { proposalsService } from '../services/proposals.service';
import { reportsService } from '../services/reports.service';
import { useAuth } from '../context/AuthContext';
import type { Asset } from '../types';
import toast from 'react-hot-toast';
import { MapPin, Box, Gift, ArrowLeftRight, Star, Send, ShieldAlert, ArrowLeft, Calendar } from 'lucide-react';
import { createPortal } from 'react-dom';

export const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Proposal modal state
  const [showProposalModal, setShowProposalModal] = useState<boolean>(false);
  const [soLuongYeuCau, setSoLuongYeuCau] = useState<number>(1);
  const [loiNhan, setLoiNhan] = useState<string>('');
  const [taiSanDoiUng, setTaiSanDoiUng] = useState<string>('');
  const [submittingProposal, setSubmittingProposal] = useState<boolean>(false);

  // Report modal state
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [lyDoBaoCao, setLyDoBaoCao] = useState<string>('');
  const [moTaReport, setMoTaReport] = useState<string>('');
  const [submittingReport, setSubmittingReport] = useState<boolean>(false);

  useEffect(() => {
    if (id) fetchAsset(id);
  }, [id]);

  const fetchAsset = async (assetId: string) => {
    setLoading(true);
    try {
      const data = await assetsService.getAssetById(assetId);
      setAsset(data);
      if (data.hinh_anh && data.hinh_anh.length > 0) {
        setActiveImage(data.hinh_anh[0].duong_dan_anh);
      }
    } catch (err) {
      toast.error('Không tìm thấy thông tin bài đăng tài sản');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !user) return;

    setSubmittingProposal(true);
    try {
      await proposalsService.createProposal({
        bai_dang_id: asset.bai_dang_id,
        so_luong_yeu_cau: Number(soLuongYeuCau),
        loi_nhan: loiNhan || undefined,
        tai_san_doi_ung: asset.hinh_thuc_chia_se === 'TRAO_DOI' ? taiSanDoiUng : undefined,
      });

      toast.success('Gửi đề xuất nhận/trao đổi tài sản thành công!');
      setShowProposalModal(false);
      navigate('/proposals');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gửi đề xuất thất bại!';
      toast.error(msg);
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !user || !lyDoBaoCao) return;

    setSubmittingReport(true);
    try {
      await reportsService.createReport({
        bai_dang_bi_bao_cao_id: asset.bai_dang_id,
        ly_do_bao_cao: lyDoBaoCao,
        mo_ta_chi_tiet: moTaReport || undefined,
      });

      toast.success('Báo cáo vi phạm đã được gửi đến Ban Quản Trị!');
      setShowReportModal(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gửi báo cáo thất bại!';
      toast.error(msg);
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading || !asset) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOwner = user?.nguoi_dung_id === asset.chu_so_huu_id;
  const images = asset.hinh_anh || [];
  const defaultImage = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn btn-outline text-xs mb-6">
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7">
          <div className="glass-card overflow-hidden p-3 mb-4">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/40">
              <img
                src={activeImage || defaultImage}
                alt={asset.ten_tai_san}
                className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = defaultImage; }}
              />
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img) => (
                <button
                  key={img.hinh_anh_id}
                  onClick={() => setActiveImage(img.duong_dan_anh)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === img.duong_dan_anh ? 'border-indigo-500 shadow-md scale-105' : 'border-color opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.duong_dan_anh} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Asset Details & Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="badge badge-indigo">{asset.danh_muc?.ten_danh_muc || 'Tài sản'}</span>

              {asset.hinh_thuc_chia_se === 'CHO_TANG' ? (
                <span className="badge badge-emerald flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" /> Cho tặng miễn phí
                </span>
              ) : (
                <span className="badge badge-indigo flex items-center gap-1">
                  <ArrowLeftRight className="w-3.5 h-3.5" /> Trao đổi ({asset.hinh_thuc_trao_doi === 'TIEN' ? 'Bù tiền' : 'Tài sản'})
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary mb-4 leading-snug">
              {asset.ten_tai_san}
            </h1>

            <div className="glass-panel p-4 rounded-2xl mb-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary flex items-center gap-2">
                  <Box className="w-4 h-4 text-brand-emerald" /> Khả dụng:
                </span>
                <span className="font-bold text-brand-emerald">
                  {asset.so_luong_kha_dung} / {asset.so_luong_tong} sản phẩm
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-rose" /> Địa điểm:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">{asset.dia_diem}</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(asset.dia_diem)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-primary font-bold hover:underline flex items-center gap-1 bg-indigo-500/10 py-1 px-2.5 rounded-lg border border-indigo-500/20"
                    title="Xem vị trí chỉ đường trên Google Maps"
                  >
                    📍 Maps
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-primary" /> Ngày đăng:
                </span>
                <span className="text-muted">{new Date(asset.ngay_tao).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">Mô tả hiện trạng</h3>
              <div className="glass-card p-4 rounded-2xl text-sm text-primary leading-relaxed whitespace-pre-line">
                {asset.mo_ta_hien_trang}
              </div>
            </div>

            {/* Owner Info Card */}
            {asset.chu_so_huu && (
              <div className="glass-card p-4 rounded-2xl mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                    {asset.chu_so_huu.ho_so?.anh_dai_dien ? (
                      <img src={asset.chu_so_huu.ho_so.anh_dai_dien} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      asset.chu_so_huu.ho_so?.ho_ten?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-primary text-base">
                      {asset.chu_so_huu.ho_so?.ho_ten || 'Thành viên'}
                    </h4>
                    <p className="text-xs text-muted">Chủ sở hữu bài đăng</p>
                  </div>
                </div>

                {asset.chu_so_huu.uy_tin && (
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-brand-amber font-extrabold text-sm">
                      <Star className="w-4 h-4 fill-amber-400" />
                      {asset.chu_so_huu.uy_tin.diem_trung_binh} / 5.0
                    </div>
                    <span className="text-xs text-muted">
                      ({asset.chu_so_huu.uy_tin.tong_so_danh_gia} đánh giá)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-color">
            {!user ? (
              <Link to="/login" className="btn btn-primary w-full py-3">
                Đăng nhập để Đề xuất Nhận / Trao đổi
              </Link>
            ) : isOwner ? (
              <div className="p-3 glass-panel rounded-xl text-center text-sm font-semibold text-brand-primary">
                Đây là bài đăng tài sản do bạn khởi tạo
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowProposalModal(true)}
                  disabled={asset.so_luong_kha_dung <= 0}
                  className="btn btn-emerald flex-1 py-3 text-base"
                >
                  <Send className="w-5 h-5" />
                  {asset.hinh_thuc_chia_se === 'CHO_TANG' ? 'Gửi đề xuất nhận quà' : 'Gửi đề xuất trao đổi'}
                </button>

                <button
                  onClick={() => setShowReportModal(true)}
                  className="btn btn-outline py-3 px-4 text-brand-rose hover:bg-rose-500/10"
                  title="Báo cáo bài đăng vi phạm"
                >
                  <ShieldAlert className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Create Proposal */}
      {showProposalModal && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-color shadow-2xl animate-fade-in">
            <h2 className="text-xl font-bold text-primary mb-2">Gửi Đề Xuất Nhận / Trao Đổi</h2>
            <p className="text-xs text-secondary mb-4">Bài đăng: {asset.ten_tai_san}</p>

            <form onSubmit={handleSendProposal} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Số lượng yêu cầu (Khả dụng: {asset.so_luong_kha_dung})</label>
                <input
                  type="number"
                  min={1}
                  max={asset.so_luong_kha_dung}
                  value={soLuongYeuCau}
                  onChange={(e) => setSoLuongYeuCau(parseInt(e.target.value) || 1)}
                  className="form-input"
                  required
                />
              </div>

              {asset.hinh_thuc_chia_se === 'TRAO_DOI' && (
                <div className="form-group">
                  <label className="form-label">Tài sản / Giá trị đối ứng đề xuất</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Đổi lấy Tai nghe Sony WH-1000XM4 hoặc Bù 500k..."
                    value={taiSanDoiUng}
                    onChange={(e) => setTaiSanDoiUng(e.target.value)}
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Lời nhắn gửi chủ tài sản</label>
                <textarea
                  rows={3}
                  placeholder="Giới thiệu bản thân và lý do muốn nhận/trao đổi tài sản này..."
                  value={loiNhan}
                  onChange={(e) => setLoiNhan(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProposalModal(false)}
                  className="btn btn-outline flex-1"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingProposal}
                  className="btn btn-emerald flex-1"
                >
                  {submittingProposal ? 'Đang gửi...' : 'Xác nhận gửi'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Report Violation */}
      {showReportModal && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-color shadow-2xl animate-fade-in">
            <h2 className="text-xl font-bold text-brand-rose mb-2">Báo Cáo Bài Đăng Vi Phạm</h2>
            <p className="text-xs text-secondary mb-4">Báo cáo bài đăng: {asset.ten_tai_san}</p>

            <form onSubmit={handleSendReport} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Lý do báo cáo *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đồ giả, Nội dung lừa đảo, Hình ảnh nhạy cảm..."
                  value={lyDoBaoCao}
                  onChange={(e) => setLyDoBaoCao(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả chi tiết bằng chứng</label>
                <textarea
                  rows={3}
                  placeholder="Cung cấp thêm chi tiết để Ban Quản Trị xem xét..."
                  value={moTaReport}
                  onChange={(e) => setMoTaReport(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="btn btn-outline flex-1"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="btn btn-danger flex-1"
                >
                  {submittingReport ? 'Đang gửi...' : 'Gửi báo cáo'}
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
