'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolEditorialSection from '@/components/ToolEditorialSection';
import JsonLd from '@/components/JsonLd';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import {
  FileCode2,
  QrCode,
  Image as ImageIcon,
  Download,
  RefreshCw,
  Trash2,
  FileArchive,
  Palette,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  Camera,
  ShieldCheck,
  Archive,
  ArrowRight
} from 'lucide-react';

interface ConvertedFileItem {
  id: string;
  originalFile: File;
  name: string;
  size: number;
  status: 'idle' | 'converting' | 'done' | 'error';
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
  errorMessage?: string;
}

export default function FileUtilityPage() {
  const [activeTab, setActiveTab] = useState<'converter' | 'qrcode' | 'all-tools'>('converter');

  // ==========================================
  // STATE: KONVERTER HEIC/WEBP MASSAL
  // ==========================================
  const [files, setFiles] = useState<ConvertedFileItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [quality, setQuality] = useState<number>(0.92);
  const [isConvertingAll, setIsConvertingAll] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // STATE: QR CODE GENERATOR KUSTOM HD
  // ==========================================
  const [qrType, setQrType] = useState<'url' | 'whatsapp' | 'text' | 'wifi'>('url');
  const [qrContent, setQrContent] = useState('https://kompreskilat.site');
  const [fgColor, setFgColor] = useState('#1e1b4b');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrResolution, setQrResolution] = useState<number>(1000);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const qrMargin = 2;
  const [copiedQr, setCopiedQr] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // WiFi helper inputs
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiType, setWifiType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  // WhatsApp helper inputs
  const [waPhone, setWaPhone] = useState('6281234567890');
  const [waMessage, setWaMessage] = useState('Halo admin KompresKilat!');

  // Komputasi konten QR secara murni (pure) tanpa cascading render effect
  const effectiveQrContent = useMemo(() => {
    if (qrType === 'wifi') {
      return `WIFI:T:${wifiType};S:${wifiSsid};P:${wifiPass};;`;
    }
    if (qrType === 'whatsapp') {
      const cleanPhone = waPhone.replace(/[^0-9]/g, '');
      const encodedMsg = encodeURIComponent(waMessage);
      return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
    }
    return qrContent;
  }, [qrType, qrContent, wifiType, wifiSsid, wifiPass, waPhone, waMessage]);

  // Render QR Code to Canvas with High DPI
  const renderQrCode = useCallback(async () => {
    if (!qrCanvasRef.current || !effectiveQrContent.trim()) return;
    try {
      await QRCode.toCanvas(qrCanvasRef.current, effectiveQrContent, {
        width: 320,
        margin: qrMargin,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorLevel,
      });
    } catch (err) {
      console.error('Gagal merender QR Code canvas:', err);
    }
  }, [effectiveQrContent, fgColor, bgColor, qrMargin, errorLevel]);

  useEffect(() => {
    renderQrCode();
  }, [renderQrCode]);

  // Download High-Resolution QR Code (Canvas offscreen scale)
  const downloadQrCodeHD = async () => {
    try {
      // Buat canvas off-screen dengan resolusi HD sesuai qrResolution (300 - 2400px)
      const offCanvas = document.createElement('canvas');
      await QRCode.toCanvas(offCanvas, effectiveQrContent, {
        width: qrResolution,
        margin: qrMargin,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorLevel,
      });

      const dataUrl = offCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `QRCode_KompresKilat_${qrResolution}px.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Gagal mengunduh QR Code:', err);
    }
  };

  // Copy QR Image to Clipboard
  const copyQrToClipboard = async () => {
    try {
      const offCanvas = document.createElement('canvas');
      await QRCode.toCanvas(offCanvas, effectiveQrContent, {
        width: 800,
        margin: qrMargin,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      });
      offCanvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopiedQr(true);
        setTimeout(() => setCopiedQr(false), 2500);
      });
    } catch (err) {
      console.error('Gagal menyalin gambar QR:', err);
    }
  };

  // ==========================================
  // LOGIKA KONVERTER HEIC / WEBP
  // ==========================================
  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selected = Array.from(e.target.files);

    const newItems: ConvertedFileItem[] = selected.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      originalFile: file,
      name: file.name,
      size: file.size,
      status: 'idle',
    }));

    setFiles((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.convertedUrl) URL.revokeObjectURL(target.convertedUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const clearAllFiles = () => {
    files.forEach((f) => {
      if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
    });
    setFiles([]);
  };

  // Konversi single file menggunakan heic2any atau HTML5 Canvas
  const convertSingleFile = async (item: ConvertedFileItem): Promise<ConvertedFileItem> => {
    const isHeic =
      item.name.toLowerCase().endsWith('.heic') ||
      item.name.toLowerCase().endsWith('.heif') ||
      item.originalFile.type.includes('heic') ||
      item.originalFile.type.includes('heif');

    const mimeType = targetFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = targetFormat === 'jpeg' ? 'jpg' : 'png';
    const baseName = item.name.replace(/\.[^/.]+$/, '');

    try {
      let outputBlob: Blob;

      if (isHeic) {
        // Dynamic import heic2any di client
        const heic2any = (await import('heic2any')).default;
        const res = await heic2any({
          blob: item.originalFile,
          toType: mimeType,
          quality: quality,
        });

        outputBlob = Array.isArray(res) ? res[0] : res;
      } else {
        // Konversi WebP/PNG/JPG melalui Browser Canvas
        outputBlob = await new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          const objUrl = URL.createObjectURL(item.originalFile);
          img.onload = () => {
            URL.revokeObjectURL(objUrl);
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Gagal menginisialisasi canvas'));
              return;
            }
            // Fill background putih jika konversi ke JPEG dari format transparan
            if (targetFormat === 'jpeg') {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Gagal menghasilkan blob gambar'));
              },
              mimeType,
              quality
            );
          };
          img.onerror = () => {
            URL.revokeObjectURL(objUrl);
            reject(new Error('Format berkas tidak terbaca oleh browser'));
          };
          img.src = objUrl;
        });
      }

      const convertedUrl = URL.createObjectURL(outputBlob);
      return {
        ...item,
        name: `${baseName}.${ext}`,
        status: 'done',
        convertedBlob: outputBlob,
        convertedUrl,
        convertedSize: outputBlob.size,
      };
    } catch (err: unknown) {
      return {
        ...item,
        status: 'error',
        errorMessage: err instanceof Error ? err.message : 'Gagal mengonversi berkas',
      };
    }
  };

  const handleConvertAll = async () => {
    if (files.length === 0 || isConvertingAll) return;
    setIsConvertingAll(true);

    const updatedList = [...files];
    for (let i = 0; i < updatedList.length; i++) {
      if (updatedList[i].status === 'done') continue;

      updatedList[i] = { ...updatedList[i], status: 'converting' };
      setFiles([...updatedList]);

      const result = await convertSingleFile(updatedList[i]);
      updatedList[i] = result;
      setFiles([...updatedList]);
    }

    setIsConvertingAll(false);
  };

  // Unduh Semua File sebagai ZIP
  const handleDownloadAllZip = async () => {
    const doneFiles = files.filter((f) => f.status === 'done' && f.convertedBlob);
    if (doneFiles.length === 0 || isZipping) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      doneFiles.forEach((f) => {
        if (f.convertedBlob) {
          zip.file(f.name, f.convertedBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KompresKilat_Converted_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal membuat berkas ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Utilitas File & Konverter Multi-Fungsi - KompresKilat',
    description: 'Konverter massal HEIC iPhone & WebP ke JPG/PNG di browser dan Generator QR Code resolusi tinggi kustom.',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={schema} />
      <Navbar />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header Hero */}
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-xs px-3.5 py-1 rounded-full font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Utilitas File All-in-One KompresKilat
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            Utilitas File &amp; Konverter Multi-Fungsi
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Konversi foto HEIC Apple &amp; WebP ke format JPG/PNG secara massal langsung di peramban tanpa kirim ke server, serta hasilkan Kode QR beresolusi tinggi siap cetak.
          </p>
        </div>

        {/* Tab Navigasi Utilitas */}
        <div className="flex items-center justify-center gap-2 mb-8 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('converter')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'converter'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Konverter HEIC &amp; WebP Massal
          </button>

          <button
            onClick={() => setActiveTab('qrcode')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'qrcode'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            QR Code Generator HD
          </button>

          <button
            onClick={() => setActiveTab('all-tools')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'all-tools'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Utilitas Cepat Lainnya
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: KONVERTER HEIC & WEBP MASSAL                       */}
        {/* ======================================================== */}
        {activeTab === 'converter' && (
          <div className="space-y-6">
            {/* Panel Pengaturan & Toolbar Konversi */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-indigo-600" />
                  Konverter Format Gambar di Sisi Klien
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mendukung foto iPhone (.HEIC, .HEIF), .WebP, .PNG, dan .JPG tanpa batasan kuota.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                {/* Format Target */}
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-600 pl-1.5">Ubah ke:</span>
                  <button
                    onClick={() => setTargetFormat('jpeg')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      targetFormat === 'jpeg' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-indigo-600'
                    }`}
                  >
                    JPG / JPEG
                  </button>
                  <button
                    onClick={() => setTargetFormat('png')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      targetFormat === 'png' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-indigo-600'
                    }`}
                  >
                    PNG
                  </button>
                </div>

                {/* Slider Kualitas (Khusus JPG) */}
                {targetFormat === 'jpeg' && (
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-600">Kualitas:</span>
                    <input
                      type="range"
                      min="0.5"
                      max="1.0"
                      step="0.05"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-20 accent-indigo-600 cursor-pointer"
                    />
                    <span className="font-bold text-indigo-600">{Math.round(quality * 100)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Area Drag & Drop Unggah */}
            <div className="bg-white p-6 sm:p-10 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 transition text-center shadow-xs">
              <input
                ref={fileInputRef}
                type="file"
                id="converterFileInput"
                multiple
                accept=".heic,.heif,.webp,.png,.jpg,.jpeg,image/heic,image/heif,image/webp,image/png,image/jpeg"
                onChange={handleSelectFiles}
                className="hidden"
              />
              <label htmlFor="converterFileInput" className="cursor-pointer block">
                <div className="w-14 h-14 mx-auto mb-3 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                  Pilih atau Tarik Berkas Foto HEIC / WebP
                </h3>
                <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
                  Dapat memilih puluhan berkas foto sekaligus untuk diproses secara instan di peramban Anda.
                </p>
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition">
                  <Download className="w-4 h-4 rotate-180" />
                  Pilih Foto dari Komputer / HP
                </span>
              </label>
            </div>

            {/* Daftar Berkas & Aksi Massal */}
            {files.length > 0 && (
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      Total Berkas ({files.length})
                    </span>
                    <span className="text-xs text-slate-500">
                      • Selesai: {files.filter((f) => f.status === 'done').length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConvertAll}
                      disabled={isConvertingAll}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isConvertingAll ? 'animate-spin' : ''}`} />
                      {isConvertingAll ? 'Mengonversi...' : 'Mulai Konversi Semua'}
                    </button>

                    {files.some((f) => f.status === 'done') && (
                      <button
                        onClick={handleDownloadAllZip}
                        disabled={isZipping}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        <FileArchive className="w-3.5 h-3.5" />
                        {isZipping ? 'Membuat ZIP...' : 'Unduh Semua (.ZIP)'}
                      </button>
                    )}

                    <button
                      onClick={clearAllFiles}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      title="Hapus Semua"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grid Item Berkas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-2.5 relative group hover:border-indigo-300 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Ukuran Awal: {formatBytes(file.size)}
                            {file.convertedSize && (
                              <span className="text-emerald-600 font-semibold ml-1">
                                → {formatBytes(file.convertedSize)}
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Status / Preview */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                        {file.status === 'idle' && (
                          <span className="text-slate-500 text-[11px]">⏳ Siap dikonversi</span>
                        )}
                        {file.status === 'converting' && (
                          <span className="text-indigo-600 text-[11px] flex items-center gap-1 font-semibold">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Memproses...
                          </span>
                        )}
                        {file.status === 'done' && (
                          <span className="text-emerald-600 text-[11px] flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Selesai ({targetFormat.toUpperCase()})
                          </span>
                        )}
                        {file.status === 'error' && (
                          <span className="text-red-600 text-[11px] flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {file.errorMessage || 'Gagal'}
                          </span>
                        )}

                        {file.status === 'done' && file.convertedUrl && (
                          <a
                            href={file.convertedUrl}
                            download={file.name}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 hover:border-indigo-400 transition"
                          >
                            <Download className="w-3 h-3" />
                            Unduh
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: QR CODE GENERATOR KUSTOM HD                       */}
        {/* ======================================================== */}
        {activeTab === 'qrcode' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Kolom Kontrol Input & Kustomisasi */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-xs">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <Palette className="w-5 h-5 text-indigo-600" />
                  Kustomisasi Kode QR Beresolusi Tinggi
                </h2>
                <p className="text-xs text-slate-500">
                  Hasilkan barcode QR siap cetak untuk packaging, stiker, atau media sosial.
                </p>
              </div>

              {/* Pilihan Tipe Konten */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Tipe Konten:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'url', label: '🔗 Website URL' },
                    { id: 'whatsapp', label: '💬 WhatsApp' },
                    { id: 'wifi', label: '📶 Jaringan WiFi' },
                    { id: 'text', label: '📝 Teks Bebas' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setQrType(t.id as 'url' | 'whatsapp' | 'text' | 'wifi');
                        if (t.id === 'url') setQrContent('https://kompreskilat.site');
                        else if (t.id === 'text') setQrContent('Tulis teks atau catatan Anda di sini');
                      }}
                      className={`py-2 px-1 text-center rounded-xl border font-semibold transition cursor-pointer ${
                        qrType === t.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Dinamis Sesuai Tipe */}
              {qrType === 'url' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tautan Web / URL:</label>
                  <input
                    type="url"
                    value={qrContent}
                    onChange={(e) => setQrContent(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {qrType === 'whatsapp' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp (Kode Negara):</label>
                    <input
                      type="text"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="628123456789"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pesan Otomatis:</label>
                    <input
                      type="text"
                      value={waMessage}
                      onChange={(e) => setWaMessage(e.target.value)}
                      placeholder="Halo Admin!"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {qrType === 'wifi' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama WiFi (SSID):</label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="MyHome_WiFi"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Password:</label>
                      <input
                        type="text"
                        value={wifiPass}
                        onChange={(e) => setWifiPass(e.target.value)}
                        placeholder="kata sandi wifi"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-slate-600">Enkripsi:</span>
                    {(['WPA', 'WEP', 'nopass'] as const).map((mode) => (
                      <label key={mode} className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="wifiSec"
                          checked={wifiType === mode}
                          onChange={() => setWifiType(mode)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{mode === 'nopass' ? 'Tanpa Sandi' : mode}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {qrType === 'text' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teks Bebas:</label>
                  <textarea
                    rows={3}
                    value={qrContent}
                    onChange={(e) => setQrContent(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Pemilih Warna & Resolusi */}
              <div className="pt-3 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Warna Barcode */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Warna Kode QR (Foreground):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-9 h-9 rounded-xl border border-slate-300 p-0.5 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-24 p-2 rounded-xl border border-slate-200 font-mono text-center text-xs"
                      />
                      <div className="flex gap-1">
                        {['#000000', '#1e1b4b', '#065f46', '#7c2d12'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setFgColor(c)}
                            style={{ backgroundColor: c }}
                            className="w-6 h-6 rounded-full border border-slate-300 hover:scale-110 transition cursor-pointer"
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Warna Latar Belakang */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Warna Latar (Background):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-9 h-9 rounded-xl border border-slate-300 p-0.5 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-24 p-2 rounded-xl border border-slate-200 font-mono text-center text-xs"
                      />
                      <div className="flex gap-1">
                        {['#ffffff', '#f8fafc', '#fef3c7', '#f1f5f9'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setBgColor(c)}
                            style={{ backgroundColor: c }}
                            className="w-6 h-6 rounded-full border border-slate-300 hover:scale-110 transition cursor-pointer"
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resolusi Ekspor & Error Correction */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Resolusi Ekspor Unduhan:</label>
                    <select
                      value={qrResolution}
                      onChange={(e) => setQrResolution(parseInt(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="600">600 × 600 px (Media Sosial &amp; Web)</option>
                      <option value="1000">1000 × 1000 px (HD Standar Cetak)</option>
                      <option value="1600">1600 × 1600 px (Ultra HD Packaging)</option>
                      <option value="2400">2400 × 2400 px (4K Banner &amp; Baliho)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Toleransi Kerusakan (ECC):</label>
                    <select
                      value={errorLevel}
                      onChange={(e) => setErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="H">Tinggi / High (30% pemulihan - Direkomendasikan)</option>
                      <option value="Q">Sedang Tinggi / Quartile (25%)</option>
                      <option value="M">Menengah / Medium (15%)</option>
                      <option value="L">Rendah / Low (7%)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Pratinjau Interaktif QR */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pratinjau Kode QR Langsung
              </span>

              {/* Canvas Display */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 shadow-inner max-w-full overflow-hidden flex items-center justify-center">
                <canvas ref={qrCanvasRef} className="rounded-lg max-w-full h-auto shadow-xs" />
              </div>

              <div className="text-[11px] text-slate-500 max-w-xs">
                Format: <b>PNG Beresolusi Tinggi ({qrResolution}px)</b> • Siap dicetak tajam tanpa pecah.
              </div>

              {/* Tombol Aksi */}
              <div className="w-full space-y-2 pt-2">
                <button
                  onClick={downloadQrCodeHD}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Unduh QR Code PNG ({qrResolution}px)
                </button>

                <button
                  onClick={copyQrToClipboard}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedQr ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Gambar Tersalin ke Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Salin Gambar ke Clipboard
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: KOLEKSI UTILITAS CEPAT LAINNYA                     */}
        {/* ======================================================== */}
        {activeTab === 'all-tools' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/tools/resize-pasfoto"
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 mb-1">
                  Resize Pas Foto &amp; Tanda Tangan
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pangkas foto rasio 3x4 / 4x6 dan kompres di bawah 500KB atau 1MB untuk syarat pendaftaran.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-indigo-600">
                <span>Buka Tool</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/tools/watermark"
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 mb-1">
                  Watermark Dokumen &amp; KTP
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bubuhkan teks watermark proteksi pada KTP atau dokumen sensitif agar tidak disalahgunakan pinjol.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-600">
                <span>Buka Tool</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/tools/batch-compress"
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Archive className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 mb-1">
                  Batch Kompres &amp; ZIP
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Kompresi puluhan foto dan berkas sekaligus secara massal dan kemas ke dalam satu arsip ZIP.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-amber-600">
                <span>Buka Tool</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/tools/ats-resume"
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 mb-1">
                  AI Resume &amp; ATS Reviewer
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cek skor ATS CV, temukan kata kunci lowongan yang hilang, dan optimalkan deskripsi pengalaman kerja.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-purple-600">
                <span>Buka Tool</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        )}

        {/* Editorial Section: Panduan, FAQ, AdSense Safe Zone & Hub-Spoke Links */}
        <div className="mt-8">
          <ToolEditorialSection toolId="file-utility" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
