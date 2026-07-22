import React from 'react';
import { Link } from 'react-router-dom';
import type { Asset } from '../../types';
import { MapPin, Box, ArrowLeftRight, Gift, User, Star } from 'lucide-react';
import { getImageUrl, DEFAULT_ASSET_IMAGE } from '../../utils/image';

interface AssetCardProps {
  asset: Asset;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
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
              Cho tặng
            </span>
          ) : (
            <span className="badge badge-indigo flex items-center gap-1 shadow-lg">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Trao đổi ({asset.hinh_thuc_trao_doi === 'TIEN' ? 'Tiền' : 'Tài sản'})
            </span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1">
          <Box className="w-3.5 h-3.5 text-brand-emerald" />
          Còn {asset.so_luong_kha_dung}/{asset.so_luong_tong}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold text-brand-primary mb-1">
            {asset.danh_muc?.ten_danh_muc || 'Danh mục tài sản'}
          </div>

          <h3 className="font-bold text-lg text-primary line-clamp-1 mb-2 group-hover:text-brand-primary transition-colors">
            {asset.ten_tai_san}
          </h3>

          <p className="text-sm text-secondary line-clamp-2 mb-4">
            {asset.mo_ta_hien_trang}
          </p>
        </div>

        {/* Location & Owner Footer */}
        <div className="pt-3 border-t border-color flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-1 truncate max-w-[60%]">
            <MapPin className="w-3.5 h-3.5 text-brand-rose flex-shrink-0" />
            <span className="truncate">{asset.dia_diem}</span>
          </div>

          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-brand-primary" />
            <span className="font-medium text-secondary truncate max-w-[80px]">
              {asset.chu_so_huu?.ho_so?.ho_ten || 'Thành viên'}
            </span>
            {asset.chu_so_huu?.uy_tin && (
              <span className="flex items-center gap-0.5 text-brand-amber font-bold ml-1">
                <Star className="w-3 h-3 fill-amber-400" />
                {asset.chu_so_huu.uy_tin.diem_trung_binh}
              </span>
            )}
          </div>
        </div>

        {/* Action button */}
        <Link
          to={`/assets/${asset.bai_dang_id}`}
          className="mt-4 btn btn-outline w-full text-sm py-2 justify-center"
        >
          Xem chi tiết & Đề xuất
        </Link>
      </div>
    </div>
  );
};
