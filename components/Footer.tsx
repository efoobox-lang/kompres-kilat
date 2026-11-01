'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 mt-20 pt-12 pb-16 text-slate-600 text-xs">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Kolom 1: Profil Brand */}
        <div className="space-y-3 md:col-span-1">
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

        {/* Kolom 2: Alat Online Utama */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">{t('footer_popular_tools')}</h4>
          <ul className="space-y-1.5">
            <li>
              <Link href="/ai-image-tools" className="hover:text-indigo-600 transition font-medium text-indigo-700">✨ AI Photo Enhancer &amp; Upscaler</Link>
            </li>
            <li>
              <Link href="/ai-presentation-maker" className="hover:text-indigo-600 transition font-medium text-indigo-700">📊 AI Presentation Generator (.pptx)</Link>
            </li>
            <li>
              <Link href="/tools/image" className="hover:text-indigo-600 transition">Kompres Gambar KTP / CPNS</Link>
            </li>
            <li>
              <Link href="/tools/remove-bg" className="hover:text-indigo-600 transition">Ganti Background Pas Foto</Link>
            </li>
            <li>
              <Link href="/tools/object-eraser" className="hover:text-indigo-600 transition">Hapus Objek &amp; Watermark</Link>
            </li>
            <li>
              <Link href="/tools/pdf" className="hover:text-indigo-600 transition">Kompres Dokumen PDF</Link>
            </li>
            <li>
              <Link href="/tools/tracking" className="hover:text-indigo-600 transition">Lacak Resi Ekspedisi (SPX, J&T, JNE)</Link>
            </li>
            <li>
              <Link href="/tools/excel-to-csv" className="hover:text-indigo-600 transition">Konverter Excel ke CSV</Link>
            </li>
            <li>
              <Link href="/tools/csv-to-excel" className="hover:text-indigo-600 transition">Konverter CSV ke Excel</Link>
            </li>
            <li>
              <Link href="/tools/pdf-to-excel" className="hover:text-indigo-600 transition">Konversi PDF ke Excel (.xlsx)</Link>
            </li>
            <li>
              <Link href="/tools/poster-generator" className="hover:text-indigo-600 transition">AI Poster &amp; Brosur Studio</Link>
            </li>
            <li>
              <Link href="/tools/zip" className="hover:text-indigo-600 transition">Pembuat Arsip ZIP</Link>
            </li>
            <li>
              <Link href="/tools/pdf-to-word" className="hover:text-indigo-600 transition">Konverter PDF ke Word</Link>
            </li>
            <li>
              <Link href="/tools/resize-pasfoto" className="hover:text-indigo-600 transition">Resize Pas Foto &amp; Tanda Tangan</Link>
            </li>
            <li>
              <Link href="/tools/watermark" className="hover:text-indigo-600 transition">Watermark Dokumen &amp; KTP</Link>
            </li>
            <li>
              <Link href="/tools/qr-generator" className="hover:text-indigo-600 transition">QR Code Generator</Link>
            </li>
            <li>
              <Link href="/tools/batch-compress" className="hover:text-indigo-600 transition">Batch Kompres &amp; ZIP</Link>
            </li>
            <li>
              <Link href="/tools/ats-resume" className="hover:text-indigo-600 transition font-medium text-indigo-700">✨ AI Resume &amp; ATS Reviewer</Link>
            </li>
            <li>
              <Link href="/tools/document-summarizer" className="hover:text-purple-600 transition font-medium text-purple-700">📚 AI Document Summarizer</Link>
            </li>
            <li>
              <Link href="/tools/file-utility" className="hover:text-indigo-600 transition font-medium text-indigo-700">🔄 Utilitas File &amp; Konverter HEIC</Link>
            </li>
          </ul>
        </div>

        {/* Kolom 3: Edukasi & Blog */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">{t('footer_guides')}</h4>
          <ul className="space-y-1.5">
            <li>
              <Link href="/blog" className="hover:text-indigo-600 transition">Semua Artikel Blog</Link>
            </li>
            <li>
              <Link href="/blog/cara-kompres-foto-ktp-kurang-dari-500kb" className="hover:text-indigo-600 transition">Panduan Foto KTP CPNS</Link>
            </li>
            <li>
              <Link href="/blog/cara-lacak-paket-shopee-express-spx-akurat" className="hover:text-indigo-600 transition">Cek Resi Shopee Express</Link>
            </li>
            <li>
              <Link href="/blog/arti-status-resi-jne-jnt-sicepat-lengkap" className="hover:text-indigo-600 transition">Arti Status Resi Logistik</Link>
            </li>
            <li>
              <Link href="/blog/cara-memperkecil-ukuran-pdf-tugas-kuliah" className="hover:text-indigo-600 transition">Kecilkan PDF Tugas Skripsi</Link>
            </li>
          </ul>
        </div>

        {/* Kolom 4: Legalitas & Kepatuhan AdSense */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">{t('footer_policies')}</h4>
          <ul className="space-y-1.5">
            <li>
              <Link href="/privacy-policy" className="hover:text-indigo-600 transition">Kebijakan Privasi (Privacy Policy)</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-indigo-600 transition">Syarat & Ketentuan (Terms of Service)</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-indigo-600 transition">Tentang Kami (About Us)</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-indigo-600 transition">Hubungi Kami (Contact Us)</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
        <p>&copy; 2026 KompresKilat. {t('footer_rights')}</p>
        <p className="text-center sm:text-right text-[10px]">
          Disclaimer: KompresKilat adalah portal utilitas independen dan tidak berafiliasi resmi dengan ekspedisi manapun.
        </p>
      </div>
    </footer>
  );
}
