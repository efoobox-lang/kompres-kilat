'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';
import SearchBar from '@/components/SearchBar';
import {
  ChevronDown,
  ArrowRight,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Calculator,
  X,
  Menu,
  BookOpen,
  Home,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile dropdown menu state
  const [isToolsOpen, setIsToolsOpen] = useState(false); // Desktop "Semua Alat" dropdown
  const toolsDropdownRef = useRef<HTMLDivElement | null>(null);

  const pathname = usePathname();
  const { t } = useLanguage();

  // Highlighted features inside the "Semua Alat" mega dropdown
  const dropdownCategories = [
    {
      title: 'Dokumen & PDF',
      icon: <FileText className="w-4 h-4 text-indigo-500" />,
      items: [
        { label: 'Direct PDF Editor', href: '/tools/pdf-editor', badge: 'Baru' },
        { label: 'Kompres PDF', href: '/tools/pdf' },
        { label: 'Penggabung PDF', href: '/tools/pdf-merge', badge: 'Populer' },
        { label: 'PDF ke Word (OCR)', href: '/tools/pdf-to-word' },
        { label: 'Smart Scan & Fotocopy', href: '/tools/scan-dokumen' },
      ],
    },
    {
      title: 'Foto & Gambar',
      icon: <ImageIcon className="w-4 h-4 text-purple-500" />,
      items: [
        { label: 'Kompres & Konversi Foto', href: '/tools/image', badge: 'Utama' },
        { label: 'Ganti Background Pas Foto', href: '/tools/remove-bg', badge: 'AI' },
        { label: 'Hapus Objek di Foto', href: '/tools/object-eraser' },
        { label: 'Resize Pas Foto 2x3 3x4 4x6', href: '/tools/resize-pasfoto' },
        { label: 'Sensor & Blur KTP', href: '/tools/censor-ktp' },
      ],
    },
    {
      title: 'AI & Kreatif',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      items: [
        { label: 'Creative Studio & Kartu', href: '/tools/creative-studio', badge: 'Baru' },
        { label: 'AI Photo Enhancer & 4K', href: '/ai-image-tools', badge: 'Ultra' },
        { label: 'AI Presentation Generator', href: '/ai-presentation-maker' },
        { label: 'AI Resume & ATS Checker', href: '/tools/ats-resume', badge: 'CV' },
        { label: 'AI Document Summarizer', href: '/tools/document-summarizer' },
        { label: 'AI Poster & Brosur', href: '/tools/poster-generator' },
      ],
    },
    {
      title: 'Bisnis & Utilitas',
      icon: <Calculator className="w-4 h-4 text-emerald-500" />,
      items: [
        { label: 'Kalkulator Pajak (PPh 21, 23, 4(2))', href: '/tools/kalkulator-pajak', badge: 'Baru' },
        { label: 'Konverter Kurs Valas & Haji', href: '/tools/currency-converter' },
        { label: 'Kalkulator Bisnis & UMKM', href: '/tools/kalkulator-umkm' },
        { label: 'Kalkulator Diskon & Finansial', href: '/tools/kalkulator-finansial' },
        { label: 'Cek Resi & Lacak Paket', href: '/tools/tracking', badge: 'Resi' },
        { label: 'QR Code Generator', href: '/tools/qr-generator' },
        { label: 'Arsip ZIP Multi-File', href: '/tools/zip' },
      ],
    },
  ];

  // Click outside to close desktop tools dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isHomeActive = pathname === '/';
  const isBlogActive = pathname.startsWith('/blog');
  const isToolsActive = pathname.startsWith('/tools') || pathname.startsWith('/ai-');

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* ========================================================== */}
        {/* SISI KIRI: Brand Logo                                      */}
        {/* ========================================================== */}
        <Link
          href="/"
          className="flex items-center gap-1.5 font-black text-indigo-600 dark:text-indigo-400 text-lg sm:text-2xl tracking-tight whitespace-nowrap shrink-0 group"
        >
          <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">⚡</span>
          <span>KompresKilat</span>
        </Link>

        {/* ========================================================== */}
        {/* SISI TENGAH: Simplified Core Navigation Links (Desktop)    */}
        {/* ========================================================== */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs sm:text-sm font-semibold">
          {/* 1. Core Link: Beranda */}
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-xl transition ${
              isHomeActive
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {t('nav_home')}
          </Link>

          {/* 2. Dropdown: "Semua Alat" / Fitur */}
          <div ref={toolsDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                isToolsActive || isToolsOpen
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              aria-expanded={isToolsOpen}
              aria-haspopup="true"
            >
              <span>Semua Alat</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isToolsOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'
                }`}
              />
            </button>

            {/* Desktop Mega Dropdown Panel */}
            {isToolsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[720px] bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="grid grid-cols-4 gap-4">
                  {dropdownCategories.map((cat) => (
                    <div key={cat.title} className="space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
                        {cat.icon}
                        <span className="truncate">{cat.title}</span>
                      </div>
                      <ul className="space-y-1 text-xs">
                        {cat.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setIsToolsOpen(false)}
                              className="group flex items-center justify-between py-1 px-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-slate-800 transition"
                            >
                              <span className="truncate">{item.label}</span>
                              {item.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Dropdown Bottom Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    31+ alat produktivitas gratis &amp; 100% lokal
                  </span>
                  <Link
                    href="/#tools"
                    onClick={() => setIsToolsOpen(false)}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group"
                  >
                    <span>Lihat Seluruh Fitur di Beranda</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 3. Core Link: Blog */}
          <Link
            href="/blog"
            className={`px-3 py-1.5 rounded-xl transition ${
              isBlogActive
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {t('nav_blog')}
          </Link>
        </nav>

        {/* ========================================================== */}
        {/* SISI KANAN: Compact Search Trigger & Utilities (Desktop)   */}
        {/* ========================================================== */}
        <div className="hidden md:flex items-center gap-2">
          {/* Sleek Search Button Trigger (Hemat Ruang Horizontal) */}
          <SearchBar variant="desktop-button" placeholder="Cari alat atau fitur..." />

          {/* Subtle Vertical Divider */}
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700/80 mx-1" />

          {/* Grouped Secondary Controls: Language & Theme */}
          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* ========================================================== */}
        {/* MOBILE CONTROLS: Search Icon, Language & Hamburger         */}
        {/* ========================================================== */}
        <div className="flex md:hidden items-center gap-1 sm:gap-1.5">
          {/* Mobile Search Icon Trigger */}
          <SearchBar variant="mobile-icon" />

          {/* Language Selector di Main Mobile Header Bar */}
          <LanguageToggle className="px-2 py-1 text-xs" />

          {/* Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition focus:outline-none cursor-pointer"
            aria-label={isMobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* MOBILE RESPONSIVE DROPDOWN MENU CONTAINER                  */}
      {/* ========================================================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-900 shadow-md p-4 flex flex-col space-y-3 border-b border-slate-200 dark:border-slate-800 max-h-[calc(100vh-4.5rem)] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Bar Cepat di Mobile */}
          <div className="pb-1">
            <SearchBar
              variant="full-input"
              mobileTriggerLabel="Cari 30+ Alat &amp; Fitur..."
              className="w-full"
            />
          </div>

          {/* Navigasi Utama */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
              Menu Utama
            </p>
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                isHomeActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4 text-indigo-500" />
              <span>{t('nav_home')}</span>
            </Link>
            <Link
              href="/blog"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                isBlogActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-500" />
              <span>{t('nav_blog')}</span>
            </Link>
            <Link
              href="/#tools"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
            >
              <Layers className="w-4 h-4" />
              <span>Jelajahi Seluruh 31+ Alat &rarr;</span>
            </Link>
          </div>

          {/* Daftar Kategori Alat */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
              Pilihan Alat Populer
            </p>

            {dropdownCategories.map((cat) => (
              <div
                key={cat.title}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  {cat.icon}
                  <span>{cat.title}</span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {cat.items.slice(0, 3).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-1 px-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-750 transition"
                    >
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                              {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Note */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>100% Client-Side Privacy: Bebas Upload ke Server</span>
          </div>
        </div>
      )}
    </header>
  );
}
