import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { playClick } from '../utils/soundEffects';
import { Sparkles, X, ArrowRight, ArrowLeft, Smartphone, Eye } from 'lucide-react';

interface SplashScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartApp?: () => void;
}

export const SplashScreenModal: React.FC<SplashScreenModalProps> = ({
  isOpen,
  onClose,
  onStartApp,
}) => {
  const { language, isRTL } = useLanguage();
  const [viewMode, setViewMode] = useState<'live' | 'mockup'>('live');
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  if (!isOpen) return null;

  const handleStart = () => {
    playClick();
    if (onStartApp) {
      onStartApp();
    } else {
      onClose();
    }
  };

  return (
    <div 
      id="splash-screen-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playClick();
          onClose();
        }
      }}
    >
      <div 
        id="splash-screen-dialog"
        className="relative w-full max-w-sm sm:max-w-md my-auto flex flex-col items-center select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between mb-3 px-1 text-white/90">
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/15">
            <button
              type="button"
              onClick={() => {
                playClick();
                setViewMode('live');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                viewMode === 'live' 
                  ? 'bg-sky-500 text-white shadow-sm' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {language === 'ar' ? 'واجهة تفاعلية' : 'Interactive UI'}
            </button>
            <button
              type="button"
              onClick={() => {
                playClick();
                setViewMode('mockup');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'mockup' 
                  ? 'bg-sky-500 text-white shadow-sm' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تصميم 9:16' : '9:16 Mockup'}</span>
            </button>
          </div>

          <button
            type="button"
            id="close-splash-btn"
            onClick={() => {
              playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/15 cursor-pointer active:scale-95"
            title={language === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 9:16 Aspect Ratio Frame */}
        <div 
          id="splash-screen-frame"
          className="w-full aspect-[9/16] max-h-[82vh] rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-2xl border-4 border-white/20 relative flex flex-col justify-between"
        >
          {viewMode === 'mockup' ? (
            /* High-Res Rendered 9:16 Splash Screen Image */
            <div className="relative w-full h-full bg-slate-950 flex flex-col">
              <img
                src="/src/assets/images/splash_screen_ui_1788445467030.jpg"
                alt="Mobile UI Splash Screen 9:16 Mockup"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {/* Floating Start Overlay */}
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full py-3 px-4 rounded-2xl bg-white/90 hover:bg-white text-slate-900 font-black text-sm shadow-xl backdrop-blur-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <span>{language === 'ar' ? 'دخول التطبيق' : 'Enter Application'}</span>
                  <ArrowIcon className="w-4 h-4 text-sky-600" />
                </button>
              </div>
            </div>
          ) : (
            /* Adaptive Background: Dynamic gradient with glowing radial light effect */
            <div className="relative w-full h-full bg-gradient-to-b from-sky-950 via-sky-900 to-slate-950 text-white flex flex-col justify-between p-6 sm:p-7 overflow-hidden">
              {/* Radial glow centered behind icon */}
              <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 bg-sky-400/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-[32%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-cyan-300/35 rounded-full blur-xl pointer-events-none" />

              {/* Decorative subtle ambient lights */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-indigo-600/25 rounded-full blur-2xl pointer-events-none" />

              {/* Top empty balance space for mobile status bar */}
              <div className="w-full flex justify-end items-center opacity-60 text-[11px] font-mono tracking-widest pt-1">
                <span>9:41</span>
              </div>

              {/* Centered Upper-Middle App Icon & Content */}
              <div className="relative z-10 flex flex-col items-center text-center my-auto">
                {/* App Icon with 20px rounded square and glowing ambient shadow */}
                <div className="relative group mb-5">
                  <div className="absolute -inset-2 bg-gradient-to-r from-sky-400 to-cyan-300 rounded-[24px] blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[20px] bg-slate-900 p-1 border-2 border-white/30 shadow-2xl overflow-hidden flex items-center justify-center">
                    <img
                      src="/src/assets/images/app_icon_1788024611307.jpg"
                      alt="App Icon"
                      className="w-full h-full object-cover rounded-[18px]"
                    />
                  </div>
                </div>

                {/* Typography & Layout */}
                <div className="space-y-1.5 max-w-xs">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                    {language === 'ar' ? 'قِيَاسُ السَّعَاتِ' : 'Capacity Explorer'}
                  </h1>
                  <p className="text-xs sm:text-sm font-bold text-sky-200/90 leading-relaxed">
                    {language === 'ar' ? 'اللِّتْرُ وَنِصْفُهُ وَرُبْعُهُ | رِحْلَةٌ مُمْتِعَةٌ' : 'Liter, Half & Quarter Liter | Fun Math Journey'}
                  </p>
                </div>

                {/* Start Button */}
                <div className="w-full max-w-[220px] mt-6">
                  <button
                    type="button"
                    id="splash-enter-btn"
                    onClick={handleStart}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{language === 'ar' ? 'ابدأ الاستكشاف 🚀' : 'Start Exploring 🚀'}</span>
                    <ArrowIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom Section: Branding Pill & Indicators */}
              <div className="relative z-10 flex flex-col items-center gap-4 pb-2">
                {/* Branding Pill with stars */}
                <div 
                  id="splash-branding-pill"
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/95 text-[11px] sm:text-xs font-black shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>{language === 'ar' ? 'رَنِيم فَاي | التَّعْلِيمُ المُمْتِعُ' : 'Ranim Fay | Fun Learning'}</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                </div>

                {/* Indicators: Three small round dots, one highlighted in primary theme color */}
                <div className="flex items-center gap-2 pt-1" aria-label="Loading Indicators">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                  <span className="w-2 h-2 rounded-full bg-white/30" />
                  <span className="w-2 h-2 rounded-full bg-white/30" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
