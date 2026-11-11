'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog-data';
import { useLanguage } from '@/context/LanguageContext';
import ThemeToggle from '@/components/ThemeToggle';
import JsonLd from '@/components/JsonLd';
import { ALL_TOOLS, CATEGORY_TABS, ToolCategoryKey, ToolItem } from '@/lib/tools-data';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Layers,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ChevronDown,
  HelpCircle,
  Lock,
  Cpu,
  FileCheck2,
  Search,
  Image as ImageIcon,
  RefreshCw,
  Volume2,
  X,
  ZoomIn,
  Check,
  Zap,
  Trash2,
  Heart,
} from 'lucide-react';

export default function HomeClient({ latestPosts }: { latestPosts: BlogPost[] }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ToolCategoryKey>('document');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Slideshow Gambar Banner Hero (Bergantian otomatis tiap 5 detik)
  const heroSlides = useMemo(() => [
    {
      id: 1,
      src: '/images/hero-illustration.png',
      alt: 'Semua Tools Digital dalam Satu Tempat - 43 Tools KompresKilat',
      width: 467,
      height: 288,
    },
    {
      id: 2,
      src: '/images/hero-security.jpg',
      alt: 'Standar Keamanan Tertinggi - Zero-Knowledge Client-Side Processing KompresKilat',
      width: 1024,
      height: 576,
    },
  ], []);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const [previewSlideModal, setPreviewSlideModal] = useState<string | null>(null);

  useEffect(() => {
    if (isSlidePaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isSlidePaused, heroSlides.length]);

  // Home FAQ Data untuk Editorial & Schema JSON-LD
  const homeFaqItems = [
    {
      q: 'Apakah seluruh alat utilitas di KompresKilat dapat digunakan secara gratis?',
      a: 'Ya, seluruh 42+ alat utilitas di KompresKilat (mulai dari kompres foto KTP, editor PDF, kalkulator pajak PPh 21, pembuat nota kasir, hingga pelacakan nomor resi) dapat diakses 100% gratis tanpa batasan kuota harian dan tanpa perlu mendaftar akun.',
    },
    {
      q: 'Bagaimana KompresKilat menjamin keamanan berkas dan foto KTP saya?',
      a: 'KompresKilat menerapkan standar Zero-Knowledge Client-Side Processing. Dokumen dan foto Anda diolah langsung di dalam memori peramban (browser) laptop atau ponsel Anda menggunakan WebAssembly dan HTML5 Canvas. Berkas Anda tidak pernah diunggah atau disimpan di server luar mana pun.',
    },
    {
      q: 'Apakah fitur KompresKilat dapat diakses dengan lancar melalui ponsel Android dan iPhone?',
      a: 'Tentu saja. Seluruh antarmuka KompresKilat dirancang sepenuhnya responsif (Mobile-First) dan ringan, kompatibel dengan browser Google Chrome, Safari, Samsung Internet, Microsoft Edge, dan Mozilla Firefox pada smartphone.',
    },
    {
      q: 'Apakah dokumen yang dihasilkan (seperti PDF dan Word) memenuhi standar resmi lamaran kerja?',
      a: 'Ya. Dokumen PDF yang dikompresi atau digabungkan mempertahankan spesifikasi standar ISO PDF 1.7 / 2.0 yang dapat dibaca sempurna oleh sistem ATS (Applicant Tracking System), portal SSCASN BKN, portal rekrutmen BUMN, maupun sistem HRD perusahaan.',
    },
    {
      q: 'Bagaimana cara KompresKilat membiayai operasional layanan tanpa memungut biaya dari pengguna?',
      a: 'Kami membiayai infrastruktur dan pemeliharaan platform melalui penayangan unit iklan terverifikasi dari Google AdSense. Seluruh iklan disematkan sesuai kebijakan resmi penerbit untuk menjaga kenyamanan pengalaman pengguna tanpa iklan pop-up yang mengganggu.',
    },
  ];

  const faqSchemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homeFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  // Filter tools sesuai tab kategori aktif & kata kunci pencarian
  const displayedTools = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return ALL_TOOLS.filter(
        (tool) =>
          tool.title.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q) ||
          tool.category.toLowerCase().includes(q) ||
          (tool.keywords && tool.keywords.some((k) => k.toLowerCase().includes(q)))
      );
    }
    return ALL_TOOLS.filter((tool) => tool.categoryKey === activeTab);
  }, [activeTab, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const el = document.getElementById('tools');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePopularTagClick = (categoryKey: ToolCategoryKey, query = '') => {
    setActiveTab(categoryKey);
    setSearchQuery(query);
    const el = document.getElementById('tools');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Hitung jumlah alat di tiap kategori
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORY_TABS.forEach((cat) => {
      counts[cat.key] = ALL_TOOLS.filter((tool) => tool.categoryKey === cat.key).length;
    });
    return counts;
  }, []);

  // Helper warna badge
  const getBadgeStyle = (color?: ToolItem['badgeColor']) => {
    switch (color) {
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80';
      case 'emerald':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80';
      case 'amber':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80';
      case 'orange':
        return 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/80';
      case 'blue':
        return 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/80';
      default:
        return 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80';
    }
  };

  return (
    <div className="w-full">
      {/* ============================================================ */}
      {/* 1. HERO BANNER SECTION (Persis Mockup Gambar)                */}
      {/* ============================================================ */}
      <section className="w-full bg-gradient-to-b from-[#eef4fe] via-[#e8f1fd] to-[#f4f8fe] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-blue-100/90 dark:border-slate-800 relative overflow-hidden pt-8 sm:pt-12 pb-10 sm:pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Sisi Kiri: Teks Judul, Deskripsi, Search Bar, Quick Tags */}
            <div className="lg:col-span-7 space-y-5 text-left">
              
              {/* Badge Pill di Atas Judul (Persis Mockup) */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 text-xs font-semibold shadow-2xs">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[10px]">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span>Privasi Anda, Prioritas Kami</span>
              </div>

              {/* Judul Utama dengan Garis Lengkung Kuning / Oranye di "Satu Tempat" */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-slate-900 dark:text-white tracking-tight leading-[1.14]">
                Semua Tools Digital <br />
                dalam{' '}
                <span className="relative inline-block text-blue-600 dark:text-blue-400">
                  Satu Tempat
                  {/* Garis lengkung oranye dekoratif (Persis Gambar Mockup) */}
                  <svg
                    className="absolute -bottom-1.5 sm:-bottom-2 left-0 w-full h-3 sm:h-3.5 text-amber-400 pointer-events-none"
                    viewBox="0 0 250 20"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 14C60 4 180 3 247 12"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              {/* Sub-judul Deskripsi Bersih & Kompak */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                Kompres file, ubah format, dan kelola dokumen Anda dengan cepat, aman, dan 100% gratis.
              </p>

              {/* Search Bar Berbentuk Pil Modern (Persis Gambar Mockup) */}
              <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
                <div className="flex items-center bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm p-1.5 pl-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0 mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari tools... contoh: kompres PDF, ubah gambar, kalkulator..."
                    className="w-full bg-transparent border-0 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none placeholder:text-slate-400 py-1"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm flex items-center gap-1.5 shrink-0 shadow-sm transition cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Cari</span>
                  </button>
                </div>
              </form>

              {/* Tools Populer Quick Tags (Persis Gambar Mockup) */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 mr-1 text-xs sm:text-sm">
                  Tools Populer:
                </span>

                {/* 1. PDF Tools */}
                <button
                  type="button"
                  onClick={() => handlePopularTagClick('document')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 border border-red-200/80 dark:border-red-900/60 font-semibold text-xs hover:bg-red-100 dark:hover:bg-red-900/80 transition cursor-pointer shadow-2xs"
                >
                  <span className="w-4 h-4 rounded bg-red-600 text-white flex items-center justify-center text-[9px] font-black">
                    PDF
                  </span>
                  <span>PDF Tools</span>
                </button>

                {/* 2. Image Tools */}
                <button
                  type="button"
                  onClick={() => handlePopularTagClick('image')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-900/60 font-semibold text-xs hover:bg-sky-100 dark:hover:bg-sky-900/80 transition cursor-pointer shadow-2xs"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                  <span>Image Tools</span>
                </button>

                {/* 3. Converter */}
                <button
                  type="button"
                  onClick={() => handlePopularTagClick('document', 'konversi')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60 font-semibold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Converter</span>
                </button>

                {/* 4. AI Tools */}
                <button
                  type="button"
                  onClick={() => handlePopularTagClick('ai')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-900/60 font-semibold text-xs hover:bg-purple-100 dark:hover:bg-purple-900/80 transition cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>AI Tools</span>
                </button>

                {/* 5. Lainnya ∨ */}
                <button
                  type="button"
                  onClick={() => handlePopularTagClick('utility')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs"
                >
                  <span>Lainnya</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Sisi Kanan: Slideshow Ilustrasi 3D & Banner Keamanan (Persis Mockup Gambar) */}
            <div className="lg:col-span-5 relative flex items-center justify-center w-full">
              <div
                className="relative w-full max-w-full lg:max-w-[560px] select-none group"
                onMouseEnter={() => setIsSlidePaused(true)}
                onMouseLeave={() => setIsSlidePaused(false)}
                onTouchStart={() => setIsSlidePaused(true)}
                onTouchEnd={() => setIsSlidePaused(false)}
              >
                {/* Slideshow Card Container (Format presisi, rounded-3xl, shadow lembut) */}
                <div 
                  onClick={() => setPreviewSlideModal(heroSlides[currentSlide].src)}
                  className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-blue-100/90 dark:border-slate-800 shadow-xl dark:shadow-slate-950/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs flex items-center justify-center p-2 sm:p-3 cursor-pointer"
                >
                  {heroSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-center p-2 sm:p-3 ${
                        index === currentSlide
                          ? 'opacity-100 z-10 pointer-events-auto'
                          : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      <img
                        src={slide.src}
                        alt={slide.alt}
                        className="w-full h-full object-contain drop-shadow-md rounded-xl transition-transform duration-300 hover:scale-[1.01]"
                        width={slide.width}
                        height={slide.height}
                      />
                    </div>
                  ))}

                  {/* Indikator Titik Slideshow di Pojok Kanan Bawah Sesuai Gambar */}
                  <div className="absolute bottom-3 right-4 sm:right-6 z-20 flex items-center gap-1.5 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs border border-slate-200/70 dark:border-slate-800">
                    {heroSlides.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSlide(dotIdx);
                        }}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${
                          dotIdx === currentSlide
                            ? 'w-5 h-2 bg-blue-600'
                            : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                        }`}
                        aria-label={`Ke slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Tombol Panah Kiri (Navigasi Manual & Berulang Terus) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
                  }}
                  className="absolute left-1.5 sm:-left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  aria-label="Slide sebelumnya"
                  title="Slide sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Tombol Panah Kanan (Navigasi Manual & Berulang Terus) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
                  }}
                  className="absolute right-1.5 sm:-right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  aria-label="Slide berikutnya"
                  title="Slide berikutnya"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* TRUST BADGES FLOATING BAR (Persis Mockup Gambar)             */}
          {/* ============================================================ */}
          <div className="mt-10 sm:mt-14 bg-white/95 dark:bg-slate-900/95 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
              {/* 1. Keamanan Tingkat Tinggi */}
              <div className="flex items-center gap-3.5 pr-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Keamanan Tingkat Tinggi
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    Data Anda tidak pernah tersimpan
                  </p>
                </div>
              </div>

              {/* 2. Pemrosesan di Perangkat Anda */}
              <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-4 sm:pr-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Pemrosesan di Perangkat Anda
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    Tanpa mengunggah ke server
                  </p>
                </div>
              </div>

              {/* 3. Data Langsung Terhapus */}
              <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-4 sm:pr-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/25">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Data Langsung Terhapus
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    Tidak ada jejak data
                  </p>
                </div>
              </div>

              {/* 4. Gratis Selamanya */}
              <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Gratis Selamanya
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    Tanpa biaya tersembunyi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MAIN CONTENT WRAPPER: All Tools, Guides, FAQ                 */}
      {/* Lebar Kontainer Sejajar Presisi dengan Header (max-w-7xl)    */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-12">

      {/* ============================================================ */}
      {/* 2. CATEGORY TABS & FILTERABLE ALL TOOLS                      */}
      {/* ============================================================ */}
      <section id="tools" className="mb-16 sm:mb-24 scroll-mt-20">
        <div className="text-center sm:text-left mb-6 sm:mb-8">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-sm">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Eksplorasi Seluruh Alat &amp; Fitur
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Pilih kategori di bawah untuk menyaring alat produktivitas yang Anda butuhkan secara instan.
          </p>
        </div>

        {/* Category Tabs Pill Bar (Horizontal Scrollable on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = categoryCounts[tab.key] || 0;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setSearchQuery('');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-2 cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-102'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filtered Grid View: Tampilkan alat berdasarkan tab kategori atau pencarian */}
        <div className="animate-in fade-in duration-200">
          {searchQuery && (
            <div className="flex items-center justify-between mb-6 p-3.5 bg-blue-50 dark:bg-blue-950/50 rounded-2xl border border-blue-200/80 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
              <span className="font-medium">
                Hasil pencarian untuk: <b>&quot;{searchQuery}&quot;</b> ({displayedTools.length} alat ditemukan)
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="font-bold underline hover:text-blue-900 dark:hover:text-white cursor-pointer ml-3"
              >
                Reset Pencarian
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {displayedTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} getBadgeStyle={getBadgeStyle} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SHOWCASE TIER: TOOLS POPULER, TERBARU & PROMO (Persis Mockup) */}
      {/* ============================================================ */}
      <section className="pt-8 sm:pt-12 border-t border-slate-200/80 dark:border-slate-800 mb-10 sm:mb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Kolom 1: Tools Populer */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                    Tools Populer
                  </h3>
                </div>
                <a
                  href="#tools"
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-0.5 transition"
                >
                  <span>Lihat Semua</span>
                  <span>→</span>
                </a>
              </div>

              <div className="space-y-3.5">
                {/* 1. Kompres PDF */}
                <Link
                  href="/tools/pdf"
                  className="flex items-center justify-between gap-2.5 py-1 hover:translate-x-1 transition-transform group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                      Kompres PDF
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      1.2M+ kali digunakan
                    </span>
                    <svg className="w-10 h-3.5 text-blue-500" viewBox="0 0 48 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 2 12 Q 10 4, 18 10 T 34 6 T 46 8" />
                    </svg>
                  </div>
                </Link>

                {/* 2. Resize Gambar */}
                <Link
                  href="/tools/image"
                  className="flex items-center justify-between gap-2.5 py-1 hover:translate-x-1 transition-transform group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                      Resize Gambar
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      980K+ kali digunakan
                    </span>
                    <svg className="w-10 h-3.5 text-blue-500" viewBox="0 0 48 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 2 11 Q 12 3, 22 9 T 36 5 T 46 7" />
                    </svg>
                  </div>
                </Link>

                {/* 3. PDF ke Word */}
                <Link
                  href="/tools/pdf-to-word"
                  className="flex items-center justify-between gap-2.5 py-1 hover:translate-x-1 transition-transform group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                      PDF ke Word
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      720K+ kali digunakan
                    </span>
                    <svg className="w-10 h-3.5 text-blue-500" viewBox="0 0 48 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 2 13 Q 14 5, 24 11 T 38 7 T 46 9" />
                    </svg>
                  </div>
                </Link>

                {/* 4. Konversi JPG ke PNG */}
                <Link
                  href="/tools/image"
                  className="flex items-center justify-between gap-2.5 py-1 hover:translate-x-1 transition-transform group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-black flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                      Konversi JPG ke PNG
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      680K+ kali digunakan
                    </span>
                    <svg className="w-10 h-3.5 text-blue-500" viewBox="0 0 48 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 2 12 Q 10 4, 18 10 T 34 6 T 46 8" />
                    </svg>
                  </div>
                </Link>

                {/* 5. Gabung PDF */}
                <Link
                  href="/tools/pdf-merge"
                  className="flex items-center justify-between gap-2.5 py-1 hover:translate-x-1 transition-transform group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-black flex items-center justify-center shrink-0">
                      5
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                      Gabung PDF
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      560K+ kali digunakan
                    </span>
                    <svg className="w-10 h-3.5 text-blue-500" viewBox="0 0 48 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 2 11 Q 12 3, 22 9 T 36 5 T 46 7" />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Kolom 2: Terbaru Ditambahkan */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                    Terbaru Ditambahkan
                  </h3>
                </div>
                <a
                  href="#tools"
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-0.5 transition"
                >
                  <span>Lihat Semua</span>
                  <span>→</span>
                </a>
              </div>

              <div className="space-y-3.5">
                {/* Tool 1: AI Summarizer */}
                <Link
                  href="/tools/document-summarizer"
                  className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                        AI Summarizer
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        Ringkas teks dengan AI
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                    Baru
                  </span>
                </Link>

                {/* Tool 2: PDF ke PowerPoint */}
                <Link
                  href="/tools/pdf-to-ppt"
                  className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-red-500 text-white flex items-center justify-center shrink-0 shadow-xs font-black text-xs">
                      PPT
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                        PDF ke PowerPoint
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        Konversi PDF ke PPT
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                    Baru
                  </span>
                </Link>

                {/* Tool 3: Teks ke Suara */}
                <Link
                  href="/tools/pro-editor"
                  className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Volume2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                        Teks ke Suara
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        Ubah teks menjadi suara
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                    Baru
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Kolom 3: Promo Banner Lebih Produktif dengan Roket */}
          <div className="lg:col-span-4 bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#1e40af] rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden shadow-lg shadow-blue-500/20 flex flex-col justify-between group">
            {/* Background Graphic: 3D Rocket blasting off with clouds */}
            <div className="absolute right-0 bottom-0 w-44 sm:w-52 h-44 sm:h-52 pointer-events-none select-none">
              <svg viewBox="0 0 240 220" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="70%" stopColor="#f1f5f9" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </linearGradient>
                  <linearGradient id="rocketCone" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#b91c1c" />
                  </linearGradient>
                  <linearGradient id="rocketFlame" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="60%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>

                {/* Flame Trail */}
                <g transform="translate(130, 115) rotate(45)">
                  <path d="M-12,0 C-18,25 -28,60 0,85 C28,60 18,25 12,0 Z" fill="url(#rocketFlame)" opacity="0.95" />
                  <path d="M-6,0 C-9,15 -12,35 0,50 C12,35 9,15 6,0 Z" fill="#fef08a" />
                </g>

                {/* Angled Rocket Body */}
                <g transform="translate(170, 75) rotate(45)">
                  {/* Left Fin */}
                  <path d="M-22,35 C-38,45 -42,70 -38,78 C-30,76 -20,60 -18,48 Z" fill="url(#rocketCone)" />
                  {/* Right Fin */}
                  <path d="M22,35 C38,45 42,70 38,78 C30,76 20,60 18,48 Z" fill="url(#rocketCone)" />
                  {/* Center Fin */}
                  <path d="M-3,40 L3,40 L2,72 L-2,72 Z" fill="#991b1b" />

                  {/* Fuselage */}
                  <path d="M0,-55 C22,-20 25,35 20,55 C12,58 -12,58 -20,55 C-25,35 -22,-20 0,-55 Z" fill="url(#rocketBody)" />

                  {/* Nose Cone */}
                  <path d="M0,-55 C12,-38 18,-20 19,-10 L-19,-10 C-18,-20 -12,-38 0,-55 Z" fill="url(#rocketCone)" />

                  {/* Window Ring */}
                  <circle cx="0" cy="8" r="13" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" />
                  <circle cx="0" cy="8" r="9.5" fill="#0369a1" />
                  <ellipse cx="-3" cy="5" rx="3.5" ry="2" fill="#bae6fd" opacity="0.8" transform="rotate(-30, -3, 5)" />
                  <line x1="-19" y1="36" x2="19" y2="36" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" />
                </g>

                {/* Fluffy white clouds at bottom */}
                <circle cx="210" cy="205" r="45" fill="#ffffff" opacity="0.95" />
                <circle cx="160" cy="210" r="38" fill="#ffffff" opacity="0.92" />
                <circle cx="120" cy="225" r="32" fill="#ffffff" opacity="0.85" />
                <circle cx="225" cy="165" r="32" fill="#ffffff" opacity="0.9" />
                <circle cx="185" cy="180" r="35" fill="#ffffff" opacity="0.95" />
              </svg>
            </div>

            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2 tracking-tight">
                Lebih Produktif<br />dengan KompresKilat
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 max-w-[210px] leading-relaxed mb-6 font-medium">
                Akses 43 tools terbaik, cepat, mudah dan gratis!
              </p>
            </div>

            <div className="relative z-10 pt-2">
              <a
                href="#tools"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all shadow-md w-fit cursor-pointer"
              >
                <span>Mulai Sekarang</span>
                <span className="font-bold">→</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. ARTIKEL & PANDUAN TERBARU SECTION (Persis Mockup 4 Cards) */}
      {/* ============================================================ */}
      <section className="mb-12 sm:mb-16">
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Artikel &amp; Panduan Terbaru
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition"
          >
            <span>Lihat Semua Artikel</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Cara Mengecilkan Ukuran PDF dengan Mudah */}
          <Link
            href="/blog/cara-memperkecil-ukuran-pdf-tugas-kuliah"
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-sky-50 dark:from-blue-950/80 dark:to-slate-800 flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-200">
                <div className="w-9 h-11 bg-red-500 rounded-lg shadow-xs flex flex-col items-center justify-center text-white relative">
                  <span className="text-[10px] font-black tracking-tight">PDF</span>
                  <div className="w-3 h-1 bg-white/40 rounded-full mt-1"></div>
                </div>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1.5 leading-snug transition-colors">
                Cara Mengecilkan Ukuran PDF dengan Mudah
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-2.5">
                3 Jun 2025 • 5 menit baca
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                Pelajari cara kompres PDF tanpa mengurangi kualitas file.
              </p>
            </div>
          </Link>

          {/* Card 2: Cara Mengubah JPG ke PNG */}
          <Link
            href="/blog/perbedaan-format-jpg-png-webp-dan-kapan-harus-dipakai"
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-sky-50 dark:from-blue-950/80 dark:to-slate-800 flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-200">
                <div className="w-10 h-10 bg-blue-500 rounded-xl shadow-xs flex items-center justify-center text-white">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1.5 leading-snug transition-colors">
                Cara Mengubah JPG ke PNG
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-2.5">
                1 Jun 2025 • 4 menit baca
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                Ubah gambar JPG ke PNG dengan kualitas terbaik.
              </p>
            </div>
          </Link>

          {/* Card 3: Cara Menggabungkan File PDF */}
          <Link
            href="/blog/cara-menggabungkan-file-pdf-menjadi-satu-online-gratis"
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-amber-950/80 dark:to-slate-800 flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-200">
                <div className="w-10 h-10 bg-amber-400 rounded-xl shadow-xs flex items-center justify-center text-blue-700 font-extrabold text-base">
                  <svg className="w-5 h-5 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m8 9-5 3 5 3" />
                    <path d="M3 12h18" />
                    <path d="m16 9 5 3-5 3" />
                  </svg>
                </div>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1.5 leading-snug transition-colors">
                Cara Menggabungkan File PDF
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-2.5">
                28 Mei 2025 • 5 menit baca
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                Gabungkan beberapa file PDF menjadi satu dokumen.
              </p>
            </div>
          </Link>

          {/* Card 4: Mengenal OCR: Ekstrak Teks dari Gambar */}
          <Link
            href="/blog/cara-ubah-pdf-hasil-scan-ke-word-bisa-diedit-ocr"
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-50 dark:from-purple-950/80 dark:to-slate-800 flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-200">
                <div className="w-10 h-10 bg-purple-600 rounded-xl shadow-xs flex items-center justify-center text-white font-black text-[11px] tracking-wider">
                  OCR
                </div>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1.5 leading-snug transition-colors">
                Mengenal OCR: Ekstrak Teks dari Gambar
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-2.5">
                25 Mei 2025 • 6 menit baca
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                Ubah gambar berisi teks menjadi dokumen teks.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. EDITORIAL GUIDE & FAQ EKOSISTEM KOMPRESKILAT (AdSense Value) */}
      {/* ============================================================ */}
      <section className="mb-6 sm:mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-8 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs px-3.5 py-1.5 rounded-full font-bold mb-3">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pusat Edukasi &amp; Standar Komputasi Mandiri</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Mengenal Ekosistem KompresKilat: Solusi Utilitas Digital, Bisnis &amp; Berkas Terpadu
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Di era digital saat ini, masyarakat Indonesia, pelaku UMKM, mahasiswa, dan pelamar kerja kerap menghadapi kendala teknis dalam mengelola dokumen digital. Mulai dari penolakan berkas foto KTP di portal SSCASN karena melebihi kuota 200 KB, dokumen skripsi PDF yang terlalu berat untuk dikirim via email, kebutuhan cetak nota kasir thermal tanpa aplikasi berbayar, hingga pengecekan nomor resi belanja online yang terpisah-pisah. KompresKilat hadir sebagai platform terintegrasi yang menghadirkan lebih dari 40 perkakas produktivitas gratis dalam satu pintu peramban.
            </p>
          </div>

          {/* 4 Pilar Fitur Utama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
              <span className="text-2xl block">📄</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Dokumen &amp; PDF</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Editor teks PDF langsung, penggabung berkas, kompresi skripsi, konversi OCR ke Word, dan proteksi sandi dokumen.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
              <span className="text-2xl block">🖼️</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Foto &amp; Gambar</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Preset foto KTP &lt; 200 KB, ganti latar belakang pasfoto merah/biru via AI, kuas penghapus objek, dan resize 2x3/3x4/4x6.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
              <span className="text-2xl block">🧾</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Bisnis &amp; Pajak</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Pembuat invoice &amp; nota kasir cetak thermal, kalkulator simulasi PPh 21 skema TER, dan analisis margin BEP UMKM.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
              <span className="text-2xl block">📦</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Logistik &amp; Utilitas</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Pelacakan otomatis nomor resi multi-kurir (SPX, JNE, J&amp;T, SiCepat), generator QR code, dan arsip ZIP mandiri.
              </p>
            </div>
          </div>

          {/* Keamanan & Arsitektur Zero-Knowledge */}
          <div className="p-5 sm:p-6 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Standar Keamanan Tertinggi: Zero-Knowledge Client-Side Processing</span>
            </div>
            <p className="text-xs text-indigo-950/80 dark:text-indigo-300/80 leading-relaxed">
              Berbeda dengan situs kompresi konvensional yang mewajibkan Anda mengunggah dokumen pribadi ke server cloud asing, KompresKilat dibangun dengan arsitektur <b>Client-Side First</b>. Berkas Anda diproses secara instan di dalam memori peramban pengguna memanfaatkan teknologi modern HTML5 Canvas, WebAssembly, dan Web Workers. Data Anda tidak pernah diunggah atau disimpan di server kami, menjamin kepatuhan penuh terhadap UU Perlindungan Data Pribadi (UU PDP).
            </p>
          </div>

          {/* ============================================================ */}
          {/* FAQ Homepage (Pertanyaan Umum Pengunjung)                     */}
          {/* ============================================================ */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Pertanyaan yang Sering Diajukan (FAQ KompresKilat)
              </h3>
            </div>

            {homeFaqItems.map((item, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-slate-800 dark:text-slate-200 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer gap-3"
                >
                  <span className="text-xs sm:text-sm">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                      openFaq === idx ? 'rotate-180 text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-slate-600 dark:text-slate-400 text-xs sm:text-sm border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Preview Modal for Slideshow Graphic */}
      {previewSlideModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewSlideModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-8 animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl p-2 sm:p-4 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center cursor-default"
          >
            <div className="w-full flex items-center justify-between pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Infografis Arsitektur Keamanan Zero-Knowledge
              </span>
              <button
                type="button"
                onClick={() => setPreviewSlideModal(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                aria-label="Tutup preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
              <img
                src={previewSlideModal}
                alt="Infografis Keamanan KompresKilat"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Structured Data FAQPage for Homepage */}
      <JsonLd data={faqSchemaData} />
    </div>
  </div>
  );
}

// Sub-komponen Card Alat Standar (Clean, Modern, Whitespace Optimal)
function ToolCard({
  tool,
  getBadgeStyle,
}: {
  tool: ToolItem;
  getBadgeStyle: (color?: ToolItem['badgeColor']) => string;
}) {
  return (
    <Link
      href={tool.href}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-6 shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200 shadow-2xs shrink-0">
            {tool.icon}
          </div>
          {tool.badge && (
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                tool.badgeColor
              )}`}
            >
              {tool.badge}
            </span>
          )}
        </div>

        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1.5">
          {tool.title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{tool.category}</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
