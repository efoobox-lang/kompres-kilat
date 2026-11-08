'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-50/90 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 mt-16 sm:mt-24 pt-12 sm:pt-14 pb-12 sm:pb-14 text-slate-600 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main Grid Layout: 12 Kolom Desktop, 2 Kolom Tablet, 1 Kolom Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-10">
          {/* Kolom 1: Profil Brand (4 Kolom Grid Desktop) */}
          <div className="space-y-3.5 lg:col-span-4 text-left">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-black text-indigo-600 dark:text-indigo-400 text-xl tracking-tight"
            >
              <span className="text-2xl">⚡</span>
              <span>KompresKilat</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs sm:text-[13px] max-w-sm">
              {t('footer_desc')}
            </p>
            <div className="inline-flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <span>{t('footer_privacy_note')}</span>
            </div>

            {/* Media Sosial Resmi KompresKilat */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Media Sosial Resmi
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://www.instagram.com/kompreskilat/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-amber-500/10 hover:from-pink-500/20 hover:to-amber-500/20 border border-pink-500/30 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 text-xs font-semibold transition group shadow-2xs"
                  title="Ikuti Instagram @kompreskilat"
                >
                  <svg className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>@kompreskilat</span>
                </a>

                <a
                  href="https://www.facebook.com/1411463522052642"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-semibold transition group shadow-2xs"
                  title="Ikuti Halaman Facebook Kompres Kilat"
                >
                  <svg className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Kompres Kilat</span>
                </a>

                <a
                  href="https://www.youtube.com/@kompreskilat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs font-semibold transition group shadow-2xs"
                  title="Langganan YouTube @kompreskilat"
                >
                  <svg className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>@kompreskilat</span>
                </a>
              </div>
            </div>
          </div>

          {/* Kolom 2: Alat Populer (4 Kolom Grid Desktop - 2 Sub-kolom x 5 item seimbang) */}
          <div className="space-y-3 lg:col-span-4">
            <div className="flex items-center justify-between gap-2 pb-0.5">
              <h4 className="font-bold text-slate-900 dark:text-slate-200 text-xs sm:text-sm uppercase tracking-wider">
                {t('footer_popular_tools')}
              </h4>
              <Link
                href="/#tools"
                className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 font-semibold px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/60 transition"
              >
                {t('footer_all_features')}
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm">
              {/* Sub-kolom A: 5 Tools Dokumen & Citra */}
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/tools/image"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                  >
                    {t('tool_image_title')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/pdf"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                  >
                    {t('tool_pdf_title')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/remove-bg"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                  >
                    {t('tool_bg_title')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/object-eraser"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                  >
                    {t('tool_eraser_title')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/pdf-merge"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    Penggabung PDF
                  </Link>
                </li>
              </ul>

              {/* Sub-kolom B: 5 Tools AI & Utilitas Terpopuler */}
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/ai-image-tools"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    ✨ {t('tool_ai_image_title')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ai-presentation-maker"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate font-medium text-purple-600 dark:text-purple-400"
                  >
                    📊 {t('tool_ai_slide_title')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/pdf-editor"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                  >
                    📝 {t('tool_pdf_editor_title')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/ats-resume"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                  >
                    📄 {t('tool_ats_resume_title')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/tracking"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                  >
                    📦 {t('tool_track_title')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Kolom 3 & 4: Panduan & Kebijakan (Sejajar 2 Kolom di Tablet & Desktop) */}
          <div className="grid grid-cols-2 gap-6 lg:col-span-4 lg:grid-cols-2">
            {/* Kolom 3: Panduan & Edukasi (2 Kolom Desktop) */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-200 text-xs sm:text-sm uppercase tracking-wider">
                {t('footer_guides')}
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block"
                  >
                    {t('footer_link_all_blogs')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog/cara-kompres-foto-ktp-kurang-dari-500kb"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block"
                  >
                    {t('footer_link_guide_ktp')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog/cara-lacak-paket-shopee-express-spx-akurat"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block"
                  >
                    {t('footer_link_guide_spx')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog/arti-status-resi-jne-jnt-sicepat-lengkap"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block"
                  >
                    {t('footer_link_guide_resi')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog/cara-memperkecil-ukuran-pdf-tugas-kuliah"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block"
                  >
                    {t('footer_link_guide_pdf')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kolom 4: Kebijakan & Informasi (2 Kolom Desktop) */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-200 text-xs sm:text-sm uppercase tracking-wider">
                {t('footer_policies')}
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block"
                  >
                    {t('footer_policy_privacy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block"
                  >
                    {t('footer_policy_terms')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block"
                  >
                    {t('footer_policy_about')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block"
                  >
                    {t('footer_policy_contact')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright, Socials, Global Language Selector & Disclaimer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <p>&copy; 2026 KompresKilat. {t('footer_rights')}</p>
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <a
                href="https://www.instagram.com/kompreskilat/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-500 transition-colors inline-flex items-center gap-1"
              >
                <span>Instagram</span>
              </a>
              <span>&bull;</span>
              <a
                href="https://www.facebook.com/1411463522052642"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 transition-colors inline-flex items-center gap-1"
              >
                <span>Facebook</span>
              </a>
              <span>&bull;</span>
              <a
                href="https://www.youtube.com/@kompreskilat"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-500 transition-colors inline-flex items-center gap-1"
              >
                <span>YouTube</span>
              </a>
            </div>
            {/* Global Language Selector (Persis seperti tampilan foto) */}
            <div className="flex items-center">
              <LanguageToggle variant="footer" direction="up" />
            </div>
          </div>
          <p className="text-center md:text-right text-[11px] max-w-lg leading-relaxed">
            {t('footer_disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  );
}
