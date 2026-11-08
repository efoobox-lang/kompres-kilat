'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Language, SUPPORTED_LANGUAGES, LanguageItem, translations } from '@/lib/translations';

interface LanguageContextType {
  lang: Language;
  currentLanguage: LanguageItem;
  supportedLanguages: LanguageItem[];
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const defaultLangItem = SUPPORTED_LANGUAGES.find((l) => l.code === 'id') || SUPPORTED_LANGUAGES[0];

const LanguageContext = createContext<LanguageContextType>({
  lang: 'id',
  currentLanguage: defaultLangItem,
  supportedLanguages: SUPPORTED_LANGUAGES,
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => translations.id[key] || '',
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kk_lang') as Language;
        if (stored && SUPPORTED_LANGUAGES.some((item) => item.code === stored)) {
          return stored;
        }
        const navLang = navigator.language.toLowerCase();
        // Exact match (e.g., 'zh-cn' -> 'zh-CN')
        const exact = SUPPORTED_LANGUAGES.find((item) => item.code.toLowerCase() === navLang);
        if (exact) return exact.code;
        // Prefix match (e.g., 'es-ES' -> 'es', 'ja-JP' -> 'ja')
        const prefix = SUPPORTED_LANGUAGES.find((item) => navLang.startsWith(item.code.toLowerCase()));
        if (prefix) return prefix.code;
      } catch {
        // fallback
      }
    }
    return 'id';
  });

  const currentLanguage = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((item) => item.code === lang) || defaultLangItem;
  }, [lang]);

  const syncGoogleTranslate = useCallback((targetLang: Language) => {
    if (typeof window === 'undefined') return;

    try {
      const hostname = window.location.hostname;
      if (targetLang === 'id') {
        document.cookie = 'googtrans=/id/id; path=/;';
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        if (hostname && hostname !== 'localhost') {
          document.cookie = `googtrans=/id/id; path=/; domain=.${hostname};`;
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
        }
      } else {
        document.cookie = `googtrans=/id/${targetLang}; path=/;`;
        if (hostname && hostname !== 'localhost') {
          document.cookie = `googtrans=/id/${targetLang}; path=/; domain=.${hostname};`;
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
      document.documentElement.dir = 'ltr';
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

  // Sync on initial mount if language is not 'id'
  useEffect(() => {
    if (lang !== 'id') {
      const timer = setTimeout(() => {
        syncGoogleTranslate(lang);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [lang, syncGoogleTranslate]);

  const t = (key: string): string => {
    return translations[lang]?.[key] || (lang !== 'id' && translations.en?.[key]) || translations.id?.[key] || '';
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        currentLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
        setLang,
        toggleLang,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}


