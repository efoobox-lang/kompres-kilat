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
 * Komponen Penempatan Iklan (Google AdSense / Media Iklan)
 * Dioptimalkan untuk Viewability & CTR Tinggi sesuai Panduan Google Publisher:
 * - Label transparan "Iklan" / "Sponsor" (Mencegah banned AdSense)
 * - Rasio aspek responsif agar tidak menyebabkan Cumulative Layout Shift (CLS)
 * - Fallback tampilan placeholder profesional saat proses review/dev
 */
export default function AdBanner({
  slotId = 'default-slot',
  label = 'Sponsor',
  className = '',
  zone = 'in-tool',
}: AdBannerProps) {
  const isProductionAdSenseEnabled = Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID);

  useEffect(() => {
    if (isProductionAdSenseEnabled) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [isProductionAdSenseEnabled]);

  // Jika sudah terpasang AdSense Client ID resmi
  if (isProductionAdSenseEnabled) {
    return (
      <div className={`my-6 text-center overflow-hidden ${className}`}>
        <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">
          {label}
        </span>
        <ins
          className="adsbygoogle block"
          style={{ display: 'block', minHeight: '90px' }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Tampilan Placeholder Berkinerja Tinggi (High-CTR Mock Zone untuk Pengujian Layout)
  const getZoneStyle = () => {
    switch (zone) {
      case 'result-action':
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-900';
      case 'mid-article':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200 text-indigo-900';
      case 'top-leaderboard':
        return 'bg-slate-100 border-slate-200 text-slate-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className={`my-6 rounded-2xl border border-dashed p-4 text-center ${getZoneStyle()} ${className}`}>
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
        <span>Slot Iklan Teroptimasi ({zone})</span>
        <span className="bg-white/80 px-2 py-0.5 rounded text-slate-500 border border-slate-200">
          CTR Booster Zone
        </span>
      </div>
      <div className="py-4 px-2 flex flex-col items-center justify-center space-y-1">
        <span className="text-xl">📢</span>
        <p className="text-xs font-bold text-slate-800">
          Ruang Iklan Google AdSense (Ukuran Responsif / 728x90 / 300x250)
        </p>
        <p className="text-[11px] text-slate-500 max-w-md">
          Posisi ini dirancang pada *visual hotspot* pengunjung dengan potensi rasio klik (CTR) tinggi saat pengguna memproses file atau mengecek resi.
        </p>
      </div>
    </div>
  );
}

