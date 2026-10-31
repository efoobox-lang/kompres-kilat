'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
];

export default function TrackingPage() {
  const [resiNumber, setResiNumber] = useState<string>('');
  const [courier, setCourier] = useState<string>('shopeexpress');
  const [detectedCourierName, setDetectedCourierName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [trackingResult, setTrackingResult] = useState<TrackingData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // Ambil riwayat dari LocalStorage saat mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kk_track_history');
      if (stored) {
        setSavedSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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
    } catch (err: any) {
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

        {/* Artikel Panduan Terkait (SEO Internal Link) */}
        <div className="mt-10 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-3">📚 Panduan Ekspedisi Terkait:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <Link 
              href="/blog/cara-lacak-paket-shopee-express-spx-akurat" 
              className="p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition border border-slate-100 block"
            >
              <span className="font-semibold block">Cara Lacak Paket Shopee Express (SPX)</span>
              <span className="text-[11px] text-slate-500">Pahami arti status sortir transit di Hub SPX.</span>
            </Link>
            <Link 
              href="/blog/arti-status-resi-jne-jnt-sicepat-lengkap" 
              className="p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition border border-slate-100 block"
            >
              <span className="font-semibold block">Daftar Istilah Resi JNE, J&T, SiCepat</span>
              <span className="text-[11px] text-slate-500">Ketahui arti istilah Manifested, Transit, Bad Address.</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Komprehensif */}
      <Footer />
    </main>
  );
}
