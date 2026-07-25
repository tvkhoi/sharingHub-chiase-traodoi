import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetsService } from '../../services/assets.service';
import type { Asset, AssetCategory } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  History,
  X,
  ArrowRight,
  Package,
  Gift,
  ArrowLeftRight,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface SearchAutocompleteProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
  categories?: AssetCategory[];
  onSelectCategory?: (categoryId: string) => void;
  placeholder?: string;
  className?: string;
}

const DEFAULT_TRENDING_TAGS = ['Bàn học', 'Sách giáo khoa', 'Máy chiếu', 'Laptop cũ', 'Quần áo', 'Bàn phím'];
const RECENT_KEY = 'sharehub_recent_searches';

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  categories = [],
  onSelectCategory,
  placeholder,
  className = '',
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [systemTrending, setSystemTrending] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load Recent Searches & System Trending Searches
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Lỗi tải lịch sử tìm kiếm:', e);
    }

    // Fetch system-wide trending search keywords from RAM tracker
    assetsService.getTrendingSearches().then((terms) => {
      if (terms && terms.length > 0) {
        setSystemTrending(terms);
      }
    });
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Lỗi lưu lịch sử tìm kiếm:', e);
    }
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Lỗi xóa lịch sử tìm kiếm:', e);
    }
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem(RECENT_KEY);
  };

  // Debounced API call for instant asset suggestions
  useEffect(() => {
    if (!searchValue.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await assetsService.getAssets({
          search: searchValue.trim(),
          limit: 5,
        });
        setSuggestions(res.items || []);
      } catch (err) {
        console.error('Lỗi tải gợi ý tìm kiếm:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (term?: string) => {
    const query = term !== undefined ? term : searchValue;
    if (query.trim()) {
      saveRecentSearch(query.trim());
    }
    onSearchSubmit(query);
    setIsOpen(false);
  };

  const handleItemClick = (asset: Asset) => {
    if (searchValue.trim()) {
      saveRecentSearch(searchValue.trim());
    }
    setIsOpen(false);
    navigate(`/assets/${asset.bai_dang_id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleItemClick(suggestions[selectedIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const matchedCategories = searchValue.trim()
    ? categories.filter((c) => c.ten_danh_muc.toLowerCase().includes(searchValue.toLowerCase()))
    : [];

  return (
    <div className={`relative flex-1 ${className}`} ref={containerRef}>
      {/* Search Input Container */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder || t('common.searchPlaceholder')}
          value={searchValue}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="form-input pl-12 pr-10 py-3 bg-card border border-color text-primary placeholder:text-muted focus:border-brand-primary shadow-sm w-full rounded-2xl"
        />

        {searchValue && (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              setSuggestions([]);
            }}
            className="absolute right-3.5 top-3.5 text-muted hover:text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 glass-panel rounded-2xl shadow-2xl border border-color z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-left bg-card">
          {!searchValue.trim() ? (
            <div className="p-4 space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-muted mb-2 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-brand-primary" />
                      Lịch sử tìm kiếm gần đây
                    </span>
                    <button
                      onClick={clearAllRecent}
                      className="text-[11px] text-muted hover:text-rose-400 transition-colors lowercase font-normal cursor-pointer"
                    >
                      Xóa tất cả
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <span
                        key={i}
                        onClick={() => {
                          onSearchChange(term);
                          handleSubmit(term);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-card-hover border border-color hover:border-brand-primary text-xs text-secondary hover:text-primary flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Clock className="w-3 h-3 text-muted" />
                        {term}
                        <button
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="hover:text-rose-400 ml-1 p-0.5 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted mb-2 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
                  Gợi ý tìm kiếm phổ biến
                </div>
                <div className="flex flex-wrap gap-2">
                  {(systemTrending.length > 0 ? systemTrending : DEFAULT_TRENDING_TAGS).map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onSearchChange(tag);
                        handleSubmit(tag);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-card-hover border border-color hover:border-brand-emerald text-xs text-secondary hover:text-primary transition-all cursor-pointer"
                    >
                      🔥 {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-color">
              {matchedCategories.length > 0 && (
                <div className="p-3 bg-card-hover/50">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2 block">
                    Danh mục khớp từ khóa
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {matchedCategories.map((cat) => (
                      <button
                        key={cat.danh_muc_id}
                        onClick={() => {
                          if (onSelectCategory) onSelectCategory(cat.danh_muc_id);
                          setIsOpen(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-card border border-color text-brand-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:border-brand-primary"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        {cat.ten_danh_muc}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-2 max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-muted text-xs flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                    Đang tìm kiếm...
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="p-6 text-center text-muted text-xs">
                    Không tìm thấy tài sản nào phù hợp với từ khóa "{searchValue}"
                  </div>
                ) : (
                  suggestions.map((asset, index) => (
                    <div
                      key={asset.bai_dang_id}
                      onClick={() => handleItemClick(asset)}
                      className={`p-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all group ${
                        selectedIndex === index ? 'bg-card-hover' : 'hover:bg-card-hover'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-card-hover border border-color overflow-hidden shrink-0 flex items-center justify-center">
                          {asset.hinh_anh && asset.hinh_anh.length > 0 ? (
                            <img
                              src={asset.hinh_anh[0].duong_dan_anh}
                              alt={asset.ten_tai_san}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-primary truncate group-hover:text-brand-primary">
                            {asset.ten_tai_san}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                asset.hinh_thuc_chia_se === 'CHO_TANG'
                                  ? 'badge-emerald'
                                  : 'badge-indigo'
                              }`}
                            >
                              {asset.hinh_thuc_chia_se === 'CHO_TANG' ? (
                                <>
                                  <Gift className="w-2.5 h-2.5" /> Cho tặng
                                </>
                              ) : (
                                <>
                                  <ArrowLeftRight className="w-2.5 h-2.5" /> Trao đổi
                                </>
                              )}
                            </span>

                            {asset.dia_diem && (
                              <span className="text-[10px] text-muted truncate flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5 text-muted" />
                                {asset.dia_diem}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-muted shrink-0" />
                    </div>
                  ))
                )}
              </div>

              {searchValue.trim() && (
                <div
                  onClick={() => handleSubmit()}
                  className="p-3 text-center text-xs font-bold text-brand-primary hover:bg-card-hover cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  Xem tất cả kết quả cho "{searchValue}" <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
