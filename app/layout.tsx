import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import StickyAd from '@/components/StickyAd';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kompres-kilat.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800">
        {children}
        {/* Sticky Mobile Anchor Banner Iklan */}
        <StickyAd />
      </body>
    </html>
  );
}
