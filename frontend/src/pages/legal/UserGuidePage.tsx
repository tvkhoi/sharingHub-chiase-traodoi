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
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <span className="badge badge-emerald">{t('guide.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t('guide.title')}
        </h1>
        <p className="text-sm text-gray-300 mt-2 leading-relaxed">
          {t('guide.subtitle')}
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
              {t('guide.step1Title')}
            </h2>
          </div>
          <p className="text-sm text-secondary leading-relaxed pl-11">
            {t('guide.step1Desc')}
          </p>
        </div>

        {/* Step 2 */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-indigo-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-extrabold flex items-center justify-center text-sm">2</span>
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
              {t('guide.step2Title')}
            </h2>
          </div>
          <p className="text-sm text-secondary leading-relaxed pl-11">
            {t('guide.step2Desc')}
          </p>
        </div>

        {/* Step 3 */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-amber-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center text-sm">3</span>
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              {t('guide.step3Title')}
            </h2>
          </div>
          <p className="text-sm text-secondary leading-relaxed pl-11">
            {t('guide.step3Desc')}
          </p>
        </div>

        {/* Step 4 */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-purple-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-extrabold flex items-center justify-center text-sm">4</span>
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              {t('guide.step4Title')}
            </h2>
          </div>
          <p className="text-sm text-secondary leading-relaxed pl-11">
            {t('guide.step4Desc')}
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link to="/" className="btn btn-primary px-6 py-2.5 text-sm font-semibold inline-flex items-center gap-2">
          {t('guide.exploreFeed')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
