import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import StickyAd from '@/components/StickyAd';
import PwaRegister from '@/components/PwaRegister';
import TelemetryTracker from '@/components/TelemetryTracker';
import { Analytics } from '@vercel/analytics/react';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kompreskilat.site';

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: '/manifest.webmanifest',
  applicationName: 'KompresKilat',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KompresKilat',
  },
  formatDetection: {
    telephone: false,
  },
  title: {
    default: 'KompresKilat - Kompres Gambar, PDF & Cek Resi Paket Akurat',
    template: '%s | KompresKilat',
  },
  description:
    'Platform online gratis untuk kompresi foto KTP syarat CPNS, perkecil ukuran PDF, ubah format dokumen Word/Excel, hingga pelacakan resi Shopee Express, JNE, J&T secara real-time.',
  keywords: [
    'kompres foto ktp',
    'kompres foto cpns 200kb',
    'kompres pdf online gratis',
    'cek resi shopee express',
    'lacak paket jne jnt sicepat',
    'ubah pdf ke word tanpa rusak',
    'kompres gambar online',
    'lacak resi akurat',
  ],
  authors: [{ name: 'Tim KompresKilat' }],
  creator: 'KompresKilat',
  publisher: 'KompresKilat',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.png',
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: siteUrl,
    siteName: 'KompresKilat',
    title: 'KompresKilat - Kompres Gambar, PDF & Cek Resi Paket Akurat',
    description:
      'Solusi cepat kompres file digital aman di browser dan pelacakan paket ekspedisi terlengkap di Indonesia.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KompresKilat - Kompres Gambar, PDF & Cek Resi Paket Akurat',
    description: 'Solusi cepat kompres foto, PDF, dan lacak resi ekspedisi se-Indonesia.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Anti-FOUC Theme Initializer */}
        <Script id="theme-initializer" strategy="beforeInteractive">
          {`
            try {
              var d = document.documentElement;
              var t = localStorage.getItem('kk_theme');
              if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                d.classList.add('dark');
              } else {
                d.classList.remove('dark');
              }
            } catch (e) {}
          `}
        </Script>
        {/* Google AdSense Script - Loaded afterInteractive to prevent premature DOM mutation & hydration mismatch */}
        <Script
          id="google-adsense"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2604470661972091"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            {children}
            {/* Sticky Mobile Anchor Banner Iklan */}
            <StickyAd />
            {/* Progressive Web App (PWA) Client Service Worker Registration */}
            <PwaRegister />
          </LanguageProvider>
        </ThemeProvider>

        {/* Vercel Web Analytics */}
        <Analytics />

        {/* Real-Time Live Telemetry Engine */}
        <TelemetryTracker />

        {/* Universal Full-Website Translation Engine */}
        <div id="google_translate_element" className="fixed -top-96 -left-96 opacity-0 pointer-events-none" />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement({
                  pageLanguage: 'id',
                  includedLanguages: 'id,en,es,fr,de,it,pt,ja,ru,ko,zh-CN,zh-TW,ar,bg,ca,nl,el,hi,ms,pl,sv,th,tr,uk,vi,sw',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            }
          `}
        </Script>
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
