'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog-data';
import { useLanguage } from '@/context/LanguageContext';

export default function BlogListClient({ initialPosts }: { initialPosts: BlogPost[] }) {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [extraPosts, setExtraPosts] = useState<BlogPost[]>([]);

  // Sinkronisasi artikel publik yang diterbitkan via admin (localStorage fallback & filtering nonaktif)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const deactRaw = localStorage.getItem('kk_deactivated_slugs');
      const deactList: string[] = deactRaw ? JSON.parse(deactRaw) : [];

      const raw = localStorage.getItem('kk_published_articles');
      if (raw) {
        const list: any[] = JSON.parse(raw);
        const mapped: BlogPost[] = list
          .filter((a) => !deactList.includes(a.slug))
          .map((a) => ({
            slug: a.slug,
            title: a.title,
            excerpt: a.excerpt || a.metaDescription || (a.content || '').slice(0, 160),
            category: a.category || 'Dokumen PDF',
            date: new Date(a.publishedAt || a.createdAt || Date.now()).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            readTime: a.readTime || a.readingTime || '6 menit',
            author: a.author || 'Tim SEO & Content Writer KompresKilat',
            content: a.content,
            relatedTool: a.relatedTool,
          }));
        setExtraPosts(mapped.filter((p) => !initialPosts.some((ip) => ip.slug === p.slug)));
      }
    } catch {}
  }, [initialPosts]);

  const allPosts = useMemo(() => {
    const deactRaw = typeof window !== 'undefined' ? localStorage.getItem('kk_deactivated_slugs') : null;
    const deactList: string[] = deactRaw ? JSON.parse(deactRaw) : [];
    return [...extraPosts, ...initialPosts].filter((p) => !deactList.includes(p.slug));
  }, [extraPosts, initialPosts]);

  const isEn = lang === 'en';

  const categories = useMemo(() => {
    const list = Array.from(new Set(allPosts.map((p) => (isEn && p.en?.category ? p.en.category : p.category))));
    return [isEn ? 'All' : 'Semua', ...list];
  }, [allPosts, isEn]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const postCat = isEn && post.en?.category ? post.en.category : post.category;
      const allKey = isEn ? 'All' : 'Semua';
      const matchCategory = selectedCategory === allKey || selectedCategory === 'Semua' || postCat === selectedCategory || post.category === selectedCategory;
      
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchCategory;

      const titleMatch = post.title.toLowerCase().includes(q) || (post.en?.title.toLowerCase().includes(q) ?? false);
      const excerptMatch = post.excerpt.toLowerCase().includes(q) || (post.en?.excerpt.toLowerCase().includes(q) ?? false);

      return matchCategory && (titleMatch || excerptMatch);
    });
  }, [allPosts, searchQuery, selectedCategory, isEn]);

  return (
    <div>
      {/* Search Bar & Filter Kategori */}
      <div className="mb-8 space-y-4">
        <div className="max-w-md mx-auto relative">
          <input
            type="text"
            placeholder={t('blog_search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 text-xs md:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
          <span className="absolute left-3.5 top-3 text-slate-400 text-xs">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Artikel */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredPosts.map((art) => {
            const hasEn = isEn && Boolean(art.en);
            const title = hasEn ? art.en!.title : art.title;
            const excerpt = hasEn ? art.en!.excerpt : art.excerpt;
            const category = hasEn ? art.en!.category : art.category;
            const date = hasEn ? art.en!.date : art.date;
            const readTime = hasEn ? art.en!.readTime : art.readTime;

            return (
              <Link
                key={art.slug}
                href={`/blog/${art.slug}`}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-semibold border border-indigo-100/70">
                      {category}
                    </span>
                    <div className="text-[11px] text-slate-400 space-x-1">
                      <span>{date}</span>
                      <span>•</span>
                      <span>{readTime}</span>
                    </div>
                  </div>

                  <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-2 leading-snug">
                    {title}
                  </h2>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                    {excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold group-hover:underline">
                  <span>{isEn ? 'Read Full Guide' : 'Baca Selengkapnya'}</span>
                  <span>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm font-semibold text-slate-700">
            {isEn ? 'No articles match your search criteria.' : 'Tidak ada artikel yang cocok dengan pencarian Anda.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(isEn ? 'All' : 'Semua');
            }}
            className="mt-3 text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
          >
            {isEn ? 'Reset Search & Filters' : 'Reset Pencarian & Filter'}
          </button>
        </div>
      )}
    </div>
  );
}
