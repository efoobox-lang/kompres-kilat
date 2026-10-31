'use client';

import { useState } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';

export default function ZipPage() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
      setDownloadUrl('');
      setStatusMessage('');
    }
  };

  const handleCreateZip = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsLoading(true);
    setStatusMessage('Sedang memproses dan mengemas file ke dalam arsip ZIP...');

    try {
      const zip = new JSZip();

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        zip.file(file.name, file);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      
      setDownloadUrl(url);
      setStatusMessage('Berhasil! Arsip ZIP siap diunduh.');
    } catch (error) {
      console.error(error);
      setStatusMessage('Terjadi kesalahan saat membuat file ZIP.');
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">📦 Buat Arsip ZIP Online</h1>
          <p className="text-sm text-slate-600">
            Gabungkan beberapa file foto, dokumen, atau laporan sekaligus menjadi satu arsip ZIP dengan mudah.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <label className="block text-xs font-semibold text-slate-600 mb-2">Pilih Beberapa File Sekaligus:</label>
          <input 
            type="file" 
            multiple 
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>

        {selectedFiles && selectedFiles.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
              <p className="text-xs font-bold text-slate-800 mb-2">File yang dipilih ({selectedFiles.length} file):</p>
              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1 max-h-32 overflow-y-auto">
                {Array.from(selectedFiles).map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            </div>

            {!downloadUrl ? (
              <button 
                onClick={handleCreateZip}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm disabled:bg-slate-300 cursor-pointer"
              >
                {isLoading ? 'Sedang Mengemas File...' : 'Buat File ZIP Sekarang'}
              </button>
            ) : (
              <a 
                href={downloadUrl}
                download="arsip-kompreskilat.zip"
                className="block text-center w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm"
              >
                📥 Download Arsip ZIP
              </a>
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