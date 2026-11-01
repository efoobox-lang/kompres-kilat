'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

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

        {/* Bottom Section: Copyright & Disclaimer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-3">
          <p>&copy; 2026 KompresKilat. {t('footer_rights')}</p>
          <p className="text-center sm:text-right text-[11px] max-w-lg leading-relaxed">
            {t('footer_disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  );
}
