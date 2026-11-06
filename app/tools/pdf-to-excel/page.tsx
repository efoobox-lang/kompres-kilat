'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';

interface ExtractedTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function PdfToExcelPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [delimiter, setDelimiter] = useState<'auto' | 'comma' | 'semicolon' | 'tab' | 'space'>('auto');
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [downloadFileName, setDownloadFileName] = useState<string>('hasil-konversi.xlsx');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [totalRows, setTotalRows] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isScannedPdf, setIsScannedPdf] = useState<boolean>(false);

  // Lazy-load PDF.js dengan worker lokal mandiri
  const loadPdfJs = async () => {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }
    return pdfjs;
  };

  /**
   * Ekstraksi teks & pemetaan tabel PDF 100% Client-Side menggunakan pdfjs-dist.
   * Hanya membaca text layer dokumen (mengabaikan bytecode %PDF-1.7, /Parent, /CropBox, dan binary stream).
   */
  const extractTableRowsFromPdf = async (
    buffer: ArrayBuffer,
    selectedDelimiter: 'auto' | 'comma' | 'semicolon' | 'tab' | 'space',
    onProgress?: (curr: number, total: number) => void
  ): Promise<{ rows: string[][]; numPages: number }> => {
    const pdfjs = await loadPdfJs();
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
      cMapPacked: true,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const allRows: string[][] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (onProgress) onProgress(pageNum, numPages);
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent({
        includeMarkedContent: false,
      });

      const items: ExtractedTextItem[] = [];
      for (const rawItem of textContent.items) {
        if ('str' in rawItem && typeof rawItem.str === 'string') {
          const textStr = rawItem.str;
          // Abaikan spasi kosong murni
          if (textStr.trim().length > 0) {
            items.push({
              str: textStr,
              x: rawItem.transform ? rawItem.transform[4] : 0,
              y: rawItem.transform ? rawItem.transform[5] : 0,
              width: rawItem.width || 0,
              height: rawItem.height || 0,
            });
          }
        }
      }

      if (items.length === 0) continue;

      // Urutkan item teks: Y menurun (atas ke bawah), X menaik (kiri ke kanan)
      items.sort((a, b) => {
        if (Math.abs(b.y - a.y) > 3.5) {
          return b.y - a.y;
        }
        return a.x - b.x;
      });

      // Kelompokkan teks ke dalam baris tabel (Y-clustering dengan toleransi 3.5px)
      interface LineGroup {
        y: number;
        items: ExtractedTextItem[];
      }
      const lines: LineGroup[] = [];

      for (const item of items) {
        const existingLine = lines.find((l) => Math.abs(l.y - item.y) <= 3.5);
        if (existingLine) {
          existingLine.items.push(item);
        } else {
          lines.push({ y: item.y, items: [item] });
        }
      }

      // Pastikan urutan baris dari atas ke bawah
      lines.sort((a, b) => b.y - a.y);

      if (selectedDelimiter === 'auto') {
        // --- 1. Gabungkan kata/frasa yang berdekatan secara horizontal pada setiap baris ---
        interface ConsolidatedItem {
          str: string;
          x: number;
          y: number;
          width: number;
          height: number;
        }

        const consolidatedLines: { y: number; items: ConsolidatedItem[] }[] = [];

        for (const line of lines) {
          line.items.sort((a, b) => a.x - b.x);
          const cItems: ConsolidatedItem[] = [];
          let current: ConsolidatedItem | null = null;

          for (const it of line.items) {
            if (!current) {
              current = { ...it };
            } else {
              const gap = it.x - (current.x + current.width);
              // Jika gap kecil (misal spasi dalam kata atau satu frasa), gabungkan
              if (gap <= 4) {
                current.str += (gap > 1 && !current.str.endsWith(' ') && !it.str.startsWith(' ') ? ' ' : '') + it.str;
                current.width = (it.x + it.width) - current.x;
              } else {
                cItems.push(current);
                current = { ...it };
              }
            }
          }
          if (current) cItems.push(current);

          if (cItems.length > 0) {
            consolidatedLines.push({ y: line.y, items: cItems });
          }
        }

        // --- 2. Deteksi Batas Kolom Spasial (Spatial Column Boundaries) ---
        const multiItemLines = consolidatedLines.filter((l) => l.items.length >= 2);
        const boundaries: number[] = [];
        let numCols = 1;

        if (multiItemLines.length > 0) {
          const maxItems = Math.max(...multiItemLines.map((l) => l.items.length));
          const candidates = multiItemLines.filter((l) => l.items.length === maxItems);

          // Pilih baris kunci dengan bentang horizontal (span) terlebar (misal header tabel utama)
          let bestLine = candidates[0];
          let maxSpan = 0;
          for (const cand of candidates) {
            const span = (cand.items[cand.items.length - 1].x + cand.items[cand.items.length - 1].width) - cand.items[0].x;
            if (span > maxSpan) {
              maxSpan = span;
              bestLine = cand;
            }
          }

          for (let i = 0; i < bestLine.items.length - 1; i++) {
            const right = bestLine.items[i].x + (bestLine.items[i].width || 10);
            const nextLeft = bestLine.items[i + 1].x;
            boundaries.push(Number(((right + nextLeft) / 2).toFixed(2)));
          }
          numCols = boundaries.length + 1;
        }

        const getColIndex = (x: number, width: number): number => {
          if (boundaries.length === 0) return 0;
          const mid = x + (width || 0) / 2;
          for (let i = 0; i < boundaries.length; i++) {
            if (mid < boundaries[i]) return i;
          }
          return boundaries.length;
        };

        // --- 3. Pemetaan ke Grid Kolom & Penggabungan Teks Multi-baris (Multiline Merging) ---
        interface WorkingRow {
          cells: string[];
          isHeader: boolean;
          hasItemNumber: boolean;
        }

        let currentRow: WorkingRow | null = null;
        let lastY = -1;

        for (const line of consolidatedLines) {
          const lineCols: string[] = new Array(numCols).fill('');
          for (const it of line.items) {
            const colIdx = getColIndex(it.x, it.width);
            lineCols[colIdx] = lineCols[colIdx] ? `${lineCols[colIdx]} ${it.str}`.trim() : it.str.trim();
          }

          if (!lineCols.some((c) => c.length > 0)) continue;

          const firstCol = lineCols[0] || '';
          const hasCol0Number = /^\d+$/.test(firstCol.trim());
          const joinedLine = lineCols.filter(Boolean).join(' ');
          const isSummaryRow = /^(jumlah|total|diskon|subtotal|pajak|ppn|grand total|ringkasan)/i.test(joinedLine);
          const isHeaderRow = /^(no|nomor|kode|item|nama|deskripsi|keterangan|unit|qty|harga|satuan)/i.test(
            `${lineCols[0] || ''} ${lineCols[1] || ''}`
          );

          let shouldMerge = false;
          if (currentRow && !currentRow.isHeader && !isHeaderRow && !isSummaryRow && lastY !== -1) {
            const deltaY = Math.abs(line.y - lastY);
            if (deltaY <= 24) {
              if (hasCol0Number) {
                // Jika baris saat ini belum memiliki nomor urut di kolom 0 (misal nama barang berada di atas angka 1)
                if (!currentRow.hasItemNumber) {
                  shouldMerge = true;
                } else {
                  shouldMerge = false; // Baris data nomor berikutnya
                }
              } else {
                // Baris lanjutan spesifikasi (Tipe, Merek, Catatan tambahan)
                shouldMerge = true;
              }
            }
          }

          if (shouldMerge && currentRow) {
            for (let c = 0; c < numCols; c++) {
              if (lineCols[c]) {
                if (!currentRow.cells[c]) {
                  currentRow.cells[c] = lineCols[c];
                } else {
                  // Pisahkan baris dalam sel yang sama dengan \r\n standar Excel
                  currentRow.cells[c] += '\r\n' + lineCols[c];
                }
              }
            }
            if (hasCol0Number) currentRow.hasItemNumber = true;
            lastY = line.y;
          } else {
            if (currentRow) {
              allRows.push(currentRow.cells);
            }
            currentRow = {
              cells: [...lineCols],
              isHeader: isHeaderRow,
              hasItemNumber: hasCol0Number,
            };
            lastY = line.y;
          }
        }

        if (currentRow) {
          allRows.push(currentRow.cells);
        }
      } else {
        // Pemisah manual yang dipilih oleh pengguna (Koma, Titik Koma, Tab, Spasi)
        for (const line of lines) {
          line.items.sort((a, b) => a.x - b.x);
          let lineText = '';
          let lastRight = -1;
          for (const it of line.items) {
            if (lastRight !== -1 && it.x - lastRight > 2 && !lineText.endsWith(' ') && !it.str.startsWith(' ')) {
              lineText += ' ';
            }
            lineText += it.str;
            lastRight = it.x + it.width;
          }

          let rowCells: string[] = [];
          if (selectedDelimiter === 'comma') {
            rowCells = lineText.split(',').map((c) => c.trim());
          } else if (selectedDelimiter === 'semicolon') {
            rowCells = lineText.split(';').map((c) => c.trim());
          } else if (selectedDelimiter === 'tab') {
            rowCells = lineText.split('\t').map((c) => c.trim());
          } else if (selectedDelimiter === 'space') {
            rowCells = lineText.split(/\s{2,}/).map((c) => c.trim());
          }

          if (rowCells.length > 0 && rowCells.some((c) => c.length > 0)) {
            allRows.push(rowCells);
          }
        }
      }
    }

    return { rows: allRows, numPages };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Harap pilih file berformat PDF!');
        return;
      }

      setSelectedFile(file);
      setDownloadFileName(`${file.name.replace(/\.[^/.]+$/, '')}.xlsx`);
      setDownloadUrl('');
      setPreviewRows([]);
      setStatusMessage('');
      setTotalRows(0);
      setTotalPages(0);
      setIsScannedPdf(false);

      processPdfToExcel(file, delimiter);
    }
  };

  const processPdfToExcel = async (file: File, delim: 'auto' | 'comma' | 'semicolon' | 'tab' | 'space') => {
    setIsLoading(true);
    setStatusMessage('Memuat mesin PDF.js dan mengekstrak lapisan teks tabel...');
    setIsScannedPdf(false);

    try {
      const buffer = await file.arrayBuffer();

      const { rows, numPages } = await extractTableRowsFromPdf(
        buffer,
        delim,
        (curr, total) => {
          setStatusMessage(`Mengekstrak tabel halaman ${curr} dari ${total}...`);
        }
      );

      setTotalPages(numPages);

      if (rows.length === 0) {
        setIsScannedPdf(true);
        setStatusMessage(
          'Tidak ditemukan lapisan teks digital pada berkas PDF ini. Dokumen kemungkinan berupa hasil foto/pindaian kamera.'
        );
        setIsLoading(false);
        return;
      }

      setTotalRows(rows.length);
      setPreviewRows(rows.slice(0, 15));

      // Buat workbook Excel (.xlsx) murni menggunakan SheetJS
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(rows);

      // Hitung lebar kolom dinamis berdasarkan baris terpanjang dalam sel multiline
      const colWidths = rows.reduce((acc, row) => {
        row.forEach((cell, idx) => {
          const lines = cell ? String(cell).split(/\r?\n/) : [''];
          const maxLineLen = Math.max(...lines.map((l) => l.length), 5);
          acc[idx] = Math.max(acc[idx] || 12, Math.min(maxLineLen + 4, 60));
        });
        return acc;
      }, [] as number[]);

      ws['!cols'] = colWidths.map((wch) => ({ wch }));

      XLSX.utils.book_append_sheet(wb, ws, 'Data_Tabel_PDF');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatusMessage(`Berhasil mengekstrak ${rows.length} baris data dari ${numPages} halaman ke dalam Excel (.xlsx)!`);
    } catch (err: unknown) {
      console.error('PDF to Excel error:', err);
      const errMsg = err instanceof Error ? err.message : '';
      if (errMsg.toLowerCase().includes('password')) {
        setStatusMessage('Berkas PDF ini terenkripsi password. Harap buka kunci sandi PDF terlebih dahulu.');
      } else {
        setStatusMessage('Gagal mengekstrak tabel. File PDF kemungkinan memiliki format tidak kompatibel.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelimiterChange = (newDelim: 'auto' | 'comma' | 'semicolon' | 'tab' | 'space') => {
    setDelimiter(newDelim);
    if (selectedFile) {
      processPdfToExcel(selectedFile, newDelim);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Structured Data Schema untuk SEO Google
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Konversi PDF ke Excel Online Gratis - KompresKilat',
    operatingSystem: 'All',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    description: 'Konversi tabel dokumen PDF menjadi spreadsheet Microsoft Excel (.xlsx) rapi per kolom secara gratis langsung di browser Anda.',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Apakah hasil konversi berupa file Excel asli (.xlsx)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ya, sistem kami menghasilkan file spreadsheet murni berformat .xlsx yang dapat langsung dibuka, diedit, dan diolah rumusnya di Microsoft Excel, Google Sheets, maupun LibreOffice Calc.',
        },
      },
      {
        '@type': 'Question',
        name: 'Apakah dokumen laporan keuangan PDF saya aman?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sangat aman. Pemrosesan konversi dilakukan 100% di memori peramban lokal perangkat Anda tanpa mengunggah dokumen Anda ke server database pihak ketiga.',
        },
      },
      {
        '@type': 'Question',
        name: 'Bagaimana jika tabel PDF terpisah spasi atau titik koma?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'KompresKilat menyediakan opsi pemisah kolom cerdas: Otomatis, Koma, Titik Koma, Tab, atau Spasi Ganda sehingga tabel Anda tertata rapi per sel tanpa bertumpuk.',
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />

      {/* Header / Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="mb-8 text-center">
          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold mb-2">
            📊 Format XLSX Asli • Privasi 100% Aman • Engine PDF.js Cerdas
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Konversi Dokumen PDF ke Excel (.xlsx) Online
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Ekstrak data tabel, laporan neraca keuangan, daftar invoice, dan ringkasan data dari dokumen PDF ke dalam lembar kerja Microsoft Excel secara rapi per kolom tanpa kode biner mentah.
          </p>
        </div>

        {/* Upload Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Unggah Dokumen PDF Tabel / Laporan:
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-slate-200 rounded-xl p-2"
          />
          <p className="text-[11px] text-slate-400 mt-2">
            Mendukung dokumen PDF laporan kerja, buku rapor sekolah, slip gaji, mutasi rekening, dan tabel inventaris.
          </p>
        </div>

        {/* Panel Pengaturan & Hasil Konversi */}
        {selectedFile && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ukuran: <b>{formatBytes(selectedFile.size)}</b>
                  {totalPages > 0 && ` • ${totalPages} Halaman`}
                  {totalRows > 0 && ` • ${totalRows} Baris Ditemukan`}
                </p>
              </div>
              <span className="text-3xl">📊</span>
            </div>

            {/* Opsi Pemisah Kolom */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Opsi Deteksi Pemisah Kolom Tabel:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {[
                  { id: 'auto', label: '⚡ Otomatis (Posisi Sel)' },
                  { id: 'tab', label: 'Tab / Indent' },
                  { id: 'comma', label: 'Koma (,)' },
                  { id: 'semicolon', label: 'Titik Koma (;)' },
                  { id: 'space', label: 'Spasi Ganda' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleDelimiterChange(item.id as 'auto' | 'comma' | 'semicolon' | 'tab' | 'space')}
                    className={`py-2 px-2.5 rounded-xl border font-semibold text-center transition cursor-pointer ${
                      delimiter === item.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Pesan */}
            {statusMessage && (
              <div
                className={`p-3 border text-xs rounded-xl font-medium ${
                  isScannedPdf
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                {isLoading ? '⏳ ' : isScannedPdf ? '⚠️ ' : '✅ '} {statusMessage}
              </div>
            )}

            {/* Alert Rekomendasi OCR jika PDF berupa scan gambar */}
            {isScannedPdf && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                <p className="font-semibold">💡 Rekomendasi Solusi:</p>
                <p>
                  Dokumen ini tidak memiliki lapisan teks digital (teks tertanam). Silakan gunakan alat{' '}
                  <Link href="/tools/pdf-to-word" className="font-bold underline text-emerald-700 hover:text-emerald-800">
                    PDF ke Word (OCR)
                  </Link>{' '}
                  kami yang dilengkapi mesin kecerdasan buatan (Tesseract OCR) untuk mengekstrak tulisan dari foto/scan.
                </p>
              </div>
            )}

            {/* Pratinjau Tabel */}
            {previewRows.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    Pratinjau Data Tabel ({Math.min(15, previewRows.length)} baris pertama):
                  </span>
                  <span className="text-[11px] text-slate-400">Tersusun Rapi per Kolom Excel</span>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <tbody>
                      {previewRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={
                            idx === 0
                              ? 'bg-slate-100 font-bold text-slate-900 border-b border-slate-200'
                              : 'border-b border-slate-100 hover:bg-slate-50'
                          }
                        >
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2.5 border-r border-slate-100 whitespace-pre-line max-w-[260px] align-top text-slate-700">
                              {cell || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tombol Unduh */}
            {downloadUrl && (
              <div className="pt-2">
                <a
                  href={downloadUrl}
                  download={downloadFileName}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold py-3.5 px-6 rounded-xl transition duration-200 shadow-sm flex items-center justify-center gap-2 text-center cursor-pointer"
                >
                  <span>📥 Unduh Berkas Excel (.xlsx) Asli</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* AdSense Slot Tengah */}
        <div className="my-8">
          <AdBanner slotId="8472910385" />
        </div>

        {/* Konten Edukasi & SEO */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-700 leading-relaxed text-xs sm:text-sm">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              Keunggulan Konversi PDF ke Excel di KompresKilat
            </h2>
            <p>
              Mengonversi dokumen PDF berisi tabel seringkali menghasilkan data yang berantakan jika hanya disalin-tempel secara manual. Mesin konversi PDF ke Excel kami menggunakan engine standar <b>PDF.js</b> yang membaca lapisan teks (*text layer*) asli per koordinat spasial, memisahkan sel baris dan kolom secara akurat, kemudian menyusunnya langsung menjadi format spreadsheet <b>Microsoft Excel (.xlsx)</b> asli tanpa kode metadata mentah.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-2xl mb-1 block">🔒</span>
              <h3 className="font-bold text-slate-900 mb-1">Privasi 100% Aman</h3>
              <p className="text-xs text-slate-500">
                Seluruh proses konversi berjalan di memori lokal peramban Anda. Berkas PDF tidak diunggah ke database mana pun.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-2xl mb-1 block">📑</span>
              <h3 className="font-bold text-slate-900 mb-1">Format XLSX Standar</h3>
              <p className="text-xs text-slate-500">
                Kompatibel penuh dengan Microsoft Excel 2016+, Office 365, Google Sheets, dan WPS Office tanpa distorsi.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-2xl mb-1 block">⚡</span>
              <h3 className="font-bold text-slate-900 mb-1">Cepat Tanpa Batas</h3>
              <p className="text-xs text-slate-500">
                Tanpa perlu mendaftar akun atau memasukkan email. Langsung unggah, sesuaikan pemisah, dan unduh hasilnya.
              </p>
            </div>
          </div>

          {/* Panduan Langkah demi Langkah */}
          <div className="pt-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2">
              Cara Mengubah Berkas PDF Menjadi Excel:
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 pl-1">
              <li>Pilih atau seret berkas PDF tabel Anda ke kotak unggah di atas.</li>
              <li>Sistem akan langsung memindai struktur baris dan memetakan data per kolom menggunakan koordinat spasial.</li>
              <li>Pilih opsi pemisah kolom (Otomatis, Tab, Koma, atau Titik Koma) jika diperlukan.</li>
              <li>Periksa pratinjau tabel yang muncul di layar untuk memastikan kolom sudah sesuai.</li>
              <li>Klik tombol <b>Unduh Berkas Excel (.xlsx) Asli</b> untuk menyimpan lembar kerja Anda.</li>
            </ol>
          </div>

          {/* FAQ */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3">
              Pertanyaan yang Sering Diajukan (FAQ):
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-slate-800">Apakah alat ini gratis selamanya?</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ya, alat konversi PDF ke Excel di KompresKilat dapat digunakan secara gratis tanpa batasan kuota harian.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Apakah saya bisa mengubah dokumen PDF hasil scan?</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Untuk dokumen PDF hasil scan kamera/foto tanpa lapisan teks, Anda dapat memanfaatkan fitur{' '}
                  <Link href="/tools/pdf-to-word" className="text-emerald-600 font-semibold hover:underline">
                    PDF ke Word (OCR)
                  </Link>{' '}
                  kami yang memiliki mesin pengenalan karakter visual cerdas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>

      {/* Footer Komprehensif */}
      <Footer />
    </main>
  );
}
