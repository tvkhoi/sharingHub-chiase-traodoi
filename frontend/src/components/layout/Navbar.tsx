import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import {
  Sun,
  Moon,
  PlusCircle,
  Package,
  MessageSquare,
  Repeat,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  LogIn,
  Layers,
  Menu,
  X,
  Globe,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="glass-nav sticky top-0 z-50 transition-all">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 text-decoration-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
              {t('nav.brand')}
            </span>
            <span className="text-xs block text-secondary opacity-90 font-medium -mt-1 whitespace-nowrap">{t('nav.subBrand')}</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          <Link
            to="/"
            className={`whitespace-nowrap px-2.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
              isActive('/') ? 'bg-indigo-600/20 text-brand-primary border border-indigo-500/30' : 'text-secondary hover:text-primary hover:bg-card-hover'
            }`}
          >
            <Package className="w-4 h-4" />
            {t('nav.feed')}
          </Link>

          {user && (
            <>
              <Link
                to="/my-assets"
                className={`whitespace-nowrap px-2.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  isActive('/my-assets') ? 'bg-indigo-600/20 text-brand-primary border border-indigo-500/30' : 'text-secondary hover:text-primary hover:bg-card-hover'
                }`}
              >
                <Layers className="w-4 h-4" />
                {t('nav.myAssets')}
              </Link>

              <Link
                to="/proposals"
                className={`whitespace-nowrap px-2.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  isActive('/proposals') ? 'bg-indigo-600/20 text-brand-primary border border-indigo-500/30' : 'text-secondary hover:text-primary hover:bg-card-hover'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {t('nav.proposals')}
              </Link>

              <Link
                to="/transactions"
                className={`whitespace-nowrap px-2.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  isActive('/transactions') ? 'bg-indigo-600/20 text-brand-primary border border-indigo-500/30' : 'text-secondary hover:text-primary hover:bg-card-hover'
                }`}
              >
                <Repeat className="w-4 h-4" />
                {t('nav.transactions')}
              </Link>

              {user.vai_tro === 'QUAN_TRI_VIEN' && (
                <Link
                  to="/admin"
                  className={`whitespace-nowrap px-2.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
                    location.pathname.startsWith('/admin') ? 'bg-rose-500/20 text-brand-rose border border-rose-500/30' : 'text-brand-rose hover:bg-rose-500/10'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  {t('nav.admin')}
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher Button */}
          <button
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            className="p-2 rounded-xl border border-color bg-card-hover text-xs font-bold text-primary flex items-center gap-1.5 hover:border-accent transition-all cursor-pointer"
            title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>{language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
          </button>

          {/* Dark / Light Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-color bg-card-hover hover:border-accent text-secondary hover:text-primary transition-all cursor-pointer"
            title={`Chuyển sang chế độ ${theme === 'dark' ? 'Sáng (Light)' : 'Tối (Dark)'}`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-brand-amber animate-pulse" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>

          {/* Real-time Notification Bell Dropdown */}
          <NotificationDropdown />

          {user ? (
            <div className="flex items-center gap-2.5">
              <Link to="/assets/create" className="btn btn-emerald text-sm py-2 px-3.5 hidden sm:inline-flex">
                <PlusCircle className="w-4 h-4" />
                {t('nav.postAsset')}
              </Link>

              <Link to={`/profile/${user.nguoi_dung_id}`} className="flex items-center gap-2 hover:opacity-85 transition-opacity">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                  {user.ho_so?.anh_dai_dien ? (
                    <img src={user.ho_so.anh_dai_dien} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.ho_so?.ho_ten?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
              </Link>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 rounded-lg text-muted hover:text-brand-rose transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-outline text-sm py-2 px-3.5">
                <LogIn className="w-4 h-4" />
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn btn-primary text-sm py-2 px-3.5 hidden sm:inline-flex">
                <UserIcon className="w-4 h-4" />
                {t('nav.register')}
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 text-secondary hover:text-primary transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-color bg-[var(--bg-secondary)] absolute top-full left-0 w-full shadow-2xl z-50">
          <nav className="flex flex-col p-4 gap-2">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={`px-4 py-3 rounded-xl text-base font-semibold flex items-center gap-3 transition-all ${
                isActive('/') ? 'bg-indigo-600/20 text-brand-primary' : 'text-secondary hover:text-primary hover:bg-card-hover'
              }`}
            >
              <Package className="w-5 h-5" />
              Bảng tin tài sản
            </Link>

            {user ? (
              <>
                <Link
                  to="/my-assets"
                  onClick={closeMobileMenu}
                  className={`px-4 py-3 rounded-xl text-base font-semibold flex items-center gap-3 transition-all ${
                    isActive('/my-assets') ? 'bg-indigo-600/20 text-brand-primary' : 'text-secondary hover:text-primary hover:bg-card-hover'
                  }`}
                >
                  <Layers className="w-5 h-5" />
                  Tài sản của tôi
                </Link>

                <Link
                  to="/proposals"
                  onClick={closeMobileMenu}
                  className={`px-4 py-3 rounded-xl text-base font-semibold flex items-center gap-3 transition-all ${
                    isActive('/proposals') ? 'bg-indigo-600/20 text-brand-primary' : 'text-secondary hover:text-primary hover:bg-card-hover'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  Đề xuất & Thương lượng
                </Link>

                <Link
                  to="/transactions"
                  onClick={closeMobileMenu}
                  className={`px-4 py-3 rounded-xl text-base font-semibold flex items-center gap-3 transition-all ${
                    isActive('/transactions') ? 'bg-indigo-600/20 text-brand-primary' : 'text-secondary hover:text-primary hover:bg-card-hover'
                  }`}
                >
                  <Repeat className="w-5 h-5" />
                  Giao dịch
                </Link>

                {user.vai_tro === 'QUAN_TRI_VIEN' && (
                  <Link
                    to="/admin/reports"
                    onClick={closeMobileMenu}
                    className={`px-4 py-3 rounded-xl text-base font-semibold flex items-center gap-3 transition-all ${
                      isActive('/admin/reports') ? 'bg-rose-500/20 text-brand-rose' : 'text-brand-rose hover:bg-rose-500/10'
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5" />
                    Kiểm duyệt Admin
                  </Link>
                )}

                <Link
                  to="/assets/create"
                  onClick={closeMobileMenu}
                  className="px-4 py-3 rounded-xl text-base font-semibold flex items-center gap-3 bg-emerald-600/20 text-brand-emerald mt-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  Đăng bài mới
                </Link>
              </>
            ) : (
              <Link
                to="/register"
                onClick={closeMobileMenu}
                className="px-4 py-3 rounded-xl text-base font-semibold flex items-center gap-3 bg-indigo-600/20 text-brand-primary mt-2"
              >
                <UserIcon className="w-5 h-5" />
                Đăng ký tài khoản
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
