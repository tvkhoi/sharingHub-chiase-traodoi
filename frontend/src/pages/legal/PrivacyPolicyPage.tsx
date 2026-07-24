import React from 'react';
import { ShieldCheck, Lock, Eye, Server, UserCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in space-y-8">
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border border-teal-500/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="badge badge-emerald">{t('privacy.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t('privacy.title')}
        </h1>
        <p className="text-sm text-gray-300 mt-2 leading-relaxed">
          {t('privacy.subtitle')}
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 text-secondary text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            {t('privacy.sec1Title')}
          </h2>
          <p>{t('privacy.sec1Desc')}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" />
            {t('privacy.sec2Title')}
          </h2>
          <p>{t('privacy.sec2Desc')}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <Server className="w-4 h-4 text-teal-400" />
            {t('privacy.sec3Title')}
          </h2>
          <p>{t('privacy.sec3Desc')}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            {t('privacy.sec4Title')}
          </h2>
          <p>{t('privacy.sec4Desc')}</p>
        </section>
      </div>
    </div>
  );
};
