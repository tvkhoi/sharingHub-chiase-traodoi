import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetsService } from '../../services/assets.service';
import type { Asset, AssetCategory } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  History,
  TrendingUp,
  X,
  ArrowRight,
  Package,
  Gift,
  ArrowLeftRight,
  MapPin,
  Clock,
  Layers,
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
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load Recent Searches from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Lỗi tải lịch sử tìm kiếm:', e);
    }
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
          className="form-input pl-12 pr-10 py-3 bg-slate-950/80 border-indigo-400/40 text-white placeholder-gray-400 focus:border-indigo-400 shadow-inner w-full rounded-2xl"
        />

        {searchValue && (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              setSuggestions([]);
            }}
            className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 glass-panel rounded-2xl shadow-2xl border border-indigo-500/30 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-left bg-slate-900/95 backdrop-blur-xl">
          {/* STATE A: Empty search input -> Show Recent Searches & Trending Tags */}
          {!searchValue.trim() ? (
            <div className="p-4 space-y-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-indigo-400" />
                      Lịch sử tìm kiếm gần đây
                    </span>
                    <button
                      onClick={clearAllRecent}
                      className="text-[11px] text-gray-500 hover:text-rose-400 transition-colors lowercase font-normal cursor-pointer"
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
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700/60 hover:border-indigo-500/50 text-xs text-gray-200 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Clock className="w-3 h-3 text-gray-400" />
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

              {/* Trending Tags & Active Categories */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Từ khóa & Danh mục phổ biến
                </div>
                <div className="flex flex-wrap gap-2">
                  {(categories.length > 0
                    ? Array.from(new Set([...categories.map((c) => c.ten_danh_muc), ...DEFAULT_TRENDING_TAGS])).slice(0, 7)
                    : DEFAULT_TRENDING_TAGS
                  ).map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onSearchChange(tag);
                        handleSubmit(tag);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs text-emerald-300 font-semibold cursor-pointer transition-all flex items-center gap-1"
                    >
                      🔥 {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* STATE B: User is typing -> Show Live Asset Previews & Categories */
            <div className="divide-y divide-slate-800/80">
              {/* Category match suggestions */}
              {matchedCategories.length > 0 && (
                <div className="p-3 bg-indigo-950/40">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
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
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 border border-indigo-500/30 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        {cat.ten_danh_muc}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Asset Item Previews */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {loading ? (
                  <div className="p-6 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    Đang tìm kiếm bài đăng tài sản phù hợp...
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30 text-gray-400" />
                    Không tìm thấy bài đăng nào chứa từ khóa "{searchValue}"
                  </div>
                ) : (
                  suggestions.map((asset, index) => (
                    <div
                      key={asset.bai_dang_id}
                      onClick={() => handleItemClick(asset)}
                      className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        selectedIndex === index ? 'bg-indigo-600/30' : 'hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Image Thumbnail */}
                        <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                          {asset.hinh_anh && asset.hinh_anh.length > 0 ? (
                            <img
                              src={asset.hinh_anh[0].duong_dan_anh}
                              alt={asset.ten_tai_san}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        {/* Text info */}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-indigo-300">
                            {asset.ten_tai_san}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                asset.hinh_thuc_chia_se === 'CHO_TANG'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
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
                              <span className="text-[10px] text-gray-400 truncate flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5 text-gray-500" />
                                {asset.dia_diem}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-gray-500 shrink-0" />
                    </div>
                  ))
                )}
              </div>

              {/* View all search results footer */}
              {searchValue.trim() && (
                <div
                  onClick={() => handleSubmit()}
                  className="p-3 text-center text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-600/20 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
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
