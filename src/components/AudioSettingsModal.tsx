import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, X, Play, Sliders, Check, Sparkles } from 'lucide-react';
import { speechEngine } from '../utils/speechEngine';
import { AudioSettings } from '../types';
import { playClick, playSuccess } from '../utils/soundEffects';
import { useLanguage } from '../i18n/LanguageContext';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const [settings, setSettings] = useState<AudioSettings>(speechEngine.getSettings());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testText, setTestText] = useState(
    language === 'en'
      ? 'Half a liter equals five hundred milliliters'
      : 'نِصْفُ اللِّتْرِ يُسَاوِي خَمْسَمِائَةِ مِيلِيلِتْرٍ'
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(speechEngine.getSettings());
      setVoices(speechEngine.getVoices());
      setTestText(
        language === 'en'
          ? 'Half a liter equals five hundred milliliters'
          : 'نِصْفُ اللِّتْرِ يُسَاوِي خَمْسَمِائَةِ مِيلِيلِتْرٍ'
      );
    }
  }, [isOpen, language]);

  useEffect(() => {
    const unsubscribe = speechEngine.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleToggleAudio = () => {
    playClick();
    const updated = { ...settings, enabled: !settings.enabled };
    setSettings(updated);
    speechEngine.updateSettings(updated);
  };

  const handleRateChange = (rate: number) => {
    playClick();
    const updated = { ...settings, rate };
    setSettings(updated);
    speechEngine.updateSettings(updated);
  };

  const handleVoiceChange = (voiceURI: string) => {
    playClick();
    const updated = { ...settings, voiceURI };
    setSettings(updated);
    speechEngine.updateSettings(updated);
  };

  const handleVolumeChange = (volume: number) => {
    const updated = { ...settings, volume };
    setSettings(updated);
    speechEngine.updateSettings(updated);
  };

  const handleTestSpeech = () => {
    playClick();
    speechEngine.speak(testText);
  };

  const presetSamples = language === 'en'
    ? [
        '1 Liter = 1000 mL',
        'Half a liter = 500 mL',
        'Quarter liter = 250 mL',
        '250 mL + 750 mL = 1 whole Liter',
        'Excellent job! Accurate and wonderful answer!',
      ]
    : [
        'لِتْرٌ وَاحِدٌ = أَلْفُ مِيلِيلِتْرٍ',
        'نِصْفُ اللِّتْرِ = خَمْسُمِائَةِ مِيلِيلِتْرٍ',
        'رُبْعُ اللِّتْرِ = مِائَتَانِ وَخَمْسُونَ مِيلِيلِتْرًا',
        'مِائَتَانِ وَخَمْسُونَ مِيلِيلِتْرًا زَائِد سَبْعُمِائَةٍ وَخَمْسُونَ مِيلِيلِتْرًا يُسَاوِي لِتْرًا كَامِلًا',
        'أَحْسَنْتَ يَا بَطَل! إِجَابَةٌ صَحِيحَةٌ وَمُمَيَّزَةٌ!',
      ];

  const rateOptions = [
    { label: t.speedSlow, val: 0.75 },
    { label: t.speedIdeal, val: 0.85 },
    { label: t.speedNormal, val: 1.0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div id="audio-settings-modal-content" className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header decoration */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-sky-500 to-cyan-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold border border-sky-100">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">{t.audioSettingsModalTitle}</h2>
              <p className="text-xs text-slate-500 font-medium">{t.audioSettingsModalDesc}</p>
            </div>
          </div>
          <button
            id="audio-settings-close-btn"
            type="button"
            onClick={() => {
              playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors border border-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Master Audio Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5">
          <div className="flex items-center gap-3">
            {settings.enabled ? (
              <Volume2 className="text-sky-600" size={24} />
            ) : (
              <VolumeX className="text-rose-500" size={24} />
            )}
            <div>
              <div className="font-black text-slate-800 text-sm">{t.interactiveAudioSystem}</div>
              <div className="text-xs text-slate-500">{t.interactiveAudioDesc}</div>
            </div>
          </div>
          <button
            id="toggle-audio-enabled-btn"
            type="button"
            onClick={handleToggleAudio}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              settings.enabled
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {settings.enabled ? t.enabled : t.disabled}
          </button>
        </div>

        {/* Speech Rate (Speed) */}
        <div className="mb-5">
          <label className="block text-xs font-black text-slate-700 mb-2">
            {t.speechSpeed}:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {rateOptions.map((option) => (
              <button
                key={option.val}
                type="button"
                onClick={() => handleRateChange(option.val)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold text-center border-2 transition-all ${
                  Math.abs(settings.rate - option.val) < 0.05
                    ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Selector */}
        {voices.length > 0 && (
          <div className="mb-5">
            <label className="block text-xs font-black text-slate-700 mb-2">
              {t.voiceSelectorLabel}
            </label>
            <select
              value={settings.voiceURI}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-sky-500"
            >
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI} className="bg-white text-slate-800">
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Volume Slider */}
        <div className="mb-5">
          <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
            <span>{t.volumeLevel}:</span>
            <span className="text-sky-600 font-bold">{Math.round(settings.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-sky-600"
          />
        </div>

        {/* Pronunciation Playground / Tester */}
        <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-sky-600" />
            <span className="text-xs font-black text-sky-700">{t.pronunciationPlayground}:</span>
          </div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="flex-1 px-3 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-sky-500"
              placeholder={t.typeSentencePlaceholder}
            />
            <button
              id="test-speech-btn"
              type="button"
              onClick={handleTestSpeech}
              disabled={isSpeaking}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Play size={14} className={isSpeaking ? 'animate-spin' : ''} />
              <span>{isSpeaking ? t.speakingNow : t.listenSample}</span>
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {presetSamples.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTestText(sample);
                  speechEngine.speak(sample);
                }}
                className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors"
              >
                {sample.slice(0, 24)}...
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          id="audio-settings-save-btn"
          type="button"
          onClick={() => {
            playSuccess();
            onClose();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-black rounded-2xl text-sm shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-transform active:scale-98 border border-white/20"
        >
          <Check size={18} />
          <span>{t.saveAndReturn}</span>
        </button>
      </div>
    </div>
  );
};
