'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import {
  Coins,
  ArrowRightLeft,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Plane,
  Compass,
  DollarSign
} from 'lucide-react';

export interface CurrencyItem {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  country: string;
  commonInIndo?: boolean;
}

export const CURRENCIES: CurrencyItem[] = [
  { code: 'IDR', name: 'Rupiah Indonesia', symbol: 'Rp', flag: '🇮🇩', country: 'Indonesia', commonInIndo: true },
  { code: 'USD', name: 'Dolar Amerika Serikat', symbol: '$', flag: '🇺🇸', country: 'Amerika Serikat', commonInIndo: true },
  { code: 'SAR', name: 'Riyal Arab Saudi (Haji & Umroh)', symbol: '﷼', flag: '🇸🇦', country: 'Arab Saudi', commonInIndo: true },
  { code: 'SGD', name: 'Dolar Singapura', symbol: 'S$', flag: '🇸🇬', country: 'Singapura', commonInIndo: true },
  { code: 'MYR', name: 'Ringgit Malaysia', symbol: 'RM', flag: '🇲🇾', country: 'Malaysia', commonInIndo: true },
  { code: 'JPY', name: 'Yen Jepang', symbol: '¥', flag: '🇯🇵', country: 'Jepang', commonInIndo: true },
  { code: 'EUR', name: 'Euro Uni Eropa', symbol: '€', flag: '🇪🇺', country: 'Uni Eropa', commonInIndo: true },
  { code: 'GBP', name: 'Pound Sterling Inggris', symbol: '£', flag: '🇬🇧', country: 'Inggris Raya', commonInIndo: true },
  { code: 'AUD', name: 'Dolar Australia', symbol: 'A$', flag: '🇦🇺', country: 'Australia', commonInIndo: true },
  { code: 'CNY', name: 'Yuan Tiongkok', symbol: '¥', flag: '🇨🇳', country: 'Tiongkok', commonInIndo: true },
  { code: 'AED', name: 'Dirham Uni Emirat Arab', symbol: 'د.إ', flag: '🇦🇪', country: 'Uni Emirat Arab', commonInIndo: true },
  { code: 'THB', name: 'Baht Thailand', symbol: '฿', flag: '🇹🇭', country: 'Thailand', commonInIndo: true },
  { code: 'KRW', name: 'Won Korea Selatan', symbol: '₩', flag: '🇰🇷', country: 'Korea Selatan', commonInIndo: true },
  { code: 'TRY', name: 'Lira Turki', symbol: '₺', flag: '🇹🇷', country: 'Turki', commonInIndo: true },
  { code: 'CHF', name: 'Franc Swiss', symbol: 'CHF', flag: '🇨🇭', country: 'Swiss' },
  { code: 'CAD', name: 'Dolar Kanada', symbol: 'C$', flag: '🇨🇦', country: 'Kanada' },
  { code: 'HKD', name: 'Dolar Hong Kong', symbol: 'HK$', flag: '🇭🇰', country: 'Hong Kong' },
  { code: 'TWD', name: 'Dolar Baru Taiwan', symbol: 'NT$', flag: '🇹🇼', country: 'Taiwan' },
  { code: 'PHP', name: 'Peso Filipina', symbol: '₱', flag: '🇵🇭', country: 'Filipina' },
  { code: 'INR', name: 'Rupee India', symbol: '₹', flag: '🇮🇳', country: 'India' },
  { code: 'NZD', name: 'Dolar Selandia Baru', symbol: 'NZ$', flag: '🇳🇿', country: 'Selandia Baru' },
  { code: 'VND', name: 'Dong Vietnam', symbol: '₫', flag: '🇻🇳', country: 'Vietnam' },
];

// Fallback rates baseline relative to 1 USD
const FALLBACK_RATES_BASE_USD: Record<string, number> = {
  USD: 1,
  IDR: 16250,
  SAR: 3.75,
  SGD: 1.34,
  MYR: 4.45,
  JPY: 154.5,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.52,
  CNY: 7.24,
  AED: 3.67,
  THB: 36.5,
  KRW: 1380,
  TRY: 34.2,
  CHF: 0.89,
  CAD: 1.37,
  HKD: 7.81,
  TWD: 32.4,
  PHP: 58.5,
  INR: 84.1,
  NZD: 1.66,
  VND: 25400,
};

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState<number>(100);
  const [amountStr, setAmountStr] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('IDR');
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES_BASE_USD);
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Memuat kurs terkini...');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'converter' | 'umroh' | 'matrix'>('converter');

  // Manual Refresh Handler
  const handleRefreshRates = async () => {
    setIsLoadingRates(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD', {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to fetch from primary currency API');
      const data = await res.json();

      if (data && data.rates) {
        setRates((prev) => ({ ...prev, ...data.rates }));
        const dateStr = data.time_last_update_utc
          ? new Date(data.time_last_update_utc).toLocaleString('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : new Date().toLocaleTimeString('id-ID');
        setLastUpdated(`Diperbarui: ${dateStr}`);
      }
    } catch (err) {
      console.warn('Using baseline fallback exchange rates:', err);
      setLastUpdated('Mode Offline (Menggunakan Kurs Acuan Stabil)');
    } finally {
      setIsLoadingRates(false);
    }
  };

  // Initial Fetch on Client Mount (Async to prevent cascading renders)
  useEffect(() => {
    let isMounted = true;

    fetch('https://open.er-api.com/v6/latest/USD')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.rates) return;
        setRates((prev) => ({ ...prev, ...data.rates }));
        const dateStr = data.time_last_update_utc
          ? new Date(data.time_last_update_utc).toLocaleString('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : new Date().toLocaleTimeString('id-ID');
        setLastUpdated(`Diperbarui: ${dateStr}`);
      })
      .catch(() => {
        if (!isMounted) return;
        setLastUpdated('Mode Offline (Menggunakan Kurs Acuan Stabil)');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute exchange rate between any two currencies through USD base
  const exchangeRate = useMemo(() => {
    const rateFrom = rates[fromCurrency] || FALLBACK_RATES_BASE_USD[fromCurrency] || 1;
    const rateTo = rates[toCurrency] || FALLBACK_RATES_BASE_USD[toCurrency] || 1;
    return rateTo / rateFrom;
  }, [rates, fromCurrency, toCurrency]);

  const convertedAmount = useMemo(() => {
    return amount * exchangeRate;
  }, [amount, exchangeRate]);

  // Inverse rate (1 toCurrency = X fromCurrency)
  const inverseRate = useMemo(() => {
    return exchangeRate > 0 ? 1 / exchangeRate : 0;
  }, [exchangeRate]);

  // Currency lookup metadata
  const fromMeta = useMemo(() => CURRENCIES.find((c) => c.code === fromCurrency) || CURRENCIES[0], [fromCurrency]);
  const toMeta = useMemo(() => CURRENCIES.find((c) => c.code === toCurrency) || CURRENCIES[1], [toCurrency]);

  // Format numbers nicely
  const formatNumber = (num: number, maxDecimals = 2) => {
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: maxDecimals,
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    }).format(num);
  };

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleAmountChange = (val: string) => {
    setAmountStr(val);
    const parsed = parseFloat(val.replace(/,/g, '.'));
    if (!isNaN(parsed) && parsed >= 0) {
      setAmount(parsed);
    } else if (val === '') {
      setAmount(0);
    }
  };

  const handleCopyResult = () => {
    const textToCopy = `${formatNumber(amount)} ${fromCurrency} = ${formatNumber(convertedAmount, 2)} ${toCurrency}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Konverter Kurs Mata Uang Global & Kalkulator Riyal Haji/Umroh - KompresKilat',
    url: 'https://kompreskilat.site/tools/currency-converter',
    description: 'Konversi nilai tukar mata uang dunia terkini (Rupiah, Dollar, Riyal Saudi, Euro, Ringgit, Yen) secara instan, gratis, dan privat tanpa upload ke server.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <JsonLd data={schema} />
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs px-3 py-1 rounded-full font-bold mb-3">
            <Coins className="w-3.5 h-3.5" />
            <span>Kurs Valuta Asing Real-Time 100% Client-Side</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
            Konverter Mata Uang Global
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Hitung nilai tukar rupiah dan valuta asing dunia secara langsung. Akurat untuk perencanaan liburan, belanja internasional, serta estimasi biaya ibadah Haji & Umroh.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-1.5 mb-6 flex items-center justify-center gap-1.5 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('converter')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'converter'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Kalkulator Kurs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('umroh')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'umroh'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            Haji & Umroh (SAR)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Matriks Dunia
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: MAIN CONVERTER CARD */}
        {/* ========================================================================= */}
        {activeTab === 'converter' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 mb-8">
            {/* Rates Status & Refresh Button */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6 text-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{lastUpdated}</span>
              </div>
              <button
                type="button"
                disabled={isLoadingRates}
                onClick={handleRefreshRates}
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRates ? 'animate-spin' : ''}`} />
                <span>Segarkan Kurs</span>
              </button>
            </div>

            {/* Input & Currencies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
              {/* Left: From Amount & Currency */}
              <div className="md:col-span-5 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Jumlah Uang ({fromCurrency}):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    {fromMeta.symbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amountStr}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>

                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Dari Mata Uang:
                  </label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} - {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Middle: Swap Button */}
              <div className="md:col-span-1 flex justify-center py-2 md:py-0">
                <button
                  type="button"
                  onClick={handleSwapCurrencies}
                  className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-500 shadow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  title="Tukar Posisi Mata Uang"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Right: Converted Amount Display & Target Currency */}
              <div className="md:col-span-5 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Hasil Konversi ({toCurrency}):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    {toMeta.symbol}
                  </span>
                  <div className="w-full pl-10 pr-4 py-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-xl text-lg font-extrabold text-indigo-900 dark:text-indigo-200 overflow-hidden text-ellipsis whitespace-nowrap">
                    {formatNumber(convertedAmount, 2)}
                  </div>
                </div>

                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Ke Mata Uang:
                  </label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} - {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Denomination Chips */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Nominal Cepat:</span>
              {[10, 50, 100, 500, 1000, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setAmount(val);
                    setAmountStr(String(val));
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                    amount === val
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  +{formatNumber(val)}
                </button>
              ))}
            </div>

            {/* Live Exchange Rate Summary Card */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  1 {fromCurrency} = {formatNumber(exchangeRate, 4)} {toCurrency}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  1 {toCurrency} = {formatNumber(inverseRate, 6)} {fromCurrency}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyResult}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Tersalin!' : 'Salin Hasil'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: HAJJ & UMRAH PILGRIMAGE ESTIMATOR (SAR) */}
        {/* ========================================================================= */}
        {activeTab === 'umroh' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 mb-8 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-1">
                <Plane className="w-4 h-4" />
                <span>Kalkulator Khusus Jemaah Haji & Umroh</span>
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Estimasi Biaya Riyal Arab Saudi (SAR) ke Rupiah (IDR)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Kurs acuan 1 SAR = <strong>{formatNumber(rates.IDR ? rates.IDR / (rates.SAR || 3.75) : 4350, 0)} IDR</strong>. Membantu menghitung living cost, DAM/kurban, taksi, dan uang saku di Tanah Suci.
              </p>
            </div>

            {/* Quick Estimator Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { title: 'DAM / Kurban Kambing', sar: 650, note: 'Rata-rata hewan sembelihan resmi Bank Pembangunan Islam' },
                { title: 'Taksi Makkah - Madinah', sar: 450, note: 'Perkiraan kendaraan pribadi antar kota' },
                { title: 'Living Cost / Uang Saku', sar: 750, note: 'Uang saku tunai standar jemaah haji reguler RI' },
                { title: 'Makan Nasi Briyani / Mandhi', sar: 25, note: 'Porsi makan kenyang di sekitar Masjidil Haram' },
                { title: 'Kartu Perdana & Kuota Internet', sar: 100, note: 'Paket data lokal STC/Mobily/Zain 20GB' },
                { title: 'Oleh-oleh Kurma Ajwa (1 Kg)', sar: 60, note: 'Pasar Kurma Madinah kualitas super' },
              ].map((item, idx) => {
                const sarToIdrRate = rates.IDR ? rates.IDR / (rates.SAR || 3.75) : 4350;
                const costInIdr = item.sar * sarToIdrRate;

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-1">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mb-3">{item.note}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {item.sar} SAR
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ≈ Rp {formatNumber(costInIdr, 0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              💡 <strong>Tips Finansial Ibadah:</strong> Penukaran uang tunai Riyal di Money Changer bandara sering kali mengenakan spread selisih kurs lebih mahal. Disarankan membawa kartu ATM berlogo Visa/Mastercard yang mendukung tarik tunai di mesin ATM Al Rajhi / SNB di Makkah atau menggunakan pembayaran kartu nirsentuh (contactless).
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: GLOBAL EXCHANGE RATE MATRIX */}
        {/* ========================================================================= */}
        {activeTab === 'matrix' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 mb-8 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Matriks Nilai Tukar 1 Satuan Mata Uang Dunia
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tabel perbandingan nilai 1 unit mata uang asing populer dikonversikan ke dalam Rupiah (IDR) dan Dolar AS (USD).
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-800/50">
                    <th className="p-3">Mata Uang</th>
                    <th className="p-3">Negara</th>
                    <th className="p-3 text-right">Nilai dalam IDR (Rp)</th>
                    <th className="p-3 text-right">Nilai dalam USD ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {CURRENCIES.filter((c) => c.code !== 'IDR').map((c) => {
                    const cRateToUsd = rates[c.code] ? 1 / rates[c.code] : 1;
                    const cRateToIdr = cRateToUsd * (rates.IDR || 16250);

                    return (
                      <tr key={c.code} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span className="text-base">{c.flag}</span>
                          <span>1 {c.code}</span>
                        </td>
                        <td className="p-3 text-slate-500 dark:text-slate-400">{c.country}</td>
                        <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">
                          Rp {formatNumber(cRateToIdr, 2)}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          ${formatNumber(cRateToUsd, 4)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Informative Article Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 mb-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                Panduan Cerdas Menghitung Nilai Tukar Valuta Asing
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Pahami perbedaan kurs beli, kurs jual, dan tips menghindari potongan tersembunyi saat transaksi lintas negara.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-indigo-600" />
                1. Kurs Tengah Pasar (Mid-Market Rate)
              </h3>
              <p className="text-xs leading-relaxed">
                Kalkulator kami menggunakan kurs tengah pasar internasional real-time yang merupakan titik tengah adil antara permintaan beli dan penawaran jual tanpa mark-up bank.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                2. Penting untuk Traveler & PMI
              </h3>
              <p className="text-xs leading-relaxed">
                Sangat membantu Pekerja Migran Indonesia (PMI/TKI) di Malaysia, Hong Kong, Taiwan, atau Arab Saudi saat hendak mengirim remitansi uang bulanan ke keluarga di tanah air.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                3. Privasi Finansial 100%
              </h3>
              <p className="text-xs leading-relaxed">
                Nominal uang yang Anda ketik tidak pernah disimpan di server kami. Seluruh kalkulasi matematika berlangsung secara instan di peramban Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Ad Placement */}
        <div className="my-8">
          <AdBanner slotId="currency-converter-bottom" />
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            Tanya Jawab Seputar Kurs Mata Uang (FAQ)
          </h2>

          <div className="space-y-3">
            {[
              {
                q: 'Seberapa sering kurs mata uang diperbarui?',
                a: 'Data nilai tukar diperbarui secara berkala mengikuti pasar valuta asing global. Anda juga dapat menekan tombol "Segarkan Kurs" kapan saja untuk meminta update terbaru.',
              },
              {
                q: 'Mengapa kurs di bank atau money changer berbeda dengan angka di kalkulator ini?',
                a: 'Kalkulator ini menampilkan Kurs Tengah Pasar (Mid-Market Rate). Bank dan penyedia jasa penukaran uang biasanya menerapkan selisih (spread) berupa Kurs Jual (ketika Anda membeli valas) dan Kurs Beli (ketika Anda menjual valas) untuk mengambil keuntungan operasional.',
              },
              {
                q: 'Mata uang apa saja yang didukung?',
                a: 'Kami mendukung 22 mata uang global utama termasuk Rupiah (IDR), Dolar Amerika (USD), Riyal Saudi (SAR), Ringgit Malaysia (MYR), Dolar Singapura (SGD), Euro (EUR), Yen Jepang (JPY), Dolar Australia (AUD), dan Yuan Tiongkok (CNY).',
              },
              {
                q: 'Apakah alat ini bisa digunakan secara offline tanpa internet?',
                a: 'Bisa. Jika peramban Anda kehilangan koneksi internet atau API eksternal terhambat, sistem secara otomatis beralih ke tabel acuan kurs lokal tersemat sehingga Anda tetap dapat melakukan perhitungan konversi.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Link to Related Tools */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Perkakas Finansial & Bisnis Lainnya:</span>
          <Link href="/tools/kalkulator-finansial" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Kalkulator Finansial & Pajak
          </Link>
          <span>•</span>
          <Link href="/tools/kalkulator-umkm" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Kalkulator Laba & HPP UMKM
          </Link>
          <span>•</span>
          <Link href="/tools/passport-id-utility" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Paspor & Watermark Identitas
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
