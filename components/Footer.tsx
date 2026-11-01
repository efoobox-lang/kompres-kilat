'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 mt-20 pt-12 pb-16 text-slate-600 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 mb-10">
        {/* Kolom 1: Profil Brand (3 Kolom Grid) */}
        <div className="space-y-3 sm:col-span-2 lg:col-span-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black text-indigo-600">⚡ KompresKilat</span>
          </div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            {t('footer_desc')}
          </p>
          <p className="text-[10px] text-slate-400">
            {t('footer_privacy_note')}
          </p>
          <div className="pt-2">
            <LanguageToggle />
          </div>
        </div>

        {/* Kolom 2: Alat Populer (5 Kolom Grid - Tersusun Rapi 2 Sub-Kolom Sejajar) */}
        <div className="space-y-2 sm:col-span-2 lg:col-span-5">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              {t('footer_popular_tools')}
            </h4>
            <span className="text-[10px] text-indigo-600 bg-indigo-50 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
              Semua Fitur
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5">
            {/* Sub-kolom A: Kompresi, Gambar & Dokumen */}
            <ul className="space-y-1.5">
              <li>
                <Link href="/tools/image" className="hover:text-indigo-600 transition truncate block">Kompres Gambar KTP / CPNS</Link>
              </li>
              <li>
                <Link href="/tools/pdf" className="hover:text-indigo-600 transition truncate block">Kompres Dokumen PDF</Link>
              </li>
              <li>
                <Link href="/tools/remove-bg" className="hover:text-indigo-600 transition truncate block">Ganti Background Pas Foto</Link>
              </li>
              <li>
                <Link href="/tools/object-eraser" className="hover:text-indigo-600 transition truncate block">Hapus Objek &amp; Watermark</Link>
              </li>
              <li>
                <Link href="/tools/resize-pasfoto" className="hover:text-indigo-600 transition truncate block">Resize Pas Foto &amp; TTD</Link>
              </li>
              <li>
                <Link href="/tools/watermark" className="hover:text-indigo-600 transition truncate block">Watermark Dokumen &amp; KTP</Link>
              </li>
              <li>
                <Link href="/tools/censor-ktp" className="hover:text-emerald-600 transition font-medium text-emerald-700 truncate block">🔒 Sensor &amp; Blur KTP</Link>
              </li>
              <li>
                <Link href="/tools/pdf-password" className="hover:text-indigo-600 transition font-medium text-indigo-700 truncate block">🔐 Kunci &amp; Buka Password PDF</Link>
              </li>
              <li>
                <Link href="/tools/pdf-to-word" className="hover:text-indigo-600 transition truncate block">Konverter PDF ke Word</Link>
              </li>
              <li>
                <Link href="/tools/pdf-to-excel" className="hover:text-indigo-600 transition truncate block">Konversi PDF ke Excel (.xlsx)</Link>
              </li>
              <li>
                <Link href="/tools/zip" className="hover:text-indigo-600 transition truncate block">Pembuat Arsip ZIP</Link>
              </li>
            </ul>

            {/* Sub-kolom B: AI Cerdas, Konversi & Utilitas */}
            <ul className="space-y-1.5">
              <li>
                <Link href="/ai-image-tools" className="hover:text-indigo-600 transition font-medium text-indigo-700 truncate block">✨ AI Photo Enhancer</Link>
              </li>
              <li>
                <Link href="/ai-presentation-maker" className="hover:text-indigo-600 transition font-medium text-indigo-700 truncate block">📊 AI Presentation Maker</Link>
              </li>
              <li>
                <Link href="/tools/ats-resume" className="hover:text-indigo-600 transition font-medium text-indigo-700 truncate block">✨ AI Resume &amp; ATS Reviewer</Link>
              </li>
              <li>
                <Link href="/tools/document-summarizer" className="hover:text-purple-600 transition font-medium text-purple-700 truncate block">📚 AI Document Summarizer</Link>
              </li>
              <li>
                <Link href="/tools/kalkulator-umkm" className="hover:text-amber-600 transition font-medium text-amber-700 truncate block">🧮 Kalkulator Bisnis &amp; UMKM</Link>
              </li>
              <li>
                <Link href="/tools/file-utility" className="hover:text-indigo-600 transition font-medium text-indigo-700 truncate block">🔄 Konverter HEIC &amp; WebP</Link>
              </li>
              <li>
                <Link href="/tools/poster-generator" className="hover:text-indigo-600 transition truncate block">AI Poster &amp; Brosur Studio</Link>
              </li>
              <li>
                <Link href="/tools/qr-generator" className="hover:text-indigo-600 transition truncate block">QR Code Generator HD</Link>
              </li>
              <li>
                <Link href="/tools/batch-compress" className="hover:text-indigo-600 transition truncate block">Batch Kompres &amp; ZIP</Link>
              </li>
              <li>
                <Link href="/tools/tracking" className="hover:text-indigo-600 transition truncate block">Lacak Resi (SPX, J&amp;T, JNE)</Link>
              </li>
              <li>
                <Link href="/tools/excel-to-csv" className="hover:text-indigo-600 transition truncate block">Konverter Excel ke CSV</Link>
              </li>
              <li>
                <Link href="/tools/csv-to-excel" className="hover:text-indigo-600 transition truncate block">Konverter CSV ke Excel</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Kolom 3: Edukasi & Blog (2 Kolom Grid) */}
        <div className="space-y-2 lg:col-span-2">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">{t('footer_guides')}</h4>
          <ul className="space-y-1.5">
            <li>
              <Link href="/blog" className="hover:text-indigo-600 transition block">Semua Artikel Blog</Link>
            </li>
            <li>
              <Link href="/blog/cara-kompres-foto-ktp-kurang-dari-500kb" className="hover:text-indigo-600 transition block">Panduan Foto KTP CPNS</Link>
            </li>
            <li>
              <Link href="/blog/cara-lacak-paket-shopee-express-spx-akurat" className="hover:text-indigo-600 transition block">Cek Resi Shopee Express</Link>
            </li>
            <li>
              <Link href="/blog/arti-status-resi-jne-jnt-sicepat-lengkap" className="hover:text-indigo-600 transition block">Arti Status Resi Logistik</Link>
            </li>
            <li>
              <Link href="/blog/cara-memperkecil-ukuran-pdf-tugas-kuliah" className="hover:text-indigo-600 transition block">Kecilkan PDF Tugas Skripsi</Link>
            </li>
          </ul>
        </div>

        {/* Kolom 4: Legalitas & Kepatuhan AdSense (2 Kolom Grid) */}
        <div className="space-y-2 lg:col-span-2">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">{t('footer_policies')}</h4>
          <ul className="space-y-1.5">
            <li>
              <Link href="/privacy-policy" className="hover:text-indigo-600 transition block">Kebijakan Privasi (Privacy Policy)</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-indigo-600 transition block">Syarat &amp; Ketentuan (Terms)</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-indigo-600 transition block">Tentang Kami (About Us)</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-indigo-600 transition block">Hubungi Kami (Contact Us)</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
        <p>&copy; 2026 KompresKilat. {t('footer_rights')}</p>
        <p className="text-center sm:text-right text-[10px]">
          Disclaimer: KompresKilat adalah portal utilitas independen dan tidak berafiliasi resmi dengan ekspedisi manapun.
        </p>
      </div>
    </footer>
  );
}
