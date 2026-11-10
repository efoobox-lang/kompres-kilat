'use client';

import { useState, useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolEditorialSection from '@/components/ToolEditorialSection';
import JsonLd from '@/components/JsonLd';
import {
  ShieldAlert,
  EyeOff,
  Square,
  Paintbrush,
  Undo2,
  RotateCcw,
  Download,
  Upload,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';

type ToolMode = 'brush-black' | 'rect-black' | 'brush-blur' | 'rect-blur';

export default function CensorKtpPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [mode, setMode] = useState<ToolMode>('rect-black');
  const [brushSize, setBrushSize] = useState<number>(24);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Canvas Refs
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Drawing state
  const isDrawingRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  // Inisialisasi Canvas saat file dipilih
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (!file.type.startsWith('image/')) {
      alert('Harap unggah berkas foto gambar (JPG, PNG, atau WebP).');
      return;
    }

    setSelectedFile(file);
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      originalImageRef.current = img;
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });

      // Inisialisasi Main Canvas
      const canvas = imageCanvasRef.current;
      const overlay = overlayCanvasRef.current;
      if (canvas && overlay) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        overlay.width = img.naturalWidth;
        overlay.height = img.naturalHeight;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const initialSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setHistory([initialSnapshot]);
          setHasUnsavedChanges(false);
        }
      }
    };

    img.src = objectUrl;
  };

  // Simpan Snapshot ke History
  const pushHistorySnapshot = useCallback(() => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), snapshot]); // Simpan hingga 15 riwayat
    setHasUnsavedChanges(true);
  }, []);

  // Undo Aksi Terakhir
  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Hapus snapshot terakhir
    const previousSnapshot = newHistory[newHistory.length - 1];

    if (previousSnapshot) {
      ctx.putImageData(previousSnapshot, 0, 0);
      setHistory(newHistory);
    }
  };

  // Reset ke Gambar Asli
  const handleReset = () => {
    if (!originalImageRef.current || history.length === 0) return;
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(originalImageRef.current, 0, 0);
    const initial = history[0];
    if (initial) {
      setHistory([initial]);
      setHasUnsavedChanges(false);
    }
  };

  // Algoritma Sensor Pixelate / Mozaik Client-Side
  const applyPixelateArea = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    blockSize: number = 14
  ) => {
    const canvas = ctx.canvas;
    const startX = Math.max(0, Math.floor(x));
    const startY = Math.max(0, Math.floor(y));
    const targetW = Math.min(canvas.width - startX, Math.ceil(w));
    const targetH = Math.min(canvas.height - startY, Math.ceil(h));

    if (targetW <= 0 || targetH <= 0) return;

    const imgData = ctx.getImageData(startX, startY, targetW, targetH);
    const data = imgData.data;

    for (let py = 0; py < targetH; py += blockSize) {
      for (let px = 0; px < targetW; px += blockSize) {
        let r = 0, g = 0, b = 0, count = 0;

        // Hitung rata-rata warna per blok
        for (let dy = 0; dy < blockSize && py + dy < targetH; dy++) {
          for (let dx = 0; dx < blockSize && px + dx < targetW; dx++) {
            const idx = ((py + dy) * targetW + (px + dx)) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }

        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);

          // Tulis ulang seluruh piksel di dalam blok
          for (let dy = 0; dy < blockSize && py + dy < targetH; dy++) {
            for (let dx = 0; dx < blockSize && px + dx < targetW; dx++) {
              const idx = ((py + dy) * targetW + (px + dx)) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, startX, startY);
  };

  // Helper konversi koordinat Pointer/Touch ke koordinat asli Canvas
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return { x: 0, y: 0 };

    const rect = overlay.getBoundingClientRect();
    const scaleX = overlay.width / rect.width;
    const scaleY = overlay.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Handler Event Gambar (Mousedown / Touchstart)
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const coords = getCanvasCoords(e);
    startPosRef.current = coords;

    if (mode === 'brush-black') {
      const canvas = imageCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (mode === 'brush-blur') {
      const canvas = imageCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      applyPixelateArea(
        ctx,
        coords.x - brushSize / 2,
        coords.y - brushSize / 2,
        brushSize,
        brushSize,
        Math.max(6, Math.floor(brushSize / 3))
      );
    }
  };

  // Handler Pointer Move (Mengusap atau Tarik Kotak)
  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const coords = getCanvasCoords(e);

    const canvas = imageCanvasRef.current;
    const overlay = overlayCanvasRef.current;
    if (!canvas || !overlay) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const oCtx = overlay.getContext('2d');
    if (!ctx || !oCtx) return;

    if (mode === 'brush-black') {
      // Usap Kuas Hitam halus tersambung
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(startPosRef.current.x, startPosRef.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      startPosRef.current = coords;
    } else if (mode === 'brush-blur') {
      // Interpolasi langkah sapuan kuas mozaik blur agar tidak bolong-bolong
      const dist = Math.hypot(coords.x - startPosRef.current.x, coords.y - startPosRef.current.y);
      const step = Math.max(4, brushSize / 4);
      const steps = Math.ceil(dist / step);

      for (let i = 0; i <= steps; i++) {
        const t = steps === 0 ? 0 : i / steps;
        const curX = startPosRef.current.x + (coords.x - startPosRef.current.x) * t;
        const curY = startPosRef.current.y + (coords.y - startPosRef.current.y) * t;
        applyPixelateArea(
          ctx,
          curX - brushSize / 2,
          curY - brushSize / 2,
          brushSize,
          brushSize,
          Math.max(6, Math.floor(brushSize / 3))
        );
      }
      startPosRef.current = coords;
    } else if (mode === 'rect-black' || mode === 'rect-blur') {
      // Preview Kotak Seleksi di Overlay Canvas
      oCtx.clearRect(0, 0, overlay.width, overlay.height);

      const x = Math.min(startPosRef.current.x, coords.x);
      const y = Math.min(startPosRef.current.y, coords.y);
      const w = Math.abs(coords.x - startPosRef.current.x);
      const h = Math.abs(coords.y - startPosRef.current.y);

      if (mode === 'rect-black') {
        oCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        oCtx.fillRect(x, y, w, h);
        oCtx.strokeStyle = '#3b82f6';
        oCtx.lineWidth = 2;
        oCtx.strokeRect(x, y, w, h);
      } else {
        oCtx.fillStyle = 'rgba(99, 102, 241, 0.35)';
        oCtx.fillRect(x, y, w, h);
        oCtx.strokeStyle = '#6366f1';
        oCtx.lineWidth = 2;
        oCtx.setLineDash([4, 4]);
        oCtx.strokeRect(x, y, w, h);
        oCtx.setLineDash([]);
      }
    }
  };

  // Handler Pointer Up (Selesai Mengusap / Melepas Kotak)
  const handlePointerUp = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const canvas = imageCanvasRef.current;
    const overlay = overlayCanvasRef.current;
    if (!canvas || !overlay) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const oCtx = overlay.getContext('2d');
    if (!ctx || !oCtx) return;

    if (mode === 'rect-black' || mode === 'rect-blur') {
      oCtx.clearRect(0, 0, overlay.width, overlay.height);
      const coords = getCanvasCoords(e);
      const x = Math.min(startPosRef.current.x, coords.x);
      const y = Math.min(startPosRef.current.y, coords.y);
      const w = Math.abs(coords.x - startPosRef.current.x);
      const h = Math.abs(coords.y - startPosRef.current.y);

      // Hanya terapkan jika kotak memiliki ukuran minimal
      if (w > 3 && h > 3) {
        if (mode === 'rect-black') {
          ctx.fillStyle = '#000000';
          ctx.fillRect(x, y, w, h);
        } else if (mode === 'rect-blur') {
          applyPixelateArea(ctx, x, y, w, h, 14);
        }
      }
    }

    // Catat riwayat perubahan untuk fitur Undo
    pushHistorySnapshot();
  };

  // Unduh Gambar yang Telah Disensor
  const handleDownload = () => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const a = document.createElement('a');
      a.href = dataUrl;
      const originalName = selectedFile?.name.replace(/\.[^/.]+$/, '') || 'Dokumen';
      a.download = `${originalName}_Disensor_KompresKilat.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Gagal mengunduh gambar:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Sensor & Blur KTP / Dokumen Penting Online - KompresKilat',
    description: 'Tutup NIK KTP, tanda tangan, dan alamat rumah dengan sensor kotak hitam atau blur mozaik 100% aman di peramban Anda.',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'All',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <JsonLd data={schema} />
      <Navbar />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header Hero */}
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs px-3.5 py-1 rounded-full font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            100% Pemrosesan Lokal di Browser (Privasi Maksimal)
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            Sensor &amp; Blur Bagian KTP / Dokumen
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Tutup NIK KTP, tanda tangan digital, atau alamat rumah dengan kotak hitam solid maupun efek mozaik blur sebelum dikirim untuk verifikasi.
          </p>
        </div>

        {/* Kotak Panduan Ringkas Privasi */}
        <div className="bg-indigo-50/70 border border-indigo-200 p-3.5 sm:p-4 rounded-2xl mb-6 flex items-start gap-3 text-xs text-indigo-900">
          <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-0.5">Keamanan Data Anda Terjamin:</p>
            <p className="text-indigo-800/90 leading-relaxed">
              Seluruh piksel gambar disensor langsung di memori perangkat Anda menggunakan HTML5 Canvas. Berkas foto KTP sama sekali <b>tidak pernah dikirim ke server</b> atau disimpan di internet.
            </p>
          </div>
        </div>

        {/* Kondisi 1: Belum Ada File yang Dipilih */}
        {!selectedFile ? (
          <div className="bg-white p-8 sm:p-14 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 transition text-center shadow-xs">
            <input
              type="file"
              id="censorFileInput"
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="censorFileInput" className="cursor-pointer block">
              <div className="w-16 h-16 mx-auto mb-3 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <EyeOff className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                Pilih Foto KTP, KK, SIM, atau Dokumen Penting
              </h3>
              <p className="text-xs text-slate-500 mb-5 max-w-md mx-auto">
                Mendukung foto JPG, PNG, dan WebP. Anda dapat langsung mengusap bagian teks rahasia yang ingin ditutup.
              </p>
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition">
                <Upload className="w-4 h-4" />
                Pilih Berkas dari Galeri / Kamera
              </span>
            </label>

            {/* Rekomendasi Bagian yang Wajib Disensor */}
            <div className="mt-8 pt-6 border-t border-slate-100 max-w-lg mx-auto text-left text-xs">
              <p className="font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-slate-500" />
                Bagian yang umum disensor sebelum upload verifikasi:
              </p>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <span className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  🔒 NIK &amp; Nomor Kartu Keluarga
                </span>
                <span className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  ✍️ Tanda Tangan Asli
                </span>
                <span className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  🏠 Alamat Lengkap &amp; RT/RW
                </span>
                <span className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  💳 Nomor Rekening Bank
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Kondisi 2: Kanvas Interaktif Sensor */
          <div className="space-y-4">
            {/* Toolbar Kontrol Alat Sensor */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Pilihan Mode Sensor */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMode('rect-black')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    mode === 'rect-black' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 hover:text-indigo-600'
                  }`}
                  title="Tarik kotak hitam penutup"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Kotak Hitam</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('brush-black')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    mode === 'brush-black' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 hover:text-indigo-600'
                  }`}
                  title="Usap kuas hitam bebas"
                >
                  <Paintbrush className="w-3.5 h-3.5" />
                  <span>Kuas Hitam</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('rect-blur')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    mode === 'rect-blur' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 hover:text-indigo-600'
                  }`}
                  title="Tarik kotak mozaik blur"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Kotak Blur</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('brush-blur')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    mode === 'brush-blur' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 hover:text-indigo-600'
                  }`}
                  title="Usap kuas mozaik blur"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kuas Blur</span>
                </button>
              </div>

              {/* Ukuran Kuas (Jika memilih kuas) */}
              {(mode === 'brush-black' || mode === 'brush-blur') && (
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-600">Ukuran:</span>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="2"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-20 accent-indigo-600 cursor-pointer"
                  />
                  <span className="font-bold text-indigo-600">{brushSize}px</span>
                </div>
              )}

              {/* Aksi Undo, Reset & Ganti Foto */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={history.length <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-semibold transition cursor-pointer"
                  title="Batalkan Aksi Terakhir"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!hasUnsavedChanges}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-semibold transition cursor-pointer"
                  title="Kembalikan ke Asli"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <label
                  htmlFor="changeFileInput"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition cursor-pointer"
                  title="Ganti Foto Baru"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ganti</span>
                  <input
                    type="file"
                    id="changeFileInput"
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Container Kanvas Interaktif */}
            <div
              ref={containerRef}
              className="bg-slate-900/5 border border-slate-200 rounded-2xl p-2 sm:p-4 flex items-center justify-center overflow-auto shadow-inner relative select-none"
              style={{ minHeight: '380px' }}
            >
              <div className="relative inline-block max-w-full shadow-md rounded-lg overflow-hidden bg-white">
                {/* Main Canvas (Gambar & Hasil Edit) */}
                <canvas
                  ref={imageCanvasRef}
                  className="block max-w-full h-auto"
                />

                {/* Overlay Canvas (Interaksi Tarik Kotak & Touch Brush) */}
                <canvas
                  ref={overlayCanvasRef}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                  className="absolute inset-0 block max-w-full h-auto cursor-crosshair touch-none"
                />
              </div>
            </div>

            {/* Baris Tombol Unduh & Status */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-900">{selectedFile.name}</span>
                <span className="block text-slate-500 text-[11px] mt-0.5">
                  Dimensi: {imageSize.width} × {imageSize.height} px • Siap diunduh dengan kualitas 95% JPEG.
                </span>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                disabled={isProcessing}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Hasil KTP Tersensor (.JPG)</span>
              </button>
            </div>
          </div>
        )}

        {/* Editorial Section: Panduan, FAQ, AdSense Safe Zone & Hub-Spoke Links */}
        <div className="mt-8">
          <ToolEditorialSection toolId="censor-ktp" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
