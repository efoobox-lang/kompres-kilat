'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import {
  Upload,
  Download,
  RefreshCw,
  Type,
  Palette,
  Sparkles,
  Copy,
  Check,
  Smile,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

interface TemplateOption {
  id: string;
  name: string;
  category: string;
  topText: string;
  bottomText: string;
  bgType: 'gradient-drake' | 'two-buttons' | 'cheems-doge' | 'cat-shocked';
}

const TEMPLATE_PRESETS: TemplateOption[] = [
  {
    id: 'drake',
    name: 'Perbandingan (Drake Style)',
    category: 'Kontras / Pilihan',
    topText: 'NGODING MANUAL TANPA TOOLS',
    bottomText: 'KOMPRES KILAT DALAM 1 DETIK',
    bgType: 'gradient-drake',
  },
  {
    id: 'dilemma',
    name: 'Dua Tombol Dilema',
    category: 'Dilema Lucu',
    topText: 'TIDUR TEPAT WAKTU JAM 10 MALAM',
    bottomText: 'SCROLLING MEME SAMPAI SUBUH',
    bgType: 'two-buttons',
  },
  {
    id: 'doge',
    name: 'Doge Santai vs Panik',
    category: 'Ekspektasi vs Realita',
    topText: 'KODING BERHASIL DI LOCALHOST',
    bottomText: 'CRASH DI SERVER PRODUCTION',
    bgType: 'cheems-doge',
  },
  {
    id: 'cat',
    name: 'Kucing Terkejut',
    category: 'Kaget / Shock',
    topText: 'KETIKA LIHAT TANGGAL DEADLINE',
    bottomText: 'TERNYATA HARI INI JAM 12 SIANG',
    bgType: 'cat-shocked',
  },
];

const COLOR_SWATCHES = [
  { name: 'Putih (Standar)', value: '#FFFFFF', border: '#CBD5E1' },
  { name: 'Kuning (Meme Populer)', value: '#FACC15', border: '#CA8A04' },
  { name: 'Hitam Pekat', value: '#000000', border: '#475569' },
  { name: 'Merah Terang', value: '#EF4444', border: '#B91C1C' },
  { name: 'Cyan Neon', value: '#06B6D4', border: '#0891B2' },
  { name: 'Hijau Lime', value: '#84CC16', border: '#65A30D' },
];

const STROKE_COLORS = [
  { name: 'Hitam (Klasik)', value: '#000000' },
  { name: 'Putih Bersih', value: '#FFFFFF' },
  { name: 'Abu Gelap', value: '#1E293B' },
  { name: 'Tanpa Outline', value: 'transparent' },
];

const FONT_FAMILIES = [
  { name: 'Impact (Klasik Meme)', value: 'Impact, sans-serif' },
  { name: 'Arial Black (Tebal Modern)', value: '"Arial Black", sans-serif' },
  { name: 'Montserrat (Elegan Minimalis)', value: 'Montserrat, sans-serif' },
  { name: 'Bebas Neue (Poster Bold)', value: '"Bebas Neue", sans-serif' },
  { name: 'Comic Sans MS (Kasual Santai)', value: '"Comic Sans MS", cursive, sans-serif' },
];

export default function MemeGeneratorPage() {
  // State Input & Gambar
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string>('drake');

  // State Teks Meme
  const [topText, setTopText] = useState('KETIKA NGODING DI LOCAL AMAN');
  const [bottomText, setBottomText] = useState('TAPI ERROR KETIKA DI PRODUCTION');
  const [fontSize, setFontSize] = useState<number>(44);
  const [fontFamily, setFontFamily] = useState<string>('Impact, sans-serif');
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(6);
  const [isUppercase, setIsUppercase] = useState<boolean>(true);
  const [textAlign, setTextAlign] = useState<'center' | 'left' | 'right'>('center');
  const [topOffsetY, setTopOffsetY] = useState<number>(20);
  const [bottomOffsetY, setBottomOffsetY] = useState<number>(20);
  const [watermarkTag, setWatermarkTag] = useState<string>('');

  // State Ekspor & UX
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Render Template Default jika belum ada file kustom yang diunggah
  const drawTemplateBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, type: string) => {
    ctx.clearRect(0, 0, width, height);

    if (type === 'gradient-drake') {
      // Panel Atas (Menolak / Kurang Suka - Jingga Kemerahan)
      const gradTop = ctx.createLinearGradient(0, 0, width, height / 2);
      gradTop.addColorStop(0, '#7F1D1D');
      gradTop.addColorStop(1, '#991B1B');
      ctx.fillStyle = gradTop;
      ctx.fillRect(0, 0, width, height / 2);

      // Panel Bawah (Menyetujui / Suka - Hijau Emerald)
      const gradBot = ctx.createLinearGradient(0, height / 2, width, height);
      gradBot.addColorStop(0, '#064E3B');
      gradBot.addColorStop(1, '#047857');
      ctx.fillStyle = gradBot;
      ctx.fillRect(0, height / 2, width, height / 2);

      // Garis Pembatas Tengah
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Ikon Reaksi Ilustrasi
      ctx.font = '80px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('❌ 😒', 40, height / 4 + 25);
      ctx.fillText('✅ 😎', 40, (height * 3) / 4 + 25);
    } else if (type === 'two-buttons') {
      // Background Ruang Kontrol
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0F172A');
      grad.addColorStop(1, '#1E293B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Meja Tombol
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(60, 160, width - 120, height - 320, 24);
      ctx.fill();

      // Tombol Merah Kiri
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.ellipse(width * 0.35, height * 0.5, 90, 50, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#991B1B';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Tombol Biru Kanan
      ctx.fillStyle = '#2563EB';
      ctx.beginPath();
      ctx.ellipse(width * 0.65, height * 0.5, 90, 50, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1D4ED8';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Ilustrasi Keringat / Dilema
      ctx.font = '64px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('😰 🔘 🔘', width / 2, height * 0.5 + 20);
    } else if (type === 'cheems-doge') {
      // Latar Split Kuning & Ungu
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#312E81');
      grad.addColorStop(1, '#1E1B4B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Kartu Kiri (Buff Doge)
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.roundRect(40, 120, width / 2 - 60, height - 240, 20);
      ctx.fill();
      ctx.font = '90px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🐕💪', 40 + (width / 2 - 60) / 2, height / 2 + 30);

      // Kartu Kanan (Cheems Kecil)
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.roundRect(width / 2 + 20, 120, width / 2 - 60, height - 240, 20);
      ctx.fill();
      ctx.fillText('🐶🥺', width / 2 + 20 + (width / 2 - 60) / 2, height / 2 + 30);
    } else {
      // Cat Shocked Latar Gelap Cerah
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#111827');
      grad.addColorStop(1, '#374151');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Lingkaran Sorot Cahaya
      const radial = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 350);
      radial.addColorStop(0, 'rgba(250, 204, 21, 0.25)');
      radial.addColorStop(1, 'transparent');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      ctx.font = '120px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🙀💥', width / 2, height / 2 + 40);
    }
  }, []);

  // Fungsi Pembungkus Kalimat (Word Wrap) untuk Canvas
  const drawWrappedMemeText = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      text: string,
      x: number,
      baseY: number,
      maxWidth: number,
      lineHeight: number,
      isTop: boolean
    ) => {
      if (!text.trim()) return;

      const formattedText = isUppercase ? text.toUpperCase() : text;
      const words = formattedText.split(' ');
      const lines: string[] = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testWidth = ctx.measureText(currentLine + ' ' + word).width;
        if (testWidth < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);

      // Menggambar teks baris per baris
      lines.forEach((line, index) => {
        let lineY = baseY;
        if (isTop) {
          lineY = baseY + index * lineHeight;
        } else {
          lineY = baseY - (lines.length - 1 - index) * lineHeight;
        }

        // 1. Gambar Stroke / Outline Tebal Hitam (jika aktif)
        if (strokeWidth > 0 && strokeColor !== 'transparent') {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeWidth * 2;
          ctx.lineJoin = 'round';
          ctx.miterLimit = 2;
          ctx.strokeText(line, x, lineY);
        }

        // 2. Gambar Isi Teks Utama
        ctx.fillStyle = textColor;
        ctx.fillText(line, x, lineY);
      });
    },
    [isUppercase, strokeWidth, strokeColor, textColor]
  );

  // Render Canvas Utama
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // A. Gambar Background: Gambar User ATAU Template Presets
    if (loadedImageRef.current) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(loadedImageRef.current, 0, 0, width, height);
    } else {
      const currentPreset = TEMPLATE_PRESETS.find((t) => t.id === activeTemplate);
      const bgType = currentPreset?.bgType || 'gradient-drake';
      drawTemplateBackground(ctx, width, height, bgType);
    }

    // B. Konfigurasi Font
    ctx.font = `900 ${fontSize}px ${fontFamily}`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'top';

    const maxTextWidth = width - 60;
    const lineHeight = fontSize * 1.15;

    // Tentukan Koordinat X Horizontal berdasarkan Align
    let posX = width / 2;
    if (textAlign === 'left') posX = 35;
    if (textAlign === 'right') posX = width - 35;

    // C. Gambar Teks Atas
    if (topText.trim()) {
      const topY = topOffsetY + 15;
      drawWrappedMemeText(ctx, topText, posX, topY, maxTextWidth, lineHeight, true);
    }

    // D. Gambar Teks Bawah
    if (bottomText.trim()) {
      ctx.textBaseline = 'bottom';
      const bottomY = height - bottomOffsetY - 15;
      drawWrappedMemeText(ctx, bottomText, posX, bottomY, maxTextWidth, lineHeight, false);
    }

    // E. Watermark / Tag Kreator (Opsional)
    if (watermarkTag.trim()) {
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(watermarkTag, width - 20, height - 12);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(watermarkTag, width - 20, height - 12);
    }
  }, [
    activeTemplate,
    topText,
    bottomText,
    fontSize,
    fontFamily,
    textAlign,
    topOffsetY,
    bottomOffsetY,
    watermarkTag,
    drawTemplateBackground,
    drawWrappedMemeText,
  ]);

  // Efek Update Canvas saat Pengaturan Berubah
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle Pilih Berkas Gambar Pengguna
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar yang valid (JPG, PNG, atau WebP).');
      return;
    }

    setSelectedFile(file);

    // Bersihkan URL lama jika ada
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);

    const img = new Image();
    img.onload = () => {
      loadedImageRef.current = img;

      // Sesuaikan rasio canvas dengan gambar asli (maks lebar 1200 demi performa)
      const maxW = 1200;
      let targetW = img.width;
      let targetH = img.height;

      if (targetW > maxW) {
        targetH = Math.round((targetH * maxW) / targetW);
        targetW = maxW;
      }

      setCanvasDimensions({ width: targetW, height: targetH });

      if (canvasRef.current) {
        canvasRef.current.width = targetW;
        canvasRef.current.height = targetH;
        renderCanvas();
      }

      showToast(`Gambar "${file.name}" berhasil dimuat!`);
    };
    img.src = objectUrl;
  };

  // Handle Pilih Template Instan
  const handleSelectTemplate = (template: TemplateOption) => {
    setActiveTemplate(template.id);
    setSelectedFile(null);
    loadedImageRef.current = null;

    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
      setImageSrc(null);
    }

    setTopText(template.topText);
    setBottomText(template.bottomText);

    // Set ukuran kanvas default untuk template instan
    const defaultW = 800;
    const defaultH = 600;
    setCanvasDimensions({ width: defaultW, height: defaultH });

    if (canvasRef.current) {
      canvasRef.current.width = defaultW;
      canvasRef.current.height = defaultH;
      renderCanvas();
    }
  };

  // Unduh Gambar Meme (PNG / JPG)
  const handleDownload = (format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDownloading(true);
    try {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, 0.95);

      const link = document.createElement('a');
      const timeStamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      link.download = `meme_kompreskilat_${timeStamp}.${format === 'png' ? 'png' : 'jpg'}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Meme berhasil diunduh dalam format ${format.toUpperCase()}!`);
    } catch (err) {
      console.error('Gagal mengunduh meme:', err);
      alert('Gagal mengunduh gambar. Pastikan browser Anda mengizinkan unduhan berkas.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Salin Gambar ke Clipboard
  const handleCopyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setIsCopied(true);
          showToast('Gambar meme berhasil disalin ke papan klip!');
          setTimeout(() => setIsCopied(false), 2500);
        } catch {
          showToast('Browser belum mendukung salin langsung, gunakan tombol Unduh.');
        }
      }, 'image/png');
    } catch {
      showToast('Gagal menyalin gambar.');
    }
  };

  // Reset Semua Input ke Pengaturan Awal
  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang gambar dan teks meme?')) {
      setSelectedFile(null);
      loadedImageRef.current = null;
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
        setImageSrc(null);
      }
      handleSelectTemplate(TEMPLATE_PRESETS[0]);
      setFontSize(44);
      setTextColor('#FFFFFF');
      setStrokeColor('#000000');
      setStrokeWidth(6);
      setIsUppercase(true);
      setTextAlign('center');
      setTopOffsetY(20);
      setBottomOffsetY(20);
      setWatermarkTag('');
      showToast('Kanvas telah direset ke template awal.');
    }
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Meme & Image Caption Generator - KompresKilat',
    description: 'Aplikasi online gratis untuk membuat meme lucu, teks sindiran, dan caption gambar viral instan langsung di browser dengan format font Impact tebal.',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <JsonLd data={schemaData} />
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header Hero */}
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs px-3.5 py-1 rounded-full font-bold mb-3 shadow-xs">
            <Smile className="w-3.5 h-3.5 text-amber-600" />
            😂 Meme &amp; Caption Studio 100% Client-Side
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">
            Meme &amp; Image Caption Generator
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Rancang meme viral, kutipan motivasi, atau caption sindiran lucu secara instan. Dilengkapi font Impact tebal, outline stroke hitam pekat, dan 100% diproses di browser tanpa upload ke server luar.
          </p>
        </div>

        {/* Layout Utama 2 Kolom Responsif */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start mb-12">
          
          {/* Kolom Kiri: Panel Kontrol & Input (5 Kolom) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* 1. Pemilihan Sumber Gambar / Template */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-600" /> 1. Gambar Latar Meme
                </span>
                {selectedFile && (
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Kustom Diunggah
                  </span>
                )}
              </div>

              {/* Upload Foto Sendiri */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50 rounded-xl flex flex-col items-center justify-center gap-1.5 transition cursor-pointer text-center group"
                >
                  <Upload className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition duration-150" />
                  <span className="text-xs font-bold text-indigo-950">Unggah Foto Galeri</span>
                  <span className="text-[10px] text-slate-500">JPG, PNG, WebP</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-3 border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 rounded-xl flex flex-col items-center justify-center gap-1.5 transition cursor-pointer text-center group"
                >
                  <Camera className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 group-hover:scale-110 transition duration-150" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-950">Ambil dari Kamera</span>
                  <span className="text-[10px] text-slate-500">Langsung Jepret</span>
                </button>

                {/* Input File Tersembunyi */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Template Instan Cepat */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-2">
                  Atau pilih Template Cepat Populer:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATE_PRESETS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTemplate(t)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition cursor-pointer flex flex-col justify-between ${
                        !selectedFile && activeTemplate === t.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="line-clamp-1">{t.name}</span>
                      <span className={`text-[10px] mt-1 ${!selectedFile && activeTemplate === t.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {t.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Form Teks Meme */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-4 h-4 text-indigo-600" /> 2. Kalimat Teks Meme
              </span>

              {/* Teks Atas */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Teks Atas (Top Text):</label>
                  {topText && (
                    <button
                      type="button"
                      onClick={() => setTopText('')}
                      className="text-[10px] text-slate-400 hover:text-red-500 transition"
                    >
                      Kosongkan
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="Contoh: KETIKA CODING SELESAI..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                />
              </div>

              {/* Teks Bawah */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Teks Bawah (Bottom Text):</label>
                  {bottomText && (
                    <button
                      type="button"
                      onClick={() => setBottomText('')}
                      className="text-[10px] text-slate-400 hover:text-red-500 transition"
                    >
                      Kosongkan
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="Contoh: TAPI PRODUCTION MALAH ERROR..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                />
              </div>

              {/* Watermark Tag Tambahan */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Tanda Kreator / Watermark Pojok (Opsional):
                </label>
                <input
                  type="text"
                  value={watermarkTag}
                  onChange={(e) => setWatermarkTag(e.target.value)}
                  placeholder="Contoh: @akun_meme_anda"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* 3. Gaya, Warna & Tipografi */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-600" /> 3. Gaya &amp; Tipografi Teks
              </span>

              {/* Pilihan Font */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Huruf (Font):</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {FONT_FAMILIES.map((f, idx) => (
                    <option key={idx} value={f.value}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Slider Ukuran Font */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700">Ukuran Huruf (Font Size):</span>
                  <span className="font-mono font-bold text-indigo-600">{fontSize} px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="2"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Pilihan Warna Teks Utama */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Warna Teks:</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {COLOR_SWATCHES.map((swatch, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTextColor(swatch.value)}
                      title={swatch.name}
                      style={{ backgroundColor: swatch.value, borderColor: swatch.border }}
                      className={`w-7 h-7 rounded-full border-2 transition transform hover:scale-110 cursor-pointer shadow-xs ${
                        textColor === swatch.value ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : ''
                      }`}
                    />
                  ))}
                  {/* Custom Hex Color Input */}
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    title="Pilih Warna Custom"
                    className="w-7 h-7 rounded-full border-0 p-0 cursor-pointer overflow-hidden"
                  />
                </div>
              </div>

              {/* Tebal Stroke Outline */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-700">Ketebalan Stroke:</span>
                    <span className="font-mono font-bold text-slate-600">{strokeWidth} px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="14"
                    step="1"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warna Outline:</label>
                  <select
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {STROKE_COLORS.map((sc, i) => (
                      <option key={i} value={sc.value}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Opsi Kapitalisasi & Rata Teks */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={isUppercase}
                    onChange={(e) => setIsUppercase(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span>Kapital Otomatis (UPPERCASE)</span>
                </label>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setTextAlign('left')}
                    className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer ${
                      textAlign === 'left' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Kiri
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextAlign('center')}
                    className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer ${
                      textAlign === 'center' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Tengah
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextAlign('right')}
                    className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer ${
                      textAlign === 'right' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Kanan
                  </button>
                </div>
              </div>

              {/* Slider Penyesuaian Margin Vertikal */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Jarak Teks Atas: {topOffsetY}px</span>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={topOffsetY}
                    onChange={(e) => setTopOffsetY(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Jarak Teks Bawah: {bottomOffsetY}px</span>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={bottomOffsetY}
                    onChange={(e) => setBottomOffsetY(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Tombol Reset */}
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-red-600 font-semibold text-xs rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Semua Gambar &amp; Teks</span>
            </button>
          </div>

          {/* Kolom Kanan: Pratinjau Interaktif Canvas (7 Kolom) */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-20">
            <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              
              {/* Header Box Pratinjau */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                    Live Canvas Preview (HTML5)
                  </span>
                  <p className="text-xs text-slate-500">
                    Resolusi Kanvas: <b>{canvasDimensions.width} × {canvasDimensions.height} px</b>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-lg">
                    🔒 100% Memori Browser
                  </span>
                </div>
              </div>

              {/* Area Canvas Interaktif */}
              <div className="bg-slate-900/5 border border-slate-200 rounded-xl p-3 sm:p-4 flex justify-center items-center overflow-hidden min-h-[340px] max-h-[580px]">
                <canvas
                  ref={canvasRef}
                  width={canvasDimensions.width}
                  height={canvasDimensions.height}
                  className="max-h-[520px] max-w-full rounded-lg shadow-md object-contain transition-all"
                />
              </div>

              {/* Tombol Aksi Download & Salin */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleDownload('png')}
                    disabled={isDownloading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-sm transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloading ? 'Menyimpan...' : 'Unduh Meme PNG (Tajam)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload('jpeg')}
                    disabled={isDownloading}
                    className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-sm transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Meme JPG (Ukuran Ringan)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyToClipboard}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Tersalin ke Papan Klip!' : 'Salin Gambar Meme ke Clipboard'}</span>
                </button>
              </div>

              {/* Catatan Privasi Singkat */}
              <p className="text-[11px] text-slate-400 text-center leading-normal">
                🛡️ Dokumen &amp; gambar Anda tidak pernah diunggah ke internet. Seluruh pembuatan meme berlangsung murni pada peramban perangkat Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Slot Iklan Kepatuhan AdSense dengan Padding Aman */}
        <div className="my-10 pt-4">
          <AdBanner zone="in-tool" label="Iklan Sponsor" />
        </div>

        {/* Konten Edukasi & SEO: Panduan Membuat Meme Berkualitas */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-600 text-xs sm:text-sm leading-relaxed">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 mb-2">
              💡 Panduan &amp; Trik Membuat Meme Viral Berkualitas Tinggi
            </h2>
            <p>
              Meme adalah media komunikasi visual paling populer di era digital. Baik untuk hiburan, sindiran santai, promosi media sosial, hingga materi presentasi agar tidak membosankan. Generator meme KompresKilat hadir untuk memudahkan siapa saja merancang meme dalam sekejap tanpa memerlukan software desain rumit seperti Photoshop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <span>🎯</span> Teks Singkat &amp; Mengena
              </h3>
              <p className="text-xs text-slate-500">
                Gunakan kalimat yang to-the-point dan *relatable* dengan kehidupan sehari-hari pembaca. Pola klasik &ldquo;Premis di Atas&rdquo; dan &ldquo;Punchline di Bawah&rdquo; terbukti paling mudah dicerna audiens.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <span>🖋️</span> Rahasia Font Impact &amp; Stroke
              </h3>
              <p className="text-xs text-slate-500">
                Font berbobot tebal seperti <b>Impact</b> yang dilapisi garis luar hitam (stroke outline) memastikan teks tetap terbaca dengan kontras sempurna di atas latar belakang gambar apapun, baik terang maupun gelap.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <span>🔒</span> Jaminan Keamanan &amp; Privasi
              </h3>
              <p className="text-xs text-slate-500">
                Foto pribadi, wajah teman, atau materi internal kantor Anda diproses 100% menggunakan teknologi HTML5 Canvas langsung di RAM browser tanpa pernah dikirim ke server backend KompresKilat.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800">FAQ Singkat:</h4>
            <ul className="space-y-1.5 list-disc pl-5 text-slate-500">
              <li><b>Apakah ada watermark dari aplikasi?</b> Tidak ada. Meme yang Anda unduh bersih tanpa watermark otomatis dari situs kami. Anda dapat menambahkan tag nama akun Anda sendiri secara sukarela.</li>
              <li><b>Format apa yang sebaiknya saya unduh?</b> Gunakan format <b>PNG</b> jika ingin ketajaman teks maksimal, atau <b>JPG</b> jika ingin ukuran file lebih kecil agar cepat dikirim lewat WhatsApp.</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
