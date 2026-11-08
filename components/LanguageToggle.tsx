'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Language, SUPPORTED_LANGUAGES } from '@/lib/translations';
import { Globe, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  variant?: 'navbar' | 'footer' | 'pill';
  direction?: 'down' | 'up';
}

export default function LanguageToggle({
  className = '',
  variant = 'navbar',
  direction = 'down',
}: LanguageToggleProps) {
  const { lang, currentLanguage, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Group languages by columns 1, 2, 3
  const col1 = SUPPORTED_LANGUAGES.filter((item) => item.column === 1);
  const col2 = SUPPORTED_LANGUAGES.filter((item) => item.column === 2);
  const col3 = SUPPORTED_LANGUAGES.filter((item) => item.column === 3);

  const handleSelect = (code: Language) => {
    setLang(code);
    setIsOpen(false);
  };

  // Button styling based on variant
  const getButtonClass = () => {
    if (variant === 'footer') {
      return 'bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md inline-flex items-center gap-2 cursor-pointer transition';
    }
    if (variant === 'pill') {
      return 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition';
    }
    // Default navbar
    return 'bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition shadow-2xs';
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {/* Trigger Button: 🌐 [Language Native Name] ∨ */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={getButtonClass()}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Ganti Bahasa / Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span className="truncate max-w-[110px] sm:max-w-none">{currentLanguage.nativeName}</span>
        {direction === 'up' ? (
          <ChevronUp className="w-3.5 h-3.5 opacity-60 shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
        )}
      </button>

      {/* 3-Column Language Selection Modal / Popover */}
      {isOpen && (
        <div
          className={`absolute z-50 w-[92vw] sm:w-[620px] md:w-[680px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 transition-all duration-150 animate-in fade-in zoom-in-95 ${
            direction === 'up'
              ? 'bottom-full mb-3 left-0 sm:left-0'
              : 'top-full mt-2 right-0 sm:right-0'
          }`}
          style={{ maxWidth: 'min(92vw, 700px)' }}
          role="dialog"
          aria-label="Language Selector"
        >
          {/* Header Ringkas untuk Mobile / Aksesibilitas */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-500" />
              <span>Pilih Bahasa Situs / Select Language</span>
            </span>
            <span className="text-[11px] font-mono font-medium text-slate-400">26 Bahasa</span>
          </div>

          {/* 3 Kolom Bahasa (Persis seperti layout screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 max-h-[65vh] sm:max-h-none overflow-y-auto sm:overflow-visible pr-1 sm:pr-0">
            {/* Kolom 1 */}
            <div className="space-y-0.5">
              {col1.map((item) => {
                const isSelected = item.code === lang;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelect(item.code)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-[13px] transition text-left cursor-pointer ${
                      isSelected
                        ? 'font-bold text-slate-900 dark:text-white bg-slate-100/80 dark:bg-slate-800'
                        : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="w-4 flex items-center justify-center shrink-0">
                      {isSelected ? (
                        <Check className="w-4 h-4 text-slate-900 dark:text-white stroke-[2.5]" />
                      ) : null}
                    </span>
                    <span className="truncate">{item.nativeName}</span>
                  </button>
                );
              })}
            </div>

            {/* Kolom 2 */}
            <div className="space-y-0.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
              {col2.map((item) => {
                const isSelected = item.code === lang;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelect(item.code)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-[13px] transition text-left cursor-pointer ${
                      isSelected
                        ? 'font-bold text-slate-900 dark:text-white bg-slate-100/80 dark:bg-slate-800'
                        : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="w-4 flex items-center justify-center shrink-0">
                      {isSelected ? (
                        <Check className="w-4 h-4 text-slate-900 dark:text-white stroke-[2.5]" />
                      ) : null}
                    </span>
                    <span className="truncate">{item.nativeName}</span>
                  </button>
                );
              })}
            </div>

            {/* Kolom 3 */}
            <div className="space-y-0.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
              {col3.map((item) => {
                const isSelected = item.code === lang;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelect(item.code)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-[13px] transition text-left cursor-pointer ${
                      isSelected
                        ? 'font-bold text-slate-900 dark:text-white bg-slate-100/80 dark:bg-slate-800'
                        : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="w-4 flex items-center justify-center shrink-0">
                      {isSelected ? (
                        <Check className="w-4 h-4 text-slate-900 dark:text-white stroke-[2.5]" />
                      ) : null}
                    </span>
                    <span className="truncate">{item.nativeName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
