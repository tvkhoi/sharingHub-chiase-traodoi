import React from 'react';
import { Link } from 'react-router-dom';
import type { Asset } from '../../types';
import { MapPin, Box, ArrowLeftRight, Gift, User, Star } from 'lucide-react';
import { getImageUrl, DEFAULT_ASSET_IMAGE } from '../../utils/image';
import { useLanguage } from '../../context/LanguageContext';

interface AssetCardProps {
  asset: Asset;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  const { t } = useLanguage();
  const imageUrl = getImageUrl(asset.hinh_anh?.[0]?.duong_dan_anh);
  const isGift = asset.hinh_thuc_chia_se === 'CHO_TANG';

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden group">
      {/* Thumbnail & Badges */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
        <img
          src={imageUrl}
          alt={asset.ten_tai_san}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 text-transparent"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_ASSET_IMAGE;
          }}
        />

        <div className="absolute top-3 left-3 flex gap-2">
          {isGift ? (
            <span className="badge badge-emerald flex items-center gap-1 shadow-lg">
              <Gift className="w-3.5 h-3.5" />
              {t('common.gift')}
            </span>
          ) : (
            <span className="badge badge-indigo flex items-center gap-1 shadow-lg">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              {t('common.exchange')} ({asset.hinh_thuc_trao_doi === 'TIEN' ? 'Money' : 'Asset'})
            </span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1">
          <Box className="w-3.5 h-3.5 text-brand-emerald" />
          {t('common.available')} {asset.so_luong_kha_dung}/{asset.so_luong_tong}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold text-brand-primary mb-1 truncate">
            {asset.danh_muc?.ten_danh_muc || 'Category'}
          </div>

          <h3 className="font-bold text-base sm:text-lg text-primary line-clamp-1 mb-1.5 group-hover:text-brand-primary transition-colors">
            {asset.ten_tai_san}
          </h3>

          <p className="text-sm text-secondary line-clamp-2 min-h-[2.5rem] mb-4">
            {asset.mo_ta_hien_trang}
          </p>
        </div>

        {/* Location & Owner Footer (pushed to bottom) */}
        <div className="mt-auto pt-3 border-t border-color">
          <div className="flex items-center justify-between text-xs text-muted mb-3">
            <div className="flex items-center gap-1 truncate max-w-[55%]">
              <MapPin className="w-3.5 h-3.5 text-brand-rose flex-shrink-0" />
              <span className="truncate">{asset.dia_diem}</span>
            </div>

            <div className="flex items-center gap-1 truncate max-w-[45%]">
              <User className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
              {asset.chu_so_huu?.nguoi_dung_id ? (
                <Link
                  to={`/profile/${asset.chu_so_huu.nguoi_dung_id}`}
                  className="font-medium text-secondary hover:text-brand-primary hover:underline truncate"
                  title="Xem hồ sơ chủ sở hữu"
                >
                  {asset.chu_so_huu?.ho_so?.ho_ten || 'Member'}
                </Link>
              ) : (
                <span className="font-medium text-secondary truncate">
                  {asset.chu_so_huu?.ho_so?.ho_ten || 'Member'}
                </span>
              )}
              {asset.chu_so_huu?.uy_tin && (
                <span className="flex items-center gap-0.5 text-brand-amber font-bold ml-0.5 flex-shrink-0">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {asset.chu_so_huu.uy_tin.diem_trung_binh}
                </span>
              )}
            </div>
          </div>

          {/* Action button */}
          <Link
            to={`/assets/${asset.bai_dang_id}`}
            className="btn btn-outline w-full text-sm py-2 justify-center"
          >
            {t('common.viewDetails')}
          </Link>
        </div>
      </div>
    </div>
  );
};
