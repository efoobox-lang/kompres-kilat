'use client';

import { useEffect } from 'react';

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
 * - Menggunakan label baku "Iklan" atau "Advertisement" (Dilarang menggunakan kata pemicu seperti CTR Booster)
 * - Format responsif anti-CLS (Cumulative Layout Shift)
 * - Langsung terintegrasi dengan Client ID resmi penerbit (ca-pub-2604470661972091)
 */
export default function AdBanner({
  slotId = 'default-slot',
  label = 'Iklan',
  className = '',
}: AdBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-2604470661972091';

  useEffect(() => {
    try {
      const win = window as unknown as { adsbygoogle?: unknown[] };
      win.adsbygoogle = win.adsbygoogle || [];
      win.adsbygoogle.push({});
    } catch {
      // Menghindari error jika iklan diblokir adblocker atau belum aktif
    }
  }, []);

  return (
    <div className={`my-8 sm:my-10 pt-4 pb-2 text-center overflow-hidden ${className}`}>
      {/* Label Kepatuhan Resmi Google AdSense (Wajib berjarak aman dari tombol aksi) */}
      <span className="block text-[10px] text-slate-400 font-semibold tracking-wider mb-2 uppercase">
        {label === 'Iklan Sponsor' || label === 'Iklan Sponsor di Artikel' ? 'Iklan' : label}
      </span>

      <div className="min-h-[90px] w-full flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden">
        <ins
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
