'use client';

import { useState } from 'react';

export default function StickyAd() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside 
      aria-label="Iklan"
      className="fixed bottom-0 left-0 right-0 z-50 px-2 py-1.5 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200 py-1.5 px-2.5 text-center">
          <p className="text-[10px] sm:text-xs text-slate-700 line-clamp-1">
            <span className="bg-slate-200 text-slate-700 font-bold text-[9px] px-1.5 py-0.5 rounded mr-1.5 inline-block">
              Iklan
            </span>
            <span className="font-medium text-slate-600">
              Layanan Kompres &amp; Konversi File Kilat Tanpa Batas — 100% Gratis &amp; Privasi Terjaga
            </span>
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition cursor-pointer shrink-0"
          title="Tutup Iklan"
          aria-label="Tutup Iklan"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
