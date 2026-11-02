'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog-data';
import { useLanguage } from '@/context/LanguageContext';
import ThemeToggle from '@/components/ThemeToggle';
import { ALL_TOOLS, CATEGORY_TABS, ToolCategoryKey, ToolItem } from '@/lib/tools-data';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Layers,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export default function HomeClient({ latestPosts }: { latestPosts: BlogPost[] }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ToolCategoryKey>('all');

  // Filter tools sesuai tab kategori aktif
  const displayedTools = useMemo(() => {
    if (activeTab === 'all') return ALL_TOOLS;
    return ALL_TOOLS.filter((tool) => tool.categoryKey === activeTab);
  }, [activeTab]);

  // Featured / Paling Sering Digunakan
  const popularTools = useMemo(() => {
    return ALL_TOOLS.filter((tool) => tool.isPopular).slice(0, 6);
  }, []);

  // Hitung jumlah alat di tiap kategori
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ALL_TOOLS.length };
    CATEGORY_TABS.forEach((cat) => {
      if (cat.key !== 'all') {
        counts[cat.key] = ALL_TOOLS.filter((tool) => tool.categoryKey === cat.key).length;
      }
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-12 sm:py-16">
      {/* Khusus Mobile: Dark Mode Toggle Switch di kanan atas persis sesuai posisi tanda merah */}
      <div className="flex md:hidden justify-end items-center mb-2">
        <ThemeToggle compact={true} />
      </div>

      {/* ============================================================ */}
      {/* 1. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full font-bold mb-4 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>{t('hero_badge')}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-3 sm:mb-4 leading-tight sm:leading-tight">
          {t('hero_title_1')}{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {t('hero_title_highlight')}
          </span>
        </h1>

        <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-4">
          {t('hero_desc')}
        </p>

        {/* Privacy Assurance Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>100% Client-Side: Berkas &amp; data diproses di peramban tanpa disimpan ke server.</span>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. FEATURED / MOST POPULAR TOOLS SECTION ("Paling Sering Digunakan") */}
      {/* ============================================================ */}
      <section className="mb-14 sm:mb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 sm:mb-8 border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 text-sm">
                <Flame className="w-4 h-4" />
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Paling Sering Digunakan
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60 hidden sm:inline-block">
                Pilihan Utama
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Akses instan ke alat produktivitas unggulan yang paling banyak diakses pengguna setiap hari.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0">
            6 Alat Teratas
          </span>
        </div>

        {/* Featured Grid (2 baris x 3 kolom desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {popularTools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/90 p-5 sm:p-6 shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              {/* Highlight bar top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80 group-hover:h-1.5 transition-all" />

              <div>
                <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200 shadow-2xs">
                    {tool.icon}
                  </div>
                  {tool.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                        tool.badgeColor
                      )}`}
                    >
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1.5">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {tool.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span className="text-[11px] text-slate-400 font-normal">{tool.category}</span>
                <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Buka Alat <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. CATEGORY TABS & FILTERABLE ALL TOOLS                      */}
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
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-2 cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-102'
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

        {/* Section View: Jika "Semua" aktif, kelompokkan berdasarkan kategori dengan judul rapi */}
        {activeTab === 'all' ? (
          <div className="space-y-12 sm:space-y-16">
            {CATEGORY_TABS.filter((cat) => cat.key !== 'all').map((category) => {
              const categoryTools = ALL_TOOLS.filter((t) => t.categoryKey === category.key);
              if (categoryTools.length === 0) return null;

              return (
                <div key={category.key} className="space-y-4">
                  {/* Category Section Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{category.icon}</span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {category.label}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {categoryTools.length} alat
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab(category.key)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Fokus Kategori</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Grid Cards per Kategori */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {categoryTools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} getBadgeStyle={getBadgeStyle} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Filtered View: Tampilkan hanya alat di kategori terpilih */
          <div className="animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {displayedTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} getBadgeStyle={getBadgeStyle} />
              ))}
            </div>
          </div>
        )}
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
