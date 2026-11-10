'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import LanguageToggle from '@/components/LanguageToggle';
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
  Info,
  Mail,
  Moon,
  Sun,
  Layers,
} from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const toolsDropdownRef = useRef<HTMLDivElement | null>(null);

  const pathname = usePathname();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Highlighted features inside the "Semua Tools" mega dropdown
  const dropdownCategories = [
    {
      title: 'Dokumen & PDF',
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      items: [
        { label: 'Direct PDF Editor', href: '/tools/pdf-editor', badge: 'Baru' },
        { label: 'Kompres PDF', href: '/tools/pdf' },
        { label: 'Penggabung PDF', href: '/tools/pdf-merge', badge: 'Populer' },
        { label: 'PDF ke Word (OCR)', href: '/tools/pdf-to-word' },
        { label: 'PDF ke Excel', href: '/tools/pdf-to-excel' },
        { label: 'PDF ke PowerPoint', href: '/tools/pdf-to-ppt' },
        { label: 'Smart Scan Dokumen', href: '/tools/scan-dokumen' },
        { label: 'Kunci & Hapus Password PDF', href: '/tools/pdf-password' },
      ],
    },
    {
      title: 'Foto & Gambar',
      icon: <ImageIcon className="w-4 h-4 text-emerald-500" />,
      items: [
        { label: 'Kompres & Konversi Foto', href: '/tools/image', badge: 'Utama' },
        { label: 'Ganti Background Pas Foto', href: '/tools/remove-bg', badge: 'AI' },
        { label: 'Hapus Objek di Foto', href: '/tools/object-eraser' },
        { label: 'Resize Pas Foto 2x3 3x4 4x6', href: '/tools/resize-pasfoto' },
        { label: 'Sensor & Blur KTP', href: '/tools/censor-ktp' },
        { label: 'Tanda Tangan Digital PNG', href: '/tools/tanda-tangan' },
        { label: 'Watermark Foto & KTP', href: '/tools/watermark' },
      ],
    },
    {
      title: 'AI & Kreatif',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      items: [
        { label: 'Studio Kreatif & Kartu Ucapan', href: '/tools/creative-studio', badge: 'Baru' },
        { label: 'AI Photo Enhancer 4K', href: '/ai-image-tools', badge: 'Ultra' },
        { label: 'AI Presentation Generator', href: '/ai-presentation-maker' },
        { label: 'AI Resume & ATS Checker', href: '/tools/ats-resume', badge: 'CV' },
        { label: 'AI Document Summarizer', href: '/tools/document-summarizer' },
        { label: 'AI Poster & Brosur Promosi', href: '/tools/poster-generator' },
        { label: 'Generator Meme Lucu', href: '/tools/meme-generator' },
      ],
    },
    {
      title: 'Bisnis, Finansial & Resi',
      icon: <Calculator className="w-4 h-4 text-indigo-500" />,
      items: [
        { label: 'Cek Resi & Lacak Paket', href: '/tools/tracking', badge: 'Resi' },
        { label: 'Website SEO & Security Audit', href: '/tools/seo-audit', badge: 'Baru' },
        { label: 'Kalkulator Pajak (PPh 21, 23)', href: '/tools/kalkulator-pajak' },
        { label: 'Konverter Kurs Valas & Haji', href: '/tools/currency-converter' },
        { label: 'Pembuat Invoice & Nota Kasir', href: '/tools/invoice-generator' },
        { label: 'Kalkulator Bisnis & UMKM', href: '/tools/kalkulator-umkm' },
        { label: 'Kalkulator Diskon Bertingkat', href: '/tools/kalkulator-finansial' },
        { label: 'QR Code Generator HD', href: '/tools/qr-generator' },
        { label: 'Arsip ZIP Multi-File', href: '/tools/zip' },
      ],
    },
  ];

  // Click outside to close dropdowns
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
  const isAboutActive = pathname === '/about';
  const isContactActive = pathname === '/contact';
  const isToolsActive = pathname.startsWith('/tools') || pathname.startsWith('/ai-');

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 transition-colors w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* ========================================================== */}
        {/* SISI KIRI: Brand Logo                                      */}
        {/* ========================================================== */}
        <Link
          href="/"
          className="flex items-center gap-2 font-black text-xl sm:text-2xl tracking-tight whitespace-nowrap shrink-0 group select-none"
        >
          {/* Ikon Petir Modern Gradasi Kuning/Oranye */}
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/30 group-hover:scale-105 transition-transform text-lg font-black">
            ⚡
          </span>
          <span className="text-blue-900 dark:text-white font-extrabold">
            Kompres<span className="text-blue-600 dark:text-blue-400">Kilat</span>
          </span>
        </Link>

        {/* ========================================================== */}
        {/* SISI TENGAH: Navigation Bar (Tanpa Menu Kategori)          */}
        {/* ========================================================== */}
        <nav className="hidden lg:flex items-center space-x-1.5 text-sm font-medium">
          {/* 1. Beranda Pill Button Aktif */}
          <Link
            href="/"
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 font-bold ${
              isHomeActive
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </Link>

          {/* 2. Dropdown: Semua Tools ∨ */}
          <div ref={toolsDropdownRef} className="relative notranslate" translate="no" dir="ltr">
            <button
              type="button"
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer font-medium ${
                isToolsActive || isToolsOpen
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              aria-expanded={isToolsOpen}
              aria-haspopup="true"
            >
              <span>Semua Tools</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isToolsOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'
                }`}
              />
            </button>

            {/* Mega Dropdown Panel Semua Tools */}
            {isToolsOpen && (
              <div
                translate="no"
                dir="ltr"
                className="notranslate absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[760px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
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
                              className="group flex items-center justify-between py-1 px-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/70 dark:hover:bg-slate-800 transition"
                            >
                              <span className="truncate">{item.label}</span>
                              {item.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
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
                  <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    43 tools digital lengkap gratis &amp; 100% aman di browser
                  </span>
                  <Link
                    href="/#tools"
                    onClick={() => setIsToolsOpen(false)}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group"
                  >
                    <span>Jelajahi Seluruh 43 Tools</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 3. Blog */}
          <Link
            href="/blog"
            className={`px-3.5 py-2 rounded-xl transition font-medium ${
              isBlogActive
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Blog
          </Link>

          {/* 4. Tentang */}
          <Link
            href="/about"
            className={`px-3.5 py-2 rounded-xl transition font-medium ${
              isAboutActive
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Tentang
          </Link>

          {/* 5. Kontak */}
          <Link
            href="/contact"
            className={`px-3.5 py-2 rounded-xl transition font-medium ${
              isContactActive
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Kontak
          </Link>
        </nav>

        {/* ========================================================== */}
        {/* SISI KANAN: Multibahasa & Dark Mode Switcher               */}
        {/* ========================================================== */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Fitur Multibahasa Preserved (26 Bahasa) */}
          <LanguageToggle variant="navbar" />

          {/* Dark Mode Switch Toggle Pill Persis Gambar Mockup */}
          <div
            onClick={toggleTheme}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
              }
            }}
            className="cursor-pointer select-none focus:outline-none p-1"
            title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            aria-label={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            <div
              className={`relative inline-flex items-center h-7 w-13 rounded-full transition-colors duration-300 ease-in-out border ${
                isDark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-slate-200/90 border-slate-300/80'
              }`}
            >
              <span
                className={`inline-flex items-center justify-center h-5.5 w-5.5 rounded-full bg-white dark:bg-slate-900 shadow-md transform transition-transform duration-300 ease-in-out text-[11px] ${
                  isDark ? 'translate-x-[26px] text-amber-300' : 'translate-x-[3px] text-slate-700'
                }`}
              >
                {isDark ? <Moon className="w-3.5 h-3.5 fill-current" /> : <Sun className="w-3.5 h-3.5 fill-current" />}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* MOBILE CONTROLS: Hamburger & Quick Toggles                 */}
        {/* ========================================================== */}
        <div className="flex lg:hidden items-center gap-1.5">
          <SearchBar variant="mobile-icon" />
          <LanguageToggle iconOnlyOnMobile={true} />

          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-9 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition focus:outline-none cursor-pointer"
            aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* MOBILE RESPONSIVE DROPDOWN MENU DRAWER                     */}
      {/* ========================================================== */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-900 shadow-2xl p-4 flex flex-col space-y-3 border-b border-slate-200 dark:border-slate-800 max-h-[calc(100vh-4.5rem)] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="pb-1">
            <SearchBar
              variant="full-input"
              mobileTriggerLabel="Cari 43+ Tools &amp; Fitur..."
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
              Menu Utama
            </p>
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                isHomeActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Beranda</span>
            </Link>
            <Link
              href="/#tools"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Semua Tools (43 Fitur)</span>
            </Link>
            <Link
              href="/blog"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                isBlogActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-500" />
              <span>Blog &amp; Panduan</span>
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                isAboutActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Info className="w-4 h-4 text-emerald-500" />
              <span>Tentang Kami</span>
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                isContactActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Mail className="w-4 h-4 text-amber-500" />
              <span>Kontak Kami</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
