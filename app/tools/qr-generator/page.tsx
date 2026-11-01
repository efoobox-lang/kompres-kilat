'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';

export default function QrGeneratorPage() {
  const [qrType, setQrType] = useState<'url' | 'whatsapp' | 'text' | 'wifi'>('url');
  const [content, setContent] = useState('https://kompreskilat.site');
  const [qrColor, setQrColor] = useState('000000');
  const [bgColor, setBgColor] = useState('ffffff');
  const [qrSize, setQrSize] = useState(300);

  // Generate URL QR Code menggunakan service aman beresolusi tinggi
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(
    content
  )}&color=${qrColor.replace('#', '')}&bgcolor=${bgColor.replace('#', '')}&margin=10`;

  const handleDownload = async () => {
    try {
      const res = await fetch(qrImageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode_${qrType}_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(qrImageUrl, '_blank');
    }
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'QR Code Generator Kustom Online Gratis - KompresKilat',
    description: 'Buat kode QR kustom untuk link web, nomor WhatsApp, teks, dan jaringan WiFi beresolusi tinggi.',
    applicationCategory: 'UtilityApplication',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={schema} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold mb-2">
            ⚡ Generator Kode QR Cepat &amp; Gratis
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            QR Code Generator Kustom Online
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Hasilkan barcode QR untuk link website, chat WhatsApp otomatis, dan WiFi siap cetak atau tempel di kemasan bisnis Anda.
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
                      setQrType(t.id as any);
                      if (t.id === 'whatsapp') setContent('https://wa.me/6281234567890?text=Halo%20Admin');
                      else if (t.id === 'url') setContent('https://kompreskilat.site');
                    }}
                    className={`py-2 px-1 text-center rounded-xl border font-semibold transition ${
                      qrType === t.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ukuran Barcode:</label>
                <select
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value={200}>Kecil (200 × 200 px)</option>
                  <option value={300}>Sedang (300 × 300 px)</option>
                  <option value={500}>Besar (500 × 500 px - HD)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Warna Titik Barcode:</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={`#${qrColor}`}
                    onChange={(e) => setQrColor(e.target.value.replace('#', ''))}
                    className="h-9 w-12 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <span className="font-mono text-slate-500 uppercase">#{qrColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Pratinjau QR Code */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImageUrl} alt="QR Code Preview" className="w-[180px] h-[180px] object-contain rounded" />
            </div>

            <p className="text-[11px] text-slate-500 max-w-[200px] truncate">{content}</p>

            <button
              onClick={handleDownload}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>📥 Unduh Gambar QR (.png)</span>
            </button>
          </div>
        </div>

        <AdBanner zone="in-tool" label="Iklan" />
      </section>

      <Footer />
    </main>
  );
}

