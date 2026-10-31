'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      type="button"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition cursor-pointer select-none ${
        lang === 'en'
          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
      } ${className}`}
      title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
      aria-label="Toggle Language"
    >
      <span>{lang === 'id' ? '🇮🇩' : '🇬🇧'}</span>
      <span className="uppercase">{lang}</span>
    </button>
  );
}

