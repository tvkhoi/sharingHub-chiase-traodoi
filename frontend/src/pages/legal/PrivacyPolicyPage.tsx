import React from 'react';
import { ShieldCheck, Lock, Eye, Server, UserCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in space-y-8">
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border border-teal-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="badge badge-emerald text-xs sm:text-sm px-3 py-1">{t('privacy.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
          {t('privacy.title')}
        </h1>
        <p className="text-base sm:text-lg text-gray-300 mt-2.5 leading-relaxed">
          {t('privacy.subtitle')}
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-8 text-secondary text-base leading-relaxed">
        <section className="space-y-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
            {t('privacy.sec1Title')}
          </h2>
          <p className="text-sm sm:text-base text-secondary">{t('privacy.sec1Desc')}</p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-indigo-400 shrink-0" />
            {t('privacy.sec2Title')}
          </h2>
          <p className="text-sm sm:text-base text-secondary">{t('privacy.sec2Desc')}</p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2.5">
            <Server className="w-5 h-5 text-teal-400 shrink-0" />
            {t('privacy.sec3Title')}
          </h2>
          <p className="text-sm sm:text-base text-secondary">{t('privacy.sec3Desc')}</p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-amber-400 shrink-0" />
            {t('privacy.sec4Title')}
          </h2>
          <p className="text-sm sm:text-base text-secondary">{t('privacy.sec4Desc')}</p>
        </section>
      </div>
    </div>
  );
};
