'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import Footer from '@/components/Footer';

export default function CompressPdfPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(0);
  
  // Hasil Kompresi
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  const [compressedSize, setCompressedSize] = useState<number>(0);

  // Handle saat user memilih file PDF
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setSelectedFile(file);
        setCompressedBlob(null);
        setCompressedUrl('');
        setCompressedSize(0);
        setStatusMessage('');
      } else {
        alert('Harap pilih file berformat PDF!');
      }
    }
  };

  // Proses optimasi struktur PDF menggunakan pdf-lib di browser
  const handleCompressPdf = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setStatusMessage('Sedang membaca struktur internal PDF dan mengoptimalkan objek berkas...');

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const pages = pdfDoc.getPageCount();
      setPageCount(pages);

      // Bersihkan metadata berlebih yang menambah bobot file
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('KompresKilat PDF Optimizer');
      pdfDoc.setCreator('KompresKilat');

      // Simpan dengan kompresi stream objek
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setCompressedBlob(blob);
      setCompressedUrl(url);
      setCompressedSize(blob.size);
      setStatusMessage('Berhasil! Dokumen PDF berhasil diringkaskan dan dioptimalkan.');
    } catch (error: any) {
      console.error(error);
      setStatusMessage('Gagal memproses file PDF. Pastikan file tidak terenkripsi atau berpasword.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper ukuran file
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <header className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-2xl font-black text-indigo-600">⚡ KompresKilat</Link>
        </div>
        <nav className="space-x-6 text-sm font-medium">
          <Link href="/" className="text-slate-600 hover:text-indigo-600">Beranda</Link>
          <Link href="/blog" className="text-slate-600 hover:text-indigo-600">Blog & Panduan</Link>
        </nav>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold mb-2">
            🔒 Privasi 100% Terjaga di Browser
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">📄 Kompres Dokumen PDF</h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Perkecil dan optimalkan berkas PDF tugas, skripsi, atau berkas lamaran kerja tanpa batasan kuota.
          </p>
        </div>

        {/* Kotak Upload */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <label className="block text-xs font-semibold text-slate-700 mb-2">Pilih File Dokumen PDF:</label>
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400 mt-2">
            Dokumen diproses di memori browser Anda menggunakan teknologi WebAssembly &amp; PDF Streams.
          </p>
        </div>

        {/* Detail Dokumen & Tindakan */}
        {selectedFile && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800 break-all">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">Ukuran Asli: <b>{formatBytes(selectedFile.size)}</b></p>
              </div>
            </div>

            <button 
              onClick={handleCompressPdf}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm disabled:bg-slate-300 cursor-pointer flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Sedang Mengoptimalkan PDF...</span>
                </>
              ) : (
                <span>Mulai Kompres &amp; Optimalkan PDF ⚡</span>
              )}
            </button>

            {/* Hasil Kompresi */}
            {compressedBlob && (
              <div className="p-5 bg-green-50 rounded-2xl border border-green-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider block">
                      🎉 Berhasil Diringkaskan!
                    </span>
                    <p className="text-xs text-slate-700 mt-1">
                      Jumlah Halaman: <b>{pageCount} Hal</b> • Ukuran Baru: <b className="text-green-800">{formatBytes(compressedSize)}</b>
                    </p>
                  </div>

                  <a 
                    href={compressedUrl}
                    download={`kompreskilat-${selectedFile.name}`}
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition duration-200 shadow-sm"
                  >
                    <span>📥 Download PDF Dioptimalkan</span>
                  </a>
                </div>
              </div>
            )}

            {statusMessage && (
              <p className="text-center text-xs font-medium text-slate-600">{statusMessage}</p>
            )}
          </div>
        )}

        {/* Artikel Terkait */}
        <div className="mt-8 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800">Kenapa ukuran PDF tugas kuliah membengkak?</h3>
            <p className="text-[11px] text-slate-500">Baca tips mengecilkan PDF tugas skripsi tanpa teks jadi buram.</p>
          </div>
          <Link 
            href="/blog/cara-memperkecil-ukuran-pdf-tugas-kuliah"
            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-2 rounded-xl transition whitespace-nowrap"
          >
            Baca Tips →
          </Link>
        </div>
      </section>

      {/* Footer Komprehensif */}
      <Footer />
    </main>
  );
}
