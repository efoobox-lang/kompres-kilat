'use client';

import React, { useState } from 'react';

const PROMPT_SUGGESTIONS = [
  'Brosur promo jualan kopi desain meriah diskon 50%',
  'Poster seminar digital marketing dan AI untuk UMKM 2026',
  'Flyer grand opening restoran kuliner nusantara lezat',
  'Pamflet festival konser musik akustik indie festival',
];

interface DesignData {
  headline: string;
  badge: string;
  subheadline: string;
  bulletPoints?: string[];
  callToAction: string;
  colorPalette: 'amber' | 'rose' | 'indigo' | 'emerald' | 'dark';
  iconEmoji: string;
}

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState('buatkan brosur jualan kopi desainnya lebih meriah');
  const [aspectRatio, setAspectRatio] = useState<'square' | 'portrait'>('square');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [providerInfo, setProviderInfo] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Unggah foto atau logo produk kustom
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Harap unggah berkas gambar yang valid (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran gambar maksimal 5 MB.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setUploadedFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedFileName('');
  };

  // Render Poster Grafis Resolusi Tinggi (1080x1080 atau 1080x1350) di Browser
  const renderPosterCanvas = async (design: DesignData, customImgSrc?: string | null) => {
    const width = 1080;
    const height = aspectRatio === 'square' ? 1080 : 1350;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load gambar custom jika pengguna mengunggah logo/foto
    const targetImgSrc = customImgSrc !== undefined ? customImgSrc : uploadedImage;
    let loadedCustomImg: HTMLImageElement | null = null;
    if (targetImgSrc) {
      try {
        loadedCustomImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = targetImgSrc;
        });
      } catch (err) {
        console.warn('Gagal memuat visual logo/foto:', err);
      }
    }

    const palettes = {
      amber: { bg1: '#321405', bg2: '#78350F', accent: '#F59E0B', text: '#FFFFFF', sub: '#FEF3C7', badgeBg: '#D97706' },
      rose: { bg1: '#500724', bg2: '#9F1239', accent: '#F43F5E', text: '#FFFFFF', sub: '#FFE4E6', badgeBg: '#E11D48' },
      indigo: { bg1: '#0F172A', bg2: '#312E81', accent: '#6366F1', text: '#FFFFFF', sub: '#CBD5E1', badgeBg: '#4F46E5' },
      emerald: { bg1: '#064E3B', bg2: '#065F46', accent: '#10B981', text: '#FFFFFF', sub: '#D1FAE5', badgeBg: '#059669' },
      dark: { bg1: '#09090B', bg2: '#18181B', accent: '#E4E4E7', text: '#FFFFFF', sub: '#A1A1AA', badgeBg: '#27272A' },
    };
    const pal = palettes[design.colorPalette] || palettes.amber;

    // Latar Belakang Gradien
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, pal.bg1);
    grad.addColorStop(0.5, pal.bg2);
    grad.addColorStop(1, pal.bg1);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Efek Cahaya Radial
    const radial = ctx.createRadialGradient(width * 0.5, height * 0.38, 50, width * 0.5, height * 0.38, 550);
    radial.addColorStop(0, `${pal.accent}55`);
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // Hiasan Partikel Meriah
    ctx.fillStyle = `${pal.accent}44`;
    for (let i = 0; i < 40; i++) {
      const rx = (i * 127) % width;
      const ry = (i * 223) % (height - 250);
      const size = (i % 4) + 3;
      ctx.beginPath();
      ctx.arc(rx, ry, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bingkai Luar Elegan
    ctx.strokeStyle = `${pal.accent}77`;
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // 1. Badge Pill Header
    const badgeText = (design.badge || 'PENAWARAN SPESIAL').toUpperCase();
    ctx.font = 'bold 26px Arial, sans-serif';
    const badgeW = ctx.measureText(badgeText).width + 60;
    const badgeH = 54;
    const badgeX = (width - badgeW) / 2;
    const badgeY = 100;

    ctx.fillStyle = pal.badgeBg;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 27);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, width / 2, badgeY + 36);

    // 2. Visual Centerpiece: Foto / Logo Kustom atau Ikon Emoji
    let headlineStartY = 350;

    if (loadedCustomImg) {
      const imgSize = aspectRatio === 'square' ? 180 : 210;
      const imgX = (width - imgSize) / 2;
      const imgY = 175;

      // Card latar belakang foto dengan bayangan halus
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgSize, imgSize, 24);
      ctx.fill();
      ctx.restore();

      // Masking / Clip gambar di dalam rounded frame
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgSize, imgSize, 24);
      ctx.clip();

      const hRatio = imgSize / loadedCustomImg.width;
      const vRatio = imgSize / loadedCustomImg.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShiftX = (imgSize - loadedCustomImg.width * ratio) / 2;
      const centerShiftY = (imgSize - loadedCustomImg.height * ratio) / 2;

      ctx.drawImage(
        loadedCustomImg,
        0,
        0,
        loadedCustomImg.width,
        loadedCustomImg.height,
        imgX + centerShiftX,
        imgY + centerShiftY,
        loadedCustomImg.width * ratio,
        loadedCustomImg.height * ratio
      );
      ctx.restore();

      // Border ring aksen elegan
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgSize, imgSize, 24);
      ctx.stroke();

      headlineStartY = imgY + imgSize + 52;
    } else {
      ctx.font = '86px Arial, sans-serif';
      ctx.fillText(design.iconEmoji || '✨', width / 2, 260);
      headlineStartY = 350;
    }

    // 3. Judul Utama (Headline)
    ctx.font = loadedCustomImg ? '900 56px Arial, sans-serif' : '900 64px Arial, sans-serif';
    ctx.fillStyle = pal.text;
    ctx.textAlign = 'center';

    const words = design.headline.toUpperCase().split(' ');
    let line = '';
    let curY = headlineStartY;
    const lineHeight = loadedCustomImg ? 68 : 78;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width - 180 && n > 0) {
        ctx.fillText(line.trim(), width / 2, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), width / 2, curY);

    // Garis Aksen Emas
    curY += 25;
    ctx.fillStyle = pal.accent;
    ctx.fillRect((width - 160) / 2, curY, 160, 6);

    // 4. Subjudul / Keterangan Persuasif
    curY += 55;
    ctx.font = 'normal 30px Arial, sans-serif';
    ctx.fillStyle = pal.sub;

    const descWords = design.subheadline.split(' ');
    let descLine = '';
    for (let i = 0; i < descWords.length; i++) {
      const test = descLine + descWords[i] + ' ';
      if (ctx.measureText(test).width > width - 220 && i > 0) {
        ctx.fillText(descLine.trim(), width / 2, curY);
        descLine = descWords[i] + ' ';
        curY += 44;
      } else {
        descLine = test;
      }
    }
    ctx.fillText(descLine.trim(), width / 2, curY);

    // 5. Poin-Poin Keunggulan (Bullet Points) jika ada
    if (design.bulletPoints && design.bulletPoints.length > 0 && aspectRatio === 'portrait') {
      curY += 40;
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      design.bulletPoints.slice(0, 3).forEach((bp) => {
        ctx.fillText(`✓ ${bp}`, width / 2, curY);
        curY += 36;
      });
    }

    // 6. Tombol Call To Action (CTA)
    const ctaY = height - 190;
    const ctaW = width - 180;
    const ctaH = 88;
    const ctaX = (width - ctaW) / 2;

    ctx.fillStyle = pal.accent;
    ctx.beginPath();
    ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 22);
    ctx.fill();

    ctx.font = 'bold 34px Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(design.callToAction || 'PESAN SEKARANG VIA WA ⚡', width / 2, ctaY + 56);

    // Footer Watermark
    ctx.font = 'normal 20px Arial, sans-serif';
    ctx.fillStyle = `${pal.sub}99`;
    ctx.fillText('Didesain Cerdas dengan KompresKilat Studio • kompreskilat.site', width / 2, height - 50);

    const dataUrl = canvas.toDataURL('image/png', 0.95);
    setGeneratedImageUrl(dataUrl);
    setProviderInfo('Google Gemini (AI Studio) + KompresKilat Visual Studio');
    setIsLoading(false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      setErrorMessage('Deskripsi konsep poster/brosur tidak boleh kosong.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setGeneratedImageUrl(null);

    try {
      const response = await fetch('/api/ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cleanPrompt,
          action: 'generate',
          hasUploadedImage: Boolean(uploadedImage),
          uploadedImageName: uploadedFileName,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.designData) {
        await renderPosterCanvas(data.designData);
      } else {
        setErrorMessage(data.message || 'Gagal memproses desain poster.');
        setIsLoading(false);
      }
    } catch {
      setErrorMessage('Terjadi kendala jaringan saat menghubungi generator.');
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    setIsDownloading(true);

    try {
      const a = document.createElement('a');
      a.href = generatedImageUrl;
      a.download = `poster_desain_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(generatedImageUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎨</span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              AI Poster &amp; Brosur Studio
            </h2>
            <p className="text-xs text-slate-500">
              Rancang materi promosi, flyer diskon, dan pamflet bisnis beresolusi tinggi (1080p) siap cetak dan siap posting.
            </p>
          </div>
        </div>

        {/* Info Mesin AI */}
        <div className="p-2 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800 ml-1">
              ✨ Ditenagai oleh: <b>Google Gemini (AI Studio)</b>
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              Siap Cetak 1080p HD
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">100% Gratis &amp; Transparan</span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prompt Deskripsi Visual / Konsep Brosur:
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: buatkan brosur jualan kopi desainnya lebih meriah..."
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full px-4 py-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
              required
            />
            {/* Saran Ide Prompt Cepat */}
            <div className="mt-2 flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-slate-500 font-semibold mr-1">Contoh Cepat:</span>
              {PROMPT_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(sug)}
                  className="text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-2 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Fitur Unggah Foto Produk / Logo Brand */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sisipkan Foto Produk atau Logo Brand (Opsional):
            </label>
            {!uploadedImage ? (
              <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/40 rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition text-center group bg-slate-50/50">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-2 text-slate-600 group-hover:text-indigo-600 transition">
                  <span className="text-xl">📸</span>
                  <span className="text-xs font-bold">Pilih Foto Produk / Logo Merek</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Format PNG, JPG, WebP (Maks. 5MB) • Otomatis dipadukan ke dalam poster &amp; brosur AI
                </p>
              </label>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-indigo-50/80 border border-indigo-200 rounded-xl">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uploadedImage}
                    alt="Pratinjau Foto Produk"
                    className="w-12 h-12 object-cover rounded-lg border border-indigo-200 bg-white shadow-xs"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[180px] sm:max-w-xs">
                      {uploadedFileName || 'Foto Produk Tersemat'}
                    </p>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                      ✓ Foto Siap Dipadukan ke Desain AI
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 rounded-lg transition cursor-pointer"
                >
                  Ganti / Hapus
                </button>
              </div>
            )}
          </div>

          {/* Format Ukuran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Rasio Ukuran Desain:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAspectRatio('square')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition cursor-pointer text-center ${
                  aspectRatio === 'square'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Persegi 1:1 (Feed Instagram / WA)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('portrait')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition cursor-pointer text-center ${
                  aspectRatio === 'portrait'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Vertikal 4:5 (Brosur / Flyer Story)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl transition duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>AI Sedang Merancang Tata Letak &amp; Desain Brosur...</span>
              </>
            ) : (
              <span>Rancang Poster &amp; Brosur Sekarang ⚡</span>
            )}
          </button>
        </form>

        {/* Notifikasi Pesan Error */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <span>⚠️</span>
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Area Pratinjau & Tombol Unduh */}
      {generatedImageUrl && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                ✓ Desain Berhasil Digenerate
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Ditenagai oleh: <b>{providerInfo}</b>
              </p>
            </div>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              {isDownloading ? 'Sedang Menyimpan...' : '📥 Unduh Gambar Poster HD (.png)'}
            </button>
          </div>

          <div className="flex justify-center items-center bg-slate-900/5 border border-slate-200 rounded-2xl p-4 overflow-hidden min-h-[300px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedImageUrl}
              alt="Hasil Desain Poster"
              className="max-h-[580px] max-w-full rounded-xl shadow-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
