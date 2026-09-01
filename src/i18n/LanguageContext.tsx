import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, Language } from './translations';
import { speechEngine } from '../utils/speechEngine';
import { playClick } from '../utils/soundEffects';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof TRANSLATIONS['ar'];
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_lang') as Language;
      if (saved === 'ar' || saved === 'en') return saved;
    }
    return 'ar';
  });

  const setLanguage = (lang: Language) => {
    speechEngine.stop();
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_lang', lang);
    }
    speechEngine.setLanguage(lang);
  };

  const toggleLanguage = () => {
    playClick();
    const nextLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLang);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      
      // Update page title and meta description
      const t = TRANSLATIONS[language];
      document.title = language === 'ar'
        ? `${t.appTitle} 💧 ${t.brandTag}`
        : `${t.appTitle} 💧 ${t.brandTag}`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          language === 'ar'
            ? 'تطبيق تعليمي تفاعلي حديث للأطفال لاستكشاف وقياس السعات (اللتر والمليلتر) مع أنشطة ومحاكاة ونظام نطق عربي فصيح'
            : 'Interactive educational app for children to explore and measure capacities (Liter and Milliliter) with interactive simulations and crystal-clear narration.'
        );
      }
    }
    speechEngine.setLanguage(language);
  }, [language]);

  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
