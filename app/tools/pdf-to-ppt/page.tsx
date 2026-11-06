'use client';

import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import { validateUploadedFile, downloadBlobSafely } from '@/lib/file-security';
import {
  FileText,
  Presentation,
  ShieldCheck,
  Download,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
} from 'lucide-react';

export default function PdfToPptPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [enableOcr, setEnableOcr] = useState<boolean>(false);
  const [slideLayout, setSlideLayout] = useState<'16x9' | '4x3'>('16x9');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedFileName, setConvertedFileName] = useState<string>('');
  const [slideCount, setSlideCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Lazy-load PDF.js
  const loadPdfJs = async () => {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }
    return pdfjs;
  };

  // Format bytes ke ukuran mudah dibaca
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle saat user memilih file PDF dengan validasi keamanan client-side ketat
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    setConvertedBlob(null);

    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Validasi Keamanan: Tipe MIME, ekstensi, batas ukuran 50MB, dan verifikasi magic byte %PDF-
    const validation = await validateUploadedFile(file, {
      allowedExtensions: ['pdf', '.pdf'],
      allowedMimeTypes: ['application/pdf'],
      maxSizeBytes: 50 * 1024 * 1024,
      checkMagicBytes: true,
    });

    if (!validation.valid) {
      setErrorMessage(validation.error || 'Berkas tidak valid.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    setStatusMessage('');
  };

  // Proses konversi PDF ke PowerPoint nyata (.pptx) menggunakan pptxgenjs & pdfjs-dist
  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setProgressPercent(5);
    setErrorMessage('');
    setStatusMessage('Memuat mesin PDF reader lokal...');

    try {
      const pdfjs = await loadPdfJs();
      const arrayBuffer = await selectedFile.arrayBuffer();

      setStatusMessage('Membaca struktur dokumen PDF...');
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
        cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
        cMapPacked: true,
      });

      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      if (numPages === 0) {
        throw new Error('Dokumen PDF tidak memiliki halaman yang dapat dibaca.');
      }

      setStatusMessage(`Menginisialisasi generator PowerPoint (${numPages} halaman)...`);
      setProgressPercent(15);

      // Lazy import PptxGenJS
      const pptxModule = await import('pptxgenjs');
      const PptxGenJS = pptxModule.default || pptxModule;
      const pptx = new PptxGenJS();

      pptx.layout = slideLayout === '16x9' ? 'LAYOUT_16x9' : 'LAYOUT_4x3';
      pptx.author = 'KompresKilat User';
      pptx.company = 'KompresKilat';
      pptx.title = selectedFile.name.replace(/\.[^/.]+$/, '');

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const stepProgress = 15 + Math.floor((pageNum / numPages) * 70);
        setProgressPercent(stepProgress);
        setStatusMessage(`Memproses halaman ${pageNum} dari ${numPages}...`);

        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const extractedLines: string[] = [];

        if (textContent && textContent.items.length > 0) {
          let currentLine = '';
          let lastY: number | null = null;

          for (const item of textContent.items) {
            if ('str' in item && typeof item.str === 'string') {
              const transform = (item as { transform?: number[] }).transform;
              const currentY = transform && transform.length >= 6 ? transform[5] : null;

              if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 8) {
                if (currentLine.trim()) extractedLines.push(currentLine.trim());
                currentLine = item.str;
              } else {
                currentLine += (currentLine.endsWith(' ') || item.str.startsWith(' ') ? '' : ' ') + item.str;
              }
              lastY = currentY;
            }
          }
          if (currentLine.trim()) {
            extractedLines.push(currentLine.trim());
          }
        }

        const slide = pptx.addSlide();

        // Background slide styling
        slide.background = { color: 'F8FAFC' };

        // Jika ada teks asli yang diekstrak
        if (extractedLines.length > 0) {
          // Slide Header / Judul
          const titleText = extractedLines[0] || `Halaman ${pageNum}`;
          const bodyLines = extractedLines.slice(1, 20); // Ambil ringkasan teks

          slide.addText(titleText, {
            x: 0.8,
            y: 0.6,
            w: slideLayout === '16x9' ? 11.5 : 8.4,
            h: 0.8,
            fontSize: 20,
            bold: true,
            color: '1E293B',
            fontFace: 'Arial',
          });

          if (bodyLines.length > 0) {
            slide.addText(bodyLines.join('\n\n'), {
              x: 0.8,
              y: 1.6,
              w: slideLayout === '16x9' ? 11.5 : 8.4,
              h: 4.8,
              fontSize: 13,
              color: '334155',
              fontFace: 'Calibri',
              lineSpacing: 22,
              bullet: false,
              valign: 'top',
            });
          }
        } else {
          // Jika PDF berupa scan/gambar dan OCR diaktifkan atau dokumen visual
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
            const imgData = canvas.toDataURL('image/png');

            slide.addImage({
              data: imgData,
              x: 0.5,
              y: 0.5,
              w: slideLayout === '16x9' ? 12.3 : 9.0,
              h: 6.2,
              sizing: { type: 'contain', w: slideLayout === '16x9' ? 12.3 : 9.0, h: 6.2 },
            });
          }
        }

        // Footer slide
        slide.addText(`Halaman ${pageNum} dari ${numPages} • Dikonversi via KompresKilat`, {
          x: 0.8,
          y: slideLayout === '16x9' ? 6.8 : 7.0,
          w: slideLayout === '16x9' ? 11.5 : 8.4,
          h: 0.4,
          fontSize: 9,
          color: '94A3B8',
          italic: true,
        });
      }

      setStatusMessage('Mengemas berkas PowerPoint (.pptx)...');
      setProgressPercent(90);

      const pptBlob = (await pptx.write({ outputType: 'blob' })) as Blob;
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}_presentation.pptx`;

      setConvertedBlob(pptBlob);
      setConvertedFileName(outName);
      setSlideCount(numPages);
      setProgressPercent(100);
      setStatusMessage('Konversi selesai! File presentasi siap diunduh.');
    } catch (err: unknown) {
      console.error('Error converting PDF to PPT:', err);
      const errMsg = err instanceof Error ? err.message : 'Terjadi kendala saat mengonversi dokumen PDF.';
      setErrorMessage(
        errMsg.includes('password')
          ? 'Dokumen PDF dilindungi kata sandi. Harap buka enkripsi terlebih dahulu.'
          : errMsg
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!convertedBlob) return;
    downloadBlobSafely(convertedBlob, convertedFileName || 'presentasi.pptx');
  };

  const handleReset = () => {
    setSelectedFile(null);
    setConvertedBlob(null);
    setConvertedFileName('');
    setSlideCount(0);
    setProgressPercent(0);
    setStatusMessage('');
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Konversi PDF ke PowerPoint (PPTX) Online Gratis - KompresKilat',
          description:
            'Ubah berkas PDF menjadi slide presentasi PowerPoint (.pptx) dengan tata letak rapi, cepat, dan 100% aman di peramban lokal.',
          url: 'https://kompreskilat.site/tools/pdf-to-ppt',
          applicationCategory: 'OfficeApplication',
          operatingSystem: 'All',
        }}
      />

      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-semibold mb-4 border border-orange-200 dark:border-orange-800">
            <Presentation className="w-3.5 h-3.5" />
            <span>PDF to PowerPoint Converter</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Konversi PDF ke PowerPoint (PPTX)
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Ekstrak teks dan visual dokumen PDF menjadi slide presentasi PowerPoint siap edit.
            Cepat, privat, dan diproses 100% langsung di peramban tanpa kirim ke server luar.
          </p>

          {/* Privacy & Anti-Hacking Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>100% Client-Side Privacy: File Anda tidak pernah diunggah atau disimpan di server mana pun.</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-semibold">Validasi Berkas Gagal</p>
              <p className="text-xs sm:text-sm mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Main Converter Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          {!selectedFile ? (
            /* Upload State */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group bg-slate-50/50 dark:bg-slate-950/50 hover:bg-orange-50/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
                Pilih atau Tarik Berkas PDF ke Sini
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-3">
                Mendukung dokumen PDF teks maupun gambar dengan ukuran berkas hingga 50 MB.
              </p>
              <span className="inline-block px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl shadow-sm transition">
                Jelajahi Berkas PDF
              </span>
            </div>
          ) : (
            /* Settings & Process State */
            <div className="space-y-6">
              {/* File Info Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ukuran Berkas: {formatBytes(selectedFile.size)} • Format Asli Terverifikasi
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Ganti Berkas
                </button>
              </div>

              {/* Conversion Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Layout Setting */}
                <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                    <Sliders className="w-4 h-4 text-orange-500" />
                    Aspek Rasio Slide PowerPoint
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSlideLayout('16x9')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                        slideLayout === '16x9'
                          ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Widescreen (16:9)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideLayout('4x3')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                        slideLayout === '4x3'
                          ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Standar (4:3)
                    </button>
                  </div>
                </div>

                {/* Visual / OCR Option */}
                <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="enableOcr"
                    checked={enableOcr}
                    onChange={(e) => setEnableOcr(e.target.checked)}
                    className="mt-1 h-4 w-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
                  />
                  <label htmlFor="enableOcr" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                      Visual Slide Rendering (Fallback)
                    </span>
                    Pertahankan tata letak visual halaman utuh sebagai slide jika teks tidak dapat diekstrak langsung.
                  </label>
                </div>
              </div>

              {/* Progress Bar (saat loading) */}
              {isLoading && (
                <div className="space-y-2 p-4 bg-orange-50 dark:bg-orange-950/40 rounded-2xl border border-orange-200 dark:border-orange-800">
                  <div className="flex justify-between items-center text-xs font-semibold text-orange-700 dark:text-orange-300">
                    <span>{statusMessage || 'Sedang memproses...'}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-orange-200 dark:bg-orange-900/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!convertedBlob ? (
                <button
                  onClick={handleConvert}
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sedang Mengonversi ke PowerPoint...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Konversi ke PowerPoint (.pptx) Sekarang</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              ) : (
                /* Success & Download State */
                <div className="space-y-4 p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <Presentation className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                        Presentasi PowerPoint Berhasil Dibuat!
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        Total {slideCount} slide siap diunduh ({formatBytes(convertedBlob.size)}).
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh File PowerPoint (.pptx)</span>
                    </button>
                    <button
                      onClick={handleReset}
                      className="py-3 px-4 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-sm font-semibold hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Konversi File Lain</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AdSense Slot - Berjarak aman dari tombol aksi */}
        <div className="my-8">
          <AdBanner zone="in-tool" label="Iklan" />
        </div>

        {/* Informational SEO & Educational Content */}
        <section className="mt-12 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-500" />
              Keunggulan Konversi PDF ke PPTX di KompresKilat
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  🔒 Privasi Data 100% Terjamin
                </h3>
                <p className="leading-relaxed">
                  Tidak ada satu pun lembar atau biner file dokumen yang dikirim ke server. Seluruh pemrosesan teks,
                  slide, dan gambar berjalan langsung di RAM peramban komputer/HP Anda.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  ⚡ Berkas PowerPoint Standar (.pptx)
                </h3>
                <p className="leading-relaxed">
                  Hasil keluaran berupa berkas Microsoft PowerPoint murni yang kompatibel dengan Microsoft Office 365,
                  Google Slides, WPS Office, maupun LibreOffice Impress.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  🛡️ Proteksi Anti-Malware Klien
                </h3>
                <p className="leading-relaxed">
                  Dilengkapi pemindai magic-bytes biner untuk memvalidasi keaslian format PDF dan mencegah berkas berbahaya
                  atau file rusak diproses di browser Anda.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
