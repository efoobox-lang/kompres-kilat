'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function TelemetryTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ambil atau buat identifikasi pengunjung unik anonim
    let visitorId = '';
    try {
      visitorId = localStorage.getItem('kk_vid') || '';
      if (!visitorId) {
        visitorId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('kk_vid', visitorId);
      }
    } catch {
      visitorId = `vid_tmp_${Math.random().toString(36).substring(2, 9)}`;
    }

    // Catat tayangan halaman (page view) jika path berubah
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;

      try {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'pageview',
            path: pathname,
            visitorId,
          }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // Abaikan error pada browser sandbox
      }
    }

    // Pelacak interaksi klik pengguna nyata
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        try {
          fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'click',
              visitorId,
            }),
            keepalive: true,
          }).catch(() => {});
        } catch {
          // Abaikan error
        }
      }
    };

    window.addEventListener('click', handleGlobalClick, { passive: true });
    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [pathname]);

  return null;
}
