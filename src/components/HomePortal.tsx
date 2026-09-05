import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { playClick } from '../utils/soundEffects';
import { 
  Compass, 
  Droplet, 
  HelpCircle, 
  Calculator, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2,
  Smartphone
} from 'lucide-react';

interface HomePortalProps {
  onSelectActivity: (id: number) => void;
  onOpenSplash?: () => void;
}

export const HomePortal: React.FC<HomePortalProps> = ({ onSelectActivity, onOpenSplash }) => {
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
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Welcome Banner Card */}
      <section 
        id="home-welcome-card"
        className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-sky-500 via-teal-500 to-indigo-500" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>{t.homeTitle}</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {language === 'ar' ? 'مَرْحَباً بِكَ فِي عَالَمِ قِيَاسِ السَّعَاتِ!' : 'Welcome to the World of Capacities!'}
            </h2>
            <p className="text-sm sm:text-base font-semibold text-slate-600 leading-relaxed">
              {t.homeSubtitle}
            </p>

            {onOpenSplash && (
              <div className="pt-1">
                <button
                  type="button"
                  id="open-splash-btn"
                  onClick={() => {
                    playClick();
                    onOpenSplash();
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-black transition-all active:scale-95 shadow-2xs cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                  <span>{language === 'ar' ? '✨ شاشة الترحيب (Splash Screen)' : '✨ Welcome Screen'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="hidden md:flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-200 shrink-0">
            <span className="text-2xl font-black text-sky-600">4</span>
            <span className="text-xs font-bold text-slate-500">{t.activitiesCount}</span>
          </div>
        </div>
      </section>

      {/* Main Activities Grid */}
      <section aria-label={t.activitiesTitle} className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg sm:text-xl font-black text-slate-800">
            {t.activitiesTitle}
          </h3>
          <span className="text-xs font-bold text-slate-500">
            {language === 'ar' ? 'اختر أي نشاط للبدء' : 'Select an activity to start'}
          </span>
        </div>

        <div id="home-activities-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {activities.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                id={`activity-card-${act.id}`}
                className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-slate-300 group`}
              >
                <div>
                  {/* Top row: Icon, Badge & Number */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${act.color} text-white flex items-center justify-center shadow-md shadow-slate-200 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-full ${act.lightBg} ${act.textColor} border`}>
                        {act.badge}
                      </span>
                    </div>
                  </div>

                  {/* Activity Title & Description */}
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-sky-600 transition-colors mb-1">
                    {act.title}
                  </h4>
                  <p className="text-xs sm:text-sm font-bold text-slate-500 mb-2">
                    {act.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {act.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {act.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <button
                  type="button"
                  id={`start-activity-btn-${act.id}`}
                  onClick={() => {
                    playClick();
                    onSelectActivity(act.id);
                  }}
                  className={`w-full py-3 sm:py-3.5 px-4 rounded-2xl bg-gradient-to-r ${act.color} text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer`}
                >
                  <span>{t.startActivity}</span>
                  <ArrowIcon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
