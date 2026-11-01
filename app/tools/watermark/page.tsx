'use client';

import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';

export default function WatermarkPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('DOKUMEN RAHASIA / WATERMARK');
  const [opacity, setOpacity] = useState(0.35);
  const [fontSize, setFontSize] = useState(36);
  const [watermarkColor, setWatermarkColor] = useState('#DC2626');
  const [position, setPosition] = useState<'center' | 'diagonal' | 'bottom-right'>('diagonal');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const img = new Image();
      img.onload = () => {
        originalImageRef.current = img;
        applyWatermark(img, watermarkText, opacity, fontSize, watermarkColor, position);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const applyWatermark = (
    img: HTMLImageElement,
    text: string,
    op: number,
    size: number,
    color: string,
    pos: 'center' | 'diagonal' | 'bottom-right'
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    // Gambar gambar asli
    ctx.drawImage(img, 0, 0);

    // Konfigurasi Watermark Teks
    ctx.save();
    ctx.globalAlpha = op;
    ctx.fillStyle = color;
    ctx.font = `bold ${size}px Arial, sans-serif`;

    if (pos === 'diagonal') {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 0);
    } else if (pos === 'center') {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    } else {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(text, canvas.width - 30, canvas.height - 30);
    }
    ctx.restore();

    setPreviewUrl(canvas.toDataURL('image/jpeg', 0.9));
  };

  const handleUpdate = () => {
    if (originalImageRef.current) {
      applyWatermark(originalImageRef.current, watermarkText, opacity, fontSize, watermarkColor, position);
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `watermarked_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Beri Watermark Foto & Dokumen Online - KompresKilat',
    description: 'Bubuhkan teks hak cipta, cap rahasia, atau logo watermark transparan pada gambar Anda secara gratis.',
    applicationCategory: 'MultimediaApplication',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={schema} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold mb-2">
            🛡️ Proteksi Hak Cipta &amp; Keamanan Berkas
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            Bubuh Watermark pada Gambar &amp; Dokumen
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Lindungi identitas berkas penting Anda dari pencurian data dengan cap transparan custom.
          </p>
        </div>

        {!selectedFile ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl border-2 border-dashed border-slate-300 text-center hover:border-indigo-500 transition mb-8 shadow-sm">
            <input type="file" accept="image/*" id="watermarkFile" onChange={handleFileChange} className="hidden" />
            <label htmlFor="watermarkFile" className="cursor-pointer block">
              <div className="text-4xl sm:text-5xl mb-3">🛡️</div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">Pilih Gambar / Dokumen</h3>
              <p className="text-xs text-slate-500 mb-4">Mendukung format JPG, PNG, dan WebP</p>
              <span className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition">
                Pilih Berkas ⚡
              </span>
            </label>
          </div>
        ) : (
          <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 flex flex-col items-center justify-center bg-slate-100 p-4 rounded-xl border border-slate-200 overflow-hidden">
              <canvas ref={canvasRef} className="max-h-[360px] max-w-full rounded shadow-sm border border-slate-300 bg-white" />
            </div>

            <div className="md:col-span-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Teks Watermark:</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => {
                    setWatermarkText(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transparansi ({Math.round(opacity * 100)}%):</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ukuran Huruf ({fontSize}px):</label>
                  <input
                    type="range"
                    min="18"
                    max="96"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Warna Cap:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={watermarkColor}
                      onChange={(e) => setWatermarkColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                    />
                    <span className="font-mono text-slate-500 uppercase">{watermarkColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Posisi Watermark:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'diagonal' as const, label: 'Diagonal Miring' },
                    { id: 'center' as const, label: 'Tengah' },
                    { id: 'bottom-right' as const, label: 'Sudut Bawah' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPosition(p.id)}
                      className={`py-2 px-2 text-center rounded-xl border font-bold transition ${
                        position === p.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleUpdate}
                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2.5 rounded-xl border border-indigo-200 transition"
              >
                🔄 Perbarui Tampilan Watermark
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition shadow-sm text-center"
              >
                📥 Unduh Gambar Ber-watermark
              </button>
            </div>
          </div>
        )}

        <AdBanner zone="in-tool" label="Iklan" />
      </section>

      <Footer />
    </main>
  );
}

