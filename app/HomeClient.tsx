'use client';

import Link from 'next/link';
import { BlogPost } from '@/lib/blog-data';
import { useLanguage } from '@/context/LanguageContext';
import { Camera, ShieldCheck, QrCode, Archive } from 'lucide-react';

export default function HomeClient({ latestPosts }: { latestPosts: BlogPost[] }) {
  const { t } = useLanguage();

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16 text-center">
      {/* Hero Header */}
      <span className="inline-block bg-indigo-100 text-indigo-700 text-[11px] sm:text-xs px-3 py-1 rounded-full font-semibold mb-3 sm:mb-4">
        {t('hero_badge')}
      </span>
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3 sm:mb-4 leading-tight">
        {t('hero_title_1')} <span className="text-indigo-600">{t('hero_title_highlight')}</span>
      </h1>
      <p className="text-xs sm:text-base md:text-lg text-slate-600 mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
        {t('hero_desc')}
      </p>

      {/* Kotak Pilihan Tools Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-left mb-10 sm:mb-16">
        <Link href="/ai-image-tools" className="bg-gradient-to-br from-indigo-50/50 to-white p-5 sm:p-6 rounded-2xl border border-indigo-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group relative">
          <span className="absolute top-4 right-4 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{t('badge_new_ai')}</span>
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">✨</div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">{t('tool_ai_image_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_ai_image_desc')}</p>
        </Link>

        <Link href="/ai-presentation-maker" className="bg-gradient-to-br from-purple-50/50 to-white p-5 sm:p-6 rounded-2xl border border-purple-200 shadow-sm hover:shadow-md hover:border-purple-500 transition duration-200 group relative">
          <span className="absolute top-4 right-4 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{t('badge_new_ai')}</span>
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📊</div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-purple-600 mb-1">{t('tool_ai_slide_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_ai_slide_desc')}</p>
        </Link>

        <Link href="/tools/image" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🖼️</div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">{t('tool_image_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_image_desc')}</p>
        </Link>

        <Link href="/tools/remove-bg" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🎨</div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">{t('tool_bg_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_bg_desc')}</p>
        </Link>

        <Link href="/tools/object-eraser" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🪄</div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">{t('tool_eraser_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_eraser_desc')}</p>
        </Link>

        <Link href="/tools/pdf" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📄</div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">{t('tool_pdf_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_pdf_desc')}</p>
        </Link>

        <Link href="/tools/tracking" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📦</div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">{t('tool_track_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_track_desc')}</p>
        </Link>

        <Link href="/tools/pdf-to-word" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🔄</div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">{t('tool_pdf_word_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_pdf_word_desc')}</p>
        </Link>

        <Link href="/tools/pdf-to-excel" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📈</div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">{t('tool_pdf_excel_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_pdf_excel_desc')}</p>
        </Link>

        <Link href="/tools/poster-generator" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🎨</div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">{t('tool_poster_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_poster_desc')}</p>
        </Link>

        <Link href="/tools/excel-to-csv" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📊</div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">{t('tool_excel_csv_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_excel_csv_desc')}</p>
        </Link>

        <Link href="/tools/csv-to-excel" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📑</div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">{t('tool_csv_excel_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_csv_excel_desc')}</p>
        </Link>

        <Link href="/tools/zip" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🗜️</div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">{t('tool_zip_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_zip_desc')}</p>
        </Link>

        {/* 1. Resize Pas Foto & Tanda Tangan */}
        <Link href="/tools/resize-pasfoto" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
          <div className="mb-2 sm:mb-3 text-indigo-600 group-hover:scale-110 transition-transform duration-200 w-fit">
            <Camera className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.2} />
          </div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">{t('tool_resize_pasfoto_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_resize_pasfoto_desc')}</p>
        </Link>

        {/* 2. Watermark Dokumen & KTP */}
        <Link href="/tools/watermark" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
          <div className="mb-2 sm:mb-3 text-indigo-600 group-hover:scale-110 transition-transform duration-200 w-fit">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.2} />
          </div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">{t('tool_watermark_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_watermark_desc')}</p>
        </Link>

        {/* 3. QR Code Generator */}
        <Link href="/tools/qr-generator" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
          <div className="mb-2 sm:mb-3 text-indigo-600 group-hover:scale-110 transition-transform duration-200 w-fit">
            <QrCode className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.2} />
          </div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">{t('tool_qr_generator_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_qr_generator_desc')}</p>
        </Link>

        {/* 4. Batch Kompres & ZIP */}
        <Link href="/tools/batch-compress" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
          <div className="mb-2 sm:mb-3 text-indigo-600 group-hover:scale-110 transition-transform duration-200 w-fit">
            <Archive className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.2} />
          </div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">{t('tool_batch_compress_title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{t('tool_batch_compress_desc')}</p>
        </Link>
      </div>

      {/* Section Artikel Blog Terbaru */}
      <div className="text-left pt-6 border-t border-slate-200">
        <div className="flex justify-between items-end mb-5">
          <div>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">{t('blog_heading_badge')}</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{t('blog_heading_title')}</h2>
          </div>
          <Link href="/blog" className="text-xs font-bold text-indigo-600 hover:underline whitespace-nowrap ml-2">
            {t('blog_see_all')}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {latestPosts.map((post) => (
            <Link 
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                    {post.category}
                  </span>
                  <span className="text-[11px] text-slate-400">{post.readTime}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 mb-1.5 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{post.date}</span>
                <span className="text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform inline-block">
                  Baca Selengkapnya →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

