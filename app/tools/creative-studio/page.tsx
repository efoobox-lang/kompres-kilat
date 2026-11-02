'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import CreativeStudio from '@/components/CreativeStudio';
import { Sparkles, ShieldCheck, Palette, Layers, Award } from 'lucide-react';

export default function CreativeStudioPage() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Creative Studio: Pembuat Kartu Ucapan & Editor Gambar - KompresKilat',
    description:
      'Aplikasi desain grafis kreatif online gratis untuk membuat kartu ucapan ulang tahun, hari guru, hari raya, hari nasional, serta editor gambar cepat (crop, rotate, resize, filter) 100% lokal di browser.',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'All',
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans transition-colors pb-16">
      <JsonLd data={schemaData} />
      <Navbar />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header Hero */}
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs px-3.5 py-1.5 rounded-full font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>🎨 Creative Studio &amp; Greeting Card Suite</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Creative Studio &amp; Pembuat Kartu Ucapan
          </h1>

          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Rancang kartu ucapan estetik, edit gambar kilat (crop, rotate, resize, filter warna), atau unduh template desain resolusi tinggi langsung di peramban Anda.
          </p>

          {/* Privacy Assurance Pill */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>100% Client-Side Privacy: Foto dan teks diproses di perangkat Anda tanpa disimpan ke server.</span>
            </div>
          </div>
        </div>

        {/* Komponen Utama Creative Studio */}
        <div className="mb-12">
          <CreativeStudio />
        </div>

        {/* Slot Iklan Kepatuhan AdSense */}
        <div className="my-10">
          <AdBanner zone="in-tool" label="Iklan" />
        </div>

        {/* Panduan & Keunggulan Fitur */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 w-fit">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Kartu Ucapan Kustom &amp; Foto
            </h3>
            <p className="leading-relaxed">
              Pilih dari tema Ulang Tahun, Hari Guru Nasional, Hari Raya, dan Hari Kemerdekaan RI. Tambahkan foto diri Anda dengan bingkai avatar atau background blend.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 w-fit">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Editor Gambar Kilat (HTML5 Canvas)
            </h3>
            <p className="leading-relaxed">
              Potong foto ke rasio 1:1, 4:5 Instagram, atau 16:9, putar orientasi 90°, ubah dimensi piksel, serta atur kecerahan, kontras, dan saturasi secara real-time.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 w-fit">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Template Siap Unduh Resolusi Tinggi
            </h3>
            <p className="leading-relaxed">
              Akses galeri template desain kartu ucapan, poster promo UMKM, dan sertifikat prestasi beresolusi tajam (1200×1200 px) yang dapat langsung diunduh atau diedit.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

