'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer select-none active:scale-95 ${
        isDark
          ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 shadow-inner'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-indigo-600 shadow-sm'
      } ${className}`}
      title={isDark ? t('theme_light') : t('theme_dark')}
      aria-label={t('theme_toggle')}
    >
      {isDark ? (
        <>
          <Moon className="w-3.5 h-3.5 fill-amber-300 text-amber-300 shrink-0" />
          {showLabel && <span className="text-[11px] font-medium text-slate-200">Dark: ON</span>}
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          {showLabel && <span className="text-[11px] font-medium text-slate-600">Dark: OFF</span>}
        </>
      )}
    </button>
  );
}

