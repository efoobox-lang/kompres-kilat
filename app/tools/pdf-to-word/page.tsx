'use client';

import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import { generateDocxBlob } from '@/lib/docx-generator';
import {
  Download,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Sliders,
  Layers,
  FileCheck2
} from 'lucide-react';

interface PageExtractionDetail {
  pageNum: number;
  source: 'native' | 'ocr';
  charCount: number;
  wordCount: number;
}

export default function PdfToWordPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [conversionMode, setConversionMode] = useState<'auto' | 'native_only' | 'ocr_force'>('auto');
  const [ocrLanguage, setOcrLanguage] = useState<'ind+eng' | 'ind' | 'eng'>('ind+eng');
  
  // Status Proses
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [subProgress, setSubProgress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Hasil Ekstraksi
  const [extractedText, setExtractedText] = useState<string>('');
  const [pageDetails, setPageDetails] = useState<PageExtractionDetail[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [docxSize, setDocxSize] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Lazy-load PDF.js dengan worker lokal mandiri
  const loadPdfJs = async () => {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }
    return pdfjs;
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setExtractedText('');
      setPageDetails([]);
      setTotalPages(0);
      setDocxSize(0);
      setErrorMessage('');
      setStatusMessage('');
      setProgressPercent(0);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setExtractedText('');
    setPageDetails([]);
    setTotalPages(0);
    setDocxSize(0);
    setErrorMessage('');
    setStatusMessage('');
    setProgressPercent(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Algoritma Rekonstruksi Baris Teks PDF Native yang Presisi
  const reconstructNativePageText = (textContent: any): string => {
    if (!textContent || !textContent.items || textContent.items.length === 0) {
      return '';
    }

    interface TextItemPos {
      str: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }

    const items: TextItemPos[] = [];
    for (const item of textContent.items) {
      if (item && typeof item.str === 'string' && item.str.length > 0) {
        items.push({
          str: item.str,
          x: item.transform ? item.transform[4] : 0,
          y: item.transform ? item.transform[5] : 0,
          width: item.width || 0,
          height: item.height || 0,
        });
      }
    }

    if (items.length === 0) return '';

    // Urutkan teks: Y menurun (atas ke bawah halaman), X menaik (kiri ke kanan)
    items.sort((a, b) => {
      if (Math.abs(b.y - a.y) > 3.5) {
        return b.y - a.y;
      }
      return a.x - b.x;
    });

    const lines: string[] = [];
    let currentLine = '';
    let lastY: number | null = null;
    let lastX = 0;

    for (const item of items) {
      if (lastY === null) {
        currentLine = item.str;
        lastY = item.y;
        lastX = item.x + item.width;
      } else if (Math.abs(item.y - lastY) > 3.5) {
        // Pindah baris baru
        lines.push(currentLine);
        currentLine = item.str;
        lastY = item.y;
        lastX = item.x + item.width;
      } else {
        // Masih dalam satu baris: tambahkan spasi jika ada jarak antar kata
        const gap = item.x - lastX;
        if (gap > 2 && !currentLine.endsWith(' ') && !item.str.startsWith(' ')) {
          currentLine += ' ' + item.str;
        } else {
          currentLine += item.str;
        }
        lastX = item.x + item.width;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines.join('\n');
  };

  // Eksekusi Pipeline Konversi PDF & OCR
  const handleStartConversion = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setErrorMessage('');
    setProgressPercent(5);
    setStatusMessage('Memulai analisis struktur berkas dokumen...');
    setSubProgress('');

    let tesseractWorker: any = null;

    try {
      const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
      const isImage = selectedFile.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp)$/i.test(selectedFile.name);

      if (!isPdf && !isImage) {
        throw new Error('Format berkas tidak didukung. Harap pilih dokumen PDF atau foto scan (JPG, PNG, WebP).');
      }

      // KASUS 1: File adalah Gambar Biasa (JPG, PNG, WebP)
      if (isImage) {
        setStatusMessage('Menginisialisasi mesin OCR Tesseract AI...');
        setProgressPercent(20);

        const { createWorker } = await import('tesseract.js');
        tesseractWorker = await createWorker(ocrLanguage, 1, {
          logger: (m) => {
            if (m.status === 'recognizing text' && m.progress) {
              const p = Math.round(m.progress * 100);
              setProgressPercent(25 + Math.round(m.progress * 65));
              setSubProgress(`Mengenali karakter foto: ${p}%`);
            }
          },
        });

        setStatusMessage('Mengekstrak teks dari foto scan dokumen...');
        const ret = await tesseractWorker.recognize(selectedFile);
        const text = ret.data.text.trim();

        if (!text || text.length === 0) {
          throw new Error('Teks tidak terdeteksi pada gambar. Pastikan resolusi dan kontras tulisan terlihat jelas.');
        }

        setExtractedText(text);
        setTotalPages(1);
        setPageDetails([
          {
            pageNum: 1,
            source: 'ocr',
            charCount: text.length,
            wordCount: text.split(/\s+/).filter(Boolean).length,
          },
        ]);

        // Bangun Dokumen Word Awal
        const docTitle = selectedFile.name.replace(/\.[^/.]+$/, '');
        const docxBlob = await generateDocxBlob(text.split('\n'), docTitle);
        setDocxSize(docxBlob.size);

        setProgressPercent(100);
        setStatusMessage('🎉 Selesai! Teks berhasil diekstrak dan dokumen Word siap.');
        return;
      }

      // KASUS 2: Dokumen PDF (Mendukung Multi-Halaman & Hybrid Parsing)
      setStatusMessage('Membaca byte dokumen PDF...');
      setProgressPercent(10);

      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfjs = await loadPdfJs();

      let pdfDoc: any;
      try {
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        pdfDoc = await loadingTask.promise;
      } catch (pdfLoadErr: any) {
        if (pdfLoadErr?.name === 'PasswordException' || pdfLoadErr?.message?.toLowerCase().includes('password')) {
          throw new Error('Dokumen PDF ini diproteksi kata sandi. Silakan buka password PDF terlebih dahulu menggunakan alat Kunci & Buka Password PDF kami.');
        }
        throw new Error('Gagal membaca struktur PDF. Berkas mungkin rusak atau memiliki format biner tidak valid.');
      }

      const numPages = pdfDoc.numPages;
      setTotalPages(numPages);

      const pageResults: string[] = [];
      const details: PageExtractionDetail[] = [];

      for (let i = 1; i <= numPages; i++) {
        const pagePercentBase = 15 + Math.round(((i - 1) / numPages) * 75);
        setProgressPercent(pagePercentBase);
        setStatusMessage(`Menganalisis halaman ${i} dari ${numPages}...`);
        setSubProgress('');

        const page = await pdfDoc.getPage(i);

        let pageText = '';
        let usedSource: 'native' | 'ocr' = 'native';

        // Langkah A: Coba ekstraksi teks asli (Native Layer) jika mode bukan 'ocr_force'
        if (conversionMode !== 'ocr_force') {
          const textContent = await page.getTextContent();
          pageText = reconstructNativePageText(textContent).trim();
        }

        // Validasi teks asli: hitung jumlah karakter alfabet/angka
        const cleanChars = pageText.replace(/[\s\r\n\t]/g, '');
        const validWordMatches = cleanChars.match(/[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/g);
        const validCharCount = validWordMatches ? validWordMatches.length : 0;

        // Langkah B: Jika teks asli minim (< 25 karakter) dan bukan mode 'native_only', jalankan fallback OCR
        const needOcr = (validCharCount < 25 && conversionMode !== 'native_only') || conversionMode === 'ocr_force';

        if (needOcr) {
          usedSource = 'ocr';
          setStatusMessage(`Halaman ${i} terdeteksi sebagai dokumen scan. Menjalankan OCR AI...`);

          // Render halaman PDF ke kanvas beresolusi tajam (2x scale / ~150-200 DPI)
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Tidak dapat membuat konteks kanvas untuk memproses OCR.');
          }

          await page.render({ canvasContext: ctx, viewport }).promise;

          // Lazy initialize Tesseract Worker sekali saja untuk halaman yang membutuhkan
          if (!tesseractWorker) {
            setSubProgress('Memuat kamus bahasa OCR...');
            const { createWorker } = await import('tesseract.js');
            tesseractWorker = await createWorker(ocrLanguage, 1, {
              logger: (m) => {
                if (m.status === 'recognizing text' && m.progress) {
                  const subP = Math.round(m.progress * 100);
                  setSubProgress(`OCR Hal ${i}: ${subP}%`);
                }
              },
            });
          }

          const ret = await tesseractWorker.recognize(canvas);
          pageText = ret.data.text.trim();
        }

        // Bersihkan karakter kontrol biner yang tidak valid agar tidak menghasilkan gibberish
        const sanitizedText = pageText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();

        if (sanitizedText.length > 0) {
          pageResults.push(`[ Halaman ${i} ]\n${sanitizedText}`);
        } else {
          pageResults.push(`[ Halaman ${i} ]\n(Halaman kosong atau tidak terdeteksi teks)`);
        }

        details.push({
          pageNum: i,
          source: usedSource,
          charCount: sanitizedText.length,
          wordCount: sanitizedText.split(/\s+/).filter(Boolean).length,
        });
      }

      const combinedText = pageResults.join('\n\n---\n\n');

      if (!combinedText || combinedText.replace(/\[ Halaman \d+ \]/g, '').trim().length === 0) {
        throw new Error('Tidak ada teks yang dapat diekstrak dari dokumen. Pastikan dokumen tidak kosong atau terkunci.');
      }

      setExtractedText(combinedText);
      setPageDetails(details);

      // Siapkan ukuran awal file docx
      const docTitle = selectedFile.name.replace(/\.[^/.]+$/, '');
      const initialDocx = await generateDocxBlob(combinedText.split('\n'), docTitle);
      setDocxSize(initialDocx.size);

      setProgressPercent(100);
      setStatusMessage('🎉 Selesai! Seluruh halaman berhasil diekstrak dan siap diunduh.');
    } catch (err: any) {
      console.error('Error saat konversi PDF ke Word:', err);
      setErrorMessage(err?.message || 'Terjadi kesalahan teknis saat memproses dokumen.');
      setStatusMessage('');
    } finally {
      if (tesseractWorker) {
        try {
          await tesseractWorker.terminate();
        } catch (termErr) {
          console.warn('Gagal menutup worker:', termErr);
        }
      }
      setIsLoading(false);
    }
  };

  // Unduh Berkas Word (.docx) Berdasarkan Teks Terkini di Textarea
  const handleDownloadDocx = async () => {
    if (!extractedText.trim() || isGeneratingDocx) return;

    setIsGeneratingDocx(true);
    try {
      const paragraphs = extractedText.split('\n');
      const docTitle = selectedFile?.name.replace(/\.[^/.]+$/, '') || 'Dokumen_Hasil_Konversi_OCR';
      
      const blob = await generateDocxBlob(paragraphs, docTitle);
      setDocxSize(blob.size);

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${docTitle}_KompresKilat.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (docxErr: any) {
      console.error('Gagal membuat berkas .docx:', docxErr);
      setErrorMessage('Gagal menyusun berkas Word (.docx). Silakan coba salin teks secara manual.');
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  // Salin Teks ke Clipboard
  const handleCopyText = async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (cpErr) {
      console.warn('Gagal salin teks:', cpErr);
    }
  };

  // Hitung Statistik Teks
  const totalCharacters = extractedText.length;
  const totalWords = extractedText.split(/\s+/).filter(Boolean).length;
  const ocrPagesCount = pageDetails.filter((p) => p.source === 'ocr').length;
  const nativePagesCount = pageDetails.filter((p) => p.source === 'native').length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Konversi PDF ke Word dengan OCR Bahasa Indonesia & Inggris',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    featureList: 'Ekstraksi teks PDF digital, fallback OCR Tesseract AI untuk scan dokumen, live edit pratinjau, dan ekspor instan ke Word .docx 100% aman di browser.',
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-16">
      <JsonLd data={jsonLd} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header Bagian */}
        <div className="mb-8 text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] sm:text-xs px-3 py-1 rounded-full font-semibold border border-indigo-200/60 dark:border-indigo-800/60">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Dual Engine: Native PDF Parser + Tesseract OCR AI</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Konversi PDF ke Word (.docx) dengan OCR
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Ubah dokumen PDF digital maupun <b>PDF hasil foto scan kamera HP</b> menjadi berkas Microsoft Word siap edit. 100% diproses di memori browser Anda tanpa mengirim berkas ke server luar.
          </p>
        </div>

        {/* Kotak Unggah Berkas Dokumen */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Pilih Berkas Dokumen (PDF, Foto Scan JPG, atau PNG):
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900 transition cursor-pointer"
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
            Mendukung dokumen PDF teks, ijazah scan, kontrak kerja, draf laporan, dan foto kertas berkas (maksimal 50MB).
          </p>
        </div>

        {selectedFile && (
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 space-y-6">
            {/* Informasi Berkas Terpilih */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg">📄</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ukuran: <b>{formatBytes(selectedFile.size)}</b>
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                type="button"
                className="text-xs text-slate-400 hover:text-red-500 transition px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                title="Ganti Berkas"
              >
                Ganti Berkas
              </button>
            </div>

            {/* Opsi Mode Konversi & Bahasa OCR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pilihan Metode Ekstraksi */}
              <div className="p-4 bg-indigo-50/40 dark:bg-slate-800/40 rounded-xl border border-indigo-100/60 dark:border-slate-700/60 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Mode Ekstraksi Dokumen:</span>
                </label>
                <select
                  value={conversionMode}
                  onChange={(e) => setConversionMode(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="auto">⚡ Auto-Hybrid (Native + Fallback OCR Cerdas)</option>
                  <option value="native_only">⚡ Teks Asli Saja (Super Cepat &lt; 1 Detik)</option>
                  <option value="ocr_force">🤖 Paksa OCR Penuh (Untuk PDF Scan Kamera)</option>
                </select>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {conversionMode === 'auto' && 'Membaca teks digital terlebih dahulu. Jika halaman berupa foto scan, OCR AI akan aktif otomatis.'}
                  {conversionMode === 'native_only' && 'Mengabaikan OCR gambar, hanya mengambil layer teks asli dokumen digital.'}
                  {conversionMode === 'ocr_force' && 'Memindai seluruh piksel halaman menggunakan AI OCR (cocok untuk hasil fotocopy/scan).'}
                </p>
              </div>

              {/* Pilihan Bahasa Kamus OCR */}
              <div className="p-4 bg-indigo-50/40 dark:bg-slate-800/40 rounded-xl border border-indigo-100/60 dark:border-slate-700/60 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Kamus Bahasa OCR AI:</span>
                </label>
                <select
                  value={ocrLanguage}
                  onChange={(e) => setOcrLanguage(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="ind+eng">🇮🇩 Indonesia + 🇬🇧 Inggris (Rekomendasi)</option>
                  <option value="ind">🇮🇩 Bahasa Indonesia Saja</option>
                  <option value="eng">🇬🇧 Bahasa Inggris Saja</option>
                </select>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Memilih kamus bahasa yang tepat meningkatkan akurasi pengenalan huruf, angka, dan ejaan resmi.
                </p>
              </div>
            </div>

            {/* Tombol Eksekusi Konversi */}
            <button
              onClick={handleStartConversion}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-md disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Memproses Konversi Dokumen ({progressPercent}%)...</span>
                </>
              ) : (
                <span>Mulai Konversi PDF ke Word dengan OCR ⚡</span>
              )}
            </button>

            {/* Indikator Status & Progress Bar */}
            {isLoading && (
              <div className="space-y-2 pt-2 animate-in fade-in duration-200">
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2.5 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-600 dark:text-slate-400 font-medium gap-1">
                  <span>{statusMessage}</span>
                  {subProgress && (
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {subProgress}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Pesan Kesalahan / Peringatan */}
            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <div className="space-y-1">
                  <p className="font-bold">Gagal Mengonversi Dokumen</p>
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Hasil Ekstraksi & Pratinjau Teks Interaktif */}
            {extractedText && !isLoading && (
              <div className="p-5 bg-emerald-50/70 dark:bg-slate-800/80 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-4 animate-in fade-in duration-300">
                {/* Header Hasil & Tombol Unduh */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-emerald-200/80 dark:border-slate-700">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4" />
                      <span>🎉 Konversi Dokumen Selesai!</span>
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      Total: <b>{totalPages} Halaman</b> • <b>{totalWords.toLocaleString()} Kata</b> • <b>{totalCharacters.toLocaleString()} Karakter</b>
                      {docxSize > 0 && ` • Berkas Word: ${formatBytes(docxSize)}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleCopyText}
                      type="button"
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 transition shadow-sm cursor-pointer"
                      title="Salin Teks ke Clipboard"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Salin Teks</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleDownloadDocx}
                      disabled={isGeneratingDocx}
                      type="button"
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-md cursor-pointer disabled:bg-slate-300"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isGeneratingDocx ? 'Menyusun DOCX...' : 'Download Word (.docx)'}</span>
                    </button>
                  </div>
                </div>

                {/* Badge Rincian Sumber Ekstraksi */}
                {pageDetails.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Sumber Ekstraksi:</span>
                    {nativePagesCount > 0 && (
                      <span className="bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-medium border border-indigo-200/50">
                        ⚡ {nativePagesCount} Halaman Teks Digital (100% Akurat)
                      </span>
                    )}
                    {ocrPagesCount > 0 && (
                      <span className="bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-medium border border-amber-200/50">
                        🤖 {ocrPagesCount} Halaman OCR AI Tesseract
                      </span>
                    )}
                  </div>
                )}

                {/* Live Editable Text Area */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">
                      📝 Pratinjau Teks (Dapat Anda edit/koreksi langsung sebelum mengunduh):
                    </span>
                    <span>Teks di bawah ini yang akan diekspor ke Word</span>
                  </div>
                  <textarea
                    rows={12}
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    className="w-full p-4 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed transition resize-y shadow-inner"
                    placeholder="Teks dokumen hasil ekstraksi akan ditampilkan di sini..."
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                    💡 Tips: Anda dapat memperbaiki kata typo, menghapus bagian yang tidak dibutuhkan, atau menambah catatan. File Word (.docx) yang diunduh akan otomatis mengikuti perubahan teks di atas.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Slot Iklan Kepatuhan AdSense */}
        <div className="my-10 pt-4">
          <AdBanner zone="in-tool" label="Iklan Sponsor" />
        </div>

        {/* Panduan Edukasi & SEO: Nilai Tambah & Kepatuhan AdSense */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              💡 Cara Kerja Konversi PDF ke Word dengan OCR AI di KompresKilat
            </h2>
            <p>
              Berbeda dengan converter konvensional yang kerap menghasilkan baris acak atau teks berantakan, KompresKilat mengintegrasikan arsitektur <b>Dual-Engine Pipeline</b> yang secara cerdas membedakan halaman teks digital murni dari halaman foto scan fisik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs sm:text-sm">
                <span>⚡</span> 1. Ekstraksi Teks Asli
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Halaman digital dibaca langsung menggunakan mesin <b>PDF.js</b> berkecepatan tinggi dengan akurasi 100% tanpa kesalahan ejaan atau typo.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs sm:text-sm">
                <span>🤖</span> 2. Tesseract OCR AI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Jika halaman dideteksi sebagai foto kamera HP atau scan kertas kusam, mesin <b>Tesseract AI</b> memindai piksel citra pada resolusi tinggi 2.0x.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs sm:text-sm">
                <span>🔒</span> 3. Privasi Total
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Surat perjanjian, ijazah, atau SK dinas Anda tidak pernah diunggah ke server database. Seluruh komputasi berjalan di memori peramban pengunjung.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Tips Optimasi Hasil Konversi:</h4>
            <ul className="space-y-1.5 list-disc pl-5 text-slate-500 dark:text-slate-400">
              <li><b>Pilih Kamus Bahasa yang Sesuai:</b> Gunakan opsi <i>Indonesia + Inggris</i> untuk surat resmi, atau <i>Bahasa Indonesia Saja</i> untuk berkas berbahasa Indonesia penuh agar tidak terjadi salah deteksi ejaan.</li>
              <li><b>Koreksi Typo Langsung:</b> Sebelum mengunduh, Anda dapat memanfaatkan kotak pratinjau teks interaktif di atas untuk merapikan kalimat atau menghapus nomor halaman.</li>
              <li><b>Kompatibilitas Format:</b> File `.docx` yang diunduh berbasis standar Microsoft OpenXML resmi, dapat dibuka sempurna di Microsoft Office 2010 s/d 2024, Microsoft 365, Google Docs, Apple Pages, dan WPS Office.</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
