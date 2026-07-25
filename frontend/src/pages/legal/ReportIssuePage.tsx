import React, { useState } from 'react';
import { AlertTriangle, Send, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { reportsService } from '../../services/reports.service';

export const ReportIssuePage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [tieuDe, setTieuDe] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tieuDe.trim() || !noiDung.trim()) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và nội dung báo lỗi');
      return;
    }

    setLoading(true);
    try {
      if (user) {
        await reportsService.createReport({
          ly_do_bao_cao: tieuDe.trim(),
          mo_ta_chi_tiet: noiDung.trim(),
        });
      }
      setSubmitted(true);
      toast.success('Đã gửi phản hồi báo lỗi tới Ban Quản Trị thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi báo cáo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in space-y-8">
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border border-rose-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <span className="badge badge-rose text-xs sm:text-sm px-3 py-1">{t('reportIssue.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
          {t('reportIssue.title')}
        </h1>
        <p className="text-base sm:text-lg text-gray-300 mt-2.5 leading-relaxed">
          {t('reportIssue.subtitle')}
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl">
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-brand-emerald mx-auto animate-bounce" />
            <h2 className="text-xl sm:text-2xl font-bold text-primary">{t('reportIssue.thanks')}</h2>
            <p className="text-sm sm:text-base text-secondary max-w-md mx-auto leading-relaxed">
              {t('reportIssue.thanksDesc')}
            </p>
            <button
              onClick={() => { setSubmitted(false); setTieuDe(''); setNoiDung(''); }}
              className="btn btn-outline text-sm px-5 py-2.5 mt-2 font-semibold"
            >
              {t('reportIssue.sendAnother')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">
                {t('reportIssue.titleLabel')}
              </label>
              <input
                type="text"
                placeholder={t('reportIssue.titlePlaceholder')}
                value={tieuDe}
                onChange={(e) => setTieuDe(e.target.value)}
                className="form-input text-base py-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary mb-2">
                {t('reportIssue.descLabel')}
              </label>
              <textarea
                rows={5}
                placeholder={t('reportIssue.descPlaceholder')}
                value={noiDung}
                onChange={(e) => setNoiDung(e.target.value)}
                className="form-input text-base leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3.5 text-base font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Đang gửi phản hồi...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" /> {t('reportIssue.submitBtn')}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
