'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import JSZip from 'jszip';
import imageCompression from 'browser-image-compression';

interface BatchFileItem {
  id: string;
  file: File;
  originalSize: number;
  compressedBlob?: Blob;
  compressedSize?: number;
  status: 'pending' | 'processing' | 'done' | 'error';
}

export default function BatchCompressPage() {
  const [files, setFiles] = useState<BatchFileItem[]>([]);
  const [maxSizeMb, setMaxSizeMb] = useState<number>(0.3); // 300KB
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [zipDownloadUrl, setZipDownloadUrl] = useState<string | null>(null);

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files).map((f) => ({
        id: Math.random().toString(36).substring(7),
        file: f,
        originalSize: f.size,
        status: 'pending' as const,
      }));
      setFiles((prev) => [...prev, ...selected]);
      setZipDownloadUrl(null);
    }
  };

  const handleStartBatchCompress = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setZipDownloadUrl(null);

    const zip = new JSZip();
    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      const item = updatedFiles[i];
      item.status = 'processing';
      setFiles([...updatedFiles]);

      try {
        let compressedBlob: Blob;
        if (item.file.type.startsWith('image/')) {
          compressedBlob = await imageCompression(item.file, {
            maxSizeMB: maxSizeMb,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });
        } else {
          compressedBlob = item.file;
        }

        item.compressedBlob = compressedBlob;
        item.compressedSize = compressedBlob.size;
        item.status = 'done';

        zip.file(`kompreskilat_${item.file.name}`, compressedBlob);
      } catch {
        item.status = 'error';
      }

      setProgress(Math.round(((i + 1) / updatedFiles.length) * 100));
      setFiles([...updatedFiles]);
    }

    // Generate ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    setZipDownloadUrl(url);
    setIsProcessing(false);
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Batch Compress File Sekaligus Jadi ZIP - KompresKilat',
    description: 'Kompresi puluhan file foto dan dokumen sekaligus dalam satu klik dan unduh langsung sebagai arsip ZIP rapi.',
    applicationCategory: 'UtilityApplication',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={schema} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold mb-2">
            🗜️ Kompresi Massal • Batch ZIP Multi-File
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            Kompres Banyak File Sekaligus Jadi ZIP
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Kecilkan puluhan foto atau berkas dokumen secara massal di browser Anda dan satukan ke dalam 1 file ZIP siap kirim.
          </p>
        </div>

        {/* Upload Box Multi File */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pilih Banyak File Bersamaan</h2>
              <p className="text-xs text-slate-500">Mendukung format JPG, PNG, WebP, dan PDF</p>
            </div>
            <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-sm self-start sm:self-auto">
              <span>+ Tambah File</span>
              <input type="file" multiple onChange={handleFilesSelect} className="hidden" />
            </label>
          </div>

          {/* Pengaturan Target Ukuran */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">Target Ukuran Tiap Berkas:</span>
            <div className="flex gap-2">
              {[
                { mb: 0.2, label: '< 200 KB' },
                { mb: 0.3, label: '< 300 KB' },
                { mb: 0.5, label: '< 500 KB' },
              ].map((opt) => (
                <button
                  key={opt.mb}
                  type="button"
                  onClick={() => setMaxSizeMb(opt.mb)}
                  className={`py-1.5 px-3 rounded-lg border font-bold transition ${
                    maxSizeMb === opt.mb ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Daftar File Terpilih */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>{files.length} Berkas Siap Dikompresi</span>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-red-500 hover:underline font-semibold"
                >
                  Hapus Semua
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {files.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div className="truncate max-w-[240px] sm:max-w-md">
                      <p className="font-bold text-slate-800 truncate">{item.file.name}</p>
                      <p className="text-[10px] text-slate-400">Ukuran Asli: {formatSize(item.originalSize)}</p>
                    </div>

                    <div className="text-right">
                      {item.status === 'pending' && <span className="text-slate-400">Menunggu</span>}
                      {item.status === 'processing' && <span className="text-indigo-600 font-bold animate-pulse">Memproses...</span>}
                      {item.status === 'done' && (
                        <span className="text-green-600 font-bold">✓ {formatSize(item.compressedSize!)}</span>
                      )}
                      {item.status === 'error' && <span className="text-red-500">Gagal</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              )}

              {/* Tombol Aksi */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                {!zipDownloadUrl ? (
                  <button
                    onClick={handleStartBatchCompress}
                    disabled={isProcessing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition shadow-sm text-xs sm:text-sm text-center"
                  >
                    {isProcessing ? `Mengompresi (${progress}%)...` : `Mulai Kompresi Massal (${files.length} File) ⚡`}
                  </button>
                ) : (
                  <a
                    href={zipDownloadUrl}
                    download="kompreskilat_batch_compressed.zip"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition shadow-sm text-xs sm:text-sm text-center block"
                  >
                    📥 Unduh Semua File dalam 1 ZIP (.zip)
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 sm:mt-12">
          <AdBanner zone="in-tool" label="Iklan" />
        </div>
      </section>

      <Footer />
    </main>
  );
}

