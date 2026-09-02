import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomePortal } from './components/HomePortal';
import { ExploreTab } from './components/ExploreTab';
import { PourTab } from './components/PourTab';
import { ExerciseTab } from './components/ExerciseTab';
import { ComplementTab } from './components/ComplementTab';
import { ScratchpadModal } from './components/ScratchpadModal';
import { CelebrationModal } from './components/CelebrationModal';
import { SpeechBanner } from './components/SpeechBanner';
import { speechEngine } from './utils/speechEngine';
import { playClick, playStarEarned } from './utils/soundEffects';
import { PenTool, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';

export default function App() {
  const { language, t, isRTL } = useLanguage();
  // selectedActivity: null means on Screen 1 (Home Portal), number 1..4 means on Screen 2 (Active Activity)
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  const [stars, setStars] = useState<number>(0);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    playClick();
    speechEngine.stop();
    setSelectedActivity(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-sky-500/20 ${language === 'en' ? "font-['Nunito',sans-serif]" : "font-['Tajawal',sans-serif]"}`}>
      {/* Top Navbar */}
      <Navbar
        stars={stars}
        maxStars={3}
        onOpenScratch={() => setIsScratchpadOpen(true)}
        onGoHome={handleBackToHome}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 md:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6 pb-28 sm:pb-24">
        {/* SCREEN 1: Main Home Activity Portal */}
        {selectedActivity === null ? (
          <HomePortal onSelectActivity={handleSelectActivity} />
        ) : (
          /* SCREEN 2: Selected Activity with a SINGLE clean Back Button */
          <div className="space-y-4 animate-fade-in">
            {/* Dedicated Single Back Navigation Bar */}
            <div 
              id="activity-back-bar"
              className="bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 border border-slate-200 shadow-sm flex items-center justify-between gap-3"
            >
              <button
                id="back-to-home-btn"
                type="button"
                onClick={handleBackToHome}
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-black text-xs sm:text-sm transition-all border border-slate-200 hover:border-sky-300 active:scale-95 shadow-xs cursor-pointer"
              >
                <BackArrowIcon className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
                <span>{t.backToHome}</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 hidden sm:inline">
                  {t.currentActivity}
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-800 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200">
                  {activityTitles[selectedActivity]}
                </span>
              </div>
            </div>

            {/* Selected Activity Content Panel */}
            <div className="transition-all duration-300">
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

      {/* Floating Scratchpad Quick Action Button */}
      <button
        id="floating-scratchpad-btn"
        type="button"
        onClick={() => {
          playClick();
          setIsScratchpadOpen(true);
        }}
        title={t.scratchpadTab}
        className={`fixed bottom-5 sm:bottom-6 z-30 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-xl shadow-sky-600/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform border-2 border-white cursor-pointer ${
          isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
        }`}
      >
        <PenTool className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>

      {/* Live Speaking Visualizer Waveform Banner */}
      <SpeechBanner />

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
    </div>
  );
}

