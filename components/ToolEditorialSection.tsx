'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import {
  BookOpen,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  FileText
} from 'lucide-react';
import {
  getToolEditorialData,
  ToolEditorialData,
  HowToStep,
  FaqItem,
  BenefitCard
} from '@/lib/tools-content-catalog';
import { ALL_TOOLS } from '@/lib/tools-data';
import { BLOG_POSTS } from '@/lib/blog-data';

export interface ToolEditorialSectionProps {
  toolId: string;
  customTitle?: string;
  customIntro?: string;
  customBenefits?: BenefitCard[];
  customHowToSteps?: HowToStep[];
  customFaq?: FaqItem[];
  customRelatedToolIds?: string[];
  customRelatedBlogSlugs?: string[];
  showAdBanner?: boolean;
}

export default function ToolEditorialSection({
  toolId,
  customTitle,
  customIntro,
  customBenefits,
  customHowToSteps,
  customFaq,
  customRelatedToolIds,
  customRelatedBlogSlugs,
  showAdBanner = true,
}: ToolEditorialSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Ambil data editorial dari catalog
  const data: ToolEditorialData = getToolEditorialData(toolId);

  const title = customTitle || data.howToTitle || `Panduan Lengkap & Cara Penggunaan`;
  const intro = customIntro || data.intro;
  const benefits = customBenefits || data.benefits || [];
  const steps = customHowToSteps || data.howToSteps || [];
  const faqItems = customFaq || data.faq || [];
  const relatedToolIds = customRelatedToolIds || data.relatedToolIds || [];
  const relatedBlogSlugs = customRelatedBlogSlugs || data.relatedBlogSlugs || [];

  // Cari sibling tools dari ALL_TOOLS
  const relatedTools = relatedToolIds
    .map((id) => ALL_TOOLS.find((t) => t.id === id || t.href.endsWith(`/${id}`)))
    .filter(Boolean);

  // Cari related blogs dari BLOG_POSTS
  const relatedBlogs = relatedBlogSlugs
    .map((slug) => BLOG_POSTS.find((b) => b.slug === slug))
    .filter(Boolean);

  // Schema.org FAQPage JSON-LD
  const faqSchemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className="w-full">
      {/* ============================================================ */}
      {/* 1. SLOT IKLAN GOOGLE ADSENSE (Jarak Aman Terpisah dari Tombol) */}
      {/* ============================================================ */}
      {showAdBanner && (
        <div className="my-10 sm:my-12">
          <AdBanner zone="in-tool" label="Iklan" />
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. KONTEN EDITORIAL: Panduan Penggunaan & Nilai Manfaat       */}
      {/* ============================================================ */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs px-3 py-1 rounded-full font-bold mb-3">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Panduan Penggunaan &amp; Standar Kualitas</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            {title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {intro}
          </p>
        </div>

        {/* 3 Kartu Keunggulan / Manfaat Utama */}
        {benefits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {benefits.map((b, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2"
              >
                <span className="text-2xl block">{b.icon}</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  {b.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-normal">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Langkah-langkah How-To Terstruktur */}
        {steps.length > 0 && (
          <div className="space-y-3 pt-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{data.howToSubtitle || 'Langkah Mudah Penggunaan:'}</span>
            </h3>
            <div className="space-y-3">
              {steps.map((st) => (
                <div
                  key={st.step}
                  className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {st.step}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {st.title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                      {st.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FAQ Accordion Section                                        */}
        {/* ============================================================ */}
        {faqItems.length > 0 && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Pertanyaan yang Sering Diajukan (FAQ)
              </h3>
            </div>

            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-slate-800 dark:text-slate-200 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer gap-3"
                  aria-expanded={openFaq === idx}
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
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. HUB & SPOKE INTERNAL LINKING: Sibling Tools & Blog Guides */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Sibling Tools Section */}
        {relatedTools.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Alat Utilitas Terkait yang Sering Digunakan:
              </h3>
            </div>
            <div className="space-y-2.5">
              {relatedTools.map((tool) => (
                <Link
                  key={tool!.id}
                  href={tool!.href}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-950/70 hover:border-indigo-200 dark:hover:border-indigo-800 border border-slate-100 dark:border-slate-700/60 transition group flex items-start gap-3"
                >
                  <span className="text-xl shrink-0 p-1 bg-white dark:bg-slate-900 rounded-xl shadow-2xs">
                    {tool!.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition truncate">
                      {tool!.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {tool!.description}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Blog Articles Section */}
        {relatedBlogs.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Artikel Panduan &amp; Edukasi Terkait:
              </h3>
            </div>
            <div className="space-y-2.5">
              {relatedBlogs.map((blog) => (
                <Link
                  key={blog!.slug}
                  href={`/blog/${blog!.slug}`}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-950/70 hover:border-emerald-200 dark:hover:border-emerald-800 border border-slate-100 dark:border-slate-700/60 transition group block"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                      {blog!.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {blog!.readTime}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 transition line-clamp-1">
                    {blog!.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {blog!.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* JSON-LD Schema untuk FAQPage */}
      {faqItems.length > 0 && <JsonLd data={faqSchemaData} />}
    </div>
  );
}
