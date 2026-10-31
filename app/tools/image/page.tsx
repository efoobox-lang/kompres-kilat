'use client';

import { useState } from 'react';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type QualityPreset = 'cpns' | '500kb' | 'medium' | 'high';

export default function CompressImagePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [preset, setPreset] = useState<QualityPreset>('cpns');
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Hasil Kompresi Real
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  const [compressedSize, setCompressedSize] = useState<number>(0);

  // Handle saat user memilih file gambar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setCompressedBlob(null);
        setCompressedUrl('');
        setCompressedSize(0);
        setStatusMessage('');
      } else {
        alert('Harap pilih file berformat gambar (JPG, PNG, WebP)!');
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Proses kompresi gambar sungguhan di sisi klien (Client-side)
  const handleCompress = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setStatusMessage('Sedang memproses kompresi gambar langsung di browser...');

    try {
      let maxSizeMB = 1;
      let maxWidthOrHeight = 1920;

      if (preset === 'cpns') {
        maxSizeMB = 0.19; // ~190KB untuk memenuhi syarat < 200KB CPNS
        maxWidthOrHeight = 1200;
      } else if (preset === '500kb') {
        maxSizeMB = 0.48; // ~480KB untuk syarat < 500KB
        maxWidthOrHeight = 1600;
      } else if (preset === 'medium') {
        maxSizeMB = 0.8;
        maxWidthOrHeight = 1920;
      } else {
        maxSizeMB = 1.5;
        maxWidthOrHeight = 2560;
      }

      const options = {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker: true,
        fileType: outputFormat,
      };

      const compressedFile = await imageCompression(selectedFile, options);
      const url = URL.createObjectURL(compressedFile);

      setCompressedBlob(compressedFile);
      setCompressedUrl(url);
      setCompressedSize(compressedFile.size);
      setStatusMessage('Berhasil! Gambar berhasil dikompresi tanpa merusak kejelasan.');
    } catch (error: any) {
      console.error(error);
      setStatusMessage('Gagal mengompres gambar. Silakan coba format atau gambar lain.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPercentageSaved = () => {
    if (!selectedFile || !compressedSize) return 0;
    const diff = selectedFile.size - compressedSize;
    if (diff <= 0) return 0;
    return Math.round((diff / selectedFile.size) * 100);
  };

  const getExtension = () => {
    if (outputFormat === 'image/webp') return 'webp';
    if (outputFormat === 'image/png') return 'png';
    return 'jpg';
  };

  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Kompres Gambar & Foto KTP Online',
    operatingSystem: 'All',
    applicationCategory: 'MultimediaApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    featureList: 'Kompres JPG, PNG, WebP di bawah 200KB atau 500KB tanpa kirim file ke server',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={appSchema} />
      <Navbar />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8 text-center">
          <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold mb-2">
            🔒 100% Client-Side & Aman (Tanpa Upload ke Server)
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">🖼️ Kompres & Konversi Gambar</h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Perkecil foto KTP, ijazah, atau gambar web ke JPG, PNG, atau WebP dengan target ukuran pas.
          </p>
        </div>

        {/* Kotak Upload */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <label className="block text-xs font-semibold text-slate-700 mb-2">Pilih File Gambar:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400 mt-2">
            Mendukung file JPG, JPEG, PNG, dan WebP. Data gambar diproses langsung di memori perangkat Anda.
          </p>
        </div>

        {/* Slot Iklan Top Banner */}
        <AdBanner zone="top-leaderboard" label="Iklan Sponsor" />

        {/* Pengaturan Kompresi & Pratinjau */}
        {selectedFile && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              {previewUrl && (
                <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-slate-200" />
              )}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-bold text-slate-800 break-all">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 mt-1">Ukuran Asli: <b className="text-slate-800">{formatBytes(selectedFile.size)}</b></p>
              </div>
            </div>

            {/* Target Preset */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Pilih Target Ukuran & Kualitas:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPreset('cpns')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    preset === 'cpns'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-bold">🎯 &lt; 200 KB</span>
                  <span className="text-[10px] opacity-85 block mt-0.5">Syarat CPNS/BUMN</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset('500kb')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    preset === '500kb'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-bold">📄 &lt; 500 KB</span>
                  <span className="text-[10px] opacity-85 block mt-0.5">Standar Dokumen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset('medium')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    preset === 'medium'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-bold">⚖️ Sedang</span>
                  <span className="text-[10px] opacity-85 block mt-0.5">Seimbang (Umum)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset('high')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    preset === 'high'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-bold">🌟 Ringan</span>
                  <span className="text-[10px] opacity-85 block mt-0.5">Kualitas Maksimal</span>
                </button>
              </div>
            </div>

            {/* Pilihan Format Output */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Format Output:</label>
              <div className="flex gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    checked={outputFormat === 'image/jpeg'}
                    onChange={() => setOutputFormat('image/jpeg')}
                  />
                  <span>JPG / JPEG</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    checked={outputFormat === 'image/webp'}
                    onChange={() => setOutputFormat('image/webp')}
                  />
                  <span>WebP (Paling Hemat)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    checked={outputFormat === 'image/png'}
                    onChange={() => setOutputFormat('image/png')}
                  />
                  <span>PNG</span>
                </label>
              </div>
            </div>

            {/* Tombol Eksekusi */}
            <button 
              onClick={handleCompress}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm disabled:bg-slate-300 cursor-pointer flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Mengompresi Gambar...</span>
                </>
              ) : (
                <span>Mulai Kompres Gambar ⚡</span>
              )}
            </button>

            {/* Status & Hasil Kompresi */}
            {compressedBlob && (
              <div className="p-5 bg-green-50 rounded-2xl border border-green-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider block">
                      🎉 Hasil Kompresi Siap!
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-700 mt-1">
                      <span>Asli: <span className="line-through">{formatBytes(selectedFile.size)}</span></span>
                      <span>→</span>
                      <span className="font-bold text-green-800 text-sm">{formatBytes(compressedSize)}</span>
                      <span className="bg-green-200 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Hemat {getPercentageSaved()}%
                      </span>
                    </div>
                  </div>

                  <a 
                    href={compressedUrl}
                    download={`kompreskilat-${selectedFile.name.replace(/\.[^/.]+$/, '')}.${getExtension()}`}
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition duration-200 shadow-sm"
                  >
                    <span>📥 Download Hasil ({getExtension().toUpperCase()})</span>
                  </a>
                </div>
              </div>
            )}

            {statusMessage && (
              <p className="text-center text-xs font-medium text-slate-600">{statusMessage}</p>
            )}
          </div>
        )}

        {/* Link ke Blog Terkait */}
        <div className="mt-8 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800">Butuh panduan resmi ukuran foto CPNS & BUMN?</h3>
            <p className="text-[11px] text-slate-500">Baca artikel cara kompres KTP & swafoto agar lolos seleksi berkas.</p>
          </div>
          <Link 
            href="/blog/cara-kompres-foto-ktp-kurang-dari-500kb"
            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-2 rounded-xl transition whitespace-nowrap"
          >
            Baca Panduan →
          </Link>
        </div>
      </section>

      {/* Footer Komprehensif */}
      <Footer />
    </main>
  );
}
