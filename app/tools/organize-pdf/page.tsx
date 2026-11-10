'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolEditorialSection from '@/components/ToolEditorialSection';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import { PDFDocument, degrees } from 'pdf-lib';
import JSZip from 'jszip';
import { loadPdfJs } from '@/lib/pdf-text-extractor';
import { validateUploadedFile, downloadBlobSafely } from '@/lib/file-security';
import {
  Layers,
  Upload,
  ArrowLeft,
  ArrowRight,
  Trash2,
  RotateCw,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Scissors,
  CheckSquare,
  Square,
  FileArchive,
  Eye
} from 'lucide-react';

interface PageItem {
  id: string;
  originalIndex: number; // 0-based
  displayNumber: number; // 1-based original
  thumbnailUrl: string;
  rotation: number; // 0, 90, 180, 270
  isDeleted: boolean;
  isSelected: boolean;
  width: number;
  height: number;
}

type ActionMode = 'organize' | 'remove' | 'extract';

export default function OrganizePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<{ current: number; total: number; stage: string }>({
    current: 0,
    total: 0,
    stage: '',
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<ActionMode>('organize');
  const [rangeInput, setRangeInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [draggedPageIndex, setDraggedPageIndex] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [previewPageUrl, setPreviewPageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bersihkan blob URLs ketika berganti berkas atau komponen di-unmount
  const cleanThumbnails = useCallback(() => {
    pages.forEach((p) => {
      if (p.thumbnailUrl) URL.revokeObjectURL(p.thumbnailUrl);
    });
  }, [pages]);

  useEffect(() => {
    return () => {
      cleanThumbnails();
    };
  }, [cleanThumbnails]);

  const handleFileSelect = async (selectedFile: File) => {
    setErrorMessage('');
    setSuccessMessage('');

    const validation = await validateUploadedFile(selectedFile, {
      allowedExtensions: ['pdf'],
      allowedMimeTypes: ['application/pdf'],
      maxSizeBytes: 100 * 1024 * 1024,
      checkMagicBytes: true,
    });

    if (!validation.valid) {
      setErrorMessage(validation.error || 'Berkas PDF tidak valid.');
      return;
    }

    cleanThumbnails();
    setFile(selectedFile);
    setIsLoading(true);
    setLoadingProgress({ current: 0, total: 0, stage: 'Membaca dokumen PDF...' });

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      setPdfBytes(bytes);

      const pdfjs = await loadPdfJs();
      const loadingTask = pdfjs.getDocument({
        data: bytes,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
        cMapPacked: true,
      });

      const pdfDoc = await loadingTask.promise;
      const totalPages = pdfDoc.numPages;

      setLoadingProgress({ current: 0, total: totalPages, stage: `Membuat pratinjau ${totalPages} halaman...` });

      const newPages: PageItem[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setLoadingProgress({ current: i, total: totalPages, stage: `Membuat pratinjau halaman ${i} dari ${totalPages}...` });
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.6 });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (ctx) {
          // Render halaman PDF ke thumbnail
          await page.render({
            canvasContext: ctx,
            viewport: viewport,
          }).promise;

          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
          const thumbUrl = blob ? URL.createObjectURL(blob) : '';

          newPages.push({
            id: `page-${i}-${Date.now()}`,
            originalIndex: i - 1,
            displayNumber: i,
            thumbnailUrl: thumbUrl,
            rotation: 0,
            isDeleted: false,
            isSelected: true,
            width: viewport.width,
            height: viewport.height,
          });
        }
      }

      setPages(newPages);
      setRangeInput(`1-${totalPages}`);
    } catch (err: unknown) {
      console.error('Error parsing PDF:', err);
      const msg = err instanceof Error ? err.message : 'Gagal memproses dokumen PDF.';
      setErrorMessage(msg.includes('password') ? 'Berkas PDF diproteksi sandi. Silakan buka kunci terlebih dahulu.' : 'Gagal membaca berkas PDF.');
      setFile(null);
      setPdfBytes(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Reorder Functions (Drag & Drop + Buttons)
  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length || fromIndex === toIndex) return;
    const updated = [...pages];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setPages(updated);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedPageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedPageIndex !== null && draggedPageIndex !== targetIndex) {
      movePage(draggedPageIndex, targetIndex);
    }
    setDraggedPageIndex(null);
  };

  // Rotation
  const rotatePage = (index: number) => {
    const updated = [...pages];
    updated[index].rotation = (updated[index].rotation + 90) % 360;
    setPages(updated);
  };

  const rotateAllPages = () => {
    const updated = pages.map((p) => ({
      ...p,
      rotation: (p.rotation + 90) % 360,
    }));
    setPages(updated);
  };

  // Delete / Remove
  const toggleDeletePage = (index: number) => {
    const updated = [...pages];
    updated[index].isDeleted = !updated[index].isDeleted;
    setPages(updated);
  };

  const restoreAllPages = () => {
    const updated = pages.map((p) => ({ ...p, isDeleted: false }));
    setPages(updated);
  };

  // Selection for Extract
  const toggleSelectPage = (index: number) => {
    const updated = [...pages];
    updated[index].isSelected = !updated[index].isSelected;
    setPages(updated);
  };

  const selectAll = (select: boolean) => {
    const updated = pages.map((p) => ({ ...p, isSelected: select }));
    setPages(updated);
  };

  const selectOddPages = () => {
    const updated = pages.map((p) => ({
      ...p,
      isSelected: p.displayNumber % 2 !== 0,
    }));
    setPages(updated);
  };

  const selectEvenPages = () => {
    const updated = pages.map((p) => ({
      ...p,
      isSelected: p.displayNumber % 2 === 0,
    }));
    setPages(updated);
  };

  // Parse Range input (e.g. "1-3, 5, 8-10")
  const applyRangeInput = () => {
    if (!rangeInput.trim()) return;
    const selectedIndices = new Set<number>();
    const parts = rangeInput.split(',');

    for (const part of parts) {
      const clean = part.trim();
      if (clean.includes('-')) {
        const [startStr, endStr] = clean.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(pages.length, Math.max(start, end));
          for (let p = min; p <= max; p++) {
            selectedIndices.add(p);
          }
        }
      } else {
        const p = parseInt(clean, 10);
        if (!isNaN(p) && p >= 1 && p <= pages.length) {
          selectedIndices.add(p);
        }
      }
    }

    const updated = pages.map((p) => ({
      ...p,
      isSelected: selectedIndices.has(p.displayNumber),
    }));
    setPages(updated);
  };

  // Process & Export
  const handleExport = async (format: 'single' | 'zip') => {
    if (!pdfBytes || !file) return;
    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Tentukan halaman mana saja yang akan di-include berdasarkan activeMode
      let targetPages: PageItem[] = [];

      if (activeMode === 'organize') {
        targetPages = pages.filter((p) => !p.isDeleted);
      } else if (activeMode === 'remove') {
        targetPages = pages.filter((p) => !p.isDeleted);
      } else if (activeMode === 'extract') {
        targetPages = pages.filter((p) => p.isSelected && !p.isDeleted);
      }

      if (targetPages.length === 0) {
        setErrorMessage('Tidak ada halaman yang dipilih atau semua halaman telah ditandai hapus.');
        setIsProcessing(false);
        return;
      }

      const srcDoc = await PDFDocument.load(pdfBytes);

      if (format === 'single' || activeMode !== 'extract') {
        // Gabungkan halaman terpilih ke satu berkas PDF baru sesuai urutan saat ini
        const newDoc = await PDFDocument.create();

        for (const item of targetPages) {
          const [copiedPage] = await newDoc.copyPages(srcDoc, [item.originalIndex]);
          if (item.rotation !== 0) {
            const currentRotation = copiedPage.getRotation().angle;
            copiedPage.setRotation(degrees((currentRotation + item.rotation) % 360));
          }
          newDoc.addPage(copiedPage);
        }

        const outBytes = await newDoc.save();
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        let suffix = '_Diatur';
        if (activeMode === 'remove') suffix = '_Halaman_Dihapus';
        if (activeMode === 'extract') suffix = '_Halaman_Diekstrak';

        const outBlob = new Blob([outBytes as unknown as BlobPart], { type: 'application/pdf' });
        downloadBlobSafely(outBlob, `${baseName}${suffix}.pdf`);
        setSuccessMessage(`Berhasil memproses ${targetPages.length} halaman PDF.`);
      } else {
        // Format ZIP: Ekstrak tiap halaman jadi berkas PDF tersendiri
        const zip = new JSZip();
        const baseName = file.name.replace(/\.[^/.]+$/, '');

        for (let idx = 0; idx < targetPages.length; idx++) {
          const item = targetPages[idx];
          const singleDoc = await PDFDocument.create();
          const [copiedPage] = await singleDoc.copyPages(srcDoc, [item.originalIndex]);
          if (item.rotation !== 0) {
            const currentRotation = copiedPage.getRotation().angle;
            copiedPage.setRotation(degrees((currentRotation + item.rotation) % 360));
          }
          singleDoc.addPage(copiedPage);

          const singleBytes = await singleDoc.save();
          const pageFileName = `${baseName}_Hal_${item.displayNumber}.pdf`;
          zip.file(pageFileName, singleBytes);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlobSafely(zipBlob, `${baseName}_Ekstrak_Semua_Halaman.zip`);
        setSuccessMessage(`Berhasil mengekstrak ${targetPages.length} halaman ke dalam arsip ZIP.`);
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      setErrorMessage('Terjadi kesalahan saat mengekspor dokumen PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    cleanThumbnails();
    setFile(null);
    setPdfBytes(null);
    setPages([]);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Atur Urutan, Hapus & Ekstrak Halaman PDF - KompresKilat',
    url: 'https://kompreskilat.site/tools/organize-pdf',
    description: 'Atur ulang urutan lembar PDF, hapus halaman kosong/salah, atau ekstrak halaman penting langsung di browser secara aman & instan.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
  };

  const activePagesCount = pages.filter((p) => !p.isDeleted).length;
  const selectedPagesCount = pages.filter((p) => p.isSelected && !p.isDeleted).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <JsonLd data={schema} />
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs px-3 py-1 rounded-full font-bold mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>100% Client-Side Privacy</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
            Atur, Hapus & Ekstrak Halaman PDF
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Geser untuk susun ulang urutan halaman (drag & drop), hapus lembar yang tidak diperlukan, atau ekstrak halaman penting ke berkas baru tanpa server.
          </p>
        </div>

        {/* Upload Zone */}
        {!file && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 mb-8 transition-colors">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-14 text-center cursor-pointer transition-all ${
                isDraggingFile
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[0.99]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-indigo-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Upload className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                Pilih atau Tarik Berkas PDF ke Sini
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                Mendukung dokumen PDF hingga 100 MB. Berkas diproses langsung di peramban lokal komputer/HP Anda.
              </p>

              <div className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all">
                <FileText className="w-4 h-4" />
                Pilih Dokumen PDF
              </div>
            </div>

            {/* Privacy Promise */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Dokumen tidak diunggah ke server
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Presisi tata letak & rasio terjaga
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> 100% Gratis Tanpa Batas
              </span>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 text-center mb-8">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
              {loadingProgress.stage || 'Sedang Memproses...'}
            </h3>
            {loadingProgress.total > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Memproses {loadingProgress.current} dari {loadingProgress.total} halaman ({Math.round((loadingProgress.current / loadingProgress.total) * 100)}%)
              </p>
            )}
          </div>
        )}

        {/* Alert Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-emerald-700 dark:text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        {/* Workspace Toolbar & Grid */}
        {file && pages.length > 0 && (
          <div className="space-y-6 mb-8">
            {/* Top Bar with Tabs and Meta */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total: {pages.length} Halaman • Aktif: {activePagesCount} • Terpilih: {selectedPagesCount}
                  </p>
                </div>
              </div>

              {/* Action Mode Tabs */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-full md:w-auto justify-center">
                <button
                  type="button"
                  onClick={() => setActiveMode('organize')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeMode === 'organize'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Atur Urutan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('remove')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeMode === 'remove'
                      ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Halaman
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('extract')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeMode === 'extract'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  Ekstrak Halaman
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={rotateAllPages}
                  title="Putar Semua Halaman 90 Derajat"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Putar Semua</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-600 text-xs transition-colors"
                  title="Ganti Berkas PDF"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode Specific Controls */}
            {activeMode === 'extract' && (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">Pilih Cepat:</span>
                  <button
                    type="button"
                    onClick={() => selectAll(true)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 font-medium"
                  >
                    Semua ({pages.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => selectOddPages()}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 font-medium"
                  >
                    Ganjil (1, 3, 5...)
                  </button>
                  <button
                    type="button"
                    onClick={() => selectEvenPages()}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 font-medium"
                  >
                    Genap (2, 4, 6...)
                  </button>
                  <button
                    type="button"
                    onClick={() => selectAll(false)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 font-medium"
                  >
                    Kosongkan
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-600 dark:text-slate-400">Rentang:</span>
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="Contoh: 1-3, 5"
                    className="w-32 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={applyRangeInput}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            )}

            {activeMode === 'remove' && (
              <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-red-800 dark:text-red-300 font-medium">
                  Klik ikon tempat sampah pada halaman yang ingin Anda hapus. Lembar bertanda merah tidak akan disertakan pada PDF hasil.
                </span>
                <button
                  type="button"
                  onClick={restoreAllPages}
                  className="px-3 py-1 bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 hover:bg-red-100 font-semibold"
                >
                  Pulihkan Semua Halaman
                </button>
              </div>
            )}

            {/* Page Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pages.map((item, index) => {
                const isItemDeleted = item.isDeleted;
                const isSelected = item.isSelected && !isItemDeleted;

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`group relative bg-white dark:bg-slate-900 rounded-xl border-2 transition-all flex flex-col overflow-hidden shadow-sm ${
                      isItemDeleted
                        ? 'opacity-40 border-red-400 dark:border-red-900 bg-red-50/20'
                        : isSelected && activeMode === 'extract'
                        ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                    }`}
                  >
                    {/* Top Header of Card */}
                    <div className="p-2 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[11px]">
                          {index + 1}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (Asli: {item.displayNumber})
                        </span>
                      </div>

                      {/* Mode Badge / Checkbox */}
                      {activeMode === 'extract' ? (
                        <button
                          type="button"
                          onClick={() => toggleSelectPage(index)}
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 fill-emerald-600 text-white" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleDeletePage(index)}
                          title={isItemDeleted ? 'Batal Hapus' : 'Hapus Halaman'}
                          className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${
                            isItemDeleted ? 'text-red-600' : 'text-slate-400 hover:text-red-500'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Thumbnail Viewport */}
                    <div className="relative p-2 flex items-center justify-center bg-slate-100 dark:bg-slate-950 aspect-[3/4] overflow-hidden select-none">
                      {item.thumbnailUrl ? (
                        <div
                          style={{
                            transform: `rotate(${item.rotation}deg)`,
                            transition: 'transform 0.2s ease',
                          }}
                          className="w-full h-full flex items-center justify-center"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.thumbnailUrl}
                            alt={`Halaman ${item.displayNumber}`}
                            className="max-h-full max-w-full object-contain shadow-sm rounded border border-slate-200 dark:border-slate-800 bg-white"
                          />
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400">Memuat...</div>
                      )}

                      {/* Deleted Overlay */}
                      {isItemDeleted && (
                        <div className="absolute inset-0 bg-red-950/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                          <Trash2 className="w-8 h-8 mb-1 text-red-300" />
                          <span className="text-[11px] font-bold">Dihapus</span>
                        </div>
                      )}

                      {/* Zoom Button */}
                      {item.thumbnailUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewPageUrl(item.thumbnailUrl)}
                          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Lihat Pratinjau Penuh"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-1.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      {/* Move Left / Right */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => movePage(index, index - 1)}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-20 text-slate-600 dark:text-slate-400"
                          title="Geser ke Kiri"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === pages.length - 1}
                          onClick={() => movePage(index, index + 1)}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-20 text-slate-600 dark:text-slate-400"
                          title="Geser ke Kanan"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Rotate Button */}
                      <button
                        type="button"
                        onClick={() => rotatePage(index)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1"
                        title="Putar 90 Derajat"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        {item.rotation !== 0 && (
                          <span className="text-[10px] text-indigo-500 font-bold">{item.rotation}°</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Export Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                {activeMode === 'organize' && `Menyusun kembali ${activePagesCount} halaman dalam urutan baru.`}
                {activeMode === 'remove' && `Menghapus ${pages.length - activePagesCount} lembar. Menyimpan ${activePagesCount} halaman tersisa.`}
                {activeMode === 'extract' && `Mengekstrak ${selectedPagesCount} halaman terpilih.`}
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                {activeMode === 'extract' ? (
                  <>
                    <button
                      type="button"
                      disabled={isProcessing || selectedPagesCount === 0}
                      onClick={() => handleExport('zip')}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-sm font-bold transition-all disabled:opacity-50"
                    >
                      <FileArchive className="w-4 h-4" />
                      Ekstrak Lembar Terpisah (ZIP)
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing || selectedPagesCount === 0}
                      onClick={() => handleExport('single')}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition-all disabled:opacity-50"
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Ekstrak Menjadi 1 PDF
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={isProcessing || activePagesCount === 0}
                    onClick={() => handleExport('single')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Unduh PDF Hasil Penataan
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Pratinjau Pembesaran Halaman */}
        {previewPageUrl && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewPageUrl(null)}
          >
            <div className="relative max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl p-4 overflow-hidden shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPageUrl}
                alt="Pratinjau Penuh"
                className="max-h-[80vh] w-auto object-contain mx-auto rounded-lg"
              />
              <button
                type="button"
                onClick={() => setPreviewPageUrl(null)}
                className="absolute top-4 right-4 bg-slate-900/80 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-slate-900 font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Panduan & Standar Kualitas (Template Seragam) */}
        <div className="mt-10 sm:mt-12 mb-8">
          <ToolEditorialSection toolId="organize-pdf" />
        </div>

        {/* Quick Link to Related Tools */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Perkakas Dokumen Lainnya:</span>
          <Link href="/tools/pdf" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Kompres PDF
          </Link>
          <span>•</span>
          <Link href="/tools/pdf-merge" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Gabung PDF
          </Link>
          <span>•</span>
          <Link href="/tools/page-number-pdf" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Beri Nomor Halaman PDF
          </Link>
          <span>•</span>
          <Link href="/tools/pdf-to-image" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            PDF ke JPG/PNG
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
