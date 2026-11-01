'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';

interface PresetSize {
  id: string;
  label: string;
  desc: string;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
  aspectRatio: number;
}

const PRESET_SIZES: PresetSize[] = [
  {
    id: '3x4',
    label: '3 × 4 cm (CPNS / BUMN)',
    desc: 'Standar wajib pendaftaran CPNS, PPPK, BUMN, & Kedinasan',
    widthMm: 27.9,
    heightMm: 38.1,
    widthPx: 330,
    heightPx: 450,
    aspectRatio: 330 / 450,
  },
  {
    id: '4x6',
    label: '4 × 6 cm (Ijazah / Nikah)',
    desc: 'Buku nikah KUA, berkas wisuda, & sertifikasi profesi',
    widthMm: 38.1,
    heightMm: 55.9,
    widthPx: 450,
    heightPx: 660,
    aspectRatio: 450 / 660,
  },
  {
    id: '2x3',
    label: '2 × 3 cm (Kartu Anggota)',
    desc: 'KTA, kartu pelajar, SIM, & arsip administrasi kecil',
    widthMm: 21.6,
    heightMm: 27.9,
    widthPx: 255,
    heightPx: 330,
    aspectRatio: 255 / 330,
  },
  {
    id: 'paspor',
    label: '3.5 × 4.5 cm (Paspor / Visa)',
    desc: 'Standar internasional paspor RI, visa Schengen, & Jepang',
    widthMm: 35,
    heightMm: 45,
    widthPx: 413,
    heightPx: 531,
    aspectRatio: 413 / 531,
  },
  {
    id: 'ttd',
    label: 'Tanda Tangan Digital',
    desc: 'Format horizontal bersih untuk e-materai & dokumen PDF',
    widthMm: 60,
    heightMm: 30,
    widthPx: 600,
    heightPx: 300,
    aspectRatio: 600 / 300,
  },
];

export default function ResizePasFotoPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [currentPreset, setCurrentPreset] = useState<PresetSize>(PRESET_SIZES[0]);
  const [targetKb, setTargetKb] = useState<number>(200); // 200KB standard CPNS
  const [zoom, setZoom] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [bgChoice, setBgChoice] = useState<'original' | 'red' | 'blue' | 'white'>('original');

  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [outputSizeText, setOutputSizeText] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);

      const img = new Image();
      img.onload = () => {
        imageElementRef.current = img;
        renderCanvas(img, currentPreset, 1, 0, 0, bgChoice);
      };
      img.src = url;
    }
  };

  const renderCanvas = useCallback((
    img: HTMLImageElement,
    preset: PresetSize,
    scale: number,
    dx: number,
    dy: number,
    bg: 'original' | 'red' | 'blue' | 'white'
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = preset.widthPx;
    canvas.height = preset.heightPx;

    // Bersihkan canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Latar Belakang
    if (bg === 'red') {
      ctx.fillStyle = '#DC2626'; // Merah Resmi CPNS
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bg === 'blue') {
      ctx.fillStyle = '#2563EB'; // Biru Resmi CPNS
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bg === 'white') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Gambar Foto dengan Skala & Posisi Drag
    const baseScale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const finalScale = baseScale * scale;

    const drawW = img.width * finalScale;
    const drawH = img.height * finalScale;
    const posX = (canvas.width - drawW) / 2 + dx;
    const posY = (canvas.height - drawH) / 2 + dy;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, posX, posY, drawW, drawH);

    // Hitung estimasi ukuran file JPEG dengan target KB
    let quality = 0.92;
    if (targetKb <= 100) quality = 0.65;
    else if (targetKb <= 200) quality = 0.82;
    else if (targetKb <= 300) quality = 0.88;

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    setPreviewDataUrl(dataUrl);

    // Estimasi ukuran berkas
    const head = 'data:image/jpeg;base64,';
    const fileSizeByte = Math.round(((dataUrl.length - head.length) * 3) / 4);
    setOutputSizeText(`${(fileSizeByte / 1024).toFixed(1)} KB`);
  }, [targetKb]);

  // Trigger render setiap kali ada perubahan parameter
  useEffect(() => {
    if (imageElementRef.current) {
      renderCanvas(imageElementRef.current, currentPreset, zoom, offsetX, offsetY, bgChoice);
    }
  }, [currentPreset, zoom, offsetX, offsetY, bgChoice, renderCanvas]);

  // Handle Drag / Pan di Canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch Support untuk HP / Mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - offsetX, y: e.touches[0].clientY - offsetY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffsetX(e.touches[0].clientX - dragStart.x);
    setOffsetY(e.touches[0].clientY - dragStart.y);
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleDownload = () => {
    if (!previewDataUrl) return;
    const a = document.createElement('a');
    a.href = previewDataUrl;
    a.download = `pasfoto_${currentPreset.id}_${targetKb}kb_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Resize & Crop Pas Foto Online 2x3, 3x4, 4x6 - KompresKilat',
    description: 'Ubah ukuran pas foto ke standar 2x3, 3x4, 4x6, paspor, dan tanda tangan digital dengan target ukuran di bawah 200KB untuk syarat CPNS & BUMN.',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={schemaData} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold mb-2">
            📸 Khusus Pas Foto CPNS, BUMN, &amp; Tanda Tangan
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            Resize &amp; Crop Pas Foto Online (2x3, 3x4, 4x6)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Sesuaikan ukuran milimeter, piksel resmi 300 DPI, dan batas maksimal file di bawah 200KB / 300KB langsung di browser secara presisi.
          </p>
        </div>

        {/* Upload Box */}
        {!imageSrc ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl border-2 border-dashed border-slate-300 text-center hover:border-indigo-500 transition mb-8 shadow-sm">
            <input
              type="file"
              id="fileInputPasFoto"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="fileInputPasFoto" className="cursor-pointer block">
              <div className="text-4xl sm:text-5xl mb-3">🧑‍💼</div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                Pilih Pas Foto atau Gambar Tanda Tangan Anda
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Mendukung foto galeri smartphone, selfie tegak, atau scan dokumen
              </p>
              <span className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition">
                Pilih Foto dari Perangkat ⚡
              </span>
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Editor Workspace */}
            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Kolom Kiri: Canvas Pratinjau Interaktif */}
              <div className="md:col-span-6 flex flex-col items-center justify-center bg-slate-100/70 p-4 rounded-xl border border-slate-200 min-h-[360px] relative overflow-hidden select-none">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="rounded-lg shadow-md max-h-[340px] max-w-full cursor-grab active:cursor-grabbing border border-slate-300 bg-white"
                />

                <p className="text-[11px] text-slate-500 mt-2 text-center">
                  👆 <i>Sentuh / seret gambar di atas untuk mengatur posisi crop yang pas.</i>
                </p>
              </div>

              {/* Kolom Kanan: Pengaturan Ukuran & Kompresi */}
              <div className="md:col-span-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    1. Pilih Standar Ukuran Pas Foto:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRESET_SIZES.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setCurrentPreset(preset)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          currentPreset.id === preset.id
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-xs">{preset.label}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{preset.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider Zoom & Penyesuaian */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>Perbesar / Zoom Foto:</span>
                    <span className="font-mono text-indigo-600">{zoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Kecil</span>
                    <button
                      type="button"
                      onClick={() => {
                        setZoom(1);
                        setOffsetX(0);
                        setOffsetY(0);
                      }}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      Reset Posisi
                    </button>
                    <span>Besar</span>
                  </div>
                </div>

                {/* Target Ukuran File (KB) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    2. Target Maksimal Ukuran Berkas:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { kb: 100, label: '< 100 KB' },
                      { kb: 200, label: '< 200 KB (Wajib CPNS)' },
                      { kb: 500, label: '< 500 KB' },
                    ].map((item) => (
                      <button
                        key={item.kb}
                        type="button"
                        onClick={() => setTargetKb(item.kb)}
                        className={`py-2 px-2 text-center text-xs rounded-xl border font-bold transition cursor-pointer ${
                          targetKb === item.kb
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    3. Warna Latar Pas Foto:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'original' as const, label: 'Asli' },
                      { id: 'red' as const, label: '🔴 Merah' },
                      { id: 'blue' as const, label: '🔵 Biru' },
                      { id: 'white' as const, label: '⚪ Putih' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setBgChoice(item.id)}
                        className={`py-1.5 px-1 text-center text-xs rounded-xl border font-bold transition cursor-pointer ${
                          bgChoice === item.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Informasi Ringkasan & Unduh */}
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-950 block">Status Hasil Resize:</span>
                    <span className="text-[11px] text-emerald-800">
                      Dimensi: <b>{currentPreset.widthPx} × {currentPreset.heightPx} px</b> • Ukuran: <b>{outputSizeText}</b>
                    </span>
                  </div>
                  <span className="text-xl">✅</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition duration-200 shadow-sm text-center cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>📥 Unduh Pas Foto Siap Upload</span>
                  </button>
                  <button
                    onClick={() => {
                      setImageSrc(null);
                      setPreviewDataUrl(null);
                    }}
                    className="px-3.5 py-3 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold transition"
                    title="Ganti Foto"
                  >
                    Ganti
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AdSense Placement */}
        <AdBanner zone="in-tool" label="Iklan" />

        {/* Panduan & Info Persyaratan */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs text-slate-600 leading-relaxed mt-6">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Panduan Standar Ukuran Pas Foto Resmi di Indonesia
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-1">Ukuran 3×4 cm</h3>
              <p className="text-[11px]">
                Wajib untuk akun SSCASN BKN (CPNS &amp; PPPK), seleksi BUMN, verifikasi Kemenkumham, dan kartu mahasiswa.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-1">Ukuran 4×6 cm</h3>
              <p className="text-[11px]">
                Digunakan untuk ijazah sarjana/diploma, formulir pendaftaran pernikahan di KUA, serta permohonan SKCK Mabes Polri.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-1">Tanda Tangan Digital</h3>
              <p className="text-[11px]">
                Dipotong presisi pada bidang tanda tangan dengan kontras bersih, siap ditempel pada meterai elektronik (e-Meterai).
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

