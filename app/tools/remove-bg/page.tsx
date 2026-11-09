'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolEditorialSection from '@/components/ToolEditorialSection';
import JsonLd from '@/components/JsonLd';
import AIProgressBar, { useAIProgress } from '@/components/AIProgressBar';
import { Sparkles, Download, ShieldCheck, Sliders, CheckCircle2, RefreshCw, Wand2 } from 'lucide-react';
import type { SelfieSegmentation, Results } from '@mediapipe/selfie_segmentation';

// Singleton segmenter ref for fast subsequent executions
let globalSegmenter: SelfieSegmentation | null = null;

async function getSegmenterInstance() {
  if (globalSegmenter) return globalSegmenter;

  try {
    const mp = await import('@mediapipe/selfie_segmentation');
    const segmenter = new mp.SelfieSegmentation({
      locateFile: (file: string) => `/models/selfie-segmentation/${file}`,
    });

    segmenter.setOptions({
      modelSelection: 1, // 1: Landscape/high-accuracy model (higher resolution 512x512)
      selfieMode: false,
    });

    await segmenter.initialize();
    globalSegmenter = segmenter;
    return globalSegmenter;
  } catch (err) {
    console.warn('Local MediaPipe init warning, trying CDN fallback...', err);

    await new Promise<void>((resolve, reject) => {
      const win = window as unknown as { SelfieSegmentation?: typeof SelfieSegmentation };
      if (win.SelfieSegmentation) return resolve();
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747/selfie_segmentation.js';
      s.crossOrigin = 'anonymous';
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });

    const win = window as unknown as { SelfieSegmentation: new (config?: { locateFile?: (file: string) => string }) => SelfieSegmentation };
    const segmenter = new win.SelfieSegmentation({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747/${file}`,
    });

    segmenter.setOptions({
      modelSelection: 1,
      selfieMode: false,
    });

    await segmenter.initialize();
    globalSegmenter = segmenter;
    return globalSegmenter;
  }
}

// Fallback boundary flood-fill (only touches connected border background, never touches subject face/interior)
function fallbackSmartSegmentation(
  originalImg: HTMLImageElement,
  tolerancePercent: number
): HTMLCanvasElement {
  const width = originalImg.width;
  const height = originalImg.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(originalImg, 0, 0);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample outer border pixels
  const borderSamples: number[][] = [];
  for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 30))) {
    const idx = x * 4;
    borderSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
  }
  for (let y = 0; y < Math.floor(height * 0.75); y += Math.max(1, Math.floor(height / 30))) {
    const lIdx = (y * width) * 4;
    borderSamples.push([data[lIdx], data[lIdx + 1], data[lIdx + 2]]);
    const rIdx = (y * width + (width - 1)) * 4;
    borderSamples.push([data[rIdx], data[rIdx + 1], data[rIdx + 2]]);
  }

  let sumR = 0, sumG = 0, sumB = 0;
  for (const s of borderSamples) {
    sumR += s[0];
    sumG += s[1];
    sumB += s[2];
  }
  const avgBgR = sumR / borderSamples.length;
  const avgBgG = sumG / borderSamples.length;
  const avgBgB = sumB / borderSamples.length;

  const isBg = new Uint8Array(width * height);
  const queue: number[] = [];
  const maxDist = tolerancePercent * 3.2;

  const colorDist = (idx: number) => {
    const dr = data[idx] - avgBgR;
    const dg = data[idx + 1] - avgBgG;
    const db = data[idx + 2] - avgBgB;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  // Seed borders
  for (let x = 0; x < width; x++) {
    if (colorDist(x * 4) < maxDist) {
      isBg[x] = 1;
      queue.push(x, 0);
    }
  }
  for (let y = 0; y < Math.floor(height * 0.8); y++) {
    const lPos = y * width;
    if (colorDist(lPos * 4) < maxDist) {
      isBg[lPos] = 1;
      queue.push(0, y);
    }
    const rPos = y * width + width - 1;
    if (colorDist(rPos * 4) < maxDist) {
      isBg[rPos] = 1;
      queue.push(width - 1, y);
    }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (!isBg[nPos]) {
          if (colorDist(nPos * 4) < maxDist) {
            isBg[nPos] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const mCtx = maskCanvas.getContext('2d')!;
  const mImgData = mCtx.createImageData(width, height);
  const md = mImgData.data;

  for (let i = 0; i < width * height; i++) {
    const pIdx = i * 4;
    if (isBg[i]) {
      md[pIdx] = 0;
      md[pIdx + 1] = 0;
      md[pIdx + 2] = 0;
      md[pIdx + 3] = 0;
    } else {
      md[pIdx] = 255;
      md[pIdx + 1] = 255;
      md[pIdx + 2] = 255;
      md[pIdx + 3] = 255;
    }
  }
  mCtx.putImageData(mImgData, 0, 0);
  return maskCanvas;
}

export default function RemoveBgPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bgColor, setBgColor] = useState<string>('#DC2626'); // Default Merah CPNS
  const [isTransparent, setIsTransparent] = useState<boolean>(false);
  const [tolerance, setTolerance] = useState<number>(50); // Sensitivitas & Kehalusan Tepi (10 - 90%)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  // Cached segmentation mask for instant color switching
  const rawMaskRef = useRef<CanvasImageSource | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const aiProgress = useAIProgress();

  // Preset Warna Pas Foto Resmi
  const colorPresets = [
    { label: 'Merah CPNS (Ganjil)', value: '#DC2626', desc: 'Tahun Lahir Ganjil' },
    { label: 'Biru CPNS (Genap)', value: '#2563EB', desc: 'Tahun Lahir Genap' },
    { label: 'Putih Formal', value: '#FFFFFF', desc: 'Paspor / Kedubes' },
    { label: 'Abu-Abu Elegan', value: '#64748B', desc: 'LinkedIn / Profil' },
    { label: 'Hitam Studio', value: '#0F172A', desc: 'Formal Portrait' },
  ];

  // Helper: render processed mask with anti-aliasing
  const buildProcessedMask = useCallback((
    rawMask: CanvasImageSource,
    width: number,
    height: number,
    sensitivity: number
  ): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.drawImage(rawMask, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;

    // Check if alpha or red has mask values
    let hasAlphaVariance = false;
    for (let i = 0; i < Math.min(d.length, 4000); i += 16) {
      if (d[i + 3] > 0 && d[i + 3] < 255) {
        hasAlphaVariance = true;
        break;
      }
    }

    // Cutoff threshold calculation:
    // 50% sensitivity -> cutoff ~0.5
    // higher sensitivity -> lower cutoff to retain fine hair wisps
    const cutoff = 1.0 - (sensitivity / 100.0) * 0.7 - 0.15;
    const feather = 0.12;

    for (let i = 0; i < d.length; i += 4) {
      const val = hasAlphaVariance ? d[i + 3] : d[i];
      const prob = val / 255.0;

      let a = 0;
      if (prob <= cutoff - feather) {
        a = 0;
      } else if (prob >= cutoff + feather) {
        a = 1;
      } else {
        // Smooth Hermite interpolation (smoothstep)
        const t = (prob - (cutoff - feather)) / (2 * feather);
        a = t * t * (3 - 2 * t);
      }

      d[i] = 255;
      d[i + 1] = 255;
      d[i + 2] = 255;
      d[i + 3] = Math.round(a * 255);
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }, []);

  // Helper: composite isolated subject onto new background
  const compositeForegroundAndBackground = useCallback((
    originalImg: HTMLImageElement,
    maskCanvas: HTMLCanvasElement,
    targetColor: string,
    transparent: boolean
  ) => {
    const resultCanvas = resultCanvasRef.current;
    if (!resultCanvas) return;

    const width = originalImg.width;
    const height = originalImg.height;

    resultCanvas.width = width;
    resultCanvas.height = height;
    const ctx = resultCanvas.getContext('2d');
    if (!ctx) return;

    // 1. Offscreen subject canvas (preserves 100% of original colors, face, clothes)
    const fgCanvas = document.createElement('canvas');
    fgCanvas.width = width;
    fgCanvas.height = height;
    const fgCtx = fgCanvas.getContext('2d');
    if (!fgCtx) return;

    // Draw original image unaltered
    fgCtx.drawImage(originalImg, 0, 0, width, height);

    // Keep only foreground subject via destination-in
    fgCtx.globalCompositeOperation = 'destination-in';
    fgCtx.drawImage(maskCanvas, 0, 0, width, height);

    // 2. Clear target result canvas
    ctx.clearRect(0, 0, width, height);

    // 3. Fill new background color
    if (!transparent) {
      ctx.fillStyle = targetColor;
      ctx.fillRect(0, 0, width, height);
    }

    // 4. Draw the isolated subject on top
    ctx.drawImage(fgCanvas, 0, 0, width, height);
  }, []);

  // Re-composite instantly when color or tolerance changes if mask is already cached
  useEffect(() => {
    if (!originalImage || !rawMaskRef.current || !isProcessed) return;

    const mask = buildProcessedMask(
      rawMaskRef.current,
      originalImage.width,
      originalImage.height,
      tolerance
    );

    compositeForegroundAndBackground(
      originalImage,
      mask,
      bgColor,
      isTransparent
    );
  }, [bgColor, isTransparent, tolerance, originalImage, isProcessed, buildProcessedMask, compositeForegroundAndBackground]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setIsProcessed(false);
        rawMaskRef.current = null;
        setStatusMessage('');

        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          const canvas = originalCanvasRef.current;
          if (canvas) {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.drawImage(img, 0, 0);
          }
        };
        img.src = URL.createObjectURL(file);
      } else {
        alert('Harap pilih file gambar (JPG, PNG, atau WebP)!');
      }
    }
  };

  // Main Background Removal & Replacement Pipeline (100% Client-Side)
  const processBackground = async () => {
    if (!originalImage) return;

    setIsLoading(true);
    setStatusMessage('Memulai pemrosesan model AI Segmentasi Tubuh & Rambut...');

    aiProgress.startProgress([
      { progress: 20, text: 'Memuat model WebAssembly MediaPipe Neural Network...', delayMs: 250 },
      { progress: 50, text: 'Menganalisis kontur subjek, siluet wajah, & helai rambut...', delayMs: 800 },
      { progress: 80, text: 'Menerapkan alpha matting & anti-aliasing tepi...', delayMs: 1500 },
      { progress: 95, text: 'Menggabungkan subjek murni dengan background baru...', delayMs: 2200 },
    ]);

    try {
      let maskSourceCanvas: HTMLCanvasElement | null = null;

      try {
        const segmenter = await getSegmenterInstance();

        // Run MediaPipe Neural Segmentation
        const results = await new Promise<Results>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('MediaPipe timeout')), 12000);
          segmenter.onResults((res: Results) => {
            clearTimeout(timeout);
            resolve(res);
          });
          segmenter.send({ image: originalImage }).catch((e: unknown) => {
            clearTimeout(timeout);
            reject(e);
          });
        });

        if (results && results.segmentationMask) {
          rawMaskRef.current = results.segmentationMask;
          maskSourceCanvas = buildProcessedMask(
            results.segmentationMask,
            originalImage.width,
            originalImage.height,
            tolerance
          );
        }
      } catch (mpErr) {
        console.warn('MediaPipe error, falling back to smart boundary flood-fill matting:', mpErr);
        const fbMask = fallbackSmartSegmentation(originalImage, tolerance);
        rawMaskRef.current = fbMask;
        maskSourceCanvas = fbMask;
      }

      if (maskSourceCanvas) {
        compositeForegroundAndBackground(
          originalImage,
          maskSourceCanvas,
          bgColor,
          isTransparent
        );

        aiProgress.completeProgress(() => {
          setIsProcessed(true);
          setIsLoading(false);
          setStatusMessage('Berhasil! Subjek foto dipisahkan sempurna tanpa distorsi warna.');
        });
      } else {
        throw new Error('Gagal menghasilkan mask segmentasi.');
      }
    } catch (err: unknown) {
      console.error(err);
      aiProgress.resetProgress();
      setIsLoading(false);
      setStatusMessage('Terjadi kendala saat memproses segmentasi. Silakan coba lagi.');
    }
  };

  const handleDownload = () => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = isTransparent ? 'foto-tanpa-background.png' : 'pas-foto-ganti-background.jpg';
    link.href = canvas.toDataURL(isTransparent ? 'image/png' : 'image/jpeg', 0.95);
    link.click();
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Ganti Background Foto & Hapus Background AI Online',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    featureList: 'Ganti warna background pas foto merah biru CPNS dan hapus background transparan akurat dengan AI MediaPipe',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={jsonLd} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full font-bold mb-3 shadow-2xs">
            <Wand2 className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>AI Neural Segmentation &amp; Preservasi Subjek 100%</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Ganti Warna &amp; Hapus Background Foto (AI)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Teknologi AI Computer Vision memisahkan objek manusia dan detail rambut secara presisi tanpa merusak warna pakaian atau wajah asli. Ubah ke latar <b>Merah</b>, <b>Biru</b> CPNS, atau <b>Transparan PNG</b>.
          </p>
        </div>

        {/* Kotak Upload Foto */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Pilih Foto Anda (Pas Foto / Potret / Foto Diri):
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>100% Client-Side WebAssembly: Berkas foto diproses langsung di browser Anda tanpa diunggah ke server mana pun.</span>
          </div>
        </div>

        {selectedFile && (
          <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-6">
            {/* Pilihan Warna Background Baru */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
                1. Pilih Background Baru:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setBgColor(preset.value);
                      setIsTransparent(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                      !isTransparent && bgColor === preset.value
                        ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/40 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <span 
                      className="w-6 h-6 rounded-full border border-slate-300 shrink-0 shadow-inner"
                      style={{ backgroundColor: preset.value }}
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">{preset.label}</span>
                      <span className="text-[10px] text-slate-500">{preset.desc}</span>
                    </div>
                  </button>
                ))}

                {/* Pilihan Transparan */}
                <button
                  type="button"
                  onClick={() => setIsTransparent(true)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                    isTransparent
                      ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/40 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full border border-slate-300 shrink-0 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[size:8px_8px]" />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">Transparan (PNG)</span>
                    <span className="text-[10px] text-slate-500">Hapus Latar Belakang</span>
                  </div>
                </button>
              </div>

              {/* Custom Color Picker */}
              <div className="flex items-center gap-3 pt-2">
                <label className="text-xs font-medium text-slate-600">Pilih Warna Bebas:</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => {
                    setBgColor(e.target.value);
                    setIsTransparent(false);
                  }}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                />
                <span className="text-xs font-mono text-slate-500">{bgColor}</span>
              </div>
            </div>

            {/* Slider Sensitivitas & Kehalusan Tepi */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Sensitivitas &amp; Kehalusan Tepi (Edge Refinement):</span>
                </label>
                <span className="font-mono font-bold text-indigo-600">{tolerance}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="85"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                AI otomatis menjaga detail rambut &amp; pakaian. Geser ke kanan jika ingin tepi lebih rapat, atau ke kiri untuk mempertahankan helai rambut halus.
              </p>
            </div>

            {/* AI Progress Bar */}
            <AIProgressBar
              isGenerating={aiProgress.isGenerating}
              progress={aiProgress.progress}
              phase={aiProgress.phase}
              title="AI Memproses Segmentasi Background"
              className="mb-2"
            />

            {/* Tombol Eksekusi */}
            <button
              onClick={processBackground}
              disabled={isLoading || aiProgress.isGenerating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold py-3.5 px-4 rounded-xl transition duration-200 shadow-sm disabled:bg-slate-300 cursor-pointer flex justify-center items-center gap-2"
            >
              {isLoading || aiProgress.isGenerating ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4 text-white" />
                  <span>Sedang Memproses AI ({aiProgress.progress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Terapkan Warna Background Baru ⚡</span>
                </>
              )}
            </button>

            {/* Area Perbandingan Sebelum & Sesudah */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="text-center">
                <span className="text-xs font-bold text-slate-600 block mb-2">Foto Asli</span>
                <div className="bg-slate-100 rounded-xl p-2 flex items-center justify-center min-h-[220px]">
                  <canvas ref={originalCanvasRef} className="max-h-64 max-w-full rounded-lg object-contain shadow-sm" />
                </div>
              </div>

              <div className="text-center">
                <span className="text-xs font-bold text-slate-600 block mb-2">Hasil Background Baru</span>
                <div className={`rounded-xl p-2 flex items-center justify-center min-h-[220px] ${
                  isTransparent 
                    ? 'bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:12px_12px]'
                    : 'bg-slate-100'
                }`}>
                  <canvas ref={resultCanvasRef} className="max-h-64 max-w-full rounded-lg object-contain shadow-sm" />
                </div>
              </div>
            </div>

            {isProcessed && (
              <div className="pt-2">
                <button
                  onClick={handleDownload}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-md flex justify-center items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Pas Foto Baru ({isTransparent ? 'PNG Transparan' : 'JPG'})</span>
                </button>
              </div>
            )}

            {statusMessage && (
              <p className="text-center text-xs font-medium text-slate-600 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{statusMessage}</span>
              </p>
            )}
          </div>
        )}

        {/* Edukasi Pas Foto CPNS */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 mb-8">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">📌 Ketentuan Background Pas Foto Instansi Resmi:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-100 dark:border-red-900/40">
              <b className="text-red-900 dark:text-red-300 block mb-1">🔴 Background Merah:</b>
              Untuk pelamar/pegawai dengan tahun kelahiran <b>GANJIL</b> (misal: 1995, 1997, 1999, 2001).
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40">
              <b className="text-blue-900 dark:text-blue-300 block mb-1">🔵 Background Biru:</b>
              Untuk pelamar/pegawai dengan tahun kelahiran <b>GENAP</b> (misal: 1996, 1998, 2000, 2002).
            </div>
          </div>
        </div>

        {/* Editorial Section: Panduan, FAQ, AdSense & Hub-Spoke Links */}
        <div className="mt-8">
          <ToolEditorialSection toolId="remove-bg" />
        </div>
      </section>

      <Footer />
    </main>
  );
}


