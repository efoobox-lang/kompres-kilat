'use client';

import { useState, useMemo } from 'react';
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
  X,
} from 'lucide-react';

export default function HomeClient({ latestPosts }: { latestPosts: BlogPost[] }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ToolCategoryKey>('document');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
      <section className="w-full bg-gradient-to-r from-[#eef4fe] via-[#e5f0fd] to-[#dce9fc] dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 border-b border-blue-100/90 dark:border-slate-800 relative overflow-hidden py-10 sm:py-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Sisi Kiri: Teks Judul, Deskripsi, Search Bar, Quick Tags */}
            <div className="lg:col-span-7 space-y-5 text-left">
              {/* Judul Utama */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                Semua Tools Digital <br />
                dalam <span className="text-blue-600 dark:text-blue-400">Satu Tempat</span>
              </h1>

              {/* Sub-judul dengan Badge "43 tools" */}
              <p className="text-xs sm:text-sm md:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed flex flex-wrap items-center gap-1.5">
                <span>Cari, gunakan, dan selesaikan pekerjaan digitalmu lebih cepat</span>
                <span>dengan</span>
                <span className="bg-blue-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full inline-flex items-center shadow-xs">
                  43 tools
                </span>
                <span>online terbaik dan gratis!</span>
              </p>

              {/* Search Bar Berbentuk Pil Modern (Persis Gambar) */}
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
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-1"
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

              {/* Tools Populer Quick Tags (Persis Gambar) */}
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

            {/* Sisi Kanan: Ilustrasi 3D Showcase (Laptop, Phone, 3D Flying Icons, 43 Tools Rocket Badge) */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-[480px] lg:max-w-[520px] transform hover:scale-[1.02] transition-transform duration-300 select-none">
                <img
                  src="/images/hero-illustration.png"
                  alt="43 Tools Digital KompresKilat"
                  className="w-full h-auto drop-shadow-2xl object-contain rounded-2xl"
                  width={467}
                  height={288}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MAIN CONTENT WRAPPER: All Tools, Guides, FAQ                 */}
      {/* ============================================================ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8">

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
      {/* 4. BLOG & ARTIKEL TERBARU SECTION                            */}
      {/* ============================================================ */}
      <section className="pt-10 sm:pt-14 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
              {t('blog_heading_badge')}
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('blog_heading_title')}
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition whitespace-nowrap shrink-0 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-100 dark:border-indigo-800/80 flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t('blog_see_all')}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {latestPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/90 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-bold">
                    {post.category}
                  </span>
                  <span className="text-[11px] text-slate-400">{post.readTime}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-2 leading-snug transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>{post.date}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                  {t('blog_read_more')} &rarr;
                </span>
              </div>
            </Link>
          ))}
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
