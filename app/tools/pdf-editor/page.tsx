'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolEditorialSection from '@/components/ToolEditorialSection';
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
  Eraser,
  Square,
  AlertCircle,
  Pipette,
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

// Kotak Penutup Putih/Kustom (Smart Whiteout & Color Patch Box)
interface WhiteoutBox {
  id: string;
  pageNum: number;
  pdfX: number; // Koordinat X kiri-bawah dalam PDF
  pdfY: number; // Koordinat Y kiri-bawah dalam PDF
  width: number; // Lebar dalam poin PDF
  height: number; // Tinggi dalam poin PDF
  color?: string; // HEX color latar belakang penutup, e.g. '#FFFFFF' atau warna sampel
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

  // Dimensi Halaman PDF Aktif (point)
  const [pdfPageDimensions, setPdfPageDimensions] = useState<{ width: number; height: number }>({
    width: 595,
    height: 842,
  });

  // Item Teks Terdeteksi di Halaman Aktif & Seluruh Perubahan Pengguna
  const [pageDetectedItems, setPageDetectedItems] = useState<TextEditItem[]>([]);
  const [editedItems, setEditedItems] = useState<TextEditItem[]>([]);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);

  // State Whiteout / Mode Koreksi untuk PDF Scan & Gambar
  const [whiteoutBoxes, setWhiteoutBoxes] = useState<WhiteoutBox[]>([]);
  const [isWhiteoutMode, setIsWhiteoutMode] = useState<boolean>(false);
  const [activeWhiteoutId, setActiveWhiteoutId] = useState<string | null>(null);
  const [whiteoutColor, setWhiteoutColor] = useState<string>('#FFFFFF');
  const [isEyedropperActive, setIsEyedropperActive] = useState<boolean>(false);

  // State Interaktif Menggambar Kotak Whiteout di Kanvas
  const [isDrawingWhiteout, setIsDrawingWhiteout] = useState<boolean>(false);
  const [drawStartPos, setDrawStartPos] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrentPos, setDrawCurrentPos] = useState<{ x: number; y: number } | null>(null);

  // Form Input Edit Teks Aktif
  const [editTextValue, setEditTextValue] = useState<string>('');
  const [editTextColor, setEditTextColor] = useState<string>('#000000');
  const [editTextSize, setEditTextSize] = useState<number>(12);
  const [editTextBold, setEditTextBold] = useState<boolean>(false);

  // Status Download & Notifikasi
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfJsDocRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeRenderTaskRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
        if (activeRenderTaskRef.current) {
          try {
            activeRenderTaskRef.current.cancel();
          } catch {
            // Abaikan pembatalan
          }
        }

        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale: currentScale });

        const pageW = page.view[2] - page.view[0];
        const pageH = page.view[3] - page.view[1];
        setPdfPageDimensions({ width: pageW, height: pageH });

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
          return;
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

  // 3. Tangani Upload File PDF Pengguna
  const handleFileUpload = async (file: File) => {
    setErrorMessage('');
    setIsLoading(true);
    setStatusMessage('Memvalidasi dan memuat berkas PDF...');
    setSelectedFile(file);
    setEditedItems([]);
    setWhiteoutBoxes([]);
    setActiveEditingId(null);
    setActiveWhiteoutId(null);
    setPageDetectedItems([]);

    try {
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
        data: new Uint8Array(bytes.slice()),
        cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
        cMapPacked: true,
      });

      const pdfDoc = await loadingTask.promise;
      pdfJsDocRef.current = pdfDoc;
      setTotalPages(pdfDoc.numPages);
      setCurrentPage(1);

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

      page.drawText('Catatan: Klik kalimat mana saja untuk edit teks, tutup putih (whiteout), atau seret posisinya!', {
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
      setWhiteoutBoxes([]);
      setActiveEditingId(null);
      setActiveWhiteoutId(null);

      const pdfjs = await loadPdfJs();
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(bytes.slice()),
        cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
        cMapPacked: true,
      });

      const pdfDoc = await loadingTask.promise;
      pdfJsDocRef.current = pdfDoc;
      setTotalPages(pdfDoc.numPages);
      setCurrentPage(1);

      await renderPdfPage(pdfDoc, 1, scale);
      showToast('Contoh surat berhasil dimuat! Klik teks mana pun atau buat kotak whiteout.');
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
    setActiveWhiteoutId(null);
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
    setActiveWhiteoutId(null);
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

  // Hapus Teks Asli (Redact Teks Digital)
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

  // ==========================================================================
  // FITUR KHUSUS PDF SCAN / GAMBAR: SMART WHITEOUT & COLOR SAMPLING
  // ==========================================================================

  // Helper: Ambil warna RGB dari piksel canvas PDF pada koordinat layar tertentu
  const sampleColorAtCanvasPoint = (screenX: number, screenY: number): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const px = Math.min(Math.max(0, Math.floor(screenX)), canvas.width - 1);
    const py = Math.min(Math.max(0, Math.floor(screenY)), canvas.height - 1);

    try {
      const pixel = ctx.getImageData(px, py, 1, 1).data;
      const r = pixel[0].toString(16).padStart(2, '0');
      const g = pixel[1].toString(16).padStart(2, '0');
      const b = pixel[2].toString(16).padStart(2, '0');
      return `#${r}${g}${b}`.toUpperCase();
    } catch (e) {
      console.warn('Gagal membaca piksel canvas:', e);
      return null;
    }
  };

  // Helper: Auto-sample warna latar belakang di sekeliling kotak whiteout dari canvas
  const autoSampleAroundBox = useCallback((box: WhiteoutBox): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '#FFFFFF';
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#FFFFFF';

    const startX = Math.round(box.pdfX * scale);
    const startY = Math.round((pdfPageDimensions.height - box.pdfY - box.height) * scale);
    const boxW = Math.round(box.width * scale);
    const boxH = Math.round(box.height * scale);

    const offset = 4;
    const samples: number[][] = [];

    // Tepi atas luar
    const topY = Math.max(0, startY - offset);
    for (let x = startX; x <= startX + boxW; x += Math.max(2, Math.floor(boxW / 8))) {
      if (x >= 0 && x < canvas.width && topY < canvas.height) {
        const p = ctx.getImageData(x, topY, 1, 1).data;
        samples.push([p[0], p[1], p[2]]);
      }
    }

    // Tepi bawah luar
    const btmY = Math.min(canvas.height - 1, startY + boxH + offset);
    for (let x = startX; x <= startX + boxW; x += Math.max(2, Math.floor(boxW / 8))) {
      if (x >= 0 && x < canvas.width && btmY < canvas.height) {
        const p = ctx.getImageData(x, btmY, 1, 1).data;
        samples.push([p[0], p[1], p[2]]);
      }
    }

    // Tepi kiri & kanan luar
    const leftX = Math.max(0, startX - offset);
    const rightX = Math.min(canvas.width - 1, startX + boxW + offset);
    for (let y = startY; y <= startY + boxH; y += Math.max(2, Math.floor(boxH / 6))) {
      if (y >= 0 && y < canvas.height) {
        if (leftX < canvas.width) {
          const p1 = ctx.getImageData(leftX, y, 1, 1).data;
          samples.push([p1[0], p1[1], p1[2]]);
        }
        if (rightX < canvas.width) {
          const p2 = ctx.getImageData(rightX, y, 1, 1).data;
          samples.push([p2[0], p2[1], p2[2]]);
        }
      }
    }

    if (samples.length === 0) return '#FFFFFF';

    let sumR = 0, sumG = 0, sumB = 0;
    for (const s of samples) {
      sumR += s[0];
      sumG += s[1];
      sumB += s[2];
    }
    const avgR = Math.round(sumR / samples.length).toString(16).padStart(2, '0');
    const avgG = Math.round(sumG / samples.length).toString(16).padStart(2, '0');
    const avgB = Math.round(sumB / samples.length).toString(16).padStart(2, '0');
    return `#${avgR}${avgG}${avgB}`.toUpperCase();
  }, [pdfPageDimensions.height, scale]);

  // Tambahkan Kotak Whiteout Cepat dengan Warna Sampel / Kustom
  const handleAddWhiteoutBox = (
    customX?: number,
    customY?: number,
    customW = 140,
    customH = 26,
    customColor?: string
  ) => {
    const pdfPageH = pdfPageDimensions.height;
    const initialPdfX = customX !== undefined ? customX : 60;
    const initialPdfY = customY !== undefined ? customY : Math.round(pdfPageH * 0.5);

    const newBox: WhiteoutBox = {
      id: `whiteout_${Date.now()}`,
      pageNum: currentPage,
      pdfX: Math.round(initialPdfX),
      pdfY: Math.round(initialPdfY),
      width: Math.round(customW),
      height: Math.round(customH),
      color: customColor || whiteoutColor || '#FFFFFF',
    };

    // Jika belum ada customColor dan warna default masih putih, coba auto-sample sekitar kotak
    if (!customColor && whiteoutColor === '#FFFFFF') {
      const sampled = autoSampleAroundBox(newBox);
      if (sampled) newBox.color = sampled;
    }

    setWhiteoutBoxes((prev) => [...prev, newBox]);
    setActiveWhiteoutId(newBox.id);
    setActiveEditingId(null);
    showToast(`Kotak koreksi ditambahkan (Warna Latar: ${newBox.color})!`);
  };

  // Update Warna Kotak Whiteout Aktif
  const handleUpdateBoxColor = (boxId: string, newColor: string) => {
    setWhiteoutColor(newColor);
    setWhiteoutBoxes((prev) =>
      prev.map((b) => (b.id === boxId ? { ...b, color: newColor } : b))
    );
  };

  // Auto-sample warna latar sekeliling kotak terpilih
  const handleAutoSampleActiveBox = (boxId: string) => {
    const targetBox = whiteoutBoxes.find((b) => b.id === boxId);
    if (!targetBox) return;

    const sampled = autoSampleAroundBox(targetBox);
    handleUpdateBoxColor(boxId, sampled);
    showToast(`Warna latar sekitar kotak disampel: ${sampled}`);
  };

  // Pipet Warna (Eyedropper)
  const handlePickColorWithEyedropper = async (targetBoxId?: string | null) => {
    // 1. Coba Native EyeDropper API jika didukung browser
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          const hex = result.sRGBHex.toUpperCase();
          setWhiteoutColor(hex);
          if (targetBoxId) {
            handleUpdateBoxColor(targetBoxId, hex);
          }
          showToast(`Warna berhasil diambil: ${hex}`);
          return;
        }
      } catch {
        return;
      }
    }

    // 2. Fallback interaktif: Mode klik pada canvas
    setIsEyedropperActive(true);
    showToast('Mode Pipet Aktif: Klik area dokumen di kanvas untuk mengambil warna latar!');
  };

  // Tambah Teks Baru Tepat di Atas Kotak Whiteout yang Terpilih
  const handleAddTextOnWhiteoutBox = (boxId: string) => {
    const box = whiteoutBoxes.find((b) => b.id === boxId);
    if (!box) return;

    const newCustomItem: TextEditItem = {
      id: `custom_${Date.now()}`,
      pageNum: box.pageNum,
      originalText: '',
      currentText: 'Ketik Teks Pengganti',
      origPdfX: box.pdfX + 4,
      origPdfY: box.pdfY + 4,
      origPdfWidth: Math.max(80, box.width - 8),
      origPdfHeight: Math.min(16, box.height),
      pdfX: box.pdfX + 4,
      pdfY: box.pdfY + 4,
      fontSize: Math.min(14, Math.max(9, Math.round(box.height * 0.65))),
      fontFamily: 'Helvetica',
      color: '#000000',
      isBold: false,
      isDeleted: false,
      isCustomAdd: true,
    };

    setEditedItems((prev) => [...prev, newCustomItem]);
    setActiveEditingId(newCustomItem.id);
    setActiveWhiteoutId(null);
    setEditTextValue('Ketik Teks Pengganti');
    setEditTextColor('#000000');
    setEditTextSize(newCustomItem.fontSize);
    setEditTextBold(false);
    showToast('Teks pengganti ditempatkan di atas kotak koreksi!');
  };

  // Hapus Kotak Whiteout
  const handleDeleteWhiteoutBox = (boxId: string) => {
    setWhiteoutBoxes((prev) => prev.filter((b) => b.id !== boxId));
    if (activeWhiteoutId === boxId) setActiveWhiteoutId(null);
    showToast('Kotak penutup putih dihapus.');
  };

  // Tambahkan Teks Baru Bebas di Atas Dokumen (bisa di atas area Whiteout)
  const handleAddNewTextBlock = () => {
    const pdfPageH = pdfPageDimensions.height;
    // Jika ada whiteout box di halaman aktif, tempatkan teks baru tepat di atas kotak tersebut
    const lastBox = whiteoutBoxes.filter((b) => b.pageNum === currentPage).slice(-1)[0];

    const initialPdfX = lastBox ? lastBox.pdfX + 4 : 60;
    const initialPdfY = lastBox ? lastBox.pdfY + 4 : Math.round(pdfPageH * 0.5);

    const newCustomItem: TextEditItem = {
      id: `custom_${Date.now()}`,
      pageNum: currentPage,
      originalText: '',
      currentText: 'Ketik Teks Baru di Sini',
      origPdfX: initialPdfX,
      origPdfY: initialPdfY,
      origPdfWidth: 160,
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
    setActiveWhiteoutId(null);
    setEditTextValue('Ketik Teks Baru di Sini');
    setEditTextColor('#000000');
    setEditTextSize(14);
    setEditTextBold(false);
    showToast('Teks baru ditambahkan! Anda dapat menyeret posisinya langsung ke atas area penutup.');
  };

  // ==========================================================================
  // FITUR INTERAKTIF: MENGGAMBAR KOTAK WHITEOUT DENGAN MOUSE/SENTUHAN
  // ==========================================================================
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = overlayContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Mode Pipet Warna (Eyedropper) dari Canvas
    if (isEyedropperActive) {
      const sampled = sampleColorAtCanvasPoint(clickX, clickY);
      if (sampled) {
        setWhiteoutColor(sampled);
        if (activeWhiteoutId) {
          handleUpdateBoxColor(activeWhiteoutId, sampled);
        }
        showToast(`Warna latar berhasil diambil: ${sampled}`);
      }
      setIsEyedropperActive(false);
      return;
    }

    if (!isWhiteoutMode) return;

    setIsDrawingWhiteout(true);
    setDrawStartPos({ x: clickX, y: clickY });
    setDrawCurrentPos({ x: clickX, y: clickY });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingWhiteout || !overlayContainerRef.current) return;
    const rect = overlayContainerRef.current.getBoundingClientRect();
    setDrawCurrentPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawingWhiteout || !drawStartPos || !drawCurrentPos) {
      setIsDrawingWhiteout(false);
      return;
    }

    const minScreenX = Math.min(drawStartPos.x, drawCurrentPos.x);
    const minScreenY = Math.min(drawStartPos.y, drawCurrentPos.y);
    const screenW = Math.abs(drawCurrentPos.x - drawStartPos.x);
    const screenH = Math.abs(drawCurrentPos.y - drawStartPos.y);

    setIsDrawingWhiteout(false);
    setDrawStartPos(null);
    setDrawCurrentPos(null);

    // Auto-sample warna latar dari tepi gambar
    const sampledColor =
      sampleColorAtCanvasPoint(minScreenX - 3, minScreenY - 3) ||
      sampleColorAtCanvasPoint(minScreenX + screenW / 2, minScreenY + screenH / 2) ||
      whiteoutColor;

    // Jika jarak drag sangat kecil (hanya klik biasa), buat ukuran default
    if (screenW < 8 && screenH < 8) {
      const clickPdfX = (minScreenX / scale) - 60;
      const clickPdfY = pdfPageDimensions.height - (minScreenY / scale) - 12;
      handleAddWhiteoutBox(Math.max(0, clickPdfX), Math.max(0, clickPdfY), 120, 24, sampledColor);
      return;
    }

    // Hitung koordinat PDF
    const pdfW = Math.max(15, screenW / scale);
    const pdfH = Math.max(10, screenH / scale);
    const pdfX = Math.max(0, minScreenX / scale);
    const pdfY = Math.max(0, pdfPageDimensions.height - (minScreenY / scale) - pdfH);

    handleAddWhiteoutBox(pdfX, pdfY, pdfW, pdfH, sampledColor);
  };

  // ==========================================================================
  // FITUR GESER (DRAG & DROP): TEKS & KOTAK WHITEOUT
  // ==========================================================================

  // Geser Posisi Teks (Drag Text)
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

  // Geser Posisi Kotak Whiteout (Drag Whiteout Box)
  const handleStartDragWhiteout = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    boxId: string
  ) => {
    e.stopPropagation();
    setActiveWhiteoutId(boxId);
    setActiveEditingId(null);

    const isTouch = 'touches' in e;
    const startClientX = isTouch ? e.touches[0].clientX : e.clientX;
    const startClientY = isTouch ? e.touches[0].clientY : e.clientY;

    const targetBox = whiteoutBoxes.find((b) => b.id === boxId);
    if (!targetBox) return;

    const initialPdfX = targetBox.pdfX;
    const initialPdfY = targetBox.pdfY;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = (moveClientX - startClientX) / scale;
      const deltaY = (moveClientY - startClientY) / scale;

      const newPdfX = Math.round(initialPdfX + deltaX);
      const newPdfY = Math.round(initialPdfY - deltaY);

      setWhiteoutBoxes((prev) =>
        prev.map((b) => (b.id === boxId ? { ...b, pdfX: newPdfX, pdfY: newPdfY } : b))
      );
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      showToast('Posisi kotak whiteout diperbarui!');
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  // Ubah Ukuran Kotak Whiteout (Resize Handle)
  const handleStartResizeWhiteout = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    boxId: string
  ) => {
    e.stopPropagation();
    setActiveWhiteoutId(boxId);

    const isTouch = 'touches' in e;
    const startClientX = isTouch ? e.touches[0].clientX : e.clientX;
    const startClientY = isTouch ? e.touches[0].clientY : e.clientY;

    const targetBox = whiteoutBoxes.find((b) => b.id === boxId);
    if (!targetBox) return;

    const initialW = targetBox.width;
    const initialH = targetBox.height;
    const initialPdfY = targetBox.pdfY;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = (moveClientX - startClientX) / scale;
      const deltaY = (moveClientY - startClientY) / scale;

      const newW = Math.max(20, Math.round(initialW + deltaX));
      const newH = Math.max(10, Math.round(initialH + deltaY));
      const newPdfY = Math.round(initialPdfY - deltaY);

      setWhiteoutBoxes((prev) =>
        prev.map((b) => (b.id === boxId ? { ...b, width: newW, height: newH, pdfY: newPdfY } : b))
      );
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  // ==========================================================================
  // 6. SIMPAN & EKSPOR PDF MENGGUNAKAN PDF-LIB (100% CLIENT-SIDE)
  // ==========================================================================
  const handleSaveAndDownloadPdf = async () => {
    if (!originalBytes) {
      alert('Belum ada dokumen PDF yang dimuat.');
      return;
    }

    if (editedItems.length === 0 && whiteoutBoxes.length === 0) {
      alert('Belum ada teks atau kotak whiteout yang ditambahkan/diubah.');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Menyematkan lapisan whiteout dan teks baru ke PDF...');

    try {
      const pdfDoc = await PDFDocument.load(originalBytes);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageCount = pdfDoc.getPageCount();

      for (let pIdx = 0; pIdx < pageCount; pIdx++) {
        const pageNum = pIdx + 1;
        const page = pdfDoc.getPage(pIdx);

        // LANGKAH 1: Gambar seluruh kotak Whiteout pada halaman ini dengan warna kustomnya
        const pageWhiteouts = whiteoutBoxes.filter((b) => b.pageNum === pageNum);
        for (const box of pageWhiteouts) {
          const hex = (box.color || '#FFFFFF').replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16) / 255;
          const g = parseInt(hex.substring(2, 4), 16) / 255;
          const b = parseInt(hex.substring(4, 6), 16) / 255;

          page.drawRectangle({
            x: Math.max(0, box.pdfX),
            y: Math.max(0, box.pdfY),
            width: Math.max(5, box.width),
            height: Math.max(5, box.height),
            color: rgb(
              isNaN(r) ? 1 : r,
              isNaN(g) ? 1 : g,
              isNaN(b) ? 1 : b
            ),
          });
        }

        // LANGKAH 2: Gambar penutup putih untuk teks digital yang diedit/dihapus
        const pageEdits = editedItems.filter((it) => it.pageNum === pageNum);
        for (const item of pageEdits) {
          if (!item.isCustomAdd && item.origPdfWidth > 0 && item.origPdfHeight > 0) {
            page.drawRectangle({
              x: Math.max(0, item.origPdfX - 1.5),
              y: Math.max(0, item.origPdfY - 1.5),
              width: item.origPdfWidth + 3,
              height: item.origPdfHeight + 3,
              color: rgb(1, 1, 1),
            });
          }
        }

        // LANGKAH 3: Tuliskan teks baru / hasil edit di atas halaman (termasuk di atas whiteout)
        for (const item of pageEdits) {
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
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const baseName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'dokumen';

      downloadBlobSafely(blob, `${baseName}_edited.pdf`);
      showToast('PDF hasil edit berhasil disimpan dan diunduh!');
    } catch (err) {
      console.error('Gagal menyimpan PDF:', err);
      alert('Terjadi kendala saat menyematkan teks dan whiteout ke PDF.');
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
    setWhiteoutBoxes([]);
    setActiveEditingId(null);
    setActiveWhiteoutId(null);
    setIsWhiteoutMode(false);
    pdfJsDocRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Jumlah total modifikasi (teks + whiteout)
  const totalModifications = editedItems.length + whiteoutBoxes.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col transition-colors">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Direct PDF Text Editor - KompresKilat',
          description:
            'Aplikasi online gratis untuk edit teks, hapus kalimat, tambah tulisan baru, geser posisi teks, dan whiteout teks pada dokumen PDF scan maupun digital 100% lokal di browser.',
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
            <span>Direct PDF Text Editor &amp; Whiteout Tool (100% Client-Side)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Edit Teks, Tutup (Whiteout) &amp; Tambah Tulisan PDF
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Koreksi typo pada dokumen PDF digital maupun <b>PDF hasil scan/gambar</b> dengan fitur kotak penutup putih (whiteout), tambahkan tulisan baru, dan <b>geser posisinya secara bebas</b> langsung di peramban.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Privasi 100%: Berkas tidak pernah diunggah atau disimpan ke server luar.</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-xs font-bold underline cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Hidden File Input (Always accessible by fileInputRef) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="hidden"
        />

        {/* Toolbar Utama Dokumen - Hanya tampil ketika berkas PDF telah dimuat */}
        {totalPages > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Ganti File PDF</span>
              </button>

              <button
                type="button"
                onClick={handleResetDocument}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1"
                title="Batal dan tutup dokumen saat ini"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tutup</span>
              </button>

              {selectedFile && (
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl truncate max-w-[220px]">
                  {selectedFile.name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Tombol Toggle Mode Whiteout / Koreksi */}
              <button
                type="button"
                onClick={() => {
                  setIsWhiteoutMode(!isWhiteoutMode);
                  showToast(
                    !isWhiteoutMode
                      ? 'Mode Koreksi Aktif: Klik/seret di kanvas dokumen untuk menutup teks lama.'
                      : 'Mode Koreksi dinonaktifkan.'
                  );
                }}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                  isWhiteoutMode
                    ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400/30'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
                title="Aktifkan kursor koreksi untuk menggambar kotak penutup di atas teks dokumen"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>{isWhiteoutMode ? 'Mode Koreksi (Aktif)' : 'Mode Whiteout'}</span>
              </button>

              {/* Pipet Sample Warna Latar */}
              <button
                type="button"
                onClick={() => handlePickColorWithEyedropper(activeWhiteoutId)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                  isEyedropperActive
                    ? 'bg-purple-600 text-white border-purple-700 ring-2 ring-purple-400/30'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
                title="Ambil warna dari area mana pun di dokumen PDF"
              >
                <Pipette className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline">Pipet Warna</span>
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                  style={{ backgroundColor: whiteoutColor }}
                  title={`Warna patch saat ini: ${whiteoutColor}`}
                />
              </button>

              {/* Tambah Kotak Whiteout Cepat */}
              <button
                type="button"
                onClick={() => handleAddWhiteoutBox()}
                className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Tambahkan kotak penutup putih instan di tengah halaman"
              >
                <Square className="w-3.5 h-3.5 text-slate-500" />
                <span>+ Kotak Whiteout</span>
              </button>

              {/* Tambah Teks Baru */}
              <button
                type="button"
                onClick={handleAddNewTextBlock}
                className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Tambah Teks Baru (+)</span>
              </button>

              {/* Tombol Simpan & Unduh */}
              <button
                type="button"
                onClick={handleSaveAndDownloadPdf}
                disabled={isSaving || totalModifications === 0}
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
                    <span>Simpan &amp; Unduh ({totalModifications})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

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
                      <Edit3 className="w-3.5 h-3.5" /> Edit Teks Terpilih
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
                      Isi Teks:
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
                    💡 Tips: Seret teks ini untuk memindahkan posisinya langsung ke atas area penutup dokumen.
                  </p>
                </div>
              )}

              {/* Panel Info Whiteout jika ada kotak whiteout yang dipilih */}
              {activeWhiteoutId && (() => {
                const activeBox = whiteoutBoxes.find((b) => b.id === activeWhiteoutId);
                const currentColor = activeBox?.color || '#FFFFFF';

                return (
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-amber-500 shadow-md space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Square className="w-3.5 h-3.5" />
                        <span>Kotak Koreksi / Patch Terpilih</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveWhiteoutId(null)}
                        className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        Tutup ✕
                      </button>
                    </div>

                    {/* Smart Color Sampling & Background Matcher */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Warna Patch (Latar Belakang):
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-400 shadow-inner shrink-0"
                            style={{ backgroundColor: currentColor }}
                          />
                          <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200">
                            {currentColor}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Tombol Pipet Warna (Eyedropper) */}
                        <button
                          type="button"
                          onClick={() => handlePickColorWithEyedropper(activeWhiteoutId)}
                          className="flex-1 py-1.5 px-2 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                          title="Ambil warna dari area mana pun di dokumen"
                        >
                          <Pipette className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>Pipet Warna</span>
                        </button>

                        {/* Tombol Auto-Sample Sekitar Kotak */}
                        <button
                          type="button"
                          onClick={() => handleAutoSampleActiveBox(activeWhiteoutId)}
                          className="flex-1 py-1.5 px-2 bg-amber-50 dark:bg-amber-950/70 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                          title="Baca otomatis warna latar belakang di sekeliling kotak ini"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Auto-Sample</span>
                        </button>

                        {/* Color Picker Manual */}
                        <input
                          type="color"
                          value={currentColor}
                          onChange={(e) => handleUpdateBoxColor(activeWhiteoutId, e.target.value.toUpperCase())}
                          className="w-7 h-7 rounded-lg cursor-pointer border border-slate-300 p-0.5 shrink-0"
                          title="Pilih warna bebas"
                        />
                      </div>

                      {/* Quick Color Presets */}
                      <div className="grid grid-cols-4 gap-1 pt-0.5">
                        {[
                          { label: 'Putih', hex: '#FFFFFF' },
                          { label: 'Krem', hex: '#FBF8EE' },
                          { label: 'Abu Form', hex: '#F1F5F9' },
                          { label: 'Sepia', hex: '#FEF9C3' },
                        ].map((cp) => (
                          <button
                            key={cp.hex}
                            type="button"
                            onClick={() => handleUpdateBoxColor(activeWhiteoutId, cp.hex)}
                            className="py-1 px-1 rounded-md border text-[10px] font-medium transition cursor-pointer flex items-center justify-center gap-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
                              style={{ backgroundColor: cp.hex }}
                            />
                            <span className="truncate">{cp.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Warna patch akan menyatu dengan latar dokumen. Seret kotak ke atas kalimat yang ingin ditutupi dan tarik sudut kanan-bawah kotak untuk mengatur ukuran.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleAddTextOnWhiteoutBox(activeWhiteoutId)}
                        className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Tambah Teks di Atas Kotak (+)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWhiteoutBox(activeWhiteoutId)}
                        className="py-2 px-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-950/70 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition cursor-pointer"
                        title="Hapus Kotak Whiteout Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Daftar Perubahan Teks & Whiteout (History Modifikasi) */}
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" /> Riwayat Modifikasi ({totalModifications})
                  </span>
                </div>

                {totalModifications === 0 ? (
                  <p className="text-xs text-slate-400 italic leading-relaxed">
                    Belum ada teks atau whiteout yang ditambahkan. Gunakan tombol &quot;Mode Whiteout&quot; atau &quot;Tambah Teks Baru (+)&quot; untuk mulai mengedit dokumen.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {/* Item Kotak Whiteout */}
                    {whiteoutBoxes.map((box, bIdx) => (
                      <div
                        key={box.id}
                        onClick={() => {
                          setActiveWhiteoutId(box.id);
                          setActiveEditingId(null);
                        }}
                        className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs cursor-pointer ${
                          activeWhiteoutId === box.id
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
                            Hal. {box.pageNum} • Kotak Patch #{bIdx + 1}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                              style={{ backgroundColor: box.color || '#FFFFFF' }}
                            />
                            <span className="text-[10px] text-slate-500 font-mono">
                              {box.color || '#FFFFFF'} • {box.width} × {box.height} pt
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWhiteoutBox(box.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition cursor-pointer"
                          title="Hapus Kotak Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Item Teks */}
                    {editedItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (!item.isDeleted) handleSelectItemToEdit(item);
                        }}
                        className={`p-2.5 rounded-xl border flex items-start justify-between gap-2 text-xs cursor-pointer ${
                          item.isDeleted
                            ? 'bg-red-50/60 dark:bg-red-950/40 border-red-200 dark:border-red-800/60'
                            : activeEditingId === item.id
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
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
                              ? 'Teks Tambahan'
                              : 'Teks Diedit'}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestoreTextItem(item.id);
                              }}
                              className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[10px] font-bold rounded cursor-pointer"
                              title="Kembalikan Teks Asli"
                            >
                              Batal
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTextItem(item.id);
                              }}
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

            {/* Kolom Kanan: Kanvas PDF & Lapisan Interaktif (8 Kolom) */}
            <div className="lg:col-span-8 space-y-3">
              {/* Petunjuk Interaksi */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 gap-2">
                <span className="flex items-center gap-1">
                  <Move className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    {isWhiteoutMode
                      ? 'Mode Koreksi Aktif: Seret mouse di atas dokumen untuk menggambar kotak penutup putih.'
                      : 'Klik kalimat mana pun untuk edit, atau seret teks / whiteout untuk memindahkan posisi.'}
                  </span>
                </span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full">
                  {pageDetectedItems.length > 0
                    ? `${pageDetectedItems.length} Elemen Teks Terdeteksi`
                    : 'Dokumen Gambar / Scan'}
                </span>
              </div>

              {/* Banner Panduan jika PDF berupa scan tanpa teks digital */}
              {pageDetectedItems.length === 0 && !isLoading && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-2.5 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 text-sm">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Dokumen Scan / Gambar Terdeteksi (0 Lapisan Teks Digital)</span>
                  </div>
                  <p className="leading-relaxed text-[11px] sm:text-xs">
                    Dokumen ini adalah foto/scan. Gunakan tombol <b>Mode Whiteout</b> untuk menutupi kalimat yang salah pada gambar dokumen, lalu klik <b>Tambah Teks Baru (+)</b> untuk menuliskan teks perbaikan di atasnya secara presisi.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsWhiteoutMode(true);
                        showToast('Silakan klik dan seret pada kanvas untuk menutup tulisan yang salah.');
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      <span>Aktifkan Mode Whiteout (Tutup Teks)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNewTextBlock}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 text-amber-900 dark:text-amber-200 font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Tambah Teks Baru di Sini</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Kontainer Kanvas PDF Scrollable */}
              <div className="relative bg-slate-200/80 dark:bg-slate-900/90 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-2 sm:p-4 flex justify-center items-start overflow-auto max-h-[780px] shadow-inner select-none">
                <div
                  ref={overlayContainerRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className={`relative shadow-2xl bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 ${
                    isEyedropperActive
                      ? 'cursor-crosshair ring-2 ring-purple-500'
                      : isWhiteoutMode
                      ? 'cursor-crosshair'
                      : 'cursor-default'
                  }`}
                >
                  {/* Floating Indicator Eyedropper Active */}
                  {isEyedropperActive && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 pointer-events-none border border-white/20">
                      <Pipette className="w-3.5 h-3.5 animate-pulse" />
                      <span>Mode Pipet: Klik area latar belakang dokumen untuk menyalin warna</span>
                    </div>
                  )}

                  {/* Kanvas PDF.js Asli */}
                  <canvas ref={canvasRef} className="block max-w-none" />

                  {/* Kotak Sementara saat Pengguna Sedang Menyeret untuk Membuat Whiteout */}
                  {isDrawingWhiteout && drawStartPos && drawCurrentPos && (
                    <div
                      style={{
                        left: `${Math.min(drawStartPos.x, drawCurrentPos.x)}px`,
                        top: `${Math.min(drawStartPos.y, drawCurrentPos.y)}px`,
                        width: `${Math.abs(drawCurrentPos.x - drawStartPos.x)}px`,
                        height: `${Math.abs(drawCurrentPos.y - drawStartPos.y)}px`,
                      }}
                      className="absolute border-2 border-dashed border-amber-500 bg-white/90 z-40 pointer-events-none shadow-md"
                    />
                  )}

                  {/* Lapisan Interaktif: Whiteout Boxes, Teks Asli & Teks Baru */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* A. Kotak-kotak Whiteout (Penutup Putih) pada Halaman Aktif */}
                    {whiteoutBoxes
                      .filter((b) => b.pageNum === currentPage)
                      .map((box) => {
                        const posX = box.pdfX * scale;
                        const posY = (pdfPageDimensions.height - box.pdfY - box.height) * scale;
                        const boxW = box.width * scale;
                        const boxH = box.height * scale;
                        const isSelected = activeWhiteoutId === box.id;

                        return (
                          <div
                            key={box.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveWhiteoutId(box.id);
                              setActiveEditingId(null);
                            }}
                            style={{
                              left: `${posX}px`,
                              top: `${posY}px`,
                              width: `${boxW}px`,
                              height: `${boxH}px`,
                              backgroundColor: box.color || '#FFFFFF',
                            }}
                            className={`absolute pointer-events-auto rounded-xs transition-all z-20 flex items-center justify-between group ${
                              isSelected
                                ? 'ring-2 ring-amber-500 shadow-md border border-amber-400'
                                : 'border border-slate-300/60 hover:border-amber-400/90 shadow-2xs'
                            }`}
                          >
                            {/* Tombol Drag Kotak Whiteout */}
                            <div
                              onMouseDown={(e) => handleStartDragWhiteout(e, box.id)}
                              onTouchStart={(e) => handleStartDragWhiteout(e, box.id)}
                              className="cursor-move p-0.5 text-slate-400 hover:text-amber-600 bg-white/90 hidden group-hover:flex items-center"
                              title="Klik dan seret untuk memindahkan kotak penutup putih ini"
                            >
                              <Move className="w-2.5 h-2.5" />
                            </div>

                            {/* Tombol Hapus Kotak */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWhiteoutBox(box.id);
                              }}
                              className="cursor-pointer p-0.5 text-slate-300 hover:text-red-500 hidden group-hover:flex items-center"
                              title="Hapus kotak whiteout ini"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>

                            {/* Handle Sudut Kanan Bawah untuk Mengubah Ukuran (Resize Handle) */}
                            <div
                              onMouseDown={(e) => handleStartResizeWhiteout(e, box.id)}
                              onTouchStart={(e) => handleStartResizeWhiteout(e, box.id)}
                              className="absolute -right-1 -bottom-1 w-3 h-3 bg-amber-500 rounded-full cursor-nwse-resize shadow-xs opacity-0 group-hover:opacity-100 transition-opacity z-30"
                              title="Tarik sudut ini untuk mengubah ukuran kotak penutup"
                            />
                          </div>
                        );
                      })}

                    {/* B. Teks Asli yang Terdeteksi di Halaman */}
                    {pageDetectedItems.map((item) => {
                      const edited = editedItems.find((e) => e.id === item.id);
                      const isDeleted = edited?.isDeleted;

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
                            className="absolute pointer-events-auto bg-white/95 border border-red-300 text-red-500 rounded-xs flex items-center justify-between px-1 z-25 shadow-2xs"
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
                              ? 'bg-amber-300/40 border border-amber-500 z-25 px-1'
                              : 'hover:bg-indigo-500/15 hover:border hover:border-indigo-400/50 z-20'
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

                    {/* C. Teks Kustom Baru yang Ditambahkan Pengguna (Muncul di Atas Whiteout) */}
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
                            className={`absolute pointer-events-auto p-1.5 bg-white/95 dark:bg-slate-900 border rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 z-30 group ${
                              isSelected ? 'ring-2 ring-indigo-600 border-indigo-600' : 'border-indigo-400'
                            }`}
                          >
                            <div
                              onMouseDown={(e) => handleStartDrag(e, item.id)}
                              onTouchStart={(e) => handleStartDrag(e, item.id)}
                              className="cursor-move p-0.5 rounded text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 shadow-xs"
                              title="Seret untuk memindahkan posisi teks di atas dokumen"
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
                Unggah dokumen surat, sertifikat, laporan invoice, atau hasil scan PDF. Teks digital dideteksi otomatis, dan untuk PDF hasil scan/gambar tersedia <b>Mode Whiteout</b> untuk menghapus dan menimpa teks lama secara presisi.
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

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Mendukung PDF digital, e-faktur, formulir lamaran, serta PDF hasil scan fotocopy / foto HP.</span>
            </div>
          </div>
        )}

        {/* Panduan & Standar Kualitas (Template Seragam) */}
        <div className="mt-10 sm:mt-12">
          <ToolEditorialSection toolId="pdf-editor" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
