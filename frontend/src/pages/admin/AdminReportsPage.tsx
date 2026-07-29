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
  const [loaiBienPhap, setLoaiBienPhap] = useState<'AN_BAI_DANG' | 'KHOA_TAI_KHOAN' | 'KHONG_VI_PHAM'>('AN_BAI_DANG');
  const [noiDungXuLy, setNoiDungXuLy] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-3">
        <div className="w-12 h-12 shrink-0 rounded-2xl bg-rose-500/20 text-brand-rose flex items-center justify-center border border-rose-500/30">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary">Trung Tâm Kiểm Duyệt Vi Phạm</h1>
          <p className="text-sm text-secondary mt-1 sm:mt-0">Xử lý báo cáo nội dung bài đăng & tài khoản thành viên vi phạm quy định</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-8 h-64 animate-pulse rounded-3xl" />
      ) : reports.length === 0 ? (
        <div className="glass-card text-center py-16 px-4">
          <CheckCircle className="w-16 h-16 text-brand-emerald mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-primary mb-1">Không có báo cáo vi phạm nào</h3>
          <p className="text-sm text-secondary">Tất cả bài đăng và tài khoản trên hệ thống đang hoạt động tuân thủ quy chuẩn.</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden rounded-3xl border border-color shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="border-b border-color bg-card-hover text-xs font-bold text-secondary uppercase tracking-wider whitespace-nowrap">
                  <th className="p-4 text-left whitespace-nowrap">Ngày gửi</th>
                  <th className="p-4 text-left whitespace-nowrap">Người báo cáo</th>
                  <th className="p-4 text-left whitespace-nowrap">Đối tượng vi phạm</th>
                  <th className="p-4 text-left whitespace-nowrap">Lý do vi phạm</th>
                  <th className="p-4 text-left whitespace-nowrap">Trạng thái</th>
                  <th className="p-4 text-left whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-color text-sm">
                {reports.map((report) => (
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
                    <td className="p-4 text-brand-rose font-semibold whitespace-nowrap">
                      <span className="truncate max-w-[220px] block" title={report.ly_do_vi_pham}>
                        {report.ly_do_vi_pham}
                      </span>
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
                        onClick={() => setSelectedReport(report)}
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
                {selectedReport.minh_chung && (
                  <div className="pt-2 border-t border-color/40 mt-2">
                    <span className="text-xs font-semibold text-secondary flex items-center gap-1 mb-2">
                      <ImageIcon className="w-3.5 h-3.5 text-brand-primary" /> Hình ảnh / Minh chứng đính kèm:
                    </span>
                    <div className="flex flex-col gap-2">
                      <a
                        href={selectedReport.minh_chung}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl overflow-hidden border border-color max-w-xs hover:opacity-90 transition-opacity group relative shadow-md"
                        title="Bấm để xem ảnh gốc kích thước lớn"
                      >
                        <img
                          src={selectedReport.minh_chung}
                          alt="Bằng chứng vi phạm"
                          className="max-h-48 w-auto object-cover rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                          <ExternalLink className="w-4 h-4 mr-1" /> Xem ảnh đầy đủ
                        </div>
                      </a>
                      <a
                        href={selectedReport.minh_chung}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-primary underline break-all inline-flex items-center gap-1 font-mono"
                      >
                        {selectedReport.minh_chung} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
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
                    <option value="DA_XU_LY">Phê duyệt báo cáo & Thi hành kỷ luật</option>
                    <option value="TU_CHOI">Bác bỏ báo cáo (Không vi phạm)</option>
                  </select>
                </div>

                {trangThaiXuLy === 'DA_XU_LY' && (
                  <div className="form-group">
                    <label className="form-label">Biện pháp xử lý *</label>
                    <select
                      value={loaiBienPhap}
                      onChange={(e) => setLoaiBienPhap(e.target.value as 'AN_BAI_DANG' | 'KHOA_TAI_KHOAN')}
                      className="form-select"
                    >
                      <option value="AN_BAI_DANG">Ẩn / Khóa bài đăng vi phạm</option>
                      <option value="KHOA_TAI_KHOAN">Khóa tài khoản thành viên vi phạm</option>
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
