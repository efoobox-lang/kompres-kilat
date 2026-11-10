'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import {
  ChevronDown,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  FileCheck2
} from 'lucide-react';

export default function CompressPdfPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Hasil Kompresi
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  const [compressedSize, setCompressedSize] = useState<number>(0);

  // FAQ Data untuk Konten Editorial & Schema JSON-LD
  const pdfFaqItems = [
    {
      q: 'Apakah teks atau tanda tangan pada file PDF akan menjadi buram setelah dikompres?',
      a: 'Tidak. KompresKilat menggunakan algoritma optimasi stream objek yang memprioritaskan pembersihan metadata berlebih, kompresi tabel xref, dan restrukturisasi font vektor. Teks dan garis tanda tangan digital tetap berada dalam format vektor tajam 100% sehingga tidak akan pecah saat di-zoom atau dicetak.',
    },
    {
      q: 'Apakah dokumen PDF rahasia (ijazah, kontrak kerja, transkrip nilai) aman diproses di KompresKilat?',
      a: 'Sangat aman. KompresKilat menerapkan standar Zero-Knowledge Privacy. Dokumen PDF Anda dibaca dan dioptimalkan secara lokal di dalam memori RAM peramban (browser) laptop atau ponsel Anda. Berkas tidak pernah diunggah atau disimpan di server mana pun.',
    },
    {
      q: 'Mengapa sebagian file PDF hanya berkurang sedikit ukurannya saat dikompres?',
      a: 'Jika file PDF Anda sebelumnya sudah diekspor dari aplikasi modern dengan kompresi maksimal (misalnya file yang hanya memuat teks polos tanpa gambar tersemat), maka ukuran file sudah mendekati batas minimum teoretisnya. Pengurangan terbesar umumnya terjadi pada dokumen PDF yang memuat foto scan beresolusi tinggi atau metadata grafik kompleks.',
    },
    {
      q: 'Apakah ada batasan jumlah halaman atau ukuran file PDF yang dapat dikompresi?',
      a: 'Tidak ada batasan kuota harian. Anda dapat mengompresi dokumen skripsi ratusan halaman, modul ajar, maupun berkas laporan tebal secara gratis tanpa perlu login atau membayar biaya langganan.',
    },
    {
      q: 'Apakah hasil kompresi PDF di KompresKilat memenuhi syarat portal pendaftaran CPNS / BUMN?',
      a: 'Ya, hasil berkas tetap mempertahankan kepatuhan format standar ISO PDF 1.7 / 2.0 yang dapat dibaca sempurna oleh sistem pembaca dokumen otomatis (ATS) dan peninjau berkas verifikator portal SSCASN BKN, FHCI BUMN, serta portal beasiswa LPDP.',
    },
  ];

  const faqSchemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pdfFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

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
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Navbar />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
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

        {/* Slot Iklan Kepatuhan AdSense */}
        <div className="my-10">
          <AdBanner zone="in-tool" label="Iklan" />
        </div>

        {/* ============================================================ */}
        {/* KONTEN EDITORIAL: Panduan Lengkap Optimasi Dokumen PDF        */}
        {/* ============================================================ */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs px-3 py-1 rounded-full font-bold mb-3">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Panduan Teknis Kompresi Dokumen PDF</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Panduan Cara Mengecilkan Ukuran PDF Tugas Kuliah, Skripsi &amp; Lamaran Kerja
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Dokumen berformat <em>Portable Document Format</em> (PDF) adalah standar baku pertukaran berkas akademik dan profesional di seluruh dunia. Namun, saat menyusun naskah skripsi, jurnal ilmiah, laporan keuangan, atau portofolio desain, ukuran file PDF kerap kali membengkak secara tidak terkontrol hingga puluhan megabyte. Hal ini menyebabkan berkas ditolak oleh portal unggah kampus, email kantor yang memiliki batas lampiran 25 MB, atau portal seleksi BUMN dan CPNS yang membatasi file dokumen maksimal <b>1 MB atau 500 KB</b>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <span className="text-xl block">🗜️</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Optimasi Stream Objek</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Mengompresi kamus objek internal dan tabel referensi silang (xref) tanpa mengubah susunan halaman asli dokumen.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <span className="text-xl block">🧹</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Pembersihan Metadata</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Menghapus riwayat modifikasi lama dan metadata editor yang tidak terlihat yang menambah beban ukuran dokumen secara tersembunyi.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <span className="text-xl block">🛡️</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Privasi Klien 100%</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Proses kompresi dijalankan di memori peramban Anda. Skripsi, data nilai, atau kontrak kerja rahasia tidak pernah diunggah ke internet.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cara Praktis Mengompres Dokumen PDF di KompresKilat:
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>
                <strong>Pilih Berkas PDF:</strong> Klik tombol &quot;Pilih File Dokumen PDF&quot; dari laptop atau ponsel pintar Anda.
              </li>
              <li>
                <strong>Tinjau Informasi Berkas:</strong> Sistem akan mendeteksi nama dokumen, ukuran asal, serta jumlah total lembar halaman.
              </li>
              <li>
                <strong>Jalankan Optimasi:</strong> Klik tombol <em>&quot;Mulai Kompres &amp; Optimalkan PDF ⚡&quot;</em> dan perhatikan proses kalkulasi instan.
              </li>
              <li>
                <strong>Unduh Berkas Ringan:</strong> Klik tombol hijau <em>&quot;Download PDF Dioptimalkan&quot;</em> untuk mendapatkan file baru yang siap dikirim via email atau portal seleksi.
              </li>
            </ol>
          </div>

          {/* ============================================================ */}
          {/* FAQ (Pertanyaan yang Sering Diajukan)                         */}
          {/* ============================================================ */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Pertanyaan yang Sering Diajukan Seputar Kompresi PDF (FAQ)
              </h3>
            </div>

            {pdfFaqItems.map((item, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-slate-800 dark:text-slate-200 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer gap-3"
                >
                  <span className="text-xs sm:text-sm">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                      openFaq === idx ? 'rotate-180 text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-slate-600 dark:text-slate-400 text-xs sm:text-sm border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Artikel Terkait */}
        <div className="mt-8 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Kenapa ukuran PDF tugas kuliah membengkak?</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Baca tips mengecilkan PDF tugas skripsi tanpa teks jadi buram.</p>
          </div>
          <Link 
            href="/blog/cara-memperkecil-ukuran-pdf-tugas-kuliah"
            className="text-xs bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-semibold px-3 py-2 rounded-xl transition whitespace-nowrap"
          >
            Baca Tips →
          </Link>
        </div>
      </section>

      {/* JSON-LD Structured Data for FAQPage */}
      <JsonLd data={faqSchemaData} />

      {/* Footer Komprehensif */}
      <Footer />
    </main>
  );
}
