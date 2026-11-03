'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { loadPdfJs } from '@/lib/pdf-text-extractor';
import { validateUploadedFile, downloadBlobSafely } from '@/lib/file-security';
import {
  Hash,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Type
} from 'lucide-react';

type PositionKey = 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';

interface NumberingConfig {
  position: PositionKey;
  format: string; // '{n}', 'Halaman {n} dari {total}', '{n} / {total}', 'Hal. {n}'
  customFormat: string;
  fontFamily: 'Helvetica' | 'TimesRoman' | 'Courier';
  fontSize: number;
  color: string; // hex '#000000'
  marginHorizontal: number; // points
  marginVertical: number; // points
  startFromPage: number; // 1-based (e.g. 1 or 2 to skip cover)
  endAtPage: number; // 0 means all pages
  firstNumber: number; // offset starting number (usually 1)
}

const DEFAULT_CONFIG: NumberingConfig = {
  position: 'bottom-center',
  format: 'Halaman {n} dari {total}',
  customFormat: '',
  fontFamily: 'Helvetica',
  fontSize: 10,
  color: '#334155', // slate-700
  marginHorizontal: 36, // 0.5 inch
  marginVertical: 28,
  startFromPage: 1,
  endAtPage: 0,
  firstNumber: 1,
};

export default function PageNumberPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [previewPageIndex, setPreviewPageIndex] = useState<number>(1);
  const [config, setConfig] = useState<NumberingConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfJsDocRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Format resolver
  const resolvePageString = useCallback((pageNumber: number, total: number) => {
    let template = config.format;
    if (config.format === 'custom') {
      template = config.customFormat || '{n}';
    }
    return template.replace(/{n}/g, String(pageNumber)).replace(/{total}/g, String(total));
  }, [config.format, config.customFormat]);

  // Render preview canvas
  const renderPagePreview = useCallback(async () => {
    if (!pdfJsDocRef.current || !canvasRef.current || totalPages === 0) return;

    try {
      const page = await pdfJsDocRef.current.getPage(previewPageIndex);
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: ctx,
        viewport: viewport,
      }).promise;

      // Draw dynamic page number overlay on preview if within target range
      const endPage = config.endAtPage > 0 ? Math.min(config.endAtPage, totalPages) : totalPages;
      if (previewPageIndex >= config.startFromPage && previewPageIndex <= endPage) {
        const computedNumber = previewPageIndex - config.startFromPage + config.firstNumber;
        const text = resolvePageString(computedNumber, totalPages);

        ctx.save();
        ctx.fillStyle = config.color;
        ctx.font = `${config.fontSize * 1.33}px ${config.fontFamily === 'TimesRoman' ? 'Times New Roman, serif' : config.fontFamily === 'Courier' ? 'Courier, monospace' : 'Arial, sans-serif'}`;

        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;

        let x = canvas.width / 2 - textWidth / 2;
        let y = canvas.height - config.marginVertical * 1.33;

        // X Positioning
        if (config.position.includes('left')) {
          x = config.marginHorizontal * 1.33;
        } else if (config.position.includes('right')) {
          x = canvas.width - config.marginHorizontal * 1.33 - textWidth;
        } else {
          x = (canvas.width - textWidth) / 2;
        }

        // Y Positioning
        if (config.position.startsWith('top')) {
          y = config.marginVertical * 1.33 + config.fontSize * 1.33;
        } else {
          y = canvas.height - config.marginVertical * 1.33;
        }

        // Draw pill highlight for easy visual identification
        ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
        ctx.fillRect(x - 6, y - config.fontSize * 1.33, textWidth + 12, config.fontSize * 1.7);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
        ctx.strokeRect(x - 6, y - config.fontSize * 1.33, textWidth + 12, config.fontSize * 1.7);

        // Draw text
        ctx.fillStyle = config.color;
        ctx.fillText(text, x, y);
        ctx.restore();
      }
    } catch (err) {
      console.error('Error rendering preview canvas:', err);
    }
  }, [totalPages, previewPageIndex, config, resolvePageString]);

  useEffect(() => {
    renderPagePreview();
  }, [renderPagePreview]);

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

    setFile(selectedFile);
    setIsLoading(true);

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

      const doc = await loadingTask.promise;
      pdfJsDocRef.current = doc;
      setTotalPages(doc.numPages);
      setPreviewPageIndex(1);
      setConfig((prev) => ({ ...prev, endAtPage: doc.numPages }));
    } catch (err: unknown) {
      console.error('Error loading PDF:', err);
      const msg = err instanceof Error ? err.message : 'Gagal membuka dokumen PDF.';
      setErrorMessage(msg.includes('password') ? 'Berkas PDF diproteksi password. Harap buka kunci terlebih dahulu.' : 'Gagal memproses berkas PDF.');
      setFile(null);
      setPdfBytes(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hexToRgb01 = (hex: string) => {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    const r = ((num >> 16) & 255) / 255;
    const g = ((num >> 8) & 255) / 255;
    const b = (num & 255) / 255;
    return rgb(r, g, b);
  };

  // Stamp and Download Process
  const handleStampAndDownload = async () => {
    if (!pdfBytes || !file || totalPages === 0) return;
    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const font = await pdfDoc.embedFont(
        config.fontFamily === 'TimesRoman'
          ? StandardFonts.TimesRoman
          : config.fontFamily === 'Courier'
          ? StandardFonts.Courier
          : StandardFonts.Helvetica
      );

      const textColor = hexToRgb01(config.color);
      const pdfPages = pdfDoc.getPages();
      const effectiveTotal = pdfPages.length;
      const endPage = config.endAtPage > 0 ? Math.min(config.endAtPage, effectiveTotal) : effectiveTotal;

      let stampedCount = 0;

      for (let i = 0; i < pdfPages.length; i++) {
        const pageIdx1Based = i + 1;
        if (pageIdx1Based < config.startFromPage || pageIdx1Based > endPage) {
          continue; // Skip pages outside range (e.g. cover page)
        }

        const page = pdfPages[i];
        const { width, height } = page.getSize();
        const currentNumber = pageIdx1Based - config.startFromPage + config.firstNumber;
        const text = resolvePageString(currentNumber, effectiveTotal);

        const textWidth = font.widthOfTextAtSize(text, config.fontSize);
        const textHeight = font.heightAtSize(config.fontSize);

        // Compute X Coordinate
        let x = 0;
        if (config.position.includes('left')) {
          x = config.marginHorizontal;
        } else if (config.position.includes('right')) {
          x = width - config.marginHorizontal - textWidth;
        } else {
          x = (width - textWidth) / 2;
        }

        // Compute Y Coordinate (PDF origin is bottom-left)
        let y = 0;
        if (config.position.startsWith('top')) {
          y = height - config.marginVertical - textHeight;
        } else {
          y = config.marginVertical;
        }

        page.drawText(text, {
          x,
          y,
          size: config.fontSize,
          font,
          color: textColor,
        });

        stampedCount++;
      }

      const outBytes = await pdfDoc.save();
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const outBlob = new Blob([outBytes as unknown as BlobPart], { type: 'application/pdf' });
      downloadBlobSafely(outBlob, `${baseName}_Beri_Nomor.pdf`);
      setSuccessMessage(`Berhasil membubuhi nomor pada ${stampedCount} halaman PDF.`);
    } catch (err) {
      console.error('Error stamping page numbers:', err);
      setErrorMessage('Terjadi kesalahan saat memproses penomoran halaman PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPdfBytes(null);
    setTotalPages(0);
    pdfJsDocRef.current = null;
    setConfig(DEFAULT_CONFIG);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Beri Nomor Halaman PDF Online - KompresKilat',
    url: 'https://kompreskilat.site/tools/page-number-pdf',
    description: 'Beri nomor halaman PDF otomatis, lewati cover dokumen, atur format dan posisi header/footer langsung di peramban secara aman tanpa upload server.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <JsonLd data={schema} />
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs px-3 py-1 rounded-full font-bold mb-3">
            <Hash className="w-3.5 h-3.5" />
            <span>Penomoran Halaman Presisi 100% Client-Side</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
            Beri Nomor Halaman PDF Online
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Tambahkan nomor urut halaman (Header / Footer), sesuaikan letak posisi, format teks, font, dan lewati halaman cover depan dengan cepat & privat.
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
                <Hash className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                Pilih Berkas PDF untuk Diberi Nomor
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                Mendukung dokumen skripsi, laporan kantor, modul pelatihan, atau berkas administrasi apapun.
              </p>

              <div className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all">
                <FileText className="w-4 h-4" />
                Pilih Dokumen PDF
              </div>
            </div>

            {/* Privacy Badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Aman di Peramban
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Format Font Vektor Asli
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Pratinjau Interaktif Instan
              </span>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 text-center mb-8">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
              Membaca Lembaran Dokumen PDF...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menyiapkan pratinjau halaman dan konfigurasi letak nomor.
            </p>
          </div>
        )}

        {/* Alerts */}
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

        {/* Workspace: Interactive Options (Left) + Live Canvas Preview (Right) */}
        {file && totalPages > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Left Column: Settings Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Pengaturan Penomoran</h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Ganti File
                  </button>
                </div>

                {/* 1. Posisi Grid */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Posisi Nomor pada Halaman:
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800/80 p-2 rounded-xl">
                    {[
                      { key: 'top-left', label: 'Atas Kiri' },
                      { key: 'top-center', label: 'Atas Tengah' },
                      { key: 'top-right', label: 'Atas Kanan' },
                      { key: 'bottom-left', label: 'Bawah Kiri' },
                      { key: 'bottom-center', label: 'Bawah Tengah' },
                      { key: 'bottom-right', label: 'Bawah Kanan' },
                    ].map((pos) => (
                      <button
                        key={pos.key}
                        type="button"
                        onClick={() => setConfig({ ...config, position: pos.key as PositionKey })}
                        className={`py-2 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                          config.position === pos.key
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500/30'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Format Penomoran */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Format Teks Nomor:
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Halaman 1 dari 10', format: 'Halaman {n} dari {total}' },
                      { label: 'Hal. 1', format: 'Hal. {n}' },
                      { label: '1 / 10', format: '{n} / {total}' },
                      { label: '1 (Hanya Angka)', format: '{n}' },
                      { label: 'Kustom Format', format: 'custom' },
                    ].map((item) => (
                      <label
                        key={item.format}
                        className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                          config.format === item.format
                            ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="format"
                          checked={config.format === item.format}
                          onChange={() => setConfig({ ...config, format: item.format })}
                          className="accent-indigo-600"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>

                  {config.format === 'custom' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={config.customFormat}
                        onChange={(e) => setConfig({ ...config, customFormat: e.target.value })}
                        placeholder="Contoh: Dokumen - {n} of {total}"
                        className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Gunakan placeholder <code>&#123;n&#125;</code> untuk nomor saat ini dan <code>&#123;total&#125;</code> untuk jumlah total lembar.
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Font & Ukuran */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Jenis Font:
                    </label>
                    <select
                      value={config.fontFamily}
                      onChange={(e) => setConfig({ ...config, fontFamily: e.target.value as 'Helvetica' | 'TimesRoman' | 'Courier' })}
                      className="w-full text-xs px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Helvetica">Helvetica (Modern Clean)</option>
                      <option value="TimesRoman">Times Roman (Formal Skripsi)</option>
                      <option value="Courier">Courier (Monospace)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ukuran ({config.fontSize} pt):
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="20"
                      value={config.fontSize}
                      onChange={(e) => setConfig({ ...config, fontSize: parseInt(e.target.value, 10) })}
                      className="w-full accent-indigo-600 mt-2"
                    />
                  </div>
                </div>

                {/* 4. Warna Teks */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Warna Teks:
                  </label>
                  <div className="flex items-center gap-3">
                    {['#334155', '#000000', '#475569', '#1e3a8a', '#dc2626'].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setConfig({ ...config, color: hex })}
                        style={{ backgroundColor: hex }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          config.color === hex ? 'scale-125 border-indigo-600 shadow' : 'border-white dark:border-slate-700'
                        }`}
                      />
                    ))}
                    <input
                      type="color"
                      value={config.color}
                      onChange={(e) => setConfig({ ...config, color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* 5. Rentang Halaman & Lewati Cover */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Mulai dari Halaman:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={config.startFromPage}
                        onChange={(e) => setConfig({ ...config, startFromPage: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                        className="w-16 text-center text-xs px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                      />
                      <span className="text-[11px] text-slate-400">
                        {config.startFromPage === 2 ? '(Cover Dilewati)' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Angka Pertama:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={config.firstNumber}
                      onChange={(e) => setConfig({ ...config, firstNumber: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                      className="w-16 text-center text-xs px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Export Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleStampAndDownload}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Beri Nomor & Unduh PDF
                </button>
              </div>
            </div>

            {/* Right Column: Live Page Preview */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 flex flex-col items-center">
                {/* Preview Navigation */}
                <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-indigo-500" />
                    <span>Pratinjau Halaman Langsung</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={previewPageIndex <= 1}
                      onClick={() => setPreviewPageIndex((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-600 dark:text-slate-400"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      Hal. {previewPageIndex} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={previewPageIndex >= totalPages}
                      onClick={() => setPreviewPageIndex((p) => Math.min(totalPages, p + 1))}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-600 dark:text-slate-400"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Canvas Container with Shadowed Sheet Aesthetic */}
                <div className="max-w-full overflow-auto p-4 bg-slate-100 dark:bg-slate-950 rounded-xl flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    className="max-h-[600px] w-auto shadow-lg rounded border border-slate-200 dark:border-slate-800 bg-white"
                  />
                </div>

                <p className="text-[11px] text-slate-400 mt-3 text-center">
                  Area kotak ungu adalah simulasi posisi nomor yang akan dicetak pada berkas PDF asli.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informative Article Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 mb-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                Solusi Penomoran Dokumen PDF Resmi & Akademik
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Penuhi aturan penulisan karya ilmiah, tugas akhir, dan laporan berkas negara tanpa merusak tata letak dokumen asli.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-indigo-600" />
                1. Lewati Lembar Sampul (Cover)
              </h3>
              <p className="text-xs leading-relaxed">
                Standar penulisan buku dan skripsi mewajibkan lembar sampul tidak bernomor. Cukup atur kolom &quot;Mulai dari Halaman&quot; ke angka 2, maka halaman pertama akan dibiarkan bersih tanpa stempel angka.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-emerald-600" />
                2. Font Vektor Standar ISO
              </h3>
              <p className="text-xs leading-relaxed">
                Teks nomor halaman disematkan sebagai font vektor murni standar PDF (Helvetica, Times Roman, Courier), memastikan hasil cetak super tajam dan tidak pecah meski diperbesar 500%.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                3. Perlindungan Kerahasiaan 100%
              </h3>
              <p className="text-xs leading-relaxed">
                Semua pembacaan dan penyematan teks berlangsung di RAM komputer atau HP Anda secara lokal. Tidak ada dokumen yang disimpan di server cloud, menjamin privasi berkas rahasia Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Ad Placement */}
        <div className="my-8">
          <AdBanner slotId="page-number-bottom" />
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            Pertanyaan Umum Seputar Penomoran PDF (FAQ)
          </h2>

          <div className="space-y-3">
            {[
              {
                q: 'Bisakah saya memulai penomoran dari angka selain 1?',
                a: 'Bisa. Pada opsi "Angka Pertama", Anda dapat menentukan angka awal, misalnya mulai dari angka 15 jika dokumen Anda merupakan bab lanjutan dari buku atau skripsi.',
              },
              {
                q: 'Apakah posisi penomoran bisa disesuaikan dengan margin dokumen?',
                a: 'Ya, Anda dapat memilih 6 titik letak standar (Bawah Tengah, Bawah Kanan, Bawah Kiri, Atas Kanan, dsb.) yang secara otomatis menyeimbangkan posisi aman dari tepi kertas.',
              },
              {
                q: 'Apakah teks pada dokumen asli akan tertimpa atau terhapus?',
                a: 'Tidak. Sistem hanya menambahkan lapisan teks (text overlay) di posisi yang Anda tentukan tanpa menghapus objek gambar, teks, maupun tabel yang sudah ada di dokumen.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Link to Related Tools */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Perkakas Dokumen Lainnya:</span>
          <Link href="/tools/organize-pdf" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Atur & Ekstrak Halaman
          </Link>
          <span>•</span>
          <Link href="/tools/pdf-editor" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Edit Teks PDF
          </Link>
          <span>•</span>
          <Link href="/tools/pdf-merge" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Gabung Dokumen PDF
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
