import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  totalItems,
  limit,
  onLimitChange,
  limitOptions = [10, 20, 50],
  className = '',
}) => {
  if (totalPages <= 1 && !totalItems) {
    return null;
  }

  // Generate page numbers range with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Number of pages around current page

    const left = page - delta;
    const right = page + delta + 1;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const startItem = totalItems !== undefined && limit ? (page - 1) * limit + 1 : undefined;
  const endItem = totalItems !== undefined && limit ? Math.min(page * limit, totalItems) : undefined;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 ${className}`}>
      {/* Items Summary Info & Limit Selector */}
      <div className="flex items-center gap-4 text-xs sm:text-sm text-secondary">
        {totalItems !== undefined && (
          <span>
            {startItem && endItem ? (
              <>Hiển thị <strong className="text-primary font-semibold">{startItem} - {endItem}</strong> trong <strong className="text-primary font-semibold">{totalItems}</strong> mục</>
            ) : (
              <>Tổng số <strong className="text-primary font-semibold">{totalItems}</strong> mục</>
            )}
          </span>
        )}

        {limit && onLimitChange && (
          <div className="flex items-center gap-1.5 border-l border-gray-700/50 pl-4">
            <span className="text-xs text-muted hidden sm:inline">Hiển thị:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-slate-900/80 border border-indigo-500/30 text-xs text-primary rounded-lg px-2 py-1 focus:border-indigo-400 focus:outline-none cursor-pointer"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            className="p-2 btn btn-outline text-xs rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            title="Trang đầu"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 btn btn-outline text-xs rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, idx) => {
              if (typeof p === 'string') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted">
                    ...
                  </span>
                );
              }

              const isCurrent = p === page;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'glass-panel text-secondary hover:text-primary hover:bg-slate-800/60'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 btn btn-outline text-xs rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            title="Trang sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            className="p-2 btn btn-outline text-xs rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            title="Trang cuối"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
