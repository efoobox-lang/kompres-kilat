'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import { FileText, Sparkles, CheckCircle2, AlertTriangle, KeyRound, Copy, Check, ArrowRight } from 'lucide-react';

interface AtsResult {
  atsScore: number;
  rating: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  revisedExperiencePoints: string[];
}

export default function AtsResumePage() {
  const [cvText, setCvText] = useState<string>('');
  const [jobTarget, setJobTarget] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AtsResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Ekstraksi teks dari PDF sederhana di browser
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Harap pilih dokumen berformat PDF!');
      return;
    }

    setFileName(file.name);
    setErrorMessage('');

    try {
      const buffer = await file.arrayBuffer();
      const decoder = new TextDecoder('latin1');
      const text = decoder.decode(buffer);

      const matches = text.match(/[A-Za-z0-9,.;:\-_/()%$#@!&+=|\s]{4,}/g);
      if (matches && matches.length > 0) {
        const cleanContent = matches
          .filter((s) => !s.startsWith('/') && !s.includes('obj') && !s.includes('endobj'))
          .join(' ')
          .substring(0, 7500);

        setCvText(cleanContent);
      } else {
        setCvText(`[Dokumen PDF Terunggah: ${file.name}]\nPengalaman Kerja & Pendidikan.`);
      }
    } catch {
      alert('Gagal membaca PDF. Anda dapat menyalin dan menempel teks CV secara manual.');
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

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Resume & ATS Reviewer Online Gratis - KompresKilat',
    description: 'Cek skor ATS CV, deteksi kata kunci yang hilang, dan perbaiki deskripsi pengalaman kerja secara instan dengan kecerdasan buatan.',
    applicationCategory: 'BusinessApplication',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={schema} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold mb-2">
            ✨ AI Career Assistant • ATS Checker 2026
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            AI Resume / CV Reviewer &amp; ATS Score Checker
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Tingkatkan peluang lolos seleksi berkas BUMN, CPNS, dan perusahaan multinasional dengan audit skor ATS berbasis AI secara instan.
          </p>
        </div>

        {/* Form Input CV & Upload */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
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
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Isi Teks CV / Resume:
                </label>
                <label className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{fileName ? `Ganti PDF (${fileName})` : 'Unggah File PDF'}</span>
                  <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
                </label>
              </div>
              <textarea
                rows={6}
                placeholder="Tempelkan seluruh isi teks CV Anda di sini (Riwayat Pekerjaan, Pendidikan, Keahlian, dan Ringkasan Diri)..."
                value={cvText}
                onChange={(e) => {
                  setCvText(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full px-4 py-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-sans"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !cvText.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-6 rounded-xl transition duration-200 shadow-sm cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'AI Sedang Menganalisis Struktur & Skor ATS...' : 'Analisis Skor ATS & Saran Perbaikan Sekarang ⚡'}</span>
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
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300">
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

        <AdBanner zone="in-tool" label="Iklan" />
      </section>

      <Footer />
    </main>
  );
}

