'use client';

import { useState } from 'react';

export default function StickyAd() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl transition-all duration-300">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 px-2">
        <div className="flex-1 flex items-center justify-center min-h-[50px] bg-indigo-50/60 rounded-xl border border-indigo-100 text-center px-3 py-1.5">
          <div className="text-xs">
            <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded mr-2">
              SPONSOR
            </span>
            <span className="font-semibold text-slate-800">
              ⚡ Promo Cloud Hosting &amp; Domain Murah untuk Web Developer &amp; Bisnis Online
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          title="Tutup Iklan"
          aria-label="Tutup Iklan"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

