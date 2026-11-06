'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  slotId?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'fluid';
  label?: string;
  className?: string;
  zone?: 'top-leaderboard' | 'in-tool' | 'result-action' | 'mid-article' | 'sidebar';
}

/**
 * Komponen Penempatan Iklan Google AdSense
 * Mematuhi 100% Kebijakan Google Publisher (AdSense Policy Compliance):
 * - Menggunakan label baku resmi Google "IKLAN" atau "ADVERTISEMENT" (Dilarang menggunakan kata pemicu seperti CTR Booster)
 * - Format responsif anti-CLS (Cumulative Layout Shift) dengan min-height pelindung
 * - Terisolasi dari dialog cetak/print (print:hidden)
 * - Safe margin dari tombol aksi untuk mencegah accidental clicks
 * - Langsung terintegrasi dengan Client ID resmi penerbit (ca-pub-2604470661972091)
 */
export default function AdBanner({
  slotId = 'default-slot',
  label = 'Iklan',
  className = '',
}: AdBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-2604470661972091';
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (adRef.current && !adRef.current.getAttribute('data-adsbygoogle-status')) {
        const win = window as unknown as { adsbygoogle?: unknown[] };
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
      }
    } catch {
      // Menghindari error jika iklan diblokir adblocker atau belum aktif
    }
  }, []);

  // Standardisasi pelabelan sesuai kebijakan resmi AdSense: hanya "IKLAN" atau "ADVERTISEMENT"
  const isEnglish = label.toLowerCase().includes('ad') || label.toLowerCase().includes('sponsored');
  const normalizedLabel = isEnglish ? 'ADVERTISEMENT' : 'IKLAN';

  return (
    <div className={`my-8 sm:my-10 pt-4 pb-2 text-center overflow-hidden print:hidden ${className}`}>
      {/* Label Kepatuhan Resmi Google AdSense (Wajib berjarak aman dari tombol aksi) */}
      <span className="block text-[10px] text-slate-400 font-semibold tracking-wider mb-2 uppercase select-none">
        {normalizedLabel}
      </span>

      <div className="min-h-[90px] w-full flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle block w-full"
          style={{ display: 'block', minHeight: '90px' }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
