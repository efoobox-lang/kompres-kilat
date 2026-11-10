'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolEditorialSection from '@/components/ToolEditorialSection';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { loadPdfJs } from '@/lib/pdf-text-extractor';
import { validateUploadedFile, downloadBlobSafely, loadImageSafely } from '@/lib/file-security';
import {
  Globe,
  Camera,
  Stamp,
  ShieldCheck,
  Lock,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sliders,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Eye,
  Printer,
  RotateCw,
  UserCheck,
  FileText
} from 'lucide-react';

type UtilityMode = 'resizer' | 'watermark';

interface PassportPreset {
  id: string;
  country: string;
  label: string;
  widthMm: number;
  heightMm: number;
  aspectRatio: number;
  description: string;
}

const PASSPORT_PRESETS: PassportPreset[] = [
  {
    id: 'icao-standard',
    country: 'Internasional / Indonesia / Schengen / UK',
    label: '35 × 45 mm (Paspor Global & Visa Eropa)',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    description: 'Standar ICAO Doc 9303 untuk Paspor RI, Visa Schengen, Inggris, Jepang, & Australia',
  },
  {
    id: 'us-visa',
    country: 'Amerika Serikat / India',
    label: '2 × 2 inci / 51 × 51 mm (Visa US & Green Card)',
    widthMm: 50.8,
    heightMm: 50.8,
    aspectRatio: 1,
    description: 'Format persegi wajib untuk Kedutaan Besar AS (DS-160) & Visa India',
  },
  {
    id: 'china-visa',
    country: 'Tiongkok (China)',
    label: '33 × 48 mm (Visa China & Makau)',
    widthMm: 33,
    heightMm: 48,
    aspectRatio: 33 / 48,
    description: 'Standar biometrik resmi Konsulat Republik Rakyat Tiongkok',
  },
  {
    id: 'malaysia-sg',
    country: 'Malaysia & Singapura',
    label: '35 × 50 mm (Visa Malaysia / ICA Singapore)',
    widthMm: 35,
    heightMm: 50,
    aspectRatio: 35 / 50,
    description: 'Format foto kartu identitas dan aplikasi visa resmi ICA Singapura',
  },
  {
    id: 'id-ktp',
    country: 'Indonesia Dokumen Resmi',
    label: '30 × 40 mm / 3 × 4 cm (KTP, SIM, CPNS)',
    widthMm: 30,
    heightMm: 40,
    aspectRatio: 30 / 40,
    description: 'Format pendaftaran CPNS, BUMN, SIM, dan buku administrasi negara',
  },
  {
    id: 'id-ijazah',
    country: 'Indonesia Ijazah & Buku Nikah',
    label: '40 × 60 mm / 4 × 6 cm (Ijazah & Nikah KUA)',
    widthMm: 40,
    heightMm: 60,
    aspectRatio: 40 / 60,
    description: 'Standar formal foto ijazah kelulusan dan dokumen KUA Kemenag',
  },
];

const WATERMARK_PRESETS = [
  'HANYA UNTUK VERIFIKASI REKENING BANK',
  'FOR VISA APPLICATION PURPOSES ONLY',
  'HANYA UNTUK PENDAFTARAN KERJA (REKRUTMEN)',
  'HANYA UNTUK KEPERLUAN SEWA / RENTAL',
  'VERIFIKASI IDENTITAS - JANGAN DI-SHARE',
];

export default function PassportIdUtilityPage() {
  const [activeTab, setActiveTab] = useState<UtilityMode>('resizer');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // =========================================================================
  // 1. PASSPORT RESIZER STATE
  // =========================================================================
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PassportPreset>(PASSPORT_PRESETS[0]);
  const [showFaceGuide, setShowFaceGuide] = useState<boolean>(true);
  const [bgColor, setBgColor] = useState<string>('original'); // 'original', '#ffffff', '#0090ff', '#e11d48', '#f1f5f9'
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const photoCanvasRef = useRef<HTMLCanvasElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // =========================================================================
  // 2. SECURE WATERMARKER STATE
  // =========================================================================
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<'image' | 'pdf'>('image');
  const [docImg, setDocImg] = useState<HTMLImageElement | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(1);
  const [watermarkText, setWatermarkText] = useState<string>('HANYA UNTUK VERIFIKASI IDENTITAS RESMI');
  const [watermarkStyle, setWatermarkStyle] = useState<'diagonal-repeat' | 'center-banner' | 'corner-stamp'>('diagonal-repeat');
  const [watermarkColor, setWatermarkColor] = useState<string>('#dc2626'); // Red default for security
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(35); // 35%
  const [watermarkFontSize, setWatermarkFontSize] = useState<number>(24);
  const [watermarkAngle, setWatermarkAngle] = useState<number>(-30);
  const [isProcessingWatermark, setIsProcessingWatermark] = useState<boolean>(false);

  const docCanvasRef = useRef<HTMLCanvasElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // =========================================================================
  // PASSPORT RESIZER: CANVAS RENDERING
  // =========================================================================
  const renderPassportCanvas = useCallback(() => {
    if (!photoCanvasRef.current || !photoImg) return;
    const canvas = photoCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Output target dimensions in high resolution (300 DPI: ~11.81 pixels per mm)
    const pxPerMm = 11.811;
    const targetWidth = Math.round(selectedPreset.widthMm * pxPerMm);
    const targetHeight = Math.round(selectedPreset.heightMm * pxPerMm);

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Background filling
    if (bgColor !== 'original') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    ctx.save();
    // Transform center
    ctx.translate(targetWidth / 2 + panX, targetHeight / 2 + panY);
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate base cover scaling
    const baseScale = Math.max(targetWidth / photoImg.naturalWidth, targetHeight / photoImg.naturalHeight);
    const finalScale = baseScale * zoomLevel;

    const drawW = photoImg.naturalWidth * finalScale;
    const drawH = photoImg.naturalHeight * finalScale;

    ctx.drawImage(photoImg, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Biometric ICAO Face Alignment Guidelines Overlay
    if (showFaceGuide) {
      ctx.save();
      const headTop = targetHeight * 0.12;
      const chinBottom = targetHeight * 0.82;
      const eyeLine = targetHeight * 0.44;
      const faceHeight = chinBottom - headTop;
      const faceWidth = faceHeight * 0.72;

      ctx.strokeStyle = 'rgba(79, 70, 229, 0.75)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);

      // Oval Face Guide
      ctx.beginPath();
      ctx.ellipse(targetWidth / 2, (headTop + chinBottom) / 2, faceWidth / 2, faceHeight / 2, 0, 0, 2 * Math.PI);
      ctx.stroke();

      // Eye Level Horizontal Line
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(targetWidth / 2 - faceWidth / 2 - 20, eyeLine);
      ctx.lineTo(targetWidth / 2 + faceWidth / 2 + 20, eyeLine);
      ctx.stroke();

      // Chin Line
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.beginPath();
      ctx.moveTo(targetWidth / 2 - faceWidth / 3, chinBottom);
      ctx.lineTo(targetWidth / 2 + faceWidth / 3, chinBottom);
      ctx.stroke();

      // Labels
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.font = 'bold 20px -apple-system, sans-serif';
      ctx.fillText('Area Wajah Biometrik (70-80%)', 20, targetHeight - 24);

      ctx.restore();
    }
  }, [photoImg, selectedPreset, bgColor, zoomLevel, panX, panY, rotation, showFaceGuide]);

  useEffect(() => {
    renderPassportCanvas();
  }, [renderPassportCanvas]);

  // Handle Photo File Upload
  const handlePhotoUpload = async (file: File) => {
    setErrorMessage('');
    setSuccessMessage('');

    const validation = await validateUploadedFile(file, {
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSizeBytes: 25 * 1024 * 1024,
      checkMagicBytes: true,
    });

    if (!validation.valid) {
      setErrorMessage(validation.error || 'Format gambar tidak valid.');
      return;
    }

    try {
      const { img } = await loadImageSafely(file);
      setPhotoFile(file);
      setPhotoImg(img);
      setZoomLevel(1);
      setPanX(0);
      setPanY(0);
      setRotation(0);
      setSuccessMessage('Foto paspor berhasil dimuat.');
    } catch {
      setErrorMessage('Gagal memproses foto identitas.');
    }
  };

  // Download Single Passport Photo (300 DPI)
  const downloadSinglePassportPhoto = () => {
    if (!photoCanvasRef.current || !photoFile) return;
    photoCanvasRef.current.toBlob(
      (blob) => {
        if (!blob) return;
        const name = photoFile.name.replace(/\.[^/.]+$/, '');
        downloadBlobSafely(blob, `${name}_Paspor_${selectedPreset.widthMm}x${selectedPreset.heightMm}mm.jpg`);
      },
      'image/jpeg',
      0.95
    );
  };

  // Download Printable 4x6 Sheet (Grid of photos for printing)
  const downloadPrintableSheet = () => {
    if (!photoCanvasRef.current || !photoFile) return;

    // Create 4x6 inch (1200 x 1800 px at 300 DPI) photo paper canvas
    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = 1800; // 6 inches
    sheetCanvas.height = 1200; // 4 inches
    const ctx = sheetCanvas.getContext('2d');
    if (!ctx) return;

    // White photo paper background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

    // Get current single photo
    const singleCanvas = photoCanvasRef.current;
    const photoW = singleCanvas.width;
    const photoH = singleCanvas.height;

    // Scale to fit neatly in grid (e.g. 2 rows x 4 cols or 2 rows x 3 cols)
    const margin = 60;
    const availableW = sheetCanvas.width - margin * 2;
    const availableH = sheetCanvas.height - margin * 2;

    const cols = Math.floor(availableW / (photoW + 30)) || 2;
    const rows = Math.floor(availableH / (photoH + 30)) || 2;
    const totalSlots = Math.max(4, Math.min(cols * rows, 8));

    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (count >= totalSlots) break;
        const x = margin + c * (photoW + 35);
        const y = margin + r * (photoH + 35);

        // Draw photo
        ctx.drawImage(singleCanvas, x, y, photoW, photoH);

        // Subtle cutting line around each photo
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, photoW, photoH);

        count++;
      }
    }

    // Sheet label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText(`Paket Cetak Pasfoto 4×6 Inci (${selectedPreset.label}) • KompresKilat.site`, margin, sheetCanvas.height - 20);

    sheetCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const name = photoFile.name.replace(/\.[^/.]+$/, '');
        downloadBlobSafely(blob, `${name}_Paket_Cetak_4x6_Paspor.jpg`);
      },
      'image/jpeg',
      0.95
    );
  };

  // =========================================================================
  // 2. SECURE WATERMARKER: CANVAS & PDF RENDERING
  // =========================================================================
  const renderWatermarkOnCanvas = useCallback(() => {
    if (!docCanvasRef.current || !docImg) return;
    const canvas = docCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = docImg.naturalWidth;
    canvas.height = docImg.naturalHeight;

    // Draw document original image
    ctx.drawImage(docImg, 0, 0);

    // Apply watermark layer
    ctx.save();
    ctx.fillStyle = watermarkColor;
    ctx.globalAlpha = watermarkOpacity / 100;
    ctx.font = `bold ${watermarkFontSize * (canvas.width / 800)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

    if (watermarkStyle === 'diagonal-repeat') {
      // Repeated diagonal grid pattern across entire document to prevent cropping
      const stepX = 320 * (canvas.width / 1000);
      const stepY = 160 * (canvas.height / 1200);

      for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
        for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((watermarkAngle * Math.PI) / 180);
          ctx.fillText(watermarkText, 0, 0);
          ctx.restore();
        }
      }
    } else if (watermarkStyle === 'center-banner') {
      // Bold center banner
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((watermarkAngle * Math.PI) / 180);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Background strip
      const textMetrics = ctx.measureText(watermarkText);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(-textMetrics.width / 2 - 40, -40, textMetrics.width + 80, 80);

      ctx.fillStyle = watermarkColor;
      ctx.fillText(watermarkText, 0, 0);
    } else if (watermarkStyle === 'corner-stamp') {
      // Corner stamp at bottom right
      ctx.textAlign = 'right';
      ctx.fillText(watermarkText, canvas.width - 40, canvas.height - 40);
    }

    ctx.restore();
  }, [docImg, watermarkText, watermarkStyle, watermarkColor, watermarkOpacity, watermarkFontSize, watermarkAngle]);

  useEffect(() => {
    if (docType === 'image') {
      renderWatermarkOnCanvas();
    }
  }, [docType, renderWatermarkOnCanvas]);

  // Handle Document Upload (Image or PDF)
  const handleDocUpload = async (file: File) => {
    setErrorMessage('');
    setSuccessMessage('');

    const validation = await validateUploadedFile(file, {
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      maxSizeBytes: 50 * 1024 * 1024,
      checkMagicBytes: true,
    });

    if (!validation.valid) {
      setErrorMessage(validation.error || 'Berkas dokumen tidak valid.');
      return;
    }

    setDocFile(file);

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setDocType('pdf');
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        setPdfBytes(bytes);

        // Render first page preview via pdfjs-dist
        const pdfjs = await loadPdfJs();
        const loadingTask = pdfjs.getDocument({ data: bytes });
        const doc = await loadingTask.promise;
        setPdfTotalPages(doc.numPages);

        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          const img = new Image();
          img.src = canvas.toDataURL();
          img.onload = () => {
            setDocImg(img);
          };
        }
        setSuccessMessage(`Dokumen PDF (${doc.numPages} Halaman) siap dibubuhi watermark.`);
      } catch {
        setErrorMessage('Gagal memproses dokumen PDF.');
      }
    } else {
      setDocType('image');
      try {
        const { img } = await loadImageSafely(file);
        setDocImg(img);
        setSuccessMessage('Foto pindaian dokumen identitas berhasil dimuat.');
      } catch {
        setErrorMessage('Gagal memproses gambar dokumen.');
      }
    }
  };

  // Convert Hex to RGB 0-1 for pdf-lib
  const hexToPdfRgb = (hex: string) => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
    const num = parseInt(clean, 16);
    return rgb(((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255);
  };

  // Export Watermarked Document
  const handleExportWatermarkedDoc = async () => {
    if (!docFile) return;
    setIsProcessingWatermark(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const baseName = docFile.name.replace(/\.[^/.]+$/, '');

      if (docType === 'image') {
        if (!docCanvasRef.current) return;
        docCanvasRef.current.toBlob(
          (blob) => {
            if (!blob) return;
            downloadBlobSafely(blob, `${baseName}_Terproteksi_Watermark.jpg`);
            setSuccessMessage('Dokumen berhasil dibubuhi watermark dan diunduh.');
          },
          'image/jpeg',
          0.95
        );
      } else if (docType === 'pdf' && pdfBytes) {
        // Stamp watermark on every page of PDF using pdf-lib
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pdfColor = hexToPdfRgb(watermarkColor);
        const pages = pdfDoc.getPages();

        for (const page of pages) {
          const { width, height } = page.getSize();

          if (watermarkStyle === 'diagonal-repeat') {
            for (let x = -width; x < width * 2; x += 300) {
              for (let y = -height; y < height * 2; y += 150) {
                page.drawText(watermarkText, {
                  x,
                  y,
                  size: watermarkFontSize * 0.75,
                  font,
                  color: pdfColor,
                  opacity: watermarkOpacity / 100,
                  rotate: degrees(watermarkAngle),
                });
              }
            }
          } else {
            page.drawText(watermarkText, {
              x: width / 2 - 150,
              y: height / 2,
              size: watermarkFontSize,
              font,
              color: pdfColor,
              opacity: watermarkOpacity / 100,
              rotate: degrees(watermarkAngle),
            });
          }
        }

        const outBytes = await pdfDoc.save();
        const outBlob = new Blob([outBytes as unknown as BlobPart], { type: 'application/pdf' });
        downloadBlobSafely(outBlob, `${baseName}_Terproteksi_Watermark.pdf`);
        setSuccessMessage(`Berhasil menyematkan watermark pada ${pages.length} halaman PDF.`);
      }
    } catch (err) {
      console.error('Watermarking export error:', err);
      setErrorMessage('Terjadi kendala saat membubuhkan watermark.');
    } finally {
      setIsProcessingWatermark(false);
    }
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Global ID & Passport Photo Resizer & Secure Watermarker - KompresKilat',
    url: 'https://kompreskilat.site/tools/passport-id-utility',
    description: 'Ubah ukuran pasfoto paspor standar global (35x45mm, 2x2 inci) dengan panduan wajah biometrik, dan bubuhkan watermark anti-penyalahgunaan pada scan KTP / Paspor secara 100% lokal.',
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
            <Lock className="w-3.5 h-3.5" />
            <span>100% Client-Side Privacy Guarantee (Zero Server Upload)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
            Global ID & Passport Utility
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Perkakas resmi pasfoto paspor standar internasional & perlindungan dokumen identitas (KTP / Paspor) dengan stempel watermark anti-penyalahgunaan.
          </p>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-2 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('resizer');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`p-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 ${
                activeTab === 'resizer'
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>1. Paspor & ID Photo Resizer (ICAO Standard)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('watermark');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`p-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 ${
                activeTab === 'watermark'
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold'
              }`}
            >
              <Stamp className="w-4 h-4" />
              <span>2. Secure Watermarker Dokumen (Anti-Misuse)</span>
            </button>
          </div>
        </div>

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

        {/* ========================================================================= */}
        {/* MODULE 1: PASSPORT & ID PHOTO RESIZER */}
        {/* ========================================================================= */}
        {activeTab === 'resizer' && (
          <div className="space-y-6 mb-8">
            {!photoFile ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 transition-colors">
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-8 sm:p-12 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/40 transition-all"
                >
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handlePhotoUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Unggah Foto Potret untuk Disesuaikan ke Standar Paspor
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                    Mendukung standar paspor seluruh dunia (Schengen, AS, Jepang, Tiongkok, dsb). Dilengkapi panduan biometrik wajah.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md">
                    <Upload className="w-4 h-4" />
                    Pilih Foto Wajah
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Foto Wajah Tidak Pernah Dikirim ke Server
                  </span>
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" /> Rasio Biometrik ICAO Doc 9303
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-amber-500" /> Siap Cetak Kertas 4×6 Inci
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Controls */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-indigo-500" /> Pengaturan Dimensi Paspor
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoImg(null);
                        }}
                        className="text-slate-400 hover:text-red-500 text-[11px] flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Ganti Foto
                      </button>
                    </div>

                    {/* Presets List */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Pilih Standar Negara:
                      </label>
                      <div className="space-y-1.5 max-h-56 overflow-auto pr-1">
                        {PASSPORT_PRESETS.map((preset) => (
                          <div
                            key={preset.id}
                            onClick={() => setSelectedPreset(preset)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition-all text-xs ${
                              selectedPreset.id === preset.id
                                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/30'
                                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="font-bold flex items-center justify-between">
                              <span>{preset.label}</span>
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                                {preset.widthMm}x{preset.heightMm}mm
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {preset.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Background Color Changer */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Warna Latar Belakang (Background):
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { id: 'original', label: 'Asli', bg: '#e2e8f0' },
                          { id: '#ffffff', label: 'Putih', bg: '#ffffff' },
                          { id: '#0090ff', label: 'Biru', bg: '#0090ff' },
                          { id: '#e11d48', label: 'Merah', bg: '#e11d48' },
                          { id: '#f1f5f9', label: 'Abu', bg: '#f1f5f9' },
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setBgColor(c.id)}
                            className={`py-1.5 rounded-lg border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${
                              bgColor === c.id
                                ? 'border-indigo-600 ring-2 ring-indigo-500/30 shadow'
                                : 'border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-slate-300 shadow-inner"
                              style={{ backgroundColor: c.bg }}
                            />
                            <span className="text-[10px] text-slate-600 dark:text-slate-400">{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Zoom & Position Controls */}
                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Perbesar / Skala Wajah:</span>
                          <span className="text-indigo-600 font-mono">{Math.round(zoomLevel * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.05"
                          value={zoomLevel}
                          onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Tampilkan Panduan Biometrik Wajah:
                        </label>
                        <input
                          type="checkbox"
                          checked={showFaceGuide}
                          onChange={(e) => setShowFaceGuide(e.target.checked)}
                          className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRotation((r) => (r + 90) % 360)}
                          className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300"
                        >
                          <RotateCw className="w-3.5 h-3.5" /> Putar 90°
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPanX(0);
                            setPanY(0);
                            setZoomLevel(1);
                            setRotation(0);
                          }}
                          className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-500"
                        >
                          Pusatkan
                        </button>
                      </div>
                    </div>

                    {/* Export Actions */}
                    <div className="pt-2 space-y-2">
                      <button
                        type="button"
                        onClick={downloadSinglePassportPhoto}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
                      >
                        <Download className="w-4 h-4" /> Unduh Pasfoto Tunggal (300 DPI)
                      </button>
                      <button
                        type="button"
                        onClick={downloadPrintableSheet}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 font-bold text-xs transition-all"
                      >
                        <Printer className="w-4 h-4" /> Unduh Lembar Cetak Foto 4×6 Inci
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Live Interactive Canvas Viewport */}
                <div className="lg:col-span-7 flex flex-col items-center">
                  <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 flex flex-col items-center">
                    <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-indigo-500" /> Pratinjau Interaktif Pasfoto
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Geser foto dengan mouse/touchpad untuk memposisikan wajah
                      </span>
                    </div>

                    {/* Interactive Draggable Canvas Wrapper */}
                    <div
                      onMouseDown={(e) => {
                        setIsDraggingPhoto(true);
                        dragStartRef.current = { x: e.clientX - panX, y: e.clientY - panY };
                      }}
                      onMouseMove={(e) => {
                        if (!isDraggingPhoto) return;
                        setPanX(e.clientX - dragStartRef.current.x);
                        setPanY(e.clientY - dragStartRef.current.y);
                      }}
                      onMouseUp={() => setIsDraggingPhoto(false)}
                      onMouseLeave={() => setIsDraggingPhoto(false)}
                      className="cursor-move p-4 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center max-w-full select-none"
                    >
                      <canvas
                        ref={photoCanvasRef}
                        className="max-h-[460px] w-auto shadow-2xl rounded border border-slate-200 dark:border-slate-800 bg-white"
                      />
                    </div>

                    <div className="mt-3 text-center text-[11px] text-slate-400 max-w-md">
                      Posisikan puncak kepala di garis putus-putus atas dan dagu pada garis merah sesuai standar biometrik internasional ICAO 70%-80%.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 2: SECURE WATERMARKER FOR DOCUMENTS */}
        {/* ========================================================================= */}
        {activeTab === 'watermark' && (
          <div className="space-y-6 mb-8">
            {!docFile ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 transition-colors">
                <div
                  onClick={() => docInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-8 sm:p-12 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/40 transition-all"
                >
                  <input
                    ref={docInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleDocUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Stamp className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Unggah Pindaian KTP, Paspor, atau SIM (Foto / PDF)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                    Cegah penyalahgunaan data identitas oleh pinjol ilegal atau penipuan perbankan dengan membubuhi stempel watermark resmi anti-crop.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md">
                    <Upload className="w-4 h-4" />
                    Pilih Berkas Dokumen Identitas
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Sesuai Anjuran Kominfo RI (Watermark Khusus Transaksi)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-indigo-600" /> Pemrosesan 100% di RAM Browser Pengguna
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-500" /> Mendukung Gambar & Berkas PDF Multi-Halaman
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Watermark Controls */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Stamp className="w-4 h-4 text-red-500" /> Pengaturan Stempel Watermark
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setDocFile(null);
                          setDocImg(null);
                          setPdfBytes(null);
                        }}
                        className="text-slate-400 hover:text-red-500 text-[11px] flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Ganti Dokumen
                      </button>
                    </div>

                    {/* File Meta */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {docFile.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Tipe: {docType === 'pdf' ? `Dokumen PDF (${pdfTotalPages} Halaman)` : 'Gambar Identitas'}
                      </div>
                    </div>

                    {/* Watermark Text Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Teks Watermark Khusus:
                        </label>
                        <button
                          type="button"
                          onClick={() => setWatermarkText((prev) => `${prev} - ${new Date().toLocaleDateString('id-ID')}`)}
                          className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          + Tambah Tanggal Hari Ini
                        </button>
                      </div>
                      <textarea
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        rows={2}
                        className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                        placeholder="Contoh: HANYA UNTUK VERIFIKASI BANK BCA - 03/11/2026"
                      />

                      {/* Quick Presets */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {WATERMARK_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setWatermarkText(`${preset} - ${new Date().toLocaleDateString('id-ID')}`)}
                            className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                          >
                            {preset.split(' ')[0]} {preset.split(' ')[1]}...
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Watermark Style */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Model Pola Stempel:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'diagonal-repeat', label: 'Pola Miring Anti-Crop' },
                          { id: 'center-banner', label: 'Pita Tegas Tengah' },
                          { id: 'corner-stamp', label: 'Stempel Sudut' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setWatermarkStyle(m.id as 'diagonal-repeat' | 'center-banner' | 'corner-stamp')}
                            className={`p-2 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                              watermarkStyle === m.id
                                ? 'border-red-600 bg-red-50/50 dark:bg-red-950/30 text-red-900 dark:text-red-300 ring-1 ring-red-500/30'
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Opacity, Angle & Font Size Sliders */}
                    <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Transparansi:</span>
                          <span className="font-mono text-red-600">{watermarkOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(parseInt(e.target.value, 10))}
                          className="w-full accent-red-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Ukuran Font:</span>
                          <span className="font-mono text-red-600">{watermarkFontSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="14"
                          max="48"
                          value={watermarkFontSize}
                          onChange={(e) => setWatermarkFontSize(parseInt(e.target.value, 10))}
                          className="w-full accent-red-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Rotasi:</span>
                          <span className="font-mono text-red-600">{watermarkAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min="-60"
                          max="60"
                          value={watermarkAngle}
                          onChange={(e) => setWatermarkAngle(parseInt(e.target.value, 10))}
                          className="w-full accent-red-600"
                        />
                      </div>
                    </div>

                    {/* Color Presets */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Warna Stempel Watermark:
                      </label>
                      <div className="flex items-center gap-3">
                        {['#dc2626', '#1e293b', '#2563eb', '#16a34a', '#d97706'].map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => setWatermarkColor(hex)}
                            style={{ backgroundColor: hex }}
                            className={`w-6 h-6 rounded-full border-2 transition-transform ${
                              watermarkColor === hex ? 'scale-125 border-red-600 shadow' : 'border-white dark:border-slate-700'
                            }`}
                          />
                        ))}
                        <input
                          type="color"
                          value={watermarkColor}
                          onChange={(e) => setWatermarkColor(e.target.value)}
                          className="w-7 h-7 rounded cursor-pointer border border-slate-300"
                        />
                      </div>
                    </div>

                    {/* Export Action */}
                    <button
                      type="button"
                      disabled={isProcessingWatermark}
                      onClick={handleExportWatermarkedDoc}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                    >
                      {isProcessingWatermark ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Unduh Dokumen Ber-Watermark Aman
                    </button>
                  </div>
                </div>

                {/* Right: Live Preview */}
                <div className="lg:col-span-7 flex flex-col items-center">
                  <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 flex flex-col items-center">
                    <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Pratinjau Dokumen Terproteksi
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {docType === 'pdf' ? 'Pratinjau Halaman 1 (PDF)' : 'Pratinjau Citra Asli'}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-auto flex items-center justify-center max-w-full">
                      <canvas
                        ref={docCanvasRef}
                        className="max-h-[500px] w-auto shadow-xl rounded border border-slate-200 dark:border-slate-800 bg-white"
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 text-center max-w-md">
                      Pola miring berulang memastikan dokumen tidak dapat disalahgunakan atau diedit oleh pihak ketiga tanpa merusak tanda tangan verifikasi Anda.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Panduan & Standar Kualitas (Template Seragam) */}
        <div className="mt-10 sm:mt-12 mb-8">
          <ToolEditorialSection toolId="passport-id-utility" />
        </div>

        {/* Quick Link to Related Tools */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Perkakas Terkait:</span>
          <Link href="/tools/censor-ktp" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Sensor NIK KTP & Dokumen
          </Link>
          <span>•</span>
          <Link href="/tools/resize-pasfoto" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Resize Pasfoto 3x4 & 4x6
          </Link>
          <span>•</span>
          <Link href="/tools/remove-bg" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Hapus Latar Foto AI
          </Link>
          <span>•</span>
          <Link href="/tools/watermark" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Watermark Gambar Umum
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
