'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export default function ThemeToggle({ className = '', compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  const label = lang === 'en' ? 'Dark Mode' : 'Mode Gelap';

  return (
    <div
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
      className={`inline-flex items-center gap-2 select-none cursor-pointer focus:outline-none transition group ${className}`}
      title={label}
      aria-label={label}
    >
      {!compact && (
        <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors">
          {label}
        </span>
      )}

      {/* Pill Toggle Switch persis sesuai referensi desain */}
      <div
        className={`relative inline-flex items-center h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out ${
          isDark ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
            isDark ? 'translate-x-[22px]' : 'translate-x-[2px]'
          }`}
        />
      </div>

      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 min-w-[24px] text-left">
        {isDark ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}
