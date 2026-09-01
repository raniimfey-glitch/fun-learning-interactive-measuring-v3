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
    <div className="space-y-6">
      {/* Progress Bar & Header */}
      <div id="exercise-header-card" className="bg-white rounded-3xl p-4 sm:p-7 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-black text-sky-800 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200">
              {progressLabel}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-600">
              {t.scoreLabel} <strong className="text-sky-600 font-black text-lg">{score}</strong>
            </span>
          </div>

          <button
            id="exercise-listen-btn"
            type="button"
            onClick={handleSpeakQuestion}
            className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm font-black flex items-center gap-1.5 hover:bg-slate-200 transition-colors active:scale-95 shadow-xs"
          >
            <Volume2 size={16} />
            <span>{t.listenQuestion}</span>
          </button>
        </div>

        {/* Progress bar line */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${((qIdx + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div id="exercise-question-card" className="bg-white rounded-3xl p-4 sm:p-8 shadow-xs border border-slate-200">
        {/* Question Text */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-sky-50/80 border border-sky-200 text-center mb-6 shadow-xs">
          <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 leading-relaxed">
            {currentQ.q}
          </h3>
        </div>

        {/* Question Type: Visual Hint Bottle if exists */}
        {currentQ.unit && currentQ.type !== 'compare' && (
          <div className="flex justify-center mb-6">
            {(() => {
              const u = units.find((x) => x.id === currentQ.unit) || units[0];
              return (
                <VesselSVG
                  ml={u.ml}
                  maxMl={1000}
                  width={125}
                  height={250}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            {currentQ.choices.map((choice, idx) => {
              const isSelected = selectedChoice === choice;
              const isThisCorrect = choice.trim() === currentQ.answer.trim();
              let btnStyle =
                'bg-slate-50 border-slate-200 text-slate-800 hover:border-sky-400 hover:bg-sky-50/50';

              if (answered) {
                if (isThisCorrect) {
                  btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-black ring-4 ring-emerald-200 scale-[1.02]';
                } else if (isSelected && !isThisCorrect) {
                  btnStyle = 'bg-rose-50 border-rose-500 text-rose-800 font-black ring-4 ring-rose-200';
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
                  className={`py-4 sm:py-5 px-4 rounded-2xl sm:rounded-3xl border-2 text-lg sm:text-2xl font-black transition-all active:scale-95 shadow-xs flex items-center justify-center gap-2 min-h-[56px] ${btnStyle}`}
                >
                  <span>{choice}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Compare Type */}
        {currentQ.type === 'compare' && currentQ.a && currentQ.b && (
          <div className="grid grid-cols-2 gap-4 sm:gap-8 justify-items-center py-2 sm:py-4 mb-6 max-w-lg mx-auto">
            {[currentQ.a, currentQ.b].map((unitId) => {
              const u = units.find((x) => x.id === unitId) || units[0];
              const isSelected = selectedChoice === unitId;
              const isThisCorrect = unitId === currentQ.answer;

              let cardBorder = 'border-slate-200 hover:border-sky-400 bg-slate-50';
              if (answered) {
                if (isThisCorrect) cardBorder = 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-200 scale-105';
                else if (isSelected && !isThisCorrect) cardBorder = 'border-rose-500 bg-rose-50 ring-4 ring-rose-200';
              }

              return (
                <button
                  key={unitId}
                  id={`compare-choice-${unitId}`}
                  type="button"
                  disabled={answered}
                  onClick={() => !answered && handleCompareAnswer(unitId)}
                  className={`w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 flex flex-col items-center cursor-pointer transition-all active:scale-95 shadow-xs ${cardBorder}`}
                >
                  <VesselSVG
                    ml={u.ml}
                    maxMl={1000}
                    width={110}
                    height={230}
                    color={u.color}
                    lightColor={u.light}
                    label={u.name}
                    showMarks
                  />
                  <span className="text-sm sm:text-base font-black text-slate-800 mt-2">{u.short}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Double Question Type */}
        {currentQ.type === 'double' && (
          <div className="space-y-4 mb-6 max-w-lg mx-auto w-full">
            {/* Step 1 */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 shadow-xs">
              <div className="text-sm sm:text-base font-black text-slate-800 mb-3">{currentQ.q1}</div>
              <div className="flex gap-2 sm:gap-3 items-center">
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
                  className="w-24 sm:w-32 h-14 text-center text-xl sm:text-2xl font-black bg-white border-2 border-slate-200 text-slate-900 rounded-2xl outline-none focus:border-sky-500"
                />
                {!doubleStep1Passed && !answered && (
                  <button
                    id="double-step-1-btn"
                    type="button"
                    onClick={handleCheckDouble1}
                    className="flex-1 h-14 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-black rounded-2xl text-sm sm:text-base shadow-md active:scale-95"
                  >
                    {t.checkAnswer}
                  </button>
                )}
                {doubleStep1Passed && (
                  <span className="flex items-center gap-1.5 text-emerald-600 text-sm sm:text-base font-black">
                    <CheckCircle2 size={20} /> {t.correctBadge}
                  </span>
                )}
              </div>
            </div>

            {/* Step 2 */}
            {doubleStep1Passed && (
              <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-sky-50/80 border-2 border-sky-300 animate-fade-in shadow-xs">
                <div className="text-sm sm:text-base font-black text-slate-800 mb-3">{currentQ.q2}</div>
                <div className="flex gap-2 sm:gap-3 items-center">
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
                    className="w-24 sm:w-32 h-14 text-center text-xl sm:text-2xl font-black bg-white border-2 border-sky-400 text-slate-900 rounded-2xl outline-none"
                  />
                  {!answered && (
                    <button
                      id="double-step-2-btn"
                      type="button"
                      onClick={handleCheckDouble2}
                      className="flex-1 h-14 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-black rounded-2xl text-sm sm:text-base shadow-md active:scale-95"
                    >
                      {t.finalCheckAnswer}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Visual Recognition Type */}
        {currentQ.type === 'visual' && currentQ.choices && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {currentQ.choices.map((choice, idx) => {
              const isSelected = selectedChoice === choice;
              const isThisCorrect = choice.trim() === currentQ.answer.trim();
              let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';

              if (answered) {
                if (isThisCorrect) {
                  btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-black ring-4 ring-emerald-200 scale-102';
                } else if (isSelected && !isThisCorrect) {
                  btnStyle = 'bg-rose-50 border-rose-500 text-rose-800 font-black ring-4 ring-rose-200';
                }
              }

              return (
                <button
                  key={idx}
                  id={`visual-choice-${idx}`}
                  type="button"
                  disabled={answered}
                  onClick={() => handleMCQAnswer(choice)}
                  className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 text-base sm:text-xl font-black transition-all active:scale-95 shadow-xs min-h-[54px] flex items-center justify-center ${btnStyle}`}
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
            className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-center border mb-6 animate-fade-in flex items-center justify-center gap-3 shadow-xs max-w-xl mx-auto ${
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
            <div>
              <div className="font-black text-base sm:text-xl">
                {isCorrect ? t.correctAnswerMsg : wrongAnswerMessage}
              </div>
              {currentQ.explanation && (
                <div className="text-xs sm:text-base font-bold mt-1 text-slate-600">
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
            className="w-full max-w-md mx-auto py-4 sm:py-4.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-black rounded-2xl text-base sm:text-xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 border border-white/20 min-h-[54px]"
          >
            <span>{qIdx + 1 < total ? t.nextQuestionBtn : t.finishQuizBtn}</span>
            {isRTL ? <ArrowLeft size={22} /> : <ArrowRight size={22} />}
          </button>
        )}
      </div>
    </div>
  );
};
