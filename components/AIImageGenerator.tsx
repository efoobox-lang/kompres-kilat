'use client';

import React, { useState } from 'react';

const PROMPT_SUGGESTIONS = [
  'Brosur promo diskon 50% kedai kopi kekinian dengan desain modern minimalis dan aksen kayu hangat',
  'Poster seminar digital marketing dan AI untuk UMKM 2026 dengan palet warna navy neon futuristik',
  'Flyer grand opening restoran kuliner nusantara dengan sajian menggugah selera dan tipografi elegan',
  'Pamflet teaser konser musik akustik indie festival di bawah gemerlap lampu malam',
];

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'square' | 'portrait' | 'landscape'>('square');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [providerInfo, setProviderInfo] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      setErrorMessage('Deskripsi poster atau brosur tidak boleh kosong. Masukkan ide konsep Anda.');
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
          aspectRatio,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setProviderInfo(data.provider || 'AI Visual Engine');
      } else {
        setErrorMessage(data.message || 'Gagal membuat poster AI. Silakan coba lagi.');
      }
    } catch {
      setErrorMessage('Terjadi kendala jaringan saat memproses gambar AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImageUrl) return;
    setIsDownloading(true);

    try {
      const res = await fetch(generatedImageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `poster_ai_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback direct link
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
              AI Poster &amp; Brosur Generator
            </h2>
            <p className="text-xs text-slate-500">
              Buat desain visual promosi, brosur marketing, pamflet event, atau teaser produk secara otomatis.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsikan Konsep Desain Poster / Brosur Anda:
            </label>
            <textarea
              rows={4}
              placeholder="Contoh: Desain poster promosi kopi susu gula aren dengan latar belakang cafe minimalis, tipografi tegas warna krem dan cokelat gelap..."
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full px-4 py-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
              required
            />
          </div>

          {/* Rekomendasi Prompt Cepat */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              💡 Rekomendasi Ide Cepat:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(s)}
                  className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 transition text-left cursor-pointer"
                >
                  {s.slice(0, 45)}...
                </button>
              ))}
            </div>
          </div>

          {/* Pilihan Rasio Format Desain */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Format Ukuran &amp; Rasio Desain:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAspectRatio('square')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition cursor-pointer text-center ${
                  aspectRatio === 'square'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Persegi 1:1 (Feed IG)
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
                Vertikal 9:16 (Story / Pamflet)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('landscape')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition cursor-pointer text-center ${
                  aspectRatio === 'landscape'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Horizontal 16:9 (Banner Web)
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
                <span>AI Sedang Merancang Poster &amp; Brosur Anda...</span>
              </>
            ) : (
              <span>Buat Desain Poster AI Sekarang 🎨</span>
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
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              {isDownloading ? 'Sedang Mengunduh...' : '📥 Unduh Desain Poster (.png)'}
            </button>
          </div>

          <div className="flex justify-center items-center bg-slate-900/5 border border-slate-200 rounded-2xl p-4 overflow-hidden min-h-[300px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedImageUrl}
              alt="Hasil Desain Poster AI"
              className="max-h-[550px] max-w-full rounded-xl shadow-md object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
