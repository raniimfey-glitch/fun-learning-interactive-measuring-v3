import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomePortal } from './components/HomePortal';
import { ExploreTab } from './components/ExploreTab';
import { PourTab } from './components/PourTab';
import { ExerciseTab } from './components/ExerciseTab';
import { ComplementTab } from './components/ComplementTab';
import { ScratchpadModal } from './components/ScratchpadModal';
import { CelebrationModal } from './components/CelebrationModal';
import { SplashScreenModal } from './components/SplashScreenModal';
import { speechEngine } from './utils/speechEngine';
import { playClick, playStarEarned } from './utils/soundEffects';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';

export default function App() {
  const { language, t, isRTL } = useLanguage();
  // selectedActivity: null means on Screen 1 (Home Portal), number 1..4 means on Screen 2 (Active Activity)
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  const [stars, setStars] = useState<number>(0);
  const [isSplashOpen, setIsSplashOpen] = useState<boolean>(true);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);
  const [celebrationScore, setCelebrationScore] = useState<{ score: number; total: number }>({
    score: 0,
    total: 0,
  });

  const BackArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  const handleSelectActivity = (id: number) => {
    playClick();
    speechEngine.stop();
    setSelectedActivity(id);
  };

  const handleBackToHome = () => {
    playClick();
    speechEngine.stop();
    if (selectedActivity !== null) {
      setSelectedActivity(null);
    } else {
      setIsSplashOpen(true);
    }
  };

  const addStar = () => {
    setStars((prev) => {
      const next = Math.min(3, prev + 1);
      if (next > prev) playStarEarned();
      return next;
    });
  };

  const handleFinishQuiz = (score: number, total: number) => {
    setCelebrationScore({ score, total });
    setIsCelebrationOpen(true);
    if (score >= total * 0.7) {
      setStars(3);
    } else if (score >= total * 0.4) {
      setStars(2);
    } else {
      setStars(1);
    }
  };

  const activityTitles: Record<number, string> = {
    1: t.exploreTab,
    2: t.pourTab,
    3: t.exerciseTab,
    4: t.complementTab,
  };

  return (
    <div className={`h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-slate-50 text-slate-800 selection:bg-sky-500/20 ${language === 'en' ? "font-['Nunito',sans-serif]" : "font-['Tajawal',sans-serif]"}`}>
      {/* Top Navbar */}
      <Navbar onGoHome={handleBackToHome} />

      {/* Main Container strictly bounded within viewport */}
      <main className="flex-1 min-h-0 w-full max-w-5xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex flex-col justify-between overflow-hidden">
        {/* SCREEN 1: Main Home Activity Portal */}
        {selectedActivity === null ? (
          <HomePortal onSelectActivity={handleSelectActivity} />
        ) : (
          /* SCREEN 2: Selected Activity with a SINGLE clean Back Button */
          <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden animate-fade-in">
            {/* Dedicated Single Back Navigation Bar */}
            <div 
              id="activity-back-bar"
              className="shrink-0 bg-white rounded-xl p-1.5 sm:p-2 border border-slate-200 shadow-2xs flex items-center justify-between gap-2 mb-1.5"
            >
              <button
                id="back-to-home-btn"
                type="button"
                onClick={handleBackToHome}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-black text-xs transition-all border border-slate-200 hover:border-sky-300 active:scale-95 shadow-xs cursor-pointer"
              >
                <BackArrowIcon className="w-3.5 h-3.5 text-sky-600" />
                <span>{t.backToHome}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
                  {t.currentActivity}
                </span>
                <span className="text-xs font-black text-slate-800 px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
                  {activityTitles[selectedActivity]}
                </span>
              </div>
            </div>

            {/* Selected Activity Content Panel */}
            <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
              {selectedActivity === 1 && <ExploreTab />}
              {selectedActivity === 2 && <PourTab onScoreEarned={addStar} />}
              {selectedActivity === 3 && (
                <ExerciseTab
                  onFinish={handleFinishQuiz}
                  onCorrectAnswer={addStar}
                />
              )}
              {selectedActivity === 4 && (
                <ComplementTab
                  onScoreEarned={addStar}
                  onOpenScratch={() => setIsScratchpadOpen(true)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Persistent Bottom Navigation Bar */}
      <BottomNav
        selectedActivity={selectedActivity}
        onSelectActivity={(id) => {
          speechEngine.stop();
          setSelectedActivity(id);
        }}
        onOpenScratch={() => setIsScratchpadOpen(true)}
      />

      {/* Modals */}
      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />

      <CelebrationModal
        isOpen={isCelebrationOpen}
        score={celebrationScore.score}
        total={celebrationScore.total}
        onRetry={() => {
          setIsCelebrationOpen(false);
          setSelectedActivity(3);
        }}
        onClose={() => setIsCelebrationOpen(false)}
      />

      <SplashScreenModal
        isOpen={isSplashOpen}
        onClose={() => setIsSplashOpen(false)}
        onStartApp={() => {
          setIsSplashOpen(false);
        }}
      />
    </div>
  );
}

