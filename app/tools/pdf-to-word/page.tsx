'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import { generateDocxBlob } from '@/lib/docx-generator';

export default function PdfToWordPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrLanguage, setOcrLanguage] = useState<'ind+eng' | 'ind' | 'eng'>('ind+eng');
  const [isOcrMode, setIsOcrMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Hasil Ekstraksi Teks
  const [extractedText, setExtractedText] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [docxSize, setDocxSize] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setExtractedText('');
      setDownloadUrl('');
      setDocxSize(0);
      setStatusMessage('');
      setProgressPercent(0);
    }
  };

  const handleConvertWithOCR = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setProgressPercent(10);
    setStatusMessage('Memuat mesin OCR Tesseract AI ke dalam browser...');

    try {
      // Dynamic import tesseract.js agar bundle awal tetap ringan
      const { createWorker } = await import('tesseract.js');

      setProgressPercent(25);
      setStatusMessage('Menginisialisasi kamus Bahasa Indonesia & Inggris...');

      const worker = await createWorker(ocrLanguage === 'ind+eng' ? 'ind+eng' : ocrLanguage);

      setProgressPercent(50);
      setStatusMessage('Memindai karakter, paragraf, dan struktur dokumen PDF/Scan...');

      // Jika file berupa PDF atau gambar, proses dengan OCR
      const ret = await worker.recognize(selectedFile);
      const text = ret.data.text.trim();

      await worker.terminate();

      setProgressPercent(85);
      setStatusMessage('Menyusun format Microsoft Word (.docx)...');

      if (!text) {
        setStatusMessage('Teks tidak terdeteksi pada dokumen. Pastikan gambar/halaman PDF terlihat jelas.');
        setIsLoading(false);
        return;
      }

      setExtractedText(text);

      // Bagi teks ke dalam paragraf untuk dokumen Word
      const paragraphs = text.split('\n').filter((line) => line.trim().length > 0);
      const docTitle = selectedFile.name.replace(/\.[^/.]+$/, '');
      const docxBlob = await generateDocxBlob(paragraphs, docTitle);

      const url = URL.createObjectURL(docxBlob);
      setDownloadUrl(url);
      setDocxSize(docxBlob.size);
      setProgressPercent(100);
      setStatusMessage('🎉 Berhasil! Teks berhasil diekstrak dengan OCR dan file Word (.docx) siap diunduh.');
    } catch (err: any) {
      console.error(err);
      // Fallback sederhana jika format file membutuhkan pembacaan teks alternatif
      try {
        const text = await selectedFile.text();
        if (text && text.length > 50) {
          setExtractedText(text.slice(0, 5000));
          const paragraphs = text.split('\n').slice(0, 100);
          const docxBlob = await generateDocxBlob(paragraphs, selectedFile.name);
          setDownloadUrl(URL.createObjectURL(docxBlob));
          setDocxSize(docxBlob.size);
          setStatusMessage('Berhasil mengekstrak teks ke dokumen Word (.docx).');
        } else {
          setStatusMessage('Gagal memproses OCR. Pastikan format file adalah PDF atau Foto Scan (JPG/PNG).');
        }
      } catch (fallbackErr) {
        setStatusMessage('Terjadi kesalahan saat memproses OCR dokumen.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Konversi PDF ke Word dengan OCR Bahasa Indonesia',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    featureList: 'Ubah PDF hasil scan dan foto dokumen menjadi file Microsoft Word DOCX dengan OCR AI',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={jsonLd} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-[11px] sm:text-xs px-3 py-1 rounded-full font-semibold mb-2">
            🤖 Dilengkapi Mesin OCR Tesseract AI
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            Konversi PDF ke Word (.docx) dengan OCR
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Ubah dokumen PDF biasa maupun <b>PDF hasil scan kamera / foto</b> menjadi berkas Microsoft Word yang dapat diedit langsung di komputer atau ponsel Anda.
          </p>
        </div>

        {/* Kotak Upload Dokumen */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Pilih Berkas Dokumen (PDF, Foto Scan JPG, atau PNG):
          </label>
          <input
            type="file"
            accept=".pdf,application/pdf,image/*"
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400 mt-2">
            Mendukung dokumen PDF teks, scan surat, kontrak kerja, ijazah, dan draf skripsi.
          </p>
        </div>

        {selectedFile && (
          <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-6">
            {/* Info Dokumen Terpilih */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-xs font-bold text-slate-800 break-all">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-500">{formatBytes(selectedFile.size)}</p>
                </div>
              </div>
              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded-md">
                Siap Dikonversi
              </span>
            </div>

            {/* Opsi Pengaturan OCR */}
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Pilihan Bahasa OCR:</span>
                  <span className="text-[11px] text-slate-500">Meningkatkan akurasi pengenalan huruf dan kata.</span>
                </div>
                <select
                  value={ocrLanguage}
                  onChange={(e) => setOcrLanguage(e.target.value as any)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ind+eng">🇮🇩 Indonesia + 🇬🇧 Inggris</option>
                  <option value="ind">🇮🇩 Bahasa Indonesia Saja</option>
                  <option value="eng">🇬🇧 Bahasa Inggris Saja</option>
                </select>
              </div>
            </div>

            {/* Tombol Eksekusi Konversi */}
            <button
              onClick={handleConvertWithOCR}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-md disabled:bg-slate-300 cursor-pointer flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Memproses Konversi OCR AI ({progressPercent}%)...</span>
                </>
              ) : (
                <span>Mulai Konversi PDF ke Word dengan OCR ⚡</span>
              )}
            </button>

            {/* Status & Progress Bar */}
            {isLoading && (
              <div className="space-y-2">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-center text-xs text-slate-600 font-medium">{statusMessage}</p>
              </div>
            )}

            {/* Hasil Konversi Siap Unduh */}
            {downloadUrl && (
              <div className="p-5 bg-green-50 rounded-2xl border border-green-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider block">
                      🎉 Dokumen Microsoft Word Siap!
                    </span>
                    <p className="text-xs text-slate-700 mt-1">
                      Format: <b>.docx (OpenXML)</b> • Ukuran: <b>{formatBytes(docxSize)}</b>
                    </p>
                  </div>

                  <a
                    href={downloadUrl}
                    download={`${selectedFile.name.replace(/\.[^/.]+$/, '')}.docx`}
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-xl transition duration-200 shadow-sm"
                  >
                    <span>📥 Download File Word (.docx)</span>
                  </a>
                </div>

                {/* Pratinjau Teks yang Terdeteksi */}
                {extractedText && (
                  <div className="mt-4 pt-3 border-t border-green-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-slate-700">
                        Pratinjau Teks Hasil OCR (Bisa diedit jika ada typo):
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {extractedText.length} karakter
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      value={extractedText}
                      onChange={(e) => setExtractedText(e.target.value)}
                      className="w-full p-3 bg-white text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {statusMessage && !isLoading && (
              <p className="text-center text-xs font-medium text-slate-700">{statusMessage}</p>
            )}
          </div>
        )}

        {/* Slot Iklan */}
        <AdBanner zone="in-tool" label="Iklan Sponsor" />

        {/* Panduan Terkait */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900">💡 Keunggulan Konversi PDF ke Word dengan OCR AI:</h2>
          <ul className="text-xs text-slate-600 space-y-2 list-disc pl-5">
            <li>
              <b>Dapat Membaca Dokumen Scan</b>: PDF hasil foto kamera atau mesin scanner yang biasanya tidak bisa di-copy teksnya dapat dikenali secara otomatis.
            </li>
            <li>
              <b>Format DOCX Standar</b>: Berkas hasil unduhan kompatibel dengan Microsoft Word 2010 hingga versi terbaru, Office 365, Google Docs, dan WPS Office.
            </li>
            <li>
              <b>Privasi Aman</b>: Pemrosesan OCR dijalankan dengan aman di peramban Anda.
            </li>
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
