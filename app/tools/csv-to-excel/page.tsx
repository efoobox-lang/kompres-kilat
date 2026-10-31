'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';

export default function CsvToExcelPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [downloadFileName, setDownloadFileName] = useState<string>('hasil-konversi.xlsx');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setDownloadFileName(`${file.name.replace(/\.[^/.]+$/, '')}.xlsx`);
      setDownloadUrl('');
      setStatusMessage('');

      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        setCsvRawText(text);
        processCsvToExcel(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const processCsvToExcel = (csvData: string, originName: string) => {
    if (!csvData.trim()) return;

    setIsLoading(true);
    setStatusMessage('Sedang membaca baris data CSV dan menyusun lembar kerja Excel...');

    try {
      // Auto-parse CSV menggunakan SheetJS
      const wb = XLSX.read(csvData, { type: 'string' });
      const firstSheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[firstSheetName];

      // Ambil pratinjau tabel
      const jsonRows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
      setPreviewRows(jsonRows.slice(0, 8) as string[][]);

      // Buat file Excel (.xlsx) murni
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setStatusMessage('🎉 File CSV berhasil dikonversi ke Microsoft Excel (.xlsx)!');
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Gagal mengonversi CSV ke Excel. Periksa kembali struktur data berkas Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualConvert = () => {
    if (!csvRawText.trim()) return;
    processCsvToExcel(csvRawText, 'teks-csv.xlsx');
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Konversi CSV ke Excel (.xlsx) Online Gratis',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    featureList: 'Ubah file data CSV menjadi spreadsheet Microsoft Excel XLSX langsung di peramban',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={jsonLd} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Navigasi Tab Cepat */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
            <Link
              href="/tools/excel-to-csv"
              className="px-4 py-2 text-slate-600 hover:text-indigo-600 rounded-lg transition"
            >
              📊 Excel ke CSV
            </Link>
            <span className="px-4 py-2 bg-white text-indigo-600 rounded-lg shadow-sm">
              📑 CSV ke Excel
            </span>
          </div>
        </div>

        <div className="mb-8 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-[11px] sm:text-xs px-3 py-1 rounded-full font-semibold mb-2">
            ⚡ Konverter Spreadsheet Otomatis
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            Konversi File CSV ke Microsoft Excel (.xlsx)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Ubah file data CSV Anda menjadi lembar kerja Excel rapi lengkap dengan pembagian kolom otomatis tanpa kolom berantakan.
          </p>
        </div>

        {/* Kotak Upload CSV */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Pilih Berkas CSV (.csv atau file teks):
          </label>
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />

          {/* Opsi alternatif: Tempel Teks CSV */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Atau Tempel / Ketik Teks CSV Langsung:
            </label>
            <textarea
              rows={3}
              value={csvRawText}
              onChange={(e) => setCsvRawText(e.target.value)}
              placeholder="nama,email,nohp&#10;Budi,budi@email.com,08123456789"
              className="w-full p-3 bg-slate-50 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {csvRawText && !selectedFile && (
              <button
                type="button"
                onClick={handleManualConvert}
                disabled={isLoading}
                className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition"
              >
                Konversi Teks ke Excel ⚡
              </button>
            )}
          </div>
        </div>

        {/* Hasil Konversi */}
        {downloadUrl && (
          <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
            <div className="p-5 bg-green-50 rounded-2xl border border-green-200 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div>
                <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider block">
                  🎉 Berkas Microsoft Excel Siap!
                </span>
                <p className="text-xs text-slate-700 mt-1">
                  Format: <b>.xlsx (OpenXML Spreadsheet)</b>
                </p>
              </div>

              <a
                href={downloadUrl}
                download={downloadFileName}
                className="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-xl transition duration-200 shadow-sm"
              >
                <span>📥 Download File Excel (.xlsx)</span>
              </a>
            </div>

            {/* Pratinjau Tabel */}
            {previewRows.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-700 block mb-2">
                  Pratinjau Lembar Kerja (8 Baris Pertama):
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

