import { prepareForSpeech } from './arabicPhonetics';
import { Language } from '../i18n/translations';
import { AudioSettings } from '../types';

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

  // Units & numbers
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
    rate: 0.85, // clear pedagogical pacing for children
    pitch: 1.0,
    volume: 1.0,
    voiceURI: '',
    autoPlayQuestion: true,
  };

  private language: Language = 'ar';
  private listeners: Set<SpeechListener> = new Set();
  private availableVoices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private currentText = '';
  private activeUtteranceId = 0;
  private watchdogTimer: any = null;

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
      
      // Auto-select preferred Arabic voice if not set or invalid
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
   * Completely stops active speech synthesis and cancels all callbacks
   */
  public stop() {
    this.activeUtteranceId++;
    
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }

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
   * Speaks text using the single, unified speech engine with pristine phonetics
   */
  public speak(rawText: string, customVocalized?: string): void {
    if (!this.settings.enabled || !rawText) {
      this.stop();
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Stop any existing speech first
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

    const utteranceId = ++this.activeUtteranceId;
    this.notify(true, textToSpeak);

    try {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      this.currentUtterance = utterance;

      utterance.lang = this.language === 'en' ? 'en-GB' : 'ar-SA';
      utterance.rate = Math.max(0.6, Math.min(1.5, this.settings.rate));
      utterance.pitch = Math.max(0.5, Math.min(1.5, this.settings.pitch));
      utterance.volume = Math.max(0, Math.min(1.0, this.settings.volume));

      // Refresh and apply selected voice
      if (this.availableVoices.length === 0) {
        this.initVoices();
      }

      const voice = this.availableVoices.find(v => v.voiceURI === this.settings.voiceURI) 
        || this.availableVoices[0];
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }

      utterance.onstart = () => {
        if (utteranceId === this.activeUtteranceId) {
          this.notify(true, textToSpeak);
        }
      };

      utterance.onend = () => {
        if (utteranceId === this.activeUtteranceId) {
          this.currentUtterance = null;
          this.notify(false, '');
          if (this.watchdogTimer) {
            clearTimeout(this.watchdogTimer);
            this.watchdogTimer = null;
          }
        }
      };

      utterance.onerror = () => {
        if (utteranceId === this.activeUtteranceId) {
          this.currentUtterance = null;
          this.notify(false, '');
          if (this.watchdogTimer) {
            clearTimeout(this.watchdogTimer);
            this.watchdogTimer = null;
          }
        }
      };

      // Safety watchdog timer (estimated speaking duration + 3s buffer)
      const estimatedDurationMs = Math.max(4000, (textToSpeak.length / 8) * 1000);
      this.watchdogTimer = setTimeout(() => {
        if (utteranceId === this.activeUtteranceId && this.isSpeaking) {
          this.currentUtterance = null;
          this.notify(false, '');
        }
      }, estimatedDurationMs);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      if (utteranceId === this.activeUtteranceId) {
        this.notify(false, '');
      }
    }
  }
}

export const speechEngine = SpeechEngine.getInstance();
