'use client';

import React, { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolEditorialSection from '@/components/ToolEditorialSection';
import JSZip from 'jszip';
import {
  FolderArchive,
  Lock,
  Unlock,
  FileText,
  FileArchive,
  Trash2,
  Eye,
  EyeOff,
  Download,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  ShieldCheck,
  RefreshCw,
  File as FileIcon,
  Plus,
  ShieldAlert
} from 'lucide-react';

interface ExtractedFile {
  name: string;
  size: number;
  dataBase64: string;
}

export default function ZipToolPage() {
  const [activeTab, setActiveTab] = useState<'protect' | 'unprotect'>('protect');

  // ===================== STATE FOR PROTECT (ADD TO ARCHIVE) =====================
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isProtecting, setIsProtecting] = useState<boolean>(false);
  const [protectError, setProtectError] = useState<string | null>(null);
  const [protectResult, setProtectResult] = useState<{
    downloadUrl: string;
    filename: string;
    size: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===================== STATE FOR UNPROTECT (EXTRACT ZIP) =====================
  const [unprotectFile, setUnprotectFile] = useState<File | null>(null);
  const [unprotectPassword, setUnprotectPassword] = useState<string>('');
  const [showUnprotectPassword, setShowUnprotectPassword] = useState<boolean>(false);
  const [isUnprotecting, setIsUnprotecting] = useState<boolean>(false);
  const [unprotectError, setUnprotectError] = useState<string | null>(null);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [isZippingAll, setIsZippingAll] = useState<boolean>(false);

  const unprotectInputRef = useRef<HTMLInputElement>(null);

  // Helper: Format bytes to human readable string
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper: Total bytes of selected files
  const totalSelectedSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  // ===================== HANDLERS: PROTECT =====================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      // Append without duplicate file names
      setSelectedFiles(prev => {
        const existingNames = new Set(prev.map(f => f.name));
        const filteredNew = newFiles.filter(f => !existingNames.has(f.name));
        return [...prev, ...filteredNew];
      });
      setProtectResult(null);
      setProtectError(null);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setProtectResult(null);
  };

  const handleClearAllFiles = () => {
    setSelectedFiles([]);
    setProtectResult(null);
    setProtectError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateArchive = async () => {
    if (selectedFiles.length === 0) {
      setProtectError('Silakan pilih minimal satu berkas dokumen untuk dikompres.');
      return;
    }

    setIsProtecting(true);
    setProtectError(null);
    setProtectResult(null);

    try {
      const formData = new FormData();
      formData.append('action', 'protect');
      formData.append('password', password);
      for (const file of selectedFiles) {
        formData.append('files', file);
      }

      const res = await fetch('/api/zip', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Gagal memproses arsip ZIP di server.');
      }

      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const filename = password ? 'arsip-terproteksi.zip' : 'arsip-kompreskilat.zip';

      setProtectResult({
        downloadUrl,
        filename,
        size: blob.size,
      });
    } catch (err: any) {
      setProtectError(err.message || 'Terjadi kesalahan saat memproses arsip.');
    } finally {
      setIsProtecting(false);
    }
  };

  // ===================== HANDLERS: UNPROTECT =====================
  const handleUnprotectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUnprotectFile(e.target.files[0]);
      setExtractedFiles([]);
      setUnprotectError(null);
    }
  };

  const handleUnprotectArchive = async () => {
    if (!unprotectFile) {
      setUnprotectError('Silakan pilih file arsip ZIP terlebih dahulu.');
      return;
    }

    setIsUnprotecting(true);
    setUnprotectError(null);
    setExtractedFiles([]);

    try {
      const formData = new FormData();
      formData.append('action', 'unprotect');
      formData.append('password', unprotectPassword);
      formData.append('file', unprotectFile);

      const res = await fetch('/api/zip', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal membuka proteksi arsip ZIP.');
      }

      setExtractedFiles(data.files || []);
    } catch (err: any) {
      setUnprotectError(err.message || 'Gagal mengekstrak berkas arsip.');
    } finally {
      setIsUnprotecting(false);
    }
  };

  const handleDownloadSingleFile = (file: ExtractedFile) => {
    try {
      const byteCharacters = atob(file.dataBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleDownloadAllExtractedZip = async () => {
    if (extractedFiles.length === 0) return;
    setIsZippingAll(true);
    try {
      const zip = new JSZip();
      for (const f of extractedFiles) {
        zip.file(f.name, f.dataBase64, { base64: true });
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `ekstrak-${unprotectFile?.name.replace(/\.zip$/i, '') || 'arsip'}-bersih.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Bulk zip error:', err);
    } finally {
      setIsZippingAll(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />

      <section className="max-w-4xl mx-auto px-3.5 sm:px-6 py-6 sm:py-12">
        {/* Header Title & Subtitle */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
            <FolderArchive className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Multi-File ZIP & Encryption Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2.5 sm:mb-3">
            Kompresi, Enkripsi Sandi & Ekstraksi Arsip ZIP
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Kemas banyak berkas dokumen ke dalam arsip .ZIP berproteksi kata sandi (ZipCrypto), atau buka proteksi arsip ZIP yang terkunci secara instan dan aman langsung di peramban web maupun smartphone Anda.
          </p>
        </div>

        {/* Dual Mode Switcher Tabs (Responsive Grid on Mobile, Flex on Desktop) */}
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-2 w-full max-w-md sm:w-auto sm:inline-flex p-1.5 bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-inner gap-1">
            <button
              onClick={() => setActiveTab('protect')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer text-center ${
                activeTab === 'protect'
                  ? 'bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Buat & Kunci ZIP (Protect)</span>
              <span className="sm:hidden">Buat & Kunci</span>
            </button>
            <button
              onClick={() => setActiveTab('unprotect')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer text-center ${
                activeTab === 'unprotect'
                  ? 'bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Unlock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Buka Proteksi & Ekstrak (Unprotect)</span>
              <span className="sm:hidden">Buka & Ekstrak</span>
            </button>
          </div>
        </div>

        {/* ===================== TAB 1: ADD TO ARCHIVE & PROTECT ===================== */}
        {activeTab === 'protect' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <FolderArchive className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
                1. Unggah Multi-File Dokumen
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Pilih beberapa file dokumen (PDF, Word, Excel, Foto, dll.) sekaligus ke dalam kotak berikut.
              </p>
            </div>

            {/* Dropzone Input */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-5 sm:p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Klik untuk memilih berkas atau seret file ke sini
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mendukung unggah banyak file (multi-file) dokumen atau foto sekaligus
              </p>
            </div>

            {/* Selected File List Preview */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Berkas Terpilih ({selectedFiles.length})
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 whitespace-nowrap">
                      Total: {formatBytes(totalSelectedSize)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah File
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <button
                      type="button"
                      onClick={handleClearAllFiles}
                      className="text-[11px] font-medium text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      Hapus Semua
                    </button>
                  </div>
                </div>

                {/* File list preview items */}
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileIcon className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {file.name}
                        </span>
                        <span className="text-[11px] text-slate-500 shrink-0 whitespace-nowrap">
                          ({formatBytes(file.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0 cursor-pointer"
                        title="Hapus berkas ini"
                        aria-label="Hapus file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Password Encryption Input */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                2. Kata Sandi Proteksi (Opsional):
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Ketik kata sandi proteksi (atau kosongkan untuk ZIP biasa)"
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                {password.trim().length > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    Arsip akan diamankan dengan enkripsi ZipCrypto standar (kompatibel Windows Explorer, WinRAR & 7-Zip).
                  </span>
                ) : (
                  <span>
                    💡 Biarkan kosong jika ingin membuat arsip .ZIP standar tanpa proteksi kata sandi.
                  </span>
                )}
              </p>
            </div>

            {/* Error Message */}
            {protectError && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{protectError}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              onClick={handleCreateArchive}
              disabled={isProtecting || selectedFiles.length === 0}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProtecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  <span>Sedang Mengompres & Menyiapkan Arsip ZIP...</span>
                </>
              ) : (
                <>
                  <FolderArchive className="w-4 h-4 shrink-0" />
                  <span>
                    {password.trim() ? 'Buat & Kunci Arsip ZIP Sekarang' : 'Kemaskan File ke Arsip ZIP'}
                  </span>
                </>
              )}
            </button>

            {/* Protect Success & Download Card */}
            {protectResult && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Arsip ZIP Berhasil Dibuat!</span>
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400/90 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>Nama: <strong>{protectResult.filename}</strong></span>
                  <span>Ukuran: <strong>{formatBytes(protectResult.size)}</strong></span>
                  {password && <span>Proteksi: <strong>Terenkripsi Password</strong></span>}
                </div>
                <a
                  href={protectResult.downloadUrl}
                  download={protectResult.filename}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Unduh Arsip ZIP ({formatBytes(protectResult.size)})</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 2: UNPROTECT / EXTRACT ===================== */}
        {activeTab === 'unprotect' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <Unlock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
                1. Unggah Arsip ZIP yang Ingin Dibuka
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Pilih file arsip .ZIP terkunci atau berpassword untuk mengekstrak dan mengunduh isinya.
              </p>
            </div>

            {/* Single ZIP File Dropzone */}
            <div
              onClick={() => unprotectInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-5 sm:p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40 group"
            >
              <input
                ref={unprotectInputRef}
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                onChange={handleUnprotectFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileArchive className="w-6 h-6" />
              </div>
              {unprotectFile ? (
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    📦 {unprotectFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Ukuran: {formatBytes(unprotectFile.size)} (Klik untuk ganti file)
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Pilih Berkas Arsip .ZIP
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mendukung file .zip terenkripsi ZipCrypto maupun ZIP standar
                  </p>
                </div>
              )}
            </div>

            {/* Password Input for Unprotect */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                2. Masukkan Kata Sandi Arsip:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showUnprotectPassword ? 'text' : 'password'}
                  value={unprotectPassword}
                  onChange={e => setUnprotectPassword(e.target.value)}
                  placeholder="Masukkan password arsip ZIP..."
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowUnprotectPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showUnprotectPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                🔒 Masukkan kata sandi yang digunakan saat arsip dikunci. Jika arsip tidak terkunci, kolom ini dapat dikosongkan.
              </p>
            </div>

            {/* Unprotect Error Alert */}
            {unprotectError && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{unprotectError}</span>
              </div>
            )}

            {/* Unprotect Action Button */}
            <button
              type="button"
              onClick={handleUnprotectArchive}
              disabled={isUnprotecting || !unprotectFile}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isUnprotecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  <span>Sedang Membuka Proteksi & Membaca Berkas...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 shrink-0" />
                  <span>Buka Proteksi & Ekstrak File</span>
                </>
              )}
            </button>

            {/* Extracted Files List Preview & Download */}
            {extractedFiles.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3.5 sm:p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                        Arsip Berhasil Dibuka!
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        Ditemukan {extractedFiles.length} berkas yang siap diunduh ulang.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadAllExtractedZip}
                    disabled={isZippingAll}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    {isZippingAll ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                    ) : (
                      <Download className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>Unduh Semua (ZIP Bersih)</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {extractedFiles.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-xs gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {file.name}
                        </span>
                        <span className="text-[11px] text-slate-500 shrink-0 whitespace-nowrap">
                          ({formatBytes(file.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadSingleFile(file)}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 active:bg-blue-200 border border-blue-200 dark:border-blue-800/60 font-semibold text-[11px] shrink-0 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 shrink-0" />
                        <span>Unduh</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Editorial Section: How-To Guide, FAQ, AdSense Compliance & Hub-Spoke Links */}
        <div className="mt-8 sm:mt-12">
          <ToolEditorialSection toolId="zip-utility" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
