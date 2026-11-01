'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog-data';
import { useLanguage } from '@/context/LanguageContext';
import AdBanner from '@/components/AdBanner';
import { Globe, ArrowLeft, Share2, Check } from 'lucide-react';

export default function BlogPostClient({ post }: { post: BlogPost }) {
  const { lang, setLang, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Check if active language is English and English translation is available
  const isEn = lang === 'en' && Boolean(post.en);

  const title = isEn ? post.en!.title : post.title;
  const category = isEn ? post.en!.category : post.category;
  const date = isEn ? post.en!.date : post.date;
  const readTime = isEn ? post.en!.readTime : post.readTime;
  const content = isEn ? post.en!.content : post.content;

  const relatedToolTitle = isEn && post.en?.relatedTool ? post.en.relatedTool.title : post.relatedTool?.title;
  const relatedToolDesc = isEn && post.en?.relatedTool ? post.en.relatedTool.description : post.relatedTool?.description;
  const relatedToolBtn = isEn && post.en?.relatedTool ? post.en.relatedTool.buttonText : post.relatedTool?.buttonText;

  const paragraphs = content.trim().split('\n\n');
  const midPoint = Math.floor(paragraphs.length / 2);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link 
          href="/blog" 
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('blog_back_to_all')}</span>
        </Link>

        {/* In-Article Bilingual Language Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-semibold">
          <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
          <button
            type="button"
            onClick={() => setLang('id')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              lang === 'id'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇮🇩 ID
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              lang === 'en'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇬🇧 EN {post.en ? '' : '(ID)'}
          </button>
        </div>
      </div>

      {/* Article Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2.5">
          <span className="bg-indigo-50 text-indigo-600 font-semibold px-2.5 py-0.5 rounded-md border border-indigo-100/70">
            {category}
          </span>
          <span>•</span>
          <span>{date}</span>
          <span>•</span>
          <span>{readTime} {isEn ? 'read' : 'baca'}</span>
          {isEn && (
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded border border-emerald-100">
              English Edition
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight mb-3">
          {title}
        </h1>

        <div className="flex items-center justify-between text-xs md:text-sm text-slate-500 border-l-2 border-indigo-400 pl-3 py-0.5">
          <p>
            {isEn ? 'Written by' : 'Oleh'} {post.author} • KompresKilat
          </p>
          <button
            onClick={handleCopyLink}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition px-2.5 py-1 rounded-lg hover:bg-slate-100"
            title="Bagikan Tautan Artikel"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">{isEn ? 'Copied!' : 'Tersalin!'}</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Share' : 'Bagikan'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Article Content Container */}
      <div className="bg-white p-6 md:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-sm text-slate-700 leading-relaxed">
        {paragraphs.map((p, idx) => {
          const trimmed = p.trim();
          const isMidArticle = idx === midPoint;

          return (
            <div key={idx}>
              {trimmed.startsWith('### ') && (
                <h3 className="text-lg md:text-xl font-bold text-slate-900 pt-4 pb-1 border-b border-slate-100">
                  {trimmed.replace('### ', '')}
                </h3>
              )}
              {trimmed.startsWith('#### ') && (
                <h4 className="text-base font-bold text-slate-800 pt-3">
                  {trimmed.replace('#### ', '')}
                </h4>
              )}
              {trimmed.startsWith('---') && <hr className="my-4 border-slate-200" />}
              {trimmed.startsWith('```') && (
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto my-3 font-mono">
                  <code>{trimmed.replace(/```[a-z]*\n?/g, '').trim()}</code>
                </pre>
              )}
              {(trimmed.startsWith('- ') || trimmed.startsWith('1. ')) && (
                <ul className="space-y-1.5 pl-5 list-disc marker:text-indigo-500">
                  {trimmed.split('\n').map((line, lIdx) => (
                    <li key={lIdx} className="text-xs md:text-sm text-slate-700">
                      {line.replace(/^[-*]\s+|\d+\.\s+/, '')}
                    </li>
                  ))}
                </ul>
              )}
              {!trimmed.startsWith('### ') &&
                !trimmed.startsWith('#### ') &&
                !trimmed.startsWith('---') &&
                !trimmed.startsWith('```') &&
                !trimmed.startsWith('- ') &&
                !trimmed.startsWith('1. ') && (
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                    {trimmed}
                  </p>
                )}

              {/* Slot Iklan In-Article (Mid-Content) */}
              {isMidArticle && (
                <div className="my-6">
                  <AdBanner zone="mid-article" label={isEn ? 'Sponsored Ad' : 'Iklan Sponsor'} />
                </div>
              )}
            </div>
          );
        })}

        {/* Call to Action Box to Related Tool */}
        {post.relatedTool && (
          <div className="mt-10 p-6 md:p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 text-center shadow-sm">
            <span className="text-3xl mb-2 block">{post.relatedTool.icon}</span>
            <h3 className="font-extrabold text-lg text-indigo-950 mb-2">
              {relatedToolTitle}
            </h3>
            <p className="text-xs text-indigo-800 max-w-md mx-auto mb-5 leading-relaxed">
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
