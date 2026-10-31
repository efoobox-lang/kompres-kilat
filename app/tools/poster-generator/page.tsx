'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import AIImageGenerator from '@/components/AIImageGenerator';

export default function PosterGeneratorPage() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Poster & Brosur Generator - KompresKilat',
    description: 'Aplikasi online gratis untuk membuat desain poster promosi, brosur marketing, flyer event, dan teaser produk otomatis dengan AI.',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'All',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={schemaData} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold mb-2">
            🎨 AI Graphic Design Studio
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            AI Poster &amp; Brosur Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Hasilkan desain grafis promosi bisnis, pamflet seminar, flyer grand opening, atau brosur produk siap cetak dan siap posting di media sosial dalam hitungan detik.
          </p>
        </div>

        {/* Komponen Utama AI Image Generator */}
        <AIImageGenerator />

        {/* Slot Iklan Kepatuhan AdSense */}
        <AdBanner zone="in-tool" label="Iklan" />

        {/* Tips Pembuatan Desain */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs text-slate-600">
          <h3 className="text-sm font-bold text-slate-900">💡 Tips Menulis Prompt Poster AI yang Menarik:</h3>
          <ul className="space-y-1.5 list-disc pl-5">
            <li><b>Sebutkan Objek Utama:</b> Jelaskan produk atau figur utama (contoh: cangkir kopi latte art, model berpakaian formal, mockup aplikasi).</li>
            <li><b>Tentukan Suasana &amp; Palet Warna:</b> Tambahkan gaya desain seperti *minimalist modern*, *retro vintage*, *cyberpunk neon*, atau *warm natural earthy*.</li>
            <li><b>Pilih Rasio Sesuai Kebutuhan:</b> Gunakan rasio 1:1 untuk feed Instagram/Facebook, rasio 9:16 untuk Instagram Story/TikTok, atau 16:9 untuk banner website.</li>
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}

