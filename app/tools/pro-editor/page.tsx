'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import {
  Sliders,
  Sparkles,
  ShieldCheck,
  Download,
  Upload,
  RotateCw,
  Undo2,
  Eraser,
  Stamp,
  Layers,
  Sun,
  Eye,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Palette
} from 'lucide-react';

type PresetFilter = 'normal' | 'grayscale' | 'vivid' | 'sepia' | 'bw-contrast';

interface AdjustmentState {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  exposure: number; // -50 to 50
}

interface WatermarkState {
  enabled: boolean;
  text: string;
  opacity: number; // 0.1 to 0.8
  color: string;
  fontSize: number; // 14 to 36
}

export default function ProEditorPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'filter' | 'adjust' | 'cleanup' | 'watermark'>('filter');

  // Edit Settings
  const [preset, setPreset] = useState<PresetFilter>('normal');
  const [adjustments, setAdjustments] = useState<AdjustmentState>({
    brightness: 0,
    contrast: 0,
    exposure: 0,
  });

  // Brush / Cleanup State
  const [isBrushMode, setIsBrushMode] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(25);
  const [brushColor, setBrushColor] = useState<string>('#FFFFFF'); // default paper white

  // Watermark State
  const [watermark, setWatermark] = useState<WatermarkState>({
    enabled: false,
    text: 'UNTUK KEPERLUAN VERIFIKASI',
    opacity: 0.25,
    color: '#64748B',
    fontSize: 20,
  });

  // History for Undo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  // Handle Image Upload
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
      setImageLoaded(true);
      setHistory([]);
      setPreset('normal');
      setAdjustments({ brightness: 0, contrast: 0, exposure: 0 });
      setIsBrushMode(false);
    };
    img.src = objectUrl;
  };

  // Save current canvas state to history before destructive edits
  const saveHistory = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHistory((prev) => [...prev.slice(-10), data]);
  };

  // Undo last action
  const handleUndo = () => {
    if (history.length === 0 || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const prev = history[history.length - 1];
    ctx.putImageData(prev, 0, 0);
    setHistory((prevList) => prevList.slice(0, prevList.length - 1));
  };

  // Apply Pixel Filters & Adjustments
  const renderCanvas = useCallback(() => {
    if (!originalImageRef.current || !canvasRef.current) return;
    setIsProcessing(true);

    const img = originalImageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Get pixel buffer
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const len = data.length;

    // Adjustments math
    const bShift = adjustments.brightness * 1.5;
    const expFactor = Math.pow(2, adjustments.exposure / 25);
    const cFactor = (259 * (adjustments.contrast * 2.55 + 255)) / (255 * (259 - adjustments.contrast * 2.55));

    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // 1. Exposure & Brightness
      if (adjustments.exposure !== 0) {
        r *= expFactor;
        g *= expFactor;
        b *= expFactor;
      }
      if (bShift !== 0) {
        r += bShift;
        g += bShift;
        b += bShift;
      }

      // 2. Contrast
      if (adjustments.contrast !== 0) {
        r = cFactor * (r - 128) + 128;
        g = cFactor * (g - 128) + 128;
        b = cFactor * (b - 128) + 128;
      }

      // 3. Preset Filter
      if (preset === 'grayscale') {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray;
        g = gray;
        b = gray;
      } else if (preset === 'vivid') {
        // Boost color vibrancy & saturation
        const avg = (r + g + b) / 3;
        r = avg + (r - avg) * 1.4;
        g = avg + (g - avg) * 1.4;
        b = avg + (b - avg) * 1.4;
      } else if (preset === 'sepia') {
        const tr = 0.393 * r + 0.769 * g + 0.189 * b;
        const tg = 0.349 * r + 0.686 * g + 0.168 * b;
        const tb = 0.272 * r + 0.534 * g + 0.131 * b;
        r = tr;
        g = tg;
        b = tb;
      } else if (preset === 'bw-contrast') {
        // High contrast photocopy binarization
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        if (luminance > 145) {
          r = 255;
          g = 255;
          b = 255;
        } else {
          r = Math.max(0, luminance * 0.15);
          g = Math.max(0, luminance * 0.15);
          b = Math.max(0, luminance * 0.15);
        }
      }

      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    ctx.putImageData(imgData, 0, 0);

    // 4. Draw Repeating Diagonal Security Watermark (if enabled)
    if (watermark.enabled && watermark.text.trim().length > 0) {
      ctx.save();
      ctx.globalAlpha = watermark.opacity;
      ctx.fillStyle = watermark.color;
      ctx.font = `bold ${watermark.fontSize}px sans-serif`;
      ctx.textAlign = 'center';

      const stepX = 220;
      const stepY = 140;
      const angle = (-30 * Math.PI) / 180;

      for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
        for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.fillText(watermark.text, 0, 0);
          ctx.restore();
        }
      }
      ctx.restore();
    }

    setIsProcessing(false);
  }, [preset, adjustments, watermark]);

  useEffect(() => {
    if (imageLoaded) {
      renderCanvas();
    }
  }, [imageLoaded, renderCanvas]);

  // Rotate Image 90 Degrees
  const handleRotate = () => {
    if (!canvasRef.current) return;
    saveHistory();

    const canvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.height;
    tempCanvas.height = canvas.width;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate((90 * Math.PI) / 180);
    tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

    const newImg = new Image();
    newImg.onload = () => {
      originalImageRef.current = newImg;
      renderCanvas();
    };
    newImg.src = tempCanvas.toDataURL();
  };

  // Coordinate mapper from client click to canvas pixel resolution
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Brush / Cleanup Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isBrushMode || !canvasRef.current) return;
    saveHistory();
    isDrawingRef.current = true;
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !isBrushMode || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    ctx.save();
    ctx.fillStyle = brushColor;
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  // Export & Download Processed Image
  const handleDownload = (format: 'jpeg' | 'png') => {
    if (!canvasRef.current) return;
    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvasRef.current.toDataURL(mime, 0.95);

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `pro-edit-dokumen-${Date.now()}.${format === 'png' ? 'png' : 'jpg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Pro Photo & Document Editor Online - KompresKilat',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    description:
      'Editor foto dokumen dan KTP online 100% aman di browser. Filter fotocopy B/W kontras tinggi, kuas pembersih noda, slider pencahayaan, dan watermark salinan keamanan.',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={schemaData} />
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header Breadcrumb & Judul */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            100% Client-Side Canvas Studio
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Pro Photo &amp; Document Editor
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Perbaiki pencahayaan pas foto, bersihkan noda debu dokumen dengan kuas pembersih,
            terapkan filter fotocopy kontras tinggi, dan bubuhkan watermark salinan keamanan secara privat.
          </p>
        </div>

        {/* Input Zone jika belum ada gambar */}
        {!imageLoaded ? (
          <div className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-dashed border-indigo-200 shadow-sm text-center max-w-xl mx-auto">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
              Buka Pas Foto atau Dokumen Penting
            </h2>
            <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
              Mendukung foto KTP, pas foto CPNS, ijazah, atau nota berkas. Semua data diproses langsung di memori browser Anda.
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Pilih Gambar Dokumen</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Privasi Terjaga: Nol unggahan ke server luar. Aman untuk dokumen rahasia.</span>
            </div>
          </div>
        ) : (
          /* Editor 2-Kolom Workspace (Sidebar Kiri + Canvas Kanan) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Sidebar Kontrol (Kolom Kiri 5 dari 12) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {/* Tabs Navigasi Fitur */}
              <div className="flex border-b border-slate-200 bg-slate-50/70 p-1 gap-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('filter')}
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                    activeTab === 'filter'
                      ? 'bg-white text-indigo-600 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Filter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('adjust')}
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                    activeTab === 'adjust'
                      ? 'bg-white text-indigo-600 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Cahaya</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('cleanup')}
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                    activeTab === 'cleanup'
                      ? 'bg-white text-indigo-600 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Kuas Noda</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('watermark')}
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                    activeTab === 'watermark'
                      ? 'bg-white text-indigo-600 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Stamp className="w-3.5 h-3.5" />
                  <span>Watermark</span>
                </button>
              </div>

              {/* Konten Tab Aktif */}
              <div className="p-5 space-y-4">
                {/* TAB 1: Filter Cepat */}
                {activeTab === 'filter' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 block">
                      Pilih Filter Instan:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPreset('normal')}
                        className={`p-3 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                          preset === 'normal'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-sm mb-0.5">🖼️ Asli / Normal</span>
                        <span className="text-[10px] text-slate-400 font-normal">Warna natural foto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreset('bw-contrast')}
                        className={`p-3 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                          preset === 'bw-contrast'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-sm mb-0.5">🖨️ Fotocopy B/W</span>
                        <span className="text-[10px] text-slate-400 font-normal">Kertas putih, teks hitam</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreset('vivid')}
                        className={`p-3 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                          preset === 'vivid'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-sm mb-0.5">✨ Panorama / Vivid</span>
                        <span className="text-[10px] text-slate-400 font-normal">Saturasi &amp; kontras pekat</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreset('grayscale')}
                        className={`p-3 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                          preset === 'grayscale'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-sm mb-0.5">📄 Grayscale</span>
                        <span className="text-[10px] text-slate-400 font-normal">Monokrom arsip berkas</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreset('sepia')}
                        className={`p-3 rounded-xl border text-xs font-semibold text-left transition cursor-pointer col-span-2 ${
                          preset === 'sepia'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-sm mb-0.5">📜 Sepia Klasik</span>
                        <span className="text-[10px] text-slate-400 font-normal">Nuansa warna vintage hangat</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: Pencahayaan & Exposure */}
                {activeTab === 'adjust' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span className="flex items-center gap-1.5">
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          <span>Kecerahan (Brightness)</span>
                        </span>
                        <span className="font-bold">{adjustments.brightness}</span>
                      </div>
                      <input
                        type="range"
                        min={-60}
                        max={60}
                        value={adjustments.brightness}
                        onChange={(e) =>
                          setAdjustments((prev) => ({ ...prev, brightness: Number(e.target.value) }))
                        }
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Kontras (Contrast)</span>
                        </span>
                        <span className="font-bold">{adjustments.contrast}</span>
                      </div>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        value={adjustments.contrast}
                        onChange={(e) =>
                          setAdjustments((prev) => ({ ...prev, contrast: Number(e.target.value) }))
                        }
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Eksposur (Exposure)</span>
                        </span>
                        <span className="font-bold">{adjustments.exposure}</span>
                      </div>
                      <input
                        type="range"
                        min={-30}
                        max={30}
                        value={adjustments.exposure}
                        onChange={(e) =>
                          setAdjustments((prev) => ({ ...prev, exposure: Number(e.target.value) }))
                        }
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setAdjustments({ brightness: 0, contrast: 0, exposure: 0 })}
                      className="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer block pt-1"
                    >
                      ↺ Reset Pengaturan Cahaya
                    </button>
                  </div>
                )}

                {/* TAB 3: Kuas Pembersih Noda (Cleanup Brush) */}
                {activeTab === 'cleanup' && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-800 leading-relaxed">
                      💡 <strong>Cara Pakai:</strong> Aktifkan kuas di bawah, lalu usap mouse/sentuh jari pada noda debu, lipatan kertas, atau bayangan yang ingin dibersihkan.
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Mode Kuas Aktif:</span>
                      <button
                        type="button"
                        onClick={() => setIsBrushMode(!isBrushMode)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                          isBrushMode
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {isBrushMode ? 'Kuas ON' : 'Kuas OFF'}
                      </button>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span>Ukuran Kuas (Radius)</span>
                        <span className="font-bold">{brushSize}px</span>
                      </div>
                      <input
                        type="range"
                        min={8}
                        max={60}
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1.5">
                        Warna Pembersih:
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setBrushColor('#FFFFFF')}
                          className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                            brushColor === '#FFFFFF'
                              ? 'bg-slate-900 text-white'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full bg-white border border-slate-300 inline-block" />
                          <span>Putih Kertas</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBrushColor('#F1F5F9')}
                          className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                            brushColor === '#F1F5F9'
                              ? 'bg-slate-900 text-white'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300 inline-block" />
                          <span>Abu Lembut</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: Watermark Keamanan Diagonal */}
                {activeTab === 'watermark' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Watermark Pengaman:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setWatermark((prev) => ({ ...prev, enabled: !prev.enabled }))
                        }
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                          watermark.enabled
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {watermark.enabled ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </div>

                    {watermark.enabled && (
                      <>
                        <div>
                          <label className="text-xs font-medium text-slate-600 block mb-1">
                            Teks Cap Salinan:
                          </label>
                          <input
                            type="text"
                            value={watermark.text}
                            onChange={(e) =>
                              setWatermark((prev) => ({ ...prev, text: e.target.value }))
                            }
                            placeholder="Contoh: UNTUK VERIFIKASI REKENING"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold uppercase"
                          />
                        </div>

                        {/* Presets Cepat */}
                        <div className="flex flex-wrap gap-1.5">
                          {['UNTUK VERIFIKASI', 'KHUSUS LAMARAN KERJA', 'SALINAN KTP', 'DRAFT ONLY'].map(
                            (presetText) => (
                              <button
                                key={presetText}
                                type="button"
                                onClick={() =>
                                  setWatermark((prev) => ({ ...prev, text: presetText }))
                                }
                                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-medium cursor-pointer"
                              >
                                {presetText}
                              </button>
                            )
                          )}
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                            <span>Transparansi (Opacity)</span>
                            <span className="font-bold">{Math.round(watermark.opacity * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min={0.1}
                            max={0.7}
                            step={0.05}
                            value={watermark.opacity}
                            onChange={(e) =>
                              setWatermark((prev) => ({ ...prev, opacity: Number(e.target.value) }))
                            }
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-600 block mb-1.5">
                            Warna Watermark:
                          </label>
                          <div className="flex gap-2">
                            {[
                              { label: 'Abu Slate', val: '#64748B' },
                              { label: 'Merah Aman', val: '#EF4444' },
                              { label: 'Biru Dokumen', val: '#3B82F6' },
                              { label: 'Hitam', val: '#0F172A' },
                            ].map((c) => (
                              <button
                                key={c.val}
                                type="button"
                                onClick={() => setWatermark((prev) => ({ ...prev, color: c.val }))}
                                className={`flex-1 py-1 rounded-md text-[10px] font-semibold border ${
                                  watermark.color === c.val
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-200 text-slate-600'
                                }`}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Toolbar Aksi Bawah Sidebar (Undo & Putar) */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition ${
                    history.length > 0
                      ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  title="Batalkan perubahan terakhir"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>

                <button
                  type="button"
                  onClick={handleRotate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Putar 90°</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImageLoaded(false);
                    setSelectedFile(null);
                  }}
                  className="text-red-600 hover:text-red-700 font-semibold hover:underline cursor-pointer"
                >
                  Ganti Foto
                </button>
              </div>
            </div>

            {/* Area Kanvas Interaktif (Kolom Kanan 7 dari 12) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-200/80 p-4 sm:p-6 rounded-3xl border border-slate-300 flex items-center justify-center min-h-[460px] overflow-auto shadow-inner">
                <div className="relative shadow-xl rounded-xl bg-white overflow-hidden max-w-full">
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
                      <div className="flex items-center gap-2 bg-slate-900 text-white text-xs px-3.5 py-1.5 rounded-full font-medium shadow-md">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        <span>Menerapkan penyesuaian...</span>
                      </div>
                    </div>
                  )}

                  {isBrushMode && (
                    <div className="absolute top-3 left-3 bg-indigo-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 pointer-events-none shadow-sm flex items-center gap-1">
                      <Eraser className="w-3 h-3" />
                      <span>Mode Kuas Pembersih Aktif (Usap pada gambar)</span>
                    </div>
                  )}

                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className={`max-h-[68vh] w-auto h-auto object-contain block mx-auto ${
                      isBrushMode ? 'cursor-crosshair' : 'cursor-default'
                    }`}
                  />
                </div>
              </div>

              {/* Bar Ekspor & Unduh Hasil */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-left w-full sm:w-auto">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Hasil Edit Siap Diunduh</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Filter: {preset.toUpperCase()} • {selectedFile?.name || 'Dokumen'} {watermark.enabled ? '• Berwatermark' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleDownload('jpeg')}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                    <span>Unduh JPG</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload('png')}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh PNG HD</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slot Iklan AdSense Sesuai Kebijakan */}
        <div className="my-10">
          <AdBanner zone="result-action" label="Iklan Sponsor" />
        </div>

        {/* Panduan Edukasi & Informasi Fitur (Nilai Tambah & SEO) */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <span>Panduan Mengedit Pas Foto &amp; Dokumen Penting Secara Profesional</span>
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Memperbaiki kualitas pas foto atau dokumen scan kini tidak membutuhkan software rumit seperti Photoshop.
              Dengan editor berbasis HTML5 Canvas ini, seluruh manipulasi warna, pembersihan noda, dan watermark keamanan
              dapat Anda selesaikan secara instan dengan jaminan privasi 100%.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                <Eraser className="w-4 h-4 text-indigo-600" />
                <span>Pembersih Noda Kertas</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Hapus debu kertas, bayangan jari, atau coretan tinta yang tidak sengaja menutupi dokumen penting Anda hanya dengan sekali usap kuas.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                <Stamp className="w-4 h-4 text-emerald-600" />
                <span>Watermark Diagonal Anti-Pinjol</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Lindungi foto KTP dan sertifikat Anda dari pencurian identitas dengan membubuhkan cap salinan berulang diagonal secara permanen.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>100% Privasi di Browser</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Pemrosesan piksel kanvas dikerjakan oleh prosesor perangkat Anda sendiri. Foto tidak pernah diunggah atau disimpan di cloud server manapun.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-start gap-3 bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
            <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block mb-0.5">
                Tips Mengoptimasi Pas Foto Dokumen Resmi:
              </span>
              <p className="text-slate-600">
                Gunakan filter <strong>Panorama / Vivid</strong> untuk mengembalikan ketajaman warna pas foto lama yang pudar, atau gunakan <strong>Fotocopy B/W</strong> untuk mengubah foto dokumen surat menjadi berkas hitam putih standar instansi.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
