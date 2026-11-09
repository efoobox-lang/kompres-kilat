'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog-data';
import { useLanguage } from '@/context/LanguageContext';
import AdBanner from '@/components/AdBanner';
import {
  ArrowLeft,
  Share2,
  Check,
  FileQuestion,
  RefreshCw,
  Home,
  BookOpen,
  AlignLeft,
  Clock,
  UserCheck
} from 'lucide-react';

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function renderFormattedInlineText(text: string) {
  if (!text) return null;
  // Format bold (**...**), italic (*...*), and code (`...`)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-slate-800 dark:text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded text-[11px] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

interface BlogPostClientProps {
  initialPost?: BlogPost | null;
  slug?: string;
  post?: BlogPost;
}

export default function BlogPostClient({
  initialPost,
  slug,
  post: legacyPost,
}: BlogPostClientProps) {
  const { lang, t } = useLanguage();
  const [post, setPost] = useState<BlogPost | null>(initialPost || legacyPost || null);
  const [isChecking, setIsChecking] = useState<boolean>(!initialPost && !legacyPost);
  const [copied, setCopied] = useState(false);

  const [isDeactivated, setIsDeactivated] = useState<boolean>(false);

  // Fallback client-side lookup jika artikel baru diterbitkan di Vercel (Zero-Config)
  useEffect(() => {
    if (typeof window === 'undefined' || !slug) {
      setIsChecking(false);
      return;
    }

    // Periksa apakah artikel ini masuk dalam daftar slug yang dinonaktifkan (ditarik ke draft)
    try {
      const deactRaw = localStorage.getItem('kk_deactivated_slugs');
      if (deactRaw) {
        const deactList: string[] = JSON.parse(deactRaw);
        if (deactList.includes(slug)) {
          setPost(null);
          setIsDeactivated(true);
          setIsChecking(false);
          return;
        }
      }
    } catch {}

    if (post) {
      setIsChecking(false);
      return;
    }

    // 1. Cek dari localStorage kk_published_articles
    try {
      const raw = localStorage.getItem('kk_published_articles');
      if (raw) {
        const list: any[] = JSON.parse(raw);
        const match = list.find((a) => a.slug === slug || a.id === slug);
        if (match) {
          setPost({
            slug: match.slug,
            title: match.title,
            excerpt: match.excerpt || match.metaDescription || (match.content || '').slice(0, 160),
            category: match.category || 'Dokumen PDF',
            date: new Date(match.publishedAt || match.createdAt || Date.now()).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            readTime: match.readTime || match.readingTime || '6 menit',
            author: match.author || 'Tim SEO & Content Writer KompresKilat',
            content: match.content,
            relatedTool: match.relatedTool || {
              title: 'Alat Pendukung KompresKilat',
              description: 'Gunakan fitur utilitas berkas online gratis langsung di browser.',
              url: '/tools/image',
              icon: '⚡',
              buttonText: 'Coba Fitur Sekarang',
            },
          });
          setIsChecking(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Gagal membaca localStorage kk_published_articles:', e);
    }

    // 2. Cek dari API sinkronisasi /api/blog/article?slug=...
    fetch(`/api/blog/article?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.article) {
          const match = data.article;
          setPost({
            slug: match.slug,
            title: match.title,
            excerpt: match.excerpt || match.metaDescription || (match.content || '').slice(0, 160),
            category: match.category || 'Dokumen PDF',
            date: new Date(match.publishedAt || match.createdAt || Date.now()).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            readTime: match.readTime || match.readingTime || '6 menit',
            author: match.author || 'Tim SEO & Content Writer KompresKilat',
            content: match.content,
            relatedTool: match.relatedTool || {
              title: 'Alat Pendukung KompresKilat',
              description: 'Gunakan fitur utilitas berkas online gratis langsung di browser.',
              url: '/tools/image',
              icon: '⚡',
              buttonText: 'Coba Fitur Sekarang',
            },
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsChecking(false);
      });
  }, [post, slug]);

  // Check if active language is English and English translation is available
  const isEn = lang === 'en' && Boolean(post?.en);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // State Memuat / Memeriksa Draf Client
  if (isChecking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Menyiapkan Tampilan Artikel Blog...</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Sedang menyinkronkan data publikasi artikel KompresKilat secara real-time.
        </p>
      </div>
    );
  }

  // State Jika Artikel Dinonaktifkan (Draft) atau Tidak Ditemukan
  if (!post) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm ${
          isDeactivated
            ? 'bg-amber-100 text-amber-700 border border-amber-300'
            : 'bg-slate-100 text-slate-600 border border-slate-300'
        }`}>
          <FileQuestion className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isDeactivated ? 'Artikel Sedang Dinonaktifkan (Draft)' : 'Artikel Tidak Ditemukan'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {isDeactivated
              ? 'Konten artikel ini telah dinonaktifkan oleh administrator dan dikembalikan ke status draf sehingga otomatis ditarik dari publikasi website.'
              : <>Artikel dengan tautan <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-xs">/blog/{slug}</code> belum dipublikasikan atau tautannya telah berubah.</>
            }
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/blog"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Lihat Semua Artikel Blog</span>
          </Link>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Ke Beranda KompresKilat</span>
          </Link>
        </div>
      </div>
    );
  }

  const title = isEn ? post.en!.title : post.title;
  const category = isEn ? post.en!.category : post.category;
  const date = isEn ? post.en!.date : post.date;
  const readTime = isEn ? post.en!.readTime : post.readTime;
  const content = isEn ? post.en!.content : post.content;

  const relatedToolTitle = isEn && post.en?.relatedTool ? post.en.relatedTool.title : post.relatedTool?.title;
  const relatedToolDesc = isEn && post.en?.relatedTool ? post.en.relatedTool.description : post.relatedTool?.description;
  const relatedToolBtn = isEn && post.en?.relatedTool ? post.en.relatedTool.buttonText : post.relatedTool?.buttonText;

  const paragraphs = (content || '').trim().split('\n\n');
  const midPoint = Math.floor(paragraphs.length / 2);

  // Ekstrak heading H2 untuk membuat Daftar Isi (Table of Contents) otomatis pada artikel panjang
  const tableOfContents = useMemo(() => {
    return paragraphs
      .filter((p) => p.trim().startsWith('## '))
      .map((p) => {
        const title = p.trim().replace('## ', '');
        return {
          title,
          id: slugifyHeading(title),
        };
      });
  }, [paragraphs]);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Navigation & Action Bar */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link 
          href="/blog" 
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('blog_back_to_all')}</span>
        </Link>

        {/* Tombol Bagikan Tautan */}
        <button
          onClick={handleCopyLink}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm cursor-pointer"
          title="Bagikan Tautan Artikel"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-semibold">{isEn ? 'Copied!' : 'Tersalin!'}</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{isEn ? 'Share' : 'Bagikan'}</span>
            </>
          )}
        </button>
      </div>

      {/* Article Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2.5">
          <span className="bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold px-2.5 py-0.5 rounded-md border border-indigo-100/70 dark:border-indigo-900/60">
            {category}
          </span>
          <span>•</span>
          <span>{date}</span>
          <span>•</span>
          <span>{readTime} {isEn ? 'read' : 'baca'}</span>
          {isEn && (
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-medium px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/60">
              English Edition
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-3">
          {title}
        </h1>

        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 border-l-2 border-indigo-400 pl-3 py-0.5">
          {isEn ? 'Written by' : 'Oleh'} {post.author} • KompresKilat
        </p>
      </div>

      {/* Daftar Isi Otomatis untuk Artikel Panjang (Table of Contents) */}
      {tableOfContents.length >= 2 && (
        <div className="mb-8 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <AlignLeft className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{isEn ? 'Table of Contents' : 'Daftar Isi Panduan'}</span>
          </div>
          <nav className="space-y-1 text-xs">
            {tableOfContents.map((toc, tIdx) => (
              <a
                key={tIdx}
                href={`#${toc.id}`}
                className="block text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition py-0.5 pl-2 border-l border-slate-200 dark:border-slate-800 hover:border-indigo-500"
              >
                {tIdx + 1}. {toc.title}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Article Content Container */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {paragraphs.map((p, idx) => {
          const trimmed = p.trim();
          const isMidArticle = idx === midPoint;

          return (
            <div key={idx}>
              {/* Heading 2 (##) */}
              {trimmed.startsWith('## ') && (
                <h2
                  id={slugifyHeading(trimmed.replace('## ', ''))}
                  className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white pt-6 pb-2 border-b border-slate-100 dark:border-slate-800 scroll-mt-24"
                >
                  {renderFormattedInlineText(trimmed.replace('## ', ''))}
                </h2>
              )}

              {/* Heading 3 (###) */}
              {trimmed.startsWith('### ') && (
                <h3
                  id={slugifyHeading(trimmed.replace('### ', ''))}
                  className="text-lg md:text-xl font-bold text-slate-900 dark:text-white pt-4 pb-1 border-b border-slate-100 dark:border-slate-800 scroll-mt-24"
                >
                  {renderFormattedInlineText(trimmed.replace('### ', ''))}
                </h3>
              )}

              {/* Heading 4 (####) */}
              {trimmed.startsWith('#### ') && (
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 pt-3">
                  {renderFormattedInlineText(trimmed.replace('#### ', ''))}
                </h4>
              )}

              {trimmed.startsWith('---') && <hr className="my-4 border-slate-200 dark:border-slate-800" />}

              {trimmed.startsWith('```') && (
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto my-3 font-mono">
                  <code>{trimmed.replace(/```[a-z]*\n?/g, '').trim()}</code>
                </pre>
              )}

              {/* List bullet atau nomor */}
              {(trimmed.startsWith('- ') || trimmed.startsWith('1. ') || trimmed.startsWith('* ')) && (
                <ul className="space-y-1.5 pl-5 list-disc marker:text-indigo-500">
                  {trimmed.split('\n').map((line, lIdx) => (
                    <li key={lIdx} className="text-xs md:text-sm text-slate-700 dark:text-slate-300">
                      {renderFormattedInlineText(line.replace(/^[-*]\s+|\d+\.\s+/, ''))}
                    </li>
                  ))}
                </ul>
              )}

              {/* Paragraf Biasa */}
              {!trimmed.startsWith('## ') &&
                !trimmed.startsWith('### ') &&
                !trimmed.startsWith('#### ') &&
                !trimmed.startsWith('---') &&
                !trimmed.startsWith('```') &&
                !trimmed.startsWith('- ') &&
                !trimmed.startsWith('* ') &&
                !trimmed.startsWith('1. ') && (
                  <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {renderFormattedInlineText(trimmed)}
                  </p>
                )}

              {/* Slot Iklan In-Article (Mid-Content) */}
              {isMidArticle && (
                <div className="my-6">
                  <AdBanner zone="mid-article" label={isEn ? 'Sponsored Ad' : 'Iklan'} />
                </div>
              )}
            </div>
          );
        })}

        {/* Call to Action Box to Related Tool */}
        {post.relatedTool && (
          <div className="mt-10 p-6 md:p-8 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-slate-800 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 text-center shadow-sm">
            <span className="text-3xl mb-2 block">{post.relatedTool.icon}</span>
            <h3 className="font-extrabold text-lg text-indigo-950 dark:text-indigo-200 mb-2">
              {relatedToolTitle}
            </h3>
            <p className="text-xs text-indigo-800 dark:text-indigo-300 max-w-md mx-auto mb-5 leading-relaxed">
              {relatedToolDesc}
            </p>
            <Link
              href={post.relatedTool.url}
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-bold py-3 px-6 rounded-xl shadow-md transition duration-200"
            >
              {relatedToolBtn}
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
