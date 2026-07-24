import React from 'react';
import { HelpCircle, Gift, ArrowLeftRight, ShieldCheck, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const UserGuidePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in space-y-8">
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <HelpCircle className="w-7 h-7" />
          </div>
          <span className="badge badge-emerald text-xs sm:text-sm px-3 py-1">{t('guide.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
          {t('guide.title')}
        </h1>
        <p className="text-base sm:text-lg text-gray-300 mt-2.5 leading-relaxed">
          {t('guide.subtitle')}
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-l-4 border-emerald-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-base">1</span>
            <h2 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2.5">
              <Gift className="w-6 h-6 text-emerald-400 shrink-0" />
              {t('guide.step1Title')}
            </h2>
          </div>
          <p className="text-sm sm:text-base text-secondary leading-relaxed sm:pl-12">
            {t('guide.step1Desc')}
          </p>
        </div>

        {/* Step 2 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-l-4 border-indigo-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 font-extrabold flex items-center justify-center text-base">2</span>
            <h2 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2.5">
              <ArrowLeftRight className="w-6 h-6 text-indigo-400 shrink-0" />
              {t('guide.step2Title')}
            </h2>
          </div>
          <p className="text-sm sm:text-base text-secondary leading-relaxed sm:pl-12">
            {t('guide.step2Desc')}
          </p>
        </div>

        {/* Step 3 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-l-4 border-amber-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center text-base">3</span>
            <h2 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
              {t('guide.step3Title')}
            </h2>
          </div>
          <p className="text-sm sm:text-base text-secondary leading-relaxed sm:pl-12">
            {t('guide.step3Desc')}
          </p>
        </div>

        {/* Step 4 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-l-4 border-purple-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-400 font-extrabold flex items-center justify-center text-base">4</span>
            <h2 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2.5">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400 shrink-0" />
              {t('guide.step4Title')}
            </h2>
          </div>
          <p className="text-sm sm:text-base text-secondary leading-relaxed sm:pl-12">
            {t('guide.step4Desc')}
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link to="/" className="btn btn-primary px-8 py-3 text-base font-bold inline-flex items-center gap-2.5 shadow-lg shadow-emerald-500/20">
          {t('guide.exploreFeed')} <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};
