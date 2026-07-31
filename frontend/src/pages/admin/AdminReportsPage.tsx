import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsService } from '../../services/reports.service';
import type { Report } from '../../types';
import { Pagination } from '../../components/common/Pagination';
import toast from 'react-hot-toast';
import { ShieldAlert, CheckCircle, Eye, ExternalLink, User, Package, FileText, Image as ImageIcon } from 'lucide-react';
import { createPortal } from 'react-dom';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Process Modal state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [trangThaiXuLy, setTrangThaiXuLy] = useState<'DA_XU_LY' | 'TU_CHOI'>('DA_XU_LY');
  const [loaiBienPhap, setLoaiBienPhap] = useState<'AN_BAI_DANG' | 'KHOA_TAI_KHOAN' | 'KHONG_VI_PHAM' | 'KHOI_PHUC_BAI_DANG'>('AN_BAI_DANG');
  const [noiDungXuLy, setNoiDungXuLy] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);
  const [reportFilter, setReportFilter] = useState<'ALL' | 'REPORT' | 'APPEAL'>('ALL');

  useEffect(() => {
    fetchReports();
  }, [page, limit]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getAllReportsAdmin({ page, limit });
      if (Array.isArray(data)) {
        setReports(data);
      } else {
        setReports(data.items || []);
        const meta = data.meta || data.pagination;
        if (meta) {
          setTotalItems(meta.total);
          setTotalPages(meta.totalPages);
        }
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách báo cáo vi phạm:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setSubmittingAction(true);
    try {
      await reportsService.processReportAdmin(selectedReport.bao_cao_id, {
        trang_thai_xu_ly: trangThaiXuLy,
        loai_bien_phap: trangThaiXuLy === 'DA_XU_LY' ? loaiBienPhap : 'KHONG_VI_PHAM',
        noi_dung_xu_ly: noiDungXuLy || undefined,
      });

      toast.success('Đã thực thi quyết định xử lý báo cáo vi phạm!');
      setSelectedReport(null);
      fetchReports();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Xử lý thất bại!';
      toast.error(msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    if (report.loai_bao_cao === 'KHANG_CAO') {
      setLoaiBienPhap('KHOI_PHUC_BAI_DANG');
    } else {
      setLoaiBienPhap('AN_BAI_DANG');
    }
  };

  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'REPORT') return r.loai_bao_cao !== 'KHANG_CAO';
    if (reportFilter === 'APPEAL') return r.loai_bao_cao === 'KHANG_CAO';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center sm:items-start justify-between text-center sm:text-left gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-rose-500/20 text-brand-rose flex items-center justify-center border border-rose-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary">Trung Tâm Kiểm Duyệt Vi Phạm & Kháng Cáo</h1>
            <p className="text-sm text-secondary mt-1 sm:mt-0">Xử lý báo cáo vi phạm & giải trình đơn kháng cáo từ người dùng</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-card-hover p-1.5 rounded-2xl border border-color shrink-0">
          <button
            onClick={() => setReportFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              reportFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Tất cả ({reports.length})
          </button>
          <button
            onClick={() => setReportFilter('REPORT')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              reportFilter === 'REPORT'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-secondary hover:text-primary'
            }`}
          >
            🚨 Báo cáo ({reports.filter((r) => r.loai_bao_cao !== 'KHANG_CAO').length})
          </button>
          <button
            onClick={() => setReportFilter('APPEAL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              reportFilter === 'APPEAL'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-secondary hover:text-primary'
            }`}
          >
            📢 Kháng cáo ({reports.filter((r) => r.loai_bao_cao === 'KHANG_CAO').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-8 h-64 animate-pulse rounded-3xl" />
      ) : filteredReports.length === 0 ? (
        <div className="glass-card text-center py-16 px-4">
          <CheckCircle className="w-16 h-16 text-brand-emerald mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-primary mb-1">Không có dữ liệu phù hợp</h3>
          <p className="text-sm text-secondary">Không tìm thấy báo cáo hoặc đơn kháng cáo nào ở danh mục này.</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden rounded-3xl border border-color shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="border-b border-color bg-card-hover text-xs font-bold text-secondary uppercase tracking-wider whitespace-nowrap">
                  <th className="p-4 text-left whitespace-nowrap">Ngày gửi</th>
                  <th className="p-4 text-left whitespace-nowrap">Người gửi</th>
                  <th className="p-4 text-left whitespace-nowrap">Đối tượng</th>
                  <th className="p-4 text-left whitespace-nowrap">Phân loại & Lý do</th>
                  <th className="p-4 text-left whitespace-nowrap">Trạng thái</th>
                  <th className="p-4 text-left whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-color text-sm">
                {filteredReports.map((report) => (
                  <tr key={report.bao_cao_id} className="hover:bg-card-hover transition-colors whitespace-nowrap">
                    <td className="p-4 text-muted text-xs whitespace-nowrap">
                      {new Date(report.ngay_bao_cao).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 font-semibold text-primary whitespace-nowrap">
                      {report.nguoi_bao_cao?.nguoi_dung_id ? (
                        <Link
                          to={`/profile/${report.nguoi_bao_cao.nguoi_dung_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-indigo-400 hover:underline truncate max-w-[160px] inline-flex items-center gap-1"
                          title="Xem trang cá nhân người báo cáo"
                        >
                          <span>{report.nguoi_bao_cao?.ho_so?.ho_ten || 'Thành viên'}</span>
                          <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                        </Link>
                      ) : (
                        <span className="truncate max-w-[160px] block">
                          {report.nguoi_bao_cao?.ho_so?.ho_ten || 'Thành viên'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {report.bai_dang_bi_bao_cao ? (
                        <Link
                          to={`/assets/${report.bai_dang_bi_bao_cao.bai_dang_id}`}
                          state={{ fromAdminReports: true }}
                          className="text-brand-primary font-medium hover:underline truncate max-w-[220px] inline-flex items-center gap-1"
                          title={`Xem bài đăng: ${report.bai_dang_bi_bao_cao.ten_tai_san}`}
                        >
                          <span>[Bài đăng] {report.bai_dang_bi_bao_cao.ten_tai_san}</span>
                          <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                        </Link>
                      ) : report.nguoi_dung_bi_bao_cao ? (
                        <Link
                          to={`/profile/${report.nguoi_dung_bi_bao_cao.nguoi_dung_id}`}
                          state={{ fromAdminReports: true }}
                          className="text-brand-amber font-medium hover:underline truncate max-w-[200px] inline-flex items-center gap-1"
                          title="Xem trang cá nhân người bị báo cáo"
                        >
                          <span>[Tài khoản] {report.nguoi_dung_bi_bao_cao?.ho_so?.ho_ten || 'Thành viên'}</span>
                          <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                        </Link>
                      ) : (
                        <span className="text-secondary font-medium">[Hệ thống]</span>
                      )}
                    </td>
                    <td className="p-4 font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {report.loai_bao_cao === 'KHANG_CAO' && (
                          <span className="badge badge-amber text-[10px] flex items-center gap-0.5" title="Đơn kháng cáo">
                            📢 Kháng cáo
                          </span>
                        )}
                        <span className="truncate max-w-[200px] block text-brand-rose" title={report.ly_do_vi_pham}>
                          {report.ly_do_vi_pham}
                        </span>
                        {report.minh_chung && (
                          <span className="badge badge-indigo text-[10px] flex items-center gap-0.5" title="Có hình ảnh minh chứng">
                            <ImageIcon className="w-3 h-3" /> Ảnh
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center justify-start">
                        {report.trang_thai_xu_ly === 'CHO_KIEM_DUYET' ? (
                          <span className="badge badge-amber">Chờ kiểm duyệt</span>
                        ) : report.trang_thai_xu_ly === 'DA_XU_LY' ? (
                          <span className="badge badge-emerald">Đã xử lý</span>
                        ) : (
                          <span className="badge badge-rose">Từ chối</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-left whitespace-nowrap">
                      <button
                        onClick={() => handleSelectReport(report)}
                        className="btn btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5" /> Xem & Kiểm duyệt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        limit={limit}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        limitOptions={[5, 10, 20, 50]}
        className="mt-8"
      />

      {/* Modal: Process Report Action & Details */}
      {selectedReport && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full p-6 rounded-3xl border border-color shadow-2xl animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-color">
              <div>
                <h2 className="text-xl font-bold text-primary">Chi Tiết & Kiểm Duyệt Báo Cáo</h2>
                <p className="text-xs text-brand-rose mt-0.5">Mã Báo cáo: #{selectedReport.bao_cao_id}</p>
              </div>
              <span className="text-xs text-muted">
                {new Date(selectedReport.ngay_bao_cao).toLocaleString('vi-VN')}
              </span>
            </div>

            {/* Detailed Report Overview Section */}
            <div className="space-y-4 mb-6 text-sm">
              {/* Linked Target Info */}
              <div className="p-4 rounded-2xl bg-card-hover border border-color space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    {selectedReport.bai_dang_bi_bao_cao ? (
                      <Package className="w-4 h-4 text-brand-primary" />
                    ) : (
                      <User className="w-4 h-4 text-brand-amber" />
                    )}
                    Đối Tượng Bị Báo Cáo
                  </span>

                  {selectedReport.bai_dang_bi_bao_cao ? (
                    <Link
                      to={`/assets/${selectedReport.bai_dang_bi_bao_cao.bai_dang_id}`}
                      state={{ fromAdminReports: true }}
                      className="btn btn-outline py-1 px-3 text-xs flex items-center gap-1 text-brand-primary border-brand-primary/40 hover:bg-brand-primary/10"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Xem bài đăng gốc
                    </Link>
                  ) : selectedReport.nguoi_dung_bi_bao_cao ? (
                    <Link
                      to={`/profile/${selectedReport.nguoi_dung_bi_bao_cao.nguoi_dung_id}`}
                      state={{ fromAdminReports: true }}
                      className="btn btn-outline py-1 px-3 text-xs flex items-center gap-1 text-brand-amber border-brand-amber/40 hover:bg-brand-amber/10"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Xem trang cá nhân
                    </Link>
                  ) : null}
                </div>

                {selectedReport.bai_dang_bi_bao_cao ? (
                  <div className="space-y-1">
                    <p className="font-bold text-primary text-base">
                      {selectedReport.bai_dang_bi_bao_cao.ten_tai_san}
                    </p>
                    {selectedReport.bai_dang_bi_bao_cao.mo_ta_hien_trang && (
                      <p className="text-xs text-secondary line-clamp-2">
                        {selectedReport.bai_dang_bi_bao_cao.mo_ta_hien_trang}
                      </p>
                    )}
                  </div>
                ) : selectedReport.nguoi_dung_bi_bao_cao ? (
                  <div className="space-y-1">
                    <p className="font-bold text-primary text-base">
                      {selectedReport.nguoi_dung_bi_bao_cao.ho_so?.ho_ten || 'Thành viên'}
                    </p>
                    <p className="text-xs text-secondary">
                      Email: {selectedReport.nguoi_dung_bi_bao_cao.email || 'N/A'}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-secondary font-medium">Lỗi toàn hệ thống / Chung</p>
                )}
              </div>

              {/* Reporter Info */}
              <div className="p-3.5 rounded-2xl bg-card-hover border border-color flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted block mb-0.5">Người thực hiện báo cáo:</span>
                  <span className="font-semibold text-primary">
                    {selectedReport.nguoi_bao_cao?.ho_so?.ho_ten || 'Thành viên'} ({selectedReport.nguoi_bao_cao?.email || 'N/A'})
                  </span>
                </div>
                {selectedReport.nguoi_bao_cao?.nguoi_dung_id && (
                  <Link
                    to={`/profile/${selectedReport.nguoi_bao_cao.nguoi_dung_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Hồ sơ người báo cáo <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Report Reason & Evidence */}
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-brand-rose font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  Lý Do Vi Phạm & Bằng Chứng
                </div>
                <p className="font-semibold text-primary text-sm">
                  {selectedReport.ly_do_vi_pham}
                </p>
                {selectedReport.mo_ta_chi_tiet && selectedReport.mo_ta_chi_tiet !== selectedReport.ly_do_vi_pham && (
                  <div className="pt-1 text-xs text-secondary leading-relaxed bg-background/50 p-3 rounded-xl border border-color">
                    <span className="font-semibold text-primary block mb-1">Mô tả chi tiết bằng chứng:</span>
                    {selectedReport.mo_ta_chi_tiet}
                  </div>
                )}
                {(selectedReport.danh_sach_minh_chung && selectedReport.danh_sach_minh_chung.length > 0) || selectedReport.minh_chung ? (
                  <div className="pt-2 border-t border-color/40 mt-2">
                    <span className="text-xs font-semibold text-secondary flex items-center gap-1 mb-2">
                      <ImageIcon className="w-3.5 h-3.5 text-brand-primary" /> 
                      Danh sách minh chứng đính kèm ({selectedReport.danh_sach_minh_chung?.length || 1}):
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(selectedReport.danh_sach_minh_chung && selectedReport.danh_sach_minh_chung.length > 0
                        ? selectedReport.danh_sach_minh_chung
                        : [{
                            minh_chung_id: 'legacy',
                            bao_cao_id: selectedReport.bao_cao_id,
                            duong_dan_tep: selectedReport.minh_chung!,
                            ten_tep: 'Bằng chứng đính kèm',
                          }]
                      ).map((mc, idx) => {
                        const isImage = !mc.loai_tep || mc.loai_tep.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(mc.duong_dan_tep);

                        return (
                          <div
                            key={mc.minh_chung_id || idx}
                            className="flex flex-col p-2.5 rounded-xl border border-color bg-background/80 hover:border-brand-primary/50 transition-colors shadow-sm"
                          >
                            {isImage ? (
                              <a
                                href={mc.duong_dan_tep}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-lg overflow-hidden border border-color group relative bg-black/5"
                                title="Bấm để mở ảnh trong tab mới"
                              >
                                <img
                                  src={mc.duong_dan_tep}
                                  alt={mc.ten_tep || 'Minh chứng'}
                                  className="h-32 w-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                                  <ExternalLink className="w-4 h-4 mr-1" /> Xem ảnh lớn
                                </div>
                              </a>
                            ) : (
                              <div className="h-32 flex flex-col items-center justify-center bg-slate-900/10 rounded-lg p-2 text-center border border-dashed border-color">
                                <FileText className="w-8 h-8 text-brand-primary mb-1" />
                                <span className="text-xs font-medium text-primary truncate max-w-full">
                                  {mc.ten_tep || 'Tệp đính kèm'}
                                </span>
                              </div>
                            )}

                            <div className="mt-2 flex items-center justify-between gap-1 text-[11px] text-secondary">
                              <span className="truncate font-medium text-primary" title={mc.ten_tep || mc.duong_dan_tep}>
                                #{idx + 1} {mc.ten_tep || 'Bằng chứng đính kèm'}
                              </span>
                              <a
                                href={mc.duong_dan_tep}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-primary underline inline-flex items-center gap-0.5 shrink-0 font-mono"
                              >
                                Mở link <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-color/40 mt-2 flex items-center gap-1.5 text-xs text-muted italic">
                    <ImageIcon className="w-3.5 h-3.5 opacity-50 text-secondary" />
                    <span>Không có hình ảnh đính kèm</span>
                  </div>
                )}
              </div>

              {/* Action History if processed */}
              {selectedReport.bien_phap && selectedReport.bien_phap.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-brand-emerald font-bold text-xs uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4" />
                    Lịch Sử Xử Lý Trước Đó
                  </div>
                  {selectedReport.bien_phap.map((bp, idx) => (
                    <div key={idx} className="text-xs text-secondary space-y-1">
                      <p><span className="font-semibold text-primary">Biện pháp:</span> {bp.loai_bien_phap}</p>
                      {bp.noi_dung_xu_ly && <p><span className="font-semibold text-primary">Ghi chú:</span> {bp.noi_dung_xu_ly}</p>}
                      <p className="text-[11px] text-muted">
                        Bởi Quản trị viên: {bp.quan_tri_vien?.ho_so?.ho_ten || bp.quan_tri_vien_id} - {new Date(bp.thoi_gian_xu_ly).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Decision Action Form */}
            <form onSubmit={handleProcessSubmit} className="space-y-4 pt-3 border-t border-color">
              <h3 className="text-base font-bold text-primary">Quyết Định Kiểm Duyệt</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Quyết định xử lý *</label>
                  <select
                    value={trangThaiXuLy}
                    onChange={(e) => setTrangThaiXuLy(e.target.value as 'DA_XU_LY' | 'TU_CHOI')}
                    className="form-select"
                  >
                    <option value="DA_XU_LY">Phê duyệt & Chấp nhận quyết định</option>
                    <option value="TU_CHOI">Bác bỏ (Không chấp nhận)</option>
                  </select>
                </div>

                {trangThaiXuLy === 'DA_XU_LY' && (
                  <div className="form-group">
                    <label className="form-label">Biện pháp thực thi *</label>
                    <select
                      value={loaiBienPhap}
                      onChange={(e) => setLoaiBienPhap(e.target.value as any)}
                      className="form-select"
                    >
                      {selectedReport?.loai_bao_cao === 'KHANG_CAO' ? (
                        <>
                          <option value="KHOI_PHUC_BAI_DANG">Phê duyệt kháng cáo (Mở lại bài đăng bị khóa)</option>
                          <option value="AN_BAI_DANG">Giữ nguyên ẩn / khóa bài đăng</option>
                        </>
                      ) : (
                        <>
                          <option value="AN_BAI_DANG">Ẩn / Khóa bài đăng vi phạm</option>
                          <option value="KHOA_TAI_KHOAN">Khóa tài khoản thành viên vi phạm</option>
                        </>
                      )}
                    </select>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Ghi chú giải trình quyết định</label>
                <textarea
                  rows={2}
                  placeholder="Ghi rõ căn cứ quyết định xử lý để lưu nhật ký hệ thống..."
                  value={noiDungXuLy}
                  onChange={(e) => setNoiDungXuLy(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="btn btn-outline w-full sm:flex-1 order-2 sm:order-1"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="btn btn-emerald w-full sm:flex-1 order-1 sm:order-2"
                >
                  {submittingAction ? 'Đang thực thi...' : 'Xác Nhận Xử Lý'}
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
