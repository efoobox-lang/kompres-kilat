'use client';

import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolEditorialSection from '@/components/ToolEditorialSection';
import JsonLd from '@/components/JsonLd';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';
import { decryptPDF, isEncrypted } from '@pdfsmaller/pdf-decrypt';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  FileText,
  Download,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  FileUp,
  ShieldAlert
} from 'lucide-react';

export default function PdfPasswordPage() {
  const [activeTab, setActiveTab] = useState<'protect' | 'unlock'>('protect');

  // ==========================================
  // STATE: TAB 1 - KUNCI PDF (PROTECT)
  // ==========================================
  const [protectFile, setProtectFile] = useState<File | null>(null);
  const [protectPassword, setProtectPassword] = useState('');
  const [protectConfirmPassword, setProtectConfirmPassword] = useState('');
  const [showProtectPassword, setShowProtectPassword] = useState(false);
  const [protectAlgorithm, setProtectAlgorithm] = useState<'AES-256' | 'RC4'>('AES-256');
  const [isProtecting, setIsProtecting] = useState(false);
  const [protectStatus, setProtectStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message?: string;
    downloadUrl?: string;
    fileName?: string;
  }>({ type: 'idle' });

  // ==========================================
  // STATE: TAB 2 - BUKA PDF (UNLOCK)
  // ==========================================
  const [unlockFile, setUnlockFile] = useState<File | null>(null);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [showUnlockPassword, setShowUnlockPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockStatus, setUnlockStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message?: string;
    downloadUrl?: string;
    fileName?: string;
  }>({ type: 'idle' });

  const protectInputRef = useRef<HTMLInputElement>(null);
  const unlockInputRef = useRef<HTMLInputElement>(null);

  // Format Bytes Utility
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // ==========================================
  // HANDLERS: TAB 1 - ENKRIPSI PDF
  // ==========================================
  const handleProtectFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Harap unggah berkas berformat dokumen PDF (.pdf).');
      return;
    }

    setProtectFile(file);
    setProtectStatus({ type: 'idle' });

    // Deteksi apakah berkas sudah terenkripsi sebelumnya
    try {
      const buffer = await file.arrayBuffer();
      const encrypted = await isEncrypted(new Uint8Array(buffer));
      if (encrypted) {
        setProtectStatus({
          type: 'error',
          message: 'Berkas PDF ini sudah diproteksi dengan password! Jika ingin mengubah atau membukanya, silakan gunakan tab "Buka PDF".',
        });
      }
    } catch {
      // Abaikan jika deteksi awal gagal
    }
  };

  const handleEncryptPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protectFile) return;

    if (!protectPassword.trim()) {
      setProtectStatus({ type: 'error', message: 'Silakan masukkan kata sandi (password) pengaman.' });
      return;
    }

    if (protectPassword !== protectConfirmPassword) {
      setProtectStatus({ type: 'error', message: 'Konfirmasi password tidak cocok dengan password yang dimasukkan.' });
      return;
    }

    setIsProtecting(true);
    setProtectStatus({ type: 'idle' });

    try {
      const arrayBuffer = await protectFile.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);

      // Jalankan enkripsi PDF di browser menggunakan @pdfsmaller/pdf-encrypt
      const encryptedBytes = await encryptPDF(pdfBytes, protectPassword, {
        algorithm: protectAlgorithm,
      });

      const blob = new Blob([encryptedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const originalBase = protectFile.name.replace(/\.[^/.]+$/, '');
      const lockedFileName = `${originalBase}_Terkunci.pdf`;

      setProtectStatus({
        type: 'success',
        message: `Dokumen PDF berhasil dikunci dengan enkripsi ${protectAlgorithm}! Siapa pun yang membuka berkas ini wajib memasukkan password yang Anda buat.`,
        downloadUrl,
        fileName: lockedFileName,
      });
    } catch (err: any) {
      console.error('Error encrypting PDF:', err);
      setProtectStatus({
        type: 'error',
        message: err?.message || 'Gagal mengenkripsi dokumen PDF. Pastikan berkas tidak rusak.',
      });
    } finally {
      setIsProtecting(false);
    }
  };

  // ==========================================
  // HANDLERS: TAB 2 - DEKRIPSI PDF
  // ==========================================
  const handleUnlockFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Harap unggah berkas berformat dokumen PDF (.pdf).');
      return;
    }

    setUnlockFile(file);
    setUnlockStatus({ type: 'idle' });

    // Deteksi apakah berkas memang terkunci
    try {
      const buffer = await file.arrayBuffer();
      const encrypted = await isEncrypted(new Uint8Array(buffer));
      if (!encrypted) {
        setUnlockStatus({
          type: 'error',
          message: 'Berkas PDF ini tidak terkunci password. Anda dapat membukanya langsung tanpa perlu didekripsi.',
        });
      }
    } catch {
      // Lanjutkan jika tidak dapat memeriksa otomatis
    }
  };

  const handleDecryptPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockFile) return;

    if (!unlockPassword) {
      setUnlockStatus({ type: 'error', message: 'Silakan ketik password PDF untuk membuka proteksi.' });
      return;
    }

    setIsUnlocking(true);
    setUnlockStatus({ type: 'idle' });

    try {
      const arrayBuffer = await unlockFile.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);

      // Jalankan dekripsi PDF di browser menggunakan @pdfsmaller/pdf-decrypt
      const decryptedBytes = await decryptPDF(pdfBytes, unlockPassword);

      const blob = new Blob([decryptedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const originalBase = unlockFile.name.replace(/\.[^/.]+$/, '').replace(/_Terkunci$/i, '');
      const unlockedFileName = `${originalBase}_BebasPassword.pdf`;

      setUnlockStatus({
        type: 'success',
        message: 'Password cocok! Kunci pengaman berhasil dihilangkan secara permanen dari dokumen ini.',
        downloadUrl,
        fileName: unlockedFileName,
      });
    } catch (err: any) {
      console.error('Error decrypting PDF:', err);
      const isWrongPassword =
        err?.message?.toLowerCase().includes('password') ||
        err?.message?.toLowerCase().includes('incorrect') ||
        err?.message?.toLowerCase().includes('mismatch');

      setUnlockStatus({
        type: 'error',
        message: isWrongPassword
          ? 'Password yang Anda masukkan salah. Periksa huruf besar/kecil (Caps Lock) dan coba lagi.'
          : err?.message || 'Gagal membuka proteksi PDF. Pastikan password yang dimasukkan tepat.',
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Kunci & Buka Password PDF Online - KompresKilat',
    description: 'Enkripsi dokumen PDF dengan password AES-256 atau hapus kata sandi PDF secara instan 100% aman di peramban Anda.',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'All',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <JsonLd data={schema} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header Hero */}
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-xs px-3.5 py-1 rounded-full font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Keamanan Dokumen Tanpa Kirim ke Server
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            PDF Password Protector &amp; Remover
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Beri proteksi kata sandi enkripsi militer AES-256 pada PDF rahasia, atau hapus pembatasan password PDF secara permanen di browser.
          </p>
        </div>

        {/* Tab Pilihan Fitur */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('protect')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'protect'
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                : 'bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Kunci PDF (Beri Password)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unlock')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'unlock'
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                : 'bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Unlock className="w-4 h-4" />
            <span>Buka PDF (Hapus Password)</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: KUNCI PDF (PROTECT)                                */}
        {/* ======================================================== */}
        {activeTab === 'protect' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                Enkripsi Dokumen PDF dengan Kata Sandi
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dokumen akan dienkripsi dengan standar AES-256. Tidak ada yang bisa membuka isi berkas tanpa password ini.
              </p>
            </div>

            {/* Input Dropzone Berkas */}
            <div>
              <input
                ref={protectInputRef}
                type="file"
                id="protectPdfInput"
                accept="application/pdf,.pdf"
                onChange={handleProtectFileChange}
                className="hidden"
              />
              {!protectFile ? (
                <label
                  htmlFor="protectPdfInput"
                  className="block p-8 border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl text-center cursor-pointer transition bg-indigo-50/20"
                >
                  <FileUp className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">Pilih Berkas PDF yang Ingin Dikunci</p>
                  <p className="text-xs text-slate-500 mt-1">Klik untuk memilih atau tarik berkas ke kotak ini</p>
                </label>
              ) : (
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-indigo-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                        {protectFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500">{formatBytes(protectFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProtectFile(null);
                      setProtectStatus({ type: 'idle' });
                    }}
                    className="text-xs font-bold text-red-600 hover:text-red-700 bg-white px-2.5 py-1.5 rounded-lg border border-red-200 cursor-pointer"
                  >
                    Ganti
                  </button>
                </div>
              )}
            </div>

            {/* Form Password */}
            {protectFile && (
              <form onSubmit={handleEncryptPdf} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kata Sandi Baru (Password):</label>
                    <div className="relative">
                      <input
                        type={showProtectPassword ? 'text' : 'password'}
                        value={protectPassword}
                        onChange={(e) => setProtectPassword(e.target.value)}
                        placeholder="Masukkan password kuat..."
                        required
                        className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowProtectPassword(!showProtectPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showProtectPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ulangi Kata Sandi (Konfirmasi):</label>
                    <input
                      type={showProtectPassword ? 'text' : 'password'}
                      value={protectConfirmPassword}
                      onChange={(e) => setProtectConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang password di atas..."
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-600">Standar Enkripsi:</span>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="encAlg"
                      value="AES-256"
                      checked={protectAlgorithm === 'AES-256'}
                      onChange={() => setProtectAlgorithm('AES-256')}
                      className="text-indigo-600"
                    />
                    <span className="font-bold text-slate-800">AES-256 (Maksimal / Standar Perbankan)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="encAlg"
                      value="RC4"
                      checked={protectAlgorithm === 'RC4'}
                      onChange={() => setProtectAlgorithm('RC4')}
                      className="text-indigo-600"
                    />
                    <span className="text-slate-700">RC4 128-bit (Kompatibilitas Luas)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isProtecting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProtecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sedang Mengenkripsi Dokumen...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Kunci Dokumen PDF Sekarang 🔒</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Pesan Status & Tombol Unduh */}
            {protectStatus.type === 'error' && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{protectStatus.message}</span>
              </div>
            )}

            {protectStatus.type === 'success' && (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-3">
                <div className="flex items-start gap-2.5 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-emerald-900 mb-0.5">Enkripsi Berhasil!</p>
                    <p className="leading-relaxed">{protectStatus.message}</p>
                  </div>
                </div>

                {protectStatus.downloadUrl && (
                  <a
                    href={protectStatus.downloadUrl}
                    download={protectStatus.fileName || 'Dokumen_Terkunci.pdf'}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh PDF Terkunci ({protectStatus.fileName})</span>
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: BUKA PDF (UNLOCK)                                  */}
        {/* ======================================================== */}
        {activeTab === 'unlock' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Unlock className="w-4 h-4 text-emerald-600" />
                Hapus Password &amp; Pembatasan PDF
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Masukkan password dokumen yang benar sekali saja untuk mengunduh versi PDF yang bebas sandi dan dapat dibuka tanpa prompt password lagi.
              </p>
            </div>

            {/* Input Dropzone Berkas */}
            <div>
              <input
                ref={unlockInputRef}
                type="file"
                id="unlockPdfInput"
                accept="application/pdf,.pdf"
                onChange={handleUnlockFileChange}
                className="hidden"
              />
              {!unlockFile ? (
                <label
                  htmlFor="unlockPdfInput"
                  className="block p-8 border-2 border-dashed border-emerald-200 hover:border-emerald-500 rounded-2xl text-center cursor-pointer transition bg-emerald-50/20"
                >
                  <KeyRound className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">Pilih Berkas PDF yang Terkunci</p>
                  <p className="text-xs text-slate-500 mt-1">Klik untuk memilih atau tarik berkas PDF ke kotak ini</p>
                </label>
              ) : (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                        {unlockFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500">{formatBytes(unlockFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUnlockFile(null);
                      setUnlockStatus({ type: 'idle' });
                    }}
                    className="text-xs font-bold text-red-600 hover:text-red-700 bg-white px-2.5 py-1.5 rounded-lg border border-red-200 cursor-pointer"
                  >
                    Ganti
                  </button>
                </div>
              )}
            </div>

            {/* Form Masukkan Password */}
            {unlockFile && (
              <form onSubmit={handleDecryptPdf} className="space-y-4 pt-2">
                <div className="text-xs">
                  <label className="block font-bold text-slate-700 mb-1">
                    Masukkan Kata Sandi (Password) PDF Saat Ini:
                  </label>
                  <div className="relative">
                    <input
                      type={showUnlockPassword ? 'text' : 'password'}
                      value={unlockPassword}
                      onChange={(e) => setUnlockPassword(e.target.value)}
                      placeholder="Ketik password pembuka dokumen..."
                      required
                      className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUnlockPassword(!showUnlockPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showUnlockPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUnlocking}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isUnlocking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sedang Membuka &amp; Mendekripsi PDF...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>Buka &amp; Hapus Password PDF 🔓</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Pesan Status & Tombol Unduh */}
            {unlockStatus.type === 'error' && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{unlockStatus.message}</span>
              </div>
            )}

            {unlockStatus.type === 'success' && (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-3">
                <div className="flex items-start gap-2.5 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-emerald-900 mb-0.5">Password Berhasil Dihapus!</p>
                    <p className="leading-relaxed">{unlockStatus.message}</p>
                  </div>
                </div>

                {unlockStatus.downloadUrl && (
                  <a
                    href={unlockStatus.downloadUrl}
                    download={unlockStatus.fileName || 'Dokumen_BebasPassword.pdf'}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh PDF Bebas Sandi ({unlockStatus.fileName})</span>
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Jaminan Privasi */}
        <div className="mt-6 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 text-xs text-indigo-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <b>100% Client-Side Processing</b>: Seluruh proses kriptografi, hashing, serta pembongkaran sandi PDF berjalan langsung di browser perangkat Anda menggunakan Web Cryptography API. Berkas PDF Anda tidak pernah dikirim atau disimpan di server mana pun.
          </p>
        </div>

        {/* Editorial Section: Panduan, FAQ, AdSense & Hub-Spoke Links */}
        <div className="mt-8">
          <ToolEditorialSection toolId="pdf-password" />
        </div>
      </section>

      <Footer />
    </main>
  );
}

