import React, { useEffect, useState } from 'react';
import { reportsService } from '../../services/reports.service';
import type { Report } from '../../types';
import toast from 'react-hot-toast';
import { ShieldAlert, CheckCircle, Eye } from 'lucide-react';
import { createPortal } from 'react-dom';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Process Modal state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [trangThaiXuLy, setTrangThaiXuLy] = useState<'DA_XU_LY' | 'TU_CHOI'>('DA_XU_LY');
  const [loaiBienPhap, setLoaiBienPhap] = useState<'AN_BAI_DANG' | 'KHOA_TAI_KHOAN' | 'KHONG_VI_PHAM'>('AN_BAI_DANG');
  const [noiDungXuLy, setNoiDungXuLy] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getAllReportsAdmin();
      setReports(data);
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
                  <th className="p-4">Ngày gửi</th>
                  <th className="p-4">Người báo cáo</th>
                  <th className="p-4">Đối tượng vi phạm</th>
                  <th className="p-4">Lý do vi phạm</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-color text-sm">
                {reports.map((report) => (
                  <tr key={report.bao_cao_id} className="hover:bg-card-hover transition-colors whitespace-nowrap">
                    <td className="p-4 text-muted text-xs whitespace-nowrap">
                      {new Date(report.ngay_bao_cao).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 font-semibold text-primary">
                      {report.nguoi_bao_cao?.ho_so?.ho_ten || 'Thành viên'}
                    </td>
                    <td className="p-4">
                      {report.bai_dang_bi_bao_cao ? (
                        <span className="text-brand-primary font-medium line-clamp-1">
                          [Bài đăng] {report.bai_dang_bi_bao_cao.ten_tai_san}
                        </span>
                      ) : (
                        <span className="text-brand-amber font-medium">
                          [Tài khoản] {report.nguoi_dung_bi_bao_cao?.ho_so?.ho_ten}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-brand-rose font-semibold">{report.ly_do_vi_pham}</td>
                    <td className="p-4">
                      {report.trang_thai_xu_ly === 'CHO_KIEM_DUYET' ? (
                        <span className="badge badge-amber">Chờ kiểm duyệt</span>
                      ) : report.trang_thai_xu_ly === 'DA_XU_LY' ? (
                        <span className="badge badge-emerald">Đã xử lý</span>
                      ) : (
                        <span className="badge badge-rose">Từ chối</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="btn btn-outline py-1.5 px-3 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Kiểm duyệt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Process Report Action */}
      {selectedReport && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-5 sm:p-6 rounded-3xl border border-color shadow-2xl animate-fade-in">
            <h2 className="text-lg sm:text-xl font-bold text-primary mb-1">Quyết Định Kiểm Duyệt Vi Phạm</h2>
            <p className="text-xs text-brand-rose mb-4">Mã Báo cáo: #{selectedReport.bao_cao_id.substring(0, 8)}</p>

            <form onSubmit={handleProcessSubmit} className="space-y-4">
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

              <div className="form-group">
                <label className="form-label">Ghi chú giải trình quyết định</label>
                <textarea
                  rows={3}
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
                  Hủy bỏ
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
