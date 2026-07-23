import React, { useEffect, useState } from 'react';
import { adminService, type SystemStats } from '../../services/admin.service';
import { assetsService } from '../../services/assets.service';
import type { User, Asset, AssetCategory } from '../../types';
import { Pagination } from '../../components/common/Pagination';
import { AdminReportsPage } from './AdminReportsPage';
import toast from 'react-hot-toast';
import {
  Users,
  Package,
  Repeat,
  ShieldAlert,
  Search,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit,
  Eye,
  BarChart3,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmModal } from '../../components/common/ConfirmModal';

type AdminTab = 'stats' | 'users' | 'categories' | 'assets' | 'reports';

let cachedAdminStats: SystemStats | null = null;
let cachedAdminUsers: User[] = [];
let cachedAdminCategories: AssetCategory[] = [];
let cachedAdminAssetsList: Asset[] = [];

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');

  // Custom Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'emerald' | 'primary';
    icon?: 'lock' | 'unlock' | 'trash' | 'warning' | 'check';
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
  });
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  // Stats state
  const [stats, setStats] = useState<SystemStats | null>(cachedAdminStats);
  const [loadingStats, setLoadingStats] = useState<boolean>(!cachedAdminStats);

  // Users state
  const [users, setUsers] = useState<User[]>(cachedAdminUsers);
  const [usersPage, setUsersPage] = useState<number>(1);
  const [usersTotalPages, setUsersTotalPages] = useState<number>(1);
  const [usersSearch, setUsersSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('');
  const [loadingUsers, setLoadingUsers] = useState<boolean>(cachedAdminUsers.length === 0);

  // Categories state
  const [categories, setCategories] = useState<AssetCategory[]>(cachedAdminCategories);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(cachedAdminCategories.length === 0);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
  const [catName, setCatName] = useState<string>('');
  const [catDesc, setCatDesc] = useState<string>('');

  // Assets state
  const [adminAssets, setAdminAssets] = useState<Asset[]>(cachedAdminAssetsList);
  const [assetsPage, setAssetsPage] = useState<number>(1);
  const [assetsTotalPages, setAssetsTotalPages] = useState<number>(1);
  const [assetsSearch, setAssetsSearch] = useState<string>('');
  const [assetStatusFilter, setAssetStatusFilter] = useState<string>('');
  const [loadingAdminAssets, setLoadingAdminAssets] = useState<boolean>(cachedAdminAssetsList.length === 0);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'categories') fetchCategories();
    if (activeTab === 'assets') fetchAdminAssets();
  }, [activeTab, usersPage, userRoleFilter, userStatusFilter, assetsPage, assetStatusFilter]);

  const fetchStats = async () => {
    if (!stats) setLoadingStats(true);
    try {
      const data = await adminService.getSystemStats();
      setStats(data);
      cachedAdminStats = data;
    } catch (err) {
      console.error('Lỗi lấy thống kê hệ thống:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    if (users.length === 0) setLoadingUsers(true);
    try {
      const res = await adminService.getUsers({
        page: usersPage,
        limit: 10,
        search: usersSearch || undefined,
        vai_tro: userRoleFilter || undefined,
        trang_thai: userStatusFilter || undefined,
      });
      setUsers(res.items || []);
      cachedAdminUsers = res.items || [];
      setUsersTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error('Lỗi lấy danh sách người dùng:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSearchUsers = (e: React.FormEvent) => {
    e.preventDefault();
    setUsersPage(1);
    fetchUsers();
  };

  const handleToggleUserStatus = (user: User) => {
    const isLocking = user.trang_thai === 'HOAT_DONG';
    const newStatus = isLocking ? 'BI_KHOA' : 'HOAT_DONG';
    const userName = user.ho_so?.ho_ten || user.email;

    setConfirmConfig({
      isOpen: true,
      title: isLocking ? 'Xác nhận Khóa tài khoản' : 'Xác nhận Mở khóa tài khoản',
      message: `Bạn có chắc chắn muốn ${isLocking ? 'khóa' : 'mở khóa'} tài khoản thành viên "${userName}"?`,
      confirmText: isLocking ? 'Khóa tài khoản' : 'Mở khóa ngay',
      variant: isLocking ? 'danger' : 'emerald',
      icon: isLocking ? 'lock' : 'unlock',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await adminService.updateUserStatus(user.nguoi_dung_id, newStatus);
          toast.success(`Đã ${isLocking ? 'khóa' : 'mở khóa'} tài khoản thành công`);
          fetchUsers();
          fetchStats();
        } catch (err: any) {
          toast.error(err.response?.data?.message || `Lỗi xử lý tài khoản`);
        } finally {
          setConfirmLoading(false);
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const fetchCategories = async () => {
    if (categories.length === 0) setLoadingCategories(true);
    try {
      const data = await assetsService.getCategories();
      setCategories(data);
      cachedAdminCategories = data;
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return toast.error('Vui lòng nhập tên danh mục');

    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.danh_muc_id, {
          ten_danh_muc: catName.trim(),
          mo_ta: catDesc.trim(),
        });
        toast.success('Đã cập nhật danh mục');
      } else {
        await adminService.createCategory({
          ten_danh_muc: catName.trim(),
          mo_ta: catDesc.trim(),
        });
        toast.success('Đã thêm danh mục mới');
      }
      setIsCategoryModalOpen(false);
      setCatName('');
      setCatDesc('');
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi lưu danh mục');
    }
  };

  const handleDeleteCategory = (cat: AssetCategory) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xác nhận Xóa Danh Mục',
      message: `Bạn có chắc chắn muốn xóa danh mục "${cat.ten_danh_muc}"?`,
      confirmText: 'Xóa danh mục',
      variant: 'danger',
      icon: 'trash',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await adminService.deleteCategory(cat.danh_muc_id);
          toast.success('Đã xóa danh mục');
          fetchCategories();
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Không thể xóa danh mục đang có bài đăng');
        } finally {
          setConfirmLoading(false);
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const fetchAdminAssets = async () => {
    if (adminAssets.length === 0) setLoadingAdminAssets(true);
    try {
      const res = await adminService.getAssetsAdmin({
        page: assetsPage,
        limit: 10,
        search: assetsSearch || undefined,
        trang_thai: assetStatusFilter || undefined,
      });
      setAdminAssets(res.items || []);
      cachedAdminAssetsList = res.items || [];
      setAssetsTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error('Lỗi lấy bài đăng tài sản:', err);
    } finally {
      setLoadingAdminAssets(false);
    }
  };

  const handleSearchAssets = (e: React.FormEvent) => {
    e.preventDefault();
    setAssetsPage(1);
    fetchAdminAssets();
  };

  const handleToggleAssetStatus = (asset: Asset) => {
    const isLocking = asset.trang_thai === 'KHA_DUNG';
    const newStatus = isLocking ? 'DA_KHOA_SO' : 'KHA_DUNG';

    setConfirmConfig({
      isOpen: true,
      title: isLocking ? 'Xác nhận Tạm khóa bài đăng' : 'Xác nhận Kích hoạt lại bài đăng',
      message: `Bạn có chắc chắn muốn ${isLocking ? 'tạm khóa' : 'kích hoạt lại'} bài đăng tài sản "${asset.ten_tai_san}"?`,
      confirmText: isLocking ? 'Khóa bài đăng' : 'Kích hoạt ngay',
      variant: isLocking ? 'danger' : 'emerald',
      icon: isLocking ? 'lock' : 'unlock',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await adminService.updateAssetStatusAdmin(asset.bai_dang_id, newStatus);
          toast.success(`Đã ${isLocking ? 'tạm khóa' : 'kích hoạt lại'} bài đăng thành công`);
          fetchAdminAssets();
          fetchStats();
        } catch (err: any) {
          toast.error(err.response?.data?.message || `Lỗi xử lý bài đăng`);
        } finally {
          setConfirmLoading(false);
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
      {/* Admin Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div>
          <span className="badge badge-rose mb-2">👑 Quản Trị Hệ Thống (Admin Control Panel)</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Trung Tâm Quản Lý & Điều Hành ShareHub
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Giám sát số liệu, quản lý thành viên, danh mục tài sản và xử lý khiếu nại cộng đồng
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 glass-panel rounded-2xl border border-color">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-lg' : 'text-secondary hover:text-primary hover:bg-card-hover'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Thống kê tổng quan
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-secondary hover:text-primary hover:bg-card-hover'
          }`}
        >
          <Users className="w-4 h-4" />
          Quản lý người dùng
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'categories' ? 'bg-indigo-600 text-white shadow-lg' : 'text-secondary hover:text-primary hover:bg-card-hover'
          }`}
        >
          <Layers className="w-4 h-4" />
          Quản lý danh mục
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'assets' ? 'bg-indigo-600 text-white shadow-lg' : 'text-secondary hover:text-primary hover:bg-card-hover'
          }`}
        >
          <Package className="w-4 h-4" />
          Kiểm duyệt bài đăng
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'reports' ? 'bg-rose-600 text-white shadow-lg' : 'text-secondary hover:text-primary hover:bg-card-hover'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Báo cáo vi phạm
        </button>
      </div>

      {/* TAB 1: OVERVIEW STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {loadingStats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card p-6 rounded-2xl h-32 bg-card-hover" />
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-6 rounded-2xl text-left border-l-4 border-indigo-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted font-bold uppercase">Người dùng</span>
                  <Users className="w-6 h-6 text-brand-primary" />
                </div>
                <div className="text-3xl font-extrabold text-primary">{stats.users.total}</div>
                <div className="text-xs text-muted mt-1 flex justify-between">
                  <span>Hoạt động: <strong className="text-brand-emerald">{stats.users.active}</strong></span>
                  <span>Bị khóa: <strong className="text-brand-rose">{stats.users.locked}</strong></span>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl text-left border-l-4 border-emerald-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted font-bold uppercase">Bài đăng tài sản</span>
                  <Package className="w-6 h-6 text-brand-emerald" />
                </div>
                <div className="text-3xl font-extrabold text-primary">{stats.assets.total}</div>
                <div className="text-xs text-muted mt-1">
                  Khả dụng: <strong className="text-brand-emerald">{stats.assets.available}</strong> bài đăng
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl text-left border-l-4 border-amber-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted font-bold uppercase">Giao dịch</span>
                  <Repeat className="w-6 h-6 text-brand-amber" />
                </div>
                <div className="text-3xl font-extrabold text-primary">{stats.transactions.total}</div>
                <div className="text-xs text-muted mt-1">
                  Đã hoàn tất: <strong className="text-brand-amber">{stats.transactions.completed}</strong> giao dịch
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl text-left border-l-4 border-rose-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted font-bold uppercase">Báo cáo vi phạm</span>
                  <ShieldAlert className="w-6 h-6 text-brand-rose" />
                </div>
                <div className="text-3xl font-extrabold text-primary">{stats.reports.total}</div>
                <div className="text-xs text-muted mt-1">
                  Chờ kiểm duyệt: <strong className="text-brand-rose">{stats.reports.pending}</strong> báo cáo
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glass-card p-6 rounded-3xl space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-primary" />
              Danh Sách Quản Lý Tài Khoản Thành Viên
            </h2>

            <form onSubmit={handleSearchUsers} className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  className="form-input pl-9 py-2 text-xs"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => { setUserRoleFilter(e.target.value); setUsersPage(1); }}
                className="form-select py-2 text-xs"
              >
                <option value="">Tất cả vai trò</option>
                <option value="THANH_VIEN">Thành viên</option>
                <option value="QUAN_TRI_VIEN">Quản trị viên</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={(e) => { setUserStatusFilter(e.target.value); setUsersPage(1); }}
                className="form-select py-2 text-xs"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="HOAT_DONG">Hoạt động</option>
                <option value="BI_KHOA">Bị khóa</option>
              </select>

              <button type="submit" className="btn btn-primary text-xs py-2 px-3">Tìm</button>
            </form>
          </div>

          {/* Users Table */}
          {loadingUsers ? (
            <div className="py-12 text-center text-muted">Đang tải danh sách người dùng...</div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-muted">Không tìm thấy tài khoản nào phù hợp</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-color text-xs text-muted uppercase tracking-wider">
                    <th className="py-3 px-4">Thành viên</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Vai trò</th>
                    <th className="py-3 px-4">Điểm uy tín</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-color">
                  {users.map((u) => (
                    <tr key={u.nguoi_dung_id} className="hover:bg-card-hover transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-600/20 text-brand-primary flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 border border-indigo-500/30">
                            {u.ho_so?.anh_dai_dien ? (
                              <img src={u.ho_so.anh_dai_dien} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              u.ho_so?.ho_ten?.charAt(0).toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <Link to={`/profile/${u.nguoi_dung_id}`} className="font-bold text-primary hover:text-brand-primary hover:underline">
                              {u.ho_so?.ho_ten || 'Chưa cập nhật'}
                            </Link>
                            <span className="text-xs text-muted block">{u.ho_so?.so_dien_thoai || 'Chưa có SĐT'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-secondary">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${u.vai_tro === 'QUAN_TRI_VIEN' ? 'badge-rose' : 'badge-indigo'}`}>
                          {u.vai_tro === 'QUAN_TRI_VIEN' ? 'Quản trị viên' : 'Thành viên'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-brand-amber">
                        ⭐ {u.uy_tin?.diem_trung_binh ?? '5.0'} / 5.0
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${u.trang_thai === 'HOAT_DONG' ? 'badge-emerald' : 'badge-rose'}`}>
                          {u.trang_thai === 'HOAT_DONG' ? 'Hoạt động' : 'Đã bị khóa'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.vai_tro !== 'QUAN_TRI_VIEN' && (
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`btn text-xs py-1.5 px-3 ${
                              u.trang_thai === 'HOAT_DONG' ? 'btn-danger' : 'btn-emerald'
                            }`}
                          >
                            {u.trang_thai === 'HOAT_DONG' ? (
                              <><Lock className="w-3.5 h-3.5" /> Khóa TK</>
                            ) : (
                              <><Unlock className="w-3.5 h-3.5" /> Mở khóa</>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {usersTotalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination page={usersPage} totalPages={usersTotalPages} onPageChange={setUsersPage} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CATEGORY MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="glass-card p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-indigo" />
              Quản Lý Danh Mục Tài Sản
            </h2>

            <button
              onClick={() => {
                setEditingCategory(null);
                setCatName('');
                setCatDesc('');
                setIsCategoryModalOpen(true);
              }}
              className="btn btn-emerald text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Thêm danh mục mới
            </button>
          </div>

          {loadingCategories ? (
            <div className="py-12 text-center text-muted">Đang tải danh mục...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => (
                <div key={c.danh_muc_id} className="glass-card p-4 rounded-2xl border border-color flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-primary text-base">{c.ten_danh_muc}</h4>
                    <p className="text-xs text-secondary mt-1">{c.mo_ta || 'Chưa có mô tả'}</p>
                    <span className="badge badge-emerald mt-2 inline-block text-[10px]">Đang hoạt động</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory(c);
                        setCatName(c.ten_danh_muc);
                        setCatDesc(c.mo_ta || '');
                        setIsCategoryModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-muted hover:text-brand-primary transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteCategory(c)}
                      className="p-1.5 rounded-lg text-muted hover:text-brand-rose transition-colors"
                      title="Xóa danh mục"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal Add/Edit Category */}
          {isCategoryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="glass-panel p-6 rounded-3xl w-full max-w-md border border-color shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-primary">
                  {editingCategory ? 'Chỉnh sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                </h3>

                <form onSubmit={handleSaveCategory} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Tên danh mục *</label>
                    <input
                      type="text"
                      placeholder="Nội thất, Điện tử, Sách..."
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="form-input text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Mô tả chi tiết</label>
                    <textarea
                      rows={3}
                      placeholder="Mô tả về loại đồ dùng..."
                      value={catDesc}
                      onChange={(e) => setCatDesc(e.target.value)}
                      className="form-input text-sm"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(false)}
                      className="btn btn-outline text-xs"
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary text-xs">
                      Lưu thông tin
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ASSET MODERATION */}
      {activeTab === 'assets' && (
        <div className="glass-card p-6 rounded-3xl space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-emerald" />
              Kiểm Duyệt Bài Đăng Tài Sản Cộng Đồng
            </h2>

            <form onSubmit={handleSearchAssets} className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Tìm tên tài sản, mô tả..."
                  value={assetsSearch}
                  onChange={(e) => setAssetsSearch(e.target.value)}
                  className="form-input pl-9 py-2 text-xs"
                />
              </div>

              <select
                value={assetStatusFilter}
                onChange={(e) => { setAssetStatusFilter(e.target.value); setAssetsPage(1); }}
                className="form-select py-2 text-xs"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="KHA_DUNG">Khả dụng</option>
                <option value="DA_KHOA_SO">Đã bị khóa</option>
                <option value="DA_KET_THUC">Đã kết thúc</option>
              </select>

              <button type="submit" className="btn btn-primary text-xs py-2 px-3">Tìm</button>
            </form>
          </div>

          {/* Users Table */}
          {loadingUsers ? (
            <div className="py-12 text-center text-muted">Đang tải danh sách người dùng...</div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-muted">Không tìm thấy tài khoản nào phù hợp</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[750px]">
                <thead>
                  <tr className="border-b border-color text-xs text-muted uppercase tracking-wider whitespace-nowrap">
                    <th className="py-3.5 px-4 text-left whitespace-nowrap">Thành viên</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap">Email</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap">Vai trò</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap">Điểm uy tín</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap">Trạng thái</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-color">
                  {users.map((u) => (
                    <tr key={u.nguoi_dung_id} className="hover:bg-card-hover transition-colors whitespace-nowrap">
                      <td className="py-3.5 px-4 text-left whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-600/20 text-brand-primary flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 border border-indigo-500/30">
                            {u.ho_so?.anh_dai_dien ? (
                              <img src={u.ho_so.anh_dai_dien} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              u.ho_so?.ho_ten?.charAt(0).toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <Link to={`/profile/${u.nguoi_dung_id}`} className="font-bold text-primary hover:text-brand-primary hover:underline block truncate max-w-[180px]">
                              {u.ho_so?.ho_ten || 'Chưa cập nhật'}
                            </Link>
                            <span className="text-xs text-muted block truncate max-w-[180px]">{u.ho_so?.so_dien_thoai || 'Chưa có SĐT'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-left text-secondary whitespace-nowrap">{u.email}</td>
                      <td className="py-3.5 px-4 text-left whitespace-nowrap">
                        <div className="flex items-center justify-start">
                          <span className={`badge ${u.vai_tro === 'QUAN_TRI_VIEN' ? 'badge-rose' : 'badge-indigo'}`}>
                            {u.vai_tro === 'QUAN_TRI_VIEN' ? 'Quản trị viên' : 'Thành viên'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-left font-bold text-brand-amber whitespace-nowrap">
                        ⭐ {u.uy_tin?.diem_trung_binh ?? '5.0'} / 5.0
                      </td>
                      <td className="py-3.5 px-4 text-left whitespace-nowrap">
                        <div className="flex items-center justify-start">
                          <span className={`badge ${u.trang_thai === 'HOAT_DONG' ? 'badge-emerald' : 'badge-rose'}`}>
                            {u.trang_thai === 'HOAT_DONG' ? 'Hoạt động' : 'Đã bị khóa'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-left whitespace-nowrap">
                        {u.vai_tro !== 'QUAN_TRI_VIEN' && (
                          <div className="flex items-center justify-start">
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className={`btn text-xs py-1.5 px-3 whitespace-nowrap ${
                                u.trang_thai === 'HOAT_DONG' ? 'btn-danger' : 'btn-emerald'
                              }`}
                            >
                              {u.trang_thai === 'HOAT_DONG' ? (
                                <><Lock className="w-3.5 h-3.5" /> Khóa TK</>
                              ) : (
                                <><Unlock className="w-3.5 h-3.5" /> Mở khóa</>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {loadingAdminAssets ? (
            <div className="py-12 text-center text-muted">Đang tải danh sách bài đăng...</div>
          ) : adminAssets.length === 0 ? (
            <div className="py-12 text-center text-muted">Không có bài đăng nào phù hợp</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-color text-xs text-muted uppercase tracking-wider whitespace-nowrap">
                    <th className="py-3.5 px-4 text-left whitespace-nowrap">Bài đăng tài sản</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap">Hình thức</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap">Chủ sở hữu</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap">Trạng thái</th>
                    <th className="py-3.5 px-4 text-left whitespace-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-color">
                  {adminAssets.map((a) => (
                    <tr key={a.bai_dang_id} className="hover:bg-card-hover transition-colors whitespace-nowrap">
                      <td className="py-3.5 px-4 text-left whitespace-nowrap">
                        <div className="font-bold text-primary max-w-[200px] truncate">{a.ten_tai_san}</div>
                        <span className="text-xs text-muted block truncate max-w-[200px]">{a.dia_diem}</span>
                      </td>
                      <td className="py-3.5 px-4 text-left whitespace-nowrap">
                        <div className="flex items-center justify-start">
                          <span className={`badge ${a.hinh_thuc_chia_se === 'CHO_TANG' ? 'badge-emerald' : 'badge-indigo'}`}>
                            {a.hinh_thuc_chia_se === 'CHO_TANG' ? 'Cho tặng' : 'Trao đổi'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-left text-secondary whitespace-nowrap">
                        <span className="block truncate max-w-[180px]">
                          {a.chu_so_huu?.ho_so?.ho_ten || a.chu_so_huu?.email || 'Thành viên'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-left whitespace-nowrap">
                        <div className="flex items-center justify-start">
                          <span className={`badge ${a.trang_thai === 'KHA_DUNG' ? 'badge-emerald' : 'badge-rose'}`}>
                            {a.trang_thai === 'KHA_DUNG' ? 'Khả dụng' : a.trang_thai === 'DA_KHOA_SO' ? 'Bị khóa' : 'Đã kết thúc'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-left whitespace-nowrap">
                        <div className="flex items-center justify-start gap-2">
                          <Link
                            to={`/assets/${a.bai_dang_id}`}
                            className="p-1.5 rounded-lg text-muted hover:text-brand-primary hover:bg-card-hover transition-colors shrink-0"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleToggleAssetStatus(a)}
                            className={`btn text-xs py-1.5 px-3 whitespace-nowrap ${
                              a.trang_thai === 'KHA_DUNG' ? 'btn-danger' : 'btn-emerald'
                            }`}
                          >
                            {a.trang_thai === 'KHA_DUNG' ? (
                              <><Lock className="w-3.5 h-3.5" /> Khóa bài</>
                            ) : (
                              <><Unlock className="w-3.5 h-3.5" /> Mở bài</>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {assetsTotalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination page={assetsPage} totalPages={assetsTotalPages} onPageChange={setAssetsPage} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: VIOLATION REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <AdminReportsPage />
        </div>
      )}

      {/* Global Confirm Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        icon={confirmConfig.icon}
        isLoading={confirmLoading}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
