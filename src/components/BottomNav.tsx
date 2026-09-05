import React from 'react';
import { Compass, Droplet, HelpCircle, Calculator, Home, PenTool } from 'lucide-react';
import { playClick } from '../utils/soundEffects';
import { useLanguage } from '../i18n/LanguageContext';

interface BottomNavProps {
  selectedActivity: number | null;
  onSelectActivity: (id: number | null) => void;
  onOpenScratch: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  selectedActivity,
  onSelectActivity,
  onOpenScratch,
}) => {
  const { language, t } = useLanguage();

  const navItems = [
    {
      id: null,
      label: language === 'ar' ? 'الرئيسية' : 'Home',
      icon: Home,
      color: 'text-sky-600',
      activeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      id: 1,
      label: language === 'ar' ? 'استكشاف' : 'Explore',
      icon: Compass,
      color: 'text-blue-600',
      activeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 2,
      label: language === 'ar' ? 'صبّ واملأ' : 'Pour',
      icon: Droplet,
      color: 'text-teal-600',
      activeBg: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      id: 3,
      label: language === 'ar' ? 'تمارين' : 'Quiz',
      icon: HelpCircle,
      color: 'text-indigo-600',
      activeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      id: 4,
      label: language === 'ar' ? 'مكمّل 1000' : 'Complement',
      icon: Calculator,
      color: 'text-amber-600',
      activeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Bottom Navigation"
      className="shrink-0 z-20 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 py-1 px-2 shadow-xs select-none"
    >
      <div className="w-full max-w-[900px] mx-auto flex items-center justify-between gap-1 sm:gap-2">
        <div className="flex items-center justify-around flex-1 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedActivity === item.id;
            return (
              <button
                key={item.id === null ? 'home' : item.id}
                type="button"
                id={`bottom-nav-${item.id === null ? 'home' : item.id}`}
                onClick={() => {
                  playClick();
                  onSelectActivity(item.id);
                }}
                className={`flex-1 flex flex-col items-center justify-center py-1 px-1 sm:px-2 rounded-xl transition-all cursor-pointer border ${
                  isActive
                    ? `${item.activeBg} font-black shadow-2xs scale-[1.02]`
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-bold'
                }`}
              >
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                <span className="text-[10px] sm:text-xs leading-tight mt-0.5 truncate max-w-[65px] sm:max-w-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Scratchpad Tool Button in Bottom Nav */}
        <div className="border-s border-slate-200 ps-1 sm:ps-2 shrink-0">
          <button
            type="button"
            id="bottom-nav-scratchpad"
            onClick={() => {
              playClick();
              onOpenScratch();
            }}
            title={t.scratchpadTab}
            className="flex flex-col items-center justify-center py-1 px-2 sm:px-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:brightness-105 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <PenTool className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-xs font-black leading-tight mt-0.5">
              {language === 'ar' ? 'مسوّدة' : 'Pad'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};
