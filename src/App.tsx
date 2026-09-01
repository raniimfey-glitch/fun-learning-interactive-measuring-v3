import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ExploreTab } from './components/ExploreTab';
import { PourTab } from './components/PourTab';
import { ExerciseTab } from './components/ExerciseTab';
import { ComplementTab } from './components/ComplementTab';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { ScratchpadModal } from './components/ScratchpadModal';
import { CelebrationModal } from './components/CelebrationModal';
import { SpeechBanner } from './components/SpeechBanner';
import { speechEngine } from './utils/speechEngine';
import { playClick, playStarEarned } from './utils/soundEffects';
import { PenTool } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';

export default function App() {
  const { language, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<number>(1);
  const [stars, setStars] = useState<number>(0);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState<boolean>(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);
  const [celebrationScore, setCelebrationScore] = useState<{ score: number; total: number }>({
    score: 0,
    total: 0,
  });

  const handleTabChange = (tabId: number) => {
    playClick();
    speechEngine.stop();
    setActiveTab(tabId);
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

  const tabs = [
    { id: 1, title: t.exploreTab, subtitle: t.exploreTabSub, color: 'from-sky-500 to-cyan-500' },
    { id: 2, title: t.pourTab, subtitle: t.pourTabSub, color: 'from-cyan-500 to-teal-500' },
    { id: 3, title: t.exerciseTab, subtitle: t.exerciseTabSub, color: 'from-blue-600 to-indigo-600' },
    { id: 4, title: t.complementTab, subtitle: t.complementTabSub, color: 'from-orange-500 to-amber-500' },
  ];

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-sky-500/20 ${language === 'en' ? "font-['Nunito',sans-serif]" : "font-['Tajawal',sans-serif]"}`}>
      {/* Top Navbar */}
      <Navbar
        stars={stars}
        maxStars={3}
        onOpenSettings={() => setIsAudioSettingsOpen(true)}
        onOpenScratch={() => setIsScratchpadOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 md:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6 pb-28 sm:pb-24">
        {/* Navigation Tabs */}
        <div id="main-nav-tabs" className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-md shadow-slate-100">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`py-3 sm:py-4 px-2 sm:px-3 rounded-xl sm:rounded-2xl text-center transition-all duration-200 font-black flex flex-col items-center justify-center min-h-[62px] sm:min-h-[74px] active:scale-95 ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-sky-500/25 scale-[1.02] border border-white/30`
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/70'
                }`}
              >
                <span className="text-base sm:text-lg tracking-tight">{tab.title}</span>
                <span className={`text-[11px] sm:text-xs font-bold mt-0.5 ${isActive ? 'text-white/95' : 'text-slate-500'}`}>
                  {tab.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="transition-all duration-300">
          {activeTab === 1 && <ExploreTab />}
          {activeTab === 2 && <PourTab onScoreEarned={addStar} />}
          {activeTab === 3 && (
            <ExerciseTab
              onFinish={handleFinishQuiz}
              onCorrectAnswer={addStar}
            />
          )}
          {activeTab === 4 && (
            <ComplementTab
              onScoreEarned={addStar}
              onOpenScratch={() => setIsScratchpadOpen(true)}
            />
          )}
        </div>
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
        className={`fixed bottom-5 sm:bottom-6 z-30 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-xl shadow-sky-600/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform border-2 border-white ${
          isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
        }`}
      >
        <PenTool className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>

      {/* Live Speaking Visualizer Waveform Banner */}
      <SpeechBanner />

      {/* Modals */}
      <AudioSettingsModal
        isOpen={isAudioSettingsOpen}
        onClose={() => setIsAudioSettingsOpen(false)}
      />

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
          setActiveTab(3);
        }}
        onClose={() => setIsCelebrationOpen(false)}
      />
    </div>
  );
}
