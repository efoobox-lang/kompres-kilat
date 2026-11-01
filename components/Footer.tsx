'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 sm:mt-20 pt-10 sm:pt-12 pb-14 sm:pb-16 text-slate-600 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-10">
        {/* Kolom 1: Profil Brand (3 Kolom Grid Desktop) */}
        <div className="space-y-3 lg:col-span-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg sm:text-xl font-black text-indigo-600">⚡ KompresKilat</span>
          </div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            {t('footer_desc')}
          </p>
          <p className="text-[10px] text-slate-400">
            {t('footer_privacy_note')}
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
            <span>{t('lang_switch')}:</span>
            <LanguageToggle />
          </div>
        </div>

        {/* Kolom 2: Alat Populer (5 Kolom Grid Desktop - 2 Sub-Kolom Sejajar di Semua Layar Termasuk HP) */}
        <div className="space-y-2 lg:col-span-5">
          <div className="flex items-center justify-center gap-2 mb-2.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-center">
              {t('footer_popular_tools')}
            </h4>
            <span className="text-[10px] text-indigo-600 bg-indigo-50 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
              {t('footer_all_features')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 sm:gap-x-5 gap-y-1.5 text-[11px] sm:text-xs">
            {/* Sub-kolom A: Kompresi, Gambar & Dokumen */}
            <ul className="space-y-1.5 min-w-0">
              <li>
                <Link href="/tools/image" className="hover:text-indigo-600 transition truncate block" title={t('tool_image_title')}>{t('tool_image_title')}</Link>
              </li>
              <li>
                <Link href="/tools/pdf" className="hover:text-indigo-600 transition truncate block" title={t('tool_pdf_title')}>{t('tool_pdf_title')}</Link>
              </li>
              <li>
                <Link href="/tools/remove-bg" className="hover:text-indigo-600 transition truncate block" title={t('tool_bg_title')}>{t('tool_bg_title')}</Link>
              </li>
              <li>
                <Link href="/tools/object-eraser" className="hover:text-indigo-600 transition truncate block" title={t('tool_eraser_title')}>{t('tool_eraser_title')}</Link>
              </li>
              <li>
                <Link href="/tools/resize-pasfoto" className="hover:text-indigo-600 transition truncate block" title={t('tool_resize_pasfoto_title')}>{t('tool_resize_pasfoto_title')}</Link>
              </li>
              <li>
                <Link href="/tools/watermark" className="hover:text-indigo-600 transition truncate block" title={t('tool_watermark_title')}>{t('tool_watermark_title')}</Link>
              </li>
              <li>
                <Link href="/tools/censor-ktp" className="hover:text-emerald-600 transition font-medium text-emerald-700 truncate block" title={t('tool_censor_ktp_title')}>🔒 {t('tool_censor_ktp_title')}</Link>
              </li>
              <li>
                <Link href="/tools/scan-dokumen" className="hover:text-indigo-600 transition font-medium text-indigo-700 truncate block" title={t('tool_smart_scan_title')}>🖨️ {t('tool_smart_scan_title')}</Link>
              </li>
              <li>
                <Link href="/tools/pro-editor" className="hover:text-purple-600 transition font-medium text-purple-700 truncate block" title={t('tool_pro_editor_title')}>🎨 {t('tool_pro_editor_title')}</Link>
              </li>
              <li>
                <Link href="/tools/meme-generator" className="hover:text-amber-600 transition font-medium text-amber-700 truncate block" title={t('tool_meme_title')}>😂 {t('tool_meme_title')}</Link>
              </li>
              <li>
                <Link href="/tools/tanda-tangan" className="hover:text-emerald-600 transition font-medium text-emerald-700 truncate block" title={t('tool_signature_title')}>✍️ {t('tool_signature_title')}</Link>
              </li>
              <li>
                <Link href="/tools/pdf-editor" className="hover:text-indigo-600 transition font-medium text-indigo-700 truncate block" title={t('tool_pdf_editor_title')}>📝 {t('tool_pdf_editor_title')}</Link>
              </li>
              <li>
                <Link href="/tools/pdf-password" className="hover:text-indigo-600 transition font-medium text-indigo-700 truncate block" title={t('tool_pdf_password_title')}>🔐 {t('tool_pdf_password_title')}</Link>
              </li>
              <li>
                <Link href="/tools/pdf-to-word" className="hover:text-indigo-600 transition truncate block" title={t('tool_pdf_word_title')}>{t('tool_pdf_word_title')}</Link>
              </li>
              <li>
                <Link href="/tools/pdf-to-excel" className="hover:text-indigo-600 transition truncate block" title={t('tool_pdf_excel_title')}>{t('tool_pdf_excel_title')}</Link>
              </li>
              <li>
                <Link href="/tools/zip" className="hover:text-indigo-600 transition truncate block" title={t('tool_zip_title')}>{t('tool_zip_title')}</Link>
              </li>
            </ul>

            {/* Sub-kolom B: AI Cerdas, Konversi & Utilitas */}
            <ul className="space-y-1.5 min-w-0">
              <li>
                <Link href="/ai-image-tools" className="hover:text-indigo-600 transition font-medium text-indigo-700 truncate block" title={t('tool_ai_image_title')}>✨ {t('tool_ai_image_title')}</Link>
              </li>
              <li>
                <Link href="/ai-presentation-maker" className="hover:text-indigo-600 transition font-medium text-indigo-700 truncate block" title={t('tool_ai_slide_title')}>📊 {t('tool_ai_slide_title')}</Link>
              </li>
              <li>
                <Link href="/tools/ats-resume" className="hover:text-indigo-600 transition font-medium text-indigo-700 truncate block" title={t('tool_ats_resume_title')}>✨ {t('tool_ats_resume_title')}</Link>
              </li>
              <li>
                <Link href="/tools/document-summarizer" className="hover:text-purple-600 transition font-medium text-purple-700 truncate block" title={t('tool_summarizer_title')}>📚 {t('tool_summarizer_title')}</Link>
              </li>
              <li>
                <Link href="/tools/kalkulator-umkm" className="hover:text-amber-600 transition font-medium text-amber-700 truncate block" title={t('tool_kalkulator_umkm_title')}>🧮 {t('tool_kalkulator_umkm_title')}</Link>
              </li>
              <li>
                <Link href="/tools/file-utility" className="hover:text-indigo-600 transition font-medium text-indigo-700 truncate block" title={t('tool_file_utility_title')}>🔄 {t('tool_file_utility_title')}</Link>
              </li>
              <li>
                <Link href="/tools/poster-generator" className="hover:text-indigo-600 transition truncate block" title={t('tool_poster_title')}>{t('tool_poster_title')}</Link>
              </li>
              <li>
                <Link href="/tools/qr-generator" className="hover:text-indigo-600 transition truncate block" title={t('tool_qr_generator_title')}>{t('tool_qr_generator_title')}</Link>
              </li>
              <li>
                <Link href="/tools/batch-compress" className="hover:text-indigo-600 transition truncate block" title={t('tool_batch_compress_title')}>{t('tool_batch_compress_title')}</Link>
              </li>
              <li>
                <Link href="/tools/tracking" className="hover:text-indigo-600 transition truncate block" title={t('tool_track_title')}>{t('tool_track_title')}</Link>
              </li>
              <li>
                <Link href="/tools/excel-to-csv" className="hover:text-indigo-600 transition truncate block" title={t('tool_excel_csv_title')}>{t('tool_excel_csv_title')}</Link>
              </li>
              <li>
                <Link href="/tools/csv-to-excel" className="hover:text-indigo-600 transition truncate block" title={t('tool_csv_excel_title')}>{t('tool_csv_excel_title')}</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Kolom 3 & 4: Edukasi & Legalitas (Sejajar 2 Kolom di Mobile, 4 Kolom di Desktop) */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-4 lg:grid-cols-2">
          {/* Edukasi & Blog */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">{t('footer_guides')}</h4>
            <ul className="space-y-1.5 text-[11px] sm:text-xs">
              <li>
                <Link href="/blog" className="hover:text-indigo-600 transition block">{t('footer_link_all_blogs')}</Link>
              </li>
              <li>
                <Link href="/blog/cara-kompres-foto-ktp-kurang-dari-500kb" className="hover:text-indigo-600 transition block">{t('footer_link_guide_ktp')}</Link>
              </li>
              <li>
                <Link href="/blog/cara-lacak-paket-shopee-express-spx-akurat" className="hover:text-indigo-600 transition block">{t('footer_link_guide_spx')}</Link>
              </li>
              <li>
                <Link href="/blog/arti-status-resi-jne-jnt-sicepat-lengkap" className="hover:text-indigo-600 transition block">{t('footer_link_guide_resi')}</Link>
              </li>
              <li>
                <Link href="/blog/cara-memperkecil-ukuran-pdf-tugas-kuliah" className="hover:text-indigo-600 transition block">{t('footer_link_guide_pdf')}</Link>
              </li>
            </ul>
          </div>

          {/* Legalitas & Kepatuhan AdSense */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">{t('footer_policies')}</h4>
            <ul className="space-y-1.5 text-[11px] sm:text-xs">
              <li>
                <Link href="/privacy-policy" className="hover:text-indigo-600 transition block">{t('footer_policy_privacy')}</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-600 transition block">{t('footer_policy_terms')}</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-indigo-600 transition block">{t('footer_policy_about')}</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-600 transition block">{t('footer_policy_contact')}</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
        <p>&copy; 2026 KompresKilat. {t('footer_rights')}</p>
        <p className="text-center sm:text-right text-[10px]">
          {t('footer_disclaimer')}
        </p>
      </div>
    </footer>
  );
}
