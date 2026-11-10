'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolEditorialSection from '@/components/ToolEditorialSection';
import JsonLd from '@/components/JsonLd';
import QRCode from 'qrcode';
import { Download, Copy, Check, Sparkles } from 'lucide-react';

export default function QrGeneratorPage() {
  const [qrType, setQrType] = useState<'url' | 'whatsapp' | 'text' | 'wifi'>('url');
  const [content, setContent] = useState('https://kompreskilat.site');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrResolution, setQrResolution] = useState(1000);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render QR Code di Canvas secara offline
  const renderCanvas = useCallback(async () => {
    if (!canvasRef.current || !content.trim()) return;
    try {
      await QRCode.toCanvas(canvasRef.current, content, {
        width: 260,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorLevel,
      });
    } catch (err) {
      console.error('Gagal render canvas QR:', err);
    }
  }, [content, fgColor, bgColor, errorLevel]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleDownload = async () => {
    try {
      const offscreen = document.createElement('canvas');
      await QRCode.toCanvas(offscreen, content, {
        width: qrResolution,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorLevel,
      });
      const dataUrl = offscreen.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `QRCode_KompresKilat_${qrResolution}px_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Gagal download QR:', err);
    }
  };

  const handleCopyImage = async () => {
    try {
      const offscreen = document.createElement('canvas');
      await QRCode.toCanvas(offscreen, content, {
        width: 600,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      });
      offscreen.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (err) {
      console.error('Gagal salin QR:', err);
    }
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'QR Code Generator Kustom Online Gratis - KompresKilat',
    description: 'Buat kode QR kustom untuk link web, nomor WhatsApp, teks, dan jaringan WiFi beresolusi tinggi di browser.',
    applicationCategory: 'UtilityApplication',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <JsonLd data={schema} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-xs px-3.5 py-1 rounded-full font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Generator Kode QR Cepat &amp; Gratis
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            QR Code Generator Kustom Online
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Hasilkan barcode QR untuk link website, chat WhatsApp otomatis, dan WiFi resolusi tinggi siap cetak atau tempel di kemasan bisnis Anda.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Kolom Input Form */}
          <div className="md:col-span-7 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Tipe Kode QR:</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'url', label: '🔗 Link Web' },
                  { id: 'whatsapp', label: '💬 WhatsApp' },
                  { id: 'text', label: '📝 Teks Bebas' },
                  { id: 'wifi', label: '📶 Jaringan WiFi' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setQrType(t.id as 'url' | 'whatsapp' | 'text' | 'wifi');
                      if (t.id === 'whatsapp') setContent('https://wa.me/6281234567890?text=Halo%20Admin');
                      else if (t.id === 'url') setContent('https://kompreskilat.site');
                    }}
                    className={`py-2 px-1 text-center rounded-xl border font-semibold transition cursor-pointer ${
                      qrType === t.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {qrType === 'url' ? 'Alamat URL / Website:' : qrType === 'whatsapp' ? 'Tautan WhatsApp Chat:' : 'Isi Konten QR:'}
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Masukkan konten atau link di sini..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
              />
            </div>

            {/* Warna & Resolusi */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Warna Barcode:</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-9 w-12 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                  />
                  <span className="font-mono text-slate-500 uppercase">{fgColor}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Warna Latar:</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-9 w-12 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                  />
                  <span className="font-mono text-slate-500 uppercase">{bgColor}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Resolusi Ekspor PNG:</label>
                <select
                  value={qrResolution}
                  onChange={(e) => setQrResolution(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value={600}>600 × 600 px (Media Sosial)</option>
                  <option value={1000}>1000 × 1000 px (HD Standar Cetak)</option>
                  <option value={1600}>1600 × 1600 px (Ultra HD Packaging)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Error Correction Level:</label>
                <select
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="H">High (30% pemulihan)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="L">Low (7%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Kolom Pratinjau QR Code */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
              <canvas ref={canvasRef} className="rounded max-w-full h-auto" />
            </div>

            <p className="text-[11px] text-slate-500 max-w-[220px] truncate">{content}</p>

            <div className="w-full space-y-2">
              <button
                onClick={handleDownload}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Gambar QR ({qrResolution}px)</span>
              </button>

              <button
                onClick={handleCopyImage}
                className="w-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold py-2 px-4 rounded-xl border border-slate-200 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Gambar Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Gambar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <ToolEditorialSection toolId="qr-generator" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
