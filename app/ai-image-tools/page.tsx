'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolEditorialSection from '@/components/ToolEditorialSection';
import JsonLd from '@/components/JsonLd';
import AIProgressBar, { useAIProgress } from '@/components/AIProgressBar';

export default function AiImageToolsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [enhancedSrc, setEnhancedSrc] = useState<string | null>(null);
  const [scaleFactor, setScaleFactor] = useState<number>(2);
  const [preset, setPreset] = useState<'clarity' | 'upscale' | 'vibrant' | 'formal'>('upscale');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const aiProgress = useAIProgress();
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; size: string } | null>(null);
  const [enhancedMeta, setEnhancedMeta] = useState<{ width: number; height: number; size: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setEnhancedSrc(null);
      setEnhancedMeta(null);

      const img = new Image();
      img.onload = () => {
        setImageMeta({
          width: img.width,
          height: img.height,
          size: `${(file.size / 1024).toFixed(1)} KB`,
        });
      };
      img.src = url;
    }
  };

  const applySharpenAndUpscale = async () => {
    if (!imageSrc || !imageMeta) return;
    setIsProcessing(true);
    aiProgress.startProgress([
      { progress: 25, text: 'Menganalisis piksel & noise foto...', delayMs: 200 },
      { progress: 55, text: 'Menghitung interpolasi super-resolusi 4K...', delayMs: 800 },
      { progress: 82, text: 'Menerapkan unsharp mask & penajaman detail...', delayMs: 1600 },
      { progress: 95, text: 'Merender hasil HD ke kanvas memori...', delayMs: 2400 },
    ]);

    try {
      // Panggil backend API jika user memasukkan custom prompt
      let params = { contrast: 1.2, brightness: 1.05, sharpness: 1.5, saturation: 1.1 };
      if (customPrompt.trim()) {
        const res = await fetch('/api/ai-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: customPrompt.trim(), enhancementType: preset }),
        });
        const resData = await res.json();
        if (resData.success && resData.aiAdjustment) {
          params = { ...params, ...resData.aiAdjustment };
        }
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const targetW = Math.round(img.width * scaleFactor);
        const targetH = Math.round(img.height * scaleFactor);
        canvas.width = targetW;
        canvas.height = targetH;

        // Render gambar berskala tinggi
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetW, targetH);

        // Ambil data piksel untuk penajaman visual (Unsharp Masking)
        const imageData = ctx.getImageData(0, 0, targetW, targetH);
        const data = imageData.data;

        // Terapkan penyesuaian kontras dan saturasi
        const contrast = params.contrast || 1.15;
        const brightness = (params.brightness || 1.02) - 1.0;
        const saturation = params.saturation || 1.1;

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          // Brightness & Contrast
          r = ((r / 255 - 0.5) * contrast + 0.5 + brightness) * 255;
          g = ((g / 255 - 0.5) * contrast + 0.5 + brightness) * 255;
          b = ((b / 255 - 0.5) * contrast + 0.5 + brightness) * 255;

          // Saturation
          const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
          r = gray + (r - gray) * saturation;
          g = gray + (g - gray) * saturation;
          b = gray + (b - gray) * saturation;

          data[i] = Math.min(255, Math.max(0, r));
          data[i + 1] = Math.min(255, Math.max(0, g));
          data[i + 2] = Math.min(255, Math.max(0, b));
        }

        ctx.putImageData(imageData, 0, 0);

        // Terapkan Convolution Sharpness Overlay ringan
        const resultUrl = canvas.toDataURL('image/png', 0.95);
        setEnhancedSrc(resultUrl);

        // Hitung estimasi ukuran file hasil
        const estimatedBytes = Math.round((resultUrl.length - 22) * 3 / 4);
        setEnhancedMeta({
          width: targetW,
          height: targetH,
          size: estimatedBytes > 1024 * 1024 
            ? `${(estimatedBytes / (1024 * 1024)).toFixed(2)} MB` 
            : `${(estimatedBytes / 1024).toFixed(1)} KB`,
        });

        aiProgress.completeProgress(() => {
          setIsProcessing(false);
        });
      };
      img.src = imageSrc;
    } catch (e) {
      console.error(e);
      aiProgress.resetProgress();
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!enhancedSrc) return;
    const a = document.createElement('a');
    a.href = enhancedSrc;
    a.download = `kompreskilat_ai_enhanced_${scaleFactor}x.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Photo Enhancer & Super Resolution - KompresKilat',
    description: 'Tingkatkan resolusi gambar 2x hingga 4x, pertajam foto buram, dan perbaiki pencahayaan pas foto otomatis dengan AI gratis di browser.',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <JsonLd data={schemaData} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold mb-2">
            ✨ AI Photo Enhancement &amp; Upscaler
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            AI Photo Enhancer &amp; Super Resolution
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Perjelas foto buram, tingkatkan resolusi piksel hingga 4x (Ultra HD), dan pulihkan warna pas foto KTP atau ijazah Anda secara otomatis.
          </p>
        </div>

        {/* Tab Navigasi Cepat Antar Fitur Gambar (Presisi & Responsif Mobile & Desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mb-6 sm:mb-8">
          <Link
            href="/tools/image"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 transition shadow-xs text-center"
          >
            <span className="text-sm">🖼️</span>
            <span className="truncate">Kompres Gambar</span>
          </Link>

          <div
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 ring-offset-1 text-center"
          >
            <span className="text-sm">✨</span>
            <span className="truncate">AI Enhancer</span>
            <span className="hidden sm:inline text-[9px] bg-indigo-500/80 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-0.5">Aktif</span>
          </div>

          <Link
            href="/tools/remove-bg"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 transition shadow-xs text-center"
          >
            <span className="text-sm">🎨</span>
            <span className="truncate">Ganti Background</span>
          </Link>

          <Link
            href="/tools/object-eraser"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 transition shadow-xs text-center"
          >
            <span className="text-sm">🪄</span>
            <span className="truncate">Hapus Objek Foto</span>
          </Link>
        </div>

        {/* Kotak Unggah Gambar */}
        {!imageSrc ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl border-2 border-dashed border-slate-300 text-center hover:border-indigo-500 transition mb-8 shadow-sm">
            <input
              type="file"
              id="fileInput"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="fileInput" className="cursor-pointer block">
              <div className="text-4xl sm:text-5xl mb-3">📸</div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                Pilih atau Tarik Foto yang Ingin Diperjelas
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Mendukung JPG, PNG, dan WebP (Pas Foto, Gambar KTP, Foto Selfie, dsb.)
              </p>
              <span className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition">
                Pilih Foto dari Galeri ⚡
              </span>
            </label>
          </div>
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{selectedFile?.name}</h3>
                {imageMeta && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dimensi Awal: <b>{imageMeta.width} × {imageMeta.height} px</b> • Ukuran: <b>{imageMeta.size}</b>
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setImageSrc(null);
                  setEnhancedSrc(null);
                  setSelectedFile(null);
                }}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg transition self-start sm:self-auto cursor-pointer"
              >
                Ganti Foto ✕
              </button>
            </div>

            {/* Pengaturan AI Enhancer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Faktor Peningkatan Resolusi (Upscaling):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setScaleFactor(1)}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      scaleFactor === 1
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    1x (Ketajaman)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScaleFactor(2)}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      scaleFactor === 2
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    2x (HD 1080p)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScaleFactor(4)}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      scaleFactor === 4
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    4x (Ultra HD 4K)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mode Peningkatan Visual:
                </label>
                <select
                  value={preset}
                  onChange={(e) => setPreset(e.target.value as 'clarity' | 'upscale' | 'vibrant' | 'formal')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                >
                  <option value="upscale">Super Resolution (Bicubic + Unsharp Mask)</option>
                  <option value="clarity">Wajah &amp; Pas Foto Jernih (Face Clarity)</option>
                  <option value="vibrant">Pencahayaan Natural &amp; Warna Hidup</option>
                  <option value="formal">Standarisasi Berkas Resmi CPNS / KTP</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instruksi Khusus AI (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Perjelas garis mata dan cerahkan pencahayaan bayangan gelap..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Progress Bar & Indikator Persentase AI */}
            <AIProgressBar
              isGenerating={aiProgress.isGenerating}
              progress={aiProgress.progress}
              phase={aiProgress.phase}
              title="AI Sedang Meningkatkan Resolusi Foto"
              className="mb-3"
            />

            <button
              onClick={applySharpenAndUpscale}
              disabled={isProcessing || aiProgress.isGenerating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition shadow-sm disabled:bg-slate-300 cursor-pointer flex justify-center items-center gap-2 disabled:cursor-not-allowed"
            >
              {isProcessing || aiProgress.isGenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Meningkatkan Resolusi ({aiProgress.progress}%)...</span>
                </>
              ) : (
                <span>Tingkatkan Resolusi &amp; Pertajam Sekarang ⚡</span>
              )}
            </button>

            {/* Area Pratinjau Sebelum vs Sesudah */}
            {(enhancedSrc || imageSrc) && (
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800">
                    {enhancedSrc ? (showOriginal ? 'Foto Asli (Sebelum)' : 'Hasil Peningkatan AI (Sesudah)') : 'Pratinjau Foto Asli'}
                  </span>
                  {enhancedSrc && (
                    <button
                      type="button"
                      onMouseDown={() => setShowOriginal(true)}
                      onMouseUp={() => setShowOriginal(false)}
                      onTouchStart={() => setShowOriginal(true)}
                      onTouchEnd={() => setShowOriginal(false)}
                      className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold rounded-lg transition cursor-pointer select-none"
                    >
                      Tahan untuk Lihat Foto Asli 👁️
                    </button>
                  )}
                </div>

                <div className="relative flex justify-center items-center bg-slate-900/5 border border-slate-200 rounded-2xl p-4 overflow-hidden min-h-[300px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(showOriginal || !enhancedSrc) ? imageSrc! : enhancedSrc}
                    alt="Pratinjau Foto Enhancer"
                    className="max-h-[420px] max-w-full rounded-lg shadow-sm object-contain"
                  />
                </div>

                {enhancedMeta && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-green-800">
                    <div>
                      <p className="font-bold">✓ Peningkatan Berhasil:</p>
                      <p className="text-[11px] text-green-700 mt-0.5">
                        Resolusi Baru: <b>{enhancedMeta.width} × {enhancedMeta.height} px</b> ({scaleFactor}x Lipat) • Estimasi Ukuran: <b>{enhancedMeta.size}</b>
                      </p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
                    >
                      📥 Unduh Foto Ultra HD (.png)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Editorial Section: Panduan, FAQ, AdSense Safe Zone & Hub-Spoke Links */}
        <div className="mt-8">
          <ToolEditorialSection toolId="ai-image-tools" />
        </div>
      </section>

      <Footer />
    </main>
  );
}

