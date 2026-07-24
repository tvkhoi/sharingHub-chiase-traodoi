import React, { useState } from 'react';
import { AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

export const ReportIssuePage: React.FC = () => {
  const { t } = useLanguage();
  const [tieuDe, setTieuDe] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tieuDe.trim() || !noiDung.trim()) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và nội dung báo lỗi');
      return;
    }
    setSubmitted(true);
    toast.success('Đã gửi phản hồi báo lỗi thành công!');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in space-y-8">
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border border-rose-500/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <span className="badge badge-rose">{t('reportIssue.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t('reportIssue.title')}
        </h1>
        <p className="text-sm text-gray-300 mt-2 leading-relaxed">
          {t('reportIssue.subtitle')}
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl">
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-brand-emerald mx-auto animate-bounce" />
            <h2 className="text-xl font-bold text-primary">{t('reportIssue.thanks')}</h2>
            <p className="text-sm text-secondary max-w-md mx-auto">
              {t('reportIssue.thanksDesc')}
            </p>
            <button
              onClick={() => { setSubmitted(false); setTieuDe(''); setNoiDung(''); }}
              className="btn btn-outline text-xs px-4 py-2 mt-2"
            >
              {t('reportIssue.sendAnother')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">
                {t('reportIssue.titleLabel')}
              </label>
              <input
                type="text"
                placeholder={t('reportIssue.titlePlaceholder')}
                value={tieuDe}
                onChange={(e) => setTieuDe(e.target.value)}
                className="form-input text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">
                {t('reportIssue.descLabel')}
              </label>
              <textarea
                rows={5}
                placeholder={t('reportIssue.descPlaceholder')}
                value={noiDung}
                onChange={(e) => setNoiDung(e.target.value)}
                className="form-input text-sm"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> {t('reportIssue.submitBtn')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
