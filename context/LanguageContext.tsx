'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, translations } from '@/lib/translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: keyof typeof translations['id']) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'id',
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => translations.id[key] || '',
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kk_lang') as Language;
        if (stored && (stored === 'id' || stored === 'en')) return stored;
        if (navigator.language.toLowerCase().startsWith('en')) return 'en';
      } catch {
        // fallback
      }
    }
    return 'id';
  });

  const syncGoogleTranslate = useCallback((targetLang: Language) => {
    if (typeof window === 'undefined') return;

    try {
      const hostname = window.location.hostname;
      if (targetLang === 'en') {
        document.cookie = 'googtrans=/id/en; path=/;';
        if (hostname && hostname !== 'localhost') {
          document.cookie = `googtrans=/id/en; path=/; domain=.${hostname};`;
        }
      } else {
        document.cookie = 'googtrans=/id/id; path=/;';
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        if (hostname && hostname !== 'localhost') {
          document.cookie = `googtrans=/id/id; path=/; domain=.${hostname};`;
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
        }
      }

      // If the translate combo is present in DOM, trigger change immediately
      const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (select) {
        select.value = targetLang;
        select.dispatchEvent(new Event('change'));
      }
    } catch {
      // ignore
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('kk_lang', newLang);
      document.documentElement.lang = newLang;
    } catch {
      // ignore
    }
    syncGoogleTranslate(newLang);

    // Ensure DOM is translated; if widget is not active, reload with cookie
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
        if (select) {
          select.value = newLang;
          select.dispatchEvent(new Event('change'));
        } else {
          window.location.reload();
        }
      }, 350);
    }
  };

  const toggleLang = () => {
    const next = lang === 'id' ? 'en' : 'id';
    setLang(next);
  };

  // Sync on initial mount if language is 'en'
  useEffect(() => {
    if (lang === 'en') {
      const timer = setTimeout(() => {
        syncGoogleTranslate('en');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [lang, syncGoogleTranslate]);

  const t = (key: keyof typeof translations['id']): string => {
    return translations[lang]?.[key] || translations.id[key] || '';
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}


