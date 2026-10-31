'use client';

import React, { useState } from 'react';

interface HistoryItem {
  date: string;
  desc: string;
  location?: string;
}

interface TrackingResult {
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
}

const POPULAR_COURIERS = [
  { value: 'shopeexpress', label: 'Shopee Xpress (SPX)' },
  { value: 'jne', label: 'JNE Express' },
  { value: 'jnt', label: 'J&T Express' },
  { value: 'sicepat', label: 'SiCepat Ekspres' },
  { value: 'anteraja', label: 'Anteraja' },
  { value: 'pos', label: 'Pos Indonesia' },
  { value: 'tiki', label: 'TIKI' },
  { value: 'lion', label: 'Lion Parcel' },
];

export default function TrackingWidget() {
  const [resiNumber, setResiNumber] = useState('');
  const [courier, setCourier] = useState('shopeexpress');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanResi = resiNumber.trim();
    if (!cleanResi) {
      setErrorMessage('Nomor resi tidak boleh kosong.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setResult(null);

    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ awb: cleanResi, courier }),
      });

      const json = await response.json();

      if (response.ok && json.success && json.data) {
        setResult(json.data);
      } else {
        setErrorMessage(json.message || 'Nomor resi tidak ditemukan. Pastikan kurir dan nomor resi sesuai.');
      }
    } catch {
      setErrorMessage('Gagal menghubungi server pelacakan. Periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const summary = `📦 Pelacakan Resi: ${result.awb} (${result.courierName})\nStatus: ${result.statusText}\nPosisi Terakhir: ${result.history?.[0]?.desc || '-'}\nUpdate: ${result.lastUpdate}`;
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Kartu Form Input */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📦</span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Lacak Resi Ekspedisi
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Resi / AWB:
            </label>
            <input
              type="text"
              placeholder="Contoh: SPXID04829103, JP9182390, SOCAG001..."
              value={resiNumber}
              onChange={(e) => {
                setResiNumber(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Kurir Ekspedisi:
            </label>
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {POPULAR_COURIERS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading || !resiNumber.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl transition duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Menghubungi Server Ekspedisi...</span>
              </>
            ) : (
              <span>Lacak Paket Sekarang 🔍</span>
            )}
          </button>
        </form>

        {/* Notifikasi Pesan Error */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Kotak Hasil Status & Riwayat Perjalanan */}
      {result && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
          {/* Header Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs text-slate-400">
                Kurir: <b className="text-slate-700">{result.courierName}</b>
              </p>
              <h3 className="text-xl font-mono font-bold text-slate-900 mt-0.5">
                {result.awb}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-3 py-1 font-bold rounded-full border ${
                  result.status === 'DELIVERED'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                {result.statusText}
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition cursor-pointer"
              >
                {isCopied ? '✓ Disalin' : '📋 Salin'}
              </button>
            </div>
          </div>

          {/* Rincian Pengirim & Penerima */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Pengirim:</span>
              <span className="font-semibold text-slate-800">{result.sender}</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Asal: {result.origin}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Penerima:</span>
              <span className="font-semibold text-slate-800">{result.receiver}</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Tujuan: {result.destination}</span>
            </div>
          </div>

          {/* Riwayat Perjalanan Paket (Timeline) */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>📍</span>
              <span>Riwayat Perjalanan Paket</span>
            </h4>

            {result.history && result.history.length > 0 ? (
              <div className="relative border-l-2 border-indigo-200 ml-3.5 space-y-5">
                {result.history.map((step, idx) => (
                  <div key={idx} className="relative pl-6">
                    {/* Titik Indikator Timeline */}
                    <div
                      className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 ${
                        idx === 0
                          ? 'bg-indigo-600 border-white ring-2 ring-indigo-500'
                          : 'bg-slate-300 border-white'
                      }`}
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-indigo-700 block mb-0.5">
                        {step.date}
                      </span>
                      <p className="text-slate-700 leading-relaxed font-sans">{step.desc}</p>
                      {step.location && (
                        <span className="inline-block mt-1 text-[11px] text-slate-400">
                          Lokasi: {step.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada rincian riwayat perjalanan.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

