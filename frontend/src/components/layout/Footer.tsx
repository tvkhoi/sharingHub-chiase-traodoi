import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Layers, Mail, ShieldCheck, FileText, HelpCircle, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="glass-panel border-t border-color bg-slate-950/90 text-secondary mt-16 transition-colors duration-150">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand & Description Column */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-decoration-none">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent block">
                  {t('nav.brand')}
                </span>
                <span className="text-xs text-secondary opacity-90 font-medium -mt-1 block">
                  {t('nav.subBrand')}
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-md">
              {t('footer.desc')}
            </p>

            {/* Email Contact Badge Only */}
            <div className="pt-2">
              <a
                href="mailto:contact@sharehub.vn"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer shadow-sm"
                title="Liên hệ Email hỗ trợ ShareHub"
              >
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>contact@sharehub.vn</span>
              </a>
            </div>
          </div>

          {/* Explore Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider">
              {t('footer.explore')}
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="text-secondary hover:text-brand-primary transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  {t('footer.electronics')}
                </Link>
              </li>
              <li>
                <Link to="/" className="text-secondary hover:text-brand-primary transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                  {t('footer.books')}
                </Link>
              </li>
              <li>
                <Link to="/" className="text-secondary hover:text-brand-primary transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                  {t('footer.furniture')}
                </Link>
              </li>
              <li>
                <Link to="/transactions" className="text-secondary hover:text-brand-emerald transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  {t('footer.safeTrading')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider">
              {t('footer.support')}
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/guide" className="text-secondary hover:text-primary transition-colors flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  {t('footer.userGuide')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-secondary hover:text-primary transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-secondary hover:text-primary transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  {t('footer.termsOfService')}
                </Link>
              </li>
              <li>
                <Link to="/report-issue" className="text-secondary hover:text-rose-400 transition-colors flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  {t('footer.reportIssue')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 mt-8 border-t border-color/60 text-center text-xs text-muted flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>{t('footer.copyright')}</span>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            🌱 ShareHub • Sustainable Living
          </span>
        </div>
      </div>
    </footer>
  );
};
