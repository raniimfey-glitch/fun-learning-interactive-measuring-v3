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
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 animate-fade-in overflow-hidden">
      {/* Header Info */}
      <div id="complement-header-card" className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-xs border border-slate-200 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] sm:text-xs font-black text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
            {badgeText}
          </span>
          <div className="flex gap-1.5">
            <button
              id="complement-speak-btn"
              type="button"
              onClick={handleSpeakQuestion}
              className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-[11px] sm:text-xs font-black flex items-center gap-1 hover:bg-slate-200 transition-colors active:scale-95 shadow-xs cursor-pointer"
            >
              <Volume2 size={14} />
              <span>{t.listenEquation}</span>
            </button>
            <button
              id="complement-scratchpad-btn"
              type="button"
              onClick={onOpenScratch}
              className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-[11px] sm:text-xs font-black flex items-center gap-1 hover:bg-slate-200 transition-colors shadow-xs cursor-pointer"
            >
              <PenTool size={14} />
              <span>{t.scratchpadTab}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${((compIdx + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Equation Box */}
      <div id="complement-equation-card" className="flex-1 min-h-0 bg-white rounded-2xl p-2.5 sm:p-3 shadow-xs border border-slate-200 flex flex-col justify-between overflow-hidden text-center">
        {/* Visual Reference Bottle */}
        <div className="flex-1 min-h-0 flex justify-center items-center py-1 max-h-[30vh]">
          <VesselSVG
            ml={currentQ.refML}
            maxMl={1000}
            width={100}
            height={190}
            color="#0284C7"
            lightColor="#E0F2FE"
            label={`${currentQ.refML} ${t.mlUnit}`}
            interactive
          />
        </div>

        {/* Math Display with Inputs */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-sky-50 border border-sky-200 max-w-lg mx-auto w-full my-1 shrink-0">
          <div className={`flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 text-lg sm:text-2xl font-black text-slate-900 ${isRTL ? 'direction-rtl' : 'direction-ltr'}`}>
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
                      className="w-18 sm:w-22 h-9 sm:h-11 text-center text-base sm:text-xl font-black bg-white border-2 border-slate-300 text-slate-900 rounded-xl outline-none focus:border-sky-500"
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
                      className="w-16 sm:w-20 h-9 sm:h-11 text-center text-base sm:text-xl font-black bg-white border-2 border-slate-300 text-slate-900 rounded-xl outline-none focus:border-sky-500"
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
                    className="w-20 sm:w-28 h-9 sm:h-11 text-center text-base sm:text-xl font-black bg-white border-2 border-slate-300 text-slate-900 rounded-xl outline-none focus:border-sky-500"
                  />
                  <span>{parts[1]}</span>
                </>
              );
            })()}
          </div>
        </div>

        {/* Hint button & message */}
        <div className="shrink-0 my-0.5">
          {!showHint ? (
            <button
              id="complement-hint-btn"
              type="button"
              onClick={handleSpeakHint}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black hover:bg-amber-100 transition-colors shadow-xs active:scale-95 cursor-pointer"
            >
              <Lightbulb size={14} className="text-amber-600" />
              <span>{t.hintButton}</span>
            </button>
          ) : (
            <div className="p-1.5 rounded-xl bg-amber-50 border border-amber-300 max-w-md mx-auto text-xs font-black text-amber-900 animate-fade-in flex items-center justify-center gap-1.5 shadow-xs">
              <Lightbulb size={16} className="text-amber-600 shrink-0" />
              <span className="truncate">💡 {currentQ.hint}</span>
            </div>
          )}
        </div>

        {/* Validate Button */}
        {!answered && (
          <button
            id="complement-check-btn"
            type="button"
            onClick={handleCheck}
            className="w-full max-w-xs mx-auto py-2 px-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-black rounded-xl text-xs sm:text-sm shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shrink-0 mt-0.5"
          >
            <span>{t.checkAnswer}</span>
          </button>
        )}

        {/* Feedback Area */}
        {answered && isCorrect !== null && (
          <div
            id="complement-feedback-msg"
            className={`p-2 rounded-xl text-center border mt-0.5 animate-fade-in flex items-center justify-center gap-1.5 max-w-xs mx-auto w-full shadow-xs shrink-0 ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
            ) : (
              <XCircle className="text-rose-600 shrink-0" size={18} />
            )}
            <span className="font-black text-xs sm:text-sm truncate">
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
            className="w-full max-w-xs mx-auto py-2 px-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-black rounded-xl text-xs sm:text-sm shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shrink-0 mt-1"
          >
            <span>{compIdx + 1 < total ? t.nextQuestionBtn : t.completedAllBtn}</span>
            {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};
