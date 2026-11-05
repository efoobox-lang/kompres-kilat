'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';
import {
  FileText,
  Printer,
  Download,
  Plus,
  Trash2,
  Upload,
  PenTool,
  Stamp,
  Receipt,
  FileCheck,
  Building2,
  CreditCard,
  Sliders,
  ChevronDown,
  Move,
  RotateCcw,
  MousePointerClick,
  Layout,
  AlertTriangle,
  CheckCircle2,
  Info,
  X
} from 'lucide-react';
import DraggableCanvasElement, { ElementPosition } from '@/components/DraggableCanvasElement';

export type DocumentType = 'invoice' | 'nota' | 'kwitansi';
export type PaperSize = 'a4' | 'a5' | 'thermal80' | 'thermal58';
export type PaperOrientation = 'portrait' | 'landscape';
export type LogoPosition = 'left' | 'center' | 'right';
export type StampShape = 'circle' | 'rectangle';
export type StampColor = 'blue' | 'red' | 'purple' | 'green';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
}

// Fungsi konversi angka ke terbilang Bahasa Indonesia
export function angkaKeTerbilang(nilai: number): string {
  if (isNaN(nilai) || nilai === 0) return 'Nol Rupiah';
  const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

  function sebut(n: number): string {
    if (n < 12) return satuan[n];
    if (n < 20) return sebut(n - 10) + ' Belas';
    if (n < 100) return sebut(Math.floor(n / 10)) + ' Puluh ' + sebut(n % 10);
    if (n < 200) return 'Seratus ' + sebut(n - 100);
    if (n < 1000) return sebut(Math.floor(n / 100)) + ' Ratus ' + sebut(n % 100);
    if (n < 2000) return 'Seribu ' + sebut(n - 1000);
    if (n < 1000000) return sebut(Math.floor(n / 1000)) + ' Ribu ' + sebut(n % 1000);
    if (n < 1000000000) return sebut(Math.floor(n / 1000000)) + ' Juta ' + sebut(n % 1000000);
    if (n < 1000000000000) return sebut(Math.floor(n / 1000000000)) + ' Miliar ' + sebut(n % 1000000000);
    return sebut(Math.floor(n / 1000000000000)) + ' Triliun ' + sebut(n % 1000000000000);
  }

  const hasil = sebut(Math.floor(Math.abs(nilai))).replace(/\s+/g, ' ').trim();
  return (nilai < 0 ? 'Minus ' : '') + hasil + ' Rupiah';
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function InvoiceGeneratorPage() {
  // Pilihan Dokumen & Kertas
  const [docType, setDocType] = useState<DocumentType>('invoice');
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');
  const [orientation, setOrientation] = useState<PaperOrientation>('portrait');
  const [themeColor, setThemeColor] = useState<string>('#4f46e5'); // Indigo default

  // Status orientasi landscape aktif untuk kertas non-thermal
  const isLandscape = orientation === 'landscape' && !paperSize.startsWith('thermal');

  // Kalkulasi dimensi kontainer pratinjau dokumen secara dinamis
  const previewDimensions = {
    width:
      paperSize === 'a4'
        ? isLandscape
          ? '1123px'
          : '794px'
        : paperSize === 'a5'
        ? isLandscape
          ? '794px'
          : '560px'
        : paperSize === 'thermal80'
        ? '302px'
        : '220px',
    minHeight:
      paperSize === 'a4'
        ? isLandscape
          ? '794px'
          : '1123px'
        : paperSize === 'a5'
        ? isLandscape
          ? '560px'
          : '794px'
        : 'auto',
    aspectRatio:
      paperSize === 'a4'
        ? isLandscape
          ? '1123 / 794'
          : '794 / 1123'
        : paperSize === 'a5'
        ? isLandscape
          ? '794 / 560'
          : '560 / 794'
        : undefined,
  };

  // Info Perusahaan / Toko
  const [companyName, setCompanyName] = useState<string>('PT KOMPRES KILAT DIGITAL');
  const [companyTagline, setCompanyTagline] = useState<string>('Solusi Dokumen & Layanan Digital Terpadu');
  const [companyAddress, setCompanyAddress] = useState<string>('Gedung Cyber 2 Lantai 18, Jl. HR Rasuna Said, Jakarta Selatan');
  const [companyPhone, setCompanyPhone] = useState<string>('0812-3456-7890');
  const [companyEmail, setCompanyEmail] = useState<string>('halo@kompreskilat.site');
  const [companyTaxId, setCompanyTaxId] = useState<string>('01.234.567.8-901.000');

  // Pengaturan Logo
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoSize, setLogoSize] = useState<number>(80);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('left');

  // Metadata Dokumen
  const [docNumber, setDocNumber] = useState<string>('INV-2026/XI/0089');
  const [issueDate, setIssueDate] = useState<string>('2026-11-05');
  const [dueDate, setDueDate] = useState<string>('2026-11-19');
  const [poNumber, setPoNumber] = useState<string>('PO-9921');

  // Info Klien / Pembeli
  const [clientName, setClientName] = useState<string>('Bpk. Budi Santoso');
  const [clientCompany, setClientCompany] = useState<string>('CV Sinar Maju Perkasa');
  const [clientAddress, setClientAddress] = useState<string>('Kawasan Industri Jababeka Blok C-12, Cikarang');
  const [clientPhone, setClientPhone] = useState<string>('0857-1122-3344');

  // Item Pembelian / Jasa
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: 'Langganan Web Utility & API Suite Enterprise (1 Tahun)',
      quantity: 1,
      unitPrice: 3500000,
      discountPercent: 0,
    },
    {
      id: '2',
      description: 'Layanan Setup Server & Kustomisasi Dokumen OCR',
      quantity: 2,
      unitPrice: 750000,
      discountPercent: 10,
    },
  ]);

  // Kalkulasi Tambahan
  const [taxPercent, setTaxPercent] = useState<number>(11); // PPN 11%
  const [shippingFee, setShippingFee] = useState<number>(50000);
  const [cashGiven, setCashGiven] = useState<number>(5500000); // Untuk Nota Kasir
  const [paymentTerms, setPaymentTerms] = useState<string>('Pembayaran jatuh tempo dalam 14 hari sejak tanggal faktur. Harap cantumkan nomor invoice pada berita transfer.');

  // Rekening Bank
  const [bankName, setBankName] = useState<string>('BCA (Bank Central Asia)');
  const [bankAccount, setBankAccount] = useState<string>('8800-9922-11');
  const [bankAccountName, setBankAccountName] = useState<string>('PT KOMPRES KILAT DIGITAL');

  // Kwitansi spesifik
  const [receivedFrom, setReceivedFrom] = useState<string>('PT Citra Perkasa Mandiri');
  const [paymentFor, setPaymentFor] = useState<string>('Pelunasan Biaya Pengembangan Sistem Dokumen Digital Tahap II');
  const [receiptCity, setReceiptCity] = useState<string>('Jakarta');

  // Tanda Tangan
  const [signerName, setSignerName] = useState<string>('Budi Pengerti, S.Hum.');
  const [signerTitle, setSignerTitle] = useState<string>('Finance & Accounting Manager');
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload' | 'text'>('draw');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');

  // Cap Stempel Digital
  const [enableStamp, setEnableStamp] = useState<boolean>(true);
  const [stampShape, setStampShape] = useState<StampShape>('circle');
  const [stampColor, setStampColor] = useState<StampColor>('blue');
  const [stampTopText, setStampTopText] = useState<string>('PT KOMPRES KILAT DIGITAL');
  const [stampStatusText, setStampStatusText] = useState<string>('LUNAS');
  const [stampBottomText, setStampBottomText] = useState<string>('JAKARTA • 2026');
  const [stampRotation, setStampRotation] = useState<number>(-12);

  // Status & Navigasi
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<{
    type: 'success' | 'warning' | 'info';
    message: string;
  } | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'doc' | 'business' | 'items' | 'stamp'>('doc');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ==========================================
  // Free-Form Drag & Drop Elements State
  // ==========================================
  const [isFreeLayout, setIsFreeLayout] = useState<boolean>(true);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const [logoPos, setLogoPos] = useState<ElementPosition>({
    x: 48,
    y: 48,
    width: 90,
  });

  const [signaturePos, setSignaturePos] = useState<ElementPosition>({
    x: 520,
    y: 920,
    width: 160,
  });

  const [stampPos, setStampPos] = useState<ElementPosition>({
    x: 550,
    y: 880,
    width: 115,
    rotation: -12,
  });

  const resetElementPositions = useCallback((paper: PaperSize, orient?: PaperOrientation) => {
    const curOrient = orient || orientation;

    if (paper === 'a5') {
      if (curOrient === 'landscape') {
        setLogoPos({ x: 36, y: 32, width: 85 });
        setSignaturePos({ x: 570, y: 380, width: 140 });
        setStampPos({ x: 600, y: 350, width: 100, rotation: -12 });
      } else {
        setLogoPos({ x: 32, y: 32, width: 75 });
        setSignaturePos({ x: 360, y: 640, width: 140 });
        setStampPos({ x: 385, y: 610, width: 100, rotation: -12 });
      }
    } else if (paper === 'thermal80') {
      setLogoPos({ x: 106, y: 16, width: 90 });
      setSignaturePos({ x: 76, y: 560, width: 150 });
      setStampPos({ x: 96, y: 530, width: 95, rotation: -12 });
    } else if (paper === 'thermal58') {
      setLogoPos({ x: 75, y: 12, width: 70 });
      setSignaturePos({ x: 45, y: 520, width: 130 });
      setStampPos({ x: 60, y: 490, width: 85, rotation: -12 });
    } else {
      // Default A4
      if (curOrient === 'landscape') {
        setLogoPos({ x: 48, y: 48, width: 100 });
        setSignaturePos({ x: 860, y: 590, width: 160 });
        setStampPos({ x: 890, y: 560, width: 115, rotation: -12 });
      } else {
        setLogoPos({ x: 48, y: 48, width: 90 });
        setSignaturePos({ x: 520, y: 920, width: 160 });
        setStampPos({ x: 550, y: 880, width: 115, rotation: -12 });
      }
    }
  }, [orientation]);

  // Refs
  const previewRef = useRef<HTMLDivElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);

  // Hitung Total Finansial
  const subtotal = items.reduce((acc, item) => {
    const raw = item.quantity * item.unitPrice;
    const discount = (raw * item.discountPercent) / 100;
    return acc + (raw - discount);
  }, 0);

  const taxAmount = (subtotal * taxPercent) / 100;
  const grandTotal = subtotal + taxAmount + (shippingFee || 0);
  const changeAmount = Math.max(0, (cashGiven || 0) - grandTotal);
  const terbilangText = angkaKeTerbilang(grandTotal);

  // Setup Canvas Tanda Tangan
  const initCanvas = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0f172a';
  }, []);

  useEffect(() => {
    if (signatureMode === 'draw') {
      initCanvas();
    }
  }, [signatureMode, initCanvas]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    setSignatureDataUrl(canvas.toDataURL('image/png'));
    setSelectedElementId('signature');
  };

  const clearCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl('');
  };

  // Upload Logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogoUrl(ev.target?.result as string);
        setSelectedElementId('logo');
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload Tanda Tangan PNG
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSignatureDataUrl(ev.target?.result as string);
        setSelectedElementId('signature');
      };
      reader.readAsDataURL(file);
    }
  };

  // Tambah & Hapus Item
  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((it) => it.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, val: string | number) => {
    setItems(
      items.map((it) => {
        if (it.id === id) {
          return { ...it, [field]: val };
        }
        return it;
      })
    );
  };

  // Muat Contoh Template (Presets)
  const loadPreset = (type: DocumentType) => {
    setDocType(type);
    if (type === 'invoice') {
      setPaperSize('a4');
      setOrientation('portrait');
      resetElementPositions('a4', 'portrait');
      setDocNumber(`INV-2026/XI/${Math.floor(1000 + Math.random() * 9000)}`);
      setStampStatusText('LUNAS');
      setStampColor('blue');
    } else if (type === 'nota') {
      setPaperSize('a5');
      setOrientation('portrait');
      resetElementPositions('a5', 'portrait');
      setDocNumber(`NOTA-${Math.floor(100 + Math.random() * 900)}`);
      setStampStatusText('LUNAS');
      setStampColor('red');
    } else if (type === 'kwitansi') {
      setPaperSize('a5');
      setOrientation('landscape');
      resetElementPositions('a5', 'landscape');
      setDocNumber(`KWT-2026/${Math.floor(10 + Math.random() * 90)}`);
      setStampStatusText('DITERIMA');
      setStampColor('green');
    }
  };

  // Cetak Dokumen via Browser Print
  const handlePrint = async () => {
    setSelectedElementId(null);
    await new Promise((r) => setTimeout(r, 60));
    window.print();
  };

  // Unduh Dokumen ke Format PDF Berkualitas Tinggi (html2canvas + jsPDF) Langsung ke Perangkat
  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    setSelectedElementId(null);
    setIsExporting(true);
    setExportNotice(null);

    // Beri jeda singkat agar DOM dan event unselect selesai
    await new Promise((r) => setTimeout(r, 100));

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const targetElement = previewRef.current;

      // Konfigurasi html2canvas optimal:
      // useCORS: true dan allowTaint: false WAJIB agar kanvas tidak tainted saat toDataURL dipanggil
      const canvas = await html2canvas(targetElement, {
        scale: 2.0,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: targetElement.scrollWidth,
        windowHeight: targetElement.scrollHeight,
      });

      if (!canvas) {
        throw new Error('Canvas render menghasilkan objek kosong');
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      let pdfWidth = 210;
      let pdfHeight = 297;
      let pdfOrient: 'p' | 'l' = orientation === 'landscape' ? 'l' : 'p';

      if (paperSize === 'a4') {
        if (orientation === 'landscape') {
          pdfWidth = 297;
          pdfHeight = 210;
          pdfOrient = 'l';
        } else {
          pdfWidth = 210;
          pdfHeight = 297;
          pdfOrient = 'p';
        }
      } else if (paperSize === 'a5') {
        if (orientation === 'landscape') {
          pdfWidth = 210;
          pdfHeight = 148;
          pdfOrient = 'l';
        } else {
          pdfWidth = 148;
          pdfHeight = 210;
          pdfOrient = 'p';
        }
      } else if (paperSize === 'thermal80') {
        pdfWidth = 80;
        pdfHeight = Math.max(120, (canvas.height * 80) / canvas.width);
        pdfOrient = 'p';
      } else if (paperSize === 'thermal58') {
        pdfWidth = 58;
        pdfHeight = Math.max(100, (canvas.height * 58) / canvas.width);
        pdfOrient = 'p';
      }

      const pdf = new jsPDF({
        orientation: pdfOrient,
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
        compress: true,
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      const fileName = `${docType.toUpperCase()}_${docNumber.replace(/[/\\?%*:|"<>]/g, '-')}.pdf`;

      // Ekspor via Blob + anchor download agar file langsung terunduh otomatis ke folder Downloads
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

      setExportNotice({
        type: 'success',
        message: `File PDF "${fileName}" berhasil diunduh otomatis ke perangkat Anda.`,
      });
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err) {
      console.error('Ekspor unduh PDF langsung mengalami kendala:', err);

      setExportNotice({
        type: 'warning',
        message: 'Gagal membuat file PDF secara otomatis karena keterbatasan render browser. Silakan gunakan tombol "Cetak" jika ingin menyimpan sebagai PDF via dialog cetak.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Pilihan Warna Stempel
  const stampColorMap: Record<StampColor, { border: string; text: string; hex: string }> = {
    blue: { border: 'border-blue-700 text-blue-700', text: 'text-blue-700', hex: '#1d4ed8' },
    red: { border: 'border-red-600 text-red-600', text: 'text-red-600', hex: '#dc2626' },
    purple: { border: 'border-purple-700 text-purple-700', text: 'text-purple-700', hex: '#7e22ce' },
    green: { border: 'border-emerald-700 text-emerald-700', text: 'text-emerald-700', hex: '#047857' },
  };

  // Helper render SVG Cap Stempel Digital
  const renderStampSvg = (w: number, h: number) => {
    if (stampShape === 'circle') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width={w} height={h} className="overflow-visible select-none">
          <defs>
            <path id="stampCircleTop" d="M 25,80 A 55,55 0 0,1 135,80" fill="none" />
            <path id="stampCircleBottom" d="M 135,80 A 55,55 0 0,1 25,80" fill="none" />
          </defs>
          <circle cx="80" cy="80" r="74" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="80" cy="80" r="67" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
          <text fill="currentColor" fontSize="9" fontWeight="bold" letterSpacing="1">
            <textPath href="#stampCircleTop" startOffset="50%" textAnchor="middle">
              {stampTopText}
            </textPath>
          </text>
          <text x="26" y="84" fill="currentColor" fontSize="10">★</text>
          <text x="124" y="84" fill="currentColor" fontSize="10">★</text>
          <rect x="22" y="66" width="116" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <text x="80" y="86" fill="currentColor" fontSize="16" fontWeight="900" textAnchor="middle" letterSpacing="2">
            {stampStatusText}
          </text>
          <text fill="currentColor" fontSize="8" fontWeight="600" letterSpacing="1">
            <textPath href="#stampCircleBottom" startOffset="50%" textAnchor="middle">
              {stampBottomText}
            </textPath>
          </text>
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 90" width={w} height={h} className="overflow-visible select-none">
          <rect x="3" y="3" width="164" height="84" fill="none" stroke="currentColor" strokeWidth="2.5" rx="3" />
          <rect x="7" y="7" width="156" height="76" fill="none" stroke="currentColor" strokeWidth="1" rx="2" />
          <text x="85" y="24" fill="currentColor" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="1">
            {stampTopText}
          </text>
          <line x1="15" y1="30" x2="155" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
          <text x="85" y="52" fill="currentColor" fontSize="18" fontWeight="900" textAnchor="middle" letterSpacing="2">
            {stampStatusText}
          </text>
          <line x1="15" y1="58" x2="155" y2="58" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
          <text x="85" y="74" fill="currentColor" fontSize="8" fontWeight="700" textAnchor="middle" letterSpacing="1">
            {stampBottomText}
          </text>
        </svg>
      );
    }
  };

  // Structured Data Schema untuk SEO Google
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pembuat Invoice, Nota & Kwitansi Instan Online - KompresKilat',
    url: 'https://www.kompreskilat.site/tools/invoice-generator',
    description: 'Buat faktur tagihan invoice, nota toko penjualan, dan kwitansi resmi gratis dengan logo perusahaan, tanda tangan digital, cap stempel LUNAS, serta cetak ukuran A4, A5, dan struk thermal 58mm/80mm.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-16">
      <JsonLd data={schema} />
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Header Breadcrumbs & Judul */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        {/* AdSense Slot Atas */}
        <div className="mb-6 print:hidden">
          <AdBanner slotId="8472910384" />
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/" className="hover:text-indigo-600">Beranda</Link>
              <span>/</span>
              <span>Bisnis &amp; Kalkulator</span>
              <span>/</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Invoice, Nota &amp; Kwitansi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>🧾</span>
              <span>Pembuat Invoice, Nota &amp; Kwitansi Instan</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Buat dokumen penagihan dan bukti transaksi bisnis resmi dengan logo kustom, tanda tangan, cap stempel digital, dan cetak ukuran A4, A5, atau printer kasir thermal.
            </p>
          </div>

          {/* Quick Actions (Muat Template Cepat) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadPreset('invoice')}
              className={`text-xs px-3 py-2 rounded-xl border font-bold flex items-center gap-1.5 transition ${
                docType === 'invoice'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Invoice</span>
            </button>
            <button
              type="button"
              onClick={() => loadPreset('nota')}
              className={`text-xs px-3 py-2 rounded-xl border font-bold flex items-center gap-1.5 transition ${
                docType === 'nota'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Nota Toko</span>
            </button>
            <button
              type="button"
              onClick={() => loadPreset('kwitansi')}
              className={`text-xs px-3 py-2 rounded-xl border font-bold flex items-center gap-1.5 transition ${
                docType === 'kwitansi'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Kwitansi</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher (Editor vs Preview) */}
        <div className="sm:hidden flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1 mb-4 print:hidden">
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mobileTab === 'editor'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            ✏️ Formulir Edit
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mobileTab === 'preview'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            👁️ Pratinjau Dokumen
          </button>
        </div>

        {/* Grid Workspace: Form Editor (Kiri) & Live Preview (Kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ======================================================== */}
          {/* KOLOM KIRI: PENGATURAN & FORMULIR INPUT */}
          {/* ======================================================== */}
          <div className={`${isLandscape ? 'lg:col-span-4' : 'lg:col-span-5'} space-y-4 print:hidden ${mobileTab === 'preview' ? 'hidden sm:block' : 'block'}`}>
            {/* Form Category Navigation */}
            <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setActiveFormTab('doc')}
                className={`flex-1 py-2 px-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  activeFormTab === 'doc'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Format</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('business')}
                className={`flex-1 py-2 px-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  activeFormTab === 'business'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Profil</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('items')}
                className={`flex-1 py-2 px-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  activeFormTab === 'items'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Rincian</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('stamp')}
                className={`flex-1 py-2 px-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  activeFormTab === 'stamp'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Stamp className="w-3.5 h-3.5" />
                <span>Stempel</span>
              </button>
            </div>

            {/* TAB 1: FORMAT & UKURAN KERTAS */}
            {activeFormTab === 'doc' && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Jenis Dokumen:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'invoice', label: 'Invoice', desc: 'Faktur Tagihan' },
                      { id: 'nota', label: 'Nota Toko', desc: 'Bukti Penjualan' },
                      { id: 'kwitansi', label: 'Kwitansi', desc: 'Tanda Terima' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => loadPreset(t.id as DocumentType)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          docType === t.id
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <p>{t.label}</p>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Ukuran Kertas Cetak / Ekspor:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'a4', label: 'A4', desc: 'Standar Kantor' },
                      { id: 'a5', label: 'A5', desc: 'Separuh A4' },
                      { id: 'thermal80', label: 'Thermal 80mm', desc: 'Struk POS' },
                      { id: 'thermal58', label: 'Thermal 58mm', desc: 'Struk EDC' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          const newPaper = p.id as PaperSize;
                          setPaperSize(newPaper);
                          resetElementPositions(newPaper);
                        }}
                        className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                          paperSize === p.id
                            ? 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <p>{p.label}</p>
                        <p className={`text-[10px] mt-0.5 ${paperSize === p.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {p.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {!paperSize.startsWith('thermal') && (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Orientasi Kertas:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOrientation('portrait');
                          resetElementPositions(paperSize, 'portrait');
                        }}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex items-center justify-center gap-2.5 ${
                          orientation === 'portrait'
                            ? 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-lg">📄</span>
                        <div className="text-left">
                          <p className="text-xs font-bold leading-tight">Portrait</p>
                          <p className={`text-[10px] ${orientation === 'portrait' ? 'text-indigo-100' : 'text-slate-400'}`}>
                            Tegak Vertikal
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOrientation('landscape');
                          resetElementPositions(paperSize, 'landscape');
                        }}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex items-center justify-center gap-2.5 ${
                          orientation === 'landscape'
                            ? 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-lg">📃</span>
                        <div className="text-left">
                          <p className="text-xs font-bold leading-tight">Landscape</p>
                          <p className={`text-[10px] ${orientation === 'landscape' ? 'text-indigo-100' : 'text-slate-400'}`}>
                            Melebar Horizontal
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Aksen Warna Dokumen:
                  </label>
                  <div className="flex items-center gap-3">
                    {[
                      { hex: '#4f46e5', label: 'Indigo' },
                      { hex: '#0f766e', label: 'Teal' },
                      { hex: '#1e3a8a', label: 'Navy' },
                      { hex: '#b91c1c', label: 'Crimson' },
                      { hex: '#334155', label: 'Slate' },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setThemeColor(c.hex)}
                        style={{ backgroundColor: c.hex }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                          themeColor === c.hex ? 'scale-125 border-white shadow-md ring-2 ring-indigo-500' : 'border-transparent'
                        }`}
                        title={c.label}
                      />
                    ))}
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                      title="Warna Kustom"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Nomor Dokumen:
                    </label>
                    <input
                      type="text"
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Tanggal Terbit:
                    </label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>

                {docType === 'invoice' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Tanggal Jatuh Tempo:
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        No. PO / Referensi:
                      </label>
                      <input
                        type="text"
                        value={poNumber}
                        onChange={(e) => setPoNumber(e.target.value)}
                        placeholder="Contoh: PO-9921"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PROFIL PERUSAHAAN & KLIEN */}
            {activeFormTab === 'business' && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                {/* Upload Logo & Posisi */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Logo Toko / Perusahaan</span>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="text-[11px] text-red-600 hover:underline cursor-pointer"
                      >
                        Hapus Logo
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-500 rounded-xl p-3 text-center flex-1 transition">
                      <Upload className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold block">
                        Pilih Gambar Logo (PNG / JPG)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {logoUrl && (
                      <div className="w-16 h-16 rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                  </div>

                  {logoUrl && (
                    <div className="space-y-2 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1 font-semibold">
                            Ukuran Logo ({logoPos.width}px):
                          </label>
                          <input
                            type="range"
                            min="30"
                            max="200"
                            value={logoPos.width}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setLogoSize(val);
                              setLogoPos((prev) => ({ ...prev, width: val }));
                            }}
                            className="w-full accent-indigo-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1 font-semibold">
                            Ratakan Header:
                          </label>
                          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                            {(['left', 'center', 'right'] as LogoPosition[]).map((pos) => (
                              <button
                                key={pos}
                                type="button"
                                onClick={() => {
                                  setLogoPosition(pos);
                                  const cW = paperSize === 'a5' ? 560 : paperSize === 'thermal80' ? 302 : paperSize === 'thermal58' ? 220 : 794;
                                  let nextX = 48;
                                  if (pos === 'center') nextX = Math.round((cW - logoPos.width) / 2);
                                  if (pos === 'right') nextX = cW - logoPos.width - 48;
                                  setLogoPos((prev) => ({ ...prev, x: nextX, y: 48 }));
                                  setSelectedElementId('logo');
                                }}
                                className={`flex-1 py-1 text-[10px] font-bold uppercase transition ${
                                  logoPosition === pos ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600'
                                }`}
                              >
                                {pos === 'left' ? 'Kiri' : pos === 'center' ? 'Tengah' : 'Kanan'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] bg-indigo-50/70 dark:bg-indigo-950/40 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                        <span className="text-indigo-800 dark:text-indigo-300 font-mono text-[10px]">
                          Koordinat: X={logoPos.x}px, Y={logoPos.y}px
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedElementId('logo');
                            setMobileTab('preview');
                          }}
                          className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Move className="w-3 h-3" />
                          <span>Seret di Canvas</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Penjual / Toko */}
                <div className="space-y-2.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block border-b pb-1">
                    Identitas Penjual / Perusahaan:
                  </span>
                  <div>
                    <label className="block text-slate-500 mb-1">Nama Toko / Perusahaan:</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Slogan / Bidang Usaha:</label>
                    <input
                      type="text"
                      value={companyTagline}
                      onChange={(e) => setCompanyTagline(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Alamat Lengkap:</label>
                    <textarea
                      rows={2}
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 mb-1">No. Telp / WhatsApp:</label>
                      <input
                        type="text"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Email Resmi:</label>
                      <input
                        type="text"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">NPWP / NIB (Opsional):</label>
                    <input
                      type="text"
                      value={companyTaxId}
                      onChange={(e) => setCompanyTaxId(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>

                {/* Info Klien / Pembeli */}
                {docType !== 'kwitansi' ? (
                  <div className="space-y-2.5 pt-2 border-t">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block border-b pb-1">
                      Ditagihkan Kepada (Klien / Pembeli):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-500 mb-1">Nama Pembeli:</label>
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">Perusahaan / Instansi:</label>
                        <input
                          type="text"
                          value={clientCompany}
                          onChange={(e) => setClientCompany(e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-500 mb-1">Alamat Klien:</label>
                        <input
                          type="text"
                          value={clientAddress}
                          onChange={(e) => setClientAddress(e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">No. Telp Klien:</label>
                        <input
                          type="text"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-2 border-t">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block border-b pb-1">
                      Rincian Kwitansi Tanda Terima:
                    </span>
                    <div>
                      <label className="block text-slate-500 mb-1">Telah Diterima Dari:</label>
                      <input
                        type="text"
                        value={receivedFrom}
                        onChange={(e) => setReceivedFrom(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Untuk Keperluan Pembayaran:</label>
                      <textarea
                        rows={2}
                        value={paymentFor}
                        onChange={(e) => setPaymentFor(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Tempat / Kota Penerimaan:</label>
                      <input
                        type="text"
                        value={receiptCity}
                        onChange={(e) => setReceiptCity(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ITEM BARANG & RINCIAN BIAYA */}
            {activeFormTab === 'items' && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                {/* Daftar Item */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Rincian Barang / Layanan:
                    </span>
                    <button
                      type="button"
                      onClick={addItem}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-lg font-bold flex items-center gap-1 hover:bg-indigo-100 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Item</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                          <input
                            type="text"
                            placeholder="Deskripsi barang atau nama layanan..."
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="flex-1 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                          />
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                              title="Hapus baris"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Qty / Jumlah:</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 1))}
                              className="w-full p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Harga Satuan (Rp):</label>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', Math.max(0, parseInt(e.target.value, 10) || 0))}
                              className="w-full p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-right"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Diskon Item (%):</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPercent}
                              onChange={(e) => updateItem(item.id, 'discountPercent', Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0)))}
                              className="w-full p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-right"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pajak, Ongkir, dan Pembayaran */}
                <div className="space-y-3 pt-3 border-t">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Pajak PPN (%):
                      </label>
                      <select
                        value={taxPercent}
                        onChange={(e) => setTaxPercent(parseInt(e.target.value, 10))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      >
                        <option value={0}>Bebas Pajak (0%)</option>
                        <option value={11}>PPN 11% (Standar)</option>
                        <option value={12}>PPN 12%</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Biaya Pengiriman / Ongkir:
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        value={shippingFee}
                        onChange={(e) => setShippingFee(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-right"
                      />
                    </div>
                  </div>

                  {/* Khusus Nota Toko: Uang Tunai & Kembalian */}
                  {docType === 'nota' && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                        Kasir Tunai / Pembayaran:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-emerald-700 dark:text-emerald-300 mb-0.5">
                            Uang Diterima (Rp):
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={cashGiven}
                            onChange={(e) => setCashGiven(Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className="w-full p-1.5 bg-white dark:bg-slate-900 border border-emerald-300 rounded-lg text-right font-bold text-emerald-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-emerald-700 dark:text-emerald-300 mb-0.5">
                            Kembalian:
                          </label>
                          <div className="p-1.5 bg-emerald-100/60 dark:bg-emerald-900/60 rounded-lg text-right font-black text-emerald-900 dark:text-emerald-100">
                            {formatRupiah(changeAmount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rekening Bank Transfer */}
                  {docType === 'invoice' && (
                    <div className="space-y-2 pt-2 border-t">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        Instruksi Rekening Pembayaran:
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Nama Bank:</label>
                          <input
                            type="text"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">No. Rekening:</label>
                          <input
                            type="text"
                            value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value)}
                            className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Atas Nama (A/N):</label>
                          <input
                            type="text"
                            value={bankAccountName}
                            onChange={(e) => setBankAccountName(e.target.value)}
                            className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Catatan Kaki / Syarat Pembayaran:
                    </label>
                    <textarea
                      rows={2}
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TANDA TANGAN & STEMPEL DIGITAL */}
            {activeFormTab === 'stamp' && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-xs">
                {/* 1. Tanda Tangan Digital */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <PenTool className="w-4 h-4 text-indigo-600" />
                      <span>Tanda Tangan Digital</span>
                    </span>
                    <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSignatureMode('draw')}
                        className={`px-2.5 py-1 font-bold ${signatureMode === 'draw' ? 'bg-indigo-600 text-white' : 'bg-slate-50'}`}
                      >
                        Gores Layar
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignatureMode('upload')}
                        className={`px-2.5 py-1 font-bold ${signatureMode === 'upload' ? 'bg-indigo-600 text-white' : 'bg-slate-50'}`}
                      >
                        Unggah PNG
                      </button>
                    </div>
                  </div>

                  {signatureMode === 'draw' ? (
                    <div>
                      <div className="border border-slate-300 dark:border-slate-700 rounded-xl bg-white relative overflow-hidden shadow-inner">
                        <canvas
                          ref={signatureCanvasRef}
                          width={360}
                          height={120}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full h-[120px] cursor-crosshair touch-none"
                        />
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="absolute top-2 right-2 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md border font-semibold cursor-pointer"
                        >
                          Bersihkan
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Gores tanda tangan langsung menggunakan kursor mouse atau sentuhan jari di layar HP.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="cursor-pointer bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-500 rounded-xl p-3 text-center block transition">
                        <Upload className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold block">
                          Pilih Foto Tanda Tangan (PNG Transparan)
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleSignatureUpload}
                          className="hidden"
                        />
                      </label>
                      {signatureDataUrl && (
                        <div className="mt-2 p-2 border rounded-lg bg-slate-50 flex items-center justify-between">
                          <span className="text-[11px] text-emerald-600 font-bold">✓ Tanda tangan terunggah</span>
                          <button
                            type="button"
                            onClick={() => setSignatureDataUrl('')}
                            className="text-[10px] text-red-600 underline"
                          >
                            Hapus
                          </button>
                        </div>
                      )}

                      {signatureDataUrl && (
                        <div className="mt-2 flex items-center justify-between text-[11px] bg-indigo-50/70 dark:bg-indigo-950/40 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                          <span className="text-indigo-800 dark:text-indigo-300 font-mono text-[10px]">
                            Posisi: X={signaturePos.x}px, Y={signaturePos.y}px
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedElementId('signature');
                              setMobileTab('preview');
                            }}
                            className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Move className="w-3 h-3" />
                            <span>Seret di Canvas</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 mb-0.5">Nama Penanda Tangan:</label>
                      <input
                        type="text"
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-0.5">Jabatan / Posisi:</label>
                      <input
                        type="text"
                        value={signerTitle}
                        onChange={(e) => setSignerTitle(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Cap Stempel Digital Resmi */}
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Stamp className="w-4 h-4 text-indigo-600" />
                      <span>Cap Stempel Digital Resmi</span>
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableStamp}
                        onChange={(e) => setEnableStamp(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>

                  {enableStamp && (
                    <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1 font-semibold">
                            Bentuk Stempel:
                          </label>
                          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setStampShape('circle')}
                              className={`flex-1 py-1.5 text-[11px] font-bold ${stampShape === 'circle' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800'}`}
                            >
                              Bulat Dinas
                            </button>
                            <button
                              type="button"
                              onClick={() => setStampShape('rectangle')}
                              className={`flex-1 py-1.5 text-[11px] font-bold ${stampShape === 'rectangle' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800'}`}
                            >
                              Kotak Toko
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1 font-semibold">
                            Warna Tinta Stempel:
                          </label>
                          <div className="flex items-center gap-2">
                            {(['blue', 'red', 'purple', 'green'] as StampColor[]).map((clr) => (
                              <button
                                key={clr}
                                type="button"
                                onClick={() => setStampColor(clr)}
                                style={{ backgroundColor: stampColorMap[clr].hex }}
                                className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                                  stampColor === clr ? 'scale-125 border-white shadow-md' : 'border-transparent'
                                }`}
                                title={clr}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Teks Atas Stempel (Nama Perusahaan/Toko):</label>
                          <input
                            type="text"
                            value={stampTopText}
                            onChange={(e) => setStampTopText(e.target.value.toUpperCase())}
                            className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs uppercase font-bold"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">Teks Status Tengah:</label>
                            <select
                              value={stampStatusText}
                              onChange={(e) => setStampStatusText(e.target.value)}
                              className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs font-bold"
                            >
                              <option value="LUNAS">LUNAS</option>
                              <option value="PAID">PAID</option>
                              <option value="DITERIMA">DITERIMA</option>
                              <option value="TERVERIFIKASI">TERVERIFIKASI</option>
                              <option value="DISETUJUI">DISETUJUI</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">Teks Bawah Stempel:</label>
                            <input
                              type="text"
                              value={stampBottomText}
                              onChange={(e) => setStampBottomText(e.target.value.toUpperCase())}
                              className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs uppercase"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5 font-semibold">
                            Kemiringan Cap Stempel ({stampRotation}°):
                          </label>
                          <input
                            type="range"
                            min="-25"
                            max="25"
                            value={stampRotation}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setStampRotation(val);
                              setStampPos((prev) => ({ ...prev, rotation: val }));
                            }}
                            className="w-full accent-indigo-600"
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] bg-indigo-50/70 dark:bg-indigo-950/40 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                          <span className="text-indigo-800 dark:text-indigo-300 font-mono text-[10px]">
                            Posisi: X={stampPos.x}px, Y={stampPos.y}px ({stampPos.width}px)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedElementId('stamp');
                              setMobileTab('preview');
                            }}
                            className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Move className="w-3 h-3" />
                            <span>Seret di Canvas</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* KOLOM KANAN: PRATINJAU DOKUMEN (LIVE PREVIEW) */}
          {/* ======================================================== */}
          <div className={`${isLandscape ? 'lg:col-span-8' : 'lg:col-span-7'} flex flex-col items-center w-full ${mobileTab === 'editor' ? 'hidden sm:flex' : 'flex'}`}>
            {/* Action Bar Atas */}
            <div className="w-full bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 mb-3 print:hidden">
              <div className="flex items-center flex-wrap gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Pratinjau {docType.toUpperCase()} ({paperSize.toUpperCase()})
                </span>

                {/* Quick Toggle Orientasi Kertas (Portrait vs Landscape) */}
                {!paperSize.startsWith('thermal') && (
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setOrientation('portrait');
                        resetElementPositions(paperSize, 'portrait');
                      }}
                      className={`px-2 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                        orientation === 'portrait'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                      title="Ubah pratinjau ke mode Tegak (Portrait)"
                    >
                      <span>📄</span>
                      <span className="hidden sm:inline">Portrait</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOrientation('landscape');
                        resetElementPositions(paperSize, 'landscape');
                      }}
                      className={`px-2 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                        orientation === 'landscape'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                      title="Ubah pratinjau ke mode Melebar (Landscape)"
                    >
                      <span>📃</span>
                      <span className="hidden sm:inline">Landscape</span>
                    </button>
                  </div>
                )}

                {/* Switch Mode Tata Letak */}
                <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl ml-1 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsFreeLayout(true)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer ${
                      isFreeLayout
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Move className="w-3 h-3" />
                    <span>Bebas Drag & Drop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFreeLayout(false);
                      setSelectedElementId(null);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer ${
                      !isFreeLayout
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Layout className="w-3 h-3" />
                    <span>Standar Otomatis</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isFreeLayout && (
                  <button
                    type="button"
                    onClick={() => resetElementPositions(paperSize)}
                    title="Reset posisi elemen ke koordinat awal"
                    className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Reset Posisi</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>

                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleDownloadPdf}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? 'Mengompilasi...' : 'Unduh PDF'}</span>
                </button>
              </div>
            </div>

            {/* Notifikasi Status Ekspor / Fallback Dialog Cetak */}
            {exportNotice && (
              <div
                className={`w-full mb-3 p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs shadow-xs animate-in fade-in duration-200 print:hidden ${
                  exportNotice.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                    : exportNotice.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
                    : 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {exportNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : exportNotice.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  )}
                  <p className="leading-relaxed font-medium">{exportNotice.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setExportNotice(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer shrink-0"
                  title="Tutup Pesan"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Hint Interaktif Banner */}
            {isFreeLayout && (
              <div className="w-full mb-3 px-3.5 py-2 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 print:hidden shadow-2xs">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-[11px] leading-tight">
                    <strong>Mode Bebas Aktif:</strong> Klik & seret <strong>Logo</strong>, <strong>Tanda Tangan</strong>, atau <strong>Cap Stempel</strong> ke posisi manapun. Tarik sudut lingkaran biru untuk mengubah ukuran secara visual.
                  </span>
                </div>
                {selectedElementId && (
                  <button
                    type="button"
                    onClick={() => setSelectedElementId(null)}
                    className="text-[10px] bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0 ml-2"
                  >
                    Selesai Atur
                  </button>
                )}
              </div>
            )}

            {/* Dynamic Print CSS for Orientation & Clean Layout */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  @media print {
                    @page {
                      size: ${paperSize.startsWith('thermal') ? 'auto' : `${paperSize} ${orientation}`};
                      margin: 0;
                    }
                    body, main {
                      background: #ffffff !important;
                      padding: 0 !important;
                      margin: 0 !important;
                    }
                    .print\\:hidden, nav, footer {
                      display: none !important;
                    }
                    #invoice-preview-sheet {
                      box-shadow: none !important;
                      border: none !important;
                      margin: 0 auto !important;
                      page-break-inside: avoid;
                    }
                  }
                `,
              }}
            />

            {/* Container Lembar Kertas Preview */}
            <div className={`w-full max-w-full overflow-x-auto p-4 sm:p-8 bg-slate-200/70 dark:bg-slate-950 rounded-2xl border border-slate-300 dark:border-slate-800 flex ${
              isLandscape ? 'justify-start sm:justify-center' : 'justify-center'
            } shadow-inner transition-all duration-300`}>
              <div
                id="invoice-preview-sheet"
                ref={previewRef}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('[data-drag-ignore="true"]')) return;
                  setSelectedElementId(null);
                }}
                style={{
                  width: previewDimensions.width,
                  minHeight: previewDimensions.minHeight,
                  aspectRatio: previewDimensions.aspectRatio,
                }}
                className={`bg-white text-slate-900 shadow-2xl transition-all duration-300 box-border relative shrink-0 ${
                  paperSize.startsWith('thermal')
                    ? 'p-4 font-mono text-[11px]'
                    : isLandscape
                    ? 'p-6 sm:p-10 font-sans text-xs'
                    : 'p-8 sm:p-12 font-sans text-xs'
                }`}
              >
                {/* -------------------------------------------------- */}
                {/* 1. TAMPILAN FORMAT STRUK THERMAL (58mm / 80mm) */}
                {/* -------------------------------------------------- */}
                {paperSize.startsWith('thermal') ? (
                  <div className="space-y-3 leading-tight">
                    {/* Header Toko */}
                    <div className="text-center space-y-1">
                      {!isFreeLayout && logoUrl && (
                        <div className="flex justify-center mb-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={logoUrl} alt="Logo" style={{ height: `${Math.min(logoSize, 50)}px` }} className="object-contain" />
                        </div>
                      )}
                      <h2 className="font-black text-sm uppercase tracking-wide">{companyName}</h2>
                      <p className="text-[10px] text-slate-600">{companyAddress}</p>
                      <p className="text-[10px] text-slate-600">Telp: {companyPhone}</p>
                    </div>

                    <div className="border-t border-dashed border-slate-400 my-2" />

                    {/* Metadata Nota */}
                    <div className="text-[10px] space-y-0.5 text-slate-700">
                      <div className="flex justify-between">
                        <span>No. Transaksi</span>
                        <span className="font-bold">{docNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tanggal</span>
                        <span>{issueDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kasir</span>
                        <span>{signerName.split(',')[0]}</span>
                      </div>
                      {clientName && (
                        <div className="flex justify-between">
                          <span>Pelanggan</span>
                          <span>{clientName}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-dashed border-slate-400 my-2" />

                    {/* Items */}
                    <div className="space-y-1.5">
                      {items.map((it) => (
                        <div key={it.id}>
                          <p className="font-bold">{it.description || 'Item Barang'}</p>
                          <div className="flex justify-between text-slate-600">
                            <span>
                              {it.quantity} x {formatRupiah(it.unitPrice)}
                              {it.discountPercent > 0 && ` (Disc ${it.discountPercent}%)`}
                            </span>
                            <span className="font-bold text-slate-900">
                              {formatRupiah((it.quantity * it.unitPrice * (100 - it.discountPercent)) / 100)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-slate-400 my-2" />

                    {/* Rincian Total */}
                    <div className="space-y-1 text-right text-[10px]">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatRupiah(subtotal)}</span>
                      </div>
                      {taxPercent > 0 && (
                        <div className="flex justify-between">
                          <span>PPN ({taxPercent}%):</span>
                          <span>{formatRupiah(taxAmount)}</span>
                        </div>
                      )}
                      {shippingFee > 0 && (
                        <div className="flex justify-between">
                          <span>Ongkos Kirim:</span>
                          <span>{formatRupiah(shippingFee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-400">
                        <span>TOTAL:</span>
                        <span>{formatRupiah(grandTotal)}</span>
                      </div>
                      {docType === 'nota' && (
                        <>
                          <div className="flex justify-between text-slate-600">
                            <span>TUNAI:</span>
                            <span>{formatRupiah(cashGiven)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>KEMBALI:</span>
                            <span>{formatRupiah(changeAmount)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="border-t border-dashed border-slate-400 my-2" />

                    {/* Stempel Mini di Struk Thermal */}
                    {enableStamp && (
                      <div className="flex justify-center my-2">
                        <div
                          style={{
                            color: stampColorMap[stampColor].hex,
                            borderColor: stampColorMap[stampColor].hex,
                            transform: `rotate(${stampRotation}deg)`,
                          }}
                          className="border-2 border-dashed px-3 py-1 text-center font-black text-xs tracking-widest uppercase rounded"
                        >
                          *** {stampStatusText} ***
                        </div>
                      </div>
                    )}

                    {/* Pesan Kaki Thermal */}
                    <div className="text-center text-[9px] text-slate-500 pt-1 space-y-0.5">
                      <p className="font-bold">*** TERIMA KASIH ***</p>
                      <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
                      <p>www.kompreskilat.site</p>
                    </div>
                  </div>
                ) : docType === 'kwitansi' ? (
                  /* -------------------------------------------------- */
                  /* 2. TAMPILAN KWITANSI RESMI (A4 / A5) */
                  /* -------------------------------------------------- */
                  <div className="space-y-6">
                    {/* Header Kwitansi */}
                    <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
                      <div className={`flex items-center gap-3 ${logoPosition === 'right' ? 'order-2' : ''}`}>
                        {!isFreeLayout && logoUrl && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={logoUrl} alt="Logo" style={{ width: `${logoSize}px` }} className="object-contain" />
                        )}
                        <div>
                          <h2 className="font-extrabold text-base tracking-tight">{companyName}</h2>
                          <p className="text-[11px] text-slate-600">{companyAddress}</p>
                          <p className="text-[11px] text-slate-600">Telp: {companyPhone} • {companyEmail}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <h1
                          style={{ color: themeColor }}
                          className="text-2xl font-black tracking-wider uppercase"
                        >
                          KWITANSI
                        </h1>
                        <p className="text-xs font-bold text-slate-600 mt-0.5">No: {docNumber}</p>
                      </div>
                    </div>

                    {/* Formulir Isi Kwitansi */}
                    <div className="space-y-3.5 text-xs">
                      <div className="flex items-baseline">
                        <span className="w-44 font-bold text-slate-700">Telah Diterima Dari</span>
                        <span className="mr-2">:</span>
                        <div className="flex-1 font-bold text-sm border-b border-dotted border-slate-400 pb-1">
                          {receivedFrom || 'Bpk / Ibu Pelanggan'}
                        </div>
                      </div>

                      <div className="flex items-baseline">
                        <span className="w-44 font-bold text-slate-700">Uang Sejumlah</span>
                        <span className="mr-2">:</span>
                        <div className="flex-1 font-semibold italic text-slate-800 bg-slate-100 p-2 rounded-lg border border-slate-200">
                          &quot;{terbilangText}&quot;
                        </div>
                      </div>

                      <div className="flex items-baseline">
                        <span className="w-44 font-bold text-slate-700">Untuk Pembayaran</span>
                        <span className="mr-2">:</span>
                        <div className="flex-1 text-slate-800 border-b border-dotted border-slate-400 pb-1 leading-relaxed">
                          {paymentFor || 'Pembayaran Transaksi Dokumen'}
                        </div>
                      </div>
                    </div>

                    {/* Kotak Nominal Jumlah & Tanda Tangan */}
                    <div className="pt-6 flex items-end justify-between">
                      {/* Box Jumlah Rupiah Tebal */}
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Terbilang Nominal:
                        </span>
                        <div
                          style={{ borderColor: themeColor }}
                          className="border-2 rounded-xl py-3 px-5 bg-slate-50 font-black text-xl tracking-tight text-slate-900 inline-block shadow-xs"
                        >
                          {formatRupiah(grandTotal)},-
                        </div>
                      </div>

                      {/* Area Tanda Tangan & Cap Stempel */}
                      <div className="text-center w-60 relative">
                        <p className="text-slate-600 mb-1">
                          {receiptCity}, {issueDate}
                        </p>
                        <p className="font-semibold text-slate-700 text-[11px] mb-2">Yang Menerima,</p>

                        {/* Stempel Menimpa Tanda Tangan */}
                        <div className="relative h-20 flex items-center justify-center">
                          {!isFreeLayout ? (
                            <>
                              {signatureDataUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={signatureDataUrl} alt="Tanda Tangan" className="max-h-20 max-w-full object-contain relative z-10" />
                              ) : (
                                <div className="h-16 w-36 border-b border-dashed border-slate-300" />
                              )}

                              {enableStamp && (
                                <div
                                  style={{
                                    color: stampColorMap[stampColor].hex,
                                    transform: `rotate(${stampRotation}deg)`,
                                  }}
                                  className="absolute z-20 pointer-events-none opacity-85 select-none"
                                >
                                  {renderStampSvg(110, stampShape === 'circle' ? 110 : 60)}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="h-16 w-36 border-b border-dashed border-slate-300 mx-auto" />
                          )}
                        </div>

                        <p className="font-bold text-xs underline text-slate-900 mt-2">{signerName}</p>
                        <p className="text-[11px] text-slate-500">{signerTitle}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* -------------------------------------------------- */
                  /* 3. TAMPILAN INVOICE & NOTA TOKO (A4 / A5) */
                  /* -------------------------------------------------- */
                  <div className="space-y-6">
                    {/* Header Dokumen */}
                    <div className={`flex flex-col sm:flex-row justify-between gap-4 border-b pb-6 ${
                      logoPosition === 'center' ? 'items-center text-center' : 'items-start'
                    }`}>
                      <div className={`space-y-1.5 ${logoPosition === 'right' ? 'order-2 text-right' : ''}`}>
                        {!isFreeLayout && logoUrl && (
                          <div className={`flex mb-2 ${
                            logoPosition === 'center' ? 'justify-center' : logoPosition === 'right' ? 'justify-end' : 'justify-start'
                          }`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={logoUrl} alt="Logo" style={{ width: `${logoSize}px` }} className="object-contain" />
                          </div>
                        )}
                        <h2 className="font-black text-lg tracking-tight text-slate-900">{companyName}</h2>
                        {companyTagline && <p className="text-[11px] font-semibold text-slate-500">{companyTagline}</p>}
                        <p className="text-[11px] text-slate-600 max-w-sm leading-relaxed">{companyAddress}</p>
                        <p className="text-[11px] text-slate-600">Telp: {companyPhone} • Email: {companyEmail}</p>
                        {companyTaxId && <p className="text-[10px] text-slate-400">NPWP: {companyTaxId}</p>}
                      </div>

                      <div className="text-right">
                        <h1
                          style={{ color: themeColor }}
                          className="text-2xl sm:text-3xl font-black tracking-wider uppercase"
                        >
                          {docType === 'nota' ? 'NOTA PENJUALAN' : 'INVOICE'}
                        </h1>
                        <p className="font-bold text-xs text-slate-700 mt-1">No: {docNumber}</p>
                        <div className="mt-3 text-[11px] space-y-0.5 text-slate-600">
                          <p><strong>Tanggal Terbit:</strong> {issueDate}</p>
                          {docType === 'invoice' && dueDate && <p><strong>Jatuh Tempo:</strong> {dueDate}</p>}
                          {poNumber && <p><strong>No. PO:</strong> {poNumber}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Metadata Klien / Ditagihkan Kepada */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Ditagihkan Kepada (Klien):
                        </span>
                        <p className="font-bold text-slate-900 text-sm">{clientName || 'Pelanggan Terhormat'}</p>
                        {clientCompany && <p className="font-semibold text-slate-700">{clientCompany}</p>}
                        {clientAddress && <p className="text-slate-600 text-[11px] mt-0.5">{clientAddress}</p>}
                        {clientPhone && <p className="text-slate-500 text-[11px]">Telp: {clientPhone}</p>}
                      </div>

                      {docType === 'invoice' && bankAccount && (
                        <div className="text-right border-l pl-4 border-slate-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                            Metode Transfer:
                          </span>
                          <p className="font-bold text-slate-800">{bankName}</p>
                          <p className="font-black text-sm text-indigo-700 tracking-wider">{bankAccount}</p>
                          <p className="text-[10px] text-slate-500">A/N: {bankAccountName}</p>
                        </div>
                      )}
                    </div>

                    {/* Tabel Barang / Jasa */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr
                            style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                            className="border-b-2 border-slate-300 font-extrabold"
                          >
                            <th className="py-2.5 px-3 w-10">No.</th>
                            <th className="py-2.5 px-3">Deskripsi Barang / Layanan</th>
                            <th className="py-2.5 px-3 text-center w-16">Qty</th>
                            <th className="py-2.5 px-3 text-right w-28">Harga Satuan</th>
                            <th className="py-2.5 px-3 text-right w-20">Diskon</th>
                            <th className="py-2.5 px-3 text-right w-32">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {items.map((it, idx) => {
                            const rawTotal = it.quantity * it.unitPrice;
                            const itemTotal = (rawTotal * (100 - it.discountPercent)) / 100;
                            return (
                              <tr key={it.id} className="hover:bg-slate-50/50">
                                <td className="py-2.5 px-3 text-slate-400 font-medium">{idx + 1}</td>
                                <td className="py-2.5 px-3 font-semibold text-slate-800">
                                  {it.description || 'Deskripsi item'}
                                </td>
                                <td className="py-2.5 px-3 text-center">{it.quantity}</td>
                                <td className="py-2.5 px-3 text-right">{formatRupiah(it.unitPrice)}</td>
                                <td className="py-2.5 px-3 text-right text-slate-500">
                                  {it.discountPercent > 0 ? `${it.discountPercent}%` : '-'}
                                </td>
                                <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                  {formatRupiah(itemTotal)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Ringkasan Subtotal, PPN, dan Terbilang */}
                    <div className="pt-2 flex flex-col sm:flex-row justify-between gap-6 items-start">
                      {/* Terbilang & Catatan */}
                      <div className="flex-1 space-y-2">
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                            Jumlah Terbilang:
                          </span>
                          <p className="italic font-bold text-slate-800 text-[11px]">
                            &quot;{terbilangText}&quot;
                          </p>
                        </div>
                        {paymentTerms && (
                          <div className="text-[11px] text-slate-500 leading-relaxed">
                            <strong>Ketentuan:</strong> {paymentTerms}
                          </div>
                        )}
                      </div>

                      {/* Kalkulasi Angka */}
                      <div className="w-full sm:w-64 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal:</span>
                          <span className="font-semibold">{formatRupiah(subtotal)}</span>
                        </div>
                        {taxPercent > 0 && (
                          <div className="flex justify-between text-slate-600">
                            <span>PPN ({taxPercent}%):</span>
                            <span>{formatRupiah(taxAmount)}</span>
                          </div>
                        )}
                        {shippingFee > 0 && (
                          <div className="flex justify-between text-slate-600">
                            <span>Biaya Pengiriman:</span>
                            <span>{formatRupiah(shippingFee)}</span>
                          </div>
                        )}
                        <div
                          style={{ borderColor: themeColor }}
                          className="flex justify-between items-center pt-2 border-t-2 font-black text-sm text-slate-900"
                        >
                          <span>GRAND TOTAL:</span>
                          <span style={{ color: themeColor }} className="text-base font-extrabold">
                            {formatRupiah(grandTotal)}
                          </span>
                        </div>
                        {docType === 'nota' && (
                          <div className="pt-2 border-t space-y-1 text-slate-600">
                            <div className="flex justify-between">
                              <span>Bayar Tunai:</span>
                              <span className="font-semibold">{formatRupiah(cashGiven)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-emerald-700">
                              <span>Kembalian:</span>
                              <span>{formatRupiah(changeAmount)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Area Tanda Tangan & Cap Stempel Digital */}
                    <div className="pt-6 border-t flex justify-end">
                      <div className="text-center w-60 relative">
                        <p className="text-slate-600 text-[11px] mb-1">
                          {receiptCity || 'Jakarta'}, {issueDate}
                        </p>
                        <p className="font-bold text-slate-800 text-xs mb-2">Hormat Kami,</p>

                        <div className="relative h-24 flex items-center justify-center">
                          {!isFreeLayout ? (
                            <>
                              {signatureDataUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={signatureDataUrl} alt="Tanda Tangan" className="max-h-20 max-w-full object-contain relative z-10" />
                              ) : (
                                <div className="h-16 w-36 border-b border-dashed border-slate-300" />
                              )}

                              {enableStamp && (
                                <div
                                  style={{
                                    color: stampColorMap[stampColor].hex,
                                    transform: `rotate(${stampRotation}deg)`,
                                  }}
                                  className="absolute z-20 pointer-events-none opacity-85 select-none"
                                >
                                  {renderStampSvg(115, stampShape === 'circle' ? 115 : 65)}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="h-16 w-36 border-b border-dashed border-slate-300 mx-auto" />
                          )}
                        </div>

                        <p className="font-bold text-xs underline text-slate-900 mt-2">{signerName}</p>
                        <p className="text-[11px] text-slate-500">{signerTitle}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* ELEMEN INTERAKTIF DRAG & DROP (Logo, Tanda Tangan, Stempel) */}
                {/* ======================================================== */}
                {isFreeLayout && (
                  <>
                    {/* 1. Logo Perusahaan / Toko */}
                    {logoUrl && (
                      <DraggableCanvasElement
                        id="logo"
                        title="Logo Perusahaan"
                        position={logoPos}
                        minWidth={30}
                        maxWidth={350}
                        isSelected={selectedElementId === 'logo'}
                        containerRef={previewRef}
                        onSelect={(id) => setSelectedElementId(id)}
                        onChange={(newPos) => {
                          setLogoPos(newPos);
                          setLogoSize(newPos.width);
                        }}
                        onDelete={() => setLogoUrl('')}
                        zIndex={25}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoUrl}
                          alt="Logo Perusahaan"
                          className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-xs"
                          draggable={false}
                        />
                      </DraggableCanvasElement>
                    )}

                    {/* 2. Tanda Tangan Digital */}
                    {signatureDataUrl && (
                      <DraggableCanvasElement
                        id="signature"
                        title="Tanda Tangan"
                        position={signaturePos}
                        minWidth={60}
                        maxWidth={360}
                        isSelected={selectedElementId === 'signature'}
                        containerRef={previewRef}
                        onSelect={(id) => setSelectedElementId(id)}
                        onChange={(newPos) => setSignaturePos(newPos)}
                        onDelete={() => {
                          setSignatureDataUrl('');
                          clearCanvas();
                        }}
                        zIndex={28}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={signatureDataUrl}
                          alt="Tanda Tangan Digital"
                          className="w-full h-auto max-h-32 object-contain select-none pointer-events-none"
                          draggable={false}
                        />
                      </DraggableCanvasElement>
                    )}

                    {/* 3. Cap Stempel Digital */}
                    {enableStamp && (
                      <DraggableCanvasElement
                        id="stamp"
                        title="Cap Stempel"
                        position={{ ...stampPos, rotation: stampRotation }}
                        minWidth={60}
                        maxWidth={240}
                        aspectRatio={stampShape === 'circle' ? 1 : 170 / 90}
                        isSelected={selectedElementId === 'stamp'}
                        containerRef={previewRef}
                        onSelect={(id) => setSelectedElementId(id)}
                        onChange={(newPos) => {
                          setStampPos(newPos);
                          if (newPos.rotation !== undefined) setStampRotation(newPos.rotation);
                        }}
                        onRotate={(rot) => {
                          setStampRotation(rot);
                          setStampPos((prev) => ({ ...prev, rotation: rot }));
                        }}
                        onDelete={() => setEnableStamp(false)}
                        zIndex={35}
                      >
                        <div style={{ color: stampColorMap[stampColor].hex }} className="opacity-90 select-none pointer-events-none">
                          {renderStampSvg(stampPos.width, stampShape === 'circle' ? stampPos.width : (stampPos.width * 90) / 170)}
                        </div>
                      </DraggableCanvasElement>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AdSense Slot Tengah */}
        <div className="my-10 print:hidden">
          <AdBanner slotId="8472910385" />
        </div>

        {/* ======================================================== */}
        {/* KONTEN EDUKASI, SEO GUIDE & FAQ RESMI */}
        {/* ======================================================== */}
        <section className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed print:hidden">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
              Perbedaan Invoice, Nota Toko, dan Kwitansi Pembayaran
            </h2>
            <p>
              Dalam tata kelola keuangan bisnis dan administrasi perpajakan di Indonesia, ketiga dokumen ini memiliki fungsi hukum dan momen penggunaan yang berbeda:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
              <span className="text-2xl block">📄</span>
              <h3 className="font-bold text-slate-900 dark:text-white">1. Invoice (Faktur Penagihan)</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Dokumen resmi penagihan yang diterbitkan oleh penjual kepada pembeli <b>sebelum</b> pembayaran lunas dilakukan. Memuat batas jatuh tempo (due date), rincian pajak PPN, dan instruksi rekening bank.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
              <span className="text-2xl block">🧾</span>
              <h3 className="font-bold text-slate-900 dark:text-white">2. Nota Penjualan Toko</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Bukti transaksi jual-beli tunai atau retail langsung di tempat. Digunakan oleh toko offline, apotek, kafe, dan UMKM untuk mencatat uang yang diterima dan kembalian pelanggan.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
              <span className="text-2xl block">✅</span>
              <h3 className="font-bold text-slate-900 dark:text-white">3. Kwitansi Resmi</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Tanda bukti bahwa sejumlah uang tunai atau transfer telah sah <b>diterima oleh pihak penjual</b>. Wajib memuat nominal terbilang huruf dan cap stempel tanda tangan basah penerima.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-2">
              Fitur Unggulan Pembuat Dokumen di KompresKilat:
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><strong>100% Client-Side Privacy:</strong> Seluruh data keuangan, rincian transaksi, dan gambar tanda tangan Anda tidak diunggah ke database server kami.</li>
              <li><strong>Cap Stempel Digital Asli:</strong> Dilengkapi generator cap stempel bulat dinas dan stempel kotak toko dengan opsi teks kustom, pilihan warna tinta autentik, serta sudut kemiringan realistis.</li>
              <li><strong>Tanda Tangan Interaktif:</strong> Goreskan tanda tangan langsung di layar sentuh ponsel atau unggah file PNG transparan beresolusi tinggi.</li>
              <li><strong>Dukungan Cetak Thermal:</strong> Sedia format struk kasir 80mm dan 58mm untuk printer thermal bluetooth kasir toko Anda.</li>
            </ul>
          </div>

          {/* FAQ Interaktif */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-3">
              Pertanyaan yang Sering Diajukan (FAQ):
            </h3>

            {[
              {
                q: 'Apakah layanan pembuatan invoice dan nota ini gratis?',
                a: 'Ya, Anda dapat membuat, mencetak, dan mengunduh berkas invoice, nota, serta kwitansi tanpa batasan jumlah secara gratis tanpa perlu registrasi akun.',
              },
              {
                q: 'Bagaimana cara mencetak langsung ke printer kasir thermal?',
                a: 'Pilih ukuran kertas "Thermal 80mm" atau "Thermal 58mm" pada tab Format, kemudian klik tombol "Cetak". Pilih printer kasir Bluetooth atau USB Anda pada dialog cetak peramban.',
              },
              {
                q: 'Apakah dokumen yang diunduh ke PDF bisa langsung dikirim via WhatsApp?',
                a: 'Bisa. Berkas PDF yang dihasilkan memiliki resolusi cetak tinggi yang kompatibel dengan seluruh aplikasi pembaca PDF di Android, iOS, Windows, dan macOS.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-3.5 text-left font-bold text-slate-800 dark:text-slate-200 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === idx ? 'rotate-180 text-indigo-600' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-3.5 pt-0 text-slate-600 dark:text-slate-400 text-xs border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </section>

      <div className="print:hidden">
        <Footer />
      </div>
    </main>
  );
}

