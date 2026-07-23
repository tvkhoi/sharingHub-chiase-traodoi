import React, { useEffect, useState } from 'react';
import { assetsService } from '../services/assets.service';
import type { Asset, AssetCategory } from '../types';
import { AssetCard } from '../components/assets/AssetCard';
import { Pagination } from '../components/common/Pagination';
import { Search, Filter, Layers, Gift, ArrowLeftRight, RefreshCw } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [shareType, setShareType] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(8);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [selectedCategory, shareType, page, limit]);

  const fetchCategories = async () => {
    try {
      const data = await assetsService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const data = await assetsService.getAssets({
        danh_muc_id: selectedCategory || undefined,
        hinh_thuc_chia_se: shareType || undefined,
        search: search || undefined,
        page,
        limit,
      });
      setAssets(data.items || []);
      const meta = data.meta || data.pagination;
      if (meta) {
        setTotalItems(meta.total ?? (meta as any).totalItems ?? 0);
        setTotalPages(meta.totalPages || 1);
      }
    } catch (err) {
      console.error('Lỗi lấy bài đăng tài sản:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAssets();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 border border-indigo-500/30 p-8 sm:p-12 mb-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="badge badge-emerald mb-4">🌱 Nền tảng chia sẻ cộng đồng</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Chia Sẻ Tài Sản, <br />
            <span className="bg-gradient-to-r from-indigo-300 via-emerald-300 to-amber-200 bg-clip-text text-transparent">
              Trao Đổi Giá Trị
            </span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg mb-8">
            Dễ dàng cho tặng vật dụng không dùng đến hoặc tìm kiếm đối tác trao đổi đồ dùng cần thiết một cách văn minh, tin cậy.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tài sản (vd: Laptop, Sách, Đồ gia dụng...)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-12 py-3 bg-slate-950/80 border-indigo-400/40 text-white placeholder-gray-400 focus:border-indigo-400 shadow-inner"
              />
            </div>
            <button type="submit" className="btn btn-primary py-3 px-6 text-base font-semibold">
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Decorative Floating Spheres */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      </section>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* Share Mode Filter Tabs */}
        <div className="grid grid-cols-3 md:flex items-center gap-1 sm:gap-2 p-1 glass-panel rounded-xl w-full md:w-auto">
          <button
            onClick={() => { setShareType(''); setPage(1); }}
            className={`px-1 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
              shareType === '' ? 'bg-indigo-600 text-white shadow-md' : 'text-secondary hover:text-primary'
            }`}
          >
            <Layers className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="whitespace-nowrap">Tất cả</span>
          </button>
          <button
            onClick={() => { setShareType('CHO_TANG'); setPage(1); }}
            className={`px-1 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
              shareType === 'CHO_TANG' ? 'bg-emerald-600 text-white shadow-md' : 'text-secondary hover:text-primary'
            }`}
          >
            <Gift className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="whitespace-nowrap">Cho tặng</span>
          </button>
          <button
            onClick={() => { setShareType('TRAO_DOI'); setPage(1); }}
            className={`px-1 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
              shareType === 'TRAO_DOI' ? 'bg-indigo-600 text-white shadow-md' : 'text-secondary hover:text-primary'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="whitespace-nowrap">Trao đổi</span>
          </button>
        </div>

        {/* Category Dropdown & Refresh */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3.5 top-3 w-4 h-4 text-muted" />
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="form-select pl-10 py-2.5 text-sm"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.danh_muc_id} value={cat.danh_muc_id}>
                  {cat.ten_danh_muc}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchAssets}
            className="p-2.5 btn btn-outline rounded-xl"
            title="Làm mới bảng tin"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Asset Grid Feed */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card h-80 animate-pulse bg-card-hover p-4 rounded-xl flex flex-col justify-between">
              <div className="w-full h-40 bg-gray-700/30 rounded-lg mb-4" />
              <div className="h-4 bg-gray-700/40 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-700/30 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="glass-card text-center py-16 px-4">
          <Layers className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-primary mb-2">Chưa tìm thấy bài đăng phù hợp</h3>
          <p className="text-secondary text-sm max-w-md mx-auto mb-6">
            Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác để tìm các tài sản đang sẵn sàng chia sẻ.
          </p>
          <button onClick={() => { setSearch(''); setSelectedCategory(''); setShareType(''); }} className="btn btn-outline">
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {assets.map((asset) => (
            <AssetCard key={asset.bai_dang_id} asset={asset} />
          ))}
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
        limitOptions={[8, 16, 24, 48]}
        className="mt-8"
      />
    </div>
  );
};
