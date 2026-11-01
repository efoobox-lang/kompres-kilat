'use client';

import { useState, useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  Upload,
  Download,
  Edit3,
  PlusCircle,
  Trash2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';

interface DetectedTextItem {
  id: string;
  pageNum: number;
  originalText: string;
  currentText: string;
  pdfX: number;
  pdfY: number;
  pdfWidth: number;
  pdfHeight: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  isCustomAdd?: boolean;
}

const COLOR_OPTIONS = [
  { name: 'Hitam Teks', value: '#000000', rgb: [0, 0, 0] },
  { name: 'Biru Dokumen', value: '#1D4ED8', rgb: [0.11, 0.31, 0.85] },
  { name: 'Merah Koreksi', value: '#DC2626', rgb: [0.86, 0.15, 0.15] },
  { name: 'Abu-abu Netral', value: '#475569', rgb: [0.28, 0.33, 0.41] },
];

export default function DirectPdfEditorPage() {
  // State Dokumen PDF
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalBytes, setOriginalBytes] = useState<Uint8Array | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.25);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Mode Interaksi: 'select' (klik teks yang ada) atau 'add' (tambah teks baru)
  const [editorMode, setEditorMode] = useState<'select' | 'add'>('select');

  // Daftar Item Teks Terdeteksi & Yang Diedit
  const [pageDetectedItems, setPageDetectedItems] = useState<DetectedTextItem[]>([]);
  const [editedItems, setEditedItems] = useState<DetectedTextItem[]>([]);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);

  // Form Input Modal / Popover Edit
  const [editTextValue, setEditTextValue] = useState<string>('');
  const [editTextColor, setEditTextColor] = useState<string>('#000000');
  const [editTextSize, setEditTextSize] = useState<number>(12);

  // Status Download & Notifikasi
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // References & State Dimensi Halaman PDF
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfJsDocRef = useRef<unknown>(null);
  const [pdfPageDimensions, setPdfPageDimensions] = useState<{ width: number; height: number }>({ width: 595, height: 842 });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Inisialisasi & Muat PDF.js secara Dinamis
  const loadPdfJs = async () => {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version || '4.10.38'}/build/pdf.worker.min.mjs`;
    }
    return pdfjs;
  };

  // 2. Render Halaman PDF saat Ganti Halaman atau File
  const renderPdfPage = useCallback(
    async (doc: unknown, pageNum: number, currentScale: number) => {
      if (!doc || !canvasRef.current) return;
      setIsLoading(true);
      setStatusMessage('Merender tampilan halaman PDF...');

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdf = doc as any;
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: currentScale });

        setPdfPageDimensions({
          width: page.view[2] - page.view[0],
          height: page.view[3] - page.view[1],
        });

        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Render visual PDF ke canvas
        const renderContext = {
          canvasContext: ctx,
          viewport,
        };
        await page.render(renderContext).promise;

        // Ekstraksi posisi teks asli di halaman
        const textContent = await page.getTextContent();
        const detected: DetectedTextItem[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        textContent.items.forEach((item: any, idx: number) => {
          if (!item.str || !item.str.trim()) return;

          // Hitung koordinat PDF asli (titik 0,0 berada di kiri-bawah)
          const transX = item.transform[4];
          const transY = item.transform[5];
          const itemHeight = Math.abs(item.transform[0] || item.height || 12);
          const itemWidth = item.width || ctx.measureText(item.str).width;

          detected.push({
            id: `p${pageNum}_i${idx}`,
            pageNum,
            originalText: item.str,
            currentText: item.str,
            pdfX: transX,
            pdfY: transY,
            pdfWidth: itemWidth,
            pdfHeight: itemHeight,
            fontSize: Math.round(itemHeight),
            fontFamily: item.fontName || 'Helvetica',
            color: '#000000',
          });
        });

        setPageDetectedItems(detected);
        setStatusMessage('');
      } catch (err) {
        console.error('Error saat merender PDF:', err);
        setStatusMessage('Gagal merender halaman PDF.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 3. Tangani Upload File PDF Pengguna
  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Harap pilih berkas PDF yang valid.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Membaca berkas PDF ke dalam memori peramban...');
    setSelectedFile(file);
    setEditedItems([]);
    setActiveEditingId(null);

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      setOriginalBytes(bytes);

      const pdfjs = await loadPdfJs();
      const loadingTask = pdfjs.getDocument({
        data: bytes,
        cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/',
        cMapPacked: true,
      });

      const pdfDoc = await loadingTask.promise;
      pdfJsDocRef.current = pdfDoc;
      setTotalPages(pdfDoc.numPages);
      setCurrentPage(1);

      await renderPdfPage(pdfDoc, 1, scale);
      showToast(`Dokumen "${file.name}" siap diedit!`);
    } catch (err) {
      console.error('Gagal membuka PDF:', err);
      alert('Gagal memuat dokumen PDF. Pastikan file tidak terenkripsi kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Buat Contoh Dokumen Surat Dummy jika Pengguna Ingin Coba Cepat
  const handleLoadSamplePdf = async () => {
    setIsLoading(true);
    setStatusMessage('Menghasilkan contoh dokumen surat bisnis...');
    try {
      const samplePdf = await PDFDocument.create();
      const page = samplePdf.addPage([595, 842]); // Standar A4
      const fontBold = await samplePdf.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await samplePdf.embedFont(StandardFonts.Helvetica);

      page.drawText('SURAT PERJANJIAN KERJA SAMA BISNIS', {
        x: 60,
        y: 760,
        size: 18,
        font: fontBold,
        color: rgb(0.06, 0.09, 0.16),
      });

      page.drawText('Nomor Surat: 088/DIR-KK/XI/2026', {
        x: 60,
        y: 730,
        size: 11,
        font: fontRegular,
        color: rgb(0.4, 0.45, 0.55),
      });

      page.drawText('Pihak Pertama: PT Solusi Teknologi Nusantara', {
        x: 60,
        y: 680,
        size: 13,
        font: fontBold,
        color: rgb(0.1, 0.15, 0.25),
      });

      page.drawText('Beralamat di Jalan Merdeka No. 45, Jakarta Pusat.', {
        x: 60,
        y: 660,
        size: 12,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.2),
      });

      page.drawText('Nilai Kontrak: Rp 45.000.000,- (Empat Puluh Lima Juta Rupiah)', {
        x: 60,
        y: 610,
        size: 13,
        font: fontBold,
        color: rgb(0.08, 0.4, 0.2),
      });

      page.drawText('Tanggal Pelaksanaan Dimulai: 01 Desember 2026', {
        x: 60,
        y: 570,
        size: 12,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.2),
      });

      page.drawText('Catatan: Klik kalimat mana saja di atas untuk langsung mengedit teksnya!', {
        x: 60,
        y: 520,
        size: 11,
        font: fontRegular,
        color: rgb(0.8, 0.1, 0.1),
      });

      const bytes = await samplePdf.save();
      setOriginalBytes(bytes);
      const fakeFile = new File([bytes as unknown as BlobPart], 'contoh_surat_perjanjian.pdf', { type: 'application/pdf' });
      setSelectedFile(fakeFile);
      setEditedItems([]);
      setActiveEditingId(null);

      const pdfjs = await loadPdfJs();
      const loadingTask = pdfjs.getDocument({ data: bytes });
      const pdfDoc = await loadingTask.promise;
      pdfJsDocRef.current = pdfDoc;
      setTotalPages(pdfDoc.numPages);
      setCurrentPage(1);

      await renderPdfPage(pdfDoc, 1, scale);
      showToast('Contoh dokumen berhasil dimuat! Silakan klik teks untuk mengedit.');
    } catch (err) {
      console.error('Gagal membuat contoh PDF:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigasi Halaman
  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || !pdfJsDocRef.current) return;
    setCurrentPage(newPage);
    setActiveEditingId(null);
    await renderPdfPage(pdfJsDocRef.current, newPage, scale);
  };

  // Zoom Kanvas
  const handleZoomChange = async (newScale: number) => {
    const clamped = Math.min(Math.max(newScale, 0.8), 2.2);
    setScale(clamped);
    if (pdfJsDocRef.current) {
      await renderPdfPage(pdfJsDocRef.current, currentPage, clamped);
    }
  };

  // Klik Item Teks untuk Mulai Edit
  const handleSelectItemToEdit = (item: DetectedTextItem) => {
    const alreadyEdited = editedItems.find((e) => e.id === item.id);
    setActiveEditingId(item.id);
    setEditTextValue(alreadyEdited ? alreadyEdited.currentText : item.originalText);
    setEditTextColor(alreadyEdited ? alreadyEdited.color : item.color);
    setEditTextSize(alreadyEdited ? alreadyEdited.fontSize : item.fontSize);
  };

  // Simpan Perubahan Teks Sementara di Sisi Klien
  const handleApplyTextEdit = () => {
    if (!activeEditingId) return;

    const baseItem =
      pageDetectedItems.find((i) => i.id === activeEditingId) ||
      editedItems.find((i) => i.id === activeEditingId);

    if (!baseItem) return;

    const updatedItem: DetectedTextItem = {
      ...baseItem,
      currentText: editTextValue,
      color: editTextColor,
      fontSize: editTextSize,
    };

    setEditedItems((prev) => {
      const filtered = prev.filter((i) => i.id !== activeEditingId);
      return [...filtered, updatedItem];
    });

    setActiveEditingId(null);
    showToast('Teks berhasil diperbarui!');
  };

  // Hapus / Batalkan Edit Teks Tertentu
  const handleRevertTextEdit = (itemId: string) => {
    setEditedItems((prev) => prev.filter((i) => i.id !== itemId));
    if (activeEditingId === itemId) {
      setActiveEditingId(null);
    }
    showToast('Perubahan teks dibatalkan.');
  };

  // Tambahkan Teks Kustom Baru di sembarang posisi saat mode 'add'
  const handleCanvasClickToAddText = (e: React.MouseEvent<HTMLDivElement>) => {
    if (editorMode !== 'add' || !canvasRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Konversi koordinat Viewport Canvas ke Koordinat PDF
    const pdfPageH = pdfPageDimensions.height;
    const pdfX = clickX / scale;
    const pdfY = pdfPageH - clickY / scale;

    const newCustomItem: DetectedTextItem = {
      id: `custom_${Date.now()}`,
      pageNum: currentPage,
      originalText: '',
      currentText: 'Teks Baru Ditambahkan',
      pdfX,
      pdfY,
      pdfWidth: 160,
      pdfHeight: 14,
      fontSize: 14,
      fontFamily: 'Helvetica',
      color: '#000000',
      isCustomAdd: true,
    };

    setEditedItems((prev) => [...prev, newCustomItem]);
    setActiveEditingId(newCustomItem.id);
    setEditTextValue('Teks Baru Ditambahkan');
    setEditTextColor('#000000');
    setEditTextSize(14);
    setEditorMode('select');
    showToast('Teks baru disisipkan. Silakan ubah kalimatnya!');
  };

  // 5. Simpan & Ekspor File PDF Menggunakan pdf-lib
  const handleSaveAndDownloadPdf = async () => {
    if (!originalBytes) {
      alert('Belum ada dokumen PDF yang dimuat.');
      return;
    }

    if (editedItems.length === 0) {
      alert('Belum ada teks yang diubah. Silakan klik kalimat yang ingin diedit terlebih dahulu.');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Menyematkan modifikasi teks langsung ke struktur PDF...');

    try {
      // Muat dokumen PDF asli dengan pdf-lib
      const pdfDoc = await PDFDocument.load(originalBytes);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Iterasi seluruh teks yang dimodifikasi
      for (const item of editedItems) {
        const pageIndex = item.pageNum - 1;
        if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) continue;

        const page = pdfDoc.getPage(pageIndex);

        // Jika ini pengeditan teks asli (bukan teks baru): Tutup teks lama dengan blok putih
        if (!item.isCustomAdd && item.pdfWidth > 0 && item.pdfHeight > 0) {
          page.drawRectangle({
            x: Math.max(0, item.pdfX - 1.5),
            y: Math.max(0, item.pdfY - 1.5),
            width: item.pdfWidth + 3,
            height: item.pdfHeight + 3,
            color: rgb(1, 1, 1), // Putih murni untuk menutup teks lama
          });
        }

        // Tulis teks baru di atas posisi yang sama
        if (item.currentText.trim()) {
          const matchedColor = COLOR_OPTIONS.find((c) => c.value === item.color)?.rgb || [0, 0, 0];
          page.drawText(item.currentText, {
            x: item.pdfX,
            y: item.pdfY,
            size: item.fontSize,
            font: item.fontSize >= 15 ? helveticaBold : helvetica,
            color: rgb(matchedColor[0], matchedColor[1], matchedColor[2]),
          });
        }
      }

      // Simpan berkas PDF baru
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      const baseName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'dokumen';
      link.download = `${baseName}_edited_${Date.now()}.pdf`;
      link.href = downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      showToast('PDF berhasil diperbarui dan diunduh!');
    } catch (err) {
      console.error('Gagal menyimpan PDF:', err);
      alert('Terjadi kendala saat menyematkan teks ke PDF. Pastikan font dokumen didukung.');
    } finally {
      setIsSaving(false);
      setStatusMessage('');
    }
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Direct PDF Text Editor - KompresKilat',
    description: 'Aplikasi online gratis untuk mengedit kalimat teks PDF langsung di browser tanpa upload ke server, menggunakan teknologi PDF.js dan pdf-lib.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={schemaData} />
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Header Hero */}
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-800 text-xs px-3.5 py-1 rounded-full font-bold mb-3 shadow-xs">
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
            📄 Direct PDF Text Editor (100% Client-Side)
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">
            Edit Teks PDF Langsung di Browser
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Perbaiki typo nama, ganti angka nominal, ubah tanggal, atau sisipkan kalimat baru pada dokumen PDF Anda secara instan tanpa perlu konversi rumit. Dokumen 100% diproses di browser tanpa diunggah ke server luar.
          </p>
        </div>

        {/* Toolbar & Status Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
          
          {/* Pilihan File / Upload */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Buka Dokumen PDF</span>
            </button>

            {!selectedFile && (
              <button
                type="button"
                onClick={handleLoadSamplePdf}
                disabled={isLoading}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Coba Contoh Surat PDF</span>
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf,.pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f);
              }}
              className="hidden"
            />

            {selectedFile && (
              <span className="text-xs font-semibold text-slate-700 truncate max-w-[180px] sm:max-w-xs bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                📄 {selectedFile.name}
              </span>
            )}
          </div>

          {/* Mode Pemilihan & Tombol Tambah Teks */}
          {totalPages > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setEditorMode('select')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    editorMode === 'select'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Pilih &amp; Ubah Teks</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditorMode('add')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    editorMode === 'add'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Tambah Teks Baru</span>
                </button>
              </div>

              {/* Tombol Simpan & Unduh */}
              <button
                type="button"
                onClick={handleSaveAndDownloadPdf}
                disabled={isSaving || editedItems.length === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Menyimpan...' : `Simpan & Unduh (${editedItems.length})`}</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifikasi Status Memuat */}
        {statusMessage && (
          <div className="p-3 mb-6 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800 font-semibold flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Layout Area Editor & Pratinjau */}
        {totalPages > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12">
            
            {/* Kolom Kiri: Navigasi & Daftar Perubahan (4 Kolom) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Box Navigasi Halaman & Zoom */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Navigasi Dokumen
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    Hal. {currentPage} / {totalPages}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoading}
                    className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isLoading}
                    className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Berikutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Kontrol Zoom */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="font-semibold text-slate-600">Perbesaran Kanvas:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleZoomChange(scale - 0.2)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
                      title="Perkecil"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold w-12 text-center text-slate-800">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => handleZoomChange(scale + 0.2)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
                      title="Perbesar"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Panel Edit Aktif jika ada item yang dipilih */}
              {activeEditingId && (
                <div className="bg-white p-5 rounded-2xl border-2 border-indigo-500 shadow-md space-y-3.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5" /> Edit Kalimat Terpilih
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveEditingId(null)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                    >
                      Tutup ✕
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Ketik Ulang Teks Baru:
                    </label>
                    <textarea
                      rows={2}
                      value={editTextValue}
                      onChange={(e) => setEditTextValue(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Warna Teks:</label>
                      <select
                        value={editTextColor}
                        onChange={(e) => setEditTextColor(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                      >
                        {COLOR_OPTIONS.map((c, i) => (
                          <option key={i} value={c.value}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ukuran Font:</label>
                      <input
                        type="number"
                        min="8"
                        max="72"
                        value={editTextSize}
                        onChange={(e) => setEditTextSize(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyTextEdit}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
                  >
                    Terapkan Perubahan Ini ✓
                  </button>
                </div>
              )}

              {/* Daftar Perubahan Teks (History Edit) */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" /> Daftar Perubahan ({editedItems.length})
                  </span>
                </div>

                {editedItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Belum ada teks yang diedit. Klik kalimat mana pun pada pratinjau PDF di sebelah kanan untuk mengubahnya.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {editedItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-indigo-600 block">
                            Hal. {item.pageNum} {item.isCustomAdd ? '• Teks Baru' : '• Edit'}
                          </span>
                          {!item.isCustomAdd && (
                            <p className="text-[10px] text-slate-400 line-through truncate max-w-[190px]">
                              {item.originalText}
                            </p>
                          )}
                          <p className="font-semibold text-slate-800 truncate max-w-[190px]">
                            {item.currentText}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRevertTextEdit(item.id)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition cursor-pointer"
                          title="Hapus Perubahan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Kolom Kanan: Area Kanvas & Lapisan Interaktif (8 Kolom) */}
            <div className="lg:col-span-8 space-y-3">
              
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  {editorMode === 'select'
                    ? '💡 Arahkan kursor dan klik pada teks berwarna biru untuk mengedit kalimat.'
                    : '➕ Klik di sembarang area dokumen untuk menyisipkan teks baru.'}
                </span>
                <span className="font-semibold text-indigo-600">
                  {pageDetectedItems.length} Kalimat Terdeteksi
                </span>
              </div>

              {/* Kontainer Kanvas & Lapisan Teks Transparan */}
              <div
                className={`relative bg-slate-200 border-2 border-slate-300 rounded-2xl p-2 sm:p-4 flex justify-center items-start overflow-auto max-h-[780px] shadow-inner select-none ${
                  editorMode === 'add' ? 'cursor-crosshair' : 'cursor-default'
                }`}
                onClick={handleCanvasClickToAddText}
              >
                <div className="relative shadow-xl bg-white rounded-lg overflow-hidden">
                  
                  {/* Kanvas PDF.js Asli */}
                  <canvas ref={canvasRef} className="block max-w-none" />

                  {/* Lapisan Teks Terdeteksi (Interactive Overlay) */}
                  <div className="absolute inset-0 pointer-events-none">
                    {pageDetectedItems.map((item) => {
                      // Hitung posisi relatif di atas kanvas berdasarkan koordinat PDF dan skala
                      const pdfPageH = pdfPageDimensions.height;
                      const posX = item.pdfX * scale;
                      const posY = (pdfPageH - item.pdfY - item.pdfHeight) * scale;
                      const itemW = Math.max(item.pdfWidth * scale, 30);
                      const itemH = Math.max(item.pdfHeight * scale, 14);

                      const edited = editedItems.find((e) => e.id === item.id);
                      const isSelected = activeEditingId === item.id;

                      return (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectItemToEdit(item);
                          }}
                          style={{
                            left: `${posX}px`,
                            top: `${posY}px`,
                            width: `${itemW}px`,
                            height: `${itemH}px`,
                          }}
                          title={`Klik untuk edit: "${edited ? edited.currentText : item.originalText}"`}
                          className={`absolute pointer-events-auto transition-all cursor-pointer rounded-xs ${
                            isSelected
                              ? 'ring-2 ring-indigo-600 bg-indigo-500/25 z-20'
                              : edited
                              ? 'bg-amber-400/30 border border-amber-500/60 z-10'
                              : 'hover:bg-indigo-500/15 hover:border hover:border-indigo-400/50'
                          }`}
                        >
                          {edited && (
                            <span className="absolute -top-3.5 left-0 text-[9px] bg-amber-500 text-slate-900 font-bold px-1 rounded shadow-xs truncate max-w-[120px]">
                              {edited.currentText}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Teks Kustom yang Ditambahkan */}
                    {editedItems
                      .filter((e) => e.pageNum === currentPage && e.isCustomAdd)
                      .map((item) => {
                        const pdfPageH = pdfPageDimensions.height;
                        const posX = item.pdfX * scale;
                        const posY = (pdfPageH - item.pdfY) * scale;

                        return (
                          <div
                            key={item.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectItemToEdit(item);
                            }}
                            style={{
                              left: `${posX}px`,
                              top: `${posY}px`,
                            }}
                            className="absolute pointer-events-auto p-1 bg-white/90 border border-indigo-500 rounded shadow-md cursor-pointer text-xs font-semibold"
                          >
                            <span style={{ color: item.color, fontSize: `${item.fontSize * scale}px` }}>
                              {item.currentText}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tampilan Dropzone Kosong Awal */
          <div className="bg-white p-8 sm:p-14 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 transition text-center space-y-4 mb-12">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              📄
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Pilih Dokumen PDF yang Ingin Diedit
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Unggah dokumen surat, sertifikat, laporan invoice, atau formulir PDF. Seluruh teks akan dideteksi dan dapat diedit langsung di layar.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition duration-150 shadow-sm cursor-pointer"
              >
                Pilih Berkas PDF dari Komputer / HP
              </button>

              <button
                type="button"
                onClick={handleLoadSamplePdf}
                disabled={isLoading}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Buka Contoh Surat PDF</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 pt-3">
              🛡️ Privasi 100% Terjamin: Dokumen diproses murni pada memori browser Anda menggunakan teknologi PDF.js dan pdf-lib tanpa dikirim ke server.
            </p>
          </div>
        )}

        {/* Slot Iklan Kepatuhan AdSense */}
        <div className="my-10 pt-4">
          <AdBanner zone="in-tool" label="Iklan Sponsor" />
        </div>

        {/* Konten Edukasi & SEO: Panduan Cara Mengedit Teks PDF */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-600 text-xs sm:text-sm leading-relaxed">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 mb-2">
              💡 Cara Kerja Direct PDF Text Editor di Browser (Tanpa Install Aplikasi)
            </h2>
            <p>
              Mengedit berkas PDF selama ini dianggap sulit karena format PDF dirancang sebagai format dokumen final cetak (*print-ready*). Umumnya pengguna harus mengonversi PDF ke Word terlebih dahulu, memperbaikinya, lalu mengekspornya kembali ke PDF sehingga seringkali merusak kerapian tata letak (*layout formatting*).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <span>🔍</span> 1. Deteksi Koordinat Teks
              </h3>
              <p className="text-xs text-slate-500">
                Mesin <b>PDF.js</b> membaca matriks tipografi pada dokumen dan memetakan setiap kalimat ke koordinat piksel yang presisi di atas layar browser Anda.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <span>✏️</span> 2. Modifikasi Teks Presisi
              </h3>
              <p className="text-xs text-slate-500">
                Saat Anda mengedit kalimat, teknologi <b>pdf-lib</b> menyematkan tambalan putih (*whiteout block*) di bawah teks lama dan mencetak teks baru dengan ukuran dan warna font yang selaras.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <span>🔒</span> 3. Tanpa Risiko Kebocoran Data
              </h3>
              <p className="text-xs text-slate-500">
                Surat perjanjian, nilai kontrak, nomor rekening, atau ijazah Anda aman dari pencurian data karena seluruh pemrosesan kode berjalan 100% di peramban lokal pengunjung.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800">Tips Penggunaan:</h4>
            <ul className="space-y-1.5 list-disc pl-5 text-slate-500">
              <li><b>Koreksi Typo Cepat:</b> Klik kalimat yang ingin Anda perbaiki, ganti kata yang salah, lalu klik tombol <b>Terapkan Perubahan</b>.</li>
              <li><b>Menambahkan Catatan Baru:</b> Gunakan tombol <b>Tambah Teks Baru</b> di toolbar atas, lalu klik di sembarang posisi dokumen untuk menuliskan teks atau catatan tambahan.</li>
              <li><b>Unduh Hasil Akhir:</b> Klik tombol <b>Simpan &amp; Unduh</b> untuk mengekspor dokumen PDF baru siap kirim.</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
