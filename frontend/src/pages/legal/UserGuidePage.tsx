import React from 'react';
import { HelpCircle, Gift, ArrowLeftRight, ShieldCheck, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserGuidePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in space-y-8">
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <span className="badge badge-emerald">Trung Tâm Hướng Dẫn</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Hướng Dẫn Sử Dụng Hệ Thống ShareHub
        </h1>
        <p className="text-sm text-gray-300 mt-2 leading-relaxed">
          Quy trình đăng bài, mượn/trao đổi tài sản và tích lũy điểm uy tín cho thành viên cộng đồng.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-emerald-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-sm">1</span>
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-400" />
              Đăng Bài Chia Sẻ & Trao Đổi
            </h2>
          </div>
          <p className="text-sm text-secondary leading-relaxed pl-11">
            Nhấn vào nút <strong>"Đăng bài mới"</strong> trên thanh điều hướng. Tải lên hình ảnh tài sản, nhập thông tin mô tả, chọn hình thức <em>Cho tặng miễn phí</em> hoặc <em>Trao đổi (Bù tiền / Đổi đồ)</em> và nhập địa chỉ giao dịch.
          </p>
        </div>

        {/* Step 2 */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-indigo-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-extrabold flex items-center justify-center text-sm">2</span>
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
              Gửi Đề Xuất & Thương Lượng
            </h2>
          </div>
          <p className="text-sm text-secondary leading-relaxed pl-11">
            Khám phá bài đăng trên Bảng tin, nhấn <strong>"Xem chi tiết & Đề xuất"</strong>. Bạn có thể gửi yêu cầu mượn hoặc thương lượng trực tiếp qua khung Chat Realtime của ứng dụng để thống nhất thời gian và địa điểm nhận hàng.
          </p>
        </div>

        {/* Step 3 */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-amber-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center text-sm">3</span>
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Bàn Giao & Xác Nhận Giao Dịch
            </h2>
          </div>
          <p className="text-sm text-secondary leading-relaxed pl-11">
            Quy trình giao dịch gồm 2 bước minh bạch: 
            <br />
            - <strong>Bước 1</strong>: Chủ bài đăng bấm "Xác nhận đã bàn giao tài sản".
            <br />
            - <strong>Bước 2</strong>: Người nhận kiểm tra tài sản và bấm "Xác nhận đã tiếp nhận".
          </p>
        </div>

        {/* Step 4 */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-purple-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-extrabold flex items-center justify-center text-sm">4</span>
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Đánh Giá Uy Tín Cộng Đồng
            </h2>
          </div>
          <p className="text-sm text-secondary leading-relaxed pl-11">
            Sau khi giao dịch hoàn tất, hãy viết đánh giá và chấm điểm sao ⭐ cho đối tác. Điểm uy tín này sẽ giúp cộng đồng giao dịch an toàn và tin tưởng lẫn nhau.
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link to="/" className="btn btn-primary px-6 py-2.5 text-sm font-semibold inline-flex items-center gap-2">
          Khám phá Bảng tin ngay <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
