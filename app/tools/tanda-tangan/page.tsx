'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import {
  PenTool,
  Undo2,
  Download,
  Copy,
  Check,
  Sparkles,
  Trash2,
  Eye,
  Scissors
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

const INK_COLORS = [
  { name: 'Hitam Klasik (Standar)', value: '#0F172A', border: '#475569' },
  { name: 'Biru Resmi (Ballpoint)', value: '#1D4ED8', border: '#1E40AF' },
  { name: 'Biru Tua Dokumen', value: '#1E3A8A', border: '#172554' },
  { name: 'Merah Tinta Stempel', value: '#DC2626', border: '#991B1B' },
  { name: 'Hijau Kantor', value: '#059669', border: '#047857' },
];

const STROKE_WIDTH_PRESETS = [
  { label: 'Halus', value: 2 },
  { label: 'Standar', value: 3.5 },
  { label: 'Tebal', value: 5.5 },
  { label: 'Ekstra', value: 7.5 },
];

export default function SignatureGeneratorPage() {
  // Pengaturan Kuas & Tinta
  const [inkColor, setInkColor] = useState<string>('#0F172A');
  const [strokeWidth, setStrokeWidth] = useState<number>(3.5);
  const [autoTrim, setAutoTrim] = useState<boolean>(true);
  const [showBaseline, setShowBaseline] = useState<boolean>(true);

  // Data Coretan
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const currentStrokeRef = useRef<Point[]>([]);

  // Simulasi Dokumen Surat
  const [signerName, setSignerName] = useState<string>('Budi Santoso, S.Kom.');
  const [signerRole, setSignerRole] = useState<string>('Direktur Utama');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const currentDateStr = '1 November 2026';

  // Status Ekspor
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Redraw Seluruh Goresan ke Kanvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Bersihkan Kanvas (Transparan murni)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gambar Garis Pembantu (Baseline) jika diaktifkan (Hanya untuk panduan visual pengguna)
    if (showBaseline) {
      ctx.save();
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      const lineY = canvas.height * 0.75;
      ctx.beginPath();
      ctx.moveTo(40, lineY);
      ctx.lineTo(canvas.width - 40, lineY);
      ctx.stroke();

      // Label teks panduan
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.textAlign = 'right';
      ctx.fillText('Garis Tanda Tangan ✍️', canvas.width - 45, lineY - 8);
      ctx.restore();
    }

    // Gambar semua goresan yang tersimpan
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      // Gambar kurva halus (Quadratic curve)
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
        const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
      }

      // Titik terakhir
      const lastPoint = stroke.points[stroke.points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
      ctx.stroke();
      ctx.restore();
    });
  }, [strokes, showBaseline]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Fungsi Pembuatan DataURL Pratinjau Dokumen Surat
  const generatePreviewDataUrl = (currentStrokes: Stroke[]) => {
    if (currentStrokes.length === 0) {
      setPreviewDataUrl(null);
      return;
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 800;
    tempCanvas.height = 380;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    currentStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      tempCtx.save();
      tempCtx.strokeStyle = stroke.color;
      tempCtx.lineWidth = stroke.width;
      tempCtx.lineCap = 'round';
      tempCtx.lineJoin = 'round';
      tempCtx.beginPath();
      tempCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
        const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
        tempCtx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
      }
      const lastPoint = stroke.points[stroke.points.length - 1];
      tempCtx.lineTo(lastPoint.x, lastPoint.y);
      tempCtx.stroke();
      tempCtx.restore();
    });

    setPreviewDataUrl(tempCanvas.toDataURL('image/png'));
  };

  // Dapatkan Koordinat Mouse / Touch akurat terhadap Kanvas
  const getCoordinates = (e: MouseEvent | TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Event Handlers Menggambar (Mouse & Touch)
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pt = getCoordinates(e.nativeEvent);
    if (!pt) return;

    setIsDrawing(true);
    currentStrokeRef.current = [pt];

    // Mulai menggambar goresan aktif langsung di kanvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    ctx.restore();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pt = getCoordinates(e.nativeEvent);
    if (!pt) return;

    const points = currentStrokeRef.current;
    points.push(pt);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (points.length >= 3) {
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];
      const xc = (p1.x + p2.x) / 2;
      const yc = (p1.y + p2.y) / 2;

      ctx.save();
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
      ctx.stroke();
      ctx.restore();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStrokeRef.current.length > 0) {
      const newStroke: Stroke = {
        points: [...currentStrokeRef.current],
        color: inkColor,
        width: strokeWidth,
      };
      const nextStrokes = [...strokes, newStroke];
      setStrokes(nextStrokes);
      generatePreviewDataUrl(nextStrokes);
      currentStrokeRef.current = [];
    }
  };

  // Batalkan Goresan Terakhir (Undo)
  const handleUndo = () => {
    if (strokes.length === 0) return;
    const nextStrokes = strokes.slice(0, -1);
    setStrokes(nextStrokes);
    generatePreviewDataUrl(nextStrokes);
  };

  // Hapus Seluruh Kanvas (Clear)
  const handleClear = () => {
    setStrokes([]);
    currentStrokeRef.current = [];
    setPreviewDataUrl(null);
    showToast('Kanvas tanda tangan telah dibersihkan.');
  };

  // Potong Tepi Kosong (Auto-Crop Bounding Box) untuk Ekspor Rapi
  const getCroppedCanvas = (isTransparent: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) return null;

    // 1. Buat offscreen canvas murni hanya goresan (tanpa baseline guide)
    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const ctx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    // Gambar background jika pengguna ingin latar putih (bukan transparan)
    if (!isTransparent) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, offscreen.width, offscreen.height);
    }

    // Gambar semua goresan
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
        const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
      }
      const lastPoint = stroke.points[stroke.points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
      ctx.stroke();
      ctx.restore();
    });

    if (!autoTrim) {
      return offscreen;
    }

    // Hitung Bounding Box piksel yang ada warnanya
    const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
    const data = imgData.data;

    let minX = offscreen.width;
    let minY = offscreen.height;
    let maxX = 0;
    let maxY = 0;
    let hasPixels = false;

    for (let y = 0; y < offscreen.height; y++) {
      for (let x = 0; x < offscreen.width; x++) {
        const idx = (y * offscreen.width + x) * 4;
        const alpha = data[idx + 3];

        if (isTransparent) {
          if (alpha > 10) {
            hasPixels = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        } else {
          // Latar putih: cari piksel bukan putih pekat
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          if (r < 250 || g < 250 || b < 250) {
            hasPixels = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
    }

    if (!hasPixels) return offscreen;

    // Beri sedikit padding 24px agar tanda tangan tidak terlalu mepet
    const padding = 24;
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropW = Math.min(offscreen.width - cropX, maxX - minX + padding * 2);
    const cropH = Math.min(offscreen.height - cropY, maxY - minY + padding * 2);

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropW;
    croppedCanvas.height = cropH;
    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) return offscreen;

    if (!isTransparent) {
      croppedCtx.fillStyle = '#FFFFFF';
      croppedCtx.fillRect(0, 0, cropW, cropH);
    }

    croppedCtx.drawImage(offscreen, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    return croppedCanvas;
  };

  // Unduh Berkas Tanda Tangan
  const handleDownload = (format: 'png-transparent' | 'jpg-white') => {
    if (strokes.length === 0) {
      alert('Harap buat tanda tangan terlebih dahulu pada kanvas sebelum mengunduh.');
      return;
    }

    setIsDownloading(true);
    try {
      const isTransparent = format === 'png-transparent';
      const exportCanvas = getCroppedCanvas(isTransparent);
      if (!exportCanvas) return;

      const mimeType = isTransparent ? 'image/png' : 'image/jpeg';
      const dataUrl = exportCanvas.toDataURL(mimeType, 0.95);

      const link = document.createElement('a');
      const timeStamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      link.download = `tanda_tangan_${isTransparent ? 'transparan' : 'putih'}_${timeStamp}.${isTransparent ? 'png' : 'jpg'}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(
        isTransparent
          ? 'Tanda tangan transparan (.PNG) berhasil diunduh!'
          : 'Tanda tangan latar putih (.JPG) berhasil diunduh!'
      );
    } catch (err) {
      console.error('Gagal mengunduh tanda tangan:', err);
      alert('Gagal mengunduh file gambar tanda tangan.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Salin Gambar PNG Transparan ke Clipboard
  const handleCopyToClipboard = async () => {
    if (strokes.length === 0) {
      alert('Harap buat tanda tangan terlebih dahulu sebelum menyalin.');
      return;
    }

    try {
      const exportCanvas = getCroppedCanvas(true);
      if (!exportCanvas) return;

      exportCanvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setIsCopied(true);
          showToast('Tanda tangan PNG transparan berhasil disalin ke clipboard!');
          setTimeout(() => setIsCopied(false), 2500);
        } catch {
          showToast('Browser belum mendukung salin langsung, silakan gunakan tombol Unduh.');
        }
      }, 'image/png');
    } catch {
      showToast('Gagal menyalin gambar.');
    }
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pembuat Tanda Tangan Digital Transparan - KompresKilat',
    description: 'Aplikasi online gratis untuk membuat tanda tangan digital e-sign transparan format PNG siap tempel di dokumen PDF dan Microsoft Word tanpa latar belakang putih.',
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
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs px-3.5 py-1 rounded-full font-bold mb-3 shadow-xs">
            <PenTool className="w-3.5 h-3.5 text-emerald-600" />
            ✍️ E-Sign &amp; Signature Pad 100% Transparan
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">
            Pembuat Tanda Tangan Digital Transparan
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Goreskan tanda tangan digital Anda menggunakan mouse, sentuhan jari, atau stylus. Unduh instan dalam format <b>PNG transparan</b> tanpa kotak putih, siap disisipkan ke berkas PDF, Word, atau kontrak kerja.
          </p>
        </div>

        {/* Layout Utama 2 Kolom Responsif */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start mb-12">
          
          {/* Kolom Kiri: Signature Pad Interaktif (7 Kolom) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              
              {/* Header Box Pad */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-indigo-600" /> Area Tanda Tangan
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                    {strokes.length} Goresan
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={strokes.length === 0}
                    className="p-1.5 sm:px-2.5 sm:py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
                    title="Batalkan Coretan Terakhir (Undo)"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Undo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={strokes.length === 0}
                    className="p-1.5 sm:px-2.5 sm:py-1 bg-red-50 hover:bg-red-100 disabled:opacity-40 text-red-600 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
                    title="Hapus Bersih Kanvas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Hapus</span>
                  </button>
                </div>
              </div>

              {/* Kanvas Coretan Tanda Tangan (Touch Action None untuk mencegah layar HP bergeser) */}
              <div className="relative border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white rounded-2xl overflow-hidden shadow-inner cursor-crosshair transition duration-150">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={380}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  onTouchCancel={stopDrawing}
                  style={{ touchAction: 'none' }}
                  className="w-full h-auto aspect-[8/3.8] block bg-white"
                />

                {/* Indikator Panduan Mulai Tanda Tangan saat kanvas kosong */}
                {strokes.length === 0 && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 gap-1.5 select-none">
                    <PenTool className="w-8 h-8 opacity-40 animate-bounce" />
                    <span className="text-xs sm:text-sm font-semibold opacity-70">
                      Goreskan tanda tangan Anda di sini (Mouse atau Layar Sentuh)
                    </span>
                    <span className="text-[11px] opacity-50">
                      Latar belakang otomatis transparan saat diunduh
                    </span>
                  </div>
                )}
              </div>

              {/* Panel Kontrol Cepat di Bawah Kanvas */}
              <div className="space-y-4 pt-1">
                
                {/* 1. Pemilihan Warna Tinta */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-slate-700">Warna Tinta Tanda Tangan:</span>
                    <span className="text-[11px] font-mono text-slate-500">{inkColor}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {INK_COLORS.map((ink, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setInkColor(ink.value)}
                        title={ink.name}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                          inkColor === ink.value
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/50"
                          style={{ backgroundColor: ink.value }}
                        />
                        <span>{ink.name.split(' ')[0]}</span>
                      </button>
                    ))}

                    {/* Custom Color Input */}
                    <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer">
                      <input
                        type="color"
                        value={inkColor}
                        onChange={(e) => setInkColor(e.target.value)}
                        className="w-4 h-4 rounded-full border-0 p-0 cursor-pointer"
                      />
                      <span>Kustom</span>
                    </label>
                  </div>
                </div>

                {/* 2. Ketebalan Goresan Garis */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">Ketebalan Garis (Stroke Width):</span>
                    <span className="font-mono font-bold text-indigo-600">{strokeWidth} px</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {STROKE_WIDTH_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setStrokeWidth(p.value)}
                        className={`py-1.5 px-2 text-xs font-bold rounded-xl border transition cursor-pointer text-center ${
                          strokeWidth === p.value
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {p.label} ({p.value}px)
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* 3. Opsi Tambahan (Auto-Crop & Garis Pembantu) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoTrim}
                      onChange={(e) => setAutoTrim(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="flex items-center gap-1">
                      <Scissors className="w-3.5 h-3.5 text-indigo-600" /> Pangkas Tepi Kosong (Auto-Crop)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showBaseline}
                      onChange={(e) => setShowBaseline(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span>Tampilkan Garis Tanda Tangan Panduan</span>
                  </label>
                </div>
              </div>

              {/* Tombol Unduh Utama */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleDownload('png-transparent')}
                    disabled={isDownloading || strokes.length === 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow-sm transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloading ? 'Menyimpan...' : 'Unduh PNG Transparan (Resmi)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload('jpg-white')}
                    disabled={isDownloading || strokes.length === 0}
                    className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow-sm transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh JPG (Latar Putih)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyToClipboard}
                  disabled={strokes.length === 0}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Tanda Tangan Tersalin ke Clipboard!' : 'Salin PNG Transparan ke Papan Klip'}</span>
                </button>
              </div>

              {/* Jaminan Privasi */}
              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center gap-2 text-[11px] text-indigo-950">
                <span className="text-base">🛡️</span>
                <span>
                  <b>100% Aman &amp; Rahasia:</b> Coretan tanda tangan tidak pernah dikirim ke database atau server luar mana pun.
                </span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Simulasi Pratinjau Dokumen Surat Resmi (5 Kolom) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-indigo-600" /> Simulasi di Atas Dokumen
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Transparan Siap Tempel
                </span>
              </div>

              {/* Form Nama & Jabatan untuk Simulasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Penandatangan:</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jabatan / Lembaga:</label>
                  <input
                    type="text"
                    value={signerRole}
                    onChange={(e) => setSignerRole(e.target.value)}
                    placeholder="Jabatan"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Kertas Surat Formal Simulasi */}
              <div className="p-6 bg-slate-50 border border-slate-300 rounded-xl shadow-xs space-y-4 font-serif text-slate-800 text-[11px] sm:text-xs leading-relaxed select-none">
                <div className="border-b-2 border-slate-800 pb-2 text-center font-sans">
                  <p className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
                    SURAT PERJANJIAN &amp; PERNYATAAN RESMI
                  </p>
                  <p className="text-[10px] text-slate-500">Nomor Dokumen: 042/SPK-KK/XI/2026</p>
                </div>

                <p className="font-sans text-[11px] text-slate-600">
                  Dengan ini para pihak menyatakan bahwa berkas perjanjian, pakta integritas, dan dokumen administratif telah disetujui dengan ketentuan hukum yang berlaku.
                </p>

                {/* Kolom Tanda Tangan Surat */}
                <div className="pt-4 flex flex-col items-end text-right font-sans">
                  <p className="text-[11px] text-slate-600">Jakarta, {currentDateStr}</p>
                  <p className="font-bold text-xs mt-1 text-slate-900">Hormat Kami,</p>

                  {/* Area Gambar Tanda Tangan Transparan */}
                  <div className="w-48 h-20 my-1 flex items-center justify-center border border-dashed border-slate-300 rounded-lg bg-white/70 overflow-hidden relative">
                    {previewDataUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={previewDataUrl}
                        alt="Pratinjau Tanda Tangan"
                        className="max-h-18 max-w-full object-contain filter drop-shadow-xs"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">
                        [ Tanda tangan akan muncul di sini ]
                      </span>
                    )}
                  </div>

                  <p className="font-bold text-xs underline text-slate-900">{signerName || '(................................)'}</p>
                  <p className="text-[11px] text-slate-500">{signerRole || 'Penandatangan'}</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center leading-normal">
                💡 File PNG yang diunduh berlatar belakang bening transparan sehingga pas ditempel di atas Microsoft Word, Google Docs, atau aplikasi PDF Reader.
              </p>
            </div>
          </div>
        </div>

        {/* Slot Iklan Kepatuhan AdSense dengan Padding Aman */}
        <div className="my-10 pt-4">
          <AdBanner zone="in-tool" label="Iklan Sponsor" />
        </div>

        {/* Konten Edukasi & SEO: Panduan Legalitas & Penggunaan Tanda Tangan Digital */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-600 text-xs sm:text-sm leading-relaxed">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 mb-2">
              💡 Panduan Lengkap Tanda Tangan Digital Transparan untuk Dokumen Resmi
            </h2>
            <p>
              Di era digital dan kerja jarak jauh (*work from anywhere*), kebutuhan menyematkan tanda tangan pada berkas PDF, kontrak kerja, invoice usaha, atau formulir pendaftaran CPNS/BUMN semakin sering ditemui. Menggunakan foto tanda tangan basah hasil potret kamera HP seringkali menghasilkan kotak latar belakang abu-abu kotor yang menutupi teks dokumen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <span>📄</span> Mengapa Harus PNG Transparan?
              </h3>
              <p className="text-xs text-slate-500">
                Format PNG mendukung *alpha channel* (transparansi murni). Saat disisipkan ke atas dokumen surat bertabel atau bergaris, hanya tinta tanda tangan Anda yang menempel rapi tanpa kotak putih yang menabrak teks.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <span>⚖️</span> Keabsahan Hukum (UU ITE)
              </h3>
              <p className="text-xs text-slate-500">
                Berdasarkan Undang-Undang ITE di Indonesia, tanda tangan elektronik diakui sah selama para pihak menyetujui penggunaannya dan dapat diverifikasi identitas pembuatnya dalam kesepakatan perdata.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <span>🔒</span> Privasi Tanpa Rekam Jejak
              </h3>
              <p className="text-xs text-slate-500">
                Tanda tangan adalah data biometrik yang sangat rahasia. Generator KompresKilat memastikan coretan Anda 100% diproses di memori RAM browser Anda dan langsung hilang saat tab ditutup.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800">Cara Memasang Tanda Tangan di Microsoft Word &amp; PDF:</h4>
            <ol className="space-y-1.5 list-decimal pl-5 text-slate-500">
              <li>Buat tanda tangan Anda pada Signature Pad di atas, lalu klik <b>Unduh PNG Transparan</b>.</li>
              <li>Buka dokumen Microsoft Word Anda, pilih menu <b>Insert &gt; Pictures &gt; This Device</b>.</li>
              <li>Pilih file PNG tanda tangan yang baru diunduh.</li>
              <li>Klik kanan pada gambar tanda tangan, pilih <b>Wrap Text &gt; In Front of Text</b> agar Anda bebas menggeser dan mengatur ukurannya persis di atas garis tanda tangan Anda.</li>
            </ol>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
