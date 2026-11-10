'use client';

import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolEditorialSection from '@/components/ToolEditorialSection';
import JsonLd from '@/components/JsonLd';
import {
  TrendingUp,
  Tag,
  ReceiptText,
  Copy,
  Check,
  Coins,
  Info
} from 'lucide-react';

export default function BusinessCalculatorPage() {
  const [activeTab, setActiveTab] = useState<'margin' | 'discount' | 'tax'>('margin');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ==========================================
  // 1. STATE: KALKULATOR MARGIN KEUNTUNGAN
  // ==========================================
  const [costPrice, setCostPrice] = useState<number>(50000); // Modal / HPP
  const [extraCost, setExtraCost] = useState<number>(5000); // Biaya operasional/packing
  const [calcMode, setCalcMode] = useState<'margin' | 'markup'>('margin');
  const [targetPercentage, setTargetPercentage] = useState<number>(30); // Target %

  // Perhitungan Live Margin & Markup
  const marginResults = useMemo(() => {
    const totalCost = (costPrice || 0) + (extraCost || 0);
    const pct = targetPercentage || 0;

    let sellingPrice = 0;
    let profit = 0;
    let actualMargin = 0;
    let actualMarkup = 0;

    if (calcMode === 'margin') {
      // Margin % = (Profit / Selling Price) * 100
      // Selling Price = Total Cost / (1 - Margin/100)
      if (pct >= 100) {
        sellingPrice = totalCost * 2;
      } else {
        sellingPrice = totalCost / (1 - pct / 100);
      }
      profit = sellingPrice - totalCost;
      actualMargin = pct;
      actualMarkup = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    } else {
      // Markup % = (Profit / Total Cost) * 100
      // Selling Price = Total Cost * (1 + Markup/100)
      profit = totalCost * (pct / 100);
      sellingPrice = totalCost + profit;
      actualMarkup = pct;
      actualMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
    }

    return {
      totalCost,
      sellingPrice: Math.round(sellingPrice),
      profit: Math.round(profit),
      actualMargin: parseFloat(actualMargin.toFixed(1)),
      actualMarkup: parseFloat(actualMarkup.toFixed(1)),
    };
  }, [costPrice, extraCost, calcMode, targetPercentage]);

  // ==========================================
  // 2. STATE: KALKULATOR DISKON BERTINGKAT
  // ==========================================
  const [originalPrice, setOriginalPrice] = useState<number>(200000);
  const [discount1, setDiscount1] = useState<number>(50);
  const [discount2, setDiscount2] = useState<number>(20);
  const [extraVoucher, setExtraVoucher] = useState<number>(0);

  // Perhitungan Live Diskon Bertingkat
  const discountResults = useMemo(() => {
    const price = originalPrice || 0;
    const d1 = Math.min(100, Math.max(0, discount1 || 0));
    const d2 = Math.min(100, Math.max(0, discount2 || 0));
    const voucher = extraVoucher || 0;

    const cut1 = (price * d1) / 100;
    const priceAfterD1 = price - cut1;

    const cut2 = (priceAfterD1 * d2) / 100;
    const priceAfterD2 = priceAfterD1 - cut2;

    const finalPrice = Math.max(0, priceAfterD2 - voucher);
    const totalSaved = price - finalPrice;
    const effectiveDiscountPct = price > 0 ? (totalSaved / price) * 100 : 0;

    return {
      price,
      cut1: Math.round(cut1),
      priceAfterD1: Math.round(priceAfterD1),
      cut2: Math.round(cut2),
      finalPrice: Math.round(finalPrice),
      totalSaved: Math.round(totalSaved),
      effectiveDiscountPct: parseFloat(effectiveDiscountPct.toFixed(1)),
    };
  }, [originalPrice, discount1, discount2, extraVoucher]);

  // ==========================================
  // 3. STATE: KALKULATOR PAJAK UMKM 0.5% (PP 23/2018 & UU HPP)
  // ==========================================
  const [taxpayerType, setTaxpayerType] = useState<'individual' | 'corporate'>('individual');
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(25000000);
  const [ytdRevenue, setYtdRevenue] = useState<number>(150000000); // Akumulasi omzet berjalan tahun ini

  // Perhitungan Pajak Final
  const taxResults = useMemo(() => {
    const rev = monthlyRevenue || 0;
    const ytd = ytdRevenue || 0;
    const ptkp = 500000000; // Batas Rp 500 Juta bebas pajak per tahun bagi Orang Pribadi (UU HPP)

    let taxableAmount = 0;
    let taxDue = 0;
    let remainingFreeQuota = 0;

    if (taxpayerType === 'corporate') {
      // Badan (CV/PT) tidak ada batas 500 juta, kena flat 0.5% dari seluruh omzet
      taxableAmount = rev;
      taxDue = rev * 0.005;
      remainingFreeQuota = 0;
    } else {
      // Orang Pribadi (UU Harmonisasi Peraturan Perpajakan)
      const prevTotal = ytd;
      const newTotal = prevTotal + rev;

      if (prevTotal >= ptkp) {
        // Sudah lewat 500 juta sebelumnya, seluruh omzet bulan ini kena pajak
        taxableAmount = rev;
        remainingFreeQuota = 0;
      } else if (newTotal <= ptkp) {
        // Belum mencapai 500 juta, bebas pajak 0%
        taxableAmount = 0;
        remainingFreeQuota = ptkp - newTotal;
      } else {
        // Bulan ini melewati batas 500 juta (porsi selisihnya yang kena pajak)
        taxableAmount = newTotal - ptkp;
        remainingFreeQuota = 0;
      }

      taxDue = taxableAmount * 0.005;
    }

    return {
      taxableAmount: Math.round(taxableAmount),
      taxDue: Math.round(taxDue),
      remainingFreeQuota: Math.max(0, Math.round(remainingFreeQuota)),
      isExempt: taxDue === 0 && taxpayerType === 'individual',
    };
  }, [taxpayerType, monthlyRevenue, ytdRevenue]);

  // Helper format Rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Helper copy text
  const handleCopySummary = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Ringkasan Teks Margin
  const marginSummaryText = `📊 *RINGKASAN HARGA JUAL & MARGIN KEUNTUNGAN (KompresKilat)*
- Total Modal (HPP + Ops): ${formatRupiah(marginResults.totalCost)}
- Target ${calcMode === 'margin' ? 'Margin' : 'Markup'}: ${targetPercentage}%
- Rekomendasi Harga Jual: ${formatRupiah(marginResults.sellingPrice)}
- Keuntungan Bersih per Unit: ${formatRupiah(marginResults.profit)}
- Margin Efektif: ${marginResults.actualMargin}%
- Markup Efektif: ${marginResults.actualMarkup}%

Dihitung via Kalkulator Bisnis & UMKM KompresKilat.`;

  // Ringkasan Teks Diskon
  const discountSummaryText = `🏷️ *RINGKASAN DISKON BERTINGKAT (KompresKilat)*
- Harga Awal: ${formatRupiah(discountResults.price)}
- Diskon Utama: ${discount1}% (Potongan: ${formatRupiah(discountResults.cut1)})
- Diskon Tambahan: ${discount2}% (Potongan: ${formatRupiah(discountResults.cut2)})
- Harga Akhir yang Dibayar: ${formatRupiah(discountResults.finalPrice)}
- Total Hemat: ${formatRupiah(discountResults.totalSaved)} (${discountResults.effectiveDiscountPct}%)

Dihitung via Kalkulator Bisnis & UMKM KompresKilat.`;

  // Ringkasan Teks Pajak
  const taxSummaryText = `📑 *RINGKASAN ESTIMASI PAJAK PPh FINAL UMKM 0.5% (KompresKilat)*
- Wajib Pajak: ${taxpayerType === 'individual' ? 'Orang Pribadi (UMKM)' : 'Badan Usaha (CV / PT)'}
- Omzet Bulan Ini: ${formatRupiah(monthlyRevenue)}
- Porsi Omzet Kena Pajak: ${formatRupiah(taxResults.taxableAmount)}
- PPh Final 0.5% yang Harus Disetor: ${formatRupiah(taxResults.taxDue)}
${taxpayerType === 'individual' ? `- Sisa Kuota Bebas Pajak (s.d. 500 Juta): ${formatRupiah(taxResults.remainingFreeQuota)}` : ''}

Dihitung via Kalkulator Bisnis & UMKM KompresKilat.`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Kalkulator Bisnis & UMKM Online Indonesia - KompresKilat',
    description: 'Hitung harga jual margin keuntungan, simulasi diskon bertingkat (50% + 20%), dan estimasi pajak PPh Final UMKM 0.5% secara live.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <JsonLd data={schema} />
      <Navbar />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header Hero */}
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs px-3.5 py-1 rounded-full font-bold mb-2">
            <Coins className="w-3.5 h-3.5" />
            Alat Finansial &amp; Penetapan Harga Bisnis
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            Kalkulator Bisnis &amp; UMKM Indonesia
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Hitung harga jual ideal dari modal, simulasikan diskon bertingkat retail, serta estimasi pajak PPh Final 0.5% UMKM secara akurat dan otomatis.
          </p>
        </div>

        {/* Tab Navigasi 3 Alat Utama */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('margin')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer text-center ${
              activeTab === 'margin'
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                : 'bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Margin &amp; Harga Jual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discount')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer text-center ${
              activeTab === 'discount'
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                : 'bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Diskon Bertingkat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tax')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer text-center ${
              activeTab === 'tax'
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                : 'bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>Pajak Final 0.5%</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* 1. KALKULATOR MARGIN & HARGA JUAL                         */}
        {/* ======================================================== */}
        {activeTab === 'margin' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Input */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Kalkulator Margin &amp; Penetapan Harga Jual
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Tentukan harga jual yang tepat agar bisnis tidak nombok oleh biaya tersembunyi.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Biaya Modal Produk / HPP (Rp):
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={costPrice || ''}
                  onChange={(e) => setCostPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Contoh: 50000"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Biaya Kemasan, Lakban &amp; Operasional Tambahan (Rp):
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={extraCost || ''}
                  onChange={(e) => setExtraCost(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Contoh: 5000"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Mode Perhitungan: Margin vs Markup */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Metode Keuntungan:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcMode('margin')}
                    className={`py-2 px-3 rounded-xl border font-bold text-center transition cursor-pointer ${
                      calcMode === 'margin'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Target Margin (% dari Harga Jual)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcMode('markup')}
                    className={`py-2 px-3 rounded-xl border font-bold text-center transition cursor-pointer ${
                      calcMode === 'markup'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Target Markup (% dari Modal)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">
                    Persentase Keuntungan Diinginkan:
                  </label>
                  <span className="font-bold text-indigo-600 text-sm">{targetPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="1"
                  value={targetPercentage}
                  onChange={(e) => setTargetPercentage(parseInt(e.target.value) || 0)}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>5% (Tipis)</span>
                  <span>30% (Standar Retail)</span>
                  <span>50% (F&amp;B / Fashion)</span>
                  <span>90% (Jasa / Digital)</span>
                </div>
              </div>
            </div>

            {/* Hasil Perhitungan Live */}
            <div className="lg:col-span-5 bg-gradient-to-br from-indigo-50/50 to-white p-5 sm:p-7 rounded-2xl border border-indigo-200 shadow-sm space-y-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                Hasil Rekomendasi Harga Jual
              </span>

              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-xs">
                <span className="text-[11px] text-slate-500 block mb-0.5">Rekomendasi Harga Jual:</span>
                <span className="text-2xl sm:text-3xl font-black text-indigo-700 block">
                  {formatRupiah(marginResults.sellingPrice)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Total Modal: <b>{formatRupiah(marginResults.totalCost)}</b>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Profit Bersih / Pcs:</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    +{formatRupiah(marginResults.profit)}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Margin / Markup:</span>
                  <span className="font-bold text-slate-800 text-xs">
                    {marginResults.actualMargin}% / {marginResults.actualMarkup}%
                  </span>
                </div>
              </div>

              {/* Proyeksi Terjual */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-700 block text-[11px]">
                  Proyeksi Keuntungan Bersih:
                </span>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Terjual 10 pcs:</span>
                  <span className="font-bold text-emerald-600">+{formatRupiah(marginResults.profit * 10)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Terjual 50 pcs:</span>
                  <span className="font-bold text-emerald-600">+{formatRupiah(marginResults.profit * 50)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Terjual 100 pcs:</span>
                  <span className="font-bold text-emerald-600">+{formatRupiah(marginResults.profit * 100)}</span>
                </div>
              </div>

              {/* Tombol Salin */}
              <button
                type="button"
                onClick={() => handleCopySummary(marginSummaryText, 'margin')}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedKey === 'margin' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Ringkasan Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Ringkasan Hitungan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. KALKULATOR DISKON BERTINGKAT                           */}
        {/* ======================================================== */}
        {activeTab === 'discount' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  Kalkulator Diskon Ganda (Contoh: 50% + 20%)
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Hitung harga akhir sebenarnya saat melihat promo diskon bertingkat di mall atau e-commerce.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Harga Asli / Normal (Rp):
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={originalPrice || ''}
                  onChange={(e) => setOriginalPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Contoh: 200000"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Diskon Pertama (%):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount1 || ''}
                    onChange={(e) => setDiscount1(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    placeholder="50"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Diskon Tambahan (+ %):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount2 || ''}
                    onChange={(e) => setDiscount2(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    placeholder="20"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Potongan Voucher Tambahan (Opsional - Rp):
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={extraVoucher || ''}
                  onChange={(e) => setExtraVoucher(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Contoh: 10000"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Edukasi Promo Diskon */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <b>Tips Konsumen:</b> Diskon bertingkat <b>50% + 20% BUKAN berarti diskon 70%</b>! Diskon 20% kedua dihitung dari sisa harga setelah dipotong 50%, sehingga diskon efektifnya adalah <b>60%</b>.
                </p>
              </div>
            </div>

            {/* Hasil Perhitungan Diskon Live */}
            <div className="lg:col-span-5 bg-gradient-to-br from-emerald-50/50 to-white p-5 sm:p-7 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                Total yang Harus Dibayar
              </span>

              <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
                <span className="text-[11px] text-slate-500 block mb-0.5">Harga Akhir Setelah Diskon:</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 block">
                  {formatRupiah(discountResults.finalPrice)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Harga Normal: <s className="text-red-500">{formatRupiah(discountResults.price)}</s>
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Potongan Diskon 1 ({discount1}%):</span>
                  <span className="font-semibold text-slate-800">-{formatRupiah(discountResults.cut1)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Potongan Diskon 2 ({discount2}%):</span>
                  <span className="font-semibold text-slate-800">-{formatRupiah(discountResults.cut2)}</span>
                </div>
                {extraVoucher > 0 && (
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Voucher Tambahan:</span>
                    <span className="font-semibold text-slate-800">-{formatRupiah(extraVoucher)}</span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-xs text-emerald-700">
                  <span>Total Penghematan:</span>
                  <span>
                    {formatRupiah(discountResults.totalSaved)} ({discountResults.effectiveDiscountPct}%)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopySummary(discountSummaryText, 'discount')}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedKey === 'discount' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Ringkasan Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Rincian Diskon</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. KALKULATOR PAJAK UMKM 0.5% (PP 23/2018 & UU HPP)        */}
        {/* ======================================================== */}
        {activeTab === 'tax' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-indigo-600" />
                  Kalkulator Pajak UMKM Final 0.5% (PP 23 / UU HPP)
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Hitung setoran PPh Final 0.5% bulanan lengkap dengan fasilitas bebas pajak omzet s.d. Rp 500 juta.
                </p>
              </div>

              {/* Tipe Wajib Pajak */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Kategori Usaha:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTaxpayerType('individual')}
                    className={`py-2 px-3 rounded-xl border font-bold text-center transition cursor-pointer ${
                      taxpayerType === 'individual'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    👤 Orang Pribadi (Bebas s.d. 500 Juta)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaxpayerType('corporate')}
                    className={`py-2 px-3 rounded-xl border font-bold text-center transition cursor-pointer ${
                      taxpayerType === 'corporate'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    🏢 Badan Usaha (CV / PT - Flat 0.5%)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Omzet / Peredaran Bruto Bulan Ini (Rp):
                </label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={monthlyRevenue || ''}
                  onChange={(e) => setMonthlyRevenue(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Contoh: 25000000"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {taxpayerType === 'individual' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Akumulasi Omzet dari Awal Tahun s.d. Bulan Lalu (Rp):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000000"
                    value={ytdRevenue || ''}
                    onChange={(e) => setYtdRevenue(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="Contoh: 150000000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Sesuai UU Harmonisasi Peraturan Perpajakan (UU HPP), UMKM Orang Pribadi mendapat batas omzet tidak kena pajak sebesar <b>Rp 500 Juta dalam setahun</b>.
                  </p>
                </div>
              )}
            </div>

            {/* Hasil Perhitungan Pajak Live */}
            <div className="lg:col-span-5 bg-gradient-to-br from-amber-50/50 to-white p-5 sm:p-7 rounded-2xl border border-amber-200 shadow-sm space-y-4">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                Estimasi PPh Final 0.5% yang Wajib Disetor
              </span>

              <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
                <span className="text-[11px] text-slate-500 block mb-0.5">Pajak PPh Final Bulan Ini:</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-600 block">
                  {formatRupiah(taxResults.taxDue)}
                </span>
                {taxResults.isExempt ? (
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1.5">
                    🎉 Bebas Pajak (Omzet belum tembus Rp 500 Juta)
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Dihitung 0.5% × {formatRupiah(taxResults.taxableAmount)}
                  </span>
                )}
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Omzet Kotor Bulan Ini:</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(monthlyRevenue)}</span>
                </div>
                {taxpayerType === 'individual' && (
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Sisa Kuota Bebas Pajak Tahun Ini:</span>
                    <span className="font-bold text-emerald-600">{formatRupiah(taxResults.remainingFreeQuota)}</span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                  <p>Kode Akun Pajak (KAP): <b>411128</b></p>
                  <p>Kode Jenis Setoran (KJS): <b>420</b> (PPh Final PP 23)</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopySummary(taxSummaryText, 'tax')}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedKey === 'tax' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Rincian Pajak Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Rincian Pajak</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Editorial Section: Panduan, FAQ Schema, AdSense Safe Zone & Hub-Spoke Links */}
        <div className="mt-8">
          <ToolEditorialSection toolId="kalkulator-umkm" />
        </div>
      </section>

      <Footer />
    </main>
  );
}

