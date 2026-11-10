'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import { extractTextFromPdf } from '@/lib/pdf-text-extractor';
import CvTemplatePreview, { CvTemplateType } from '@/components/CvTemplatePreview';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Copy,
  Check,
  ArrowRight,
  Upload,
  RefreshCw,
  Lock,
  Layers,
  HelpCircle,
  ChevronDown,
  Info,
  Palette
} from 'lucide-react';

interface AtsResult {
  atsScore: number;
  rating: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  revisedExperiencePoints: string[];
}

interface PdfMetaInfo {
  fileName: string;
  pageCount: number;
  charCount: number;
  wordCount: number;
  isScanned: boolean;
}

export default function AtsResumePage() {
  const [cvText, setCvText] = useState<string>('');
  const [jobTarget, setJobTarget] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionStage, setExtractionStage] = useState<string>('');
  const [extractionPercent, setExtractionPercent] = useState<number>(0);
  const [pdfMeta, setPdfMeta] = useState<PdfMetaInfo | null>(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'template'>('editor');
  const [selectedTemplate, setSelectedTemplate] = useState<CvTemplateType>('ats');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AtsResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unggah & Ekstraksi Teks PDF 100% Client-Side dengan pdfjs-dist & Tesseract Fallback
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Harap pilih dokumen berformat PDF yang valid (.pdf).');
      return;
    }

    setFileName(file.name);
    setErrorMessage('');
    setIsPasswordProtected(false);
    setPdfMeta(null);
    setIsExtracting(true);
    setExtractionStage('Memulai ekstraksi PDF...');
    setExtractionPercent(10);

    try {
      const extraction = await extractTextFromPdf(file, {
        enableOcrFallback: true,
        ocrLanguages: 'ind+eng',
        maxPages: 10,
        onProgress: (p) => {
          setExtractionStage(p.stage);
          setExtractionPercent(p.percent);
        }
      });

      if (!extraction.success) {
        if (extraction.isPasswordProtected) {
          setIsPasswordProtected(true);
          setErrorMessage('Dokumen PDF ini diproteksi kata sandi (password).');
        } else {
          setErrorMessage(extraction.error || 'Gagal mengekstrak teks dari berkas PDF.');
        }
        return;
      }

      if (!extraction.text.trim()) {
        setErrorMessage(
          'Tidak ada teks yang dapat diekstrak dari PDF. Dokumen mungkin berupa berkas kosong atau gambar berkualitas rendah.'
        );
        return;
      }

      // Berhasil: Masukkan teks bersih ke textarea secara otomatis
      setCvText(extraction.text);
      setPdfMeta({
        fileName: file.name,
        pageCount: extraction.pageCount,
        charCount: extraction.totalChars,
        wordCount: extraction.totalWords,
        isScanned: extraction.isScanned
      });
    } catch (err) {
      console.error('PDF parsing error:', err);
      setErrorMessage(
        'Terjadi kendala saat membaca file PDF. Anda dapat menyalin dan menempel teks CV secara manual ke dalam kotak teks.'
      );
    } finally {
      setIsExtracting(false);
      setExtractionPercent(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvText.trim()) {
      setErrorMessage('Silakan tempel teks CV atau unggah berkas PDF terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setResult(null);

    try {
      const res = await fetch('/api/ai-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cvText,
          action: 'ats-review',
          jobTarget: jobTarget.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setResult(data.data);
      } else {
        setErrorMessage(data.message || 'Gagal menganalisis CV dengan AI.');
      }
    } catch {
      setErrorMessage('Terjadi kendala jaringan saat menghubungi sistem analisis AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAllCv = () => {
    if (!cvText) return;
    navigator.clipboard.writeText(cvText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleLoadSampleCv = () => {
    const sample = `RINGKASAN PROFESIONAL
Digital Marketing Specialist berorientasi data dengan 4+ tahun pengalaman dalam mengelola kampanye Meta Ads, Google Ads, dan strategi SEO organik. Berhasil meningkatkan rasio konversi (CR) e-commerce klien sebesar 38% serta menurunkan Biaya Per Akuisisi (CPA) rata-rata hingga 22% dalam 12 bulan terakhir.

PENGALAMAN KERJA
1. Senior Digital Performance Marketer | PT Inovasi Niaga Digital (2022 - Sekarang)
- Merancang dan mengeksekusi kampanye berbayar lintas channel dengan anggaran bulanan Rp 150.000.000, menghasilkan Return on Ad Spend (ROAS) rata-rata 4.8x.
- Mengimplementasikan pengujian A/B testing pada landing page e-commerce yang meningkatkan conversion rate dari 2.1% menjadi 3.4%.
- Menyusun laporan performa mingguan menggunakan Google Data Studio (Looker Studio) dan Google Analytics 4 (GA4).

2. Social Media & Content Marketing Specialist | Kreatif Media Nusantara (2020 - 2022)
- Mengembangkan konten viral TikTok dan Instagram Reels yang menumbuhkan audiens organik lebih dari 120.000 followers dalam waktu 9 bulan.
- Berkolaborasi dengan 45+ Key Opinion Leaders (KOL) mikro dan makro untuk peluncuran kampanye produk baru.

PENDIDIKAN
Sarjana Ilmu Komunikasi (S.I.Kom) | Universitas Indonesia (2016 - 2020)
IPK: 3.78 / 4.00 (Cum Laude)

KEAHLIAN & TOOLS
- Keahlian Teknis: Google Ads (Search, Display, Performance Max), Meta Ads Manager, GA4, SEO On-Page/Off-Page, SEMrush, Ahrefs, SQL Dasar.
- Keahlian Non-Teknis: Manajemen Tim, Negosiasi KOL, Analisis Tren Pasar, Copywriting Konversi.
- Sertifikasi: Google Ads Search Certified (2024), Meta Certified Digital Marketing Associate.`;

    setCvText(sample);
    setJobTarget('Senior Digital Marketing Specialist');
    setFileName('');
    setPdfMeta(null);
    setErrorMessage('');
  };

  const handleReset = () => {
    setCvText('');
    setJobTarget('');
    setFileName('');
    setPdfMeta(null);
    setResult(null);
    setErrorMessage('');
    setIsPasswordProtected(false);
  };

  const wordCount = (cvText.match(/\S+/g) || []).length;
  const charCount = cvText.length;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Resume / CV Reviewer & ATS Score Checker - KompresKilat',
    description: 'Cek skor kelulusan ATS CV, perbaiki teks pengalaman kerja dengan metrik terukur, dan ekstrak teks PDF 100% lokal di browser tanpa server.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
  };

  const faqs = [
    {
      q: 'Mengapa teks CV dari PDF sebelumnya sering berubah menjadi kode acak (gibberish)?',
      a: 'Berkas PDF menyimpan teks dalam bentuk stream biner yang terkompresi algoritma FlateDecode atau memiliki pengkodean font kustom. Jika dibaca sebagai teks biasa, hasilnya menjadi deretan simbol biner tak terbaca. Fitur kami kini menggunakan engine parser standar pdfjs-dist yang membaca lapisan teks asli per halaman serta merekonstruksi susunan baris dan spasi secara presisi.'
    },
    {
      q: 'Apa yang terjadi jika saya mengunggah CV hasil scan atau foto gambar?',
      a: 'Jika berkas PDF tidak memiliki lapisan teks digital (misalnya diekspor dari aplikasi desain grafis sebagai gambar datar atau hasil scan kamera fisik), sistem secara otomatis mengaktifkan modul OCR (Optical Character Recognition) beresolusi 2x di memori browser untuk membaca huruf pada gambar dan mengonversinya menjadi teks rapi.'
    },
    {
      q: 'Apakah isi CV dan data pribadi saya aman?',
      a: 'Sangat aman. Proses pembacaan berkas PDF, rendering halaman, dan ekstraksi teks dilakukan 100% di memori browser lokal perangkat Anda tanpa pernah diunggah atau disimpan di server penyimpan file.'
    },
    {
      q: 'Bagaimana cara memaksimalkan skor ATS (Applicant Tracking System)?',
      a: 'Gunakan struktur kronologis satu kolom yang bersih, sertakan kata kunci relevan sesuai deskripsi pekerjaan (Job Description), hindari grafik berlebihan yang tidak terbaca mesin, dan tulis pencapaian kerja dengan format metrik terukur (misal: "Meningkatkan penjualan sebesar 25% dalam 6 bulan").'
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <JsonLd data={schema} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold mb-2">
            ✨ AI Career Assistant • ATS Checker 2026
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
            AI Resume / CV Reviewer &amp; ATS Score Checker
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Audit skor kompatibilitas ATS CV Anda secara instan. Ekstraksi teks PDF 100% lokal tanpa gibberish, deteksi kata kunci yang hilang, dan dapatkan saran poin pengalaman kerja berbasis formula metrik.
          </p>
        </div>

        {/* Mode Switch Tabs: Editor Teks & Audit ATS vs Pilihan Template CV */}
        <div className="flex items-center justify-center gap-2 mb-6 p-1.5 bg-slate-200/80 rounded-2xl max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Editor &amp; Audit ATS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('template')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer relative ${
              activeTab === 'template'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Pilihan Template CV</span>
            <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">3 Layout</span>
          </button>
        </div>

        {/* Tab 2: Pilihan Template CV (Live Preview 3 Layout) */}
        {activeTab === 'template' && (
          <div className="mb-8">
            <CvTemplatePreview
              cvText={cvText}
              onCvTextChange={setCvText}
              template={selectedTemplate}
              onTemplateChange={setSelectedTemplate}
              onLoadSample={handleLoadSampleCv}
              initialPhotoUrl={photoUrl}
              onPhotoChange={setPhotoUrl}
            />
          </div>
        )}

        {/* Tab 1: Editor Teks & Analisis Skor ATS */}
        {activeTab === 'editor' && (
          <>
            {/* Form Input CV & Upload */}
            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Posisi Pekerjaan (Opsional):
              </label>
              <input
                type="text"
                placeholder="Contoh: Digital Marketing Specialist, Staff Administrasi BUMN, Data Analyst..."
                value={jobTarget}
                onChange={(e) => setJobTarget(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <div className="flex flex-wrap justify-between items-center gap-2 mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Isi Teks CV / Resume:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSampleCv}
                    className="text-[11px] text-slate-500 hover:text-indigo-600 font-medium underline underline-offset-2 cursor-pointer"
                  >
                    Gunakan Contoh CV
                  </button>
                  <span className="text-slate-300">|</span>
                  <label className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{fileName ? `Ganti PDF (${fileName.length > 20 ? fileName.substring(0, 18) + '...' : fileName})` : 'Unggah File PDF'}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      disabled={isExtracting}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Status Ekstraksi PDF Loading Bar */}
              {isExtracting && (
                <div className="mb-3 p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-indigo-900 font-semibold">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      <span>{extractionStage}</span>
                    </span>
                    <span className="text-[11px] font-mono text-indigo-700">{extractionPercent}%</span>
                  </div>
                  <div className="w-full bg-indigo-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(5, extractionPercent)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Metadata Berkas PDF Terbaca */}
              {pdfMeta && !isExtracting && (
                <div className="mb-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Dokumen <b>{pdfMeta.fileName}</b> berhasil diekstrak ({pdfMeta.pageCount} Halaman, {pdfMeta.wordCount} kata)
                    </span>
                  </div>
                  {pdfMeta.isScanned ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold text-[10px]">
                      Pindaian (OCR)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                      Teks Digital Native
                    </span>
                  )}
                </div>
              )}

              {/* Password Protected Warning */}
              {isPasswordProtected && (
                <div className="mb-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Dokumen PDF Terkunci Password</p>
                    <p className="text-[11px] text-amber-800">
                      Berkas dilindungi kata sandi sehingga teksnya tidak dapat dibaca. Anda dapat membuka enkripsinya terlebih dahulu melalui menu{' '}
                      <Link href="/tools/pdf-password" className="text-indigo-600 font-bold underline hover:text-indigo-800">
                        Buka Password PDF
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              )}

              {/* Textarea dengan Live Preview */}
              <div className="relative">
                <textarea
                  rows={8}
                  placeholder="Tempelkan seluruh isi teks CV Anda di sini atau klik 'Unggah File PDF' di atas untuk ekstraksi otomatis..."
                  value={cvText}
                  onChange={(e) => {
                    setCvText(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full px-4 py-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed bg-white text-slate-800"
                  required
                />
              </div>

              {/* Footer Textarea: Counters & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span>{wordCount} Kata</span>
                  <span>•</span>
                  <span>{charCount} Karakter</span>
                </div>
                <div className="flex items-center gap-2">
                  {cvText && (
                    <>
                      <button
                        type="button"
                        onClick={handleCopyAllCv}
                        className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedAll ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedAll ? 'Tersalin' : 'Salin Teks'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-slate-400 hover:text-red-600 cursor-pointer ml-1"
                      >
                        Bersihkan
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isExtracting || !cvText.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-6 rounded-xl transition duration-200 shadow-sm cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isLoading
                  ? 'AI Sedang Menganalisis Struktur & Skor ATS...'
                  : 'Analisis Skor ATS & Saran Perbaikan Sekarang ⚡'}
              </span>
            </button>
          </form>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Skeleton Loading Elegan */}
        {isLoading && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-slate-200 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-200 rounded-md w-1/3" />
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-100 rounded-md w-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="h-32 bg-slate-100 rounded-xl" />
              <div className="h-32 bg-slate-100 rounded-xl" />
            </div>

            <div className="space-y-2 pt-2">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          </div>
        )}

        {/* Dashboard Hasil Analisis Skor ATS */}
        {result && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 mb-8 animate-in fade-in duration-300">
            {/* Header Skor */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-2xl border border-indigo-100">
              <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-white shadow-md border-4 border-indigo-600 shrink-0">
                <span className="text-2xl sm:text-3xl font-black text-indigo-700">{result.atsScore}</span>
                <span className="text-[10px] text-slate-400 absolute bottom-3">/ 100</span>
              </div>

              <div className="text-center sm:text-left space-y-1 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {result.rating}
                  </span>
                  {jobTarget && (
                    <span className="text-[11px] text-slate-500">
                      Target: <b>{jobTarget}</b>
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900">Evaluasi Algoritma Parser ATS</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{result.summary}</p>
              </div>
            </div>

            {/* Grid Kekuatan vs Perbaikan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kekuatan */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2.5">
                <h4 className="font-bold text-xs sm:text-sm text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Kelebihan Format CV Anda</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-emerald-900">
                  {result.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-emerald-600">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Perbaikan */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2.5">
                <h4 className="font-bold text-xs sm:text-sm text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Rekomendasi Revisi Penting</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-amber-900">
                  {result.improvements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-600">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Missing Keywords */}
            {result.missingKeywords && result.missingKeywords.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  <span>Kata Kunci (Keywords) yang Disarankan Ditambahkan:</span>
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {result.missingKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-white text-indigo-700 font-semibold px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rekomendasi Bullet Points Pengalaman Kerja */}
            {result.revisedExperiencePoints && result.revisedExperiencePoints.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                  💡 Contoh Penulisan Poin Pengalaman dengan Formula Metrik Terukur:
                </h4>
                <div className="space-y-2">
                  {result.revisedExperiencePoints.map((point, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start justify-between gap-3 text-xs text-slate-700"
                    >
                      <div className="flex items-start gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{point}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyText(point, idx)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-600 shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-green-600" />
                            <span className="text-green-600">Disalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
          </>
        )}

        {/* Banner Pintasan Penggabung Berkas PDF (PDF Merger) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗂️</span>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                Ingin Menggabungkan CV dengan Berkas Sertifikat &amp; Ijazah?
              </h4>
              <p className="text-xs text-slate-600">
                Gunakan Penggabung Berkas PDF (PDF Merger) untuk menyatukan banyak file dokumen menjadi satu berkas siap kirim ke portal HRD / BUMN.
              </p>
            </div>
          </div>
          <Link
            href="/tools/pdf-merge"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs whitespace-nowrap shadow-xs transition"
          >
            Buka Penggabung PDF ⚡
          </Link>
        </div>

        {/* Informasi Edukatif Panduan Standar ATS */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-indigo-600 shrink-0" />
            <h2 className="font-bold text-base sm:text-lg text-slate-900">
              Panduan Format CV Lolos Seleksi ATS (Applicant Tracking System)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Format Single Column
              </span>
              <p className="leading-relaxed">
                Gunakan tata letak satu kolom lurus dari atas ke bawah. Hindari tabel bertumpuk atau multi-kolom kompleks yang dapat membingungkan robot parser.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                Ekspor Teks Digital Asli
              </span>
              <p className="leading-relaxed">
                Pastikan teks di dalam PDF dapat di-blok/copy-paste secara manual. Hindari menyimpan CV sebagai gambar canvas datar tanpa lapisan font.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Formula Action + Result
              </span>
              <p className="leading-relaxed">
                Gunakan kata kerja aksi diikuti metrik angka nyata, contoh: <i>&ldquo;Meningkatkan engagement sosial media sebesar 40% melalui 15 kampanye aktif.&rdquo;</i>
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section Accordion */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
          </h3>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-4 py-3 bg-slate-50/50 hover:bg-slate-50 font-semibold text-xs sm:text-sm text-slate-800 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                      openFaq === idx ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 py-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="my-10 pt-4">
          <AdBanner zone="in-tool" label="Iklan" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
