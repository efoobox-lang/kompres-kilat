'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolEditorialSection from '@/components/ToolEditorialSection';
import JsonLd from '@/components/JsonLd';
import JSZip from 'jszip';
import { loadPdfJs } from '@/lib/pdf-text-extractor';
import { validateUploadedFile, downloadBlobSafely } from '@/lib/file-security';
import {
  FileImage,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Sparkles,
  FileArchive,
  Eye,
  Sliders
} from 'lucide-react';

interface RenderedPage {
  pageNumber: number;
  imageUrl: string;
  blob: Blob;
  width: number;
  height: number;
  format: 'jpg' | 'png';
}

type ImageFormat = 'jpg' | 'png';
type DpiScale = 1 | 2 | 3;

export default function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>('jpg');
  const [scaleFactor, setScaleFactor] = useState<DpiScale>(2); // 2x default HD
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cachedPdfBytes = useRef<Uint8Array | null>(null);

  const cleanImageUrls = useCallback(() => {
    renderedPages.forEach((p) => {
      if (p.imageUrl) URL.revokeObjectURL(p.imageUrl);
    });
  }, [renderedPages]);

  useEffect(() => {
    return () => {
      cleanImageUrls();
    };
  }, [cleanImageUrls]);

  // Main PDF rendering engine
  const renderPdfPages = async (bytes: Uint8Array, format: ImageFormat, scale: DpiScale) => {
    cleanImageUrls();
    setIsRendering(true);
    setRenderedPages([]);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const pdfjs = await loadPdfJs();
      const loadingTask = pdfjs.getDocument({
        data: bytes,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
        cMapPacked: true,
      });

      const pdfDoc = await loadingTask.promise;
      const totalPages = pdfDoc.numPages;
      setRenderProgress({ current: 0, total: totalPages });

      const newPages: RenderedPage[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setRenderProgress({ current: i, total: totalPages });
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: scale });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (ctx) {
          // Fill background white for JPG to avoid black backgrounds
          if (format === 'jpg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          await page.render({
            canvasContext: ctx,
            viewport: viewport,
          }).promise;

          const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
          const quality = format === 'jpg' ? 0.92 : undefined;

          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType, quality));

          if (blob) {
            const url = URL.createObjectURL(blob);
            newPages.push({
              pageNumber: i,
              imageUrl: url,
              blob: blob,
              width: viewport.width,
              height: viewport.height,
              format: format,
            });
          }
        }
      }

      setRenderedPages(newPages);
      setSuccessMessage(`Berhasil me-render ${newPages.length} halaman menjadi gambar ${format.toUpperCase()}.`);
    } catch (err: unknown) {
      console.error('Error rendering PDF pages to image:', err);
      const msg = err instanceof Error ? err.message : 'Gagal mengubah lembar PDF menjadi gambar.';
      setErrorMessage(msg.includes('password') ? 'Berkas PDF terenkripsi sandi. Buka kuncinya terlebih dahulu.' : msg);
    } finally {
      setIsRendering(false);
    }
  };

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
      cachedPdfBytes.current = bytes;
      await renderPdfPages(bytes, selectedFormat, scaleFactor);
    } catch (err) {
      console.error('Error preparing PDF file:', err);
      setErrorMessage('Gagal membaca berkas PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsChange = async (newFormat: ImageFormat, newScale: DpiScale) => {
    setSelectedFormat(newFormat);
    setScaleFactor(newScale);

    if (cachedPdfBytes.current) {
      await renderPdfPages(cachedPdfBytes.current, newFormat, newScale);
    }
  };

  const downloadSinglePage = (page: RenderedPage) => {
    if (!file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const extension = page.format === 'jpg' ? 'jpg' : 'png';
    const fileName = `${baseName}_Hal_${page.pageNumber}.${extension}`;
    downloadBlobSafely(page.blob, fileName);
  };

  const downloadAllAsZip = async () => {
    if (!file || renderedPages.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const ext = selectedFormat === 'jpg' ? 'jpg' : 'png';

      renderedPages.forEach((p) => {
        zip.file(`${baseName}_Halaman_${p.pageNumber}.${ext}`, p.blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlobSafely(zipBlob, `${baseName}_Gambar_Semua_Halaman.zip`);
    } catch (err) {
      console.error('Error creating ZIP archive:', err);
      setErrorMessage('Terjadi kendala saat membungkus gambar ke format ZIP.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleReset = () => {
    cleanImageUrls();
    cachedPdfBytes.current = null;
    setFile(null);
    setRenderedPages([]);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Konversi PDF ke Gambar JPG & PNG Online - KompresKilat',
    url: 'https://kompreskilat.site/tools/pdf-to-image',
    description: 'Ubah lembaran dokumen PDF menjadi file gambar JPG dan PNG beresolusi tinggi (HD/Ultra HD) secara gratis tanpa kirim berkas ke server.',
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
            <FileImage className="w-3.5 h-3.5" />
            <span>Ekstraksi Gambar Presisi Tinggi 100% Client-Side</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
            Konversi PDF ke JPG & PNG Online
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Ubah setiap lembar dokumen PDF menjadi file foto JPG atau PNG beresolusi tajam. Unduh per lembar atau semua sekaligus dalam arsip ZIP.
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
                <FileImage className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                Pilih Berkas PDF untuk Dikonversi ke Gambar
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                Dokumen diproses langsung di browser tanpa perantara server. Ukuran file hingga 100 MB didukung.
              </p>

              <div className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all">
                <Upload className="w-4 h-4" />
                Pilih Berkas PDF
              </div>
            </div>

            {/* Privacy Badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Bebas Kebocoran Data (Zero Server Storage)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Resolusi Tajam hingga 300 DPI
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Paket Unduhan Lengkap ZIP
              </span>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {(isLoading || isRendering) && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 text-center mb-8">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
              Me-render Halaman PDF ke Gambar {selectedFormat.toUpperCase()}...
            </h3>
            {renderProgress.total > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Memproses halaman {renderProgress.current} dari {renderProgress.total} ({Math.round((renderProgress.current / renderProgress.total) * 100)}%)
              </p>
            )}
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

        {/* Workspace: Control Panel & Gallery */}
        {file && renderedPages.length > 0 && (
          <div className="space-y-6 mb-8">
            {/* Control Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {renderedPages.length} Halaman Siap Diunduh
                  </p>
                </div>
              </div>

              {/* Format & Quality Selector */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                {/* Format Toggle */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => handleSettingsChange('jpg', scaleFactor)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      selectedFormat === 'jpg'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    JPG (Ringan)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSettingsChange('png', scaleFactor)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      selectedFormat === 'png'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    PNG (Tajam)
                  </button>
                </div>

                {/* Scale Selector */}
                <div className="flex items-center gap-1.5 text-xs">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={scaleFactor}
                    onChange={(e) => handleSettingsChange(selectedFormat, parseInt(e.target.value, 10) as DpiScale)}
                    className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 font-medium focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={1}>1x (Standar 72 DPI)</option>
                    <option value={2}>2x (HD 150 DPI)</option>
                    <option value={3}>3x (Ultra HD 300 DPI)</option>
                  </select>
                </div>

                {/* Download All ZIP */}
                <button
                  type="button"
                  disabled={isZipping || isRendering}
                  onClick={downloadAllAsZip}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isZipping ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileArchive className="w-3.5 h-3.5" />}
                  Unduh Semua (ZIP)
                </button>

                {/* Reset */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500"
                  title="Ganti Berkas PDF"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {renderedPages.map((page) => (
                <div
                  key={page.pageNumber}
                  className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:border-indigo-400 transition-all"
                >
                  {/* Top Bar */}
                  <div className="p-2 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Halaman {page.pageNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      {page.format}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative p-2 aspect-[3/4] flex items-center justify-center bg-slate-100 dark:bg-slate-950 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={page.imageUrl}
                      alt={`Halaman ${page.pageNumber}`}
                      className="max-h-full max-w-full object-contain rounded shadow-sm border border-slate-200 dark:border-slate-800 bg-white"
                    />

                    {/* Quick Lightbox Zoom */}
                    <button
                      type="button"
                      onClick={() => setPreviewModalUrl(page.imageUrl)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Perbesar Tampilan"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Download Button */}
                  <div className="p-2 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {Math.round(page.width)}x{Math.round(page.height)} px
                    </span>
                    <button
                      type="button"
                      onClick={() => downloadSinglePage(page)}
                      className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Unduh
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Lightbox */}
        {previewModalUrl && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewModalUrl(null)}
          >
            <div className="relative max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl p-4 overflow-hidden shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewModalUrl}
                alt="Pratinjau Penuh"
                className="max-h-[80vh] w-auto object-contain mx-auto rounded-lg"
              />
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="absolute top-4 right-4 bg-slate-900/80 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-slate-900 font-semibold"
              >
                Tutup
              </button>
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
                Keunggulan Konversi PDF ke Gambar dengan Rendering Native
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Ekstrak lembar dokumen PDF menjadi foto dengan resolusi presisi tanpa kehilangan ketajaman tipografi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-indigo-600" />
                1. Pilih Format Sesuai Kebutuhan
              </h3>
              <p className="text-xs leading-relaxed">
                Pilih format JPG untuk ukuran file hemat kuota saat dikirim via WhatsApp, atau pilih format PNG untuk kualitas tanpa kompresi (lossless) saat mencetak sertifikat atau brosur.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                2. Pilihan Resolusi hingga 300 DPI
              </h3>
              <p className="text-xs leading-relaxed">
                Tersedia 3 tingkat resolusi: Standar 72 DPI (cepat & hemat memori), HD 150 DPI (sangat tajam di layar), dan Ultra HD 300 DPI (standar industri percetakan offset).
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                3. Berkas Privat & Aman
              </h3>
              <p className="text-xs leading-relaxed">
                Seluruh rendering halaman dikerjakan oleh engine JavaScript peramban Anda. Tidak ada satu byte pun data dokumen Anda yang dikirim ke server luar.
              </p>
            </div>
          </div>
        </div>

        {/* Editorial Section: Panduan, FAQ, AdSense Safe Zone & Hub-Spoke Links */}
        <div className="mt-8">
          <ToolEditorialSection toolId="pdf-to-image" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
