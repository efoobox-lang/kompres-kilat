'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import { validateUploadedFile, downloadBlobSafely } from '@/lib/file-security';
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
  Move,
  RotateCcw,
  Check,
  ShieldCheck,
  Bold,
  RefreshCw,
  FileText,
} from 'lucide-react';

interface TextEditItem {
  id: string;
  pageNum: number;
  originalText: string;
  currentText: string;
  // Posisi asli teks pada PDF (PDF coordinates: origin di kiri-bawah)
  origPdfX: number;
  origPdfY: number;
  origPdfWidth: number;
  origPdfHeight: number;
  // Posisi saat ini (dapat diedit & digeser)
  pdfX: number;
  pdfY: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  isBold?: boolean;
  isDeleted: boolean; // Jika true, teks lama ditutup putih
  isCustomAdd?: boolean; // Jika true, teks baru buatan pengguna
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
  const [errorMessage, setErrorMessage] = useState<string>('');

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
  const [editTextBold, setEditTextBold] = useState<boolean>(false);

  // Status Download & Notifikasi
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfJsDocRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeRenderTaskRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Inisialisasi & Muat PDF.js secara Dinamis
  const loadPdfJs = async () => {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }
    return pdfjs;
  };

  // 2. Render Halaman PDF ke Canvas & Ekstrak Teks
  const renderPdfPage = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (doc: any, pageNum: number, currentScale: number) => {
      if (!doc) return;

      setIsLoading(true);
      setStatusMessage('Merender tampilan visual halaman PDF...');

      try {
        // Batalkan tugas render sebelumnya jika masih berjalan
        if (activeRenderTaskRef.current) {
          try {
            activeRenderTaskRef.current.cancel();
          } catch {
            // Abaikan error pembatalan
          }
        }

        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale: currentScale });

        const pageW = page.view[2] - page.view[0];
        const pageH = page.view[3] - page.view[1];
        setPdfPageDimensions({ width: pageW, height: pageH });

        // Tunggu hingga canvas terpasang jika belum siap
        const canvas = canvasRef.current;
        if (!canvas) {
          setIsLoading(false);
          return;
        }

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsLoading(false);
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render visual PDF ke canvas
        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
        });
        activeRenderTaskRef.current = renderTask;
        await renderTask.promise;
        activeRenderTaskRef.current = null;

        // Ekstraksi posisi teks asli di halaman menggunakan PDF.js
        setStatusMessage('Mengekstrak lapisan teks dokumen...');
        const textContent = await page.getTextContent();
        const detected: TextEditItem[] = [];

        if (textContent && textContent.items) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          textContent.items.forEach((item: any, idx: number) => {
            if (!item.str || !item.str.trim()) return;

            const trans = item.transform;
            const pdfX = trans[4];
            const pdfY = trans[5];
            const itemHeight = Math.abs(trans[0] || trans[3] || item.height || 12);
            const itemWidth = item.width || ctx.measureText(item.str).width || 40;

            detected.push({
              id: `p${pageNum}_i${idx}`,
              pageNum,
              originalText: item.str,
              currentText: item.str,
              origPdfX: pdfX,
              origPdfY: pdfY,
              origPdfWidth: itemWidth,
              origPdfHeight: itemHeight,
              pdfX,
              pdfY,
              fontSize: Math.round(itemHeight),
              fontFamily: item.fontName || 'Helvetica',
              color: '#000000',
              isBold: item.fontName?.toLowerCase().includes('bold') || false,
              isDeleted: false,
            });
          });
        }

        setPageDetectedItems(detected);
        setStatusMessage('');
      } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((err as any)?.name === 'RenderingCancelledException') {
          return; // Abaikan pembatalan render normal
        }
        console.error('Error saat merender PDF:', err);
        setErrorMessage('Gagal merender halaman PDF. Pastikan berkas tidak rusak.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Re-render saat PDF doc, currentPage, atau scale berubah
  useEffect(() => {
    if (pdfJsDocRef.current) {
      renderPdfPage(pdfJsDocRef.current, currentPage, scale);
    }
  }, [currentPage, scale, renderPdfPage]);

  // 3. Tangani Upload File PDF Pengguna dengan Validasi Keamanan
  const handleFileUpload = async (file: File) => {
    setErrorMessage('');
    setIsLoading(true);
    setStatusMessage('Memvalidasi dan memuat berkas PDF...');
    setSelectedFile(file);
    setEditedItems([]);
    setActiveEditingId(null);
    setPageDetectedItems([]);

    try {
      // Validasi berkas client-side
      const validation = await validateUploadedFile(file, {
        allowedExtensions: ['pdf', '.pdf'],
        allowedMimeTypes: ['application/pdf'],
        maxSizeBytes: 50 * 1024 * 1024,
        checkMagicBytes: true,
      });

      if (!validation.valid) {
        setErrorMessage(validation.error || 'Berkas PDF tidak valid.');
        setIsLoading(false);
        return;
      }

      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      setOriginalBytes(bytes);

      const pdfjs = await loadPdfJs();
      const loadingTask = pdfjs.getDocument({
        data: bytes,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
        cMapPacked: true,
      });

      const pdfDoc = await loadingTask.promise;
      pdfJsDocRef.current = pdfDoc;
      setTotalPages(pdfDoc.numPages);
      setCurrentPage(1);

      // Render pertama kali (tunggu render selesai)
      await renderPdfPage(pdfDoc, 1, scale);
      showToast(`Dokumen "${file.name}" siap diedit!`);
    } catch (err: unknown) {
      console.error('Gagal membuka PDF:', err);
      const msg = err instanceof Error ? err.message : '';
      setErrorMessage(
        msg.includes('password')
          ? 'Dokumen PDF dilindungi kata sandi. Harap buka enkripsi terlebih dahulu.'
          : 'Gagal memuat dokumen PDF. Pastikan file dalam format PDF standar yang tidak rusak.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Contoh Dokumen PDF Siap Edit
  const handleLoadSamplePdf = async () => {
    setIsLoading(true);
    setStatusMessage('Menghasilkan contoh dokumen surat bisnis...');
    setErrorMessage('');

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

      page.drawText('Catatan: Klik kalimat mana saja untuk edit teks, hapus, atau seret posisinya!', {
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
      const loadingTask = pdfjs.getDocument({
        data: bytes,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
        cMapPacked: true,
      });

      const pdfDoc = await loadingTask.promise;
      pdfJsDocRef.current = pdfDoc;
      setTotalPages(pdfDoc.numPages);
      setCurrentPage(1);

      await renderPdfPage(pdfDoc, 1, scale);
      showToast('Contoh surat berhasil dimuat! Klik kalimat mana pun untuk mengedit.');
    } catch (err) {
      console.error('Gagal membuat contoh PDF:', err);
      setErrorMessage('Terjadi kendala saat memuat contoh dokumen.');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigasi Halaman
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    setActiveEditingId(null);
  };

  // Zoom Kanvas
  const handleZoomChange = (newScale: number) => {
    const clamped = Math.min(Math.max(newScale, 0.75), 2.0);
    setScale(clamped);
  };

  // Klik Item Teks untuk Mulai Edit
  const handleSelectItemToEdit = (item: TextEditItem) => {
    const existing = editedItems.find((e) => e.id === item.id);
    setActiveEditingId(item.id);
    setEditTextValue(existing ? existing.currentText : item.originalText);
    setEditTextColor(existing ? existing.color : item.color);
    setEditTextSize(existing ? existing.fontSize : item.fontSize);
    setEditTextBold(existing ? !!existing.isBold : !!item.isBold);
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
      isBold: editTextBold,
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

    if (baseItem.isCustomAdd) {
      setEditedItems((prev) => prev.filter((i) => i.id !== itemId));
    } else {
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

  // Tambahkan Teks Baru di Tengah Halaman
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
      isBold: false,
      isDeleted: false,
      isCustomAdd: true,
    };

    setEditedItems((prev) => [...prev, newCustomItem]);
    setActiveEditingId(newCustomItem.id);
    setEditTextValue('Ketik Teks Baru di Sini');
    setEditTextColor('#000000');
    setEditTextSize(14);
    setEditTextBold(false);
    showToast('Kotak teks baru ditambahkan! Anda dapat menyeret posisinya.');
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

    const existing = editedItems.find((i) => i.id === itemId);
    const base = pageDetectedItems.find((i) => i.id === itemId);
    const targetItem = existing || base;
    if (!targetItem) return;

    const initialPdfX = targetItem.pdfX;
    const initialPdfY = targetItem.pdfY;

    if (!existing && base) {
      setEditedItems((prev) => [...prev, { ...base }]);
    }

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = (moveClientX - startClientX) / scale;
      const deltaY = (moveClientY - startClientY) / scale;

      // Pada koordinat PDF, Y berawal dari bawah (bawah ke atas); sehingga gerakan ke bawah mengurangi Y
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

        // 1. Jika ini teks asli PDF yang diedit atau dihapus: Tutup teks lama dengan blok putih
        if (!item.isCustomAdd && item.origPdfWidth > 0 && item.origPdfHeight > 0) {
          page.drawRectangle({
            x: Math.max(0, item.origPdfX - 1.5),
            y: Math.max(0, item.origPdfY - 1.5),
            width: item.origPdfWidth + 3,
            height: item.origPdfHeight + 3,
            color: rgb(1, 1, 1), // Redact visual
          });
        }

        // 2. Jika tidak dihapus: Tulis teks baru pada koordinat pdfX dan pdfY
        if (!item.isDeleted && item.currentText.trim()) {
          const matchedColor = COLOR_OPTIONS.find((c) => c.value === item.color)?.rgb || [0, 0, 0];
          page.drawText(item.currentText, {
            x: Math.max(0, item.pdfX),
            y: Math.max(0, item.pdfY),
            size: Math.max(7, item.fontSize),
            font: item.isBold || item.fontSize >= 15 ? helveticaBold : helvetica,
            color: rgb(matchedColor[0], matchedColor[1], matchedColor[2]),
          });
        }
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const baseName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'dokumen';

      downloadBlobSafely(blob, `${baseName}_edited.pdf`);
      showToast('PDF hasil edit berhasil disimpan dan diunduh!');
    } catch (err) {
      console.error('Gagal menyimpan PDF:', err);
      alert('Terjadi kendala saat menyematkan teks ke PDF.');
    } finally {
      setIsSaving(false);
      setStatusMessage('');
    }
  };

  const handleResetDocument = () => {
    setSelectedFile(null);
    setOriginalBytes(null);
    setTotalPages(0);
    setCurrentPage(1);
    setPageDetectedItems([]);
    setEditedItems([]);
    setActiveEditingId(null);
    pdfJsDocRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col transition-colors">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Direct PDF Text Editor - KompresKilat',
          description:
            'Aplikasi online gratis untuk edit teks, hapus kalimat, tambah tulisan baru, dan geser posisi teks langsung di dokumen PDF tanpa konversi.',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'All',
        }}
      />
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full">
        {/* Header Hero */}
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs px-3.5 py-1.5 rounded-full font-bold mb-3 shadow-2xs">
            <Edit3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Direct PDF Text Editor (100% Client-Side)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Edit, Hapus &amp; Geser Teks PDF di Browser
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Koreksi salah ketik (typo) teks asli, hapus kalimat, tambahkan tulisan baru, dan{' '}
            <b>geser posisinya secara bebas</b> langsung pada lembar dokumen PDF Anda tanpa konversi.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Privasi 100%: Berkas tidak pernah diunggah atau disimpan ke server luar.</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center justify-between gap-3">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage('')}
              className="font-bold underline cursor-pointer text-xs"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Toolbar Utama */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3">
          {/* Pilihan File / Upload */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Buka Dokumen PDF</span>
            </button>

            {!selectedFile && (
              <button
                type="button"
                onClick={handleLoadSamplePdf}
                disabled={isLoading}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5"
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
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[160px] sm:max-w-xs">
                  {selectedFile.name}
                </span>
                <button
                  onClick={handleResetDocument}
                  className="text-slate-400 hover:text-red-500 ml-1 p-0.5 rounded cursor-pointer"
                  title="Ganti Dokumen"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Aksi Toolbar PDF: Tambah Teks & Simpan */}
          {totalPages > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleAddNewTextBlock}
                className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Tambah Teks Baru (+)</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndDownloadPdf}
                disabled={isSaving || editedItems.length === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-bold rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-xs disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Simpan &amp; Unduh ({editedItems.length})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Notifikasi Status Loading */}
        {statusMessage && (
          <div className="p-3 mb-6 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-indigo-800 dark:text-indigo-200 font-semibold flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Layout Area Editor & Pratinjau Interaktif */}
        {totalPages > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12">
            {/* Kolom Kiri: Navigasi, Form Edit & Riwayat Modifikasi (4 Kolom) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Box Navigasi Halaman & Zoom */}
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Navigasi Halaman
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-md">
                    Hal. {currentPage} / {totalPages}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoading}
                    className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isLoading}
                    className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Berikutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Kontrol Zoom */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Skala Tampilan:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleZoomChange(scale - 0.2)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer"
                      title="Perkecil"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold w-12 text-center text-slate-800 dark:text-slate-200">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => handleZoomChange(scale + 0.2)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer"
                      title="Perbesar"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Panel Edit Aktif jika ada teks yang dipilih */}
              {activeEditingId && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-indigo-500 shadow-lg space-y-3.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5" /> Edit Kalimat Terpilih
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveEditingId(null)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold cursor-pointer"
                    >
                      Tutup ✕
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Teks Baru:
                    </label>
                    <textarea
                      rows={2}
                      value={editTextValue}
                      onChange={(e) => setEditTextValue(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Warna:
                      </label>
                      <select
                        value={editTextColor}
                        onChange={(e) => setEditTextColor(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        {COLOR_OPTIONS.map((c, i) => (
                          <option key={i} value={c.value}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Ukuran:
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="8"
                          max="72"
                          value={editTextSize}
                          onChange={(e) => setEditTextSize(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => setEditTextBold(!editTextBold)}
                          className={`p-1.5 rounded-xl border transition cursor-pointer ${
                            editTextBold
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                          }`}
                          title="Tebalkan Teks (Bold)"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleApplyTextEdit}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Terapkan Teks Ini</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTextItem(activeEditingId)}
                      className="py-2 px-3 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-300 font-bold text-xs rounded-xl transition cursor-pointer border border-red-200 dark:border-red-800"
                      title="Hapus / Tutup Teks Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                    💡 Tips: Anda dapat langsung menggeser teks ini pada lembar dokumen menggunakan tetikus atau sentuhan jari.
                  </p>
                </div>
              )}

              {/* Daftar Perubahan Teks (History Modifikasi) */}
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" /> Riwayat Modifikasi ({editedItems.length})
                  </span>
                </div>

                {editedItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic leading-relaxed">
                    Belum ada teks yang dimodifikasi. Klik kalimat mana saja pada dokumen di samping untuk mengedit, menghapus, atau menggeser posisinya.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {editedItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl border flex items-start justify-between gap-2 text-xs ${
                          item.isDeleted
                            ? 'bg-red-50/60 dark:bg-red-950/40 border-red-200 dark:border-red-800/60'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
                        }`}
                      >
                        <div className="min-w-0">
                          <span
                            className={`text-[10px] font-bold block ${
                              item.isDeleted ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'
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
                              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[190px]">
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
                              className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[10px] font-bold rounded cursor-pointer"
                              title="Kembalikan Teks Asli"
                            >
                              Batal
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
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 gap-2">
                <span className="flex items-center gap-1">
                  <Move className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    Klik teks untuk mengedit atau <b>seret teks untuk memindahkan posisinya</b>.
                  </span>
                </span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full">
                  {pageDetectedItems.length} Elemen Teks Terdeteksi
                </span>
              </div>

              {/* Notice jika PDF berupa scan tanpa teks digital */}
              {pageDetectedItems.length === 0 && !isLoading && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-200">
                  ℹ️ Dokumen ini berupa gambar/scan tanpa lapisan teks digital (0 elemen teks asli). Anda tetap dapat menggunakan tombol <b>&quot;Tambah Teks Baru (+)&quot;</b> untuk menambahkan tulisan, paraf, atau stempel di atas halaman ini.
                </div>
              )}

              {/* Kontainer Kanvas Scrollable */}
              <div className="relative bg-slate-200/80 dark:bg-slate-900/90 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-2 sm:p-4 flex justify-center items-start overflow-auto max-h-[780px] shadow-inner select-none">
                <div className="relative shadow-2xl bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
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
                      const itemW = Math.max(item.origPdfWidth * scale, 24);
                      const itemH = Math.max(item.origPdfHeight * scale, 12);

                      const isSelected = activeEditingId === item.id;

                      if (isDeleted) {
                        return (
                          <div
                            key={item.id}
                            style={{
                              left: `${item.origPdfX * scale}px`,
                              top: `${(pdfPageDimensions.height - item.origPdfY - item.origPdfHeight) * scale}px`,
                              width: `${itemW}px`,
                              height: `${itemH}px`,
                            }}
                            className="absolute pointer-events-auto bg-white/95 border border-red-300 text-red-500 rounded-xs flex items-center justify-between px-1 z-10 shadow-2xs"
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
                                fontWeight: edited.isBold ? 'bold' : 'normal',
                              }}
                              className="whitespace-nowrap"
                            >
                              {edited.currentText}
                            </span>
                          ) : (
                            <span className="opacity-0 select-none">{item.originalText}</span>
                          )}
                        </div>
                      );
                    })}

                    {/* B. Teks Kustom Baru yang Ditambahkan Pengguna */}
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
                            className={`absolute pointer-events-auto p-1.5 bg-white/95 dark:bg-slate-900 border rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 z-25 group ${
                              isSelected ? 'ring-2 ring-indigo-600 border-indigo-600' : 'border-indigo-400'
                            }`}
                          >
                            <div
                              onMouseDown={(e) => handleStartDrag(e, item.id)}
                              onTouchStart={(e) => handleStartDrag(e, item.id)}
                              className="cursor-move p-0.5 rounded text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 shadow-xs"
                              title="Seret untuk memindahkan posisi"
                            >
                              <Move className="w-3 h-3" />
                            </div>

                            <span
                              style={{
                                color: item.color,
                                fontSize: `${item.fontSize * scale}px`,
                                fontWeight: item.isBold ? 'bold' : 'normal',
                              }}
                              className="whitespace-nowrap"
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
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-14 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 transition text-center space-y-4 mb-12 shadow-xs">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-2xs">
              📄
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Pilih Berkas PDF yang Ingin Diedit
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Unggah dokumen surat, sertifikat, laporan invoice, atau formulir PDF. Seluruh teks akan dideteksi dan dapat langsung diedit, dihapus, atau digeser posisinya secara bebas.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl transition duration-150 shadow-sm cursor-pointer"
              >
                Pilih Berkas PDF dari Komputer / HP
              </button>

              <button
                type="button"
                onClick={handleLoadSamplePdf}
                disabled={isLoading}
                className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Buka Contoh Surat PDF</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-3">
              🛡️ Privasi 100% Terjamin: Dokumen diproses murni pada memori browser Anda menggunakan teknologi PDF.js dan pdf-lib tanpa dikirim ke server.
            </p>
          </div>
        )}

        {/* Slot Iklan Kepatuhan AdSense */}
        <div className="my-10 pt-4">
          <AdBanner zone="in-tool" label="Iklan Sponsor" />
        </div>

        {/* Konten Edukasi & SEO: Panduan Cara Mengedit Teks PDF */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              💡 Cara Kerja Direct PDF Text Editor di Browser (Tanpa Install Aplikasi)
            </h2>
            <p>
              Mengedit berkas PDF selama ini dianggap sulit karena format PDF dirancang sebagai format dokumen final cetak (*print-ready*). Umumnya pengguna harus mengonversi PDF ke Word terlebih dahulu, memperbaikinya, lalu mengekspornya kembali ke PDF sehingga seringkali merusak kerapian tata letak (*layout formatting*).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs sm:text-sm">
                <span>🔍</span> 1. Deteksi &amp; Klik Teks
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mesin <b>PDF.js</b> membaca matriks tipografi pada dokumen dan memetakan setiap kalimat ke koordinat piksel yang presisi di atas layar browser Anda.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs sm:text-sm">
                <span>🖐️</span> 2. Bebas Geser Posisi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Teks yang Anda edit atau tambahkan dapat langsung <b>diseret (drag-and-drop)</b> ke koordinat yang diinginkan agar sejajar rapi dengan garis formulir atau tanda tangan.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs sm:text-sm">
                <span>🔒</span> 3. Tanpa Risiko Kebocoran Data
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Surat perjanjian, nilai kontrak, nomor rekening, atau ijazah Anda aman dari pencurian data karena seluruh pemrosesan kode berjalan 100% di peramban lokal pengunjung.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Tips Penggunaan:</h4>
            <ul className="space-y-1.5 list-disc pl-5 text-slate-500 dark:text-slate-400">
              <li><b>Koreksi Typo Cepat:</b> Klik kalimat yang ingin Anda perbaiki, ganti kata yang salah, lalu klik tombol <b>Terapkan Teks Ini</b>.</li>
              <li><b>Menghapus Kalimat:</b> Pilih kalimat yang ingin dihilangkan, lalu klik ikon tempat sampah (Hapus) untuk menutup teks lama dengan blok putih rapi.</li>
              <li><b>Menambahkan &amp; Menggeser Teks:</b> Klik tombol <b>Tambah Teks Baru (+)</b>, kemudian gunakan ikon panah empat arah untuk menggeser teks ke posisi yang Anda kehendaki.</li>
              <li><b>Unduh Hasil Akhir:</b> Klik tombol <b>Simpan &amp; Unduh</b> untuk mengekspor dokumen PDF baru siap kirim.</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
