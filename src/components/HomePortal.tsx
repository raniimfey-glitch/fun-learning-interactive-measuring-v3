import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { playClick } from '../utils/soundEffects';
import appIconSrc from '../assets/images/app_icon_1788024611307.jpg';
import { 
  Compass, 
  Droplet, 
  HelpCircle, 
  Calculator, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';

interface HomePortalProps {
  onSelectActivity: (id: number) => void;
}

export const HomePortal: React.FC<HomePortalProps> = ({ onSelectActivity }) => {
  const { language, t, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const activities = [
    {
      id: 1,
      number: '1',
      title: language === 'ar' ? 'استكشاف وحدات السعة' : 'Explore Capacity Units',
      subtitle: language === 'ar' ? 'التعرّف البصري والصوتي على اللتر ونصفه وربعه' : 'Discover Liter, Half Liter & Quarter Liter',
      description: language === 'ar' 
        ? 'اضغط على الأواني واستمع للنطق الصحيح وشاهد تدريج اللتر ومقارنة السعات.'
        : 'Interactive vessels with crystal-clear voice narration and visual scale comparison.',
      badge: language === 'ar' ? 'استكشاف ومفاهيم' : 'Concepts & Audio',
      color: 'from-sky-500 to-blue-600',
      lightBg: 'bg-sky-50 hover:bg-sky-100/80 border-sky-200',
      textColor: 'text-sky-700',
      accentColor: 'bg-sky-500',
      icon: Compass,
      tags: language === 'ar' ? ['1 لتر', '½ لتر', '¼ لتر', 'نطق صوتي'] : ['1 Liter', '½ Liter', '¼ Liter', 'Voice Narration'],
    },
    {
      id: 2,
      number: '2',
      title: language === 'ar' ? 'صبّ واملأ الأواني' : 'Pour & Fill Containers',
      subtitle: language === 'ar' ? 'محاكاة تفاعلية لحركة وسكب السوائل' : 'Hands-on pouring and volume matching',
      description: language === 'ar'
        ? 'اسكب ربع لتر في كل خطوة حتى تصل إلى السعة المطلوبة وتحقق من الدقة.'
        : 'Pour in 250 mL increments to reach the target volume with interactive liquid physics.',
      badge: language === 'ar' ? 'محاكاة عملية' : 'Interactive Simulation',
      color: 'from-teal-500 to-emerald-600',
      lightBg: 'bg-teal-50 hover:bg-teal-100/80 border-teal-200',
      textColor: 'text-teal-700',
      accentColor: 'bg-teal-500',
      icon: Droplet,
      tags: language === 'ar' ? ['سكب ممتع', 'إفراغ وتراجع', 'مطابقة السعات'] : ['Pouring', 'Undo/Refill', 'Target Match'],
    },
    {
      id: 3,
      number: '3',
      title: language === 'ar' ? 'تمارين واختبارات' : 'Quiz & Practice Questions',
      subtitle: language === 'ar' ? 'تحديات ممتعة لقياس مدى فهمك واستيعابك' : 'Interactive challenges with instant feedback',
      description: language === 'ar'
        ? 'أسئلة تفاعلية متنوعة تشمل التحويلات، المقارنات، واختيار السعة المناسبة.'
        : 'Multiple question types covering conversions, vessel reading, and real-world estimates.',
      badge: language === 'ar' ? 'تحدّي ونجوم' : 'Earn Stars & Score',
      color: 'from-indigo-500 to-purple-600',
      lightBg: 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200',
      textColor: 'text-indigo-700',
      accentColor: 'bg-indigo-500',
      icon: HelpCircle,
      tags: language === 'ar' ? ['اختيار من متعدد', 'تدريج الإناء', '3 نجوم تفوق'] : ['Multiple Choice', 'Visual Scales', '3 Stars Mastery'],
    },
    {
      id: 4,
      number: '4',
      title: language === 'ar' ? 'مكمّل السعة (1000 مل)' : '1000 mL Balance & Complement',
      subtitle: language === 'ar' ? 'جمع وطرح السعات للوصول إلى لتر كامل' : 'Addition and subtraction to reach 1 Liter',
      description: language === 'ar'
        ? 'احسب الكمية المتبقية لإكمال 1000 مل مع الاستعانة بلوح المسودة التفاعلي.'
        : 'Find the missing volume needed to fill 1000 mL with voice hints and scratchpad.',
      badge: language === 'ar' ? 'حساب ذهني' : 'Mental Math',
      color: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200',
      textColor: 'text-amber-700',
      accentColor: 'bg-amber-500',
      icon: Calculator,
      tags: language === 'ar' ? ['متمم 1000 مل', 'لوح الحساب', 'تلميح صوتي'] : ['1000 mL Target', 'Scratchpad', 'Voice Hint'],
    },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 sm:gap-2 py-0.5 animate-fade-in">
      {/* Welcome Banner Card */}
      <section 
        id="home-welcome-card"
        className="bg-white rounded-2xl p-2 sm:p-2.5 border border-slate-200 shadow-xs relative overflow-hidden shrink-0"
      >
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-sky-500 via-teal-500 to-indigo-500" />
        
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* Pulsing App Icon in the Main Interface */}
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 blur-xs opacity-75 animate-pulse" />
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-900 p-0.5 border-2 border-white shadow-xs overflow-hidden flex items-center justify-center">
                <img
                  src={appIconSrc}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/app-icon.jpg';
                  }}
                  alt="App Icon"
                  className="w-full h-full object-cover rounded-[10px] animate-pulse"
                />
              </div>
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-black">
                <Sparkles className="w-3 h-3 text-sky-600" />
                <span>{t.homeTitle}</span>
              </div>
              <h2 className="text-xs sm:text-sm md:text-base font-black text-slate-900 tracking-tight truncate">
                {language === 'ar' ? 'مَرْحَباً بِكَ فِي عَالَمِ قِيَاسِ السَّعَاتِ!' : 'Welcome to the World of Capacities!'}
              </h2>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate hidden sm:block">
                {t.homeSubtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center px-2.5 py-1 bg-slate-50 rounded-xl border border-slate-200 shrink-0">
            <span className="text-base sm:text-lg font-black text-sky-600 leading-none">4</span>
            <span className="text-[9px] font-bold text-slate-500">{t.activitiesCount}</span>
          </div>
        </div>
      </section>

      {/* Main Activities Grid */}
      <section aria-label={t.activitiesTitle} className="flex-1 min-h-0 flex flex-col justify-between space-y-1">
        <div className="flex items-center justify-between px-1 shrink-0">
          <h3 className="text-xs sm:text-sm font-black text-slate-800">
            {t.activitiesTitle}
          </h3>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500">
            {language === 'ar' ? 'اختر أي نشاط للبدء' : 'Select an activity to start'}
          </span>
        </div>

        <div id="home-activities-grid" className="grid grid-cols-2 gap-2 sm:gap-2.5 flex-1 min-h-0 items-stretch">
          {activities.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                id={`activity-card-${act.id}`}
                className="bg-white rounded-2xl p-2 sm:p-3 border-2 border-slate-200 hover:border-sky-300 transition-all flex flex-col justify-between shadow-xs hover:shadow-sm group shrink min-h-0"
              >
                <div className="min-h-0">
                  {/* Top row: Icon, Badge & Number */}
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${act.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full ${act.lightBg} ${act.textColor} border truncate`}>
                      {act.badge}
                    </span>
                  </div>

                  {/* Activity Title & Description */}
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                    {act.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1 sm:line-clamp-2 mt-0.5 leading-tight">
                    {act.description}
                  </p>
                </div>

                {/* Bottom Action Button */}
                <button
                  type="button"
                  id={`start-activity-btn-${act.id}`}
                  onClick={() => {
                    playClick();
                    onSelectActivity(act.id);
                  }}
                  className={`w-full py-1.5 sm:py-2 px-2.5 rounded-xl bg-gradient-to-r ${act.color} text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer mt-1.5`}
                >
                  <span>{t.startActivity}</span>
                  <ArrowIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
