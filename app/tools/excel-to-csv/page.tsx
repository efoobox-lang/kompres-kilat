'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';

export default function ExcelToCsvPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [delimiter, setDelimiter] = useState<string>(',');
  const [csvContent, setCsvContent] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setWorkbook(null);
      setSheetNames([]);
      setSelectedSheet('');
      setCsvContent('');
      setPreviewRows([]);
      setDownloadUrl('');
      setStatusMessage('');

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          setWorkbook(wb);
          setSheetNames(wb.SheetNames);
          if (wb.SheetNames.length > 0) {
            setSelectedSheet(wb.SheetNames[0]);
            convertSheetToCsv(wb, wb.SheetNames[0], delimiter, file.name);
          }
        } catch (err) {
          console.error(err);
          setStatusMessage('Gagal membaca file Excel. Pastikan file berformat .xlsx atau .xls yang valid.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const convertSheetToCsv = (
    wb: XLSX.WorkBook,
    sheetName: string,
    delim: string,
    fileName: string
  ) => {
    setIsLoading(true);
    try {
      const sheet = wb.Sheets[sheetName];
      // Generate CSV string
      const csv = XLSX.utils.sheet_to_csv(sheet, { FS: delim });
      setCsvContent(csv);

      // Generate preview (first 10 rows)
      const jsonRows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
      setPreviewRows(jsonRows.slice(0, 8) as string[][]);

      // Create download Blob with UTF-8 BOM agar terbaca sempurna di Excel Indonesia
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      setStatusMessage('🎉 File Excel berhasil dikonversi ke format CSV!');
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Terjadi kendala saat mengonversi lembar kerja.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSheetChange = (newSheet: string) => {
    setSelectedSheet(newSheet);
    if (workbook && selectedFile) {
      convertSheetToCsv(workbook, newSheet, delimiter, selectedFile.name);
    }
  };

  const handleDelimiterChange = (newDelim: string) => {
    setDelimiter(newDelim);
    if (workbook && selectedSheet && selectedFile) {
      convertSheetToCsv(workbook, selectedSheet, newDelim, selectedFile.name);
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Konversi Excel ke CSV Online Gratis',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    featureList: 'Ubah spreadsheet XLSX dan XLS ke format file CSV dengan pemisah koma atau titik koma',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={jsonLd} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Navigasi Tab Cepat Antara Excel ke CSV & CSV ke Excel */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
            <span className="px-4 py-2 bg-white text-indigo-600 rounded-lg shadow-sm">
              📊 Excel ke CSV
            </span>
            <Link
              href="/tools/csv-to-excel"
              className="px-4 py-2 text-slate-600 hover:text-indigo-600 rounded-lg transition"
            >
              📑 CSV ke Excel
            </Link>
          </div>
        </div>

        <div className="mb-8 text-center">
          <span className="inline-block bg-green-100 text-green-700 text-[11px] sm:text-xs px-3 py-1 rounded-full font-semibold mb-2">
            ⚡ Instan di Browser (Aman &amp; Cepat)
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            Konversi File Excel (.xlsx / .xls) ke CSV
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Ubah lembar kerja Microsoft Excel menjadi file CSV terstruktur untuk keperluan database, import sistem e-commerce, atau analisis data.
          </p>
        </div>

        {/* Kotak Upload Excel */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Pilih File Excel (.xlsx atau .xls):
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>

        {workbook && selectedFile && (
          <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-6">
            {/* Pengaturan Konversi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              {/* Pilihan Sheet */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Lembar Kerja (Sheet):</label>
                <select
                  value={selectedSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                >
                  {sheetNames.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Pilihan Pemisah Karakter (Delimiter) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pemisah Kolom (Delimiter):</label>
                <select
                  value={delimiter}
                  onChange={(e) => handleDelimiterChange(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                >
                  <option value=",">Koma (,) - Standar Internasional</option>
                  <option value=";">Titik Koma (;) - Standar Excel Indonesia/Eropa</option>
                  <option value="&#9;">Tab (\t) - TSV</option>
                  <option value="|">Garis Tegak (|) - Pipe Delimited</option>
                </select>
              </div>
            </div>

            {/* Tombol Unduh CSV */}
            {downloadUrl && (
              <div className="p-5 bg-green-50 rounded-2xl border border-green-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider block">
                      🎉 Berkas CSV Siap Diunduh!
                    </span>
                    <p className="text-xs text-slate-700 mt-1">
                      Sheet: <b>{selectedSheet}</b> • Pemisah: <b>{delimiter === ',' ? 'Koma (,)' : 'Titik Koma (;)'}</b>
                    </p>
                  </div>

                  <a
                    href={downloadUrl}
                    download={`${selectedFile.name.replace(/\.[^/.]+$/, '')}-${selectedSheet}.csv`}
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-xl transition duration-200 shadow-sm"
                  >
                    <span>📥 Download File CSV</span>
                  </a>
                </div>

                {/* Pratinjau Tabel */}
                {previewRows.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-green-200">
                    <span className="text-[11px] font-bold text-slate-700 block mb-2">
                      Pratinjau Data (8 Baris Pertama):
                    </span>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-inner">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <tbody>
                          {previewRows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className={rIdx === 0 ? 'bg-slate-100 font-bold border-b border-slate-200' : 'border-b border-slate-100'}
                            >
                              {(row || []).map((cell, cIdx) => (
                                <td key={cIdx} className="p-2 border-r border-slate-100 whitespace-nowrap max-w-xs truncate">
                                  {String(cell ?? '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {statusMessage && (
              <p className="text-center text-xs font-medium text-slate-700">{statusMessage}</p>
            )}
          </div>
        )}

        {/* Slot Iklan */}
        <AdBanner zone="in-tool" label="Iklan Sponsor" />
      </section>

      <Footer />
    </main>
  );
}

