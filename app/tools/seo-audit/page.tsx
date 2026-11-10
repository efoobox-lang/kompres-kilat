'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import { jsPDF } from 'jspdf';
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  ExternalLink,
  ChevronDown,
  Sparkles,
  HelpCircle,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Globe,
  Lock,
  Smartphone,
  Gauge,
  Layers,
  FileText,
  ImageIcon,
  Printer
} from 'lucide-react';
import type { AuditResult } from '@/app/api/seo-audit/route';

export default function SeoAuditPage() {
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [scanStepText, setScanStepText] = useState<string>('');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pass' | 'warning' | 'fail'>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Preset URL Populer untuk Pengujian Cepat
  const PRESET_URLS = [
    'kompreskilat.site',
    'kemkes.go.id',
    'bkn.go.id',
    'wikipedia.org',
  ];

  const handleStartAudit = async (urlToScan?: string) => {
    const raw = (urlToScan || targetUrl).trim();
    if (!raw) {
      setErrorMessage('Harap ketik alamat website atau pilih contoh URL di bawah.');
      return;
    }

    setTargetUrl(raw);
    setIsLoading(true);
    setErrorMessage('');
    setAuditResult(null);

    // Visual Multi-Step Scanner Animation
    setScanStep(1);
    setScanStepText('Memeriksa handshake SSL/TLS & protokol keamanan domain...');

    const stepTimer1 = setTimeout(() => {
      setScanStep(2);
      setScanStepText('Menganalisis metadata HTML, Tag Title, Meta Description & Heading...');
    }, 900);

    const stepTimer2 = setTimeout(() => {
      setScanStep(3);
      setScanStepText('Menghitung atribut Alt gambar, viewport mobile & waktu respon...');
    }, 1800);

    const stepTimer3 = setTimeout(() => {
      setScanStep(4);
      setScanStepText('Mengompilasi skor kesehatan website & rekomendasi tindakan...');
    }, 2700);

    try {
      const res = await fetch('/api/seo-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: raw }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal melakukan audit pada website tersebut.');
      }

      // Tunggu hingga animasi step selesai minimal 3 detik untuk efek visual mulus
      setTimeout(() => {
        setAuditResult(json.data);
        setIsLoading(false);
      }, 3100);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsLoading(false);
      setErrorMessage(
        err.message || 'Terjadi gangguan jaringan saat memindai situs. Harap periksa URL dan coba lagi.'
      );
    }
  };

  // Unduh Laporan PDF Resmi via jsPDF
  const handleExportPdf = () => {
    if (!auditResult) return;
    setIsExportingPdf(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // Header Banner
      doc.setFillColor(30, 41, 59); // Slate-800
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('KOMPRESKILAT.SITE - LAPORAN AUDIT KESEHATAN & SEO WEBSITE', 14, 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(
        `Waktu Audit: ${auditResult.scanTime}  |  Standar: Google Search Essentials & AdSense Health Check`,
        14,
        21
      );

      // Section 1: Info Ringkasan Domain & Skor
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('RINGKASAN SKOR KESEHATAN SITUS', 14, 38);

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 42, pageWidth - 28, 30, 2, 2, 'FD');

      doc.setFontSize(9);
      doc.text(`Domain Target: ${auditResult.domain}`, 18, 50);
      doc.text(`URL Penuh: ${auditResult.url}`, 18, 56);
      doc.text(`Status Protokol: ${auditResult.metrics.isHttps ? 'HTTPS (Aman / Terenkripsi SSL)' : 'HTTP (Tidak Terenkripsi)'}`, 18, 62);
      doc.text(`Waktu Respon Awal: ${auditResult.metrics.responseTimeMs} ms  |  Bobot HTML: ${auditResult.metrics.pageSizeKb} KB`, 18, 68);

      // Skor Besar di sisi kanan kartu
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229);
      doc.text(`${auditResult.overallScore}%`, pageWidth - 45, 55);
      doc.setFontSize(9);
      doc.text(`GRADE ${auditResult.grade}`, pageWidth - 42, 63);

      // Section 2: 4 Pilar Kategori
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('SKOR 4 PILAR UTAMA:', 14, 80);

      const pillars = [
        { label: 'On-Page SEO', score: `${auditResult.categoryScores.seo}%` },
        { label: 'Keamanan (Security)', score: `${auditResult.categoryScores.security}%` },
        { label: 'Performa (Speed)', score: `${auditResult.categoryScores.performance}%` },
        { label: 'Mobile-Friendly', score: `${auditResult.categoryScores.mobile}%` },
      ];

      let pillX = 14;
      const pillWidth = (pageWidth - 28 - 9) / 4;
      for (const p of pillars) {
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(pillX, 84, pillWidth, 14, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(p.label, pillX + 3, 90);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(p.score, pillX + 3, 95);
        pillX += pillWidth + 3;
      }

      // Section 3: Rekomendasi Tindakan Teratas
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('REKOMENDASI PRIORITAS PERBAIKAN:', 14, 106);

      let recY = 112;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      for (let i = 0; i < Math.min(auditResult.recommendations.length, 4); i++) {
        const rec = auditResult.recommendations[i];
        doc.setTextColor(220, 38, 38);
        doc.text(`[${rec.priority.toUpperCase()}]`, 14, recY);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text(`${rec.title}:`, 30, recY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const splitAction = doc.splitTextToSize(rec.action, pageWidth - 45);
        doc.text(splitAction, 30, recY + 4);
        recY += 12;
      }

      // Section 4: Ringkasan Checklist Parameter
      recY += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('DAFTAR PARAMETER PEMERIKSAAN DETAIL:', 14, recY);
      recY += 6;

      doc.setFontSize(7.5);
      for (let j = 0; j < Math.min(auditResult.checks.length, 10); j++) {
        const chk = auditResult.checks[j];
        const statusBadge = chk.status === 'pass' ? '[PASS]' : chk.status === 'warning' ? '[WARN]' : '[FAIL]';
        const statusColor = chk.status === 'pass' ? [16, 185, 129] : chk.status === 'warning' ? [245, 158, 11] : [239, 68, 68];

        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.text(statusBadge, 14, recY);

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text(chk.title, 28, recY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        const descLines = doc.splitTextToSize(chk.description, pageWidth - 44);
        doc.text(descLines, 28, recY + 3.5);

        recY += 9;
      }

      // Footer Dokumen PDF
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 280, pageWidth - 14, 280);

      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('KompresKilat.site - All-in-One Digital Productivity, AI & Document Suite', 14, 285);
      doc.text('Dokumen ini dihasilkan secara otomatis dan dapat diverifikasi secara berkala.', 14, 289);

      doc.save(`KompresKilat-Audit-${auditResult.domain}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Gagal mengekspor PDF. Silakan coba kembali.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // FAQ Data untuk Konten Editorial & Schema JSON-LD
  const auditFaqItems = [
    {
      q: 'Apa itu Website SEO, Health & Security Audit Checker di KompresKilat?',
      a: 'Ini adalah perkakas analisis web otomatis yang memindai kepatuhan SEO On-Page (Title, Meta Description, Heading H1/H2, Alt Tag), keandalan enkripsi SSL/HTTPS, kecepatan respon server, serta responsivitas mobile dalam satu laporan terpadu.',
    },
    {
      q: 'Mengapa audit SEO dan kesehatan situs sangat penting untuk persetujuan Google AdSense?',
      a: 'Google AdSense memiliki kebijakan ketat terkait "Konten tanpa manfaat" (Low-Value Content) dan pengalaman pengguna (User Experience). Situs yang tidak memiliki tag meta deskripsi yang jelas, lambat dimuat, atau tidak responsif di smartphone kerap kali ditolak atau dibatasi penayangan iklannya oleh tim peninjau Google.',
    },
    {
      q: 'Bagaimana cara memperbaiki skor audit yang rendah pada bagian On-Page SEO?',
      a: 'Langkah termudah adalah: (1) Pastikan setiap halaman memiliki tepat 1 tag <h1>, (2) Tulis meta description yang menarik antara 120-160 karakter, (3) Tambahkan atribut alt pada setiap elemen gambar, dan (4) Optimalkan ukuran file gambar menggunakan alat Kompres Foto KompresKilat agar halaman ringan.',
    },
    {
      q: 'Apakah pemindaian audit website di KompresKilat bersifat gratis dan aman?',
      a: 'Ya, 100% gratis tanpa batasan kuota pemindaian harian. Pemeriksaan dilakukan hanya pada kode publik HTML dan header respon web tanpa memodifikasi sistem atau mengakses data privat server target.',
    },
    {
      q: 'Bagaimana cara membaca pratinjau cuplikan Google SERP Preview?',
      a: 'SERP Preview mensimulasikan bagaimana judul halaman, URL breadcrumb, dan deskripsi situs Anda akan ditampilkan di halaman hasil pencarian Google. Jika teks judul atau deskripsi Anda terpotong (...), Anda dapat langsung merampingkannya sesuai rekomendasi karakter.',
    },
  ];

  const faqSchemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: auditFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  const filteredChecks = auditResult?.checks.filter((chk) => {
    if (activeFilter === 'all') return true;
    return chk.status === activeFilter;
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors">
      <Navbar />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* ============================================================ */}
        {/* 1. HEADER HERO SECTION                                       */}
        {/* ============================================================ */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs px-3.5 py-1.5 rounded-full font-bold mb-3 shadow-2xs">
            <Gauge className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Website SEO, Health &amp; Security Audit Checker</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Audit Kesehatan SEO, Keamanan &amp; Performa Website
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Periksa skor On-Page SEO, validasi SSL/HTTPS, kecepatan respon server, responsivitas mobile, dan pratinjau SERP Google secara instan dan 100% gratis.
          </p>
        </div>

        {/* ============================================================ */}
        {/* 2. FORM PENCARIAN / INPUT URL & PRESET CHIPS                  */}
        {/* ============================================================ */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 space-y-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Masukkan Alamat Website yang Ingin Diaudit:
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleStartAudit()}
                placeholder="https://example.com atau domainanda.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono transition"
              />
            </div>

            <button
              type="button"
              onClick={() => handleStartAudit()}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-2xl transition duration-150 shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Memindai...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Mulai Audit Website ⚡</span>
                </>
              )}
            </button>
          </div>

          {/* Preset Contoh URL Cepat */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">Contoh Cepat:</span>
            {PRESET_URLS.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => handleStartAudit(url)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition text-[11px] font-mono cursor-pointer border border-slate-200/80 dark:border-slate-700/60"
              >
                {url}
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-2xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 3. MULTI-STEP SCANNER LOADING STATE                          */}
        {/* ============================================================ */}
        {isLoading && (
          <div className="p-8 sm:p-12 bg-white dark:bg-slate-900 rounded-3xl border border-indigo-100 dark:border-indigo-950/70 shadow-sm text-center space-y-6 mb-10 animate-in fade-in duration-200">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-950/70 animate-ping opacity-75" />
              <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl shadow-lg">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Memindai {targetUrl}...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {scanStepText}
              </p>
            </div>

            {/* Step Progress Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-xl mx-auto pt-2 text-[11px] font-semibold">
              <div
                className={`p-2 rounded-xl border transition ${
                  scanStep >= 1
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                1. SSL &amp; Keamanan
              </div>
              <div
                className={`p-2 rounded-xl border transition ${
                  scanStep >= 2
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                2. On-Page &amp; Meta
              </div>
              <div
                className={`p-2 rounded-xl border transition ${
                  scanStep >= 3
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                3. Speed &amp; Mobile
              </div>
              <div
                className={`p-2 rounded-xl border transition ${
                  scanStep >= 4
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                4. Skor Akhir
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. AUDIT DASHBOARD RESULTS                                   */}
        {/* ============================================================ */}
        {auditResult && !isLoading && (
          <div className="space-y-8 mb-12 animate-in fade-in duration-300">
            {/* Top Bar: Target Domain & Export Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Hasil Audit Terverifikasi
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🌐 {auditResult.domain}</span>
                  <a
                    href={auditResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Kunjungi</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dipindai pada {auditResult.scanTime} • Status:{' '}
                  <b className="text-emerald-600 dark:text-emerald-400">Aktif &amp; Terjangkau</b>
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl transition duration-150 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isExportingPdf ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyusun PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Laporan PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Score Highlight Grid (Hero Meter + 4 Pillars) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Kolom 1: Skor Keseluruhan (Overall Score Gauge) */}
              <div className="md:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Skor Kesehatan Umum
                  </span>
                  <h3 className="text-lg font-bold">Overall Health &amp; SEO Score</h3>
                </div>

                <div className="my-6 flex items-center justify-center gap-6">
                  {/* Circular Score Visual */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="text-white/10 stroke-current"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="text-emerald-400 stroke-current transition-all duration-1000 ease-out"
                        strokeWidth="10"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * auditResult.overallScore) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black">{auditResult.overallScore}</span>
                      <span className="text-[10px] font-semibold text-indigo-200">/ 100</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <span className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold rounded-xl">
                      GRADE {auditResult.grade}
                    </span>
                    <p className="text-xs text-slate-300">
                      {auditResult.overallScore >= 80
                        ? 'Situs berada dalam kondisi prima dan memenuhi standar Google.'
                        : 'Ditemukan beberapa parameter penting yang perlu diperbaiki.'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Waktu Respon: {auditResult.metrics.responseTimeMs} ms</span>
                  <span>Bobot HTML: {auditResult.metrics.pageSizeKb} KB</span>
                </div>
              </div>

              {/* Kolom 2: 4 Pilar Kategori Skor (7 Kolom) */}
              <div className="md:col-span-7 grid grid-cols-2 gap-4">
                {/* Pilar 1: On-Page SEO */}
                <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                      {auditResult.categoryScores.seo}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      SEO On-Page
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Title, Meta Deskripsi, Heading H1 &amp; Alt Tag.
                    </p>
                  </div>
                </div>

                {/* Pilar 2: Keamanan */}
                <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {auditResult.categoryScores.security}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Keamanan &amp; SSL
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Enkripsi HTTPS, HSTS &amp; Proteksi Clickjacking.
                    </p>
                  </div>
                </div>

                {/* Pilar 3: Performa */}
                <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
                      <Gauge className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                      {auditResult.categoryScores.performance}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Kecepatan Akses
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Respon server {auditResult.metrics.responseTimeMs} ms &amp; bobot data.
                    </p>
                  </div>
                </div>

                {/* Pilar 4: Mobile */}
                <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400">
                      <Smartphone className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                      {auditResult.categoryScores.mobile}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Mobile Layout
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Viewport meta tag &amp; tata letak layar ponsel.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google SERP Preview Simulation */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔍</span> Simulasi Tampilan Google Search (SERP Preview)
                </span>
                <span className="text-[11px] text-slate-400">Pratinjau Hasil Pencarian Organik</span>
              </div>

              {/* Box SERP ala Google Desktop & Mobile */}
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 max-w-2xl font-sans space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 truncate">
                  <div className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[9px] font-bold text-indigo-700">
                    ⚡
                  </div>
                  <span className="font-medium truncate">{auditResult.domain}</span>
                  <span className="text-slate-400">&rsaquo;</span>
                  <span className="text-slate-400 truncate">{auditResult.url}</span>
                </div>

                <h3 className="text-base sm:text-lg font-medium text-indigo-700 dark:text-sky-400 hover:underline cursor-pointer leading-snug pt-0.5">
                  {auditResult.serpPreview.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {auditResult.serpPreview.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                <span>Panjang Judul: <b>{auditResult.metrics.titleLength} / 60 karakter</b></span>
                <span>•</span>
                <span>Panjang Deskripsi: <b>{auditResult.metrics.metaDescriptionLength} / 160 karakter</b></span>
              </div>
            </div>

            {/* Checklist Hasil Parameter Audit */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Daftar Parameter Audit Detail
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total {auditResult.checks.length} aspek teknis diperiksa.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Semua ({auditResult.checks.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('pass')}
                    className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      activeFilter === 'pass'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    Lolos
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('warning')}
                    className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      activeFilter === 'warning'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    Peringatan
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('fail')}
                    className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      activeFilter === 'fail'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-red-700 dark:text-red-400'
                    }`}
                  >
                    Masalah
                  </button>
                </div>
              </div>

              {/* List of Filtered Checks */}
              <div className="space-y-3">
                {filteredChecks && filteredChecks.length > 0 ? (
                  filteredChecks.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3.5 transition"
                    >
                      <div className="mt-0.5 shrink-0">
                        {item.status === 'pass' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                        {item.status === 'warning' && (
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                        )}
                        {item.status === 'fail' && (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {item.title}
                          </h4>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              item.status === 'pass'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : item.status === 'warning'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {item.description}
                        </p>

                        {item.recommendation && (
                          <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 font-medium">
                            💡 <b>Rekomendasi Perbaikan:</b> {item.recommendation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-slate-400">
                    Tidak ada parameter pada kategori filter ini.
                  </p>
                )}
              </div>
            </div>

            {/* Rekomendasi Tindakan & Pintasan Alat Terkait (Cross-Solution Shortcuts) */}
            <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/60 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Rekomendasi Tindakan Cepat &amp; Alat Pendukung KompresKilat
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <Link
                  href="/tools/image"
                  className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 shadow-2xs transition group"
                >
                  <span className="text-xl mb-1 block">🖼️</span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                    Kompres Gambar Web
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Kecilkan resolusi gambar banner dan logo agar waktu pemuatan Core Web Vitals melonjak cepat.
                  </p>
                </Link>

                <Link
                  href="/tools/pdf"
                  className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 shadow-2xs transition group"
                >
                  <span className="text-xl mb-1 block">📄</span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                    Kompres Dokumen PDF
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Ringankan berkas katalog produk atau modul agar pengunjung dapat mengunduh tanpa jeda lama.
                  </p>
                </Link>

                <Link
                  href="/tools/qr-generator"
                  className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 shadow-2xs transition group"
                >
                  <span className="text-xl mb-1 block">📱</span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                    QR Code Akses Cepat
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Buat kode QR beresolusi tinggi untuk mengarahkan pengguna smartphone langsung ke landing page.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 5. SLOT IKLAN KEPATUHAN GOOGLE ADSENSE                       */}
        {/* ============================================================ */}
        <div className="my-10">
          <AdBanner zone="in-tool" label="Iklan" />
        </div>

        {/* ============================================================ */}
        {/* 6. PANDUAN EDITORIAL (AdSense High-Value Content, >= 300 kata) */}
        {/* ============================================================ */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs px-3 py-1 rounded-full font-bold mb-3">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Panduan Kepatuhan Teknis &amp; Search Essentials</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Pentingnya Audit SEO &amp; Kesehatan Situs untuk Menghindari Isu Low-Value Content
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Dalam ekosistem penayangan iklan digital seperti <b>Google AdSense</b> dan perayapan mesin pencari <b>Google Search Essentials</b>, kualitas teknis sebuah situs web memiliki bobot penilaian yang sama pentingnya dengan isi artikel tulisan. Situs web yang mengalami masalah teknis dasar seperti tidak memiliki meta deskripsi, struktur judul heading yang acak-acakan, gambar tanpa atribut teks alternatif (*alt text*), atau waktu respon server (*Time to First Byte / TTFB*) yang lambat kerap kali diklasifikasikan ke dalam kategori <b>&quot;Konten tanpa manfaat&quot; (*Low-Value Content*)</b> atau <b>&quot;Situs web dalam perbaikan&quot;</b>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <span className="text-xl block">🏷️</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Hierarki On-Page SEO</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Tag Title berkarakter 40-60 huruf dan meta description terarah membantu bot Google memahami relevansi topik secara instan.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <span className="text-xl block">🔒</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Kepercayaan SSL / HTTPS</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Sertifikat SSL dan header keamanan (HSTS) memberikan sinyal kepercayaan mutlak (E-E-A-T) bagi pengunjung dan pengiklan AdSense.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <span className="text-xl block">⚡</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Core Web Vitals Cepat</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Ukuran dokumen HTML yang ramping dan kompresi aset gambar mencegah pengunjung membatalkan kunjungan (*bounce rate* rendah).
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Langkah Rutin Memelihara Kesehatan Teknis Website:
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>
                <strong>Verifikasi Tag Heading:</strong> Pastikan setiap halaman hanya memiliki satu tag &lt;h1&gt; untuk judul topik utama. Gunakan &lt;h2&gt; dan &lt;h3&gt; untuk bab pembahasan secara runtut.
              </li>
              <li>
                <strong>Lengkapi Alt Tag Seluruh Gambar:</strong> Berikan deskripsi yang jelas pada gambar agar halaman memenuhi standar aksesibilitas web W3C dan terindeks di pencarian gambar.
              </li>
              <li>
                <strong>Periksa Pratinjau SERP:</strong> Pastikan judul dan deskripsi halaman tidak melebihi batas piksel pencarian Google agar tidak terpotong elipsis (...).
              </li>
              <li>
                <strong>Pantau Ketersediaan Server Secara Berkala:</strong> Lakukan audit rutin setiap kali melakukan pembaruan tema atau merilis fitur baru untuk memastikan tidak ada tautan rusak (*broken links*).
              </li>
            </ol>
          </div>

          {/* ============================================================ */}
          {/* FAQ Accordion Section                                        */}
          {/* ============================================================ */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Pertanyaan yang Sering Diajukan Seputar Audit Website (FAQ)
              </h3>
            </div>

            {auditFaqItems.map((item, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-slate-800 dark:text-slate-200 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer gap-3"
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
        </div>
      </section>

      {/* JSON-LD Schema untuk FAQPage */}
      <JsonLd data={faqSchemaData} />

      <Footer />
    </main>
  );
}
