import React from 'react';
import { ShieldCheck, Lock, Eye, Server, UserCheck } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in space-y-8">
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border border-teal-500/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="badge badge-emerald">Chính Sách Bảo Mật</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Chính Sách Bảo Mật Thông Tin ShareHub
        </h1>
        <p className="text-sm text-gray-300 mt-2 leading-relaxed">
          Cam kết bảo vệ dữ liệu cá nhân, thông tin liên hệ và quyền riêng tư của thành viên.
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 text-secondary text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            1. Thu Thập Thông Tin Cá Nhân
          </h2>
          <p>
            ShareHub chỉ thu thập các thông tin cần thiết phục vụ cho việc khởi tạo tài khoản và giao dịch giữa các thành viên, bao gồm: Họ tên, Email, Số điện thoại và Địa chỉ khu vực giao dịch.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" />
            2. Mục Đích Sử Dụng Thông Tin
          </h2>
          <p>
            Thông tin của bạn được sử dụng để:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Xác thực danh tính thành viên và duy trì điểm uy tín cộng đồng.</li>
            <li>Hiển thị thông tin liên hệ khi hai bên đồng ý thương lượng mượn/trao đổi tài sản.</li>
            <li>Gửi thông báo hệ thống liên quan đến tiến trình giao dịch.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <Server className="w-4 h-4 text-teal-400" />
            3. Cam Kết Không Chia Sẻ Cho Bên Thứ Ba
          </h2>
          <p>
            ShareHub tuyệt đối không bán, trao đổi hoặc chia sẻ thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích quảng cáo hoặc thương mại.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            4. Quyền Hạn Của Thành Viên
          </h2>
          <p>
            Bạn có toàn quyền chỉnh sửa thông tin cá nhân hoặc yêu cầu xóa tài khoản bất kỳ lúc nào thông qua phần Cài đặt Hồ sơ cá nhân.
          </p>
        </section>
      </div>
    </div>
  );
};
