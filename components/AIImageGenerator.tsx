'use client';

import React, { useState } from 'react';

const PROMPT_SUGGESTIONS = [
  'Brosur promo jualan kopi desain meriah diskon 50%',
  'Poster seminar digital marketing dan AI untuk UMKM 2026',
  'Flyer grand opening restoran kuliner nusantara lezat',
  'Pamflet festival konser musik akustik indie festival',
];

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState('buatkan brosur jualan kopi desainnya lebih meriah');
  const [mode, setMode] = useState<'canvas' | 'ai'>('canvas'); // 'canvas' (Studio Grafis) atau 'ai' (DALL-E 3)
  const [aspectRatio, setAspectRatio] = useState<'square' | 'portrait'>('square');
  const [headline, setHeadline] = useState('');
  const [subHeadline, setSubHeadline] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [themeColor, setThemeColor] = useState<'auto' | 'amber' | 'indigo' | 'emerald' | 'rose' | 'dark'>('auto');
  const [openAiKey, setOpenAiKey] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [providerInfo, setProviderInfo] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Render Poster Grafis Resolusi Tinggi (1080x1080 atau 1080x1350) di Browser
  const generateCanvasPoster = () => {
    const width = 1080;
    const height = aspectRatio === 'square' ? 1080 : 1350;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lowerPrompt = prompt.toLowerCase();

    // Deteksi cerdas tema berdasarkan kata kunci prompt
    let detectedTheme = themeColor;
    if (detectedTheme === 'auto') {
      if (lowerPrompt.includes('kopi') || lowerPrompt.includes('coffee') || lowerPrompt.includes('cafe')) {
        detectedTheme = 'amber';
      } else if (lowerPrompt.includes('kuliner') || lowerPrompt.includes('makan') || lowerPrompt.includes('restoran')) {
        detectedTheme = 'rose';
      } else if (lowerPrompt.includes('seminar') || lowerPrompt.includes('bisnis') || lowerPrompt.includes('teknologi')) {
        detectedTheme = 'indigo';
      } else if (lowerPrompt.includes('sehat') || lowerPrompt.includes('alam') || lowerPrompt.includes('fresh')) {
        detectedTheme = 'emerald';
      } else {
        detectedTheme = 'indigo';
      }
    }

    const palettes = {
      amber: { bg1: '#321405', bg2: '#78350F', accent: '#F59E0B', text: '#FFFFFF', sub: '#FEF3C7', badgeBg: '#D97706', icon: '☕' },
      rose: { bg1: '#500724', bg2: '#9F1239', accent: '#F43F5E', text: '#FFFFFF', sub: '#FFE4E6', badgeBg: '#E11D48', icon: '🍽️' },
      indigo: { bg1: '#0F172A', bg2: '#312E81', accent: '#6366F1', text: '#FFFFFF', sub: '#CBD5E1', badgeBg: '#4F46E5', icon: '🚀' },
      emerald: { bg1: '#064E3B', bg2: '#065F46', accent: '#10B981', text: '#FFFFFF', sub: '#D1FAE5', badgeBg: '#059669', icon: '🌿' },
      dark: { bg1: '#09090B', bg2: '#18181B', accent: '#E4E4E7', text: '#FFFFFF', sub: '#A1A1AA', badgeBg: '#27272A', icon: '⭐' },
    };
    const pal = palettes[detectedTheme as keyof typeof palettes] || palettes.amber;

    // Latar Belakang Gradien Mewah
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, pal.bg1);
    grad.addColorStop(0.5, pal.bg2);
    grad.addColorStop(1, pal.bg1);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Efek Cahaya Radial
    const radial = ctx.createRadialGradient(width * 0.5, height * 0.42, 60, width * 0.5, height * 0.42, 500);
    radial.addColorStop(0, `${pal.accent}44`);
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // Efek Meriah: Hiasan Bintang / Konfeti Melayang jika "meriah" disebutkan
    const isMeriah = lowerPrompt.includes('meriah') || lowerPrompt.includes('ramai') || lowerPrompt.includes('promo');
    if (isMeriah) {
      ctx.fillStyle = `${pal.accent}55`;
      for (let i = 0; i < 35; i++) {
        const rx = (i * 137) % width;
        const ry = (i * 241) % (height - 250);
        const size = (i % 4) + 3;
        ctx.beginPath();
        ctx.arc(rx, ry, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Bingkai Emas / Aksen Mewah
    ctx.strokeStyle = `${pal.accent}66`;
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // 1. Badge Pill Header
    let finalBadge = badgeText;
    if (!finalBadge) {
      if (lowerPrompt.includes('kopi')) finalBadge = '☕ SPESIAL KOPI PILIHAN';
      else if (lowerPrompt.includes('promo') || lowerPrompt.includes('diskon')) finalBadge = '🔥 PENAWARAN TERBATAS';
      else finalBadge = `${pal.icon} PENAWARAN EKSKLUSIF`;
    }

    ctx.font = 'bold 26px Arial, sans-serif';
    const badgeW = ctx.measureText(finalBadge).width + 60;
    const badgeH = 54;
    const badgeX = (width - badgeW) / 2;
    const badgeY = 110;

    ctx.fillStyle = pal.badgeBg;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 27);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(finalBadge, width / 2, badgeY + 36);

    // 2. Ikon Ilustrasi Visual di Tengah
    ctx.font = '84px Arial, sans-serif';
    ctx.fillText(pal.icon, width / 2, 270);

    // 3. Judul Utama (Headline)
    let finalTitle = headline;
    if (!finalTitle) {
      if (lowerPrompt.includes('kopi')) finalTitle = 'CITA RASA KOPI TERBAIK';
      else if (lowerPrompt.includes('seminar')) finalTitle = 'SEMINAR BISNIS DIGITAL';
      else if (lowerPrompt.includes('kuliner')) finalTitle = 'KULINER SPESIAL LEZAT';
      else finalTitle = prompt.slice(0, 40).toUpperCase();
    }

    ctx.font = '900 68px Arial, sans-serif';
    ctx.fillStyle = pal.text;
    ctx.textAlign = 'center';

    const words = finalTitle.split(' ');
    let line = '';
    let curY = 370;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width - 180 && n > 0) {
        ctx.fillText(line.trim(), width / 2, curY);
        line = words[n] + ' ';
        curY += 82;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), width / 2, curY);

    // Garis Aksen Pembagi
    curY += 30;
    ctx.fillStyle = pal.accent;
    ctx.fillRect((width - 160) / 2, curY, 160, 6);

    // 4. Subjudul / Deskripsi Konsep
    curY += 65;
    let finalDesc = subHeadline;
    if (!finalDesc) {
      if (lowerPrompt.includes('kopi')) {
        finalDesc = 'Dibuat dari 100% biji kopi murni dengan aroma semerbak dan racikan barista profesional. Nikmati kehangatan dan kesegarannya setiap hari!';
      } else {
        finalDesc = prompt;
      }
    }

    ctx.font = 'normal 32px Arial, sans-serif';
    ctx.fillStyle = pal.sub;

    const descWords = finalDesc.split(' ');
    let descLine = '';
    for (let i = 0; i < descWords.length; i++) {
      const test = descLine + descWords[i] + ' ';
      if (ctx.measureText(test).width > width - 220 && i > 0) {
        ctx.fillText(descLine.trim(), width / 2, curY);
        descLine = descWords[i] + ' ';
        curY += 48;
      } else {
        descLine = test;
      }
    }
    ctx.fillText(descLine.trim(), width / 2, curY);

    // 5. Tombol Call To Action (CTA) di Bawah
    const ctaY = height - 210;
    const ctaW = width - 180;
    const ctaH = 92;
    const ctaX = (width - ctaW) / 2;

    ctx.fillStyle = pal.accent;
    ctx.beginPath();
    ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 22);
    ctx.fill();

    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('PESAN SEKARANG & DAPATKAN PROMO ⚡', width / 2, ctaY + 58);

    // Footer Watermark
    ctx.font = 'normal 20px Arial, sans-serif';
    ctx.fillStyle = `${pal.sub}99`;
    ctx.fillText('Didesain dengan KompresKilat Studio • kompreskilat.site', width / 2, height - 60);

    const dataUrl = canvas.toDataURL('image/png', 0.95);
    setGeneratedImageUrl(dataUrl);
    setProviderInfo('Studio Desain Grafis KompresKilat (Resolusi Tajam 1080p)');
    setIsLoading(false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      setErrorMessage('Deskripsi konsep poster/brosur tidak boleh kosong.');
      return;
    }

    // Jika pengguna di mode OpenAI DALL-E 3 tetapi belum mengisi Kunci API
    if (mode === 'ai' && !openAiKey.trim()) {
      setErrorMessage(
        '⚠️ Kunci API OpenAI belum diisi. Masukkan kunci API OpenAI Anda (sk-...) pada kotak di bawah, atau beralih ke tab "⚡ Studio Desain Grafis" untuk membuat poster instan tanpa perlu kunci!'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setGeneratedImageUrl(null);

    // Mode 1: Studio Grafis Otomatis (100% Bebas Limit)
    if (mode === 'canvas') {
      setTimeout(() => {
        generateCanvasPoster();
      }, 500);
      return;
    }

    // Mode 2: OpenAI DALL-E 3 Resmi
    try {
      const response = await fetch('/api/ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cleanPrompt,
          action: 'generate',
          apiKey: openAiKey.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setProviderInfo(data.provider || 'OpenAI DALL-E 3 Resmi');
      } else {
        setErrorMessage(data.message || 'Gagal memanggil OpenAI DALL-E 3.');
      }
    } catch {
      setErrorMessage('Terjadi kendala jaringan saat memproses permintaan ke OpenAI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    setIsDownloading(true);

    try {
      const a = document.createElement('a');
      a.href = generatedImageUrl;
      a.download = `poster_kopi_${Date.now()}.png`;
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

        {/* Tab Pilihan Mode */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('canvas');
              setErrorMessage('');
            }}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'canvas'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>⚡ Studio Desain Grafis</span>
            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.2 rounded font-semibold">Gratis &amp; Bebas Limit</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('ai');
              setErrorMessage('');
            }}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'ai'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🤖 OpenAI DALL-E 3</span>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-semibold">Butuh Kunci API</span>
          </button>
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
          </div>

          {/* Pengaturan Tambahan untuk Mode Studio Desain Grafis */}
          {mode === 'canvas' && (
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 block">
                🛠️ Opsi Kustomisasi Teks &amp; Warna (Opsional):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Judul Utama:</label>
                  <input
                    type="text"
                    placeholder="Otomatis dari prompt atau ketik judul..."
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Teks Badge Atas:</label>
                  <input
                    type="text"
                    placeholder="Contoh: ☕ DISKON SPESIAL 50%"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Kotak Input Wajib untuk OpenAI DALL-E 3 */}
          {mode === 'ai' && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-purple-900">
                🔑 Masukkan Kunci API OpenAI DALL-E 3 Anda:
              </label>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={openAiKey}
                onChange={(e) => {
                  setOpenAiKey(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full px-3 py-2 text-xs border border-purple-300 rounded-lg bg-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-[11px] text-purple-700 leading-relaxed">
                DALL-E 3 adalah layanan berbayar resmi dari OpenAI. Dapatkan kunci Anda di <b>platform.openai.com/api-keys</b>. Kunci hanya tersimpan sementara di peramban Anda.
              </p>
            </div>
          )}

          {/* Format Ukuran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Rasio Ukuran:
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
                <span>Sedang Merancang Desain Poster Resolusi Tinggi...</span>
              </>
            ) : (
              <span>Rancang Poster &amp; Brosur Sekarang ⚡</span>
            )}
          </button>
        </form>

        {/* Notifikasi Pesan Error */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <span>⚠️</span>
              <span className="font-semibold">{errorMessage}</span>
            </div>
            {mode === 'ai' && (
              <button
                type="button"
                onClick={() => {
                  setMode('canvas');
                  setErrorMessage('');
                }}
                className="self-start text-[11px] font-bold text-indigo-700 underline cursor-pointer"
              >
                ➔ Alihkan ke "Studio Desain Grafis" (Gratis &amp; Langsung Jadi)
              </button>
            )}
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
