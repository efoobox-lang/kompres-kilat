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
  Layers,
  Move
} from 'lucide-react';

interface TextEditItem {
  id: string;
  pageNum: number;
  originalText: string;
  currentText: string;
  // Posisi asli teks pada PDF
  origPdfX: number;
  origPdfY: number;
  origPdfWidth: number;
  origPdfHeight: number;
  // Posisi saat ini (dapat digeser / drag-and-drop)
  pdfX: number;
  pdfY: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  isDeleted: boolean; // Jika true, teks lama ditutup putih (redacted/dihapus)
  isCustomAdd?: boolean; // Jika true, teks baru yang disisipkan pengguna
}

const COLOR_OPTIONS = [
  { name: 'Hitam Teks', value: '#000000', rgb: [0, 0, 0] },
  { name: 'Biru Dokumen', value: '#1D4ED8', rgb: [0.11, 0.31, 0.85] },
  { name: 'Merah Koreksi', value: '#DC2626', rgb: [0.86, 0.15, 0.15] },
  { name: 'Abu-abu Netral', value: '#475569', rgb: [0.28, 0.33, 0.41] },
  { name: 'Hijau Resmi', value: '#059669', rgb: [0.02, 0.59, 0.41] },
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

  // Dimensi Halaman PDF Aktif
  const [pdfPageDimensions, setPdfPageDimensions] = useState<{ width: number; height: number }>({
    width: 595,
    height: 842,
  });

  // Item Teks Terdeteksi di Halaman Aktif & Seluruh Perubahan Pengguna
  const [pageDetectedItems, setPageDetectedItems] = useState<TextEditItem[]>([]);
  const [editedItems, setEditedItems] = useState<TextEditItem[]>([]);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);

  // Form Input Edit Aktif
  const [editTextValue, setEditTextValue] = useState<string>('');
  const [editTextColor, setEditTextColor] = useState<string>('#000000');
  const [editTextSize, setEditTextSize] = useState<number>(12);

  // Status Download & Notifikasi
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfJsDocRef = useRef<unknown>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Inisialisasi & Muat PDF.js secara Dinamis (Menggunakan Worker Lokal)
  const loadPdfJs = async () => {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }
    return pdfjs;
  };

  // 2. Render Halaman PDF ke Canvas
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

        const pageW = page.view[2] - page.view[0];
        const pageH = page.view[3] - page.view[1];
        setPdfPageDimensions({ width: pageW, height: pageH });

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

        // Ekstraksi posisi teks asli di halaman menggunakan PDF.js
        const textContent = await page.getTextContent();
        const detected: TextEditItem[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        textContent.items.forEach((item: any, idx: number) => {
          if (!item.str || !item.str.trim()) return;

          const transX = item.transform[4];
          const transY = item.transform[5];
          const itemHeight = Math.abs(item.transform[0] || item.height || 12);
          const itemWidth = item.width || ctx.measureText(item.str).width;

          detected.push({
            id: `p${pageNum}_i${idx}`,
            pageNum,
            originalText: item.str,
            currentText: item.str,
            origPdfX: transX,
            origPdfY: transY,
            origPdfWidth: itemWidth,
            origPdfHeight: itemHeight,
            pdfX: transX,
            pdfY: transY,
            fontSize: Math.round(itemHeight),
            fontFamily: item.fontName || 'Helvetica',
            color: '#000000',
            isDeleted: false,
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
      const loadingTask = pdfjs.getDocument({ data: bytes });
      const pdfDoc = await loadingTask.promise;
      pdfJsDocRef.current = pdfDoc;
      setTotalPages(pdfDoc.numPages);
      setCurrentPage(1);

      await renderPdfPage(pdfDoc, 1, scale);
      showToast(`Dokumen "${file.name}" siap diedit!`);
    } catch (err) {
      console.error('Gagal membuka PDF:', err);
      alert('Gagal memuat dokumen PDF. Pastikan file tidak terkunci kata sandi.');
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
        y: 655,
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

      page.drawText('Tanggal Pelaksanaan: 01 Desember 2026', {
        x: 60,
        y: 570,
        size: 12,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.2),
      });

      page.drawText('Catatan: Klik kalimat mana saja untuk edit, hapus, atau geser posisinya!', {
        x: 60,
        y: 520,
        size: 11,
        font: fontRegular,
        color: rgb(0.8, 0.1, 0.1),
      });

      const bytes = await samplePdf.save();
      setOriginalBytes(bytes);
      const fakeFile = new File([bytes as unknown as BlobPart], 'contoh_surat_perjanjian.pdf', {
        type: 'application/pdf',
      });
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
      showToast('Contoh dokumen berhasil dimuat! Silakan klik teks untuk mengedit atau menggeser.');
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
  const handleSelectItemToEdit = (item: TextEditItem) => {
    const existing = editedItems.find((e) => e.id === item.id);
    setActiveEditingId(item.id);
    setEditTextValue(existing ? existing.currentText : item.originalText);
    setEditTextColor(existing ? existing.color : item.color);
    setEditTextSize(existing ? existing.fontSize : item.fontSize);
  };

  // Simpan Perubahan Teks
  const handleApplyTextEdit = () => {
    if (!activeEditingId) return;

    const baseItem =
      pageDetectedItems.find((i) => i.id === activeEditingId) ||
      editedItems.find((i) => i.id === activeEditingId);

    if (!baseItem) return;

    const existing = editedItems.find((e) => e.id === activeEditingId);

    const updatedItem: TextEditItem = {
      ...baseItem,
      pdfX: existing ? existing.pdfX : baseItem.pdfX,
      pdfY: existing ? existing.pdfY : baseItem.pdfY,
      currentText: editTextValue,
      color: editTextColor,
      fontSize: editTextSize,
      isDeleted: false,
    };

    setEditedItems((prev) => {
      const filtered = prev.filter((i) => i.id !== activeEditingId);
      return [...filtered, updatedItem];
    });

    setActiveEditingId(null);
    showToast('Teks berhasil diperbarui!');
  };

  // Hapus Teks (Redact / Tutup Putih pada Dokumen)
  const handleDeleteTextItem = (itemId: string) => {
    const baseItem =
      pageDetectedItems.find((i) => i.id === itemId) ||
      editedItems.find((i) => i.id === itemId);

    if (!baseItem) return;

    // Jika ini adalah teks yang baru dibuat pengguna (bukan teks asli PDF), langsung buang dari state
    if (baseItem.isCustomAdd) {
      setEditedItems((prev) => prev.filter((i) => i.id !== itemId));
    } else {
      // Jika teks asli PDF: tandai sebagai isDeleted agar ditutup patch putih saat diekspor
      const deletedItem: TextEditItem = {
        ...baseItem,
        isDeleted: true,
        currentText: '',
      };
      setEditedItems((prev) => {
        const filtered = prev.filter((i) => i.id !== itemId);
        return [...filtered, deletedItem];
      });
    }

    if (activeEditingId === itemId) {
      setActiveEditingId(null);
    }
    showToast('Teks berhasil dihapus (ditutup putih).');
  };

  // Batalkan Hapus / Kembalikan Teks Asli
  const handleRestoreTextItem = (itemId: string) => {
    setEditedItems((prev) => prev.filter((i) => i.id !== itemId));
    showToast('Teks asli dikembalikan.');
  };

  // Tambahkan Teks Baru di Tengah Halaman saat tombol diklik
  const handleAddNewTextBlock = () => {
    const pdfPageH = pdfPageDimensions.height;
    const initialPdfX = 60;
    const initialPdfY = Math.round(pdfPageH * 0.5);

    const newCustomItem: TextEditItem = {
      id: `custom_${Date.now()}`,
      pageNum: currentPage,
      originalText: '',
      currentText: 'Ketik Teks Baru di Sini',
      origPdfX: initialPdfX,
      origPdfY: initialPdfY,
      origPdfWidth: 180,
      origPdfHeight: 16,
      pdfX: initialPdfX,
      pdfY: initialPdfY,
      fontSize: 14,
      fontFamily: 'Helvetica',
      color: '#000000',
      isDeleted: false,
      isCustomAdd: true,
    };

    setEditedItems((prev) => [...prev, newCustomItem]);
    setActiveEditingId(newCustomItem.id);
    setEditTextValue('Ketik Teks Baru di Sini');
    setEditTextColor('#000000');
    setEditTextSize(14);
    showToast('Kotak teks baru ditambahkan! Anda dapat menggeser posisinya.');
  };

  // 5. Fitur Geser Teks (Drag & Drop Repositioning)
  const handleStartDrag = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    itemId: string
  ) => {
    e.stopPropagation();

    const isTouch = 'touches' in e;
    const startClientX = isTouch ? e.touches[0].clientX : e.clientX;
    const startClientY = isTouch ? e.touches[0].clientY : e.clientY;

    // Cari item di editedItems atau dari pageDetectedItems
    const existing = editedItems.find((i) => i.id === itemId);
    const base = pageDetectedItems.find((i) => i.id === itemId);
    const targetItem = existing || base;
    if (!targetItem) return;

    const initialPdfX = targetItem.pdfX;
    const initialPdfY = targetItem.pdfY;

    // Pastikan item terdaftar di editedItems saat mulai digeser
    if (!existing && base) {
      setEditedItems((prev) => [...prev, { ...base }]);
    }

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = (moveClientX - startClientX) / scale;
      const deltaY = (moveClientY - startClientY) / scale;

      // Pada koordinat PDF, Y berawal dari bawah; sehingga pergerakan ke bawah di layar mengurangi nilai Y
      const newPdfX = Math.round(initialPdfX + deltaX);
      const newPdfY = Math.round(initialPdfY - deltaY);

      setEditedItems((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, pdfX: newPdfX, pdfY: newPdfY } : it))
      );
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      showToast('Posisi teks berhasil dipindahkan!');
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  // 6. Simpan & Ekspor File PDF Menggunakan pdf-lib
  const handleSaveAndDownloadPdf = async () => {
    if (!originalBytes) {
      alert('Belum ada dokumen PDF yang dimuat.');
      return;
    }

    if (editedItems.length === 0) {
      alert('Belum ada teks yang diubah, dihapus, atau ditambahkan.');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Menyematkan modifikasi teks langsung ke struktur PDF...');

    try {
      const pdfDoc = await PDFDocument.load(originalBytes);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      for (const item of editedItems) {
        const pageIndex = item.pageNum - 1;
        if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) continue;

        const page = pdfDoc.getPage(pageIndex);

        // 1. Jika ini teks asli PDF: Tutup lokasi aslinya dengan blok putih bersih
        if (!item.isCustomAdd && item.origPdfWidth > 0 && item.origPdfHeight > 0) {
          page.drawRectangle({
            x: Math.max(0, item.origPdfX - 1.5),
            y: Math.max(0, item.origPdfY - 1.5),
            width: item.origPdfWidth + 3,
            height: item.origPdfHeight + 3,
            color: rgb(1, 1, 1), // Menghapus teks asli secara visual
          });
        }

        // 2. Jika tidak dihapus: Tulis teks baru pada koordinat pdfX dan pdfY (posisi hasil geser)
        if (!item.isDeleted && item.currentText.trim()) {
          const matchedColor = COLOR_OPTIONS.find((c) => c.value === item.color)?.rgb || [0, 0, 0];
          page.drawText(item.currentText, {
            x: Math.max(0, item.pdfX),
            y: Math.max(0, item.pdfY),
            size: Math.max(8, item.fontSize),
            font: item.fontSize >= 15 ? helveticaBold : helvetica,
            color: rgb(matchedColor[0], matchedColor[1], matchedColor[2]),
          });
        }
      }

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

      showToast('PDF hasil edit berhasil disimpan dan diunduh!');
    } catch (err) {
      console.error('Gagal menyimpan PDF:', err);
      alert('Terjadi kendala saat menyematkan teks ke PDF.');
    } finally {
      setIsSaving(false);
      setStatusMessage('');
    }
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Direct PDF Text Editor - KompresKilat',
    description: 'Aplikasi online gratis untuk edit teks, hapus kalimat, tambah tulisan baru, dan geser posisi teks langsung di dokumen PDF tanpa konversi.',
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
            Edit, Hapus &amp; Geser Teks PDF di Browser
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Koreksi typo teks asli, hapus kalimat, tambahkan teks baru, dan <b>geser posisinya secara bebas</b> pada dokumen PDF Anda tanpa merusak tata letak. 100% aman di browser tanpa upload server.
          </p>
        </div>

        {/* Toolbar Utama */}
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

          {/* Aksi Toolbar PDF: Tambah Teks & Simpan */}
          {totalPages > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleAddNewTextBlock}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tambah Teks Baru (+)</span>
              </button>

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

        {/* Notifikasi Status Loading */}
        {statusMessage && (
          <div className="p-3 mb-6 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800 font-semibold flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Layout Area Editor & Pratinjau Interaktif */}
        {totalPages > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12">
            
            {/* Kolom Kiri: Navigasi & Panel Edit & Daftar Modifikasi (4 Kolom) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Box Navigasi Halaman & Zoom */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Navigasi Halaman
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
                  <span className="font-semibold text-slate-600">Skala Tampilan:</span>
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

              {/* Panel Edit Aktif jika ada teks yang dipilih */}
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

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleApplyTextEdit}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
                    >
                      Terapkan Teks Ini ✓
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTextItem(activeEditingId)}
                      className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition cursor-pointer"
                      title="Hapus / Tutup Teks Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 italic">
                    💡 Tips: Anda dapat langsung menggeser teks ini di pratinjau kanvas menggunakan mouse atau sentuhan jari.
                  </p>
                </div>
              )}

              {/* Daftar Perubahan Teks (History Edit & Delete) */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" /> Riwayat Modifikasi ({editedItems.length})
                  </span>
                </div>

                {editedItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Belum ada teks yang dimodifikasi. Klik kalimat pada halaman PDF di samping untuk mengedit, menghapus, atau menggeser posisinya.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {editedItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl border flex items-start justify-between gap-2 text-xs ${
                          item.isDeleted
                            ? 'bg-red-50/60 border-red-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="min-w-0">
                          <span
                            className={`text-[10px] font-bold block ${
                              item.isDeleted ? 'text-red-600' : 'text-indigo-600'
                            }`}
                          >
                            Hal. {item.pageNum} •{' '}
                            {item.isDeleted
                              ? 'Dihapus (Ditutup Putih)'
                              : item.isCustomAdd
                              ? 'Teks Baru'
                              : 'Diedit / Digeser'}
                          </span>

                          {item.isDeleted ? (
                            <p className="text-[11px] text-slate-400 line-through truncate max-w-[190px]">
                              {item.originalText}
                            </p>
                          ) : (
                            <>
                              {!item.isCustomAdd && (
                                <p className="text-[10px] text-slate-400 line-through truncate max-w-[190px]">
                                  {item.originalText}
                                </p>
                              )}
                              <p className="font-semibold text-slate-800 truncate max-w-[190px]">
                                {item.currentText}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {item.isDeleted ? (
                            <button
                              type="button"
                              onClick={() => handleRestoreTextItem(item.id)}
                              className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded cursor-pointer"
                              title="Kembalikan Teks Asli"
                            >
                              Kembalikan
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeleteTextItem(item.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded transition cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Kolom Kanan: Area Kanvas PDF & Lapisan Teks Interaktif yang Bisa Digeser (8 Kolom) */}
            <div className="lg:col-span-8 space-y-3">
              
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 gap-2">
                <span className="flex items-center gap-1">
                  <Move className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    Klik teks untuk mengedit atau <b>seret teks untuk memindahkan posisinya</b>.
                  </span>
                </span>
                <span className="font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  {pageDetectedItems.length} Elemen Teks
                </span>
              </div>

              {/* Kontainer Kanvas Scrollable */}
              <div className="relative bg-slate-200 border-2 border-slate-300 rounded-2xl p-2 sm:p-4 flex justify-center items-start overflow-auto max-h-[780px] shadow-inner select-none">
                <div className="relative shadow-xl bg-white rounded-lg overflow-hidden">
                  
                  {/* Kanvas PDF.js Asli */}
                  <canvas ref={canvasRef} className="block max-w-none" />

                  {/* Lapisan Interaktif: Deteksi, Edit, Hapus & Geser */}
                  <div className="absolute inset-0 pointer-events-none">
                    
                    {/* A. Teks Asli yang Terdeteksi di Halaman */}
                    {pageDetectedItems.map((item) => {
                      const edited = editedItems.find((e) => e.id === item.id);
                      const isDeleted = edited?.isDeleted;

                      // Posisi teks (gunakan posisi hasil geser jika sudah pernah digeser)
                      const targetPdfX = edited ? edited.pdfX : item.pdfX;
                      const targetPdfY = edited ? edited.pdfY : item.pdfY;

                      const posX = targetPdfX * scale;
                      const posY = (pdfPageDimensions.height - targetPdfY - item.origPdfHeight) * scale;
                      const itemW = Math.max(item.origPdfWidth * scale, 30);
                      const itemH = Math.max(item.origPdfHeight * scale, 14);

                      const isSelected = activeEditingId === item.id;

                      if (isDeleted) {
                        // Tampilan saat teks ditandai dihapus (ditutup blok putih transparan)
                        return (
                          <div
                            key={item.id}
                            style={{
                              left: `${item.origPdfX * scale}px`,
                              top: `${(pdfPageDimensions.height - item.origPdfY - item.origPdfHeight) * scale}px`,
                              width: `${itemW}px`,
                              height: `${itemH}px`,
                            }}
                            className="absolute pointer-events-auto bg-white/90 border border-red-300 text-red-500 rounded-xs flex items-center justify-between px-1 z-10"
                          >
                            <span className="text-[9px] font-bold truncate">[Dihapus]</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestoreTextItem(item.id);
                              }}
                              className="text-[9px] text-slate-500 hover:text-slate-800 underline cursor-pointer ml-1"
                            >
                              Batal
                            </button>
                          </div>
                        );
                      }

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
                            width: edited ? 'auto' : `${itemW}px`,
                            minHeight: `${itemH}px`,
                          }}
                          className={`absolute pointer-events-auto transition-all cursor-pointer rounded-xs flex items-center group ${
                            isSelected
                              ? 'ring-2 ring-indigo-600 bg-indigo-500/25 z-30'
                              : edited
                              ? 'bg-amber-300/40 border border-amber-500 z-20 px-1'
                              : 'hover:bg-indigo-500/15 hover:border hover:border-indigo-400/50'
                          }`}
                        >
                          {/* Handle untuk Menggeser Teks */}
                          <div
                            onMouseDown={(e) => handleStartDrag(e, item.id)}
                            onTouchStart={(e) => handleStartDrag(e, item.id)}
                            className="cursor-move p-0.5 mr-0.5 rounded text-slate-700 bg-white/80 hover:bg-indigo-100 hidden group-hover:flex items-center shadow-xs"
                            title="Klik dan seret untuk memindahkan posisi teks ini"
                          >
                            <Move className="w-3 h-3 text-indigo-600" />
                          </div>

                          {/* Teks Hasil Edit */}
                          {edited ? (
                            <span
                              style={{
                                color: edited.color,
                                fontSize: `${edited.fontSize * scale}px`,
                              }}
                              className="font-semibold whitespace-nowrap"
                            >
                              {edited.currentText}
                            </span>
                          ) : (
                            <span className="opacity-0">{item.originalText}</span>
                          )}
                        </div>
                      );
                    })}

                    {/* B. Teks Kustom yang Ditambahkan Pengguna */}
                    {editedItems
                      .filter((e) => e.pageNum === currentPage && e.isCustomAdd && !e.isDeleted)
                      .map((item) => {
                        const posX = item.pdfX * scale;
                        const posY = (pdfPageDimensions.height - item.pdfY) * scale;
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
                            }}
                            className={`absolute pointer-events-auto p-1.5 bg-white/95 border rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 z-25 group ${
                              isSelected ? 'ring-2 ring-indigo-600 border-indigo-600' : 'border-indigo-400'
                            }`}
                          >
                            <div
                              onMouseDown={(e) => handleStartDrag(e, item.id)}
                              onTouchStart={(e) => handleStartDrag(e, item.id)}
                              className="cursor-move p-0.5 rounded text-indigo-600 bg-indigo-50 hover:bg-indigo-100 shadow-xs"
                              title="Seret untuk memindahkan posisi"
                            >
                              <Move className="w-3 h-3" />
                            </div>

                            <span
                              style={{
                                color: item.color,
                                fontSize: `${item.fontSize * scale}px`,
                              }}
                              className="font-semibold whitespace-nowrap"
                            >
                              {item.currentText}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTextItem(item.id);
                              }}
                              className="text-slate-400 hover:text-red-600 p-0.5 transition cursor-pointer"
                              title="Hapus Teks Ini"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Dropzone PDF Kosong */
          <div className="bg-white p-8 sm:p-14 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 transition text-center space-y-4 mb-12">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              📄
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Pilih Berkas PDF yang Ingin Diedit
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Unggah dokumen surat, sertifikat, laporan invoice, atau formulir PDF. Seluruh teks akan dideteksi dan dapat diedit, dihapus, atau digeser posisinya langsung.
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
                <span>🔍</span> 1. Deteksi &amp; Klik Teks
              </h3>
              <p className="text-xs text-slate-500">
                Mesin <b>PDF.js</b> membaca matriks tipografi pada dokumen dan memetakan setiap kalimat ke koordinat piksel yang presisi di atas layar browser Anda.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <span>🖐️</span> 2. Bebas Geser Posisi
              </h3>
              <p className="text-xs text-slate-500">
                Teks yang Anda edit atau tambahkan dapat langsung <b>diseret (drag-and-drop)</b> ke koordinat yang diinginkan agar sejajar rapi dengan garis formulir atau tanda tangan.
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
              <li><b>Koreksi Typo Cepat:</b> Klik kalimat yang ingin Anda perbaiki, ganti kata yang salah, lalu klik tombol <b>Terapkan Teks Ini</b>.</li>
              <li><b>Menghapus Kalimat:</b> Pilih kalimat yang ingin dihilangkan, lalu klik ikon tempat sampah (Hapus) untuk menutup teks lama dengan blok putih rapi.</li>
              <li><b>Menambahkan &amp; Menggeser Teks:</b> Klik tombol <b>Tambah Teks Baru (+)</b>, kemudian gunakan ikon panah empat arah untuk menggeser teks ke posisi yang Anda kehendaki.</li>
              <li><b>Unduh Hasil Akhir:</b> Klik tombol <b>Simpan &amp; Unduh</b> untuk mengekspor dokumen PDF baru siap kirim.</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
