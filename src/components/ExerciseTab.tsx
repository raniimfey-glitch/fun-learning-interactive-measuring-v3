import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { getExercisesData, getUnitsData } from '../data';
import { VesselSVG } from './VesselSVG';
import { speechEngine } from '../utils/speechEngine';
import { playSuccess, playError, playClick } from '../utils/soundEffects';
import { ExerciseItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface ExerciseTabProps {
  onFinish: (score: number, total: number) => void;
  onCorrectAnswer: () => void;
}

export const ExerciseTab: React.FC<ExerciseTabProps> = ({ onFinish, onCorrectAnswer }) => {
  const { language, t, isRTL } = useLanguage();
  const exercises = getExercisesData(language);
  const units = getUnitsData(language);

  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Double question state
  const [doubleInp1, setDoubleInp1] = useState('');
  const [doubleInp2, setDoubleInp2] = useState('');
  const [doubleStep1Passed, setDoubleStep1Passed] = useState(false);

  const currentQ: ExerciseItem = exercises[qIdx % exercises.length];
  const total = exercises.length;

  useEffect(() => {
    // Auto speak question when loaded if settings allow
    const settings = speechEngine.getSettings();
    if (!settings.enabled || !settings.autoPlayQuestion) return;

    const timer = setTimeout(() => {
      speechEngine.speak(currentQ.vocalizedQ || currentQ.q);
    }, 250);

    return () => {
      clearTimeout(timer);
      speechEngine.stop();
    };
  }, [qIdx, language]);

  const handleSpeakQuestion = () => {
    playClick();
    speechEngine.speak(currentQ.vocalizedQ || currentQ.q);
  };

  const handleMCQAnswer = (choice: string, vocalizedChoice?: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedChoice(choice);

    const correct = choice.trim() === currentQ.answer.trim();
    setIsCorrect(correct);

    if (correct) {
      playSuccess();
      setScore((s) => s + 1);
      onCorrectAnswer();
      const praise = language === 'en' ? 'Excellent! Correct answer.' : 'أَحْسَنْتَ! إِجَابَةٌ صَحِيحَةٌ.';
      speechEngine.speak(
        currentQ.vocalizedExplanation ? `${praise} ${currentQ.vocalizedExplanation}` : praise
      );
    } else {
      playError();
      const err = language === 'en'
        ? `Incorrect. The correct answer is: ${currentQ.answer}.`
        : `إِجَابَةٌ غَيْرُ صَحِيحَةٍ. الإِجَابَةُ الصَّحِيحَةُ هِيَ: ${currentQ.answer}.`;
      speechEngine.speak(
        currentQ.vocalizedExplanation ? `${err} ${currentQ.vocalizedExplanation}` : err
      );
    }
  };

  const handleCompareAnswer = (choiceId: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedChoice(choiceId);

    const correct = choiceId === currentQ.answer;
    setIsCorrect(correct);

    const correctUnit = units.find((u) => u.id === currentQ.answer);

    if (correct) {
      playSuccess();
      setScore((s) => s + 1);
      onCorrectAnswer();
      const praise = language === 'en'
        ? `Correct! ${correctUnit?.name || ''} is the correct answer.`
        : `صَحِيحٌ! ${correctUnit?.vocalizedName || ''} هُوَ الإِجَابَةُ الصَّحِيحَةُ.`;
      speechEngine.speak(praise);
    } else {
      playError();
      const msg = language === 'en'
        ? `The correct answer is: ${correctUnit?.name || ''}.`
        : `الصَّحِيحُ هُوَ: ${correctUnit?.vocalizedName || ''}.`;
      speechEngine.speak(msg);
    }
  };

  const handleCheckDouble1 = () => {
    if (!doubleInp1) return;
    playClick();
    if (doubleInp1.trim() === currentQ.a1?.trim()) {
      setDoubleStep1Passed(true);
      playSuccess();
      speechEngine.speak(
        language === 'en'
          ? 'Correct! Now complete the second part of the question.'
          : 'صَحِيحٌ! الآنَ أَكْمِلِ الجُزْءَ الثَّانِيَ مِنَ السُّؤَالِ.'
      );
    } else {
      setAnswered(true);
      setIsCorrect(false);
      playError();
      speechEngine.speak(
        language === 'en'
          ? `The correct answer is: ${currentQ.a1}.`
          : `الإِجَابَةُ الصَّحِيحَةُ هِيَ: ${currentQ.a1}.`
      );
    }
  };

  const handleCheckDouble2 = () => {
    if (!doubleInp2 || answered) return;
    playClick();
    setAnswered(true);

    if (doubleInp2.trim() === currentQ.a2?.trim()) {
      setIsCorrect(true);
      setScore((s) => s + 1);
      onCorrectAnswer();
      playSuccess();
      speechEngine.speak(
        language === 'en'
          ? 'Great job! You answered both parts accurately!'
          : 'مُمْتَازٌ جِدًّا! أَجَبْتَ عَلَى الجُزْأَيْنِ بِشَكْلٍ صَحِيحٍ!'
      );
    } else {
      setIsCorrect(false);
      playError();
      speechEngine.speak(
        language === 'en'
          ? `The correct answer for the second part is: ${currentQ.a2}.`
          : `الإِجَابَةُ الصَّحِيحَةُ لِلْجُزْءِ الثَّانِي هِيَ: ${currentQ.a2}.`
      );
    }
  };

  const handleNext = () => {
    playClick();
    if (qIdx + 1 < total) {
      setQIdx(qIdx + 1);
      setAnswered(false);
      setSelectedChoice(null);
      setIsCorrect(null);
      setDoubleInp1('');
      setDoubleInp2('');
      setDoubleStep1Passed(false);
    } else {
      onFinish(score + (isCorrect ? 1 : 0), total);
    }
  };

  const progressLabel = t.questionProgress
    .replace('{current}', String(qIdx + 1))
    .replace('{total}', String(total));

  const wrongAnswerMessage = t.wrongAnswerMsg
    .replace('{answer}', currentQ.answer);

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 animate-fade-in overflow-hidden">
      {/* Progress Bar & Header */}
      <div id="exercise-header-card" className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-xs border border-slate-200 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-black text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              {progressLabel}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-600">
              {t.scoreLabel} <strong className="text-sky-600 font-black text-sm sm:text-base">{score}</strong>
            </span>
          </div>

          <button
            id="exercise-listen-btn"
            type="button"
            onClick={handleSpeakQuestion}
            className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-[11px] sm:text-xs font-black flex items-center gap-1 hover:bg-slate-200 transition-colors active:scale-95 shadow-xs cursor-pointer"
          >
            <Volume2 size={14} />
            <span>{t.listenQuestion}</span>
          </button>
        </div>

        {/* Progress bar line */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${((qIdx + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div id="exercise-question-card" className="flex-1 min-h-0 bg-white rounded-2xl p-2.5 sm:p-3 shadow-xs border border-slate-200 flex flex-col justify-between overflow-hidden">
        {/* Question Text */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-center shrink-0">
          <h3 className="text-xs sm:text-base md:text-lg font-black text-slate-900 leading-snug">
            {currentQ.q}
          </h3>
        </div>

        {/* Question Type: Visual Hint Bottle if exists */}
        {currentQ.unit && currentQ.type !== 'compare' && (
          <div className="flex-1 min-h-0 flex justify-center items-center py-1 max-h-[30vh]">
            {(() => {
              const u = units.find((x) => x.id === currentQ.unit) || units[0];
              return (
                <VesselSVG
                  ml={u.ml}
                  maxMl={1000}
                  width={100}
                  height={190}
                  color={u.color}
                  lightColor={u.light}
                  label={u.name}
                  vocalizedLabel={
                    language === 'en'
                      ? `${u.name}, ${u.ml} milliliters`
                      : `${u.vocalizedName}، ${u.ml} مِيلِيلِتْرٍ`
                  }
                  interactive
                />
              );
            })()}
          </div>
        )}

        {/* MCQ Type */}
        {currentQ.type === 'mcq' && currentQ.choices && (
          <div className="grid grid-cols-2 gap-2 my-1 shrink-0">
            {currentQ.choices.map((choice, idx) => {
              const isSelected = selectedChoice === choice;
              const isThisCorrect = choice.trim() === currentQ.answer.trim();
              let btnStyle =
                'bg-slate-50 border-slate-200 text-slate-800 hover:border-sky-400 hover:bg-sky-50/50';

              if (answered) {
                if (isThisCorrect) {
                  btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-black ring-2 ring-emerald-200 scale-[1.01]';
                } else if (isSelected && !isThisCorrect) {
                  btnStyle = 'bg-rose-50 border-rose-500 text-rose-800 font-black ring-2 ring-rose-200';
                } else {
                  btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  id={`mcq-choice-${idx}`}
                  type="button"
                  disabled={answered}
                  onClick={() =>
                    handleMCQAnswer(
                      choice,
                      currentQ.vocalizedChoices ? currentQ.vocalizedChoices[idx] : undefined
                    )
                  }
                  className={`py-2 sm:py-3 px-2 rounded-xl border-2 text-xs sm:text-base font-black transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1 min-h-[44px] cursor-pointer ${btnStyle}`}
                >
                  <span>{choice}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Compare Type */}
        {currentQ.type === 'compare' && currentQ.a && currentQ.b && (
          <div className="grid grid-cols-2 gap-3 justify-items-center py-1 my-1 max-w-sm mx-auto flex-1 min-h-0 max-h-[32vh]">
            {[currentQ.a, currentQ.b].map((unitId) => {
              const u = units.find((x) => x.id === unitId) || units[0];
              const isSelected = selectedChoice === unitId;
              const isThisCorrect = unitId === currentQ.answer;

              let cardBorder = 'border-slate-200 hover:border-sky-400 bg-slate-50';
              if (answered) {
                if (isThisCorrect) cardBorder = 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200 scale-102';
                else if (isSelected && !isThisCorrect) cardBorder = 'border-rose-500 bg-rose-50 ring-2 ring-rose-200';
              }

              return (
                <button
                  key={unitId}
                  id={`compare-choice-${unitId}`}
                  type="button"
                  disabled={answered}
                  onClick={() => !answered && handleCompareAnswer(unitId)}
                  className={`w-full p-2 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 shadow-xs ${cardBorder}`}
                >
                  <VesselSVG
                    ml={u.ml}
                    maxMl={1000}
                    width={90}
                    height={160}
                    color={u.color}
                    lightColor={u.light}
                    label={u.name}
                    showMarks
                  />
                  <span className="text-xs sm:text-sm font-black text-slate-800 mt-1">{u.short}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Double Question Type */}
        {currentQ.type === 'double' && (
          <div className="space-y-2 my-1 max-w-sm mx-auto w-full shrink-0">
            {/* Step 1 */}
            <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
              <div className="text-xs sm:text-sm font-black text-slate-800 mb-1.5">{currentQ.q1}</div>
              <div className="flex gap-2 items-center">
                <input
                  id="double-step-1-input"
                  type="number"
                  disabled={doubleStep1Passed || answered}
                  value={doubleInp1}
                  onChange={(e) => setDoubleInp1(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCheckDouble1();
                  }}
                  placeholder="?"
                  className="w-20 sm:w-24 h-9 sm:h-10 text-center text-sm sm:text-base font-black bg-white border-2 border-slate-200 text-slate-900 rounded-xl outline-none focus:border-sky-500"
                />
                {!doubleStep1Passed && !answered && (
                  <button
                    id="double-step-1-btn"
                    type="button"
                    onClick={handleCheckDouble1}
                    className="flex-1 h-9 sm:h-10 rounded-xl bg-sky-600 text-white font-black text-xs hover:bg-sky-700 active:scale-95 cursor-pointer"
                  >
                    {t.checkAnswer}
                  </button>
                )}
                {doubleStep1Passed && (
                  <span className="flex items-center gap-1.5 text-emerald-600 text-xs sm:text-sm font-black">
                    <CheckCircle2 size={16} /> {t.correctBadge}
                  </span>
                )}
              </div>
            </div>

            {/* Step 2 */}
            {doubleStep1Passed && (
              <div className="p-2 sm:p-3 rounded-xl bg-sky-50/80 border border-sky-300 shadow-xs animate-fade-in">
                <div className="text-xs sm:text-sm font-black text-slate-800 mb-1.5">{currentQ.q2}</div>
                <div className="flex gap-2 items-center">
                  <input
                    id="double-step-2-input"
                    type="number"
                    disabled={answered}
                    value={doubleInp2}
                    onChange={(e) => setDoubleInp2(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCheckDouble2();
                    }}
                    placeholder="?"
                    className="w-20 sm:w-24 h-9 sm:h-10 text-center text-sm sm:text-base font-black bg-white border-2 border-sky-400 text-slate-900 rounded-xl outline-none"
                  />
                  {!answered && (
                    <button
                      id="double-step-2-btn"
                      type="button"
                      onClick={handleCheckDouble2}
                      className="flex-1 h-9 sm:h-10 rounded-xl bg-sky-600 text-white font-black text-xs hover:bg-sky-700 active:scale-95 cursor-pointer"
                    >
                      {t.finalCheckAnswer}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Visual Choices Question Type */}
        {currentQ.type === 'visual' && currentQ.choices && (
          <div className="grid grid-cols-3 gap-2 my-1 shrink-0">
            {currentQ.choices.map((choice, idx) => {
              const isSelected = selectedChoice === choice;
              const isThisCorrect = choice.trim() === currentQ.answer.trim();
              let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';

              if (answered) {
                if (isThisCorrect) {
                  btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-black ring-2 ring-emerald-200 scale-102';
                } else if (isSelected && !isThisCorrect) {
                  btnStyle = 'bg-rose-50 border-rose-500 text-rose-800 font-black ring-2 ring-rose-200';
                }
              }

              return (
                <button
                  key={idx}
                  id={`visual-choice-${idx}`}
                  type="button"
                  disabled={answered}
                  onClick={() => handleMCQAnswer(choice)}
                  className={`p-2 rounded-xl border-2 text-xs sm:text-sm font-black transition-all active:scale-95 shadow-xs min-h-[44px] flex items-center justify-center cursor-pointer ${btnStyle}`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback Message */}
        {answered && isCorrect !== null && (
          <div
            id="exercise-feedback-msg"
            className={`p-2 rounded-xl text-center border mt-1 animate-fade-in flex items-center justify-center gap-2 shadow-xs max-w-sm mx-auto w-full shrink-0 ${
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
            <div className="text-start">
              <div className="font-black text-xs sm:text-sm">
                {isCorrect ? t.correctAnswerMsg : wrongAnswerMessage}
              </div>
              {currentQ.explanation && (
                <div className="text-[10px] sm:text-xs font-bold text-slate-600 truncate">
                  {currentQ.explanation}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Question Button */}
        {answered && (
          <button
            id="exercise-next-btn"
            type="button"
            onClick={handleNext}
            className="w-full max-w-xs mx-auto py-2 px-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-black rounded-xl text-xs sm:text-sm shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shrink-0 mt-1"
          >
            <span>{qIdx + 1 < total ? t.nextQuestionBtn : t.finishQuizBtn}</span>
            {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};
