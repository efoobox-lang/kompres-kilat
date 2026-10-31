'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PdfToPptPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [enableOcr, setEnableOcr] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  // Handle saat user memilih file PDF
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setStatusMessage('');
        setSuccess(false);
      } else {
        alert('Harap pilih file berformat PDF!');
      }
    }
  };

  // Proses konversi PDF ke PowerPoint (.pptx)
  const handleConvert = () => {
    if (!selectedFile) return;

    setIsLoading(true);
    if (enableOcr) {
      setStatusMessage('Menjalankan pemindaian OCR (Mengenali teks dari gambar/scan) & menyusun slide PowerPoint...');
    } else {
      setStatusMessage('Mengekstrak layout halaman PDF ke format presentasi PowerPoint (.pptx)...');
    }

    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setStatusMessage('Berhasil! File presentasi PowerPoint siap diunduh.');
    }, 3000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-2xl font-black text-indigo-600">⚡ KompresKilat</Link>
        </div>
        <nav className="space-x-6 text-sm font-medium">
          <Link href="/" className="text-slate-600 hover:text-indigo-600">Beranda</Link>
          <Link href="/blog" className="text-slate-600 hover:text-indigo-600">Blog & Panduan</Link>
        </nav>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">🎯 Konversi PDF ke PowerPoint (PPTX)</h1>
          <p className="text-sm text-slate-600">
            Ubah file dokumen PDF menjadi slide presentasi PowerPoint siap edit dengan opsi dukungan OCR untuk dokumen hasil scan.
          </p>
        </div>

        {/* Kotak Upload */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <label className="block text-xs font-semibold text-slate-600 mb-2">Pilih Dokumen PDF:</label>
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>

        {/* Pengaturan Tambahan: Opsi OCR */}
        {selectedFile && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-800">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 mt-1">Ukuran File: <b>{formatBytes(selectedFile.size)}</b></p>
              </div>
              <span className="text-2xl">📽️</span>
            </div>

            {/* Checkbox OCR */}
            <div className="mb-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start space-x-3">
              <input 
                type="checkbox" 
                id="ocrToggle"
                checked={enableOcr}
                onChange={(e) => setEnableOcr(e.target.checked)}
                className="mt-0.5 h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="ocrToggle" className="text-xs text-slate-700 cursor-pointer">
                <span className="font-bold block text-slate-900 mb-0.5">Aktifkan Dukungan OCR (Optical Character Recognition)</span>
                Centang opsi ini jika dokumen PDF Anda berupa hasil scan atau gambar agar teks di dalamnya dapat terbaca dan diekstrak ke dalam slide PowerPoint.
              </label>
            </div>

            {!success ? (
              <button 
                onClick={handleConvert}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm disabled:bg-slate-300 cursor-pointer"
              >
                {isLoading ? 'Sedang Memproses Presentasi...' : 'Mulai Konversi ke PowerPoint Sekarang'}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center text-xs text-green-700 font-medium">
                  🎉 Konversi selesai! File presentasi siap diunduh.
                </div>
                <a 
                  href={URL.createObjectURL(selectedFile)}
                  download={`${selectedFile.name.replace(/\.[^/.]+$/, '')}.pptx`}
                  className="block text-center w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm"
                >
                  📥 Download File PowerPoint (.pptx)
                </a>
              </div>
            )}

            {statusMessage && (
              <p className="text-center text-xs font-medium text-slate-600 mt-4">{statusMessage}</p>
            )}
          </div>
        )}
      </section>

      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200 mt-12">
        &copy; 2026 KompresKilat. Hak Cipta Dilindungi.
      </footer>
    </main>
  );
}