import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KompresKilat - Utilitas Digital & Kompresi File Privat',
    short_name: 'KompresKilat',
    description: 'Aplikasi web utilitas gratis untuk kompresi foto KTP syarat CPNS, optimasi PDF, konversi dokumen, cek resi, dan kalkulator pajak 100% client-side.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'id',
    categories: ['utilities', 'productivity', 'business'],
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}

