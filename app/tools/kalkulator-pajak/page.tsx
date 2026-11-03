'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import {
  Receipt,
  Building2,
  Briefcase,
  Copy,
  Check,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Sparkles
} from 'lucide-react';

type MainTaxTab = 'pph21' | 'pph23' | 'pph42';
type Pph21Mode = 'bulanan_ter' | 'tahunan_ps17' | 'final_pesangon';

// PTKP Data based on UU Harmonisasi Peraturan Perpajakan (UU HPP)
interface PtkpItem {
  code: string;
  label: string;
  amountYearly: number;
  amountMonthly: number;
  terCategory: 'A' | 'B' | 'C';
}

const PTKP_CATEGORIES: PtkpItem[] = [
  { code: 'TK/0', label: 'TK/0 - Tidak Kawin, 0 Tanggungan', amountYearly: 54000000, amountMonthly: 4500000, terCategory: 'A' },
  { code: 'TK/1', label: 'TK/1 - Tidak Kawin, 1 Tanggungan', amountYearly: 58500000, amountMonthly: 4875000, terCategory: 'A' },
  { code: 'TK/2', label: 'TK/2 - Tidak Kawin, 2 Tanggungan', amountYearly: 63000000, amountMonthly: 5250000, terCategory: 'B' },
  { code: 'TK/3', label: 'TK/3 - Tidak Kawin, 3 Tanggungan', amountYearly: 67500000, amountMonthly: 5625000, terCategory: 'B' },
  { code: 'K/0', label: 'K/0 - Kawin, 0 Tanggungan', amountYearly: 58500000, amountMonthly: 4875000, terCategory: 'A' },
  { code: 'K/1', label: 'K/1 - Kawin, 1 Tanggungan', amountYearly: 63000000, amountMonthly: 5250000, terCategory: 'B' },
  { code: 'K/2', label: 'K/2 - Kawin, 2 Tanggungan', amountYearly: 67500000, amountMonthly: 5625000, terCategory: 'B' },
  { code: 'K/3', label: 'K/3 - Kawin, 3 Tanggungan', amountYearly: 72000000, amountMonthly: 6000000, terCategory: 'C' },
  { code: 'K/I/0', label: 'K/I/0 - Kawin Istri Gabung, 0 Tanggungan', amountYearly: 112500000, amountMonthly: 9375000, terCategory: 'A' },
  { code: 'K/I/1', label: 'K/I/1 - Kawin Istri Gabung, 1 Tanggungan', amountYearly: 117000000, amountMonthly: 9750000, terCategory: 'B' },
  { code: 'K/I/2', label: 'K/I/2 - Kawin Istri Gabung, 2 Tanggungan', amountYearly: 121500000, amountMonthly: 10125000, terCategory: 'B' },
  { code: 'K/I/3', label: 'K/I/3 - Kawin Istri Gabung, 3 Tanggungan', amountYearly: 126000000, amountMonthly: 10500000, terCategory: 'C' },
];

// Tax Object Codes for PPh 21
interface TaxObjectPph21 {
  id: string;
  code: string;
  name: string;
  description: string;
  defaultMode: Pph21Mode;
  dppPercentage: number; // e.g. 100% or 50% for non-pegawai
}

const TAX_OBJECTS_PPH21: TaxObjectPph21[] = [
  {
    id: 'pegawai_tetap',
    code: '21-100-01',
    name: 'Pegawai Tetap (Gaji Bulanan / Tahunan)',
    description: 'Karyawan tetap penerima gaji, upah, tunjangan, dan bonus rutin/tahunan.',
    defaultMode: 'bulanan_ter',
    dppPercentage: 100,
  },
  {
    id: 'bukan_pegawai',
    code: '21-100-09',
    name: 'Bukan Pegawai / Tenaga Ahli (Freelancer/Konsultan)',
    description: 'Dokter, pengacara, akuntan, arsitek, konsultan, desainer, notaris, agen iklan (DPP 50% Bruto).',
    defaultMode: 'tahunan_ps17',
    dppPercentage: 50,
  },
  {
    id: 'penerima_pensiun',
    code: '21-100-02',
    name: 'Penerima Pensiun Berkala',
    description: 'Mantan pegawai penerima uang pensiun bulanan (Biaya pensiun 5% maks Rp 200rb/bln).',
    defaultMode: 'bulanan_ter',
    dppPercentage: 100,
  },
  {
    id: 'pesangon_sekaligus',
    code: '21-401-01',
    name: 'Uang Pesangon / Manfaat Pensiun Sekaligus (PPh Final)',
    description: 'Pesangon akibat PHK, pensiun sekaligus, atau jaminan hari tua dibayarkan sekaligus.',
    defaultMode: 'final_pesangon',
    dppPercentage: 100,
  },
];

// Official TER Brackets PP 58/2023 & PMK 168/2023
const TER_A_BRACKETS = [
  { max: 5400000, rate: 0 },
  { max: 5650000, rate: 0.0025 },
  { max: 5950000, rate: 0.005 },
  { max: 6300000, rate: 0.0075 },
  { max: 6750000, rate: 0.01 },
  { max: 7500000, rate: 0.0125 },
  { max: 8550000, rate: 0.015 },
  { max: 9650000, rate: 0.0175 },
  { max: 10050000, rate: 0.02 },
  { max: 10350000, rate: 0.0225 },
  { max: 10700000, rate: 0.025 },
  { max: 12500000, rate: 0.03 },
  { max: 13750000, rate: 0.04 },
  { max: 15100000, rate: 0.05 },
  { max: 16950000, rate: 0.06 },
  { max: 19750000, rate: 0.07 },
  { max: 24100000, rate: 0.08 },
  { max: 26450000, rate: 0.09 },
  { max: 28000000, rate: 0.10 },
  { max: 30050000, rate: 0.11 },
  { max: 32400000, rate: 0.12 },
  { max: 35400000, rate: 0.13 },
  { max: 39100000, rate: 0.14 },
  { max: 43850000, rate: 0.15 },
  { max: 47800000, rate: 0.16 },
  { max: 51400000, rate: 0.17 },
  { max: 56300000, rate: 0.18 },
  { max: 62200000, rate: 0.19 },
  { max: 68600000, rate: 0.20 },
  { max: 77500000, rate: 0.21 },
  { max: 89000000, rate: 0.22 },
  { max: 103000000, rate: 0.23 },
  { max: 125000000, rate: 0.24 },
  { max: 157000000, rate: 0.25 },
  { max: 206000000, rate: 0.26 },
  { max: 337000000, rate: 0.27 },
  { max: 454000000, rate: 0.28 },
  { max: 550000000, rate: 0.29 },
  { max: 695000000, rate: 0.30 },
  { max: 910000000, rate: 0.31 },
  { max: 1400000000, rate: 0.32 },
  { max: Infinity, rate: 0.34 },
];

const TER_B_BRACKETS = [
  { max: 6200000, rate: 0 },
  { max: 6500000, rate: 0.0025 },
  { max: 6850000, rate: 0.005 },
  { max: 7300000, rate: 0.0075 },
  { max: 9200000, rate: 0.01 },
  { max: 10750000, rate: 0.015 },
  { max: 12550000, rate: 0.02 },
  { max: 14950000, rate: 0.03 },
  { max: 16500000, rate: 0.04 },
  { max: 18450000, rate: 0.05 },
  { max: 20550000, rate: 0.06 },
  { max: 23700000, rate: 0.07 },
  { max: 26100000, rate: 0.08 },
  { max: 28600000, rate: 0.09 },
  { max: 31050000, rate: 0.10 },
  { max: 34000000, rate: 0.11 },
  { max: 37300000, rate: 0.12 },
  { max: 41000000, rate: 0.13 },
  { max: 45800000, rate: 0.14 },
  { max: 51500000, rate: 0.15 },
  { max: 56300000, rate: 0.16 },
  { max: 62700000, rate: 0.17 },
  { max: 70000000, rate: 0.18 },
  { max: 79000000, rate: 0.19 },
  { max: 89000000, rate: 0.20 },
  { max: 101000000, rate: 0.21 },
  { max: 115000000, rate: 0.22 },
  { max: 133000000, rate: 0.23 },
  { max: 157000000, rate: 0.24 },
  { max: 206000000, rate: 0.25 },
  { max: 337000000, rate: 0.26 },
  { max: 454000000, rate: 0.27 },
  { max: 550000000, rate: 0.28 },
  { max: 695000000, rate: 0.29 },
  { max: 910000000, rate: 0.30 },
  { max: 1400000000, rate: 0.31 },
  { max: Infinity, rate: 0.34 },
];

const TER_C_BRACKETS = [
  { max: 6600000, rate: 0 },
  { max: 6950000, rate: 0.0025 },
  { max: 7350000, rate: 0.005 },
  { max: 7800000, rate: 0.0075 },
  { max: 8850000, rate: 0.01 },
  { max: 10900000, rate: 0.015 },
  { max: 12600000, rate: 0.02 },
  { max: 14050000, rate: 0.03 },
  { max: 15600000, rate: 0.04 },
  { max: 17350000, rate: 0.05 },
  { max: 19400000, rate: 0.06 },
  { max: 21600000, rate: 0.07 },
  { max: 24200000, rate: 0.08 },
  { max: 26800000, rate: 0.09 },
  { max: 29550000, rate: 0.10 },
  { max: 32400000, rate: 0.11 },
  { max: 35400000, rate: 0.12 },
  { max: 39100000, rate: 0.13 },
  { max: 43850000, rate: 0.14 },
  { max: 47800000, rate: 0.15 },
  { max: 51400000, rate: 0.16 },
  { max: 56300000, rate: 0.17 },
  { max: 62200000, rate: 0.18 },
  { max: 68600000, rate: 0.19 },
  { max: 77500000, rate: 0.20 },
  { max: 89000000, rate: 0.21 },
  { max: 103000000, rate: 0.22 },
  { max: 125000000, rate: 0.23 },
  { max: 157000000, rate: 0.24 },
  { max: 206000000, rate: 0.25 },
  { max: 337000000, rate: 0.26 },
  { max: 454000000, rate: 0.27 },
  { max: 550000000, rate: 0.28 },
  { max: 695000000, rate: 0.29 },
  { max: 910000000, rate: 0.30 },
  { max: 1400000000, rate: 0.31 },
  { max: Infinity, rate: 0.34 },
];

// PPh 23 Tax Object Types
interface TaxObjectPph23 {
  id: string;
  code: string;
  name: string;
  rateNormal: number; // in fraction, e.g. 0.02
  description: string;
}

const TAX_OBJECTS_PPH23: TaxObjectPph23[] = [
  {
    id: 'jasa_lain_pmk141',
    code: '23-104-99',
    name: 'Jasa Lainnya (PMK 141: IT, Software, Katering, Kebersihan, Keamanan, Ekspedisi)',
    rateNormal: 0.02,
    description: 'Imbalan jasa teknik, manajemen, konsultasi, instalasi IT/website, katering, dan jasa kebersihan.',
  },
  {
    id: 'sewa_harta',
    code: '23-100-02',
    name: 'Sewa & Penggunaan Harta (Selain Tanah & Bangunan)',
    rateNormal: 0.02,
    description: 'Sewa mobil/kendaraan dinas, sewa alat berat, sewa mesin kantor, dan peralatan produksi.',
  },
  {
    id: 'dividen_badan',
    code: '23-101-01',
    name: 'Dividen Diterima Wajib Pajak Badan Dalam Negeri',
    rateNormal: 0.15,
    description: 'Pembagian keuntungan/dividen kepada entitas badan hukum dalam negeri non-pengecualian.',
  },
  {
    id: 'royalti',
    code: '23-103-01',
    name: 'Royalti atas Hak Cipta, Paten, atau Merek',
    rateNormal: 0.15,
    description: 'Imbalan penggunaan hak cipta karya seni/tulisan, paten teknologi, waralaba/franchise, atau merek dagang.',
  },
  {
    id: 'bunga_pinjaman',
    code: '23-102-01',
    name: 'Bunga Pinjaman Selain Perbankan',
    rateNormal: 0.15,
    description: 'Bunga atas pinjaman dana antar perusahaan atau imbalan pengembalian utang.',
  },
  {
    id: 'hadiah_penghargaan',
    code: '23-100-04',
    name: 'Hadiah, Penghargaan, dan Bonus (Non-PPh 21)',
    rateNormal: 0.15,
    description: 'Hadiah perlombaan atau penghargaan yang diterima oleh Wajib Pajak Badan.',
  },
];

// PPh 4 ayat (2) Final Tax Object Types
interface TaxObjectPph42 {
  id: string;
  code: string;
  name: string;
  rate: number; // in fraction, e.g. 0.10
  description: string;
}

const TAX_OBJECTS_PPH42: TaxObjectPph42[] = [
  {
    id: 'sewa_tanah_bangunan',
    code: '28-403-01',
    name: 'Sewa Tanah dan/atau Bangunan (Kantor, Ruko, Rumah, Gudang)',
    rate: 0.10,
    description: 'Penghasilan sewa tanah, gedung kantor, ruko, tempat usaha, apartemen, atau rumah.',
  },
  {
    id: 'pengalihan_tanah_bangunan',
    code: '28-402-01',
    name: 'Pengalihan Hak atas Tanah & Bangunan (Jual Beli Properti Umum)',
    rate: 0.025,
    description: 'Pajak final penjualan properti/tanah oleh orang pribadi maupun pengembang real estate.',
  },
  {
    id: 'rumah_sederhana',
    code: '28-402-02',
    name: 'Pengalihan Hak Rumah Sederhana / Rusunami',
    rate: 0.01,
    description: 'Pengalihan hak rumah sederhana dan rusunami bersubsidi oleh pengembang.',
  },
  {
    id: 'konstruksi_kecil',
    code: '28-409-01',
    name: 'Jasa Pelaksanaan Konstruksi (Kualifikasi Usaha Kecil)',
    rate: 0.0175,
    description: 'Pekerjaan konstruksi fisik oleh penyedia jasa sertifikasi kualifikasi kecil (PP 9/2022).',
  },
  {
    id: 'konstruksi_menengah_besar',
    code: '28-409-02',
    name: 'Jasa Pelaksanaan Konstruksi (Kualifikasi Menengah / Besar)',
    rate: 0.0265,
    description: 'Pekerjaan konstruksi fisik oleh kontraktor kualifikasi menengah atau besar berizin.',
  },
  {
    id: 'konstruksi_tanpa_kualifikasi',
    code: '28-409-03',
    name: 'Jasa Pelaksanaan Konstruksi (Tanpa Kualifikasi Usaha)',
    rate: 0.04,
    description: 'Pekerjaan konstruksi fisik oleh penyedia jasa yang tidak memiliki sertifikat kualifikasi.',
  },
  {
    id: 'pengawasan_konstruksi_berkualifikasi',
    code: '28-409-04',
    name: 'Jasa Konsultansi Perencanaan / Pengawasan Konstruksi (Berkualifikasi)',
    rate: 0.035,
    description: 'Jasa arsitektur, teknik sipil, dan pengawasan proyek konstruksi berlisensi.',
  },
  {
    id: 'pengawasan_konstruksi_tanpa_kualifikasi',
    code: '28-409-05',
    name: 'Jasa Konsultansi Perencanaan / Pengawasan (Tanpa Kualifikasi)',
    rate: 0.06,
    description: 'Jasa konsultansi konstruksi tanpa sertifikat badan usaha/keahlian resmi.',
  },
  {
    id: 'bunga_deposito',
    code: '28-401-01',
    name: 'Bunga Deposito, Tabungan, & Diskonto SBI',
    rate: 0.20,
    description: 'Bunga dari simpanan deposito perbankan atau sertifikat Bank Indonesia.',
  },
  {
    id: 'hadiah_undian',
    code: '28-405-01',
    name: 'Hadiah Undian / Doorprize / Kupon Berhadiah',
    rate: 0.25,
    description: 'Pajak final hadiah undian dari bank, toko, atau penyelenggara promosi.',
  },
  {
    id: 'dividen_op',
    code: '28-419-01',
    name: 'Dividen Diterima Wajib Pajak Orang Pribadi Dalam Negeri',
    rate: 0.10,
    description: 'Pajak final 10% jika dividen tidak diinvestasikan kembali di NKRI sesuai UU HPP.',
  },
  {
    id: 'saham_bei',
    code: '28-407-01',
    name: 'Transaksi Penjualan Saham di Bursa Efek Indonesia (BEI)',
    rate: 0.001,
    description: 'Pajak final 0.1% atas nilai bruto transaksi penjualan saham biasa di bursa.',
  },
];

export default function KalkulatorPajakPage() {
  const [mainTab, setMainTab] = useState<MainTaxTab>('pph21');

  // ==========================================
  // STATE: PPh 21
  // ==========================================
  const [pph21Mode, setPph21Mode] = useState<Pph21Mode>('bulanan_ter');
  const [selectedPph21ObjId, setSelectedPph21ObjId] = useState<string>('pegawai_tetap');
  const [ptkpCode, setPtkpCode] = useState<string>('TK/0');
  const [brutoInput, setBrutoInput] = useState<string>('12000000');
  const [biayaPensiunSendiriInput, setBiayaPensiunSendiriInput] = useState<string>('200000');
  const [thrBonusInput, setThrBonusInput] = useState<string>('0');
  const [isNpwpPph21, setIsNpwpPph21] = useState<boolean>(true);

  // ==========================================
  // STATE: PPh 23
  // ==========================================
  const [selectedPph23ObjId, setSelectedPph23ObjId] = useState<string>('jasa_lain_pmk141');
  const [brutoPph23Input, setBrutoPph23Input] = useState<string>('25000000');
  const [hasNpwpPph23, setHasNpwpPph23] = useState<boolean>(true);

  // ==========================================
  // STATE: PPh 4(2)
  // ==========================================
  const [selectedPph42ObjId, setSelectedPph42ObjId] = useState<string>('sewa_tanah_bangunan');
  const [brutoPph42Input, setBrutoPph42Input] = useState<string>('60000000');

  // Utility UI states
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Format currency helpers
  const formatRupiah = useCallback((val: number): string => {
    if (isNaN(val) || val === null || val === undefined) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(val);
  }, []);

  const formatNumber = useCallback((val: number): string => {
    if (isNaN(val)) return '0';
    return new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 2,
    }).format(val);
  }, []);

  // Parse numeric string safely
  const parseNum = (str: string): number => {
    const cleaned = str.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) || num < 0 ? 0 : num;
  };

  // Selected PTKP item
  const activePtkp = useMemo(() => {
    return PTKP_CATEGORIES.find((p) => p.code === ptkpCode) || PTKP_CATEGORIES[0];
  }, [ptkpCode]);

  // Selected PPh 21 Object
  const activePph21Obj = useMemo(() => {
    return TAX_OBJECTS_PPH21.find((o) => o.id === selectedPph21ObjId) || TAX_OBJECTS_PPH21[0];
  }, [selectedPph21ObjId]);

  // ==========================================
  // CALCULATIONS: PPh 21
  // ==========================================
  const pph21Calc = useMemo(() => {
    const bruto = parseNum(brutoInput);
    const iuranSendiri = parseNum(biayaPensiunSendiriInput);
    const thrBonus = parseNum(thrBonusInput);

    // MODE 1: BULANAN TER (PP 58/2023 & PMK 168/2023)
    if (pph21Mode === 'bulanan_ter') {
      const terCategory = activePtkp.terCategory;
      const brackets =
        terCategory === 'A' ? TER_A_BRACKETS : terCategory === 'B' ? TER_B_BRACKETS : TER_C_BRACKETS;

      const matchingBracket = brackets.find((b) => bruto <= b.max) || brackets[brackets.length - 1];
      const baseRate = matchingBracket.rate;
      const taxRate = isNpwpPph21 ? baseRate : baseRate * 1.2; // 20% surcharge if without NPWP under old rule or 100% depending on regulation

      // DPP PPh 21 Bulanan = Penghasilan Bruto Sebulan
      const dpp = bruto;
      const taxAmount = Math.floor(dpp * taxRate);
      const netIncome = Math.max(0, bruto - taxAmount);

      return {
        mode: 'bulanan_ter',
        bruto,
        dpp,
        ratePercent: (taxRate * 100),
        taxAmount,
        netIncome,
        terCategory,
        details: [
          { label: 'Penghasilan Bruto Bulanan', value: formatRupiah(bruto) },
          { label: 'Kategori TER PTKP', value: `Kategori ${terCategory} (${activePtkp.code})` },
          { label: 'Dasar Pengenaan Pajak (DPP)', value: formatRupiah(dpp) },
          { label: 'Tarif Efektif Rata-Rata (TER)', value: `${(taxRate * 100).toFixed(2)}%` },
          { label: 'PPh Pasal 21 Terutang', value: formatRupiah(taxAmount), isHighlight: true },
          { label: 'Gaji Bersih Diterima (Take Home Pay)', value: formatRupiah(netIncome), isBold: true },
        ],
      };
    }

    // MODE 2: TAHUNAN PROGRESIF PASAL 17 UU HPP
    if (pph21Mode === 'tahunan_ps17') {
      const isBukanPegawai = selectedPph21ObjId === 'bukan_pegawai';
      const totalBrutoYearly = (bruto * 12) + thrBonus;

      // DPP Calculation
      let dpp = totalBrutoYearly;
      let biayaJabatan = 0;
      let penghasilanNeto = totalBrutoYearly;
      let ptkpDeduct = activePtkp.amountYearly;

      if (isBukanPegawai) {
        // Bukan Pegawai / Tenaga Ahli: DPP = 50% Bruto kumulatif
        dpp = Math.floor(totalBrutoYearly * 0.5);
        penghasilanNeto = dpp;
        ptkpDeduct = 0; // Tidak berhak PTKP kecuali memenuhi syarat tertentu
      } else if (selectedPph21ObjId === 'penerima_pensiun') {
        // Biaya Pensiun: 5% maks Rp 2.400.000 / tahun (200rb/bln)
        const maxBiayaPensiun = 2400000;
        biayaJabatan = Math.min(totalBrutoYearly * 0.05, maxBiayaPensiun);
        penghasilanNeto = Math.max(0, totalBrutoYearly - biayaJabatan - (iuranSendiri * 12));
      } else {
        // Pegawai Tetap: Biaya Jabatan 5% maks Rp 6.000.000 / tahun (500rb/bln)
        const maxBiayaJabatan = 6000000;
        biayaJabatan = Math.min(totalBrutoYearly * 0.05, maxBiayaJabatan);
        penghasilanNeto = Math.max(0, totalBrutoYearly - biayaJabatan - (iuranSendiri * 12));
      }

      // Penghasilan Kena Pajak (PKP)
      const pkp = isBukanPegawai ? dpp : Math.max(0, Math.floor((penghasilanNeto - ptkpDeduct) / 1000) * 1000);

      // Tarif Progresif Lapisan Pasal 17 UU HPP:
      // 1. 0 - 60 jt: 5%
      // 2. 60 - 250 jt: 15%
      // 3. 250 - 500 jt: 25%
      // 4. 500 jt - 5 M: 30%
      // 5. > 5 M: 35%
      let remainingPkp = pkp;
      let taxAmount = 0;
      const bracketsCalculation: { layer: string; taxable: number; rate: number; tax: number }[] = [];

      const taxTiers = [
        { max: 60000000, rate: 0.05, label: 'Lapisan 1 (s.d Rp 60 Juta - 5%)' },
        { max: 190000000, rate: 0.15, label: 'Lapisan 2 (> Rp 60 Juta s.d Rp 250 Juta - 15%)' },
        { max: 250000000, rate: 0.25, label: 'Lapisan 3 (> Rp 250 Juta s.d Rp 500 Juta - 25%)' },
        { max: 4500000000, rate: 0.30, label: 'Lapisan 4 (> Rp 500 Juta s.d Rp 5 Miliar - 30%)' },
        { max: Infinity, rate: 0.35, label: 'Lapisan 5 (> Rp 5 Miliar - 35%)' },
      ];

      for (const tier of taxTiers) {
        if (remainingPkp <= 0) break;
        const currentSlice = Math.min(remainingPkp, tier.max);
        const currentTax = Math.floor(currentSlice * tier.rate);
        taxAmount += currentTax;
        bracketsCalculation.push({
          layer: tier.label,
          taxable: currentSlice,
          rate: tier.rate * 100,
          tax: currentTax,
        });
        remainingPkp -= currentSlice;
      }

      if (!isNpwpPph21) {
        taxAmount = Math.floor(taxAmount * 1.2); // Tarif lebih tinggi 20% tanpa NPWP
      }

      const netIncomeYearly = Math.max(0, totalBrutoYearly - taxAmount);

      return {
        mode: 'tahunan_ps17',
        bruto: totalBrutoYearly,
        dpp: pkp,
        ratePercent: pkp > 0 ? (taxAmount / pkp) * 100 : 0,
        taxAmount,
        netIncome: netIncomeYearly,
        details: [
          { label: 'Penghasilan Bruto Setahun', value: formatRupiah(totalBrutoYearly) },
          { label: isBukanPegawai ? 'DPP 50% Bruto' : 'Biaya Jabatan / Pensiun (5%)', value: isBukanPegawai ? formatRupiah(dpp) : `-${formatRupiah(biayaJabatan)}` },
          ...(!isBukanPegawai ? [{ label: 'Iuran Pensiun / JHT Setahun', value: `-${formatRupiah(iuranSendiri * 12)}` }] : []),
          { label: 'Penghasilan Neto Setahun', value: formatRupiah(penghasilanNeto) },
          ...(!isBukanPegawai ? [{ label: `PTKP (${activePtkp.code})`, value: `-${formatRupiah(ptkpDeduct)}` }] : []),
          { label: 'Penghasilan Kena Pajak (PKP)', value: formatRupiah(pkp), isBold: true },
          { label: 'PPh 21 Terutang Setahun', value: formatRupiah(taxAmount), isHighlight: true },
          { label: 'Rata-Rata PPh 21 / Bulan', value: formatRupiah(Math.floor(taxAmount / 12)) },
          { label: 'Penghasilan Bersih Setahun', value: formatRupiah(netIncomeYearly), isBold: true },
        ],
        bracketsCalculation,
      };
    }

    // MODE 3: PESANGON SEKALIGUS (PP 68/2009 PPH 21 FINAL)
    const pesangonBruto = bruto;
    let remainingPesangon = pesangonBruto;
    let taxPesangon = 0;
    const pesangonTiers = [
      { max: 50000000, rate: 0, label: 'Lapisan 1 (s.d Rp 50 Juta - 0%)' },
      { max: 50000000, rate: 0.05, label: 'Lapisan 2 (> Rp 50 Juta s.d Rp 100 Juta - 5%)' },
      { max: 400000000, rate: 0.15, label: 'Lapisan 3 (> Rp 100 Juta s.d Rp 500 Juta - 15%)' },
      { max: Infinity, rate: 0.25, label: 'Lapisan 4 (> Rp 500 Juta - 25%)' },
    ];

    const bracketsCalculation: { layer: string; taxable: number; rate: number; tax: number }[] = [];

    for (const tier of pesangonTiers) {
      if (remainingPesangon <= 0) break;
      const currentSlice = Math.min(remainingPesangon, tier.max);
      const currentTax = Math.floor(currentSlice * tier.rate);
      taxPesangon += currentTax;
      bracketsCalculation.push({
        layer: tier.label,
        taxable: currentSlice,
        rate: tier.rate * 100,
        tax: currentTax,
      });
      remainingPesangon -= currentSlice;
    }

    const netPesangon = Math.max(0, pesangonBruto - taxPesangon);

    return {
      mode: 'final_pesangon',
      bruto: pesangonBruto,
      dpp: pesangonBruto,
      ratePercent: pesangonBruto > 0 ? (taxPesangon / pesangonBruto) * 100 : 0,
      taxAmount: taxPesangon,
      netIncome: netPesangon,
      details: [
        { label: 'Uang Pesangon / Manfaat Pensiun Bruto', value: formatRupiah(pesangonBruto) },
        { label: 'Dasar Pengenaan Pajak (DPP)', value: formatRupiah(pesangonBruto) },
        { label: 'Sifat Pemotongan', value: 'PPh Pasal 21 Final' },
        { label: 'Total PPh 21 Final Terutang', value: formatRupiah(taxPesangon), isHighlight: true },
        { label: 'Pesangon Bersih Diterima Karyawan', value: formatRupiah(netPesangon), isBold: true },
      ],
      bracketsCalculation,
    };
  }, [
    pph21Mode,
    selectedPph21ObjId,
    activePtkp,
    brutoInput,
    biayaPensiunSendiriInput,
    thrBonusInput,
    isNpwpPph21,
    formatRupiah,
  ]);

  // ==========================================
  // CALCULATIONS: PPh 23
  // ==========================================
  const activePph23Obj = useMemo(() => {
    return TAX_OBJECTS_PPH23.find((o) => o.id === selectedPph23ObjId) || TAX_OBJECTS_PPH23[0];
  }, [selectedPph23ObjId]);

  const pph23Calc = useMemo(() => {
    const bruto = parseNum(brutoPph23Input);
    const dpp = bruto; // DPP PPh 23 adalah jumlah bruto imbalan sebelum PPN
    // Tanpa NPWP dikenakan tarif 100% lebih tinggi (tarif normal x 2)
    const effectiveRate = hasNpwpPph23 ? activePph23Obj.rateNormal : activePph23Obj.rateNormal * 2;
    const taxAmount = Math.floor(dpp * effectiveRate);
    const netReceived = Math.max(0, bruto - taxAmount);

    return {
      bruto,
      dpp,
      ratePercent: effectiveRate * 100,
      taxAmount,
      netReceived,
      details: [
        { label: 'Nilai Transaksi Bruto (Invoice sebelum PPN)', value: formatRupiah(bruto) },
        { label: 'Dasar Pengenaan Pajak (DPP)', value: formatRupiah(dpp) },
        { label: 'Kode & Objek Pajak', value: `${activePph23Obj.code} - ${activePph23Obj.name.slice(0, 35)}...` },
        { label: 'Status NPWP Rekanan', value: hasNpwpPph23 ? 'Memiliki NPWP/NIK (Tarif Normal)' : 'Tanpa NPWP (+100% Surcharge)' },
        { label: 'Tarif PPh 23 Berlaku', value: `${(effectiveRate * 100).toFixed(1)}%` },
        { label: 'PPh Pasal 23 yang Dipotong', value: formatRupiah(taxAmount), isHighlight: true },
        { label: 'Nilai Pembayaran Bersih (Net Transfer)', value: formatRupiah(netReceived), isBold: true },
      ],
    };
  }, [activePph23Obj, brutoPph23Input, hasNpwpPph23, formatRupiah]);

  // ==========================================
  // CALCULATIONS: PPh 4(2)
  // ==========================================
  const activePph42Obj = useMemo(() => {
    return TAX_OBJECTS_PPH42.find((o) => o.id === selectedPph42ObjId) || TAX_OBJECTS_PPH42[0];
  }, [selectedPph42ObjId]);

  const pph42Calc = useMemo(() => {
    const bruto = parseNum(brutoPph42Input);
    const dpp = bruto;
    const rate = activePph42Obj.rate;
    const taxAmount = Math.floor(dpp * rate);
    const netReceived = Math.max(0, bruto - taxAmount);

    return {
      bruto,
      dpp,
      ratePercent: rate * 100,
      taxAmount,
      netReceived,
      details: [
        { label: 'Nilai Transaksi Bruto', value: formatRupiah(bruto) },
        { label: 'Dasar Pengenaan Pajak (DPP)', value: formatRupiah(dpp) },
        { label: 'Kode Objek Pajak Final', value: `${activePph42Obj.code} - ${activePph42Obj.name.slice(0, 35)}...` },
        { label: 'Tarif Pajak Final', value: `${(rate * 100).toFixed(2).replace(/\.00$/, '')}%` },
        { label: 'PPh Pasal 4 ayat (2) Final Terutang', value: formatRupiah(taxAmount), isHighlight: true },
        { label: 'Nilai Bersih Setelah Pajak Final', value: formatRupiah(netReceived), isBold: true },
      ],
    };
  }, [activePph42Obj, brutoPph42Input, formatRupiah]);

  // Copy Calculation Summary
  const handleCopySummary = () => {
    let summaryText = '';
    if (mainTab === 'pph21') {
      summaryText = `=== RINGKASAN KALKULATOR PPh 21 (KOMPRESKILAT) ===
Objek Pajak: ${activePph21Obj.name}
Status PTKP: ${activePtkp.code}
Penghasilan Bruto: ${formatRupiah(pph21Calc.bruto)}
Dasar Pengenaan Pajak (DPP/PKP): ${formatRupiah(pph21Calc.dpp)}
PPh 21 Terutang: ${formatRupiah(pph21Calc.taxAmount)}
Penghasilan Bersih (Net): ${formatRupiah(pph21Calc.netIncome)}
Dihitung otomatis 100% Client-Side di https://kompreskilat.site/tools/kalkulator-pajak`;
    } else if (mainTab === 'pph23') {
      summaryText = `=== RINGKASAN KALKULATOR PPh 23 (KOMPRESKILAT) ===
Objek Pajak: ${activePph23Obj.name} (${activePph23Obj.code})
Status NPWP: ${hasNpwpPph23 ? 'Ada NPWP (Normal)' : 'Tanpa NPWP (+100%)'}
Nilai Tagihan Bruto: ${formatRupiah(pph23Calc.bruto)}
Tarif Berlaku: ${pph23Calc.ratePercent}%
PPh 23 Dipotong: ${formatRupiah(pph23Calc.taxAmount)}
Nilai Bersih Diterima: ${formatRupiah(pph23Calc.netReceived)}
Dihitung di https://kompreskilat.site/tools/kalkulator-pajak`;
    } else {
      summaryText = `=== RINGKASAN KALKULATOR PPh 4 AYAT (2) FINAL (KOMPRESKILAT) ===
Objek Pajak: ${activePph42Obj.name} (${activePph42Obj.code})
Nilai Transaksi Bruto: ${formatRupiah(pph42Calc.bruto)}
Tarif Final: ${pph42Calc.ratePercent}%
PPh 4(2) Final Terutang: ${formatRupiah(pph42Calc.taxAmount)}
Nilai Bersih Diterima: ${formatRupiah(pph42Calc.netReceived)}
Dihitung di https://kompreskilat.site/tools/kalkulator-pajak`;
    }

    navigator.clipboard.writeText(summaryText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Kalkulator Pajak PPh 21 TER, PPh 23, PPh 4(2) Indonesia - KompresKilat',
    url: 'https://kompreskilat.site/tools/kalkulator-pajak',
    description: 'Kalkulator simulasi pajak penghasilan lengkap dan akurat sesuai UU HPP & PP 58/2023. Hitung PPh 21 Karyawan TER Bulanan & Tahunan, PPh 23 Jasa & Sewa, serta PPh 4(2) Final secara instan dan privat.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <JsonLd data={schema} />
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs px-3 py-1 rounded-full font-bold mb-3">
            <Receipt className="w-3.5 h-3.5" />
            <span>Sesuai PP 58/2023, PMK 168/2023 & UU HPP No. 7/2021</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
            Kalkulator Pajak PPh 21, PPh 23 & PPh 4(2)
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Simulasi perhitungan pajak penghasilan Indonesia 100% di browser Anda. Hitung potongan gaji karyawan, jasa rekanan bisnis, sewa properti, dan dividen secara tepat tanpa upload data.
          </p>
        </div>

        {/* Main Tax Category Navigation Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-1.5 mb-8 flex flex-wrap items-center justify-center gap-1.5 max-w-xl mx-auto">
          <button
            type="button"
            onClick={() => setMainTab('pph21')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mainTab === 'pph21'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>PPh 21 (Karyawan)</span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab('pph23')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mainTab === 'pph23'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>PPh 23 (Jasa & Modal)</span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab('pph42')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mainTab === 'pph42'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>PPh 4(2) (Pajak Final)</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PPh PASAL 21 */}
        {/* ========================================================================= */}
        {mainTab === 'pph21' && (
          <div className="space-y-6">
            {/* Sub-mode selector (Bulanan TER, Tahunan Ps 17, Final Pesangon) */}
            <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl max-w-lg mx-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPph21Mode('bulanan_ter')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${
                  pph21Mode === 'bulanan_ter'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Bulanan (Skema TER)
              </button>
              <button
                type="button"
                onClick={() => setPph21Mode('tahunan_ps17')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${
                  pph21Mode === 'tahunan_ps17'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Tahunan (Pasal 17 HPP)
              </button>
              <button
                type="button"
                onClick={() => setPph21Mode('final_pesangon')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${
                  pph21Mode === 'final_pesangon'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Final (Pesangon)
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Input Side */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <span>Parameter Pajak PPh 21</span>
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {pph21Mode === 'bulanan_ter' ? 'TER PP 58/2023' : pph21Mode === 'tahunan_ps17' ? 'Pasal 17 UU HPP' : 'PP 68/2009'}
                  </span>
                </div>

                {/* 1. Tax Object Selector */}
                {pph21Mode !== 'final_pesangon' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Kode & Objek Pajak PPh 21:
                    </label>
                    <div className="relative">
                      <select
                        value={selectedPph21ObjId}
                        onChange={(e) => setSelectedPph21ObjId(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer"
                      >
                        {TAX_OBJECTS_PPH21.filter((o) => o.id !== 'pesangon_sekaligus').map((obj) => (
                          <option key={obj.id} value={obj.id}>
                            [{obj.code}] {obj.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {activePph21Obj.description}
                    </p>
                  </div>
                )}

                {/* 2. PTKP Status Selector */}
                {pph21Mode !== 'final_pesangon' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Status Kategori PTKP:
                      </label>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        Kategori TER {activePtkp.terCategory} ({formatRupiah(activePtkp.amountYearly)}/thn)
                      </span>
                    </div>
                    <div className="relative">
                      <select
                        value={ptkpCode}
                        onChange={(e) => setPtkpCode(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer"
                      >
                        {PTKP_CATEGORIES.map((ptkp) => (
                          <option key={ptkp.code} value={ptkp.code}>
                            {ptkp.label} - (Rp {formatNumber(ptkp.amountYearly / 1000000)} Juta/tahun)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* 3. Gross Income Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {pph21Mode === 'final_pesangon'
                      ? 'Total Uang Pesangon / Manfaat Pensiun Bruto (Rp):'
                      : pph21Mode === 'tahunan_ps17'
                      ? 'Gaji & Tunjangan Bruto per Bulan (Rp):'
                      : 'Penghasilan Bruto Sebulan (Rp):'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="100000"
                      value={brutoInput}
                      onChange={(e) => setBrutoInput(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </div>

                  {/* Quick nomination buttons */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {[5000000, 8000000, 12000000, 20000000, 35000000, 50000000].map((nom) => (
                      <button
                        key={nom}
                        type="button"
                        onClick={() => setBrutoInput(String(nom))}
                        className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                          parseNum(brutoInput) === nom
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {formatNumber(nom / 1000000)} Jt
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional inputs for Tahunan mode */}
                {pph21Mode === 'tahunan_ps17' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        THR / Bonus Tahunan (Rp):
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={thrBonusInput}
                        onChange={(e) => setThrBonusInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Iuran JHT/JP Pribadi/bln (Rp):
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={biayaPensiunSendiriInput}
                        onChange={(e) => setBiayaPensiunSendiriInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                {/* NPWP Status Checkbox */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={isNpwpPph21}
                      onChange={(e) => setIsNpwpPph21(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span>Wajib Pajak memiliki NPWP / NIK Terdaftar Valid</span>
                  </label>
                  {!isNpwpPph21 && (
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      +20% Tarif Lebih Tinggi
                    </span>
                  )}
                </div>
              </div>

              {/* Real-time Result Side */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/60 text-xs">
                    <span className="font-bold text-indigo-950 dark:text-indigo-200">
                      Hasil Simulasi PPh 21
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Tersalin' : 'Salin Slip'}</span>
                    </button>
                  </div>

                  {/* Main Tax Due Display */}
                  <div className="py-4 text-center">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      {pph21Mode === 'tahunan_ps17' ? 'PPh 21 Terutang Setahun' : 'Potongan PPh 21 Terutang'}
                    </div>
                    <div className="text-3xl font-black text-indigo-700 dark:text-indigo-300 tracking-tight">
                      {formatRupiah(pph21Calc.taxAmount)}
                    </div>
                    <div className="inline-block mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
                      Tarif Efektif: {pph21Calc.ratePercent.toFixed(2)}%
                    </div>
                  </div>

                  {/* Breakdown Details */}
                  <div className="space-y-2 border-t border-indigo-100 dark:border-indigo-900/60 pt-4 text-xs">
                    {pph21Calc.details.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between py-1 ${
                          item.isHighlight
                            ? 'font-bold text-indigo-800 dark:text-indigo-200 bg-white/70 dark:bg-slate-800/70 px-2 rounded-lg'
                            : item.isBold
                            ? 'font-bold text-slate-900 dark:text-white'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progressive bracket preview if Tahunan */}
                {'bracketsCalculation' in pph21Calc && pph21Calc.bracketsCalculation && (
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Rincian Lapisan Tarif Progresif:
                    </span>
                    {pph21Calc.bracketsCalculation.map((tier, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                        <span>{tier.layer}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatRupiah(tier.tax)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PPh PASAL 23 */}
        {/* ========================================================================= */}
        {mainTab === 'pph23' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Input Form */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-600" />
                  <span>Kalkulator Pemotongan PPh Pasal 23</span>
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  PMK 141 / UU PPh
                </span>
              </div>

              {/* 1. Tax Object Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jenis Transaksi / Objek Pajak PPh 23:
                </label>
                <div className="relative">
                  <select
                    value={selectedPph23ObjId}
                    onChange={(e) => setSelectedPph23ObjId(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8 cursor-pointer"
                  >
                    {TAX_OBJECTS_PPH23.map((obj) => (
                      <option key={obj.id} value={obj.id}>
                        [{obj.code}] {obj.name} ({(obj.rateNormal * 100)}%)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {activePph23Obj.description}
                </p>
              </div>

              {/* 2. Gross Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nilai Bruto Tagihan / Invoice (Sebelum PPN):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="500000"
                    value={brutoPph23Input}
                    onChange={(e) => setBrutoPph23Input(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>

                {/* Quick denomination chips */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {[5000000, 10000000, 25000000, 50000000, 100000000].map((nom) => (
                    <button
                      key={nom}
                      type="button"
                      onClick={() => setBrutoPph23Input(String(nom))}
                      className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                        parseNum(brutoPph23Input) === nom
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {formatNumber(nom / 1000000)} Jt
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. NPWP Toggle */}
              <div className="pt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={hasNpwpPph23}
                      onChange={(e) => setHasNpwpPph23(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span>Rekanan memiliki NPWP / NIK valid</span>
                  </label>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    hasNpwpPph23
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}>
                    {hasNpwpPph23 ? 'Tarif Standar' : 'Surcharge 100%'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Sesuai UU PPh Pasal 23 ayat (1a), rekanan tanpa NPWP dipotong 100% lebih tinggi (tarif normal x 2).
                </p>
              </div>
            </div>

            {/* Right: Real-time Result */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-slate-900 rounded-2xl border border-blue-200 dark:border-blue-900/60 p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-blue-100 dark:border-blue-900/60 text-xs">
                  <span className="font-bold text-blue-950 dark:text-blue-200">
                    Kewajiban Potong PPh 23
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Tersalin' : 'Salin Bukti'}</span>
                  </button>
                </div>

                {/* Amount to Withhold */}
                <div className="py-4 text-center">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    PPh 23 yang Wajib Dipotong
                  </div>
                  <div className="text-3xl font-black text-blue-700 dark:text-blue-300 tracking-tight">
                    {formatRupiah(pph23Calc.taxAmount)}
                  </div>
                  <div className="inline-block mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-blue-200 dark:border-blue-800 shadow-xs">
                    Tarif Pemotongan: {pph23Calc.ratePercent.toFixed(1)}%
                  </div>
                </div>

                {/* Breakdown Details */}
                <div className="space-y-2 border-t border-blue-100 dark:border-blue-900/60 pt-4 text-xs">
                  {pph23Calc.details.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between py-1 ${
                        item.isHighlight
                          ? 'font-bold text-blue-800 dark:text-blue-200 bg-white/70 dark:bg-slate-800/70 px-2 rounded-lg'
                          : item.isBold
                          ? 'font-bold text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PPh PASAL 4 AYAT (2) FINAL */}
        {/* ========================================================================= */}
        {mainTab === 'pph42' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Input Form */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Kalkulator Pajak Penghasilan Final Pasal 4(2)</span>
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  PPh Final Bersifat Tuntas
                </span>
              </div>

              {/* 1. Tax Object Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Objek Pajak Penghasilan Final:
                </label>
                <div className="relative">
                  <select
                    value={selectedPph42ObjId}
                    onChange={(e) => setSelectedPph42ObjId(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none pr-8 cursor-pointer"
                  >
                    {TAX_OBJECTS_PPH42.map((obj) => (
                      <option key={obj.id} value={obj.id}>
                        [{obj.code}] {obj.name} ({(obj.rate * 100).toFixed(2).replace(/\.00$/, '')}%)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {activePph42Obj.description}
                </p>
              </div>

              {/* 2. Gross Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nilai Transaksi Bruto (Rp):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1000000"
                    value={brutoPph42Input}
                    onChange={(e) => setBrutoPph42Input(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                  />
                </div>

                {/* Quick denomination chips */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {[10000000, 30000000, 60000000, 150000000, 500000000].map((nom) => (
                    <button
                      key={nom}
                      type="button"
                      onClick={() => setBrutoPph42Input(String(nom))}
                      className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                        parseNum(brutoPph42Input) === nom
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {formatNumber(nom / 1000000)} Jt
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ℹ️ <strong>Karakteristik Pajak Final:</strong> Pajak yang dipotong pada PPh Pasal 4(2) bersifat selesai/tuntas dan tidak dapat dikreditkan pada SPT Tahunan, namun penghasilan serta pajaknya wajib dilaporkan pada lampiran penghasilan final SPT.
              </div>
            </div>

            {/* Right: Real-time Result */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/60 text-xs">
                  <span className="font-bold text-emerald-950 dark:text-emerald-200">
                    Nilai PPh Final Terutang
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Tersalin' : 'Salin Bukti'}</span>
                  </button>
                </div>

                {/* Amount to Withhold */}
                <div className="py-4 text-center">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    PPh 4(2) Final Terutang
                  </div>
                  <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">
                    {formatRupiah(pph42Calc.taxAmount)}
                  </div>
                  <div className="inline-block mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                    Tarif Final: {pph42Calc.ratePercent.toFixed(2).replace(/\.00$/, '')}%
                  </div>
                </div>

                {/* Breakdown Details */}
                <div className="space-y-2 border-t border-emerald-100 dark:border-emerald-900/60 pt-4 text-xs">
                  {pph42Calc.details.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between py-1 ${
                        item.isHighlight
                          ? 'font-bold text-emerald-800 dark:text-emerald-200 bg-white/70 dark:bg-slate-800/70 px-2 rounded-lg'
                          : item.isBold
                          ? 'font-bold text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Educational Informative Section */}
        <div className="mt-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Panduan Singkat Perpajakan Indonesia (UU HPP & PP 58/2023)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prinsip dasar perhitungan Dasar Pengenaan Pajak (DPP) dan tarif pemotongan resmi Kemenkeu & Ditjen Pajak.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                1. Skema Baru PPh 21 TER (2024 - Sekarang)
              </h3>
              <p className="leading-relaxed">
                Sejak berlakunya PP 58/2023 dan PMK 168/2023, pemotongan bulanan (Januari–November) menggunakan Tarif Efektif Rata-rata (TER A, B, atau C) dikalikan penghasilan bruto sebulan. Pajak Desember dihitung menggunakan tarif progresif Pasal 17 UU HPP dikurangi akumulasi pajak yang telah dipotong.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-blue-600" />
                2. PPh 23 untuk Pengusaha & Vendor
              </h3>
              <p className="leading-relaxed">
                Dipotong oleh badan usaha atas imbalan jasa teknik, manajemen, IT, konsultan, dan sewa alat sebesar 2% dari DPP (sebelum PPN). Jika penyedia jasa tidak memiliki NPWP, wajib dipotong tarif 100% lebih tinggi (menjadi 4%).
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                3. PPh 4(2) Bersifat Final & Tuntas
              </h3>
              <p className="leading-relaxed">
                Pengenaan pajak atas sewa gedung/tanah (10%), jual beli properti (2.5%), dan bunga deposito (20%) tidak digabungkan dengan penghasilan neto tahunan reguler dalam perhitungan pajak progresif SPT Tahunan.
              </p>
            </div>
          </div>
        </div>

        {/* Ad Placement */}
        <div className="my-8">
          <AdBanner slotId="kalkulator-pajak-bottom" />
        </div>

        {/* FAQ Accordion Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            Tanya Jawab Seputar Pajak Penghasilan (FAQ)
          </h2>

          <div className="space-y-3">
            {[
              {
                q: 'Apa perbedaan Kategori TER A, TER B, dan TER C pada PPh 21?',
                a: 'Kategori TER ditentukan berdasarkan status PTKP. TER A berlaku untuk status TK/0 (54 juta), TK/1 (58.5 juta), dan K/0 (58.5 juta). TER B berlaku untuk TK/2, TK/3, K/1, dan K/2. Sedangkan TER C berlaku untuk K/3 (72 juta).',
              },
              {
                q: 'Berapakah batas Penghasilan Tidak Kena Pajak (PTKP) terbaru di Indonesia?',
                a: 'Berdasarkan UU Harmonisasi Peraturan Perpajakan (HPP), batas PTKP dasar untuk Wajib Pajak Orang Pribadi lajang tanpa tanggungan (TK/0) adalah Rp 54.000.000 per tahun (atau Rp 4.500.000 per bulan). Setiap tambahan status kawin atau tanggungan keluarga (maksimal 3 orang) menambah Rp 4.500.000 per tahun.',
              },
              {
                q: 'Berapa lapisan tarif progresif Pasal 17 UU HPP untuk Orang Pribadi?',
                a: 'UU HPP membagi 5 lapisan tarif: 1) Rp 0 s.d. Rp 60 juta = 5%, 2) > Rp 60 juta s.d. Rp 250 juta = 15%, 3) > Rp 250 juta s.d. Rp 500 juta = 25%, 4) > Rp 500 juta s.d. Rp 5 miliar = 30%, 5) > Rp 5 miliar = 35%.',
              },
              {
                q: 'Apakah data keuangan atau gaji saya aman saat menggunakan kalkulator ini?',
                a: 'Sangat aman 100%. KompresKilat memproses seluruh algoritma matematika perpajakan secara client-side langsung di browser perangkat Anda. Tidak ada data gaji, omzet, atau nama yang dikirim atau disimpan ke server mana pun.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
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

        {/* Quick Links to Related Tools */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Perkakas Finansial & Bisnis Lainnya:</span>
          <Link href="/tools/kalkulator-umkm" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Kalkulator Laba & HPP UMKM
          </Link>
          <span>•</span>
          <Link href="/tools/kalkulator-finansial" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Kalkulator Diskon & Zakat
          </Link>
          <span>•</span>
          <Link href="/tools/currency-converter" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Konverter Kurs Mata Uang Global
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

