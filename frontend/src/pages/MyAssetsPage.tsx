import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assetsService } from '../services/assets.service';
import { uploadService } from '../services/upload.service';
import type { Asset, AssetCategory } from '../types';
import toast from 'react-hot-toast';
import { PlusCircle, Layers, Trash2, Edit, UploadCloud, X, Save } from 'lucide-react';
import { createPortal } from 'react-dom';

export const MyAssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit Modal State
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [tenTaiSan, setTenTaiSan] = useState<string>('');
  const [danhMucId, setDanhMucId] = useState<string>('');
  const [moTaHienTrang, setMoTaHienTrang] = useState<string>('');
  const [soLuongTong, setSoLuongTong] = useState<number>(1);
  const [hinhThucChiaSe, setHinhThucChiaSe] = useState<'CHO_TANG' | 'TRAO_DOI'>('CHO_TANG');
  const [hinhThucTraoDoi, setHinhThucTraoDoi] = useState<'TAI_SAN' | 'TIEN'>('TAI_SAN');
  const [diaDiem, setDiaDiem] = useState<string>('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);
  const [submittingEdit, setSubmittingEdit] = useState<boolean>(false);

  useEffect(() => {
    fetchMyAssets();
    fetchCategories();
  }, []);

  const fetchMyAssets = async () => {
    setLoading(true);
    try {
      const data = await assetsService.getMyAssets();
      setAssets(data);
    } catch (err) {
      console.error('Lỗi lấy danh sách bài đăng cá nhân:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await assetsService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    }
  };

  const openEditModal = (asset: Asset) => {
    setEditAsset(asset);
    setTenTaiSan(asset.ten_tai_san);
    setDanhMucId(asset.danh_muc_id);
    setMoTaHienTrang(asset.mo_ta_hien_trang);
    setSoLuongTong(asset.so_luong_tong);
    setHinhThucChiaSe(asset.hinh_thuc_chia_se as 'CHO_TANG' | 'TRAO_DOI');
    setHinhThucTraoDoi((asset.hinh_thuc_trao_doi as 'TAI_SAN' | 'TIEN') || 'TAI_SAN');
    setDiaDiem(asset.dia_diem);
    setExistingImages(asset.hinh_anh?.map((img) => img.duong_dan_anh) || []);
    setSelectedFiles([]);
    setNewPreviewUrls([]);
  };

  const closeEditModal = () => {
    setEditAsset(null);
    setSelectedFiles([]);
    setNewPreviewUrls([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setNewPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAsset) return;

    if (!tenTaiSan.trim() || !moTaHienTrang.trim() || !diaDiem.trim() || !danhMucId) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc (*)');
      return;
    }

    setSubmittingEdit(true);
    try {
      let finalImages = [...existingImages];

      if (selectedFiles.length > 0) {
        toast.loading('Đang tải ảnh mới lên hệ thống...', { id: 'upload_edit' });
        const uploadRes = await uploadService.uploadMultiple(selectedFiles);
        toast.success('Đã tải ảnh thành công!', { id: 'upload_edit' });
        finalImages = [...finalImages, ...uploadRes.urls];
      }

      if (finalImages.length === 0) {
        toast.error('Bài đăng phải có ít nhất 1 hình ảnh');
        setSubmittingEdit(false);
        return;
      }

      await assetsService.updateAsset(editAsset.bai_dang_id, {
        danh_muc_id: danhMucId,
        ten_tai_san: tenTaiSan,
        mo_ta_hien_trang: moTaHienTrang,
        so_luong_tong: Number(soLuongTong),
        hinh_thuc_chia_se: hinhThucChiaSe,
        hinh_thuc_trao_doi: hinhThucChiaSe === 'TRAO_DOI' ? hinhThucTraoDoi : undefined,
        dia_diem: diaDiem,
        hinh_anh: finalImages,
      });

      toast.success('Cập nhật bài đăng tài sản thành công!');
      closeEditModal();
      fetchMyAssets();
    } catch (err: any) {
      toast.dismiss('upload_edit');
      const msg = err.response?.data?.message || 'Cập nhật thất bại. Vui lòng kiểm tra lại!';
      toast.error(msg);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng tài sản này?')) return;
    try {
      await assetsService.deleteAsset(id);
      toast.success('Đã xóa bài đăng thành công');
      fetchMyAssets();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Xóa thất bại!';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary">Tài Sản Của Tôi</h1>
          <p className="text-sm text-secondary mt-1">Quản lý bài đăng tài sản đang chia sẻ hoặc trao đổi</p>
        </div>

        <Link to="/assets/create" className="btn btn-emerald text-sm w-full sm:w-auto justify-center">
          <PlusCircle className="w-4 h-4" />
          Đăng bài mới
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card h-64 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="glass-card text-center py-16 px-4">
          <Layers className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-primary mb-2">Bạn chưa khởi tạo bài đăng nào</h3>
          <p className="text-sm text-secondary mb-6">Hãy đăng tài sản không dùng đến để chia sẻ hoặc trao đổi với cộng đồng ngay.</p>
          <Link to="/assets/create" className="btn btn-primary">
            Đăng bài chia sẻ đầu tiên
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div key={asset.bai_dang_id} className="glass-card overflow-hidden p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-900 mb-3 relative">
                  <img
                    src={asset.hinh_anh?.[0]?.duong_dan_anh || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80'}
                    alt={asset.ten_tai_san}
                    className="w-full h-full object-cover text-transparent"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    {asset.hinh_thuc_chia_se === 'CHO_TANG' ? (
                      <span className="badge badge-emerald text-[10px]">Cho tặng</span>
                    ) : (
                      <span className="badge badge-indigo text-[10px]">Trao đổi</span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-lg text-primary line-clamp-1 mb-1">{asset.ten_tai_san}</h3>
                <p className="text-xs text-secondary line-clamp-2 mb-3">{asset.mo_ta_hien_trang}</p>
              </div>

              <div className="pt-3 border-t border-color flex items-center justify-between">
                <span className="text-xs text-brand-emerald font-semibold">
                  Còn {asset.so_luong_kha_dung}/{asset.so_luong_tong}
                </span>

                <div className="flex items-center gap-2">
                  <Link to={`/assets/${asset.bai_dang_id}`} className="p-2 btn btn-outline rounded-lg text-xs" title="Xem chi tiết">
                    Xem
                  </Link>
                  <button
                    onClick={() => openEditModal(asset)}
                    className="p-2 btn btn-primary rounded-lg text-xs"
                    title="Chỉnh sửa bài đăng"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(asset.bai_dang_id)}
                    className="p-2 btn btn-danger rounded-lg text-xs"
                    title="Xóa bài đăng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Edit Asset */}
      {editAsset && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-3xl border border-color shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4 border-b border-color pb-3">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Edit className="w-5 h-5 text-brand-primary" /> Chỉnh Sửa Bài Đăng Tài Sản
              </h2>
              <button onClick={closeEditModal} className="p-1 text-muted hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Tên tài sản *</label>
                  <input
                    type="text"
                    value={tenTaiSan}
                    onChange={(e) => setTenTaiSan(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

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
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả hiện trạng tài sản *</label>
                <textarea
                  rows={3}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                  <label className="form-label mb-0">Địa điểm giao nhận trực tiếp *</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!navigator.geolocation) {
                          toast.error('Trình duyệt không hỗ trợ tự động lấy vị trí.');
                          return;
                        }
                        toast.loading('Đang tự động xác định vị trí hiện tại...', { id: 'geo_edit' });
                        navigator.geolocation.getCurrentPosition(
                          async (pos) => {
                            try {
                              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=vi`);
                              const data = await res.json();
                              if (data && data.display_name) {
                                setDiaDiem(data.display_name);
                                toast.success('Đã tự động điền vị trí hiện tại!', { id: 'geo_edit' });
                              } else {
                                setDiaDiem(`Tọa độ GPS: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
                                toast.success('Đã lấy tọa độ vị trí thành công!', { id: 'geo_edit' });
                              }
                            } catch {
                              setDiaDiem(`Tọa độ GPS: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
                              toast.success('Đã lấy tọa độ vị trí thành công!', { id: 'geo_edit' });
                            }
                          },
                          () => toast.error('Vui lòng cho phép quyền vị trí trên trình duyệt!', { id: 'geo_edit' }),
                          { timeout: 10000, enableHighAccuracy: true }
                        );
                      }}
                      className="text-xs font-semibold text-brand-emerald hover:underline flex items-center gap-1 bg-emerald-500/10 py-1 px-2.5 rounded-lg border border-emerald-500/20"
                      title="Tự động phát hiện vị trí hiện tại"
                    >
                      🎯 Tự động lấy vị trí hiện tại
                    </button>
                    {diaDiem && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(diaDiem)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1 bg-indigo-500/10 py-1 px-2.5 rounded-lg border border-indigo-500/20"
                        title="Mở Google Maps chỉ đường"
                      >
                        📍 Xem Google Maps
                      </a>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  value={diaDiem}
                  onChange={(e) => setDiaDiem(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              {/* Images Management */}
              <div className="form-group">
                <label className="form-label">Hình ảnh hiện tại & Bổ sung ảnh mới</label>
                {existingImages.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
                    {existingImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-color group">
                        <img src={imgUrl} alt="Existing" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white hover:bg-rose-600 transition-colors"
                          title="Xóa ảnh này"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-2 border-dashed border-color hover:border-indigo-400 rounded-xl p-4 text-center bg-card-hover transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    id="edit-file-upload"
                    className="hidden"
                  />
                  <label htmlFor="edit-file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                    <UploadCloud className="w-8 h-8 text-brand-primary mb-1" />
                    <span className="text-xs font-semibold text-primary">Bấm để tải thêm ảnh mới</span>
                  </label>
                </div>

                {newPreviewUrls.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
                    {newPreviewUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-indigo-500/50 group">
                        <img src={url} alt="New Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white hover:bg-rose-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-3 border-t border-color">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="btn btn-outline flex-1"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="btn btn-emerald flex-1"
                >
                  {submittingEdit ? (
                    'Đang lưu...'
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <Save className="w-4 h-4" /> Lưu Thay Đổi
                    </span>
                  )}
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
