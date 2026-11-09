'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolEditorialSection from '@/components/ToolEditorialSection';
import JsonLd from '@/components/JsonLd';
import { PDFDocument } from 'pdf-lib';
import {
  Layers,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  RefreshCw,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Lock
} from 'lucide-react';

interface MergeFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  isEncrypted?: boolean;
}

export default function PdfMergePage() {
  const [files, setFiles] = useState<MergeFileItem[]>([]);
  const [outputFileName, setOutputFileName] = useState<string>('KompresKilat_Gabungan_Dokumen.pdf');
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [mergeProgress, setMergeProgress] = useState<{ stage: string; percent: number }>({ stage: '', percent: 0 });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [mergedStats, setMergedStats] = useState<{ totalPages: number; totalSize: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAddFiles = async (newFilesList: FileList | File[]) => {
    setErrorMessage('');
    const validPdfFiles: File[] = [];

    for (let i = 0; i < newFilesList.length; i++) {
      const file = newFilesList[i];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        validPdfFiles.push(file);
      }
    }

    if (validPdfFiles.length === 0) {
      setErrorMessage('Harap pilih berkas dokumen berformat PDF yang valid (.pdf).');
      return;
    }

    const loadedItems: MergeFileItem[] = [];

    for (const file of validPdfFiles) {
      try {
        const buffer = await file.arrayBuffer();
        let pageCount = 1;
        let isEncrypted = false;

        try {
          const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
          pageCount = doc.getPageCount();
          isEncrypted = doc.isEncrypted;
        } catch {
          // Fallback estimasi jika PDF terenkripsi khusus
          isEncrypted = true;
          pageCount = 1;
        }

        loadedItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          name: file.name,
          size: file.size,
          pageCount,
          isEncrypted
        });
      } catch (err) {
        console.warn(`Gagal membaca berkas ${file.name}:`, err);
      }
    }

    setFiles((prev) => [...prev, ...loadedItems]);
    // Reset file input agar file yang sama bisa dipilih ulang jika dihapus
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    setMergedStats(null);
  };

  const clearAll = () => {
    setFiles([]);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    setMergedStats(null);
    setErrorMessage('');
  };

  const handleMergePdf = async () => {
    if (files.length < 2) {
      setErrorMessage('Pilih minimal 2 berkas PDF untuk digabungkan menjadi satu.');
      return;
    }

    setIsMerging(true);
    setErrorMessage('');
    setDownloadUrl(null);
    setMergedStats(null);
    setMergeProgress({ stage: 'Membuat dokumen PDF gabungan baru...', percent: 5 });

    try {
      const mergedPdf = await PDFDocument.create();
      let totalCopiedPages = 0;

      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        const progressBase = 10 + (i / files.length) * 80;

        setMergeProgress({
          stage: `Menggabungkan berkas (${i + 1}/${files.length}): ${item.name}...`,
          percent: Math.round(progressBase)
        });

        const arrayBuffer = await item.file.arrayBuffer();

        let srcPdf: PDFDocument;
        try {
          srcPdf = await PDFDocument.load(arrayBuffer);
        } catch (loadErr: unknown) {
          const err = loadErr as Error;
          if (err.message && err.message.toLowerCase().includes('encrypt')) {
            throw new Error(`Berkas "${item.name}" terkunci password. Buka kunci enkripsi terlebih dahulu sebelum digabung.`);
          }
          throw loadErr;
        }

        const pageIndices = srcPdf.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(srcPdf, pageIndices);

        for (const page of copiedPages) {
          mergedPdf.addPage(page);
          totalCopiedPages++;
        }
      }

      setMergeProgress({ stage: 'Menyusun berkas PDF akhir...', percent: 95 });

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setMergedStats({
        totalPages: totalCopiedPages,
        totalSize: blob.size
      });
      setMergeProgress({ stage: 'Penggabungan berhasil selesai!', percent: 100 });
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Merge error:', error);
      setErrorMessage(error?.message || 'Terjadi kesalahan saat menggabungkan berkas PDF.');
    } finally {
      setIsMerging(false);
    }
  };

  const totalInputPages = files.reduce((acc, curr) => acc + curr.pageCount, 0);
  const totalInputSize = files.reduce((acc, curr) => acc + curr.size, 0);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Penggabung Berkas PDF Online Gratis (PDF Merger) - KompresKilat',
    description: 'Gabungkan banyak file PDF seperti CV, ijazah, sertifikat, dan transkrip nilai menjadi satu berkas PDF utuh secara 100% lokal di browser tanpa server.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
  };

  const faqs = [
    {
      q: 'Bagaimana cara mengatur urutan halaman pada PDF gabungan?',
      a: 'Setelah mengunggah berkas-berkas PDF, Anda dapat menekan tombol panah Naik (🔼) atau Turun (🔽) pada kartu masing-masing file untuk menentukan urutan halaman dari awal hingga akhir.'
    },
    {
      q: 'Apakah ada batasan jumlah file atau ukuran yang bisa digabungkan?',
      a: 'Tidak ada batasan server karena pemrosesan dilakukan 100% di memori browser lokal perangkat Anda (Client-Side). Anda dapat menggabungkan puluhan berkas PDF sekaligus dengan kecepatan kilat.'
    },
    {
      q: 'Apakah dokumen sensitif saya (ijazah, CV, KTP) aman?',
      a: 'Sangat aman. Berkas Anda tidak pernah diunggah ke internet atau disimpan di server basis data manapun. Seluruh penyalinan halaman dilakukan oleh pustaka pdf-lib di memori RAM peramban Anda.'
    },
    {
      q: 'Bagaimana jika salah satu berkas PDF saya memiliki password?',
      a: 'Pustaka penggabung tidak dapat membaca isi dokumen yang terenkripsi. Silakan buka kunci password dokumen Anda terlebih dahulu menggunakan menu Buka Password PDF di KompresKilat.'
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={schema} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold mb-2">
            🗂️ Utilitas Dokumen • PDF Merger 2026
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Penggabung Berkas PDF (PDF Merger)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Satukan berkas CV, sertifikat, portofolio, transkrip nilai, dan dokumen pendukung lainnya menjadi satu file PDF utuh secara instan, aman, dan 100% tanpa upload server.
          </p>
        </div>

        {/* Upload Zone & Drag and Drop */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all duration-200 mb-6 ${
            isDragging
              ? 'border-indigo-600 bg-indigo-50/80 scale-[1.01]'
              : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/50'
          }`}
        >
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Layers className="w-7 h-7" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
            Pilih Berkas PDF yang Ingin Digabungkan
          </h2>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
            Tarik &amp; lepas beberapa file PDF sekaligus ke area ini, atau klik tombol di bawah untuk memilih file dari komputer atau HP Anda.
          </p>

          <label className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl transition duration-150 shadow-sm cursor-pointer text-xs sm:text-sm">
            <Upload className="w-4 h-4" />
            <span>Pilih Berkas PDF (Bisa Banyak File)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
              className="hidden"
            />
          </label>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 mt-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Client-Side RAM
            </span>
            <span>•</span>
            <span>Bebas Batas Ukuran</span>
            <span>•</span>
            <span>Atur Urutan Bebas</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Progress Bar Saat Penggabungan */}
        {isMerging && (
          <div className="mb-6 p-4 bg-indigo-50/90 border border-indigo-200 rounded-2xl space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-950">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>{mergeProgress.stage}</span>
              </span>
              <span className="font-mono text-indigo-700">{mergeProgress.percent}%</span>
            </div>
            <div className="w-full bg-indigo-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(5, mergeProgress.percent)}%` }}
              />
            </div>
          </div>
        )}

        {/* Download Success Card */}
        {downloadUrl && mergedStats && (
          <div className="mb-6 p-5 sm:p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-2 border-emerald-400 rounded-2xl space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    PDF Berhasil Digabungkan Menjadi Satu!
                  </h3>
                  <p className="text-xs text-slate-600">
                    Total <b>{mergedStats.totalPages} Halaman</b> disatukan • Ukuran akhir:{' '}
                    <b>{formatFileSize(mergedStats.totalSize)}</b>
                  </p>
                </div>
              </div>

              <a
                href={downloadUrl}
                download={outputFileName.endsWith('.pdf') ? outputFileName : `${outputFileName}.pdf`}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition duration-150 shadow-sm flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File PDF Gabungan</span>
              </a>
            </div>
          </div>
        )}

        {/* List Berkas PDF & Kontrol Urutan */}
        {files.length > 0 && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Daftar Berkas PDF ({files.length} Dokumen • {totalInputPages} Halaman • {formatFileSize(totalInputSize)})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Atur urutan halaman dengan tombol panah sebelum menggabungkan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Berkas</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
                    className="hidden"
                  />
                </label>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-slate-400 hover:text-red-600 cursor-pointer"
                >
                  Hapus Semua
                </button>
              </div>
            </div>

            {/* Item Card List */}
            <div className="space-y-2.5">
              {files.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {item.pageCount} Halaman • {formatFileSize(item.size)}
                        {item.isEncrypted && (
                          <span className="ml-2 text-amber-600 font-semibold inline-flex items-center gap-0.5">
                            <Lock className="w-3 h-3" /> Password
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Tombol Kontrol Urutan & Hapus */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                      title="Geser ke atas"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={index === files.length - 1}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                      title="Geser ke bawah"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer transition ml-1"
                      title="Hapus berkas ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Nama File Output */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Berkas PDF Hasil Gabungan:
              </label>
              <input
                type="text"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                placeholder="Contoh: Berkas_Lengkap_CPNS_2026.pdf"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            {/* Tombol Eksekusi Gabungkan */}
            <button
              type="button"
              onClick={handleMergePdf}
              disabled={isMerging || files.length < 2}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-6 rounded-xl transition duration-150 shadow-sm cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isMerging
                  ? 'Sedang Menggabungkan Berkas...'
                  : `Gabungkan ${files.length} Dokumen PDF Sekarang ⚡`}
              </span>
            </button>
          </div>
        )}

        {/* Pintasan ke Alat Terkait (ATS Resume & PDF Tools) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                Sedang Mempersiapkan Berkas Lamaran Kerja?
              </h4>
              <p className="text-xs text-slate-600">
                Gunakan AI Resume / CV Reviewer kami untuk menguji skor ATS dan memilih template layout sebelum digabung.
              </p>
            </div>
          </div>
          <Link
            href="/tools/ats-resume"
            className="px-4 py-2 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold text-xs whitespace-nowrap shadow-2xs transition"
          >
            Buka AI ATS Resume ➔
          </Link>
        </div>

        {/* Editorial Section: Panduan, FAQ, AdSense Safe Zone & Hub-Spoke Links */}
        <div className="mt-8">
          <ToolEditorialSection toolId="pdf-merge" />
        </div>
      </section>

      <Footer />
    </main>
  );
}

