import React, { useEffect, useState } from 'react';
import { Volume2, Square, RotateCcw, X } from 'lucide-react';
import { speechEngine } from '../utils/speechEngine';
import { playClick } from '../utils/soundEffects';
import { useLanguage } from '../i18n/LanguageContext';

export const SpeechBanner: React.FC = () => {
  const { t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dismissTimer: any = null;

    const unsubscribe = speechEngine.subscribe((speaking, text) => {
      setIsSpeaking(speaking);
      if (text) {
        setCurrentText(text);
        setVisible(true);
      }

      if (!speaking && text) {
        // Auto-dismiss after 3.5 seconds when speech completes
        clearTimeout(dismissTimer);
        dismissTimer = setTimeout(() => {
          setVisible(false);
        }, 3500);
      } else if (speaking) {
        clearTimeout(dismissTimer);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(dismissTimer);
    };
  }, []);

  if (!visible || !currentText) return null;

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick();
    speechEngine.stop();
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick();
    speechEngine.speak(currentText);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
  };

  return (
    <aside
      id="speech-banner"
      aria-live="polite"
      className="fixed bottom-22 left-4 right-4 sm:right-auto sm:left-6 sm:max-w-md z-30 transition-all duration-300 pointer-events-none"
    >
      <div className="bg-white/95 text-slate-900 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border-2 border-sky-300 flex items-center gap-3 pointer-events-auto select-none">
        {/* Animated Sound Wave Bars */}
        <div className="flex items-center gap-0.5 h-6 px-1.5 bg-sky-50 rounded-lg border border-sky-200 shrink-0">
          {[40, 90, 60, 100, 70, 30].map((h, i) => (
            <div
              key={i}
              className={`w-1 bg-sky-500 rounded-full transition-all duration-150 ${
                isSpeaking ? 'animate-pulse' : 'h-1 opacity-40'
              }`}
              style={{
                height: isSpeaking ? `${h}%` : '4px',
                animationDelay: `${i * 0.12}s`,
              }}
            />
          ))}
        </div>

        {/* Vocalized Text Display */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-black text-sky-700">
            <Volume2 size={14} className={isSpeaking ? 'animate-bounce' : ''} />
            <strong>{isSpeaking ? t.teacherVoice : t.lastSpoken}</strong>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-tight tracking-wide mt-0.5">
            {currentText}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {isSpeaking ? (
            <button
              id="speech-stop-btn"
              type="button"
              onClick={handleStop}
              title={t.stopAudio}
              className="w-8 h-8 rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-transform active:scale-90 shadow-xs"
            >
              <Square size={13} />
            </button>
          ) : (
            <button
              id="speech-replay-btn"
              type="button"
              onClick={handleReplay}
              title={t.replayAudio}
              className="w-8 h-8 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center transition-transform active:scale-90 shadow-xs"
            >
              <RotateCcw size={14} />
            </button>
          )}
          <button
            id="speech-dismiss-btn"
            type="button"
            onClick={handleClose}
            title={t.hideBanner}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-transform active:scale-90"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};
