'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ChevronDown,
  BookOpen,
  HelpCircle,
  Truck,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';

interface HistoryItem {
  date: string;
  desc: string;
  location?: string;
}

interface TrackingData {
  status: 'DELIVERED' | 'ON_PROCESS' | 'PENDING' | 'PROBLEM';
  statusText: string;
  courier: string;
  courierName: string;
  awb: string;
  origin: string;
  destination: string;
  sender: string;
  receiver: string;
  lastUpdate: string;
  history: HistoryItem[];
  isDemo?: boolean;
  demoNotice?: string;
}

interface SavedSearch {
  awb: string;
  courier: string;
  courierName: string;
  time: string;
}

const COURIER_OPTIONS = [
  { value: 'shopeexpress', label: 'Shopee Xpress (SPX)' },
  { value: 'jne', label: 'JNE Express' },
  { value: 'jnt', label: 'J&T Express' },
  { value: 'sicepat', label: 'SiCepat Ekspres' },
  { value: 'anteraja', label: 'Anteraja' },
  { value: 'pos', label: 'Pos Indonesia' },
  { value: 'tiki', label: 'TIKI' },
  { value: 'wahana', label: 'Wahana Logistik' },
  { value: 'ninja', label: 'Ninja Xpress' },
  { value: 'idexpress', label: 'ID Express' },
  { value: 'lion', label: 'Lion Parcel' },
];

export default function TrackingPage() {
  const [resiNumber, setResiNumber] = useState<string>('');
  const [courier, setCourier] = useState<string>('shopeexpress');
  const [detectedCourierName, setDetectedCourierName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [trackingResult, setTrackingResult] = useState<TrackingData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kk_track_history');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });
  const [copied, setCopied] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // FAQ Data untuk Konten Editorial & Schema JSON-LD
  const trackingFaqItems = [
    {
      q: 'Berapa lama waktu yang dibutuhkan agar nomor resi baru mulai terlacak di sistem?',
      a: 'Umumnya nomor resi baru akan mulai terlacak 1 hingga 6 jam setelah paket diserahkan ke gerai kurir atau dijemput kurir pick-up. Pada saat penjual baru membuat label pengiriman (booking), status mungkin masih berstatus "Data Belum Ditemukan" atau "Manifested" hingga paket tiba dan dipindai di agen sortir pertama.',
    },
    {
      q: 'Apa yang harus dilakukan jika riwayat paket berhenti (stuck) di hub sortir selama berhari-hari?',
      a: 'Jika paket tidak mengalami pergerakan status lebih dari 48-72 jam di kota transit, segera hubungi layanan pelanggan ekspedisi terkait melalui WhatsApp atau email resmi dengan menyebutkan nomor resi Anda, atau hubungi penjual marketplace untuk mengajukan investigasi kendala logistik.',
    },
    {
      q: 'Mengapa status paket tertulis "Delivered" tetapi penerima belum memegang paket fisik?',
      a: 'Sering kali kurir menitipkan paket kepada anggota keluarga serumah, petugas keamanan (satpam pos), resepsionis kantor, atau tetangga sekitar. Periksa kolom "Diterima Oleh" pada timeline riwayat di atas untuk melihat nama pihak yang menandatangani penerimaan paket.',
    },
    {
      q: 'Apakah riwayat nomor resi yang saya lacak tersimpan di server KompresKilat?',
      a: 'Tidak. KompresKilat menerapkan Zero-Knowledge Privacy di mana riwayat 5 resi terakhir Anda hanya disimpan secara lokal di dalam memori browser (LocalStorage) perangkat Anda sendiri. Anda dapat membersihkannya kapan saja dengan tombol "Hapus Riwayat".',
    },
    {
      q: 'Ekspedisi kurir apa saja yang dapat dilacak secara akurat di KompresKilat?',
      a: 'KompresKilat mendukung pelacakan real-time untuk lebih dari 11 ekspedisi besar di Indonesia, meliputi Shopee Xpress (SPX), JNE Express, J&T Express, SiCepat Ekspres, Anteraja, Pos Indonesia, TIKI, Wahana Logistik, Ninja Xpress, ID Express, dan Lion Parcel.',
    },
  ];

  const faqSchemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: trackingFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  // Simpan riwayat ke LocalStorage
  const saveToHistory = (awb: string, courierCode: string, courierName: string) => {
    try {
      const newEntry: SavedSearch = {
        awb,
        courier: courierCode,
        courierName,
        time: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      };
      const filtered = savedSearches.filter((item) => item.awb !== awb);
      const updated = [newEntry, ...filtered].slice(0, 5); // Simpan 5 resi terakhir
      setSavedSearches(updated);
      localStorage.setItem('kk_track_history', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const clearHistory = () => {
    setSavedSearches([]);
    localStorage.removeItem('kk_track_history');
  };

  // Logika Deteksi Kurir Otomatis berdasarkan pola Resi
  const handleResiChange = (value: string) => {
    setResiNumber(value);
    const upper = value.trim().toUpperCase();

    if (upper.startsWith('SPX') || upper.startsWith('ID04') || upper.startsWith('SPXID')) {
      setCourier('shopeexpress');
      setDetectedCourierName('Shopee Xpress (SPX)');
    } else if (upper.startsWith('JP') || upper.startsWith('JX') || upper.startsWith('JT')) {
      setCourier('jnt');
      setDetectedCourierName('J&T Express');
    } else if (upper.startsWith('TK') || upper.startsWith('00')) {
      setCourier('sicepat');
      setDetectedCourierName('SiCepat Ekspres');
    } else if (/^\d{15,16}$/.test(upper) || upper.startsWith('01') || upper.startsWith('10')) {
      setCourier('jne');
      setDetectedCourierName('JNE Express');
    } else if (upper.startsWith('1000') || upper.startsWith('AP')) {
      setCourier('anteraja');
      setDetectedCourierName('Anteraja');
    } else if (upper.startsWith('P2') || upper.startsWith('POS')) {
      setCourier('pos');
      setDetectedCourierName('Pos Indonesia');
    } else if (upper.startsWith('NLID')) {
      setCourier('ninja');
      setDetectedCourierName('Ninja Xpress');
    } else {
      setDetectedCourierName('');
    }
  };

  // Submit Lacak Resi via Next.js API Route
  const executeTrack = async (awbToTrack: string, courierToTrack: string) => {
    if (!awbToTrack.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    setTrackingResult(null);

    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courier: courierToTrack, awb: awbToTrack }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setTrackingResult(json.data);
        saveToHistory(json.data.awb, json.data.courier, json.data.courierName);
      } else {
        setErrorMessage(json.message || 'Gagal melacak resi. Periksa kembali nomor resi dan kurir.');
      }
    } catch {
      setErrorMessage('Terjadi gangguan jaringan saat menghubungi server pelacak.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeTrack(resiNumber, courier);
  };

  // Salin ringkasan ke Clipboard untuk dibagikan via WhatsApp
  const handleCopyStatus = () => {
    if (!trackingResult) return;
    const text = `📦 *STATUS PENGIRIMAN PAKET*\n` +
      `No. Resi: ${trackingResult.awb}\n` +
      `Kurir: ${trackingResult.courierName}\n` +
      `Status: ${trackingResult.statusText}\n` +
      `Pengirim: ${trackingResult.sender}\n` +
      `Penerima: ${trackingResult.receiver}\n` +
      `Update Terakhir: ${trackingResult.lastUpdate}\n\n` +
      `*Riwayat Terakhir:*\n${trackingResult.history[0]?.desc || '-'}\n\n` +
      `_Dilacak via KompresKilat_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Bagaimana cara melacak nomor resi paket secara online?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Cukup masukkan nomor resi paket Anda ke kolom pelacakan KompresKilat. Sistem kami akan mendeteksi otomatis ekspedisi (Shopee Express, JNE, J&T, SiCepat) dan menampilkan riwayat perjalanan paket secara real-time.',
        },
      },
      {
        '@type': 'Question',
        name: 'Ekspedisi apa saja yang didukung oleh KompresKilat?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Kami mendukung seluruh ekspedisi utama di Indonesia: Shopee Xpress (SPX), JNE Express, J&T Express, SiCepat, Anteraja, Pos Indonesia, TIKI, Wahana, Ninja Xpress, dan ID Express.',
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={faqSchema} />
      <Navbar />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold mb-2">
            🚀 Multi-Ekspedisi Otomatis
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">📦 Cek Resi & Lacak Paket Online</h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Pantau posisi paket pengiriman Anda secara real-time dari Shopee Express, J&T, JNE, SiCepat, Anteraja, Pos Indonesia, dan kurir lainnya.
          </p>
        </div>

        {/* Form Pelacakan */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Nomor Resi / AWB:</label>
                {detectedCourierName && (
                  <span className="text-[11px] bg-green-50 text-green-700 font-medium px-2 py-0.5 rounded-full border border-green-200">
                    ✓ Terdeteksi: {detectedCourierName}
                  </span>
                )}
              </div>
              <input 
                type="text" 
                placeholder="Masukkan No. Resi (Contoh: SPXID04829103, JP9182390)"
                value={resiNumber}
                onChange={(e) => handleResiChange(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Ekspedisi / Kurir:</label>
              <select 
                value={courier} 
                onChange={(e) => {
                  setCourier(e.target.value);
                  setDetectedCourierName('');
                }}
                className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {COURIER_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm disabled:bg-slate-300 cursor-pointer flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Sedang Menghubungi Server Ekspedisi...</span>
                </>
              ) : (
                <span>Lacak Paket Sekarang 🔍</span>
              )}
            </button>
          </form>

          {/* Riwayat Resi Tersimpan di Browser */}
          {savedSearches.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  🕒 Riwayat Resi Terakhir
                </span>
                <button 
                  onClick={clearHistory}
                  className="text-[10px] text-red-500 hover:underline cursor-pointer"
                >
                  Hapus Semua
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {savedSearches.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setResiNumber(item.awb);
                      setCourier(item.courier);
                      executeTrack(item.awb, item.courier);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-xs font-mono border border-slate-200 transition text-slate-700 cursor-pointer"
                  >
                    <span>{item.awb}</span>
                    <span className="text-[10px] text-slate-400">({item.courierName})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Slot Iklan High-CTR: Tepat di Bawah Form Lacak Resi */}
        <AdBanner zone="in-tool" label="Iklan Sponsor" />

        {/* Pesan Error jika resi tidak valid */}
        {errorMessage && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            ⚠️ <b>Pemberitahuan:</b> {errorMessage}
          </div>
        )}

        {/* Hasil Lacak Resi */}
        {trackingResult && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs text-slate-400">Kurir Pengiriman: <b>{trackingResult.courierName}</b></p>
                <h2 className="text-xl font-mono font-bold text-slate-900 mt-0.5">{trackingResult.awb}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-3 py-1.5 font-bold rounded-full border ${
                  trackingResult.status === 'DELIVERED'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {trackingResult.statusText}
                </span>
                <button
                  onClick={handleCopyStatus}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition cursor-pointer"
                  title="Salin rincian status ke clipboard untuk WhatsApp"
                >
                  {copied ? '✓ Disalin!' : '📋 Salin'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block mb-0.5">Pengirim:</span>
                <span className="font-semibold text-slate-800">{trackingResult.sender}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Asal: {trackingResult.origin}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Penerima:</span>
                <span className="font-semibold text-slate-800">{trackingResult.receiver}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Tujuan: {trackingResult.destination}</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                <span>📍</span> Timeline Riwayat Perjalanan Paket
              </h3>
              <div className="space-y-6 border-l-2 border-indigo-200 pl-4 ml-2">
                {trackingResult.history.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full ring-4 ${
                      idx === 0 
                        ? 'bg-indigo-600 ring-indigo-100' 
                        : 'bg-slate-300 ring-slate-100'
                    }`} />
                    <p className="text-xs font-bold text-indigo-600">{item.date}</p>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{item.desc}</p>
                    {item.location && (
                      <span className="inline-block mt-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        Lokasi: {item.location}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Slot Iklan Kepatuhan AdSense */}
        <div className="my-10">
          <AdBanner zone="in-tool" label="Iklan" />
        </div>

        {/* ============================================================ */}
        {/* KONTEN EDITORIAL: Panduan Lengkap Cek Resi & Ekspedisi        */}
        {/* ============================================================ */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs px-3 py-1 rounded-full font-bold mb-3">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Panduan Cek Resi Logistik Indonesia</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Panduan Cek Resi &amp; Cara Memantau Perjalanan Paket Belanja Online
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Dalam era transaksi belanja daring (*e-commerce*) di Indonesia, nomor resi pengiriman atau <em>Air Waybill</em> (AWB) adalah bukti sah bahwa barang pesanan Anda telah diserahkan oleh penjual (*seller*) ke pihak penyedia jasa kurir logistik. Setiap kali paket berpindah dari kota asal, pusat sortir transit (*Hub Gateway*), kantor cabang pembantu (*Drop Point*), hingga dibawa kurir pengantar (*Delivery Rider*), barcode resi akan dipindai secara digital untuk memperbarui koordinat posisi paket secara real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <span className="text-xl block">🚚</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Deteksi Kurir Otomatis</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Sistem secara cerdas mengenali kode awalan nomor resi Shopee Express (SPXID), JNE, J&amp;T, SiCepat, dan Anteraja tanpa perlu Anda pilih manual.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <span className="text-xl block">⏱️</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Riwayat Checkpoint Lengkap</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Menampilkan timeline lengkap tanggal, jam, lokasi gudang transit, dan status pengantaran dari awal kirim hingga tiba di tangan penerima.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <span className="text-xl block">💾</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Simpan Riwayat Lokal</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                5 nomor resi terakhir tersimpan rapi di browser Anda sehingga Anda dapat mengecek status harian cukup dengan satu ketukan jari.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Arti Istilah Status Pengiriman yang Wajib Diketahui:
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>
                <strong>Manifested / Shipment Created:</strong> Nomor resi telah dicetak oleh penjual di sistem, namun paket fisik belum tentu sudah diserahkan ke pihak ekspedisi.
              </li>
              <li>
                <strong>On Process / In Transit:</strong> Paket sedang dalam perjalanan antarkota menggunakan armada truk logistik atau kargo udara menuju fasilitas hub sortir kota tujuan Anda.
              </li>
              <li>
                <strong>Received at Sorting Hub:</strong> Paket telah tiba di pusat pemilahan regional dan sedang dikelompokkan berdasarkan area kecamatan/kelurahan pengantaran.
              </li>
              <li>
                <strong>With Delivery Courier / Out for Delivery:</strong> Paket sudah dibawa oleh kurir bertugas dan akan diantarkan ke alamat rumah Anda pada hari itu juga.
              </li>
              <li>
                <strong>Delivered:</strong> Paket telah sukses diserahkan dan ditandatangani oleh penerima atau pihak keluarga/keamanan di lokasi.
              </li>
            </ul>
          </div>

          {/* ============================================================ */}
          {/* FAQ (Pertanyaan yang Sering Diajukan)                         */}
          {/* ============================================================ */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Pertanyaan yang Sering Diajukan Seputar Pelacakan Resi (FAQ)
              </h3>
            </div>

            {trackingFaqItems.map((item, idx) => (
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

        {/* Artikel Panduan Terkait (SEO Internal Link) */}
        <div className="mt-8 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">📚 Panduan Ekspedisi Terkait:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <Link 
              href="/blog/cara-lacak-paket-shopee-express-spx-akurat" 
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/70 hover:text-indigo-600 dark:hover:text-indigo-400 transition border border-slate-100 dark:border-slate-700/60 block"
            >
              <span className="font-semibold block text-slate-800 dark:text-slate-200">Cara Lacak Paket Shopee Express (SPX)</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Pahami arti status sortir transit di Hub SPX.</span>
            </Link>
            <Link 
              href="/blog/arti-status-resi-jne-jnt-sicepat-lengkap" 
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/70 hover:text-indigo-600 dark:hover:text-indigo-400 transition border border-slate-100 dark:border-slate-700/60 block"
            >
              <span className="font-semibold block text-slate-800 dark:text-slate-200">Daftar Istilah Resi JNE, J&amp;T, SiCepat</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Ketahui arti istilah Manifested, Transit, Bad Address.</span>
            </Link>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data for FAQPage */}
      <JsonLd data={faqSchemaData} />

      {/* Footer Komprehensif */}
      <Footer />
    </main>
  );
}
