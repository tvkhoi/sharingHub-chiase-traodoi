import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetsService } from '../services/assets.service';
import { uploadService } from '../services/upload.service';
import type { AssetCategory } from '../types';
import toast from 'react-hot-toast';
import { UploadCloud, X, PlusCircle, ArrowLeft } from 'lucide-react';

export const CreateAssetPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Form states
  const [danhMucId, setDanhMucId] = useState<string>('');
  const [tenTaiSan, setTenTaiSan] = useState<string>('');
  const [moTaHienTrang, setMoTaHienTrang] = useState<string>('');
  const [soLuongTong, setSoLuongTong] = useState<number>(1);
  const [hinhThucChiaSe, setHinhThucChiaSe] = useState<'CHO_TANG' | 'TRAO_DOI'>('CHO_TANG');
  const [hinhThucTraoDoi, setHinhThucTraoDoi] = useState<'TAI_SAN' | 'TIEN'>('TAI_SAN');
  const [diaDiem, setDiaDiem] = useState<string>('');

  // Upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    assetsService.getCategories().then((res) => {
      setCategories(res);
      if (res.length > 0) setDanhMucId(res[0].danh_muc_id);
    });
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenTaiSan || !moTaHienTrang || !diaDiem || !danhMucId) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error('Vui lòng đính kèm ít nhất 1 hình ảnh mô tả tài sản');
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      // Step 1: Upload images standalone via uploadService.uploadMultiple
      toast.loading('Đang tải tệp tin hình ảnh lên hệ thống...', { id: 'upload' });
      const uploadRes = await uploadService.uploadMultiple(selectedFiles);
      toast.success('Tải ảnh thành công!', { id: 'upload' });

      // Step 2: Call createAsset with clean JSON payload
      const asset = await assetsService.createAsset({
        danh_muc_id: danhMucId,
        ten_tai_san: tenTaiSan,
        mo_ta_hien_trang: moTaHienTrang,
        so_luong_tong: Number(soLuongTong),
        hinh_thuc_chia_se: hinhThucChiaSe,
        hinh_thuc_trao_doi: hinhThucChiaSe === 'TRAO_DOI' ? hinhThucTraoDoi : undefined,
        dia_diem: diaDiem,
        hinh_anh: uploadRes.urls,
      });

      toast.success('Đăng bài chia sẻ tài sản mới thành công!');
      navigate(`/assets/${asset.bai_dang_id}`);
    } catch (err: any) {
      toast.dismiss('upload');
      const msg = err.response?.data?.message || 'Đăng bài thất bại. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn btn-outline text-xs mb-6">
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </button>

      <div className="glass-panel p-5 sm:p-8 rounded-3xl border border-color shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center shadow-lg flex-shrink-0">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary">Đăng Bài Chia Sẻ / Trao Đổi</h1>
            <p className="text-xs sm:text-sm text-secondary mt-1">Tải thông tin tài sản và kết nối với thành viên cộng đồng</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Uploader */}
          <div className="form-group">
            <label className="form-label">Hình ảnh tài sản * (Tối đa 10 ảnh)</label>
            <div className="border-2 border-dashed border-color hover:border-indigo-400 rounded-2xl p-6 text-center bg-card-hover transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                id="file-upload"
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                <UploadCloud className="w-10 h-10 text-brand-primary mb-2 animate-bounce" />
                <span className="text-sm font-semibold text-primary">Kéo thả hoặc Bấm để chọn tệp tin ảnh</span>
                <span className="text-xs text-muted mt-1">Hỗ trợ PNG, JPG, JPEG, WEBP (Tối đa 5MB / file)</span>
              </label>
            </div>

            {/* Preview Grid */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-4">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-color group">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Danh mục tài sản *</label>
              <select
                value={danhMucId}
                onChange={(e) => setDanhMucId(e.target.value)}
                className="form-select"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.danh_muc_id} value={cat.danh_muc_id}>
                    {cat.ten_danh_muc}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tên tài sản *</label>
              <input
                type="text"
                placeholder="Ví dụ: Laptop Dell XPS 13, Sách giáo trình..."
                value={tenTaiSan}
                onChange={(e) => setTenTaiSan(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả hiện trạng tài sản *</label>
            <textarea
              rows={4}
              placeholder="Chi tiết cấu hình, thông số, tình trạng ngoại hình, lưu ý khi giao nhận..."
              value={moTaHienTrang}
              onChange={(e) => setMoTaHienTrang(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Hình thức chia sẻ *</label>
              <select
                value={hinhThucChiaSe}
                onChange={(e) => setHinhThucChiaSe(e.target.value as 'CHO_TANG' | 'TRAO_DOI')}
                className="form-select"
              >
                <option value="CHO_TANG">Cho tặng miễn phí</option>
                <option value="TRAO_DOI">Trao đổi lấy đồ/tiền</option>
              </select>
            </div>

            {hinhThucChiaSe === 'TRAO_DOI' && (
              <div className="form-group">
                <label className="form-label">Hình thức nhận lại</label>
                <select
                  value={hinhThucTraoDoi}
                  onChange={(e) => setHinhThucTraoDoi(e.target.value as 'TAI_SAN' | 'TIEN')}
                  className="form-select"
                >
                  <option value="TAI_SAN">Trao đổi tài sản khác</option>
                  <option value="TIEN">Bù bù thêm tiền</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Số lượng tổng *</label>
              <input
                type="number"
                min={1}
                value={soLuongTong}
                onChange={(e) => setSoLuongTong(parseInt(e.target.value) || 1)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Địa điểm giao nhận trực tiếp *</label>
            <input
              type="text"
              placeholder="Ví dụ: 123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM"
              value={diaDiem}
              onChange={(e) => setDiaDiem(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="btn btn-primary w-full py-3.5 text-base font-bold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xử lý tải tệp tin và lưu bài đăng...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Đăng Bài Chia Sẻ Ngay
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
