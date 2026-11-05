'use client';

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  File as GenericFileIcon,
  X,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Trash2,
  ShieldCheck,
} from 'lucide-react';

export interface UniversalDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFormats?: string; // e.g. "image/*", ".pdf", ".pdf,.docx", "application/pdf"
  formatNotice?: string; // e.g. "Mendukung JPG, PNG, WEBP, PDF hingga 50MB"
  maxSizeMb?: number; // e.g. 50
  multiple?: boolean;
  selectedFiles?: File[];
  onClear?: () => void;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
  className?: string;
  showPrivacyBadge?: boolean;
  variant?: 'default' | 'compact';
}

// Format ukuran file bytes ke KB / MB yang ramah dibaca
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function UniversalDropzone({
  onFilesSelected,
  acceptedFormats,
  formatNotice,
  maxSizeMb = 50,
  multiple = false,
  selectedFiles: controlledFiles,
  onClear,
  title = 'Seret & jatuhkan berkas di sini',
  subtitle = 'atau klik untuk memilih dari perangkat Anda',
  disabled = false,
  className = '',
  showPrivacyBadge = true,
  variant = 'default',
}: UniversalDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sinkronisasi file terkontrol (jika dikirim dari parent) atau internal state
  const activeFiles = controlledFiles !== undefined ? controlledFiles : internalFiles;
  const hasFiles = activeFiles.length > 0;

  // Generate thumbnail URL untuk file gambar pertama secara derived
  const imagePreviewUrl = useMemo(() => {
    if (hasFiles && activeFiles[0].type.startsWith('image/')) {
      return URL.createObjectURL(activeFiles[0]);
    }
    return null;
  }, [hasFiles, activeFiles]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Validasi format dan ukuran file
  const validateAndProcessFiles = useCallback(
    (fileList: FileList | File[]) => {
      setErrorMessage(null);
      const rawFiles = Array.from(fileList);
      if (rawFiles.length === 0) return;

      const validFiles: File[] = [];
      const maxBytes = maxSizeMb * 1024 * 1024;

      for (const file of rawFiles) {
        // 1. Cek ukuran file
        if (file.size > maxBytes) {
          setErrorMessage(`Berkas "${file.name}" terlalu besar. Batas maksimum adalah ${maxSizeMb} MB.`);
          return;
        }

        // 2. Cek format ekstensi jika acceptedFormats didefinisikan
        if (acceptedFormats && acceptedFormats.trim() !== '') {
          const rules = acceptedFormats
            .split(',')
            .map((r) => r.trim().toLowerCase());
          const fileExt = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
          const fileMime = file.type.toLowerCase();

          const isMatch = rules.some((rule) => {
            if (rule === '*/*' || rule === '*') return true;
            if (rule.endsWith('/*')) {
              const baseMime = rule.replace('/*', '');
              return fileMime.startsWith(baseMime);
            }
            if (rule.startsWith('.')) {
              return fileExt === rule;
            }
            return fileMime === rule;
          });

          if (!isMatch) {
            setErrorMessage(`Format berkas "${file.name}" tidak didukung. Harap pilih format ${acceptedFormats}.`);
            return;
          }
        }

        validFiles.push(file);
        if (!multiple) break; // Hanya ambil 1 file jika multiple=false
      }

      if (validFiles.length > 0) {
        if (controlledFiles === undefined) {
          setInternalFiles(validFiles);
        }
        onFilesSelected(validFiles);
      }
    },
    [maxSizeMb, acceptedFormats, multiple, controlledFiles, onFilesSelected]
  );

  // Handle Event Drag & Drop
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Cegah flicker saat cursor berada di atas elemen anak
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFiles(e.dataTransfer.files);
    }
  };

  // Handle Klik Area Dropzone
  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFiles(e.target.files);
    }
    // Reset value agar event onchange tetap terpanggil jika memilih file yang sama
    e.target.value = '';
  };

  // Handle Hapus / Ganti Berkas
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setErrorMessage(null);
    if (controlledFiles === undefined) {
      setInternalFiles([]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onClear) {
      onClear();
    }
  };

  // Helper Ikon Berkas Berdasarkan Tipe File
  const renderFileIcon = (file: File) => {
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();

    if (type.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />;
    }
    if (name.endsWith('.pdf') || type === 'application/pdf') {
      return <FileText className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />;
    }
    if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
      return <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    }
    if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) {
      return <FileArchive className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />;
    }
    return <GenericFileIcon className="w-6 h-6 text-slate-500 shrink-0" />;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        multiple={multiple}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
        aria-label="Upload File"
      />

      {/* ---------------------------------------------------- */}
      {/* 1. TAMPILAN JIKA FILE SUDAH TERPILIH (FILE PREVIEW) */}
      {/* ---------------------------------------------------- */}
      {hasFiles ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {/* Thumbnail Gambar atau Ikon Berkas */}
              {imagePreviewUrl ? (
                <div className="relative w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shrink-0 shadow-2xs">
                  {renderFileIcon(activeFiles[0])}
                </div>
              )}

              {/* Rincian Nama & Ukuran File */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate max-w-[220px] sm:max-w-md">
                    {activeFiles[0].name}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/50">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Siap</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ukuran: <span className="font-semibold">{formatFileSize(activeFiles[0].size)}</span>
                  {activeFiles.length > 1 && (
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-1.5">
                      (+{activeFiles.length - 1} berkas lainnya)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Tombol Aksi: Ganti Berkas & Hapus */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleClick}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Ganti Berkas</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                title="Batalkan berkas"
                className="p-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ---------------------------------------------------- */
        /* 2. TAMPILAN KOTAK INTERAKTIF DRAG & DROP UTAMA */
        /* ---------------------------------------------------- */
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer select-none group outline-hidden ${
            variant === 'compact' ? 'p-6 sm:p-8 min-h-[160px]' : 'p-8 sm:p-12 min-h-[220px]'
          } ${
            isDragOver
              ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 ring-4 ring-indigo-500/15 scale-[1.01] shadow-lg'
              : 'border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 shadow-xs'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {/* Ikon Unggah Awan Beranimasi Lembut */}
          <div
            className={`rounded-2xl flex items-center justify-center transition-transform duration-200 mb-3.5 ${
              variant === 'compact' ? 'w-12 h-12' : 'w-16 h-16'
            } ${
              isDragOver
                ? 'bg-indigo-600 text-white scale-110 shadow-md'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60'
            }`}
          >
            <UploadCloud className={variant === 'compact' ? 'w-6 h-6' : 'w-8 h-8'} />
          </div>

          {/* Teks Judul & Panduan Interaktif */}
          <div className="space-y-1 max-w-md">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                Klik untuk memilih berkas
              </span>{' '}
              {subtitle.replace(/^atau klik untuk memilih /i, '')}
            </p>
          </div>

          {/* Badge Format & Maksimal Ukuran File */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {formatNotice ? (
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-slate-700/60">
                {formatNotice}
              </span>
            ) : acceptedFormats ? (
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-slate-700/60">
                Format: <strong className="text-slate-700 dark:text-slate-300 uppercase">{acceptedFormats}</strong> (Maks {maxSizeMb}MB)
              </span>
            ) : null}
          </div>
        </div>
      )}

      {/* Notifikasi Pesan Kesalahan Validasi */}
      {errorMessage && (
        <div className="mt-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Jaminan Privasi 100% Client-Side */}
      {showPrivacyBadge && (
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Privasi 100% Aman: Berkas diproses langsung di browser tanpa disimpan di server kami.</span>
        </div>
      )}
    </div>
  );
}

