import React, { useState, useEffect } from 'react';
import { Volume2, RotateCcw, ArrowLeft, ArrowRight, Sparkles, HelpCircle, Undo2, Check } from 'lucide-react';
import { getPourActivitiesData, getUnitsData } from '../data';
import { VesselSVG } from './VesselSVG';
import { speechEngine } from '../utils/speechEngine';
import { numberToVocalizedArabic } from '../utils/arabicPhonetics';
import { playPourSound, playSuccess, playError, playClick } from '../utils/soundEffects';
import { useLanguage } from '../i18n/LanguageContext';

interface PourTabProps {
  onScoreEarned: () => void;
}

export const PourTab: React.FC<PourTabProps> = ({ onScoreEarned }) => {
  const { language, t, isRTL } = useLanguage();
  const activities = getPourActivitiesData(language);
  const units = getUnitsData(language);

  const [activityIdx, setActivityIdx] = useState(0);
  const currentActivity = activities[activityIdx % activities.length];

  const srcUnit = units.find((u) => u.id === currentActivity.src) || units[0];
  const tgtUnit = units.find((u) => u.id === currentActivity.tgt) || units[1];

  const [sourceML, setSourceML] = useState(srcUnit.ml);
  const [targetML, setTargetML] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean; hint?: string } | null>(null);

  // Sync state when language changes
  useEffect(() => {
    setFeedback(null);
  }, [language]);

  const resetCurrentActivity = (newIdx = activityIdx) => {
    const act = activities[newIdx % activities.length];
    const sU = units.find((u) => u.id === act.src) || units[0];
    setSourceML(sU.ml);
    setTargetML(0);
    setIsCompleted(false);
    setFeedback(null);
  };

  const handlePour = () => {
    if (isCompleted) return;

    if (sourceML <= 0) {
      // Auto-refill source container
      setSourceML(1000);
      speechEngine.speak(t.emptySourceRefill);
      return;
    }

    if (targetML >= 1000) {
      playError();
      const msg = t.targetFullError;
      setFeedback({ msg, ok: false });
      speechEngine.speak(msg);
      return;
    }

    const step = currentActivity.stepML;
    const newSource = Math.max(0, sourceML - step);
    const newTarget = Math.min(1000, targetML + step);

    setSourceML(newSource);
    setTargetML(newTarget);

    // Audio SFX: Realistic pouring sound with rising pitch
    const fillRatio = newTarget / 1000;
    playPourSound(fillRatio);

    setFeedback(null);
  };

  const handleUndoPour = () => {
    if (isCompleted || targetML <= 0) return;
    playClick();

    const step = currentActivity.stepML;
    const newTarget = Math.max(0, targetML - step);
    const newSource = Math.min(1000, sourceML + step);

    setTargetML(newTarget);
    setSourceML(newSource);
    setFeedback(null);
  };

  const handleVerify = () => {
    playClick();

    if (targetML === 0) {
      playError();
      const msg = t.emptyTargetError;
      setFeedback({ msg, ok: false });
      speechEngine.speak(msg);
      return;
    }

    const goal = currentActivity.goalML;

    if (targetML === goal) {
      // Correct capacity in target vessel!
      setIsCompleted(true);
      playSuccess();
      onScoreEarned();
      const msg = language === 'en'
        ? `🎉 Outstanding Champion! The target container holds exactly ${goal} mL!`
        : `🎉 بطل ممتاز! يحتوي الإناء الهدف الآن على السعة المطلوبة بالضبط: ${goal} مل!`;
      
      const vocalized = currentActivity.vocalizedSuccess;
      setFeedback({ msg, ok: true });
      speechEngine.speak(vocalized);
    } else if (targetML < goal) {
      // Under-poured
      playError();
      const diff = goal - targetML;
      if (language === 'en') {
        const msg = `💡 Current volume in target (${targetML} mL) is less than required (${goal} mL). You need ${diff} mL more (an extra pour).`;
        setFeedback({ 
          msg, 
          ok: false, 
          hint: `Container has ${targetML} mL, needed is ${goal} mL. You need ${diff} mL more.` 
        });
        speechEngine.speak(`Target volume is ${targetML} milliliters, goal is ${goal} milliliters. You need ${diff} milliliters more.`);
      } else {
        const diffVocal = numberToVocalizedArabic(diff, 'ml');
        const targetVocal = numberToVocalizedArabic(targetML, 'ml');
        const goalVocal = numberToVocalizedArabic(goal, 'ml');
        const msg = `💡 السعة الموجودة في الإناء الهدف (${targetML} مل) أقل من المطلوب (${goal} مل). ينقصك ${diff} مل (سكبة إضافية).`;
        const vocalized = `السَّعَةُ الحَالِيَّةُ هِيَ ${targetVocal}، وَالمَطْلُوبُ هُوَ ${goalVocal}. يَنْقُصُكَ ${diffVocal}. اسْكُبْ رُبْعَ لِتْرٍ إِضَافِيًّا ثُمَّ تَحَقَّقْ!`;
        setFeedback({ 
          msg, 
          ok: false, 
          hint: `الإناء يحتوي على ${targetML} مل، والمطلوب هو ${goal} مل. ينقصك ${diff} مل.` 
        });
        speechEngine.speak(vocalized);
      }
    } else {
      // Over-poured
      playError();
      const extra = targetML - goal;
      if (language === 'en') {
        const msg = `⚠️ Current volume in target (${targetML} mL) exceeds required (${goal} mL) by ${extra} mL! Use Undo or Reset.`;
        setFeedback({ 
          msg, 
          ok: false, 
          hint: `Volume (${targetML} mL) exceeds the goal (${goal} mL) by ${extra} mL.` 
        });
        speechEngine.speak(`Current volume is ${targetML} milliliters, which exceeds the goal by ${extra} milliliters.`);
      } else {
        const extraVocal = numberToVocalizedArabic(extra, 'ml');
        const targetVocal = numberToVocalizedArabic(targetML, 'ml');
        const msg = `⚠️ السعة الموجودة في الإناء الهدف (${targetML} مل) أكبر من المطلوب (${goal} مل) بمقدار ${extra} مل! استخدم زر التراجع أو الإعادة.`;
        const vocalized = `السَّعَةُ الحَالِيَّةُ هِيَ ${targetVocal}، وَهِيَ زَائِدَةٌ عَنِ المَطْلُوبِ بِمِقْدَارِ ${extraVocal}. اضْغَطْ عَلَى زِرِّ التَّرَاجُعِ أَوْ إِعَادَةِ البَدْءِ.`;
        setFeedback({ 
          msg, 
          ok: false, 
          hint: `الكمية الحالية (${targetML} مل) تجاوزت الهدف (${goal} مل) بمقدار ${extra} مل.` 
        });
        speechEngine.speak(vocalized);
      }
    }
  };

  const handleNextActivity = () => {
    playClick();
    const nextIdx = (activityIdx + 1) % activities.length;
    setActivityIdx(nextIdx);
    resetCurrentActivity(nextIdx);
    const nextAct = activities[nextIdx];
    speechEngine.speak(nextAct.vocalizedTask);
  };

  const handleSpeakTask = () => {
    playClick();
    speechEngine.speak(currentActivity.vocalizedTask);
  };

  const activityBadgeText = t.activityBadge
    .replace('{current}', String(activityIdx + 1))
    .replace('{total}', String(activities.length));

  const pourStepDescText = t.pourStepDesc
    .replace('{step}', String(currentActivity.stepML));

  const targetVesselTitle = t.targetVessel
    .replace('{goal}', String(currentActivity.goalML));

  const pourQuarterBtnText = t.pourQuarterBtn
    .replace('{step}', String(currentActivity.stepML));

  const undoPourBtnText = t.undoPourBtn
    .replace('{step}', String(currentActivity.stepML));

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 animate-fade-in overflow-hidden">
      {/* Activity Header Card */}
      <div id="pour-header-card" className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-xs border border-slate-200 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] sm:text-xs font-black text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
            {activityBadgeText}
          </div>
          <div className="flex gap-1.5">
            <button
              id="pour-listen-task-btn"
              type="button"
              onClick={handleSpeakTask}
              className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-[11px] sm:text-xs font-black flex items-center gap-1 hover:bg-slate-200 transition-colors shadow-xs active:scale-95 cursor-pointer"
            >
              <Volume2 size={14} />
              <span>{t.listenTask}</span>
            </button>
            <button
              id="pour-reset-btn"
              type="button"
              onClick={() => resetCurrentActivity()}
              className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-[11px] sm:text-xs font-black flex items-center gap-1 hover:bg-slate-200 transition-colors shadow-xs active:scale-95 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>{t.restartActivity}</span>
            </button>
          </div>
        </div>

        {/* Task description with prompt */}
        <div className="mt-1.5 p-1.5 sm:p-2 rounded-xl bg-sky-50 border border-sky-200 text-center">
          <div className="text-xs sm:text-sm font-black text-slate-900 truncate">
            💡 {currentActivity.task}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-sky-700">
            {pourStepDescText}
          </div>
        </div>
      </div>

      {/* Main Pouring Scene */}
      <div id="pour-main-scene" className="flex-1 min-h-0 bg-white rounded-2xl p-2 sm:p-2.5 shadow-xs border border-slate-200 flex flex-col justify-between overflow-hidden text-center">
        {/* Vessels Stage: Source & Target brought close together */}
        <div className="flex-1 min-h-0 flex items-center justify-center py-1 max-h-[42vh] w-full">
          <div className="flex items-center justify-center gap-2 sm:gap-6 max-w-lg w-full">
            {/* Source Vessel (الإناء المملوء) */}
            <div className="flex flex-col items-center justify-center flex-1 min-w-0 max-w-[165px]">
              <div className="text-[11px] sm:text-xs font-black text-slate-700 mb-0.5 truncate w-full text-center">
                {t.sourceVessel}
              </div>
              <div className="flex items-center justify-center">
                <VesselSVG
                  ml={sourceML}
                  maxMl={1000}
                  width={100}
                  height={190}
                  color={srcUnit.color}
                  lightColor={srcUnit.light}
                  label={sourceML > 0 ? `${sourceML} ${t.mlUnit}` : t.emptyVessel}
                  vocalizedLabel={
                    language === 'en'
                      ? `Remaining in source: ${sourceML} milliliters`
                      : `البَاقِي فِي المَصْدَرِ: ${sourceML} مِيلِيلِتْرٍ`
                  }
                  onClick={handlePour}
                  interactive={!isCompleted}
                />
              </div>
              <span className="text-[10px] font-black text-slate-500 mt-0.5 truncate">
                {t.sourceVesselSub}
              </span>
            </div>

            {/* Transfer Direction Indicator (Compact between the two close vessels) */}
            <div className="flex flex-col items-center justify-center shrink-0 px-0.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-2xs">
                {isRTL ? <ArrowLeft size={16} className="animate-pulse" /> : <ArrowRight size={16} className="animate-pulse" />}
              </div>
              <span className="text-[10px] font-bold text-sky-700 mt-1 whitespace-nowrap">
                {currentActivity.stepML} {t.mlUnit}
              </span>
            </div>

            {/* Target Vessel (الإناء الهدف) */}
            <div className="flex flex-col items-center justify-center flex-1 min-w-0 max-w-[165px]">
              <div className="text-[11px] sm:text-xs font-black text-amber-800 mb-0.5 truncate w-full text-center">
                {targetVesselTitle}
              </div>
              <div className="flex items-center justify-center">
                <VesselSVG
                  ml={targetML}
                  maxMl={1000}
                  width={100}
                  height={190}
                  color={tgtUnit.color}
                  lightColor={tgtUnit.light}
                  label={targetML > 0 ? `${targetML} ${t.mlUnit}` : t.emptyVessel}
                  vocalizedLabel={
                    language === 'en'
                      ? `Volume poured in target: ${targetML} milliliters`
                      : `المَسْكُوبُ فِي الهَدَفِ: ${targetML} مِيلِيلِتْرٍ`
                  }
                  interactive={false}
                />
              </div>
              <span className="text-[10px] font-black text-amber-700 mt-0.5 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 truncate">
                {t.currentCapacity} <strong>{targetML} {t.mlUnit}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="shrink-0 flex items-center justify-center gap-2 max-w-md mx-auto w-full my-1">
          {/* Pour button */}
          <button
            id="pour-action-btn"
            type="button"
            onClick={handlePour}
            disabled={isCompleted}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black text-white shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer min-h-[38px] ${
              isCompleted
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white shadow-sky-500/25'
            }`}
          >
            <span>{pourQuarterBtnText}</span>
          </button>

          {/* Undo Pour button if target has liquid */}
          {!isCompleted && targetML > 0 && (
            <button
              id="pour-undo-btn"
              type="button"
              onClick={handleUndoPour}
              title={undoPourBtnText}
              className="py-2 px-3 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer min-h-[38px] shrink-0"
            >
              <Undo2 size={15} />
              <span className="hidden sm:inline">{undoPourBtnText}</span>
            </button>
          )}

          {/* Verify button */}
          {!isCompleted && (
            <button
              id="pour-verify-btn"
              type="button"
              onClick={handleVerify}
              className="flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer min-h-[38px]"
            >
              <Check size={16} className="stroke-[3]" />
              <span>{t.verifyTargetBtn}</span>
            </button>
          )}
        </div>

        {/* Feedback / Assistance Area */}
        {feedback && (
          <div
            id="pour-feedback-box"
            className={`p-2 rounded-xl text-center border mt-1 flex items-center justify-center gap-2 animate-fade-in shadow-xs max-w-xl mx-auto w-full shrink-0 ${
              feedback.ok
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            {feedback.ok ? (
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Sparkles size={14} />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <HelpCircle size={14} />
              </div>
            )}
            <div className="flex-1 min-w-0 text-start">
              <div className="text-xs sm:text-sm font-black truncate">{feedback.msg}</div>
              {feedback.hint && (
                <div className="text-[10px] sm:text-xs font-bold text-amber-800 truncate">
                  {t.hintPrefix} {feedback.hint}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Activity Button */}
        {isCompleted && (
          <button
            id="pour-next-activity-btn"
            type="button"
            onClick={handleNextActivity}
            className="w-full max-w-sm mx-auto py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-xl text-xs sm:text-sm shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shrink-0 mt-1"
          >
            <span>
              {activityIdx + 1 < activities.length
                ? t.nextActivityBtn
                : t.allPourCompletedBtn}
            </span>
            {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};
