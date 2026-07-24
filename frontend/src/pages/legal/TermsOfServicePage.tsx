import React from 'react';
import { FileText, CheckCircle2, AlertOctagon, Scale } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const TermsOfServicePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in space-y-8">
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-rose-950 border border-indigo-500/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <span className="badge badge-indigo">{t('terms.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t('terms.title')}
        </h1>
        <p className="text-sm text-gray-300 mt-2 leading-relaxed">
          {t('terms.subtitle')}
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 text-secondary text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {t('terms.sec1Title')}
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t('terms.sec1Desc1')}</li>
            <li>{t('terms.sec1Desc2')}</li>
            <li>{t('terms.sec1Desc3')}</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            {t('terms.sec2Title')}
          </h2>
          <p>{t('terms.sec2Desc')}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            {t('terms.sec3Title')}
          </h2>
          <p>{t('terms.sec3Desc')}</p>
        </section>
      </div>
    </div>
  );
};
