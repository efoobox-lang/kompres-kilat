'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { downloadBlobSafely } from '@/lib/file-security';
import {
  FileCode,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Sliders,
  Code2,
  LayoutTemplate
} from 'lucide-react';

const PRESET_TEMPLATES = {
  invoice: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; background: #fff; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
    .brand { font-size: 24px; font-weight: 800; color: #4f46e5; }
    .badge { font-size: 14px; font-weight: 600; color: #64748b; margin-top: 4px; }
    .inv-title { font-size: 28px; font-weight: 800; text-align: right; color: #0f172a; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px; }
    .meta-col { width: 48%; }
    .meta-label { font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 11px; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
    th { background: #f8fafc; color: #475569; font-weight: 700; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; }
    td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
    .text-right { text-align: right; }
    .totals { width: 280px; margin-left: auto; margin-bottom: 40px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
    .totals-grand { font-size: 16px; font-weight: 800; border-top: 2px solid #e2e8f0; padding-top: 10px; color: #4f46e5; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">KOMPRES KILAT DIGITAL</div>
      <div class="badge">Layanan Solusi Dokumen Terpadu</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Jakarta, Indonesia • halo@kompreskilat.site</div>
    </div>
    <div>
      <div class="inv-title">INVOICE</div>
      <div style="text-align: right; font-size: 13px; color: #64748b; margin-top: 4px;">#INV-2026-0891</div>
    </div>
  </div>

  <div class="meta">
    <div class="meta-col">
      <div class="meta-label">Ditagihkan Kepada:</div>
      <div style="font-weight: 700; font-size: 14px;">PT Sinar Cemerlang Abadi</div>
      <div>Attn: Tim Pengadaan & IT</div>
      <div>Sudirman Central Business District, Jakarta</div>
    </div>
    <div class="meta-col" style="text-align: right;">
      <div class="meta-label">Rincian Tanggal:</div>
      <div><strong>Tanggal Terbit:</strong> 03 November 2026</div>
      <div><strong>Jatuh Tempo:</strong> 17 November 2026</div>
      <div><strong>Metode Pembayaran:</strong> Transfer Bank Mandiri</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Deskripsi Layanan</th>
        <th class="text-right">Kuantitas</th>
        <th class="text-right">Harga Satuan</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Paket Integrasi Web Utility Enterprise</strong><br><span style="font-size: 11px; color: #64748b;">Pemrosesan dokumen lokal berlisensi penuh</span></td>
        <td class="text-right">1 Lisensi</td>
        <td class="text-right">Rp 4.500.000</td>
        <td class="text-right">Rp 4.500.000</td>
      </tr>
      <tr>
        <td><strong>Kustomisasi Kompresi & OCR Khusus</strong><br><span style="font-size: 11px; color: #64748b;">Dukungan model dokumen Indonesia</span></td>
        <td class="text-right">1 Paket</td>
        <td class="text-right">Rp 2.000.000</td>
        <td class="text-right">Rp 2.000.000</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal:</span>
      <span>Rp 6.500.000</span>
    </div>
    <div class="totals-row">
      <span>PPN (11%):</span>
      <span>Rp 715.000</span>
    </div>
    <div class="totals-row totals-grand">
      <span>Total Tagihan:</span>
      <span>Rp 7.215.000</span>
    </div>
  </div>

  <div class="footer">
    Terima kasih atas kerja sama dan kepercayaan Anda bersama KompresKilat Digital.
  </div>
</body>
</html>`,

  surat: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: "Times New Roman", Times, serif; color: #111; padding: 50px; margin: 0; line-height: 1.6; font-size: 14px; background: #fff; }
    .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 25px; }
    .kop h2 { margin: 0; font-size: 18px; text-transform: uppercase; font-weight: bold; }
    .kop h1 { margin: 2px 0; font-size: 22px; font-weight: bold; }
    .kop p { margin: 0; font-size: 12px; }
    .letter-info { display: flex; justify-content: space-between; margin-bottom: 25px; }
    .title { text-align: center; font-weight: bold; text-decoration: underline; margin-bottom: 20px; font-size: 16px; }
    p { margin-bottom: 14px; text-align: justify; text-indent: 35px; }
    .ttd-box { margin-top: 40px; float: right; width: 220px; text-align: center; }
  </style>
</head>
<body>
  <div class="kop">
    <h2>KEMENTERIAN TEKNOLOGI & INFORMASI</h2>
    <h1>LEMBAGA LAYANAN DIGITAL INDONESIA</h1>
    <p>Jl. Merdeka No. 45, Gambir, Jakarta Pusat • Telp: (021) 555-0199 • Surel: info@lldi.go.id</p>
  </div>

  <div class="letter-info">
    <div>
      <div>Nomor : 108/LLDI/XI/2026</div>
      <div>Lampiran : 1 (Satu) Berkas</div>
      <div>Perihal : <strong>Keterangan Kelayakan Sistem Digital</strong></div>
    </div>
    <div style="text-align: right;">
      <div>Jakarta, 03 November 2026</div>
    </div>
  </div>

  <div style="margin-bottom: 15px;">
    Kepada Yth.<br>
    <strong>Pimpinan Proyek Digital Mandiri</strong><br>
    di Tempat
  </div>

  <div class="title">SURAT KETERANGAN RESMI</div>

  <p>
    Dengan hormat, sehubungan dengan hasil audit verifikasi arsitektur aplikasi web KompresKilat yang telah diselenggarakan pada tanggal 1 November 2026, bersama surat ini kami menyatakan bahwa sistem pemrosesan berkas telah memenuhi standar kepatuhan keamanan data berbasis pemrosesan lokal (Client-Side Storage Zero-Leakage).
  </p>

  <p>
    Seluruh berkas dokumen warga, termasuk pindaian identitas dan formulir administrasi negara, terbukti diproses langsung di perangkat masing-masing pengguna tanpa adanya transmisi ke peladen perantara yang melanggar ketentuan privasi digital.
  </p>

  <p>
    Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.
  </p>

  <div class="ttd-box">
    <div>Kepala Bagian Verifikasi,</div>
    <div style="height: 65px;"></div>
    <div><strong>Dr. R. Ridhoulloh, M.Kom</strong></div>
    <div>NIP. 19890412 201201 1 002</div>
  </div>
</body>
</html>`,

  resume: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; font-size: 12px; line-height: 1.5; background: #fff; }
    .name { font-size: 26px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .role { font-size: 14px; color: #4f46e5; font-weight: 600; margin-bottom: 12px; }
    .contacts { display: flex; gap: 15px; font-size: 11px; color: #64748b; margin-bottom: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; }
    .sec-title { font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #4f46e5; padding-bottom: 4px; margin-top: 18px; margin-bottom: 10px; }
    .job-head { display: flex; justify-content: space-between; font-weight: 700; color: #1e293b; }
    .job-company { color: #4f46e5; font-size: 11px; margin-bottom: 4px; }
    ul { margin: 4px 0 12px 18px; padding: 0; }
    li { margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="name">R. Ridhoulloh</div>
  <div class="role">Senior Full-Stack & Web Performance Engineer</div>
  <div class="contacts">
    <span>📍 Jakarta, Indonesia</span>
    <span>✉️ ridhoulloh@example.com</span>
    <span>🔗 linkedin.com/in/ridhoulloh</span>
    <span>🌐 kompreskilat.site</span>
  </div>

  <div class="sec-title">Ringkasan Profesional</div>
  <p style="margin: 0 0 10px 0; color: #475569;">
    Web engineer dengan pengalaman lebih dari 6 tahun merancang arsitektur aplikasi web berkecepatan tinggi, integrasi WebAssembly lokal, dan kompresi berkas biner tanpa ketergantungan server. Berpengalaman memimpin pengembangan perkakas dokumen produktif yang digunakan ratusan ribu pengguna bulanan.
  </p>

  <div class="sec-title">Pengalaman Kerja</div>
  <div>
    <div class="job-head">
      <span>Lead Web Architect</span>
      <span style="color: #64748b; font-weight: normal;">2022 - Sekarang</span>
    </div>
    <div class="job-company">KompresKilat Digital Media • Purna Waktu</div>
    <ul>
      <li>Memimpin arsitektur 100% Client-Side Next.js yang menghemat beban komputasi server hingga 95%.</li>
      <li>Mengembangkan suite PDF terpadu dengan integrasi WebAssembly (pdf-lib, pdfjs-dist, dan Tesseract OCR).</li>
      <li>Meningkatkan skor Core Web Vitals (LCP, CLS, INP) mencapai status 100/100 pada Google PageSpeed Insights.</li>
    </ul>
  </div>

  <div class="sec-title">Keahlian Teknis</div>
  <div style="display: flex; gap: 20px;">
    <div><strong>Bahasa:</strong> TypeScript, JavaScript, Python, Go, SQL</div>
    <div><strong>Framework:</strong> Next.js App Router, React, Tailwind CSS, Node.js</div>
  </div>
</body>
</html>`,
};

type TemplateKey = 'invoice' | 'surat' | 'resume';

export default function HtmlToPdfPage() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('invoice');
  const [htmlContent, setHtmlContent] = useState<string>(PRESET_TEMPLATES.invoice);
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'split' | 'editor' | 'preview'>('split');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update iframe preview when htmlContent changes
  const updateIframeContent = useCallback((html: string) => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, []);

  useEffect(() => {
    updateIframeContent(htmlContent);
  }, [htmlContent, updateIframeContent]);

  const handleSelectTemplate = (key: TemplateKey) => {
    setActiveTemplate(key);
    setHtmlContent(PRESET_TEMPLATES[key]);
    setSuccessMessage(`Template ${key.toUpperCase()} dimuat.`);
  };

  // Direct print via iframe window
  const handlePrint = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    } catch (err) {
      console.error('Print error:', err);
      setErrorMessage('Gagal membuka dialog cetak.');
    }
  };

  // Client-side PDF generation using SVG foreignObject & Canvas -> pdf-lib
  const handleDownloadPdf = async () => {
    setIsConverting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Dimensions in points & pixels
      const isLandscape = orientation === 'landscape';
      const a4WidthPt = isLandscape ? PageSizes.A4[1] : PageSizes.A4[0];
      const a4HeightPt = isLandscape ? PageSizes.A4[0] : PageSizes.A4[1];

      // Convert points to standard px (96 dpi / 72 pt = 1.333)
      const pxWidth = Math.round(a4WidthPt * 1.5);
      const pxHeight = Math.round(a4HeightPt * 1.5);

      // Create an SVG with foreignObject containing the HTML
      const doc = iframeRef.current?.contentDocument;
      const bodyContent = doc?.body?.innerHTML || htmlContent;
      const headStyles = Array.from(doc?.querySelectorAll('style') || [])
        .map((s) => s.outerHTML)
        .join('\n');

      const fullHtmlForSvg = `
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: ${pxWidth}px; min-height: ${pxHeight}px; background: #ffffff; box-sizing: border-box;">
          ${headStyles}
          ${bodyContent}
        </div>
      `;

      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${pxWidth}" height="${pxHeight}">
          <foreignObject width="100%" height="100%">
            ${fullHtmlForSvg}
          </foreignObject>
        </svg>
      `;

      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = svgUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = pxWidth;
      canvas.height = pxHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Kanvas tidak tersedia');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pxWidth, pxHeight);
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(svgUrl);

      const imageBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      if (!imageBlob) throw new Error('Gagal mengekspor kanvas');

      const imgArrayBuffer = await imageBlob.arrayBuffer();
      const pdfDoc = await PDFDocument.create();
      const embeddedJpg = await pdfDoc.embedJpg(new Uint8Array(imgArrayBuffer));

      const page = pdfDoc.addPage([a4WidthPt, a4HeightPt]);
      page.drawImage(embeddedJpg, {
        x: 0,
        y: 0,
        width: a4WidthPt,
        height: a4HeightPt,
      });

      const pdfBytes = await pdfDoc.save();
      const outBlob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      downloadBlobSafely(outBlob, `KompresKilat_HTML_${activeTemplate}.pdf`);

      setSuccessMessage('Dokumen PDF berhasil dibuat dan diunduh secara instan.');
    } catch (err) {
      console.warn('Fallback printing trigger due to foreignObject constraint:', err);
      // Fallback: trigger print dialog if strict sandboxing prevents SVG foreignObject
      handlePrint();
      setSuccessMessage('Dialog cetak dibuka. Pilih "Save as PDF" / "Simpan sebagai PDF".');
    } finally {
      setIsConverting(false);
    }
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Konversi HTML ke Dokumen PDF Online - KompresKilat',
    url: 'https://kompreskilat.site/tools/html-to-pdf',
    description: 'Ubah kode HTML, template invoice, surat resmi, atau resume jadi dokumen PDF siap cetak langsung di peramban secara gratis dan privat.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <JsonLd data={schema} />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs px-3 py-1 rounded-full font-bold mb-3">
            <FileCode className="w-3.5 h-3.5" />
            <span>HTML & Template ke PDF 100% Client-Side</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
            Konversi HTML & Template ke PDF
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Edit kode HTML atau pilih template dokumen (Invoice, Surat Resmi, CV), lalu ekspor menjadi berkas PDF standar A4 tanpa server.
          </p>
        </div>

        {/* Toolbar & Template Chooser */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
              <LayoutTemplate className="w-4 h-4 text-indigo-600" /> Template:
            </span>
            <button
              type="button"
              onClick={() => handleSelectTemplate('invoice')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTemplate === 'invoice'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Invoice Tagihan
            </button>
            <button
              type="button"
              onClick={() => handleSelectTemplate('surat')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTemplate === 'surat'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Surat Resmi Dinas
            </button>
            <button
              type="button"
              onClick={() => handleSelectTemplate('resume')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTemplate === 'resume'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Resume / CV
            </button>
          </div>

          {/* View Toggles & Print Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* View Tab Toggle */}
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'split' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                Split Layar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'editor' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                Editor Saja
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'preview' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                Pratinjau Saja
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              title="Cetak via Dialog Print Browser"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Cetak PDF</span>
            </button>

            {/* Download Button */}
            <button
              type="button"
              disabled={isConverting}
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {isConverting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>Unduh Berkas PDF</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-emerald-700 dark:text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        {/* Workspace: Code Editor & Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* HTML Code Editor */}
          {(activeTab === 'split' || activeTab === 'editor') && (
            <div className={`${activeTab === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} flex flex-col`}>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col h-[700px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-indigo-500" />
                    Editor Kode HTML & CSS
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHtmlContent(PRESET_TEMPLATES[activeTemplate])}
                      className="text-slate-400 hover:text-indigo-600 text-[11px] flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset Template
                    </button>
                  </div>
                </div>

                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  spellCheck={false}
                  placeholder="Ketik atau tempel kode HTML & CSS dokumen Anda di sini..."
                  className="flex-1 w-full p-4 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 overflow-auto"
                />
              </div>
            </div>
          )}

          {/* Live Document Preview */}
          {(activeTab === 'split' || activeTab === 'preview') && (
            <div className={`${activeTab === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} flex flex-col`}>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col h-[700px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-500" />
                    Pratinjau Lembar A4 (Skala Asli)
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-400">Kertas:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter')}
                        className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 border-none font-medium text-[11px]"
                      >
                        <option value="a4">A4</option>
                        <option value="letter">Letter</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-400">Orientasi:</span>
                      <select
                        value={orientation}
                        onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                        className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 border-none font-medium text-[11px]"
                      >
                        <option value="portrait">Tegak</option>
                        <option value="landscape">Mendatar</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Simulated Sheet Frame */}
                <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 rounded-xl overflow-auto flex justify-center items-start">
                  <div className="w-full max-w-[595px] min-h-[750px] bg-white shadow-xl rounded border border-slate-200 overflow-hidden">
                    <iframe
                      ref={iframeRef}
                      title="HTML to PDF Preview"
                      className="w-full h-[750px] border-none bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Educational Article Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 mb-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                Solusi Cepat Render Dokumen Web ke Berkas PDF Siap Cetak
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Sempurna untuk pembuatan invoice otomatis, sertifikat pelatihan, surat penawaran, dan portofolio profesional.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-indigo-600" />
                1. Dukungan Penuh CSS & Flexbox
              </h3>
              <p className="text-xs leading-relaxed">
                Gunakan tag HTML modern dan gaya CSS standar termasuk Grid, Flexbox, tabel bergaris, font kustom, serta gambar logo perusahaan secara leluasa.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-emerald-600" />
                2. Ekspor Vektor Tajam
              </h3>
              <p className="text-xs leading-relaxed">
                Didukung oleh mesin cetak browser native sehingga teks tetap dapat disorot, dicari (searchable), dan hasil cetak tetap tajam tanpa artefak buram.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                3. Bebas Ketergantungan Server
              </h3>
              <p className="text-xs leading-relaxed">
                Tanpa perlu berlangganan API Puppeteer eksternal atau mengirim rincian tagihan keuangan Anda ke pihak ketiga. Privasi finansial Anda 100% terjaga.
              </p>
            </div>
          </div>
        </div>

        {/* Ad Placement */}
        <div className="my-8">
          <AdBanner slotId="html-to-pdf-bottom" />
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            Tanya Jawab Seputar HTML ke PDF (FAQ)
          </h2>

          <div className="space-y-3">
            {[
              {
                q: 'Bisakah saya memasukkan gambar logo perusahaan ke dalam HTML?',
                a: 'Bisa. Anda dapat menggunakan tautan gambar publik (https://...) atau menyematkan string gambar Base64 (data:image/png;base64,...) langsung di tag <img>.',
              },
              {
                q: 'Bagaimana cara menambahkan pemisah halaman (page break) pada dokumen panjang?',
                a: 'Cukup gunakan properti CSS standar: <div style="page-break-after: always;"></div> pada bagian yang ingin Anda pisahkan ke halaman berikutnya.',
              },
              {
                q: 'Apakah saya bisa mengedit template yang sudah disediakan?',
                a: 'Tentu. Anda dapat langsung mengubah teks, warna, angka tabel, dan informasi kontak pada kotak editor HTML di sisi kiri, dan melihat perubahannya seketika di pratinjau sisi kanan.',
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
          <span>Perkakas Terkait:</span>
          <Link href="/tools/pdf-editor" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Edit Teks PDF Langsung
          </Link>
          <span>•</span>
          <Link href="/tools/page-number-pdf" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Beri Nomor Halaman PDF
          </Link>
          <span>•</span>
          <Link href="/tools/pdf" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Kompres Dokumen PDF
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
