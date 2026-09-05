import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { playClick } from '../utils/soundEffects';
import { Sparkles } from 'lucide-react';
import appIconSrc from '../assets/images/app_icon_1788024611307.jpg';

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
  const { language } = useLanguage();

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
      id="splash-screen-fullscreen"
      onClick={handleStart}
      className="fixed inset-0 z-50 w-screen h-screen min-h-screen bg-gradient-to-b from-sky-950 via-sky-900 to-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 md:p-14 overflow-hidden select-none animate-fade-in cursor-pointer"
    >
      {/* Dynamic Glowing Radial Light Flare Centered behind the App Icon */}
      <div className="absolute top-[32%] sm:top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-sky-400/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-[32%] sm:top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-cyan-300/35 rounded-full blur-2xl pointer-events-none" />

      {/* Decorative ambient background accents */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Dismiss / Direct Enter */}
      <div className="relative z-10 w-full flex items-center justify-between text-white/80 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/15">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{language === 'ar' ? 'أهلاً بك في التطبيق التعليمي' : 'Welcome to the Learning App'}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleStart();
          }}
          className="text-xs sm:text-sm font-black px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer active:scale-95"
        >
          {language === 'ar' ? 'تخطي ✕' : 'Skip ✕'}
        </button>
      </div>

      {/* Main Centered Content: Upper-Middle App Icon, Typography & Requested Brand Badge */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto max-w-xl mx-auto px-4">
        {/* App Icon: Centered in upper-middle area with 20px rounded corners & ambient pulsing glow */}
        <div className="relative group mb-6 sm:mb-8">
          <div className="absolute -inset-2.5 sm:-inset-3.5 bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-400 rounded-[28px] blur-lg opacity-80 animate-pulse" />
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-[20px] bg-slate-900 p-1.5 border-2 border-white/50 shadow-2xl overflow-hidden flex items-center justify-center">
            <img
              src={appIconSrc}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/app-icon.jpg';
              }}
              alt="App Icon"
              className="w-full h-full object-cover rounded-[16px] animate-pulse"
            />
          </div>
        </div>

        {/* Centered Typography */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">
            {language === 'ar' ? 'قِيَاسُ السَّعَاتِ' : 'Capacity Explorer'}
          </h1>
          <p className="text-base sm:text-xl font-bold text-sky-200 drop-shadow-sm leading-relaxed max-w-md mx-auto">
            {language === 'ar' ? 'اللِّتْرُ وَنِصْفُهُ وَرُبْعُهُ | رِحْلَةٌ مُمْتِعَةٌ' : 'Liter, Half & Quarter Liter | A Fun Journey'}
          </p>
        </div>

        {/* Brand Badge in place of the Start Exploring button */}
        <div className="mt-8 sm:mt-10">
          <div
            id="splash-brand-badge"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm sm:text-base md:text-lg font-black shadow-lg shadow-cyan-500/15 transition-all group"
          >
            <span className="tracking-wide">✨️ التعلم الممتع - fun learning ✨️</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Navigation Indicators & Tap prompt */}
      <div className="relative z-10 flex flex-col items-center gap-3 pb-2 max-w-md mx-auto w-full">
        <p className="text-xs sm:text-sm text-sky-200/80 font-semibold animate-pulse">
          {language === 'ar' ? 'انقر في أي مكان للدخول إلى التطبيق' : 'Tap anywhere to enter the app'}
        </p>

        {/* Indicators: Three small round navigation/loading dots */}
        <div className="flex items-center gap-2.5" aria-label="Navigation indicators">
          <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-md shadow-cyan-400 animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-white/30" />
          <span className="w-2 h-2 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
};
