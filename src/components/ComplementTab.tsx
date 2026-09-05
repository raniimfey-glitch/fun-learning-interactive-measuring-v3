import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, XCircle, ArrowLeft, ArrowRight, PenTool, Lightbulb } from 'lucide-react';
import { getComplementData } from '../data';
import { VesselSVG } from './VesselSVG';
import { speechEngine } from '../utils/speechEngine';
import { playSuccess, playError, playClick } from '../utils/soundEffects';
import { ComplementItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface ComplementTabProps {
  onScoreEarned: () => void;
  onOpenScratch: () => void;
}

export const ComplementTab: React.FC<ComplementTabProps> = ({ onScoreEarned, onOpenScratch }) => {
  const { language, t, isRTL } = useLanguage();
  const complements = getComplementData(language);

  const [compIdx, setCompIdx] = useState(0);
  const [inp1, setInp1] = useState('');
  const [inp2, setInp2] = useState('');
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  const currentQ: ComplementItem = complements[compIdx % complements.length];
  const total = complements.length;

  useEffect(() => {
    // Auto narrate complement math question if settings allow
    const settings = speechEngine.getSettings();
    if (!settings.enabled || !settings.autoPlayQuestion) return;

    const timer = setTimeout(() => {
      speechEngine.speak(currentQ.vocalizedQ || currentQ.q);
    }, 250);

    return () => {
      clearTimeout(timer);
      speechEngine.stop();
    };
  }, [compIdx, language]);

  const handleSpeakQuestion = () => {
    playClick();
    speechEngine.speak(currentQ.vocalizedQ || currentQ.q);
  };

  const handleSpeakHint = () => {
    playClick();
    setShowHint(true);
    const hintPrefix = language === 'en' ? 'Hint: ' : 'تَلْمِيحٌ: ';
    speechEngine.speak(`${hintPrefix}${currentQ.vocalizedHint || currentQ.hint}`);
  };

  const handleCheck = () => {
    if (answered || !inp1.trim()) return;
    if (currentQ.twoAnswers && !inp2.trim()) return;

    setAnswered(true);
    playClick();

    let correct = false;
    if (currentQ.twoAnswers) {
      const [a1, a2] = currentQ.a.split('|');
      correct = inp1.trim() === a1.trim() && inp2.trim() === a2.trim();
    } else {
      correct = inp1.trim() === currentQ.a.trim();
    }

    setIsCorrect(correct);

    if (correct) {
      playSuccess();
      onScoreEarned();
      const praise = language === 'en' ? 'Great job! Correct answer!' : 'أَحْسَنْتَ! إِجَابَةٌ صَحِيحَةٌ وَمُمَيَّزَةٌ!';
      speechEngine.speak(praise);
    } else {
      playError();
      const ansFormatted = currentQ.a.replace('|', language === 'en' ? ' and ' : ' و ');
      const err = language === 'en'
        ? `The correct answer is: ${ansFormatted}.`
        : `الإِجَابَةُ الصَّحِيحَةُ هِيَ: ${ansFormatted}.`;
      speechEngine.speak(err);
    }
  };

  const handleNext = () => {
    playClick();
    const nextIdx = (compIdx + 1) % total;
    setCompIdx(nextIdx);
    setInp1('');
    setInp2('');
    setAnswered(false);
    setIsCorrect(null);
    setShowHint(false);
  };

  const badgeText = t.complementBadge
    .replace('{current}', String(compIdx + 1))
    .replace('{total}', String(total));

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div id="complement-header-card" className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <span className="text-xs sm:text-sm font-black text-sky-800 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200">
            {badgeText}
          </span>
          <div className="flex gap-2">
            <button
              id="complement-speak-btn"
              type="button"
              onClick={handleSpeakQuestion}
              className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm font-black flex items-center gap-1.5 hover:bg-slate-200 transition-colors active:scale-95 shadow-xs"
            >
              <Volume2 size={16} />
              <span>{t.listenEquation}</span>
            </button>
            <button
              id="complement-scratchpad-btn"
              type="button"
              onClick={onOpenScratch}
              className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs sm:text-sm font-black flex items-center gap-1.5 hover:bg-slate-200 transition-colors shadow-xs"
            >
              <PenTool size={16} />
              <span>{t.scratchpadTab}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${((compIdx + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Equation Box */}
      <div id="complement-equation-card" className="bg-white rounded-3xl p-4 sm:p-8 shadow-xs border border-slate-200 text-center">
        {/* Visual Reference Bottle */}
        <div className="flex justify-center mb-6">
          <VesselSVG
            ml={currentQ.refML}
            maxMl={1000}
            width={125}
            height={250}
            color="#0284C7"
            lightColor="#E0F2FE"
            label={`${currentQ.refML} ${t.mlUnit}`}
            interactive
          />
        </div>

        {/* Math Display with Inputs */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-sky-50/80 border border-sky-200 max-w-2xl mx-auto mb-6 shadow-xs">
          <div className={`flex items-center justify-center flex-wrap gap-2 sm:gap-3 text-xl sm:text-3xl md:text-4xl font-black text-slate-900 ${isRTL ? 'direction-rtl' : 'direction-ltr'}`}>
            {(() => {
              if (currentQ.twoAnswers) {
                const parts = currentQ.q.split('___');
                return (
                  <>
                    <span>{parts[0]}</span>
                    <input
                      id="comp-input-1"
                      type="number"
                      disabled={answered}
                      value={inp1}
                      onChange={(e) => setInp1(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCheck();
                      }}
                      placeholder="?"
                      className="w-24 sm:w-28 h-14 sm:h-16 text-center text-xl sm:text-3xl font-black bg-white border-2 border-slate-300 text-slate-900 rounded-2xl outline-none focus:border-sky-500 shadow-inner"
                    />
                    <span>{parts[1]}</span>
                    <input
                      id="comp-input-2"
                      type="number"
                      disabled={answered}
                      value={inp2}
                      onChange={(e) => setInp2(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCheck();
                      }}
                      placeholder="?"
                      className="w-20 sm:w-24 h-14 sm:h-16 text-center text-xl sm:text-3xl font-black bg-white border-2 border-slate-300 text-slate-900 rounded-2xl outline-none focus:border-sky-500 shadow-inner"
                    />
                    <span>{parts[2]}</span>
                  </>
                );
              }

              const parts = currentQ.q.split('___');
              return (
                <>
                  <span>{parts[0]}</span>
                  <input
                    id="comp-input-1"
                    type="number"
                    disabled={answered}
                    value={inp1}
                    onChange={(e) => setInp1(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCheck();
                    }}
                    placeholder="?"
                    className="w-28 sm:w-36 h-14 sm:h-16 text-center text-xl sm:text-3xl font-black bg-white border-2 border-slate-300 text-slate-900 rounded-2xl outline-none focus:border-sky-500 shadow-inner"
                  />
                  <span>{parts[1]}</span>
                </>
              );
            })()}
          </div>
        </div>

        {/* Hint button & message */}
        <div className="mb-6">
          {!showHint ? (
            <button
              id="complement-hint-btn"
              type="button"
              onClick={handleSpeakHint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm sm:text-base font-black hover:bg-amber-100 transition-colors shadow-xs active:scale-95 min-h-[44px]"
            >
              <Lightbulb size={18} className="text-amber-600" />
              <span>{t.hintButton}</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 max-w-lg mx-auto text-sm sm:text-base font-black text-amber-900 animate-fade-in flex items-center justify-center gap-2 shadow-xs">
              <Lightbulb size={20} className="text-amber-600 shrink-0" />
              <span>💡 {currentQ.hint}</span>
            </div>
          )}
        </div>

        {/* Validate Button */}
        {!answered && (
          <button
            id="complement-check-btn"
            type="button"
            onClick={handleCheck}
            className="w-full max-w-md mx-auto py-4 sm:py-4.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-black rounded-2xl text-base sm:text-xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 border border-white/20 min-h-[54px]"
          >
            <span>{t.checkAnswer}</span>
          </button>
        )}

        {/* Feedback Area */}
        {answered && isCorrect !== null && (
          <div
            id="complement-feedback-msg"
            className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-center border mb-6 animate-fade-in flex items-center justify-center gap-2 max-w-lg mx-auto shadow-xs ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="text-emerald-600 shrink-0" size={24} />
            ) : (
              <XCircle className="text-rose-600 shrink-0" size={24} />
            )}
            <span className="font-black text-base sm:text-xl">
              {isCorrect
                ? t.correctAnswerMsg
                : `${t.wrongAnswerMsg.replace('{answer}', currentQ.a.replace('|', language === 'en' ? ' and ' : ' و '))}`}
            </span>
          </div>
        )}

        {/* Next Button */}
        {answered && (
          <button
            id="complement-next-btn"
            type="button"
            onClick={handleNext}
            className="w-full max-w-md mx-auto py-4 sm:py-4.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-black rounded-2xl text-base sm:text-xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 border border-white/20 min-h-[54px]"
          >
            <span>{compIdx + 1 < total ? t.nextQuestionBtn : t.completedAllBtn}</span>
            {isRTL ? <ArrowLeft size={22} /> : <ArrowRight size={22} />}
          </button>
        )}
      </div>
    </div>
  );
};
