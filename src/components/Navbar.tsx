import React from 'react';
import { playClick } from '../utils/soundEffects';
import { useLanguage } from '../i18n/LanguageContext';
import { AlgeriaFlag, UkFlag } from '../i18n/flags';
import appIconSrc from '../assets/images/app_icon_1788024611307.jpg';

interface NavbarProps {
  stars?: number;
  maxStars?: number;
  onOpenScratch?: () => void;
  onGoHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onGoHome,
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="shrink-0 z-30 bg-white/95 backdrop-blur-md text-slate-800 shadow-xs px-2.5 sm:px-4 py-1.5 sm:py-2 border-b border-slate-200 w-full">
      <div className="w-full max-w-[900px] mx-auto flex items-center justify-between gap-2">
        {/* Brand with App Icon & Title */}
        <button
          type="button"
          onClick={() => {
            if (onGoHome) {
              playClick();
              onGoHome();
            }
          }}
          className="flex items-center gap-2 sm:gap-2.5 min-w-0 text-start bg-transparent border-0 p-0 cursor-pointer group"
          title={t.appTitle}
        >
          <div className="relative shrink-0 group">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 opacity-75 blur-xs animate-pulse" />
            <img
              src={appIconSrc}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/app-icon.jpg';
              }}
              alt={t.appIconAlt}
              referrerPolicy="no-referrer"
              className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-xs border-2 border-white object-cover group-hover:scale-105 transition-transform animate-pulse"
            />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] sm:text-[11px] font-black text-sky-600 leading-none mb-0.5">
              {t.brandTag}
            </div>
            <h1 className="text-xs sm:text-base font-black tracking-tight leading-tight text-slate-900 truncate group-hover:text-sky-600 transition-colors">
              {t.appTitle}
            </h1>
          </div>
        </button>

        {/* Action Controls: Language Switcher */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Language Switcher Segmented Control */}
          <div
            id="lang-switcher"
            className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs"
            role="group"
            aria-label={t.changeLanguage}
          >
            <button
              id="lang-btn-ar"
              type="button"
              onClick={() => {
                if (language !== 'ar') {
                  playClick();
                  setLanguage('ar');
                }
              }}
              title="العربية (الجزائر)"
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === 'ar'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <AlgeriaFlag size={16} />
              <span className="hidden xs:inline text-xs">العربية</span>
            </button>

            <button
              id="lang-btn-en"
              type="button"
              onClick={() => {
                if (language !== 'en') {
                  playClick();
                  setLanguage('en');
                }
              }}
              title="English (UK)"
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UkFlag size={16} />
              <span className="hidden xs:inline text-xs">English</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
