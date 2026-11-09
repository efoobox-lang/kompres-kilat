'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolEditorialSection, { ToolEditorialSectionProps } from '@/components/ToolEditorialSection';
import { getToolEditorialData, ToolEditorialData } from '@/lib/tools-content-catalog';
import { ShieldCheck, Sparkles } from 'lucide-react';

export interface ToolPageWrapperProps extends Partial<ToolEditorialSectionProps> {
  toolId: string;
  children: React.ReactNode;
  hideHeader?: boolean;
  customH1?: string;
  customTagline?: string;
  customBadge?: string;
  className?: string;
}

/**
 * Standard High-Value Editorial Layout Wrapper for KompresKilat Tools
 *
 * Implements the full editorial hierarchy required for Google AdSense compliance:
 * 1. SEO Header: H1, Badge, Tagline, and rich introductory paragraph (100-150 words).
 * 2. Interactive Tool Widget: Contained cleanly in a modern card container.
 * 3. Safe AdSense Zone: AdBanner placed with generous vertical margins.
 * 4. Structured How-To Guide: 3-5 numbered steps with clear instructions.
 * 5. Interactive FAQ Accordion + Schema.org FAQPage JSON-LD.
 * 6. Hub & Spoke Internal Linking: Sibling tools & related educational blog articles.
 */
export default function ToolPageWrapper({
  toolId,
  children,
  hideHeader = false,
  customH1,
  customTagline,
  customBadge,
  customTitle,
  customIntro,
  customBenefits,
  customHowToSteps,
  customFaq,
  customRelatedToolIds,
  customRelatedBlogSlugs,
  showAdBanner = true,
  className = '',
}: ToolPageWrapperProps) {
  const editorialData: ToolEditorialData = getToolEditorialData(toolId);

  const h1 = customH1 || editorialData.h1;
  const tagline = customTagline || editorialData.tagline;
  const badge = customBadge || editorialData.badge;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      <Navbar />

      <section className={`max-w-5xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full ${className}`}>
        {/* ========================================================== */}
        {/* 1. HEADER SEO (H1, Tagline, Badge & Intro Paragraf)        */}
        {/* ========================================================== */}
        {!hideHeader && (
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-100 dark:border-indigo-900 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>{badge}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {h1}
            </h1>

            {tagline && (
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                {tagline}
              </p>
            )}

            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-900/60 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Privasi 100%: Berkas tidak pernah diunggah atau disimpan ke server luar.</span>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* 2. AREA WIDGET INTERAKTIF ALAT (Interactive Tool Core)     */}
        {/* ========================================================== */}
        <div className="w-full mb-6">
          {children}
        </div>

        {/* ========================================================== */}
        {/* 3. EDITORIAL SECTION: Panduan, FAQ, AdSense, & Hub-Spoke   */}
        {/* ========================================================== */}
        <ToolEditorialSection
          toolId={toolId}
          customTitle={customTitle}
          customIntro={customIntro}
          customBenefits={customBenefits}
          customHowToSteps={customHowToSteps}
          customFaq={customFaq}
          customRelatedToolIds={customRelatedToolIds}
          customRelatedBlogSlugs={customRelatedBlogSlugs}
          showAdBanner={showAdBanner}
        />
      </section>

      <Footer />
    </main>
  );
}
