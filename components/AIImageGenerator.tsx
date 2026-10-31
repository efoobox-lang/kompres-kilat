'use client';

import React, { useState, useRef } from 'react';

const PROMPT_SUGGESTIONS = [
  'Brosur promo diskon 50% kedai kopi kekinian dengan desain modern minimalis dan aksen kayu hangat',
  'Poster seminar digital marketing dan AI untuk UMKM 2026 dengan palet warna navy neon futuristik',
  'Flyer grand opening restoran kuliner nusantara dengan sajian menggugah selera dan tipografi elegan',
  'Pamflet teaser konser musik akustik indie festival di bawah gemerlap lampu malam',
];

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'canvas' | 'ai'>('canvas'); // 'canvas' (Studio Desain Grafis) atau 'ai' (DALL-E 3)
  const [aspectRatio, setAspectRatio] = useState<'square' | 'portrait'>('square');
  const [headline, setHeadline] = useState('');
  const [subHeadline, setSubHeadline] = useState('');
  const [badgeText, setBadgeText] = useState('PROMO SPESIAL');
  const [themeColor, setThemeColor] = useState<'indigo' | 'amber' | 'emerald' | 'rose' | 'dark'>('indigo');
  const [openAiKey, setOpenAiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [providerInfo, setProviderInfo] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render Poster Grafis Resolusi Tinggi (1080x1080 atau 1080x1350) di Browser
  const generateCanvasPoster = () => {
    const width = 1080;
    const height = aspectRatio === 'square' ? 1080 : 1350;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Palet Warna Tema
    const palettes = {
      indigo: { bg1: '#0F172A', bg2: '#312E81', accent: '#6366F1', text: '#FFFFFF', sub: '#CBD5E1', badgeBg: '#4F46E5' },
      amber: { bg1: '#451A03', bg2: '#78350F', accent: '#F59E0B', text: '#FFFFFF', sub: '#FEF3C7', badgeBg: '#D97706' },
      emerald: { bg1: '#064E3B', bg2: '#065F46', accent: '#10B981', text: '#FFFFFF', sub: '#D1FAE5', badgeBg: '#059669' },
      rose: { bg1: '#881337', bg2: '#9F1239', accent: '#F43F5E', text: '#FFFFFF', sub: '#FFE4E6', badgeBg: '#E11D48' },
      dark: { bg1: '#000000', bg2: '#18181B', accent: '#A1A1AA', text: '#FFFFFF', sub: '#A1A1AA', badgeBg: '#27272A' },
    };
    const pal = palettes[themeColor];

    // Background Gradient Mewah
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, pal.bg1);
    grad.addColorStop(0.6, pal.bg2);
    grad.addColorStop(1, pal.bg1);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Efek Lingkaran Glow Latar
    const radial = ctx.createRadialGradient(width * 0.5, height * 0.4, 50, width * 0.5, height * 0.4, 450);
    radial.addColorStop(0, `${pal.accent}33`);
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // Frame Border Elegan
    ctx.strokeStyle = `${pal.accent}40`;
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Header Badge Pill
    const badgeStr = (badgeText || 'PENAWARAN SPESIAL').toUpperCase();
    ctx.font = 'bold 24px Arial, sans-serif';
    const badgeMetrics = ctx.measureText(badgeStr);
    const badgeW = badgeMetrics.width + 60;
    const badgeH = 50;
    const badgeX = (width - badgeW) / 2;
    const badgeY = 120;

    ctx.fillStyle = pal.badgeBg;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 25);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(badgeStr, width / 2, badgeY + 34);

    // Judul Utama (Headline)
    const titleText = headline || prompt.slice(0, 50) || 'PROMO SPESIAL BISNIS ANDA';
    ctx.font = '900 64px Arial, sans-serif';
    ctx.fillStyle = pal.text;
    ctx.textAlign = 'center';

    // Word Wrap untuk Judul
    const words = titleText.split(' ');
    let line = '';
    let curY = 280;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width - 160 && n > 0) {
        ctx.fillText(line.trim(), width / 2, curY);
        line = words[n] + ' ';
        curY += 80;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), width / 2, curY);

    // Garis Aksen Pemisah
    curY += 30;
    ctx.fillStyle = pal.accent;
    ctx.fillRect((width - 140) / 2, curY, 140, 6);

    // Subjudul / Deskripsi Konsep
    curY += 60;
    const descText = subHeadline || prompt || 'Dapatkan potongan harga menarik dan produk berkualitas tinggi sekarang juga. Syarat dan ketentuan berlaku.';
    ctx.font = 'normal 32px Arial, sans-serif';
    ctx.fillStyle = pal.sub;

    const descWords = descText.split(' ');
    let descLine = '';
    for (let i = 0; i < descWords.length; i++) {
      const test = descLine + descWords[i] + ' ';
      if (ctx.measureText(test).width > width - 200 && i > 0) {
        ctx.fillText(descLine.trim(), width / 2, curY);
        descLine = descWords[i] + ' ';
        curY += 46;
      } else {
        descLine = test;
      }
    }
    ctx.fillText(descLine.trim(), width / 2, curY);

    // Kotak Call To Action (CTA) di Bagian Bawah
    const ctaY = height - 200;
    const ctaW = width - 180;
    const ctaH = 90;
    const ctaX = (width - ctaW) / 2;

    ctx.fillStyle = pal.accent;
    ctx.beginPath();
    ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 20);
    ctx.fill();

    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('HUBUNGI KAMI / PESAN SEKARANG ⚡', width / 2, ctaY + 58);

    // Watermark / Brand Footer
    ctx.font = 'normal 20px Arial, sans-serif';
    ctx.fillStyle = `${pal.sub}99`;
    ctx.fillText('Dibuat Otomatis dengan KompresKilat Studio • kompreskilat.site', width / 2, height - 60);

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

    setIsLoading(true);
    setErrorMessage('');
    setGeneratedImageUrl(null);

    // Jika memilih Mode Desain Grafis Otomatis (Selalu Tajam & 100% Bebas Kuota)
    if (mode === 'canvas') {
      setTimeout(() => {
        generateCanvasPoster();
      }, 500);
      return;
    }

    // Jika memilih Mode AI OpenAI DALL-E 3
    try {
      const response = await fetch('/api/ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cleanPrompt,
          action: 'generate',
          aspectRatio,
          apiKey: openAiKey.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setProviderInfo(data.provider || 'AI Visual Studio');
      } else {
        setErrorMessage(data.message || 'Gagal memproses gambar AI. Silakan coba kembali.');
      }
    } catch {
      setErrorMessage('Terjadi kendala jaringan saat memproses gambar AI.');
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
      a.download = `poster_kompreskilat_${Date.now()}.png`;
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
      {/* Formulir Generator */}
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

        {/* Pilihan Mesin Pembuatan */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setMode('canvas')}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'canvas'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>⚡ Studio Desain Grafis</span>
            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.2 rounded font-semibold">Bebas Limit</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'ai'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🤖 OpenAI DALL-E 3</span>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-semibold">Fotorealistik</span>
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {mode === 'canvas' ? 'Deskripsi Konsep / Materi Poster:' : 'Prompt Deskripsi Visual AI:'}
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Promo Kopi Susu Aren Beli 1 Gratis 1 Khusus Hari Jumat, Rasa Nikmat dan Asli Biji Kopi Pilihan..."
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full px-4 py-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
              required
            />
          </div>

          {/* Pengaturan Tambahan untuk Studio Grafis */}
          {mode === 'canvas' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Judul Utama (Headline):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PROMO SPESIAL KOPI"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Label Badge Promosi:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: DISKON HINGGA 50%"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Palet Warna Tema:
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'indigo', name: 'Navy Modern', color: 'bg-indigo-600' },
                    { id: 'amber', name: 'Warm Coffee', color: 'bg-amber-600' },
                    { id: 'emerald', name: 'Fresh Green', color: 'bg-emerald-600' },
                    { id: 'rose', name: 'Bold Red', color: 'bg-rose-600' },
                    { id: 'dark', name: 'Luxury Black', color: 'bg-slate-900' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setThemeColor(t.id as any)}
                      className={`flex-1 py-1.5 px-2 text-[10px] font-semibold rounded-lg border transition cursor-pointer text-center ${
                        themeColor === t.id
                          ? 'border-indigo-600 ring-2 ring-indigo-500 bg-white font-bold text-slate-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${t.color} mr-1 align-middle`} />
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Opsi Kunci API OpenAI untuk Mode DALL-E 3 */}
          {mode === 'ai' && (
            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-purple-900">
                  🔑 Kunci API OpenAI DALL-E 3 (Opsional)
                </span>
                <button
                  type="button"
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className="text-[11px] text-purple-700 font-bold hover:underline cursor-pointer"
                >
                  {showKeyInput ? 'Sembunyikan' : 'Masukkan Kunci Pribadi'}
                </button>
              </div>
              {showKeyInput && (
                <input
                  type="password"
                  placeholder="sk-proj-..."
                  value={openAiKey}
                  onChange={(e) => setOpenAiKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-purple-300 rounded-lg bg-white font-mono"
                />
              )}
              <p className="text-[10px] text-purple-600">
                Jika tidak diisi, sistem menggunakan server visual cloud cadangan.
              </p>
            </div>
          )}

          {/* Format Ukuran Desain */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Rasio Format Desain:
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
                Persegi 1:1 (Feed Instagram / WhatsApp)
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

        {/* Notifikasi Error */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
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
              alt="Hasil Desain Poster AI"
              className="max-h-[580px] max-w-full rounded-xl shadow-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
