'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import { extractTextFromPdf } from '@/lib/pdf-text-extractor';
import { BookOpen, Sparkles, CheckCircle2, Clock, Copy, Check, Download, AlertTriangle, FileText, RefreshCw } from 'lucide-react';

interface SummaryResult {
  title: string;
  readingTimeSaved: string;
  executiveSummary: string;
  keyTakeaways: string[];
  actionItems: string[];
}

export default function DocumentSummarizerPage() {
  const [docText, setDocText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExtractingPdf, setIsExtractingPdf] = useState<boolean>(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Unggah & Ekstraksi PDF lokal
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Harap pilih dokumen berformat PDF!');
      return;
    }

    setFileName(file.name);
    setErrorMessage('');
    setIsExtractingPdf(true);

    try {
      const extraction = await extractTextFromPdf(file, {
        enableOcrFallback: true,
        maxPages: 15,
      });

      if (!extraction.success) {
        setErrorMessage(extraction.error || 'Gagal membaca berkas PDF.');
        return;
      }

      if (!extraction.text.trim()) {
        setErrorMessage('Tidak ada teks yang dapat dibaca dari PDF.');
        return;
      }

      setDocText(extraction.text.substring(0, 10000));
    } catch {
      alert('Gagal mengekstrak teks PDF. Silakan tempel teks secara manual.');
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docText.trim()) {
      setErrorMessage('Silakan tempel teks dokumen atau unggah berkas PDF terlebih dahulu.');
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
          text: docText,
          action: 'summarize',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setResult(data.data);
      } else {
        setErrorMessage(data.message || 'Gagal merangkum dokumen.');
      }
    } catch {
      setErrorMessage('Terjadi kendala jaringan saat menghubungi sistem perangkum AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!result) return;
    const fullSummaryText = `${result.title}\n\nRINGKASAN EKSEKUTIF:\n${result.executiveSummary}\n\nPOIN PENTING:\n${result.keyTakeaways.map((p) => `• ${p}`).join('\n')}\n\nKESIMPULAN & TINDAKAN:\n${result.actionItems.map((a) => `✓ ${a}`).join('\n')}`;

    navigator.clipboard.writeText(fullSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const fullSummaryText = `${result.title}\n\nRINGKASAN EKSEKUTIF:\n${result.executiveSummary}\n\nPOIN PENTING:\n${result.keyTakeaways.map((p) => `• ${p}`).join('\n')}\n\nKESIMPULAN & TINDAKAN:\n${result.actionItems.map((a) => `✓ ${a}`).join('\n')}`;

    const blob = new Blob([fullSummaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rangkuman_dokumen_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const wordCount = docText.trim() ? docText.trim().split(/\s+/).length : 0;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Document Summarizer Online - KompresKilat',
    description: 'Rangkum dokumen panjang, jurnal ilmiah, laporan PDF, dan artikel menjadi intisari ringkas berbobot dalam 5 detik.',
    applicationCategory: 'BusinessApplication',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={schema} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 text-center">
          <span className="inline-block bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-bold mb-2">
            📚 AI Smart Reading &amp; Executive Summary
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            AI Document &amp; PDF Summarizer Online
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Pangkas waktu membaca laporan kerja, jurnal riset, materi kuliah, dan proposal PDF menjadi ringkasan bernas dalam hitungan detik.
          </p>
        </div>

        {/* Form Upload & Textarea */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
          <form onSubmit={handleSummarize} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Teks Dokumen atau Materi yang Ingin Dirangkum:
                </label>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">{wordCount} kata</span>
                  <label className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer flex items-center gap-1">
                    {isExtractingPdf ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        <span>Mengekstrak PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" />
                        <span>{fileName ? `Ganti PDF (${fileName.length > 18 ? fileName.substring(0, 16) + '...' : fileName})` : 'Unggah PDF'}</span>
                      </>
                    )}
                    <input type="file" accept="application/pdf" onChange={handlePdfUpload} disabled={isExtractingPdf} className="hidden" />
                  </label>
                </div>
              </div>
              <textarea
                rows={7}
                placeholder="Tempelkan isi laporan, bab buku, draf perjanjian, artikel ilmiah, atau dokumen panjang di sini..."
                value={docText}
                onChange={(e) => {
                  setDocText(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full px-4 py-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-sans"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !docText.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-6 rounded-xl transition duration-200 shadow-sm cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'AI Sedang Membaca & Mengekstrak Intisari Dokumen...' : 'Rangkum Dokumen Sekarang ⚡'}</span>
            </button>
          </form>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Skeleton Loading Shimmer */}
        {isLoading && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-pulse">
            <div className="space-y-2">
              <div className="h-6 bg-slate-200 rounded-md w-1/2" />
              <div className="h-4 bg-slate-100 rounded-md w-1/4" />
            </div>

            <div className="p-4 bg-slate-100 rounded-xl space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-5/6" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
            </div>

            <div className="space-y-3 pt-2">
              <div className="h-5 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-4/5" />
            </div>
          </div>
        )}

        {/* Dashboard Hasil Ringkasan */}
        {result && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300">
            {/* Header Hasil */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">
                  ✓ Rangkuman Berhasil Dibuat
                </span>
                <h3 className="font-extrabold text-base sm:text-xl text-slate-900 mt-0.5">{result.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{result.readingTimeSaved}</span>
                </div>
              </div>

              <div className="flex gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh (.txt)</span>
                </button>
              </div>
            </div>

            {/* Ringkasan Eksekutif */}
            <div className="p-4 sm:p-5 bg-purple-50/60 border border-purple-100 rounded-xl space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Ringkasan Eksekutif</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {result.executiveSummary}
              </p>
            </div>

            {/* Poin-Poin Penting (Key Takeaways) */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                📌 Poin Kunci &amp; Temuan Utama Dokumen:
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {result.keyTakeaways.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items / Kesimpulan Tindakan */}
            {result.actionItems && result.actionItems.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  🎯 Kesimpulan &amp; Rekomendasi Tindak Lanjut:
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {result.actionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs text-emerald-950"
                    >
                      <span className="font-bold text-emerald-600">✓</span>
                      <span className="leading-relaxed">{item}</span>
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

