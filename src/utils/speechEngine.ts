import { prepareForSpeech } from './arabicPhonetics';
import { Language } from '../i18n/translations';

export interface AudioSettings {
  enabled: boolean;
  rate: number; // 0.5 to 1.5
  pitch: number; // 0.5 to 1.5
  volume: number; // 0 to 1
  voiceURI: string;
  useGeminiTTS: boolean; // Server-side Gemini High-Quality Audio
  autoPlayQuestion: boolean;
}

export type SpeechListener = (speaking: boolean, text: string) => void;

function prepareEnglishForSpeech(text: string): string {
  if (!text) return "";
  let res = text;
  // Remove emojis
  res = res.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '');
  res = res.replace(/[🪣🥛🥤🏺⚖️💧🌊💦🌟⭐🏆👍💪❌✅🔄➡️🔍🫗🖊️💡✕]/gu, '');

  // Fractions
  res = res.replace(/½\s*(?:L|liters?|liter)?/gi, 'half a liter');
  res = res.replace(/¼\s*(?:L|liters?|liter)?/gi, 'quarter of a liter');
  res = res.replace(/¾\s*(?:L|liters?|liter)?/gi, 'three quarters of a liter');

  // Units
  res = res.replace(/(?<!\d)1000\s*(?:mL|ml|milliliters?)(?!\p{L})/giu, 'one thousand milliliters');
  res = res.replace(/(?<!\d)2000\s*(?:mL|ml|milliliters?)(?!\p{L})/giu, 'two thousand milliliters');
  res = res.replace(/(?<!\d)500\s*(?:mL|ml|milliliters?)(?!\p{L})/giu, 'five hundred milliliters');
  res = res.replace(/(?<!\d)250\s*(?:mL|ml|milliliters?)(?!\p{L})/giu, 'two hundred fifty milliliters');
  res = res.replace(/(?<!\d)750\s*(?:mL|ml|milliliters?)(?!\p{L})/giu, 'seven hundred fifty milliliters');
  res = res.replace(/(?<!\d)100\s*(?:mL|ml|milliliters?)(?!\p{L})/giu, 'one hundred milliliters');
  res = res.replace(/(?<!\d)470\s*(?:mL|ml|milliliters?)(?!\p{L})/giu, 'four hundred seventy milliliters');
  res = res.replace(/(?<!\d)530\s*(?:mL|ml|milliliters?)(?!\p{L})/giu, 'five hundred thirty milliliters');
  res = res.replace(/(?<!\d)900\s*(?:mL|ml|milliliters?)(?!\p{L})/giu, 'nine hundred milliliters');

  res = res.replace(/(?<!\d)1\s*(?:L|liter)(?!\p{L})/giu, 'one liter');
  res = res.replace(/(?<!\d)2\s*(?:L|liters)(?!\p{L})/giu, 'two liters');

  // Math operators
  res = res.replace(/_{2,}/g, ' what value ');
  res = res.replace(/\+/g, ' plus ');
  res = res.replace(/[−-]/g, ' minus ');
  res = res.replace(/=/g, ' equals ');

  return res.replace(/\s{2,}/g, ' ').trim();
}

export class SpeechEngine {
  private static instance: SpeechEngine;

  private settings: AudioSettings = {
    enabled: true,
    rate: 0.85, // clear pedagogical pacing
    pitch: 1.0,
    volume: 1.0,
    voiceURI: '',
    useGeminiTTS: true,
    autoPlayQuestion: true,
  };

  private language: Language = 'ar';
  private listeners: Set<SpeechListener> = new Set();
  private availableVoices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private currentText = '';

  // Concurrency & overlap prevention
  private currentRequestId = 0;
  private currentAbortController: AbortController | null = null;
  private activeAudioContext: AudioContext | null = null;
  private activeAudioSource: AudioBufferSourceNode | null = null;

  private constructor() {
    this.initVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => this.initVoices();
    }
  }

  public static getInstance(): SpeechEngine {
    if (!SpeechEngine.instance) {
      SpeechEngine.instance = new SpeechEngine();
    }
    return SpeechEngine.instance;
  }

  public setLanguage(lang: Language) {
    if (this.language !== lang) {
      this.language = lang;
      this.stop();
      this.initVoices();
    }
  }

  public getLanguage(): Language {
    return this.language;
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    
    if (this.language === 'ar') {
      // Filter for Arabic voices
      this.availableVoices = voices.filter(v => v.lang.toLowerCase().startsWith('ar'));
      
      // Auto-select preferred Arabic voice if not set
      if (!this.settings.voiceURI || !this.availableVoices.some(v => v.voiceURI === this.settings.voiceURI)) {
        const preferred = this.availableVoices.find(v => 
          v.name.toLowerCase().includes('google') ||
          v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('maged') ||
          v.name.toLowerCase().includes('laila') ||
          v.name.toLowerCase().includes('tarik') ||
          v.name.toLowerCase().includes('zeina') ||
          v.name.toLowerCase().includes('naayf') ||
          v.name.toLowerCase().includes('salma') ||
          v.name.toLowerCase().includes('shakir') ||
          v.name.toLowerCase().includes('youssef') ||
          v.lang === 'ar-SA' ||
          v.lang === 'ar-EG'
        );
        this.settings.voiceURI = preferred ? preferred.voiceURI : (this.availableVoices[0]?.voiceURI || '');
      }
    } else {
      // Filter for English voices
      this.availableVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
      if (!this.settings.voiceURI || !this.availableVoices.some(v => v.voiceURI === this.settings.voiceURI)) {
        const preferred = this.availableVoices.find(v =>
          v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('google') ||
          v.name.toLowerCase().includes('george') ||
          v.name.toLowerCase().includes('oliver') ||
          v.name.toLowerCase().includes('serena') ||
          v.name.toLowerCase().includes('hazel') ||
          v.lang === 'en-GB' ||
          v.lang === 'en-US'
        );
        this.settings.voiceURI = preferred ? preferred.voiceURI : (this.availableVoices[0]?.voiceURI || '');
      }
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.availableVoices.length === 0) {
      this.initVoices();
    }
    return this.availableVoices;
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (!this.settings.enabled) {
      this.stop();
    }
  }

  public subscribe(listener: SpeechListener): () => void {
    this.listeners.add(listener);
    listener(this.isSpeaking, this.currentText);
    return () => this.listeners.delete(listener);
  }

  private notify(speaking: boolean, text: string) {
    this.isSpeaking = speaking;
    this.currentText = text;
    this.listeners.forEach(fn => fn(speaking, text));
  }

  /**
   * Completely stops all active speech synthesis, Web Audio playback, and aborts pending network TTS requests
   */
  public stop() {
    this.currentRequestId++;

    if (this.currentAbortController) {
      try {
        this.currentAbortController.abort();
      } catch (e) {}
      this.currentAbortController = null;
    }

    // Stop and disconnect Web Audio Source if playing
    if (this.activeAudioSource) {
      try {
        this.activeAudioSource.onended = null;
        this.activeAudioSource.stop();
        this.activeAudioSource.disconnect();
      } catch (e) {}
      this.activeAudioSource = null;
    }

    // Close active Web Audio Context
    if (this.activeAudioContext) {
      try {
        if (this.activeAudioContext.state !== 'closed') {
          this.activeAudioContext.close();
        }
      } catch (e) {}
      this.activeAudioContext = null;
    }

    // Cancel browser SpeechSynthesis with event detachment to prevent phantom callbacks
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (this.currentUtterance) {
        this.currentUtterance.onstart = null;
        this.currentUtterance.onend = null;
        this.currentUtterance.onerror = null;
        this.currentUtterance = null;
      }
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    this.notify(false, '');
  }

  /**
   * Speaks text in current language (Arabic with full phonetics/tashkeel, or English)
   */
  public async speak(rawText: string, customVocalized?: string): Promise<void> {
    if (!this.settings.enabled || !rawText) {
      this.stop();
      return;
    }

    // Hard stop all audio pipelines immediately
    this.stop();

    // Prepare phonetically vocalized text according to language
    let textToSpeak = '';
    if (customVocalized) {
      textToSpeak = customVocalized;
    } else if (this.language === 'en') {
      textToSpeak = prepareEnglishForSpeech(rawText);
    } else {
      textToSpeak = prepareForSpeech(rawText);
    }

    if (!textToSpeak.trim()) return;

    const requestId = this.currentRequestId;
    const abortController = new AbortController();
    this.currentAbortController = abortController;

    this.notify(true, textToSpeak);

    // Primary engine: Server-side Gemini AI TTS
    if (this.settings.useGeminiTTS) {
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: textToSpeak,
            lang: this.language,
            voice: this.language === 'en' ? 'Aoede' : 'Kore'
          }),
          signal: abortController.signal,
        });

        if (requestId !== this.currentRequestId) {
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.audioData && requestId === this.currentRequestId) {
            const played = await this.playPcmAudio(data.audioData, requestId);
            if (played) return;
          }
        }
      } catch (err: any) {
        if (err?.name === 'AbortError' || requestId !== this.currentRequestId) {
          return;
        }
      }
    }

    // Double-check active request ID before attempting fallback
    if (requestId !== this.currentRequestId) {
      return;
    }

    // Fallback: Web Speech API
    this.speakWithWebSpeech(textToSpeak, requestId);
  }

  private speakWithWebSpeech(vocalizedText: string, requestId: number) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (requestId === this.currentRequestId) {
        this.notify(false, '');
      }
      return;
    }

    if (requestId !== this.currentRequestId) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch (e) {}

    const utterance = new SpeechSynthesisUtterance(vocalizedText);
    this.currentUtterance = utterance;

    utterance.lang = this.language === 'en' ? 'en-GB' : 'ar-SA';
    utterance.rate = this.settings.rate;
    utterance.pitch = this.settings.pitch;
    utterance.volume = this.settings.volume;

    // Pick selected voice
    if (this.availableVoices.length === 0) {
      this.initVoices();
    }

    const voice = this.availableVoices.find(v => v.voiceURI === this.settings.voiceURI) 
      || this.availableVoices[0];
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.onend = () => {
      if (requestId === this.currentRequestId) {
        this.notify(false, '');
        this.currentUtterance = null;
      }
    };

    utterance.onerror = (e) => {
      if (requestId === this.currentRequestId) {
        this.notify(false, '');
        this.currentUtterance = null;
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  private async playPcmAudio(base64: string, requestId: number): Promise<boolean> {
    if (requestId !== this.currentRequestId) return false;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({ sampleRate: 24000 });
      
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      if (requestId !== this.currentRequestId) {
        try { ctx.close(); } catch (e) {}
        return false;
      }

      this.activeAudioContext = ctx;

      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert 16-bit PCM little-endian to Float32
      const numSamples = Math.floor(len / 2);
      const audioBuffer = ctx.createBuffer(1, numSamples, 24000);
      const channelData = audioBuffer.getChannelData(0);
      const dataView = new DataView(bytes.buffer);

      for (let i = 0; i < numSamples; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        channelData[i] = int16 < 0 ? int16 / 32768 : int16 / 32767;
      }

      if (requestId !== this.currentRequestId) {
        try { ctx.close(); } catch (e) {}
        return false;
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      this.activeAudioSource = source;
      
      const gainNode = ctx.createGain();
      gainNode.gain.value = this.settings.volume;
      
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.onended = () => {
        if (requestId === this.currentRequestId) {
          this.activeAudioSource = null;
          this.notify(false, '');
          try {
            ctx.close();
          } catch (e) {}
        }
      };

      // Make sure speech synthesis is cancelled before PCM playback starts
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }

      source.start();
      return true;
    } catch (err) {
      if (requestId === this.currentRequestId) {
        console.warn('PCM audio playback failed:', err);
      }
      return false;
    }
  }
}

export const speechEngine = SpeechEngine.getInstance();
