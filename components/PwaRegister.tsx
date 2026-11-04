'use client';

import { useEffect } from 'react';

/**
 * PWA Service Worker Registration Component
 * Registers sw.js client-side only without affecting server-side rendering
 */
export default function PwaRegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.location.protocol === 'https:'
    ) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .catch((err) => {
            // Safe fallback if service workers are disabled
            console.debug('ServiceWorker registration skipped:', err);
          });
      });
    }
  }, []);

  return null;
}

