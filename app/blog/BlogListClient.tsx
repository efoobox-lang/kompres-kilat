'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog-data';

export default function BlogListClient({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = useMemo(() => {
    const list = Array.from(new Set(initialPosts.map((p) => p.category)));
    return ['Semua', ...list];
  }, [initialPosts]);

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchCategory = selectedCategory === 'Semua' || post.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [initialPosts, searchQuery, selectedCategory]);

  return (
    <div>
      {/* Search Bar & Filter Kategori */}
      <div className="mb-8 space-y-4">
        <div className="max-w-md mx-auto relative">
          <input
            type="text"
            placeholder="Cari artikel, tutorial, atau panduan resi..."
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
                  ? 'bg-indigo-600 text-white shadow-sm'
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((art) => (
            <Link
              key={art.slug}
              href={`/blog/${art.slug}`}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-semibold border border-indigo-100">
                    {art.category}
                  </span>
                  <div className="text-[11px] text-slate-400 space-x-1">
                    <span>{art.date}</span>
                    <span>•</span>
                    <span>{art.readTime}</span>
                  </div>
                </div>

                <h2 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 mb-2 leading-snug">
                  {art.title}
                </h2>
                <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold group-hover:underline">
                <span>Baca Selengkapnya</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">Tidak ada artikel yang cocok dengan pencarian Anda.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
            }}
            className="mt-3 text-xs text-indigo-600 hover:underline font-medium"
          >
            Reset Pencarian
          </button>
        </div>
      )}
    </div>
  );
}

