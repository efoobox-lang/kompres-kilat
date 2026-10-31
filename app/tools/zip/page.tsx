'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <Navbar />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">📦 Buat Arsip ZIP Online</h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Gabungkan beberapa file foto, dokumen, atau laporan sekaligus menjadi satu arsip ZIP dengan mudah.
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <label className="block text-xs font-semibold text-slate-600 mb-2">Pilih File (Bisa pilih lebih dari satu):</label>
          <input 
            type="file" 
            multiple
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>

        {selectedFiles && selectedFiles.length > 0 && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              File yang Dipilih ({selectedFiles.length} File):
            </h2>
            <ul className="text-xs text-slate-600 space-y-1.5 max-h-40 overflow-y-auto pl-2 border-l border-slate-200">
              {Array.from(selectedFiles).map((file, i) => (
                <li key={i} className="truncate">
                  📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </li>
              ))}
            </ul>

            <button 
              onClick={handleCreateZip}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm disabled:bg-slate-300 cursor-pointer"
            >
              {isLoading ? 'Sedang Membuat File ZIP...' : 'Kemaskan File ke ZIP Sekarang 🗜️'}
            </button>

            {downloadUrl && (
              <a 
                href={downloadUrl}
                download="arsip-kompreskilat.zip"
                className="block text-center w-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm"
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

      <Footer />
    </main>
  );
}
