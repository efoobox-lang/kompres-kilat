'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';

export default function RemoveBgPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bgColor, setBgColor] = useState<string>('#DC2626'); // Default Merah CPNS
  const [isTransparent, setIsTransparent] = useState<boolean>(false);
  const [tolerance, setTolerance] = useState<number>(35);
  const [feather, setFeather] = useState<number>(2);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  // Preset Warna Pas Foto Resmi
  const colorPresets = [
    { label: 'Merah CPNS (Ganjil)', value: '#DC2626', desc: 'Tahun Lahir Ganjil' },
    { label: 'Biru CPNS (Genap)', value: '#2563EB', desc: 'Tahun Lahir Genap' },
    { label: 'Putih Formal', value: '#FFFFFF', desc: 'Paspor / Kedubes' },
    { label: 'Abu-Abu Elegan', value: '#64748B', desc: 'LinkedIn / Profil' },
    { label: 'Hitam Studio', value: '#0F172A', desc: 'Formal Portrait' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setIsProcessed(false);
        setStatusMessage('');

        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          // Gambar awal ke original canvas
          const canvas = originalCanvasRef.current;
          if (canvas) {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.drawImage(img, 0, 0);
          }
        };
        img.src = URL.createObjectURL(file);
      } else {
        alert('Harap pilih file gambar (JPG, PNG, atau WebP)!');
      }
    }
  };

  // Algoritma Pengganti Background di Canvas (Client-side)
  const processBackground = () => {
    if (!originalImage) return;

    setIsLoading(true);
    setStatusMessage('Sedang memisahkan objek dan mengganti warna background...');

    setTimeout(() => {
      try {
        const width = originalImage.width;
        const height = originalImage.height;

        const resultCanvas = resultCanvasRef.current;
        if (!resultCanvas) return;
        resultCanvas.width = width;
        resultCanvas.height = height;
        const ctx = resultCanvas.getContext('2d');
        if (!ctx) return;

        // Ambil data piksel asli
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.drawImage(originalImage, 0, 0);
        const imgData = tempCtx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Sampel warna background dari 4 sudut gambar
        const sampleCorners = [
          [0, 0],
          [width - 1, 0],
          [0, height - 1],
          [width - 1, height - 1],
          [Math.floor(width / 2), 0],
        ];

        let bgR = 0, bgG = 0, bgB = 0;
        sampleCorners.forEach(([cx, cy]) => {
          const idx = (cy * width + cx) * 4;
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        });
        bgR /= sampleCorners.length;
        bgG /= sampleCorners.length;
        bgB /= sampleCorners.length;

        // Parse warna target baru (HEX to RGB)
        let targetR = 255, targetG = 255, targetB = 255;
        if (!isTransparent) {
          const hex = bgColor.replace('#', '');
          targetR = parseInt(hex.substring(0, 2), 16);
          targetG = parseInt(hex.substring(2, 4), 16);
          targetB = parseInt(hex.substring(4, 6), 16);
        }

        // Masking piksel berdasarkan kesamaan warna dengan background
        const tol = tolerance * 2.5;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Hitung jarak warna (Color distance Euclidean)
          const dist = Math.sqrt(
            Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
          );

          if (dist < tol) {
            if (isTransparent) {
              data[i + 3] = 0; // Transparan
            } else {
              data[i] = targetR;
              data[i + 1] = targetG;
              data[i + 2] = targetB;
              data[i + 3] = 255;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setIsProcessed(true);
        setStatusMessage('Berhasil! Background foto berhasil diubah.');
      } catch (err: any) {
        console.error(err);
        setStatusMessage('Terjadi kendala saat memproses background.');
      } finally {
        setIsLoading(false);
      }
    }, 150);
  };

  const handleDownload = () => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = isTransparent ? 'foto-tanpa-background.png' : 'pas-foto-ganti-background.jpg';
    link.href = canvas.toDataURL(isTransparent ? 'image/png' : 'image/jpeg', 0.95);
    link.click();
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Ganti Background Foto & Hapus Background Online',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    featureList: 'Ganti warna background pas foto merah biru CPNS dan hapus background transparan gratis',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={jsonLd} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-[11px] sm:text-xs px-3 py-1 rounded-full font-semibold mb-2">
            🎨 Pas Foto Resmi &amp; Transparan PNG
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            Ganti Warna &amp; Hapus Background Foto
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Ubah latar belakang pas foto menjadi <b>Merah</b>, <b>Biru</b> (syarat seleksi CPNS/BUMN), atau jadikan <b>Transparan</b> secara instan di browser tanpa upload ke server.
          </p>
        </div>

        {/* Kotak Upload Foto */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Pilih Foto Anda (Pas Foto / Potret):
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400 mt-2">
            Mendukung file JPG, PNG, dan WebP. Hasil terbaik didapatkan dari foto dengan latar belakang warna polos (putih/studio).
          </p>
        </div>

        {selectedFile && (
          <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-6">
            {/* Pilihan Warna Background Baru */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
                1. Pilih Background Baru:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setBgColor(preset.value);
                      setIsTransparent(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                      !isTransparent && bgColor === preset.value
                        ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/40 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <span 
                      className="w-6 h-6 rounded-full border border-slate-300 shrink-0 shadow-inner"
                      style={{ backgroundColor: preset.value }}
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">{preset.label}</span>
                      <span className="text-[10px] text-slate-500">{preset.desc}</span>
                    </div>
                  </button>
                ))}

                {/* Pilihan Transparan */}
                <button
                  type="button"
                  onClick={() => setIsTransparent(true)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                    isTransparent
                      ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/40 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full border border-slate-300 shrink-0 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[size:8px_8px]" />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">Transparan (PNG)</span>
                    <span className="text-[10px] text-slate-500">Hapus Latar Belakang</span>
                  </div>
                </button>
              </div>

              {/* Custom Color Picker */}
              <div className="flex items-center gap-3 pt-2">
                <label className="text-xs font-medium text-slate-600">Pilih Warna Bebas:</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => {
                    setBgColor(e.target.value);
                    setIsTransparent(false);
                  }}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                />
                <span className="text-xs font-mono text-slate-500">{bgColor}</span>
              </div>
            </div>

            {/* Slider Toleransi Warna */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700">Sensitivitas Penghapus Background:</label>
                <span className="font-mono font-bold text-indigo-600">{tolerance}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">
                Tingkatkan nilai jika masih ada sisa background lama, atau turunkan jika bagian rambut/baju ikut terhapus.
              </p>
            </div>

            {/* Tombol Eksekusi */}
            <button
              onClick={processBackground}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm disabled:bg-slate-300 cursor-pointer flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Sedang Mengganti Background...</span>
                </>
              ) : (
                <span>Terapkan Warna Background Baru ⚡</span>
              )}
            </button>

            {/* Area Perbandingan Sebelum & Sesudah */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="text-center">
                <span className="text-xs font-bold text-slate-600 block mb-2">Foto Asli</span>
                <div className="bg-slate-100 rounded-xl p-2 flex items-center justify-center min-h-[220px]">
                  <canvas ref={originalCanvasRef} className="max-h-64 max-w-full rounded-lg object-contain shadow-sm" />
                </div>
              </div>

              <div className="text-center">
                <span className="text-xs font-bold text-slate-600 block mb-2">Hasil Background Baru</span>
                <div className={`rounded-xl p-2 flex items-center justify-center min-h-[220px] ${
                  isTransparent 
                    ? 'bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:12px_12px]'
                    : 'bg-slate-100'
                }`}>
                  <canvas ref={resultCanvasRef} className="max-h-64 max-w-full rounded-lg object-contain shadow-sm" />
                </div>
              </div>
            </div>

            {isProcessed && (
              <div className="pt-2">
                <button
                  onClick={handleDownload}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-xl transition duration-200 shadow-md flex justify-center items-center gap-2 cursor-pointer"
                >
                  <span>📥 Download Pas Foto Baru ({isTransparent ? 'PNG' : 'JPG'})</span>
                </button>
              </div>
            )}

            {statusMessage && (
              <p className="text-center text-xs font-medium text-slate-600">{statusMessage}</p>
            )}
          </div>
        )}

        {/* Slot Iklan High-CTR */}
        <AdBanner zone="in-tool" label="Iklan Sponsor" />

        {/* Edukasi Pas Foto CPNS */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900">📌 Ketentuan Background Pas Foto Instansi Resmi:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="p-3 bg-red-50 rounded-xl border border-red-100">
              <b className="text-red-900 block mb-1">🔴 Background Merah:</b>
              Untuk pelamar/pegawai dengan tahun kelahiran <b>GANJIL</b> (misal: 1995, 1997, 1999, 2001).
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <b className="text-blue-900 block mb-1">🔵 Background Biru:</b>
              Untuk pelamar/pegawai dengan tahun kelahiran <b>GENAP</b> (misal: 1996, 1998, 2000, 2002).
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

