import React, { useState } from 'react';
import { Volume2, VolumeX, Sliders, PenTool, Star } from 'lucide-react';
import { speechEngine } from '../utils/speechEngine';
import { playClick } from '../utils/soundEffects';
import { useLanguage } from '../i18n/LanguageContext';
import { AlgeriaFlag, UkFlag } from '../i18n/flags';

interface NavbarProps {
  stars: number;
  maxStars?: number;
  onOpenSettings: () => void;
  onOpenScratch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stars,
  maxStars = 3,
  onOpenSettings,
  onOpenScratch,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [audioEnabled, setAudioEnabled] = useState(speechEngine.getSettings().enabled);

  const toggleMute = () => {
    playClick();
    const current = speechEngine.getSettings();
    const updated = !current.enabled;
    speechEngine.updateSettings({ enabled: updated });
    setAudioEnabled(updated);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md text-slate-800 shadow-xs px-2.5 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200 w-full">
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Brand with App Icon & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src="/src/assets/images/app_icon_1788024611307.jpg"
            alt={t.appIconAlt}
            referrerPolicy="no-referrer"
            className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl shadow-xs border-2 border-sky-100 object-cover shrink-0"
          />
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs font-black text-sky-600 leading-none mb-0.5">
              {t.brandTag}
            </div>
            <h1 className="text-sm sm:text-lg md:text-xl font-black tracking-tight leading-tight text-slate-900 truncate">
              {t.appTitle}
            </h1>
          </div>
        </div>

        {/* Action Controls & Language Selector */}
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
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all ${
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
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all ${
                language === 'en'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UkFlag size={16} />
              <span className="hidden xs:inline text-xs">English</span>
            </button>
          </div>

          {/* Stars display */}
          <div
            id="stars-meter"
            className="flex items-center gap-0.5 sm:gap-1 bg-amber-50/90 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border-2 border-amber-200 shadow-xs"
          >
            {Array.from({ length: maxStars }).map((_, idx) => {
              const earned = idx < stars;
              return (
                <Star
                  key={idx}
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                    earned
                      ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                      : 'text-slate-300'
                  }`}
                />
              );
            })}
          </div>

          {/* Scratchpad Button */}
          <button
            id="navbar-scratchpad-btn"
            type="button"
            onClick={() => {
              playClick();
              onOpenScratch();
            }}
            title={t.openScratchpad}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all border border-slate-200 active:scale-95 shadow-xs"
          >
            <PenTool className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Quick Mute/Unmute */}
          <button
            id="navbar-mute-btn"
            type="button"
            onClick={toggleMute}
            title={audioEnabled ? t.muteAudio : t.unmuteAudio}
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all border active:scale-95 shadow-xs ${
              audioEnabled
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-rose-50 text-rose-600 border-rose-200'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Audio Settings Dialog */}
          <button
            id="navbar-settings-btn"
            type="button"
            onClick={() => {
              playClick();
              onOpenSettings();
            }}
            title={t.audioSettings}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all border border-slate-200 active:scale-95 shadow-xs"
          >
            <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
