import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { assetsService } from '../services/assets.service';
import { proposalsService } from '../services/proposals.service';
import { reportsService } from '../services/reports.service';
import { uploadService } from '../services/upload.service';
import { useAuth } from '../context/AuthContext';
import type { Asset } from '../types';
import toast from 'react-hot-toast';
import { MapPin, Box, Gift, ArrowLeftRight, Star, Send, ShieldAlert, ArrowLeft, Calendar, UploadCloud, X, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

export const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const handleGoBack = () => {
    if (location.state?.fromAdminReports) {
      navigate('/admin/reports');
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (user?.vai_tro === 'QUAN_TRI_VIEN') {
      navigate('/admin/reports');
    } else {
      navigate('/');
    }
  };

  // Proposal modal state
  const [showProposalModal, setShowProposalModal] = useState<boolean>(false);
  const [soLuongYeuCau, setSoLuongYeuCau] = useState<number>(1);
  const [loiNhan, setLoiNhan] = useState<string>('');
  const [taiSanDoiUng, setTaiSanDoiUng] = useState<string>('');
  const [tienDoiUng, setTienDoiUng] = useState<string>('');
  const [tienDoiUngError, setTienDoiUngError] = useState<string>('');
  const [loaiDoiUng, setLoaiDoiUng] = useState<'TAI_SAN' | 'TIEN' | 'CA_HAI' | 'MIEN_PHI'>('TAI_SAN');
  const [submittingProposal, setSubmittingProposal] = useState<boolean>(false);

  // Report modal state
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [lyDoBaoCao, setLyDoBaoCao] = useState<string>('');
  const [moTaReport, setMoTaReport] = useState<string>('');
  const [minhChungImage, setMinhChungImage] = useState<string>('');
  const [uploadingEvidence, setUploadingEvidence] = useState<boolean>(false);
  const [submittingReport, setSubmittingReport] = useState<boolean>(false);

  // Appeal modal state
  const [showAppealModal, setShowAppealModal] = useState<boolean>(false);
  const [lyDoKhangCao, setLyDoKhangCao] = useState<string>('');
  const [moTaKhangCao, setMoTaKhangCao] = useState<string>('');
  const [minhChungKhangCao, setMinhChungKhangCao] = useState<string>('');
  const [uploadingAppealEvidence, setUploadingAppealEvidence] = useState<boolean>(false);
  const [submittingAppeal, setSubmittingAppeal] = useState<boolean>(false);

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

  const openProposalModal = () => {
    setSoLuongYeuCau(1);
    setLoiNhan('');
    setTienDoiUng('');
    setTienDoiUngError('');
    if (asset?.hinh_thuc_chia_se === 'CHO_TANG') {
      setLoaiDoiUng('MIEN_PHI');
      setTaiSanDoiUng('Xin nhận miễn phí (Cho/Tặng)');
    } else {
      setLoaiDoiUng('TAI_SAN');
      setTaiSanDoiUng('');
    }
    setShowProposalModal(true);
  };

  const handleTienDoiUngChange = (val: string) => {
    setTienDoiUng(val);
    if (!val) {
      setTienDoiUngError(loaiDoiUng === 'TIEN' ? 'Vui lòng nhập số tiền đối ứng bù thêm' : '');
      return;
    }
    const num = Number(val);
    if (isNaN(num) || num <= 0) {
      setTienDoiUngError('Số tiền đối ứng phải lớn hơn 0 VNĐ');
    } else {
      setTienDoiUngError('');
    }
  };

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !user) return;

    let finalTaiSan = taiSanDoiUng.trim();
    let finalTien: number | undefined = undefined;

    if (asset.hinh_thuc_chia_se === 'CHO_TANG' || loaiDoiUng === 'MIEN_PHI') {
      finalTaiSan = 'Xin nhận miễn phí (Cho/Tặng)';
    } else if (loaiDoiUng === 'TAI_SAN') {
      if (!finalTaiSan) return toast.error('Vui lòng nhập tên tài sản / đồ dùng đối ứng');
    } else if (loaiDoiUng === 'TIEN') {
      const tienNum = Number(tienDoiUng);
      if (!tienDoiUng || isNaN(tienNum) || tienNum <= 0) return toast.error('Vui lòng nhập số tiền bù hợp lệ (> 0)');
      finalTaiSan = `Bù tiền mặt đối ứng (${tienNum.toLocaleString('vi-VN')} VNĐ)`;
      finalTien = tienNum;
    } else if (loaiDoiUng === 'CA_HAI') {
      if (!finalTaiSan) return toast.error('Vui lòng nhập tên tài sản / đồ dùng đối ứng');
      const tienNum = Number(tienDoiUng);
      if (tienDoiUng && (!isNaN(tienNum) && tienNum > 0)) {
        finalTien = tienNum;
      }
    }

    setSubmittingProposal(true);
    try {
      await proposalsService.createProposal({
        bai_dang_id: asset.bai_dang_id,
        so_luong_yeu_cau: Number(soLuongYeuCau),
        loi_nhan: loiNhan || undefined,
        tai_san_doi_ung: finalTaiSan,
        tien_doi_ung: finalTien,
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

  const openReportModal = () => {
    setLyDoBaoCao('');
    setMoTaReport('');
    setMinhChungImage('');
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setLyDoBaoCao('');
    setMoTaReport('');
    setMinhChungImage('');
  };

  const handleUploadEvidence = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingEvidence(true);
    try {
      const res = await uploadService.uploadSingle(file);
      setMinhChungImage(res.url);
      toast.success('Đã tải ảnh bằng chứng lên thành công!');
    } catch (err: any) {
      toast.error('Tải ảnh bằng chứng thất bại, vui lòng thử lại');
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !user || !lyDoBaoCao) return;

    setSubmittingReport(true);
    try {
      await reportsService.createReport({
        bai_dang_bi_bao_cao_id: asset.bai_dang_id,
        nguoi_dung_bi_bao_cao_id: asset.chu_so_huu_id,
        ly_do_bao_cao: lyDoBaoCao,
        mo_ta_chi_tiet: moTaReport || undefined,
        minh_chung: minhChungImage || undefined,
      });

      toast.success('Báo cáo vi phạm đã được gửi đến Ban Quản Trị!');
      closeReportModal();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gửi báo cáo thất bại!';
      toast.error(msg);
    } finally {
      setSubmittingReport(false);
    }
  };

  const openAppealModal = () => {
    setLyDoKhangCao(`Kháng cáo quyết định khóa/ẩn bài đăng "${asset?.ten_tai_san}"`);
    setMoTaKhangCao('');
    setMinhChungKhangCao('');
    setShowAppealModal(true);
  };

  const handleUploadAppealEvidence = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAppealEvidence(true);
    try {
      const res = await uploadService.uploadSingle(file);
      setMinhChungKhangCao(res.url);
      toast.success('Đã tải ảnh minh chứng giải trình!');
    } catch (err: any) {
      toast.error('Tải ảnh thất bại, vui lòng thử lại');
    } finally {
      setUploadingAppealEvidence(false);
    }
  };

  const handleSendAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !user) return;
    if (!moTaKhangCao.trim()) return toast.error('Vui lòng nhập nội dung giải trình kháng cáo');

    setSubmittingAppeal(true);
    try {
      await reportsService.createReport({
        bai_dang_bi_bao_cao_id: asset.bai_dang_id,
        ly_do_bao_cao: lyDoKhangCao,
        mo_ta_chi_tiet: moTaKhangCao.trim(),
        minh_chung: minhChungKhangCao || undefined,
        loai_bao_cao: 'KHANG_CAO',
      });

      toast.success('Đã gửi đơn kháng cáo thành công! Quản trị viên sẽ xem xét giải trình của bạn.');
      setShowAppealModal(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gửi kháng cáo thất bại!';
      toast.error(msg);
    } finally {
      setSubmittingAppeal(false);
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
      <button onClick={handleGoBack} className="btn btn-outline text-xs mb-6 inline-flex items-center gap-1.5">
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
                  <ArrowLeftRight className="w-3.5 h-3.5" /> Trao đổi ({asset.hinh_thuc_trao_doi === 'TIEN' ? 'Tài sản + Bù tiền' : 'Tài sản'})
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
                <Link
                  to={`/profile/${asset.chu_so_huu.nguoi_dung_id}`}
                  className="flex items-center gap-3 hover:opacity-85 transition-opacity group"
                  title="Xem hồ sơ & uy tín của chủ sở hữu"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 flex items-center justify-center font-extrabold text-white shadow-md shadow-emerald-500/20 overflow-hidden flex-shrink-0 group-hover:ring-2 group-hover:ring-emerald-400">
                    {asset.chu_so_huu.ho_so?.anh_dai_dien ? (
                      <img src={asset.chu_so_huu.ho_so.anh_dai_dien} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      asset.chu_so_huu.ho_so?.ho_ten?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-primary text-base group-hover:text-indigo-400 group-hover:underline">
                      {asset.chu_so_huu.ho_so?.ho_ten || 'Thành viên'}
                    </h4>
                    <p className="text-xs text-muted">Chủ sở hữu bài đăng (Nhấn để xem hồ sơ)</p>
                  </div>
                </Link>

                {asset.chu_so_huu.uy_tin && (
                  <div className="text-right">
                    {Number(asset.chu_so_huu.uy_tin.tong_so_danh_gia) > 0 ? (
                      <>
                        <div className="flex items-center justify-end gap-1 text-brand-amber font-extrabold text-sm">
                          <Star className="w-4 h-4 fill-amber-400" />
                          {asset.chu_so_huu.uy_tin.diem_trung_binh} / 5.0
                        </div>
                        <span className="text-xs text-muted">
                          ({asset.chu_so_huu.uy_tin.tong_so_danh_gia} đánh giá)
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-muted bg-slate-800/40 px-2 py-1 rounded-md border border-slate-700/50">
                        Chưa có đánh giá
                      </span>
                    )}
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
              <div className="space-y-3">
                <div className="p-3 glass-panel rounded-xl text-center text-sm font-semibold text-brand-primary">
                  Đây là bài đăng tài sản do bạn khởi tạo
                </div>
                {(asset.trang_thai === 'DA_KET_THUC' || asset.trang_thai === 'TAM_AN' || asset.trang_thai === 'VO_HIEU') && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 space-y-2">
                    <p className="text-xs font-semibold">
                      ⚠️ Bài đăng này hiện đang bị ẩn hoặc tạm dừng do kiểm duyệt vi phạm. Nếu bạn cho rằng đây là sự nhầm lẫn, hãy gửi đơn kháng cáo giải trình.
                    </p>
                    <button
                      onClick={openAppealModal}
                      className="btn btn-amber text-xs font-bold w-full flex items-center justify-center gap-1.5 py-2.5"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      📢 Gửi đơn kháng cáo cho Quản trị viên
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={openProposalModal}
                  disabled={asset.so_luong_kha_dung <= 0}
                  className="btn btn-emerald flex-1 py-3 text-base"
                >
                  <Send className="w-5 h-5" />
                  {asset.hinh_thuc_chia_se === 'CHO_TANG' ? 'Gửi đề xuất nhận quà' : 'Gửi đề xuất trao đổi'}
                </button>

                <button
                  onClick={openReportModal}
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

              {asset.hinh_thuc_chia_se === 'CHO_TANG' ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-brand-emerald space-y-1">
                  <div className="flex items-center gap-2 font-extrabold text-sm text-emerald-400">
                    <Gift className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Bài đăng Cho / Tặng Miễn Phí</span>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">
                    Đây là vật phẩm cho tặng cộng đồng. Bạn chỉ cần nhập số lượng và gửi lời nhắn (nếu có), không cần nhập tài sản hay tiền đối ứng.
                  </p>
                </div>
              ) : (
                <div className="form-group space-y-3">
                  <label className="form-label font-bold text-primary block">
                    Hình thức đối ứng đề xuất <span className="text-rose-500">*</span>
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setLoaiDoiUng('TAI_SAN')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        loaiDoiUng === 'TAI_SAN'
                          ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400 font-bold shadow-md'
                          : 'border-color text-secondary hover:bg-card-hover'
                      }`}
                    >
                      <Box className="w-4 h-4" />
                      Đổi đồ dùng
                    </button>

                    <button
                      type="button"
                      onClick={() => setLoaiDoiUng('TIEN')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        loaiDoiUng === 'TIEN'
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold shadow-md'
                          : 'border-color text-secondary hover:bg-card-hover'
                      }`}
                    >
                      <span className="text-sm font-black">$</span>
                      Bù tiền mặt
                    </button>

                    <button
                      type="button"
                      onClick={() => setLoaiDoiUng('CA_HAI')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        loaiDoiUng === 'CA_HAI'
                          ? 'border-amber-500 bg-amber-500/15 text-amber-400 font-bold shadow-md'
                          : 'border-color text-secondary hover:bg-card-hover'
                      }`}
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                      Đổi đồ + Bù tiền
                    </button>
                  </div>

                  {(loaiDoiUng === 'TAI_SAN' || loaiDoiUng === 'CA_HAI') && (
                    <div>
                      <label className="form-label text-xs">Tên tài sản / Đồ dùng mang ra đổi *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Tai nghe Sony WH-1000XM4, Sách giáo khoa..."
                        value={taiSanDoiUng}
                        onChange={(e) => setTaiSanDoiUng(e.target.value)}
                        className="form-input text-sm"
                        required
                      />
                    </div>
                  )}

                  {(loaiDoiUng === 'TIEN' || loaiDoiUng === 'CA_HAI') && (
                    <div>
                      <label className="form-label text-xs">Số tiền đối ứng bù thêm (VNĐ) *</label>
                      <input
                        type="number"
                        placeholder="Ví dụ: 1000, 50000, 100000..."
                        value={tienDoiUng}
                        onChange={(e) => handleTienDoiUngChange(e.target.value)}
                        className={`form-input text-sm ${
                          tienDoiUngError ? 'border-rose-500 focus:ring-rose-500' : ''
                        }`}
                        required={loaiDoiUng === 'TIEN'}
                      />
                      {tienDoiUng && !isNaN(Number(tienDoiUng)) && Number(tienDoiUng) > 0 && (
                        <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                          ✓ Bù thêm: {Number(tienDoiUng).toLocaleString('vi-VN')} VNĐ
                        </p>
                      )}
                      {tienDoiUngError && (
                        <p className="text-xs text-rose-400 font-medium mt-1 flex items-center gap-1">
                          ⚠️ {tienDoiUngError}
                        </p>
                      )}
                    </div>
                  )}
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

              <div className="form-group">
                <label className="form-label flex items-center justify-between">
                  <span>Hình ảnh / Minh chứng vi phạm</span>
                  <span className="text-[11px] text-muted font-normal">(Ảnh chụp minh chứng)</span>
                </label>

                {minhChungImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-color max-h-40 bg-card-hover group">
                    <img src={minhChungImage} alt="Bằng chứng vi phạm" className="w-full h-36 object-cover" />
                    <button
                      type="button"
                      onClick={() => setMinhChungImage('')}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors shadow-lg"
                      title="Xóa ảnh minh chứng"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadEvidence}
                      id="report-evidence-upload"
                      className="hidden"
                      disabled={uploadingEvidence}
                    />
                    <label
                      htmlFor="report-evidence-upload"
                      className="cursor-pointer border-2 border-dashed border-color hover:border-brand-rose/60 p-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-xs text-secondary hover:text-brand-rose transition-colors bg-card-hover/40"
                    >
                      {uploadingEvidence ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-brand-rose" />
                          <span>Đang tải ảnh bằng chứng lên...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 text-brand-rose" />
                          <span>Tải ảnh minh chứng vi phạm từ máy tính</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeReportModal}
                  className="btn btn-outline flex-1"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingReport || uploadingEvidence}
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

      {/* Modal: Create Appeal */}
      {showAppealModal && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-color shadow-2xl animate-fade-in space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-color">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-brand-amber" />
                Gửi Đơn Kháng Cáo Bài Đăng
              </h2>
              <button
                onClick={() => setShowAppealModal(false)}
                className="p-1 rounded-lg text-muted hover:text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-secondary">
              Bài đăng: <span className="font-semibold text-primary">{asset.ten_tai_san}</span>
            </p>

            <form onSubmit={handleSendAppeal} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Tiêu đề kháng cáo *</label>
                <input
                  type="text"
                  value={lyDoKhangCao}
                  onChange={(e) => setLyDoKhangCao(e.target.value)}
                  className="form-input text-sm"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nội dung giải trình chi tiết *</label>
                <textarea
                  rows={4}
                  placeholder="Giải trình lý do bạn cho rằng bài đăng của mình hợp lệ và không vi phạm quy định..."
                  value={moTaKhangCao}
                  onChange={(e) => setMoTaKhangCao(e.target.value)}
                  className="form-textarea text-sm"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label flex items-center justify-between">
                  <span>Ảnh minh chứng giải trình</span>
                  <span className="text-[11px] text-muted font-normal">(Hình ảnh đính kèm)</span>
                </label>

                {minhChungKhangCao ? (
                  <div className="relative rounded-2xl overflow-hidden border border-color max-h-40 bg-card-hover group">
                    <img src={minhChungKhangCao} alt="Bằng chứng kháng cáo" className="w-full h-36 object-cover" />
                    <button
                      type="button"
                      onClick={() => setMinhChungKhangCao('')}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors shadow-lg"
                      title="Xóa ảnh"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadAppealEvidence}
                      id="appeal-evidence-upload"
                      className="hidden"
                      disabled={uploadingAppealEvidence}
                    />
                    <label
                      htmlFor="appeal-evidence-upload"
                      className="cursor-pointer border-2 border-dashed border-color hover:border-brand-amber/60 p-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-xs text-secondary hover:text-brand-amber transition-colors bg-card-hover/40"
                    >
                      {uploadingAppealEvidence ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-brand-amber" />
                          <span>Đang tải ảnh giải trình lên...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 text-brand-amber" />
                          <span>Tải ảnh minh chứng giải trình từ máy tính</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAppealModal(false)}
                  className="btn btn-outline flex-1 text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingAppeal || uploadingAppealEvidence}
                  className="btn btn-amber flex-1 text-xs font-bold"
                >
                  {submittingAppeal ? 'Đang gửi...' : 'Gửi đơn kháng cáo'}
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
