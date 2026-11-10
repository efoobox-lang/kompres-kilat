'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import LanguageToggle from '@/components/LanguageToggle';
import {
  Zap,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  Moon,
  Sun,
  Heart,
} from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="w-full mt-6 sm:mt-8 notranslate" translate="no" dir="ltr">
      {/* ========================================================== */}
      {/* 1. VALUE PROPOSITION / TRUST BADGES BAR (Persis Mockup)   */}
      {/* ========================================================== */}
      <div className="w-full bg-white dark:bg-slate-900/90 border-y border-slate-200/90 dark:border-slate-800 py-6 px-4 transition-colors">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Badge 1: Cepat & Gratis */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Cepat &amp; Gratis
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tanpa registrasi
              </p>
            </div>
          </div>

          {/* Badge 2: Aman & Terpercaya */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Aman &amp; Terpercaya
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Data Anda aman
              </p>
            </div>
          </div>

          {/* Badge 3: Responsif */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Responsif
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Bisa di semua perangkat
              </p>
            </div>
          </div>

          {/* Badge 4: Selalu Update */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Selalu Update
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tools terbaru
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 2. MODERN DARK NAVY FOOTER CONTAINER                       */}
      {/* ========================================================== */}
      <footer className="w-full bg-[#070d1e] text-slate-300 relative overflow-hidden pt-10 pb-6 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Top Row: Brand Info, Links Navigasi, Social Icons */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
            {/* Sisi Kiri: Logo & Tagline */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-1">
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-black text-xl tracking-tight text-white group"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white text-sm font-black shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  ⚡
                </span>
                <span className="text-white font-extrabold text-lg">
                  Kompres<span className="text-blue-400">Kilat</span>
                </span>
              </Link>
              <p className="text-xs text-slate-400 max-w-sm">
                Tools online terbaik untuk kebutuhan digital Anda.
              </p>
            </div>

            {/* Sisi Tengah: Navigation Links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-300">
              <Link href="/" className="hover:text-blue-400 transition-colors">
                Beranda
              </Link>
              <Link href="/#tools" className="hover:text-blue-400 transition-colors">
                Semua Tools
              </Link>
              <Link href="/#categories" className="hover:text-blue-400 transition-colors">
                Kategori
              </Link>
              <Link href="/blog" className="hover:text-blue-400 transition-colors">
                Blog
              </Link>
              <Link href="/about" className="hover:text-blue-400 transition-colors">
                Tentang
              </Link>
              <Link href="/contact" className="hover:text-blue-400 transition-colors">
                Kontak
              </Link>
            </nav>

            {/* Sisi Kanan: Circular Social Icons & Theme / Language */}
            <div className="flex items-center gap-2.5">
              {/* YouTube (Merah) */}
              <a
                href="https://www.youtube.com/@kompreskilat"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition shadow-sm hover:scale-110"
                title="YouTube (@kompreskilat)"
                aria-label="YouTube KompresKilat"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Facebook (Biru) */}
              <a
                href="https://www.facebook.com/1411463522052642"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#1877f2] hover:bg-blue-600 text-white flex items-center justify-center transition shadow-sm hover:scale-110"
                title="Facebook (Kompres Kilat)"
                aria-label="Facebook KompresKilat"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Telegram / Instagram (Cyan) */}
              <a
                href="https://www.instagram.com/kompreskilat/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#0088cc] hover:bg-sky-500 text-white flex items-center justify-center transition shadow-sm hover:scale-110"
                title="Instagram (@kompreskilat)"
                aria-label="Instagram KompresKilat"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Theme Toggle Button (Moon / Sun) */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition shadow-sm hover:scale-110"
                title={isDark ? 'Mode Terang' : 'Mode Gelap'}
                aria-label="Toggle Theme"
              >
                {isDark ? <Moon className="w-3.5 h-3.5 text-amber-300" /> : <Sun className="w-3.5 h-3.5 text-slate-300" />}
              </button>

              {/* Language Switcher di Footer (Direction UP) */}
              <div className="ml-1">
                <LanguageToggle variant="footer" direction="up" />
              </div>
            </div>
          </div>

          {/* Policy Links Bar (AdSense Compliance: Privacy, Terms, Disclaimer) */}
          <div className="py-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">
              Kebijakan Privasi
            </Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-blue-400 transition-colors">
              Syarat &amp; Ketentuan
            </Link>
            <span>&bull;</span>
            <Link href="/disclaimer" className="hover:text-blue-400 transition-colors">
              Disclaimer
            </Link>
            <span>&bull;</span>
            <span className="text-slate-500">
              Disclaimer: KompresKilat beroperasi independen dengan Zero-Knowledge Client-Side Privacy.
            </span>
          </div>

          {/* Bottom Subfooter Bar (Persis Gambar Mockup) */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <p>&copy; 2026 KompresKilat. All rights reserved.</p>
            <p className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span>Bersama menjadi lebih produktif</span>
              <span className="text-amber-400 font-bold">⚡</span>
            </p>
          </div>
        </div>

        {/* Elegant Curved Gradient Waves Decoration at Footer Bottom (Persis Gambar) */}
        <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none opacity-40">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 120"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,48C840,43,960,53,1080,64C1200,75,1320,85,1380,90.7L1440,96L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
              fill="#1d4ed8"
            />
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,53.3C1120,53,1280,75,1360,85.3L1440,96L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              fill="#2563eb"
              opacity="0.6"
            />
          </svg>
        </div>
      </footer>
    </div>
  );
}
