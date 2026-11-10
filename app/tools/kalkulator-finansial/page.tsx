'use client';

import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import {
  Percent,
  Receipt,
  HeartHandshake,
  ArrowRightLeft,
  Copy,
  Check,
  RotateCcw,
  Info,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

type TabType = 'discount' | 'pph21' | 'zakat' | 'converter';

// Standar PTKP UU HPP Indonesia (Konstanta Statis)
const ptkpMap: Record<string, { label: string; amount: number }> = {
  TK0: { label: 'TK/0 (Tidak Kawin, 0 Tanggungan)', amount: 54000000 },
  TK1: { label: 'TK/1 (Tidak Kawin, 1 Tanggungan)', amount: 58500000 },
  TK2: { label: 'TK/2 (Tidak Kawin, 2 Tanggungan)', amount: 63000000 },
  TK3: { label: 'TK/3 (Tidak Kawin, 3 Tanggungan)', amount: 67500000 },
  K0: { label: 'K/0 (Kawin, 0 Tanggungan)', amount: 58500000 },
  K1: { label: 'K/1 (Kawin, 1 Tanggungan)', amount: 63000000 },
  K2: { label: 'K/2 (Kawin, 2 Tanggungan)', amount: 67500000 },
  K3: { label: 'K/3 (Kawin, 3 Tanggungan)', amount: 72000000 },
};

// Faktor konversi ke satuan dasar (Length: meter, Weight: gram, Area: meter persegi)
const lengthFactors: Record<string, { name: string; toBase: number }> = {
  km: { name: 'Kilometer (km)', toBase: 1000 },
  m: { name: 'Meter (m)', toBase: 1 },
  cm: { name: 'Sentimeter (cm)', toBase: 0.01 },
  mm: { name: 'Milimeter (mm)', toBase: 0.001 },
  inch: { name: 'Inci (in)', toBase: 0.0254 },
  foot: { name: 'Kaki (ft)', toBase: 0.3048 },
  yard: { name: 'Yard (yd)', toBase: 0.9144 },
  mile: { name: 'Mil (mi)', toBase: 1609.344 },
};

const weightFactors: Record<string, { name: string; toBase: number }> = {
  ton: { name: 'Metrik Ton (t)', toBase: 1000000 },
  kuintal: { name: 'Kuintal (q)', toBase: 100000 },
  kg: { name: 'Kilogram (kg)', toBase: 1000 },
  pon: { name: 'Pon / Pound (lbs)', toBase: 453.59237 },
  ons: { name: 'Ons (Indonesia 100g)', toBase: 100 },
  g: { name: 'Gram (g)', toBase: 1 },
  mg: { name: 'Miligram (mg)', toBase: 0.001 },
};

const areaFactors: Record<string, { name: string; toBase: number }> = {
  sq_km: { name: 'Kilometer Persegi (km²)', toBase: 1000000 },
  ha: { name: 'Hektar (ha)', toBase: 10000 },
  are: { name: 'Are (a)', toBase: 100 },
  sq_m: { name: 'Meter Persegi (m²)', toBase: 1 },
  acre: { name: 'Acre (ac)', toBase: 4046.85642 },
  ru: { name: 'Ru / Tumbak (Jawa/Sunda 14m²)', toBase: 14.0625 },
};

export default function FinancialCalculatorPage() {
  const [activeTab, setActiveTab] = useState<TabType>('discount');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatRupiah = (val: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Math.max(0, val));
  };

  // ==========================================
  // 1. STATE & LOGIKA: KALKULATOR DISKON
  // ==========================================
  const [originalPrice, setOriginalPrice] = useState<number>(350000);
  const [discount1, setDiscount1] = useState<number>(50); // % diskon utama
  const [discount2, setDiscount2] = useState<number>(20); // % diskon bertingkat (opsional)
  const [shippingFee, setShippingFee] = useState<number>(0);

  const discountResults = useMemo(() => {
    const p0 = Math.max(0, originalPrice || 0);
    const d1 = Math.min(100, Math.max(0, discount1 || 0));
    const d2 = Math.min(100, Math.max(0, discount2 || 0));
    const ship = Math.max(0, shippingFee || 0);

    const cut1 = p0 * (d1 / 100);
    const afterD1 = p0 - cut1;

    const cut2 = afterD1 * (d2 / 100);
    const afterD2 = afterD1 - cut2;

    const totalSavings = cut1 + cut2;
    const finalPrice = afterD2 + ship;

    // Persentase diskon riil dari harga dasar
    const effectiveDiscountPercent = p0 > 0 ? (totalSavings / p0) * 100 : 0;

    return {
      originalPrice: p0,
      cut1,
      cut2,
      totalSavings,
      finalPrice,
      effectiveDiscountPercent,
    };
  }, [originalPrice, discount1, discount2, shippingFee]);

  // ==========================================
  // 2. STATE & LOGIKA: KALKULATOR PPh 21
  // ==========================================
  const [salaryPeriod, setSalaryPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [grossIncome, setGrossIncome] = useState<number>(12500000); // Gaji bruto
  const [ptkpStatus, setPtkpStatus] = useState<string>('TK0'); // TK/0 default 54jt

  const pph21Results = useMemo(() => {
    const grossMonthly = salaryPeriod === 'monthly' ? grossIncome : grossIncome / 12;
    const grossYearly = grossMonthly * 12;

    // Biaya Jabatan 5% (maks Rp 500.000/bulan atau Rp 6.000.000/tahun)
    const annualBiayaJabatan = Math.min(6000000, grossYearly * 0.05);
    const netYearly = Math.max(0, grossYearly - annualBiayaJabatan);

    const ptkpValue = ptkpMap[ptkpStatus]?.amount || 54000000;
    const pkp = Math.max(0, netYearly - ptkpValue);

    // Tarif Progresif UU HPP No 7 Tahun 2021
    let taxAnnual = 0;
    let remainingPkp = pkp;

    // Lapisan 1: 0 - 60 Juta (5%)
    const bracket1 = Math.min(remainingPkp, 60000000);
    taxAnnual += bracket1 * 0.05;
    remainingPkp = Math.max(0, remainingPkp - bracket1);

    // Lapisan 2: > 60 - 250 Juta (15%)
    const bracket2 = Math.min(remainingPkp, 190000000);
    taxAnnual += bracket2 * 0.15;
    remainingPkp = Math.max(0, remainingPkp - bracket2);

    // Lapisan 3: > 250 - 500 Juta (25%)
    const bracket3 = Math.min(remainingPkp, 250000000);
    taxAnnual += bracket3 * 0.25;
    remainingPkp = Math.max(0, remainingPkp - bracket3);

    // Lapisan 4: > 500 Juta - 5 Miliar (30%)
    const bracket4 = Math.min(remainingPkp, 4500000000);
    taxAnnual += bracket4 * 0.30;
    remainingPkp = Math.max(0, remainingPkp - bracket4);

    // Lapisan 5: Di atas 5 Miliar (35%)
    taxAnnual += remainingPkp * 0.35;

    const taxMonthly = taxAnnual / 12;
    const takeHomePayMonthly = grossMonthly - taxMonthly;
    const effectiveTaxRate = grossYearly > 0 ? (taxAnnual / grossYearly) * 100 : 0;

    return {
      grossMonthly,
      grossYearly,
      annualBiayaJabatan,
      netYearly,
      ptkpValue,
      pkp,
      taxAnnual,
      taxMonthly,
      takeHomePayMonthly,
      effectiveTaxRate,
    };
  }, [grossIncome, salaryPeriod, ptkpStatus]);

  // ==========================================
  // 3. STATE & LOGIKA: KALKULATOR ZAKAT
  // ==========================================
  const [zakatType, setZakatType] = useState<'mal' | 'profesi'>('mal');
  const [liquidWealth, setLiquidWealth] = useState<number>(135000000); // Tabungan/Emas/Aset
  const [currentDebts, setCurrentDebts] = useState<number>(0);
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(1450000); // Harga emas per gram BAZNAS

  const zakatResults = useMemo(() => {
    const goldPrice = Math.max(100000, goldPricePerGram || 1450000);
    const wealth = Math.max(0, liquidWealth || 0);
    const debt = Math.max(0, currentDebts || 0);
    const netWealth = Math.max(0, wealth - debt);

    // Nisab Emas 85 gram
    const annualNisab = 85 * goldPrice;
    // Nisab Bulanan untuk Zakat Profesi (1/12 dari Nisab Tahunan)
    const monthlyNisab = annualNisab / 12;

    const applicableNisab = zakatType === 'mal' ? annualNisab : monthlyNisab;
    const isWajib = netWealth >= applicableNisab;

    const zakatAmount = isWajib ? netWealth * 0.025 : 0;

    return {
      goldPrice,
      netWealth,
      applicableNisab,
      annualNisab,
      isWajib,
      zakatAmount,
    };
  }, [liquidWealth, currentDebts, goldPricePerGram, zakatType]);

  // ==========================================
  // 4. STATE & LOGIKA: KONVERTER SATUAN PRAKTIS
  // ==========================================
  type CategoryType = 'length' | 'weight' | 'area';
  const [converterCat, setConverterCat] = useState<CategoryType>('length');
  const [inputValue, setInputValue] = useState<number>(100);
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('km');

  const converterResults = useMemo(() => {
    let factors = lengthFactors;
    if (converterCat === 'weight') factors = weightFactors;
    if (converterCat === 'area') factors = areaFactors;

    const sourceFactor = factors[fromUnit]?.toBase || 1;
    const targetFactor = factors[toUnit]?.toBase || 1;

    const baseVal = (inputValue || 0) * sourceFactor;
    const converted = baseVal / targetFactor;

    // Perbandingan ke semua unit dalam kategori yang sama
    const allComparisons = Object.entries(factors).map(([key, info]) => {
      const val = baseVal / info.toBase;
      return {
        unitKey: key,
        name: info.name,
        value: val,
      };
    });

    return {
      converted,
      allComparisons,
    };
  }, [converterCat, inputValue, fromUnit, toUnit]);

  const handleCategoryChange = (cat: CategoryType) => {
    setConverterCat(cat);
    if (cat === 'length') {
      setFromUnit('m');
      setToUnit('km');
      setInputValue(1000);
    } else if (cat === 'weight') {
      setFromUnit('kg');
      setToUnit('g');
      setInputValue(5);
    } else if (cat === 'area') {
      setFromUnit('ha');
      setToUnit('sq_m');
      setInputValue(1);
    }
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Kalkulator Finansial & Konverter Satuan Praktis - KompresKilat',
    description: 'Hitung diskon bertingkat, simulasi potongan pajak PPh 21 UU HPP, zakat mal 85 gram emas, dan konversi satuan panjang, berat, luas secara instan 100% di browser.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
  };

  const faqs = [
    {
      q: 'Bagaimana cara menghitung diskon bertingkat (misal: 50% + 20%)?',
      a: 'Diskon bertingkat BUKAN dijumlahkan menjadi 70%. Diskon pertama (50%) dihitung dari harga awal. Kemudian, diskon kedua (20%) dihitung dari sisa harga setelah diskon pertama. Dengan demikian, diskon 50% + 20% setara dengan potongan harga efektif sebesar 60%.'
    },
    {
      q: 'Bagaimana dasar perhitungan estimasi PPh 21 pada kalkulator ini?',
      a: 'Perhitungan menggunakan tarif pajak progresif UU HPP No. 7 Tahun 2021 (lapisan 5% s.d. 35%), dikurangi Biaya Jabatan 5% (maks Rp 500.000/bulan) dan PTKP standar (TK/0 Rp 54 juta s.d. K/3 Rp 72 juta per tahun).'
    },
    {
      q: 'Kapan seseorang wajib membayar zakat mal?',
      a: 'Zakat mal wajib ditunaikan apabila akumulasi harta simpanan telah genap tersimpan selama 1 tahun (haul) dan total nilainya melebihi nisab 85 gram emas murni. Besar kewajiban zakat adalah 2.5% dari total harta bersih.'
    },
    {
      q: 'Apakah kalkulator dan konverter ini menyimpan data keuangan saya?',
      a: 'Sama sekali tidak. Seluruh rumus matematika dijalankan 100% pada memori peramban (client-side) tanpa pernah mengirim angka gaji, tabungan, atau data belanja ke server manapun.'
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <JsonLd data={schema} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 text-center">
          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold mb-2">
            🧮 Finansial &amp; Konversi • Client-Side 2026
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Kalkulator Finansial &amp; Konverter Satuan Praktis
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Hitung diskon bertingkat belanja, simulasi PPh 21 resmi UU HPP, zakat mal nisab 85 gram emas, dan konversi satuan panjang/berat secara akurat dan gratis.
          </p>
        </div>

        {/* Tab Selector Nav */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('discount')}
            className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
              activeTab === 'discount'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <Percent className="w-5 h-5" />
            <span className="font-bold text-xs sm:text-sm">Diskon Belanja</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pph21')}
            className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
              activeTab === 'pph21'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="font-bold text-xs sm:text-sm">PPh 21 / Pajak</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('zakat')}
            className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
              activeTab === 'zakat'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <HeartHandshake className="w-5 h-5" />
            <span className="font-bold text-xs sm:text-sm">Kalkulator Zakat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('converter')}
            className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
              activeTab === 'converter'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-5 h-5" />
            <span className="font-bold text-xs sm:text-sm">Konverter Satuan</span>
          </button>
        </div>

        {/* ==================================================== */}
        {/* 1. KONTEN TAB: KALKULATOR DISKON BELANJA */}
        {/* ==================================================== */}
        {activeTab === 'discount' && (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Percent className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="font-bold text-base sm:text-lg text-slate-900">
                      Kalkulator Diskon &amp; Promo Bertingkat
                    </h2>
                    <p className="text-xs text-slate-500">
                      Hitung harga bersih setelah diskon single maupun diskon ganda (50% + 20%).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOriginalPrice(200000);
                    setDiscount1(50);
                    setDiscount2(20);
                    setShippingFee(0);
                  }}
                  className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Form Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Harga Awal / Sebelum Diskon (Rp):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={originalPrice || ''}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  {/* Preset Cepat */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[50000, 100000, 250000, 500000, 1000000].map((pr) => (
                      <button
                        key={pr}
                        type="button"
                        onClick={() => setOriginalPrice(pr)}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10.5px] text-slate-600 cursor-pointer"
                      >
                        {formatRupiah(pr)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Diskon Utama (%):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount1 || ''}
                    onChange={(e) => setDiscount1(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  {/* Preset Diskon */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[10, 20, 30, 50, 70].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDiscount1(d)}
                        className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[10.5px] font-bold text-indigo-700 cursor-pointer"
                      >
                        {d}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Diskon Tambahan Bertingkat (% Opsional):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Contoh: 20 jika promo 50% + 20%"
                    value={discount2 || ''}
                    onChange={(e) => setDiscount2(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Kosongkan jika bukan diskon ganda.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Biaya Ongkir / Lainnya (Rp Opsional):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0"
                    value={shippingFee || ''}
                    onChange={(e) => setShippingFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              {/* Kartu Hasil Perhitungan */}
              <div className="p-5 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-50 border-2 border-indigo-200 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                      Harga Akhir yang Dibayar:
                    </span>
                    <h3 className="text-2xl sm:text-4xl font-black text-indigo-950 mt-0.5">
                      {formatRupiah(discountResults.finalPrice)}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(formatRupiah(discountResults.finalPrice), 'discount')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedKey === 'discount' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'discount' ? 'Tersalin' : 'Salin Harga'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-indigo-100 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-indigo-100">
                    <span className="text-[11px] text-slate-500 block">Total Anda Hemat:</span>
                    <span className="font-extrabold text-emerald-600 text-sm sm:text-base">
                      {formatRupiah(discountResults.totalSavings)}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-indigo-100">
                    <span className="text-[11px] text-slate-500 block">Diskon Efektif Riil:</span>
                    <span className="font-extrabold text-indigo-700 text-sm sm:text-base">
                      {discountResults.effectiveDiscountPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-indigo-100 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-500 block">Rincian Potongan:</span>
                    <span className="font-medium text-slate-700 text-[11px]">
                      {discount2 > 0 ? `D1: ${formatRupiah(discountResults.cut1)} + D2: ${formatRupiah(discountResults.cut2)}` : `D1: ${formatRupiah(discountResults.cut1)}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Panduan Edukatif SEO Diskon */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-600" />
                <span>Rumus &amp; Cara Menghitung Diskon Bertingkat (50% + 20%)</span>
              </h3>
              <p className="leading-relaxed">
                Banyak pembeli salah mengira bahwa diskon bertingkat <b>50% + 20%</b> berarti potongan harga sebesar <b>70%</b>. Rumus resminya adalah sebagai berikut:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl font-mono text-[11px] text-slate-800 space-y-1">
                <p>1. Potongan Tahap 1 = Harga Awal × (Diskon 1 ÷ 100)</p>
                <p>2. Harga Sisa 1 = Harga Awal - Potongan Tahap 1</p>
                <p>3. Potongan Tahap 2 = Harga Sisa 1 × (Diskon 2 ÷ 100)</p>
                <p>4. Total Bayar = Harga Sisa 1 - Potongan Tahap 2</p>
              </div>
              <p className="leading-relaxed">
                Misalkan baju seharga Rp 100.000 mendapat diskon 50% + 20%. Tahap 1 memotong Rp 50.000 (sisa Rp 50.000). Tahap 2 memotong 20% dari Rp 50.000 yaitu Rp 10.000. Harga akhir menjadi <b>Rp 40.000</b> (diskon riil 60%, bukan 70%).
              </p>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 2. KONTEN TAB: KALKULATOR PPh 21 RESMI */}
        {/* ==================================================== */}
        {activeTab === 'pph21' && (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Receipt className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="font-bold text-base sm:text-lg text-slate-900">
                      Kalkulator PPh 21 Karyawan (UU HPP 2026)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Simulasi estimasi potongan pajak penghasilan pasal 21 dan take-home pay bulanan.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGrossIncome(10000000);
                    setPtkpStatus('TK0');
                    setSalaryPeriod('monthly');
                  }}
                  className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Form Input PPh 21 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gaji / Penghasilan Bruto:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="500000"
                      value={grossIncome || ''}
                      onChange={(e) => setGrossIncome(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <select
                      value={salaryPeriod}
                      onChange={(e) => setSalaryPeriod(e.target.value as 'monthly' | 'yearly')}
                      className="px-3 py-2.5 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="monthly">/ Bulan</option>
                      <option value="yearly">/ Tahun</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status PTKP (Penghasilan Tidak Kena Pajak):
                  </label>
                  <select
                    value={ptkpStatus}
                    onChange={(e) => setPtkpStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {Object.entries(ptkpMap).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label} - {formatRupiah(v.amount)}/thn
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hasil Perhitungan PPh 21 */}
              <div className="p-5 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-50 border-2 border-indigo-200 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                      Estimasi Potongan PPh 21 per Bulan:
                    </span>
                    <h3 className="text-2xl sm:text-4xl font-black text-indigo-950 mt-0.5">
                      {formatRupiah(pph21Results.taxMonthly)}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Gaji Bersih Diterima (Take Home Pay):
                    </span>
                    <h4 className="text-lg sm:text-2xl font-black text-emerald-700 mt-0.5">
                      {formatRupiah(pph21Results.takeHomePayMonthly)}
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-indigo-100 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                    <span className="text-[11px] text-slate-500 block">Pajak Setahun:</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {formatRupiah(pph21Results.taxAnnual)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                    <span className="text-[11px] text-slate-500 block">Tarif Efektif:</span>
                    <span className="font-bold text-indigo-700 text-xs sm:text-sm">
                      {pph21Results.effectiveTaxRate.toFixed(2)}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                    <span className="text-[11px] text-slate-500 block">PKP (Kena Pajak):</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {formatRupiah(pph21Results.pkp)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                    <span className="text-[11px] text-slate-500 block">Biaya Jabatan (Thn):</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {formatRupiah(pph21Results.annualBiayaJabatan)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Panduan Edukatif PPh 21 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-600" />
                <span>Ketentuan Tarif Progresif PPh 21 Berdasarkan UU HPP No. 7 Tahun 2021</span>
              </h3>
              <p className="leading-relaxed">
                Pajak Penghasilan Orang Pribadi (PPh 21) di Indonesia dikenakan pada <b>Penghasilan Kena Pajak (PKP)</b> setelah dikurangi PTKP dan Biaya Jabatan maksimal Rp 500.000/bulan:
              </p>
              <ul className="space-y-1.5 pl-4 list-disc text-[11.5px]">
                <li><b>Lapisan 1:</b> PKP s.d. Rp 60 Juta dikenakan tarif <b>5%</b></li>
                <li><b>Lapisan 2:</b> PKP di atas Rp 60 Juta s.d. Rp 250 Juta dikenakan tarif <b>15%</b></li>
                <li><b>Lapisan 3:</b> PKP di atas Rp 250 Juta s.d. Rp 500 Juta dikenakan tarif <b>25%</b></li>
                <li><b>Lapisan 4:</b> PKP di atas Rp 500 Juta s.d. Rp 5 Miliar dikenakan tarif <b>30%</b></li>
                <li><b>Lapisan 5:</b> PKP di atas Rp 5 Miliar dikenakan tarif <b>35%</b></li>
              </ul>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 3. KONTEN TAB: KALKULATOR ZAKAT MAL & PENGHASILAN */}
        {/* ==================================================== */}
        {activeTab === 'zakat' && (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <HeartHandshake className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="font-bold text-base sm:text-lg text-slate-900">
                      Kalkulator Zakat Mal &amp; Zakat Profesi (BAZNAS)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Hitung nisab 85 gram emas dan kewajiban zakat 2.5% secara otomatis.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLiquidWealth(135000000);
                    setCurrentDebts(0);
                    setGoldPricePerGram(1450000);
                  }}
                  className="text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Pilihan Jenis Zakat */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZakatType('mal')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    zakatType === 'mal'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  Zakat Mal (Simpanan / Tabungan Setahun)
                </button>
                <button
                  type="button"
                  onClick={() => setZakatType('profesi')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    zakatType === 'profesi'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  Zakat Profesi (Gaji / Pendapatan Bulanan)
                </button>
              </div>

              {/* Form Input Zakat */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {zakatType === 'mal' ? 'Total Harta Simpanan (Rp):' : 'Penghasilan Bersih Bulanan (Rp):'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000000"
                    value={liquidWealth || ''}
                    onChange={(e) => setLiquidWealth(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Uang tabungan, deposito, emas fisik.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hutang / Beban Jatuh Tempo (Rp):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500000"
                    placeholder="0"
                    value={currentDebts || ''}
                    onChange={(e) => setCurrentDebts(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Cicilan / hutang yang wajib dibayar.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Harga Acuan Emas per Gram (Rp):
                  </label>
                  <input
                    type="number"
                    min="500000"
                    step="10000"
                    value={goldPricePerGram || ''}
                    onChange={(e) => setGoldPricePerGram(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Standar BAZNAS 2026 (~Rp 1,45 jt/g).</p>
                </div>
              </div>

              {/* Hasil Perhitungan Zakat */}
              <div
                className={`p-5 rounded-2xl border-2 space-y-4 transition ${
                  zakatResults.isWajib
                    ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border-emerald-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          zakatResults.isWajib
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {zakatResults.isWajib ? '✓ Wajib Zakat (Mencapai Nisab)' : 'Belum Wajib Zakat (Di bawah Nisab)'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Besaran Zakat yang Harus Dikeluarkan (2.5%):
                    </span>
                    <h3 className="text-2xl sm:text-4xl font-black text-emerald-900 mt-0.5">
                      {formatRupiah(zakatResults.zakatAmount)}
                    </h3>
                  </div>

                  {zakatResults.isWajib && (
                    <button
                      type="button"
                      onClick={() => handleCopy(formatRupiah(zakatResults.zakatAmount), 'zakat')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {copiedKey === 'zakat' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'zakat' ? 'Tersalin' : 'Salin Nominal Zakat'}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-200 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Harta Bersih:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatRupiah(zakatResults.netWealth)}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Nisab Batas Minimal:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatRupiah(zakatResults.applicableNisab)}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Dasar Nisab Emas:</span>
                    <span className="font-medium text-slate-700 text-[11px]">
                      {zakatType === 'mal' ? '85 gram emas per tahun' : 'Equivalent 85g/12 per bulan'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Panduan Edukatif Zakat */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-600" />
                <span>Ketentuan Syariat Zakat Mal Menurut Fatwa MUI &amp; BAZNAS</span>
              </h3>
              <p className="leading-relaxed">
                Zakat mal merupakan kewajiban atas harta yang dimiliki seorang muslim dengan memenuhi dua syarat pokok:
              </p>
              <ul className="space-y-1.5 pl-4 list-disc text-[11.5px]">
                <li><b>Mencapai Nisab:</b> Setara dengan nilai <b>85 gram emas murni</b>. Apabila harga emas Rp 1.450.000/gram, maka nisab adalah Rp 123.250.000.</li>
                <li><b>Memenuhi Haul:</b> Harta telah tersimpan genap selama 1 tahun Hijriyah / Masehi tanpa berkurang di bawah nisab.</li>
                <li><b>Kadar Zakat:</b> Dikeluarkan sebesar <b>2.5%</b> (seperempat puluh) dari total akumulasi harta bersih setelah dikurangi hutang jangka pendek.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 4. KONTEN TAB: KONVERTER SATUAN PRAKTIS */}
        {/* ==================================================== */}
        {activeTab === 'converter' && (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <ArrowRightLeft className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="font-bold text-base sm:text-lg text-slate-900">
                      Konverter Satuan Panjang, Berat &amp; Luas
                    </h2>
                    <p className="text-xs text-slate-500">
                      Konversi nilai metrik ke imperial atau satuan tradisional secara instan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Kategori Satuan Switcher */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('length')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    converterCat === 'length'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  📏 Panjang &amp; Jarak
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryChange('weight')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    converterCat === 'weight'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  ⚖️ Berat &amp; Massa
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryChange('area')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    converterCat === 'area'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  📐 Luas Tanah &amp; Bidang
                </button>
              </div>

              {/* Form Konversi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nilai yang Dikonversi:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={inputValue || ''}
                    onChange={(e) => setInputValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dari Satuan (From):
                  </label>
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {Object.entries(
                      converterCat === 'length'
                        ? lengthFactors
                        : converterCat === 'weight'
                        ? weightFactors
                        : areaFactors
                    ).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ke Satuan (To):
                  </label>
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {Object.entries(
                      converterCat === 'length'
                        ? lengthFactors
                        : converterCat === 'weight'
                        ? weightFactors
                        : areaFactors
                    ).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hasil Konversi Utama */}
              <div className="p-5 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-50 border-2 border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Hasil Konversi Satuan:
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black text-indigo-950 mt-0.5 font-mono">
                    {converterResults.converted.toLocaleString('id-ID', { maximumFractionDigits: 6 })}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {inputValue} {(converterCat === 'length' ? lengthFactors : converterCat === 'weight' ? weightFactors : areaFactors)[fromUnit]?.name} = {converterResults.converted.toLocaleString('id-ID', { maximumFractionDigits: 6 })} {(converterCat === 'length' ? lengthFactors : converterCat === 'weight' ? weightFactors : areaFactors)[toUnit]?.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(converterResults.converted.toString(), 'converter')}
                  className="px-3.5 py-2 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedKey === 'converter' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'converter' ? 'Tersalin' : 'Salin Angka'}</span>
                </button>
              </div>

              {/* Tabel Matriks Perbandingan Cepat */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-700">
                  Perbandingan Otomatis ke Seluruh Satuan Sejenis:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {converterResults.allComparisons.map((item) => (
                    <div
                      key={item.unitKey}
                      className={`p-2.5 rounded-xl border text-xs ${
                        item.unitKey === toUnit
                          ? 'bg-indigo-50 border-indigo-300 font-bold text-indigo-900'
                          : 'bg-slate-50 border-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 block truncate">{item.name}</span>
                      <span className="font-mono text-xs sm:text-sm font-semibold truncate block">
                        {item.value.toLocaleString('id-ID', { maximumFractionDigits: 4 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panduan Edukatif Konversi */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-600" />
                <span>Panduan Standar Satuan Metrik, Imperial &amp; Tradisional</span>
              </h3>
              <p className="leading-relaxed">
                Konverter ini mengadopsi standar internasional (SI) serta satuan agraria tradisional yang sering digunakan di Indonesia:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11.5px]">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="font-bold text-slate-800">1 Ru / Tumbak / Bata:</span>
                  <p>Setara dengan <b>14.0625 m²</b> (sering digunakan dalam sertifikat tanah dan jual-beli properti di Pulau Jawa &amp; Sunda).</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="font-bold text-slate-800">1 Hektar (ha):</span>
                  <p>Setara dengan <b>10.000 m²</b> atau <b>100 are</b> (ukuran standar sertifikat perkebunan dan kehutanan).</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Accordion */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mt-8 mb-6">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
          </h3>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-4 py-3 bg-slate-50/50 hover:bg-slate-50 font-semibold text-xs sm:text-sm text-slate-800 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                      openFaq === idx ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 py-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="my-10 pt-4">
          <AdBanner zone="in-tool" label="Iklan" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
