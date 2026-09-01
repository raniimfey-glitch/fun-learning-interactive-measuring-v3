import React, { useEffect } from 'react';
import { RotateCcw, CheckCircle } from 'lucide-react';
import { speechEngine } from '../utils/speechEngine';
import { playFanfare, playClick } from '../utils/soundEffects';
import { useLanguage } from '../i18n/LanguageContext';

interface CelebrationModalProps {
  isOpen: boolean;
  score: number;
  total: number;
  onRetry: () => void;
  onClose: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  score,
  total,
  onRetry,
  onClose,
}) => {
  const { language, t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      playFanfare();
      const pct = score / total;
      let praise = '';
      if (language === 'en') {
        if (pct >= 0.8) {
          praise = 'Outstanding job, Champion! You achieved a perfect score in capacity measurement!';
        } else if (pct >= 0.5) {
          praise = 'Great effort! You answered most of the questions correctly!';
        } else {
          praise = 'Good attempt! Practice makes perfect, try again to master all units!';
        }
      } else {
        if (pct >= 0.8) {
          praise = 'مُمْتَازٌ جِدًّا يَا بَطَل! حَقَّقْتَ نَتِيجَةً كَامِلَةً وَمُمَيَّزَةً فِي قِيَاسِ السَّعَات!';
        } else if (pct >= 0.5) {
          praise = 'عَمَلٌ رَائِعٌ! أَجَبْتَ عَلَى أَغْلَبِ الأَسْئِلَةِ بِشَكْلٍ صَحِيحٍ.';
        } else {
          praise = 'أَحْسَنْتَ المُحَاوَلَةَ! التَّكْرَارُ يُعَلِّمُ الشُّطَّارَ، حَاوِلْ مَرَّةً أُخْرَى لِتَتَمَيَّز!';
        }
      }
      speechEngine.speak(praise);
    }
  }, [isOpen, score, total, language]);

  if (!isOpen) return null;

  const pct = score / total;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div id="celebration-modal-content" className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-md text-center shadow-2xl border border-slate-200 relative overflow-hidden animate-pop-in">
        {/* Top color bar */}
        <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-500" />

        {/* Emoji Trophy */}
        <div className="text-7xl sm:text-8xl mb-4 animate-bounce">
          {pct >= 0.8 ? '🏆' : pct >= 0.5 ? '🌟' : '💪'}
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          {pct >= 0.8
            ? t.celebrationHigh
            : pct >= 0.5
            ? t.celebrationMid
            : t.celebrationLow}
        </h3>
        <p className="text-sm sm:text-base text-slate-600 font-bold mb-6">
          {pct >= 0.8
            ? t.celebrationHighDesc
            : pct >= 0.5
            ? t.celebrationMidDesc
            : t.celebrationLowDesc}
        </p>

        {/* Score Ring */}
        <div className="p-5 rounded-3xl bg-sky-50/80 border-2 border-sky-200 mb-6 inline-block w-full shadow-inner">
          <div className="text-4xl sm:text-5xl font-black text-sky-600">
            {score} <span className="text-lg sm:text-xl text-slate-400 font-black">/ {total}</span>
          </div>
          <div className="text-sm sm:text-base font-black text-slate-800 mt-1.5">
            {t.accuracyRate}: {Math.round(pct * 100)}%
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            id="celebration-retry-btn"
            type="button"
            onClick={() => {
              playClick();
              onRetry();
            }}
            className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-black rounded-2xl text-base shadow-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <RotateCcw size={20} />
            <span>{t.retryChallenge}</span>
          </button>
          <button
            id="celebration-done-btn"
            type="button"
            onClick={() => {
              playClick();
              onClose();
            }}
            className="flex-1 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-black rounded-2xl text-base shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all border border-white/20"
          >
            <CheckCircle size={20} />
            <span>{t.gotIt}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
