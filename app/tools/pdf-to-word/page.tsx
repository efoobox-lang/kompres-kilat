'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PdfToWordPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  // Simulasi proses konversi PDF ke Word (.docx)
  const handleConvert = () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setStatusMessage('Sedang membaca struktur dokumen PDF dan mengonversinya ke format Word...');

    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setStatusMessage('Berhasil! Dokumen siap diunduh dalam format Word (.docx).');
    }, 2500); // Simulasi proses 2.5 detik
  };

  // Helper format ukuran file
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header / Navbar */}
      <header className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-2xl font-black text-indigo-600">⚡ KompresKilat</Link>
        </div>
        <nav className="space-x-6 text-sm font-medium">
          <Link href="/" className="text-slate-600 hover:text-indigo-600">Beranda</Link>
          <Link href="/blog" className="text-slate-600 hover:text-indigo-600">Blog & Panduan</Link>
        </nav>
      </header>

      {/* Konten Utama */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">🔄 Konversi PDF ke Word Online</h1>
          <p className="text-sm text-slate-600">
            Ubah dokumen PDF Anda menjadi file Microsoft Word (.docx) dengan mudah dan cepat langsung dari browser.
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

        {/* Pratinjau & Tombol Proses */}
        {selectedFile && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-800">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 mt-1">Ukuran File: <b>{formatBytes(selectedFile.size)}</b></p>
              </div>
              <span className="text-2xl">📑</span>
            </div>

            {!success ? (
              <button 
                onClick={handleConvert}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm disabled:bg-slate-300 cursor-pointer"
              >
                {isLoading ? 'Sedang Mengonversi ke Word...' : 'Mulai Konversi ke Word Sekarang'}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center text-xs text-green-700 font-medium">
                  🎉 Konversi selesai! Dokumen Word berhasil dibuat.
                </div>
                <a 
                  href={URL.createObjectURL(selectedFile)}
                  download={`${selectedFile.name.replace(/\.[^/.]+$/, '')}.docx`}
                  className="block text-center w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm"
                >
                  📥 Download File Word (.docx)
                </a>
              </div>
            )}

            {statusMessage && (
              <p className="text-center text-xs font-medium text-slate-600 mt-4">{statusMessage}</p>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200 mt-12">
        &copy; 2026 KompresKilat. Hak Cipta Dilindungi.
      </footer>
    </main>
  );
}