import React from 'react';
import { FileText, CheckCircle2, AlertOctagon, Scale } from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in space-y-8">
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-rose-950 border border-indigo-500/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <span className="badge badge-indigo">Quy Định Nền Tảng</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Điều Khoản Dịch Vụ & Quy Định Cộng Đồng
        </h1>
        <p className="text-sm text-gray-300 mt-2 leading-relaxed">
          Các quy tắc ứng xử văn minh và trách nhiệm pháp lý khi tham gia trao đổi tài sản trên ShareHub.
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 text-secondary text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            1. Quy Định Về Bài Đăng Tài Sản
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Thành viên chỉ được đăng bài với các tài sản thuộc quyền sở hữu hợp pháp của mình.</li>
            <li>Hình ảnh tải lên phải là hình ảnh chụp thực tế của đồ dùng, không dùng hình ảnh giả mạo.</li>
            <li>Nghiêm cấm đăng các mặt hàng cấm theo quy định pháp luật Việt Nam (vũ khí, chất cấm, hàng giả hàng nhái...).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            2. Trách Nhiệm Trong Giao Dịch
          </h2>
          <p>
            ShareHub là nền tảng kết nối trực tiếp giữa chủ tài sản và người nhận/trao đổi. Hai bên có trách nhiệm tự kiểm tra tình trạng tài sản khi bàn giao và tuân thủ thỏa thuận thương lượng.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            3. Xử Lý Vi Phạm
          </h2>
          <p>
            Các hành vi gian lận, đăng bài sai sự thật, hoặc không bàn giao tài sản sau khi đã đồng ý thỏa thuận sẽ bị Ban quản trị tạm khóa hoặc khóa vĩnh viễn tài khoản.
          </p>
        </section>
      </div>
    </div>
  );
};
