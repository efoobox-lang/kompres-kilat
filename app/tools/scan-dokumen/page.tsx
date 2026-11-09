'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import ToolEditorialSection from '@/components/ToolEditorialSection';
import { PDFDocument } from 'pdf-lib';
import {
  Scan,
  Camera,
  Upload,
  RotateCw,
  RotateCcw,
  Download,
  FileText,
  Sliders,
  Sparkles,
  Printer,
  FileCheck,
  ShieldCheck,
  HelpCircle,
  X,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

type FilterMode = 'fotocopy' | 'magic-color' | 'grayscale' | 'original';
type PaperSize = 'auto' | 'a4' | 'f4';

export default function SmartScanPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('fotocopy');
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');
  const [rotation, setRotation] = useState<number>(0);
  const [threshold, setThreshold] = useState<number>(55); // 0 - 100
  const [brightness, setBrightness] = useState<number>(10); // -50 to 50
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Handle file input upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (!file.type.startsWith('image/')) {
      alert('Format berkas tidak valid. Harap pilih gambar (JPG, PNG, atau WebP).');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      originalImageRef.current = img;
      setImageSrc(objectUrl);
      setRotation(0);
    };
    img.src = objectUrl;
  };

  // Open WebRTC Camera Modal
  const openCamera = async () => {
    setIsCameraOpen(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setCameraError('Gagal mengakses kamera perangkat. Pastikan izin kamera telah diberikan atau gunakan tombol unggah.');
    }
  };

  // Close Camera
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // Capture Photo from Camera Stream
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth || 1280;
    tempCanvas.height = video.videoHeight || 720;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);

    const img = new Image();
    img.onload = () => {
      originalImageRef.current = img;
      setImageSrc(dataUrl);
      setSelectedFile(new File([], 'camera-scan.jpg', { type: 'image/jpeg' }));
      setRotation(0);
      closeCamera();
    };
    img.src = dataUrl;
  };

  // Render & Apply Canvas Filters
  const processCanvas = useCallback(() => {
    if (!originalImageRef.current || !canvasRef.current) return;
    setIsProcessing(true);

    const img = originalImageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const isRotatedQuarter = rotation === 90 || rotation === 270;
    let baseWidth = isRotatedQuarter ? img.naturalHeight : img.naturalWidth;
    let baseHeight = isRotatedQuarter ? img.naturalWidth : img.naturalHeight;

    // Apply paper ratio
    let targetWidth = baseWidth;
    let targetHeight = baseHeight;

    if (paperSize === 'a4') {
      // Standard A4 aspect ratio 1 : 1.4142
      const a4Ratio = 1.4142;
      if (baseHeight / baseWidth < a4Ratio) {
        targetHeight = Math.round(baseWidth * a4Ratio);
      } else {
        targetWidth = Math.round(baseHeight / a4Ratio);
      }
    } else if (paperSize === 'f4') {
      // Standard F4 / Folio aspect ratio 1 : 1.5348
      const f4Ratio = 1.5348;
      if (baseHeight / baseWidth < f4Ratio) {
        targetHeight = Math.round(baseWidth * f4Ratio);
      } else {
        targetWidth = Math.round(baseHeight / f4Ratio);
      }
    }

    // Cap maximum dimensions for smooth mobile canvas performance
    const maxDimension = 2400;
    if (targetWidth > maxDimension || targetHeight > maxDimension) {
      const scale = Math.min(maxDimension / targetWidth, maxDimension / targetHeight);
      targetWidth = Math.round(targetWidth * scale);
      targetHeight = Math.round(targetHeight * scale);
      baseWidth = Math.round(baseWidth * scale);
      baseHeight = Math.round(baseHeight * scale);
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Fill white paper background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Center image inside paper bounds
    const offsetX = Math.round((targetWidth - baseWidth) / 2);
    const offsetY = Math.round((targetHeight - baseHeight) / 2);

    ctx.save();
    ctx.translate(offsetX + baseWidth / 2, offsetY + baseHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const drawW = isRotatedQuarter ? baseHeight : baseWidth;
    const drawH = isRotatedQuarter ? baseWidth : baseHeight;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Pixel processing filters
    const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imgData.data;
    const len = data.length;

    // Filter calculations
    const bShift = brightness * 2.5; // brightness adjustment
    const threshVal = (threshold / 100) * 255;

    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      if (filterMode === 'fotocopy') {
        // Mode Fotocopy B/W Kontras Tinggi: Whitens paper background, sharpens black text
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b + bShift;
        if (luminance > threshVal) {
          // Pure clean white paper
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        } else {
          // Crisp high-density black ink
          const factor = Math.max(0, luminance / threshVal);
          const darkVal = Math.round(factor * 25);
          data[i] = darkVal;
          data[i + 1] = darkVal;
          data[i + 2] = darkVal;
        }
      } else if (filterMode === 'magic-color') {
        // Magic Color: Whitens background while boosting vibrancy of ink stamps, signatures, & colored grades
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b + bShift;

        // If pixel is near-white or neutral gray paper background (low saturation, high brightness)
        if (delta < 20 && luminance > threshVal - 25) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        } else {
          // Color contrast and saturation booster (+30%)
          const avg = (r + g + b) / 3;
          r = Math.min(255, Math.max(0, avg + (r - avg) * 1.35 + bShift));
          g = Math.min(255, Math.max(0, avg + (g - avg) * 1.35 + bShift));
          b = Math.min(255, Math.max(0, avg + (b - avg) * 1.35 + bShift));

          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
        }
      } else if (filterMode === 'grayscale') {
        // Grayscale standard smooth tonality with enhanced contrast
        let gray = 0.299 * r + 0.587 * g + 0.114 * b + bShift;
        const contrast = (threshold - 50) * 1.5;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        gray = Math.min(255, Math.max(0, factor * (gray - 128) + 128));

        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      } else {
        // Original with fine-tuned brightness / contrast
        if (bShift !== 0) {
          data[i] = Math.min(255, Math.max(0, r + bShift));
          data[i + 1] = Math.min(255, Math.max(0, g + bShift));
          data[i + 2] = Math.min(255, Math.max(0, b + bShift));
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setIsProcessing(false);
  }, [filterMode, paperSize, rotation, threshold, brightness]);

  useEffect(() => {
    if (imageSrc) {
      processCanvas();
    }
  }, [imageSrc, processCanvas]);

  // Rotate handlers
  const rotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const rotateRight = () => setRotation((prev) => (prev + 90) % 360);

  // Download Processed Image (JPG)
  const downloadImage = (format: 'jpeg' | 'png' = 'jpeg') => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mime, 0.95);

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `scan-dokumen-${filterMode}-${Date.now()}.${format === 'png' ? 'png' : 'jpg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Convert & Export Direct to PDF
  const downloadPdf = async () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const imgBytes = await fetch(dataUrl).then((res) => res.arrayBuffer());

      const pdfDoc = await PDFDocument.create();
      const embeddedImage = await pdfDoc.embedJpg(imgBytes);

      // Determine PDF dimensions matching A4 or Folio points (72 DPI points)
      let pdfWidth = 595.28; // A4 standard width in points (210mm)
      let pdfHeight = 841.89; // A4 standard height in points (297mm)

      if (paperSize === 'f4') {
        pdfWidth = 612; // 8.5 inches
        pdfHeight = 936; // 13 inches (Folio/F4)
      } else if (paperSize === 'auto') {
        const ratio = canvas.height / canvas.width;
        pdfWidth = 595.28;
        pdfHeight = pdfWidth * ratio;
      }

      const page = pdfDoc.addPage([pdfWidth, pdfHeight]);

      // Fit image onto page preserving canvas aspect ratio
      const imgAspect = canvas.width / canvas.height;
      const pageAspect = pdfWidth / pdfHeight;

      let drawW = pdfWidth;
      let drawH = pdfHeight;
      let drawX = 0;
      let drawY = 0;

      if (imgAspect > pageAspect) {
        drawW = pdfWidth;
        drawH = pdfWidth / imgAspect;
        drawY = (pdfHeight - drawH) / 2;
      } else {
        drawH = pdfHeight;
        drawW = pdfHeight * imgAspect;
        drawX = (pdfWidth - drawW) / 2;
      }

      page.drawImage(embeddedImage, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `scan-dokumen-${paperSize.toUpperCase()}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Object URL cleanup
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    } catch (err) {
      console.error(err);
      alert('Gagal mengekspor berkas ke PDF. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Smart Scan & Fotocopy Digital Dokumen - KompresKilat',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    description:
      'Alat pemindai foto dokumen dan fotocopy digital online. Ubah foto ijazah, sertifikat, dan rapor menjadi scan bersih kontras tinggi, simpan dalam format JPG, PNG, atau PDF A4/F4.',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={schemaData} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header Breadcrumb & Judul */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold mb-3">
            <Scan className="w-3.5 h-3.5" />
            100% Client-Side Privacy Scanner
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Smart Scan &amp; Fotocopy Digital Dokumen
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Scan foto ijazah, rapor, faktur, atau dokumen kantor langsung dari kamera/galeri HP.
            Otomatis bersihkan latar belakang kertas menjadi putih bersih kontras tinggi dan ekspor ke PDF A4/F4.
          </p>
        </div>

        {/* Input Zone: Upload atau Kamera */}
        {!imageSrc ? (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border-2 border-dashed border-indigo-200 shadow-sm text-center max-w-xl mx-auto">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Scan className="w-8 h-8" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
              Mulai Pindai Foto Dokumen Anda
            </h2>
            <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
              Unggah foto dari galeri atau gunakan kamera HP untuk menjepret dokumen secara langsung.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Tombol Unggah File */}
              <button
                onClick={() => fileInputRef.current?.click()}
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih Foto Dokumen</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Tombol Kamera Langsung */}
              <button
                onClick={openCamera}
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-sm transition cursor-pointer"
              >
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>Jepret Kamera HP</span>
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Privacy Guarantee Note */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Privasi Terjaga: Pemrosesan 100% lokal di browser, dokumen Anda tidak dikirim ke server.</span>
            </div>
          </div>
        ) : (
          /* Editor & Preview Workspace */
          <div className="space-y-6">
            {/* Toolbar Filter & Kontrol */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              {/* 1. Tombol Pilihan Filter Penajam */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  1. Pilih Efek / Filter Dokumen:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterMode('fotocopy')}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      filterMode === 'fotocopy'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Printer className="w-4 h-4" />
                    <span>Fotocopy (B/W)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterMode('magic-color')}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      filterMode === 'magic-color'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Magic Color</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterMode('grayscale')}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      filterMode === 'grayscale'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Grayscale</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterMode('original')}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      filterMode === 'original'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Asli (Normal)</span>
                  </button>
                </div>
              </div>

              {/* 2. Pilihan Rasio Kertas & Rotasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    2. Ukuran Kertas Cetak:
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaperSize('a4')}
                      className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        paperSize === 'a4'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      A4 (210×297)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaperSize('f4')}
                      className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        paperSize === 'f4'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      F4 / Folio
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaperSize('auto')}
                      className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        paperSize === 'auto'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Bebas / Asli
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Putar Orientasi Dokumen:
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={rotateLeft}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Kiri 90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={rotateRight}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Kanan 90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageSrc(null);
                        setSelectedFile(null);
                      }}
                      className="py-1.5 px-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold cursor-pointer"
                      title="Ganti Foto"
                    >
                      Ganti Foto
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Slider Penyesuaian Detail (Threshold & Brightness) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-indigo-500" />
                      <span>Pembersih Kertas / Kontras</span>
                    </span>
                    <span className="font-bold">{threshold}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Pencahayaan (Brightness)</span>
                    </span>
                    <span className="font-bold">{brightness > 0 ? `+${brightness}` : brightness}</span>
                  </div>
                  <input
                    type="range"
                    min={-40}
                    max={40}
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Interactive Canvas Preview Area */}
            <div className="bg-slate-200/80 p-4 sm:p-6 rounded-2xl border border-slate-300 flex items-center justify-center min-h-[360px] overflow-auto">
              <div className="relative shadow-xl rounded-lg bg-white overflow-hidden max-w-full">
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 bg-slate-900 text-white text-xs px-3.5 py-1.5 rounded-full font-medium shadow-md">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>Memproses filter dokumen...</span>
                    </div>
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  className="max-h-[65vh] w-auto h-auto object-contain block mx-auto"
                />
              </div>
            </div>

            {/* Action Export Buttons */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Dokumen Siap Diunduh
                </p>
                <p className="text-[11px] text-slate-500">
                  Format: {paperSize.toUpperCase()} • Filter: {filterMode.toUpperCase()} • {selectedFile?.name || 'Dokumen Scan'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => downloadImage('jpeg')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Unduh Gambar (JPG)</span>
                </button>

                <button
                  type="button"
                  onClick={downloadPdf}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ekspor PDF ({paperSize.toUpperCase()})</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Kamera WebRTC */}
        {isCameraOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900">Jepret Foto Dokumen</span>
                </div>
                <button
                  onClick={closeCamera}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-slate-950 relative min-h-[300px] flex items-center justify-center">
                {cameraError ? (
                  <p className="text-xs text-red-400 p-4 text-center leading-relaxed">
                    {cameraError}
                  </p>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-auto max-h-[60vh] object-cover rounded-xl"
                    />
                    {/* Viewfinder Guide Overlay */}
                    <div className="absolute inset-8 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
                      <span className="text-[11px] text-white/70 bg-black/40 px-2 py-0.5 rounded">
                        Posisikan dokumen di dalam bingkai
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 bg-white flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={closeCamera}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                {!cameraError && (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Jepret &amp; Pindai</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Slot Iklan AdSense Sesuai Kebijakan (Berjarak Aman dari Tombol Aksi) */}
        <div className="my-10">
          <AdBanner zone="result-action" label="Iklan Sponsor" />
        </div>

        {/* Panduan Edukasi & Informasi Dokumen (Kepatuhan AdSense & Nilai Tambah) */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <span>Kelebihan Menggunakan Smart Scan &amp; Fotocopy Digital</span>
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Memotret dokumen fisik seringkali terganggu oleh bayangan tangan, pencahayaan ruangan yang redup,
              atau warna kertas yang menguning. Fitur ini dirancang khusus untuk merekonstruksi foto dokumen menjadi
              lembaran bersih siap cetak tanpa memerlukan mesin scanner fisik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                <Printer className="w-4 h-4 text-indigo-600" />
                <span>Mode Fotocopy (B/W)</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Menghapus bayangan dan noda kertas menjadi putih bersih `#FFFFFF` dengan tulisan dan tanda tangan hitam pekat, sangat cocok untuk syarat berkas CPNS &amp; BUMN.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Magic Color</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Mempertajam warna asli dokumen (seperti cap stempel merah/biru, foto ijazah, dan logo rapor) sambil tetap memutihkan latar belakang kertas.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Ekspor Langsung ke PDF</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Konversi instan hasil pemindaian langsung ke dokumen PDF berukuran standar A4 atau Folio (F4) tanpa aplikasi pihak ketiga tambahan.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-start gap-3 bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
            <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block mb-0.5">
                Tips Mendapatkan Hasil Scan Terbaik:
              </span>
              <p className="text-slate-600">
                Letakkan dokumen di atas permukaan yang rata dengan pencahayaan merata. Pastikan posisi kamera tegak lurus di atas kertas untuk meminimalkan distorsi sudut.
              </p>
            </div>
          </div>
        </div>

        {/* Editorial Section: FAQ & Hub-Spoke Links */}
        <div className="mt-8">
          <ToolEditorialSection toolId="scan-dokumen" showAdBanner={false} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
