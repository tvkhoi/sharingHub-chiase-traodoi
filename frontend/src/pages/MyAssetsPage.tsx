import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assetsService } from '../services/assets.service';
import type { Asset } from '../types';
import toast from 'react-hot-toast';
import { PlusCircle, Layers, Trash2 } from 'lucide-react';

export const MyAssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMyAssets();
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
    </div>
  );
};
