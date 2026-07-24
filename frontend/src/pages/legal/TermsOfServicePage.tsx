import React from 'react';
import { FileText, CheckCircle2, AlertOctagon, Scale } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const TermsOfServicePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in space-y-8">
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-rose-950 border border-indigo-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
            <FileText className="w-7 h-7" />
          </div>
          <span className="badge badge-indigo text-xs sm:text-sm px-3 py-1">{t('terms.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
          {t('terms.title')}
        </h1>
        <p className="text-base sm:text-lg text-gray-300 mt-2.5 leading-relaxed">
          {t('terms.subtitle')}
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-8 text-secondary text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            {t('terms.sec1Title')}
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-secondary">
            <li>{t('terms.sec1Desc1')}</li>
            <li>{t('terms.sec1Desc2')}</li>
            <li>{t('terms.sec1Desc3')}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-indigo-400 shrink-0" />
            {t('terms.sec2Title')}
          </h2>
          <p className="text-sm sm:text-base text-secondary">{t('terms.sec2Desc')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
            {t('terms.sec3Title')}
          </h2>
          <p className="text-sm sm:text-base text-secondary">{t('terms.sec3Desc')}</p>
        </section>
      </div>
    </div>
  );
};
