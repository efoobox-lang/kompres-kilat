'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Printer,
  Copy,
  Check,
  Sparkles,
  FileText,
  Briefcase,
  Award,
  Download,
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit3,
  Eye,
  Plus,
  RefreshCw,
  X,
  FileCode,
  CheckCircle2
} from 'lucide-react';
import { generateCvDocxBlob } from '@/lib/docx-generator';

export type CvTemplateType = 'ats' | 'professional' | 'minimalist';

export interface CvTemplatePreviewProps {
  cvText: string;
  onCvTextChange?: (newText: string) => void;
  template: CvTemplateType;
  onTemplateChange: (template: CvTemplateType) => void;
  onLoadSample?: () => void;
  initialPhotoUrl?: string;
  onPhotoChange?: (photoUrl: string) => void;
}

export interface ParsedCvSection {
  title: string;
  items: string[];
}

export interface ParsedCv {
  fullName: string;
  contactLine: string;
  summary: string;
  sections: ParsedCvSection[];
}

/**
 * Heuristic parser untuk memecah teks bebas CV menjadi struktur yang rapi
 */
export function parseCvContent(rawText: string): ParsedCv {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { fullName: '', contactLine: '', summary: '', sections: [] };
  }

  const fullName = lines[0] || 'Nama Lengkap Anda';
  let contactLine = '';
  let summary = '';
  const sections: ParsedCvSection[] = [];

  const sectionKeywords = [
    'RINGKASAN',
    'SUMMARY',
    'TENTANG SAYA',
    'ABOUT ME',
    'PROFIL',
    'PROFILE',
    'PENGALAMAN KERJA',
    'PENGALAMAN',
    'EXPERIENCE',
    'WORK EXPERIENCE',
    'RIWAYAT PEKERJAAN',
    'PENDIDIKAN',
    'EDUCATION',
    'KEAHLIAN',
    'SKILLS',
    'KEMAMPUAN',
    'SERTIFIKASI',
    'CERTIFICATIONS',
    'PROJECT',
    'PROYEK',
    'ORGANISASI',
    'PENGHARGAAN',
    'AWARDS',
    'BAHASA',
    'LANGUAGES'
  ];

  let currentSection: ParsedCvSection | null = null;
  let lineIdx = 0;

  // Deteksi nama dan kontak di baris-baris pertama jika bukan judul section
  if (lines.length > 1 && !sectionKeywords.some((k) => lines[1].toUpperCase().includes(k))) {
    contactLine = lines[1];
    lineIdx = 2;
  } else {
    lineIdx = 1;
  }

  for (; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const upper = line.toUpperCase().replace(/[:#-]/g, '').trim();

    const isHeader = sectionKeywords.some(
      (keyword) => upper === keyword || upper.startsWith(keyword + ' ') || upper.endsWith(' ' + keyword)
    );

    if (isHeader) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line.replace(/^[#*-]\s*/, '').replace(/:$/, ''),
        items: []
      };
    } else {
      if (currentSection) {
        currentSection.items.push(line);
      } else {
        summary += (summary ? ' ' : '') + line;
      }
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return { fullName, contactLine, summary, sections };
}

/**
 * Mengonversi kembali struktur ParsedCv menjadi teks format baris untuk sinkronisasi state
 */
export function serializeCvToText(parsed: ParsedCv): string {
  const lines: string[] = [];
  if (parsed.fullName) lines.push(parsed.fullName.trim());
  if (parsed.contactLine) lines.push(parsed.contactLine.trim());
  if (parsed.summary) {
    lines.push('');
    lines.push('RINGKASAN PROFESIONAL');
    lines.push(parsed.summary.trim());
  }
  for (const s of parsed.sections) {
    if (s.title) {
      lines.push('');
      lines.push(s.title.trim().toUpperCase());
      for (const it of s.items) {
        if (it && it.trim()) {
          lines.push(it.trim());
        }
      }
    }
  }
  return lines.join('\n');
}

export default function CvTemplatePreview({
  cvText,
  onCvTextChange,
  template,
  onTemplateChange,
  onLoadSample,
  initialPhotoUrl = '',
  onPhotoChange
}: CvTemplatePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showRawEditor, setShowRawEditor] = useState<boolean>(false);
  const [rawTextDraft, setRawTextDraft] = useState<string>(cvText);

  // Foto Profil / Pasfoto
  const [photoUrl, setPhotoUrl] = useState<string>(initialPhotoUrl);
  const [showPhoto, setShowPhoto] = useState<boolean>(true);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Status Ekspor Word (.docx)
  const [isGeneratingDocx, setIsGeneratingDocx] = useState<boolean>(false);
  const [docxSuccess, setDocxSuccess] = useState<boolean>(false);

  // Sinkronisasi draft teks lokal dengan prop cvText
  useEffect(() => {
    setRawTextDraft(cvText);
  }, [cvText]);

  useEffect(() => {
    if (initialPhotoUrl && initialPhotoUrl !== photoUrl) {
      setPhotoUrl(initialPhotoUrl);
    }
  }, [initialPhotoUrl]);

  // Data parsed lokal untuk manipulasi langsung
  const parsed = useMemo(() => parseCvContent(cvText), [cvText]);

  // Helper untuk update state teks CV
  const updateParsedField = (updater: (prev: ParsedCv) => ParsedCv) => {
    const updated = updater(parsed);
    const newText = serializeCvToText(updated);
    if (onCvTextChange) {
      onCvTextChange(newText);
    }
  };

  // Handler cetak browser (PDF)
  const handlePrint = () => {
    window.print();
  };

  // Handler salin seluruh teks
  const handleCopy = () => {
    navigator.clipboard.writeText(cvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handler unggah foto profil (100% Client-Side FileReader)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih berkas foto berupa gambar (JPG, PNG, atau WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        setPhotoUrl(dataUrl);
        setShowPhoto(true);
        if (onPhotoChange) {
          onPhotoChange(dataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
    // Reset file input agar bisa upload file yang sama jika dibutuhkan
    e.target.value = '';
  };

  // Hapus foto profil
  const handleRemovePhoto = () => {
    setPhotoUrl('');
    if (onPhotoChange) {
      onPhotoChange('');
    }
  };

  // Handler unduh dokumen Microsoft Word (.docx) asli OpenXML
  const handleDownloadDocx = async () => {
    if (!cvText.trim()) {
      alert('Teks CV masih kosong. Harap isi atau muat contoh teks CV terlebih dahulu.');
      return;
    }

    setIsGeneratingDocx(true);
    try {
      const docxBlob = await generateCvDocxBlob({
        fullName: parsed.fullName || 'Nama Pelamar',
        contactLine: parsed.contactLine,
        summary: parsed.summary,
        sections: parsed.sections,
        photoBase64: photoUrl && showPhoto ? photoUrl : undefined,
        template
      });

      const url = URL.createObjectURL(docxBlob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = (parsed.fullName || 'Resume_Pelamar')
        .replace(/[^a-zA-Z0-9_\u00C0-\u024F]+/g, '_')
        .replace(/(^_|_$)/g, '');
      a.download = `CV_${cleanName || 'KompresKilat'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDocxSuccess(true);
      setTimeout(() => setDocxSuccess(false), 3000);
    } catch (err) {
      console.error('Gagal membuat file Word (.docx):', err);
      alert('Terjadi kendala saat merakit dokumen Word. Silakan coba kembali.');
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  // Handler simpan editor teks cepat
  const handleSaveRawText = () => {
    if (onCvTextChange) {
      onCvTextChange(rawTextDraft);
    }
    setShowRawEditor(false);
  };

  // Handler aksi tambah poin item di section
  const handleAddSectionItem = (sectionIdx: number) => {
    updateParsedField((prev) => {
      const newSections = [...prev.sections];
      const targetSec = { ...newSections[sectionIdx] };
      targetSec.items = [...targetSec.items, '- Tulis pencapaian, tanggung jawab, atau detail pekerjaan baru di sini...'];
      newSections[sectionIdx] = targetSec;
      return { ...prev, sections: newSections };
    });
  };

  // Handler hapus butir poin
  const handleRemoveSectionItem = (sectionIdx: number, itemIdx: number) => {
    updateParsedField((prev) => {
      const newSections = [...prev.sections];
      const targetSec = { ...newSections[sectionIdx] };
      targetSec.items = targetSec.items.filter((_, idx) => idx !== itemIdx);
      newSections[sectionIdx] = targetSec;
      return { ...prev, sections: newSections };
    });
  };

  // Handler tambah bagian (section) baru
  const handleAddSection = () => {
    updateParsedField((prev) => {
      return {
        ...prev,
        sections: [
          ...prev.sections,
          {
            title: 'BAGIAN BARU (PENGALAMAN / SERTIFIKASI)',
            items: ['- Nama Posisi / Proyek | Nama Instansi (2024)', '- Deskripsi pencapaian atau kualifikasi yang relevan']
          }
        ]
      };
    });
  };

  const templateOptions = [
    {
      id: 'ats' as CvTemplateType,
      title: 'ATS Standard',
      desc: 'Single-column lurus & tanpa grafik, 100% terbaca sistem scanner',
      icon: FileText,
      badge: 'Skor ATS Tertinggi'
    },
    {
      id: 'professional' as CvTemplateType,
      title: 'Professional Formal',
      desc: 'Aksen korporat tegas untuk BUMN, perbankan & posisi eksekutif',
      icon: Briefcase,
      badge: 'Rekomendasi BUMN'
    },
    {
      id: 'minimalist' as CvTemplateType,
      title: 'Minimalist Clean',
      desc: 'Tipografi modern & estetik untuk startup, tech, dan industri kreatif',
      icon: Sparkles,
      badge: 'Modern & Estetik'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Template Selector & Action Command Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Baris Atas: Judul & Tombol Aksi Utama */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Pilihan Tata Letak Template CV (Live Preview & Editor)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ubah tampilan template, edit teks langsung di lembar kerja, lampirkan foto formal, lalu unduh dalam format Word (.docx) atau cetak ke PDF.
            </p>
          </div>

          {/* Action Buttons Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tombol Unduh File Word (.docx) */}
            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={isGeneratingDocx || !cvText.trim()}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Unduh dokumen CV sebagai file Microsoft Word (.docx) asli yang dapat diedit bebas"
            >
              {isGeneratingDocx ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingDocx ? 'Menyiapkan Word...' : 'Unduh File Word (.docx)'}</span>
            </button>

            {/* Tombol Cetak / Simpan PDF */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={!cvText.trim()}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm disabled:opacity-50"
              title="Cetak langsung atau simpan sebagai file PDF via dialog browser"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>

            {/* Toggle Mode Edit Langsung Text */}
            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                isEditMode
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
              title="Aktifkan mode edit teks langsung di atas kertas CV"
            >
              {isEditMode ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isEditMode ? 'Selesai Edit' : 'Edit Langsung Teks'}</span>
            </button>

            {/* Tombol Salin Teks */}
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Salin seluruh teks CV ke clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>

        {/* Notifikasi Download Word Berhasil */}
        {docxSuccess && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              Dokumen Microsoft Word (.docx) berhasil diunduh! File kompatibel 100% dengan Microsoft Word, Google Docs, Apple Pages, dan WPS Office.
            </span>
          </div>
        )}

        {/* Baris Kontrol Fitur: Opsi Pasfoto & Mode Editor Cepat */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Bagian Unggah Pasfoto Lamaran */}
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="file"
              ref={photoInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />

            {!photoUrl ? (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/60 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>+ Unggah Pasfoto Lamaran (Opsional)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <img
                  src={photoUrl}
                  alt="Pasfoto Terpasang"
                  className="w-6 h-6 rounded-md object-cover border border-slate-300"
                />
                <span className="font-medium text-slate-700">Pasfoto Terlampir</span>
                <label className="flex items-center gap-1 ml-1 cursor-pointer text-[11px] text-slate-600">
                  <input
                    type="checkbox"
                    checked={showPhoto}
                    onChange={(e) => setShowPhoto(e.target.checked)}
                    className="rounded text-indigo-600 cursor-pointer"
                  />
                  <span>Tampilkan</span>
                </label>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="p-1 text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                  title="Ganti Foto"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  title="Hapus Foto"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}

            <span className="text-[11px] text-slate-400 hidden sm:inline">
              (100% diproses di browser tanpa upload ke server)
            </span>
          </div>

          {/* Tombol Panel Teks Cepat */}
          <button
            type="button"
            onClick={() => setShowRawEditor(!showRawEditor)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{showRawEditor ? 'Tutup Panel Teks' : 'Buka Editor Teks Lengkap'}</span>
          </button>
        </div>

        {/* Drawer / Panel Editor Teks Cepat (Bila Dibuka) */}
        {showRawEditor && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs text-slate-800">
                Edit Teks Mentah CV (Perubahan langsung memperbarui seluruh template):
              </label>
              <button
                type="button"
                onClick={() => setShowRawEditor(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={8}
              value={rawTextDraft}
              onChange={(e) => setRawTextDraft(e.target.value)}
              className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed"
              placeholder="Tempel atau ketik teks CV Anda di sini..."
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRawEditor(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRawText}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                Terapkan Perubahan ⚡
              </button>
            </div>
          </div>
        )}

        {/* 3 Option Tabs (ATS, Professional, Minimalist) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {templateOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = template === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onTemplateChange(opt.id)}
                className={`text-left p-3 rounded-xl border transition-all duration-150 cursor-pointer relative ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span>{opt.title}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {opt.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Banner Indikator Mode Edit Langsung */}
      {isEditMode && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Mode Edit Langsung Aktif:</strong> Klik teks apa pun (nama, kontak, profil, judul, dan butir isi) pada lembar CV di bawah untuk mengetik langsung.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditMode(false)}
            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold cursor-pointer shrink-0 ml-2"
          >
            Selesai
          </button>
        </div>
      )}

      {/* Live Preview Paper Canvas Container */}
      <div className="bg-slate-200/70 p-3 sm:p-6 rounded-2xl border border-slate-300/80 overflow-x-auto shadow-inner">
        <div
          id="cv-printable-area"
          className={`mx-auto bg-white shadow-lg transition-all duration-200 max-w-2xl min-h-[500px] text-slate-800 ${
            template === 'ats'
              ? 'p-8 font-sans text-xs border border-slate-300'
              : template === 'professional'
              ? 'p-8 sm:p-10 font-sans text-xs border-t-8 border-indigo-900 shadow-md'
              : 'p-8 sm:p-10 font-sans text-xs rounded-lg'
          }`}
        >
          {!cvText.trim() ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">Teks CV Masih Kosong</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tempel teks CV Anda atau klik tombol di bawah untuk memuat contoh teks CV siap pakai untuk pratinjau layout.
              </p>
              {onLoadSample && (
                <button
                  type="button"
                  onClick={onLoadSample}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs transition"
                >
                  Muat Contoh Teks CV ⚡
                </button>
              )}
            </div>
          ) : (
            <>
              {/* ==================== 1. HEADER (NAMA, KONTAK & PASFOTO) ==================== */}

              {/* Layout ATS: Single-Column Standar dengan Opsi Pasfoto di Sisi Kanan Header */}
              {template === 'ats' && (
                <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <h1
                      contentEditable={isEditMode}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const val = e.currentTarget.innerText.trim();
                        updateParsedField((prev) => ({ ...prev, fullName: val }));
                      }}
                      className={`text-xl sm:text-2xl font-bold tracking-wider uppercase text-slate-950 mb-1 ${
                        isEditMode ? 'outline-dashed outline-1 outline-amber-400 focus:outline-indigo-600 rounded px-1' : ''
                      }`}
                    >
                      {parsed.fullName}
                    </h1>
                    {parsed.contactLine && (
                      <p
                        contentEditable={isEditMode}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const val = e.currentTarget.innerText.trim();
                          updateParsedField((prev) => ({ ...prev, contactLine: val }));
                        }}
                        className={`text-[11px] text-slate-700 tracking-wide ${
                          isEditMode ? 'outline-dashed outline-1 outline-amber-400 focus:outline-indigo-600 rounded px-1' : ''
                        }`}
                      >
                        {parsed.contactLine}
                      </p>
                    )}
                  </div>

                  {photoUrl && showPhoto && (
                    <div className="relative group shrink-0">
                      <img
                        src={photoUrl}
                        alt={`Pasfoto ${parsed.fullName}`}
                        className="w-20 h-26 sm:w-22 sm:h-28 object-cover rounded-xs border border-slate-400 bg-slate-50 shadow-xs"
                      />
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="absolute inset-0 bg-black/50 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-xs cursor-pointer"
                        >
                          Ganti
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Layout Professional Formal: Header Korporat Tegas */}
              {template === 'professional' && (
                <div className="border-b border-indigo-100 pb-4 mb-5">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                    {photoUrl && showPhoto && (
                      <div className="relative group shrink-0">
                        <img
                          src={photoUrl}
                          alt={`Pasfoto ${parsed.fullName}`}
                          className="w-22 h-28 sm:w-24 sm:h-32 object-cover rounded-lg border-2 border-indigo-900 shadow-sm"
                        />
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            className="absolute inset-0 bg-black/50 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg cursor-pointer"
                          >
                            Ganti
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex-1 text-center sm:text-left">
                      <h1
                        contentEditable={isEditMode}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const val = e.currentTarget.innerText.trim();
                          updateParsedField((prev) => ({ ...prev, fullName: val }));
                        }}
                        className={`text-2xl font-black text-indigo-950 tracking-tight mb-0.5 ${
                          isEditMode ? 'outline-dashed outline-1 outline-amber-400 focus:outline-indigo-600 rounded px-1' : ''
                        }`}
                      >
                        {parsed.fullName}
                      </h1>
                      <span className="text-xs font-semibold text-indigo-700 uppercase tracking-widest block mb-1">
                        Curriculum Vitae
                      </span>
                      {parsed.contactLine && (
                        <p
                          contentEditable={isEditMode}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const val = e.currentTarget.innerText.trim();
                            updateParsedField((prev) => ({ ...prev, contactLine: val }));
                          }}
                          className={`text-[11px] text-slate-600 font-medium ${
                            isEditMode ? 'outline-dashed outline-1 outline-amber-400 focus:outline-indigo-600 rounded px-1' : ''
                          }`}
                        >
                          {parsed.contactLine}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Layout Minimalist Clean: Modern & Estetik */}
              {template === 'minimalist' && (
                <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h1
                      contentEditable={isEditMode}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const val = e.currentTarget.innerText.trim();
                        updateParsedField((prev) => ({ ...prev, fullName: val }));
                      }}
                      className={`text-2xl sm:text-3xl font-light text-slate-900 tracking-tight mb-1 ${
                        isEditMode ? 'outline-dashed outline-1 outline-amber-400 focus:outline-indigo-600 rounded px-1' : ''
                      }`}
                    >
                      {parsed.fullName}
                    </h1>
                    {parsed.contactLine && (
                      <p
                        contentEditable={isEditMode}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const val = e.currentTarget.innerText.trim();
                          updateParsedField((prev) => ({ ...prev, contactLine: val }));
                        }}
                        className={`text-xs text-slate-500 font-normal ${
                          isEditMode ? 'outline-dashed outline-1 outline-amber-400 focus:outline-indigo-600 rounded px-1' : ''
                        }`}
                      >
                        {parsed.contactLine}
                      </p>
                    )}
                  </div>

                  {photoUrl && showPhoto && (
                    <div className="relative group shrink-0">
                      <img
                        src={photoUrl}
                        alt={`Pasfoto ${parsed.fullName}`}
                        className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-slate-200 shadow-xs"
                      />
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="absolute inset-0 bg-black/50 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-full cursor-pointer"
                        >
                          Ganti
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ==================== 2. SUMMARY / TENTANG SAYA ==================== */}
              {(parsed.summary || isEditMode) && (
                <div className="mb-4">
                  {template === 'ats' && (
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-400 pb-0.5 mb-1.5">
                      RINGKASAN PROFESIONAL
                    </h2>
                  )}
                  {template === 'professional' && (
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950 border-l-3 border-indigo-600 pl-2 mb-2">
                      Profil Singkat
                    </h2>
                  )}
                  {template === 'minimalist' && (
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Tentang Saya
                    </h2>
                  )}
                  <p
                    contentEditable={isEditMode}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const val = e.currentTarget.innerText.trim();
                      updateParsedField((prev) => ({ ...prev, summary: val }));
                    }}
                    className={`leading-relaxed ${
                      template === 'ats'
                        ? 'text-slate-800'
                        : template === 'professional'
                        ? 'text-slate-700 text-[11.5px]'
                        : 'text-slate-600 text-[12px]'
                    } ${isEditMode ? 'outline-dashed outline-1 outline-amber-400 focus:outline-indigo-600 rounded px-1' : ''}`}
                  >
                    {parsed.summary || (isEditMode ? 'Tuliskan ringkasan profesional atau profil singkat Anda di sini...' : '')}
                  </p>
                </div>
              )}

              {/* ==================== 3. BAGIAN-BAGIAN CV (SECTIONS) ==================== */}
              <div className="space-y-4">
                {parsed.sections.map((section, sIdx) => {
                  const isSkillsSection =
                    section.title.toUpperCase().includes('KEAHLIAN') ||
                    section.title.toUpperCase().includes('SKILL');

                  return (
                    <div key={sIdx} className="space-y-1.5 group/sec">
                      {/* Judul Bagian / Section Title */}
                      <div className="flex items-center justify-between">
                        {template === 'ats' && (
                          <h2
                            contentEditable={isEditMode}
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const val = e.currentTarget.innerText.trim();
                              updateParsedField((prev) => {
                                const newSecs = [...prev.sections];
                                newSecs[sIdx] = { ...newSecs[sIdx], title: val };
                                return { ...prev, sections: newSecs };
                              });
                            }}
                            className={`text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-400 pb-0.5 flex-1 ${
                              isEditMode ? 'outline-dashed outline-1 outline-amber-400 focus:outline-indigo-600 rounded px-1' : ''
                            }`}
                          >
                            {section.title}
                          </h2>
                        )}

                        {template === 'professional' && (
                          <h2
                            contentEditable={isEditMode}
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const val = e.currentTarget.innerText.trim();
                              updateParsedField((prev) => {
                                const newSecs = [...prev.sections];
                                newSecs[sIdx] = { ...newSecs[sIdx], title: val };
                                return { ...prev, sections: newSecs };
                              });
                            }}
                            className={`text-xs font-extrabold uppercase tracking-wider text-indigo-950 border-l-3 border-indigo-600 pl-2 flex-1 ${
                              isEditMode ? 'outline-dashed outline-1 outline-amber-400 focus:outline-indigo-600 rounded px-1' : ''
                            }`}
                          >
                            {section.title}
                          </h2>
                        )}

                        {template === 'minimalist' && (
                          <h2
                            contentEditable={isEditMode}
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const val = e.currentTarget.innerText.trim();
                              updateParsedField((prev) => {
                                const newSecs = [...prev.sections];
                                newSecs[sIdx] = { ...newSecs[sIdx], title: val };
                                return { ...prev, sections: newSecs };
                              });
                            }}
                            className={`text-xs font-semibold uppercase tracking-wider text-slate-400 flex-1 ${
                              isEditMode ? 'outline-dashed outline-1 outline-amber-400 focus:outline-indigo-600 rounded px-1' : ''
                            }`}
                          >
                            {section.title}
                          </h2>
                        )}
                      </div>

                      {/* Konten Butir-Butir Section */}
                      {isSkillsSection && template === 'minimalist' ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {section.items.map((it, itIdx) => (
                            <span
                              key={itIdx}
                              contentEditable={isEditMode}
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                const val = e.currentTarget.innerText.trim();
                                updateParsedField((prev) => {
                                  const newSecs = [...prev.sections];
                                  const targetSec = { ...newSecs[sIdx] };
                                  targetSec.items[itIdx] = val;
                                  newSecs[sIdx] = targetSec;
                                  return { ...prev, sections: newSecs };
                                });
                              }}
                              className={`px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium ${
                                isEditMode ? 'outline-dashed outline-1 outline-amber-400 rounded' : ''
                              }`}
                            >
                              {it.replace(/^[-•*]\s*/, '')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {section.items.map((item, itIdx) => {
                            const isBullet = item.startsWith('-') || item.startsWith('•') || item.startsWith('*');
                            const cleanText = item.replace(/^[-•*]\s*/, '');

                            if (isBullet) {
                              return (
                                <div key={itIdx} className="flex items-start gap-2 pl-2 group/item">
                                  <span
                                    className={`text-[11px] select-none ${
                                      template === 'ats'
                                        ? 'text-slate-900 font-bold'
                                        : template === 'professional'
                                        ? 'text-indigo-600 font-bold'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    •
                                  </span>
                                  <p
                                    contentEditable={isEditMode}
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                      const val = e.currentTarget.innerText.trim();
                                      updateParsedField((prev) => {
                                        const newSecs = [...prev.sections];
                                        const targetSec = { ...newSecs[sIdx] };
                                        targetSec.items[itIdx] = `- ${val}`;
                                        newSecs[sIdx] = targetSec;
                                        return { ...prev, sections: newSecs };
                                      });
                                    }}
                                    className={`leading-relaxed flex-1 ${
                                      template === 'ats'
                                        ? 'text-slate-800'
                                        : template === 'professional'
                                        ? 'text-slate-700 text-[11.5px]'
                                        : 'text-slate-600'
                                    } ${
                                      isEditMode
                                        ? 'outline-dashed outline-1 outline-amber-400 focus:outline-indigo-600 rounded px-1'
                                        : ''
                                    }`}
                                  >
                                    {cleanText}
                                  </p>

                                  {isEditMode && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSectionItem(sIdx, itIdx)}
                                      className="text-slate-400 hover:text-rose-600 opacity-0 group-hover/item:opacity-100 transition p-0.5 cursor-pointer"
                                      title="Hapus Butir Poin"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              );
                            }

                            // Judul Pengalaman / Pekerjaan atau Subheading
                            const isLikelyJobTitle = item.includes('|') || item.includes('(') || itIdx === 0;

                            return (
                              <div key={itIdx} className="flex items-start gap-2 group/item">
                                <p
                                  contentEditable={isEditMode}
                                  suppressContentEditableWarning
                                  onBlur={(e) => {
                                    const val = e.currentTarget.innerText.trim();
                                    updateParsedField((prev) => {
                                      const newSecs = [...prev.sections];
                                      const targetSec = { ...newSecs[sIdx] };
                                      targetSec.items[itIdx] = val;
                                      newSecs[sIdx] = targetSec;
                                      return { ...prev, sections: newSecs };
                                    });
                                  }}
                                  className={`leading-relaxed flex-1 ${
                                    isLikelyJobTitle
                                      ? template === 'ats'
                                        ? 'font-bold text-slate-900 pt-1'
                                        : template === 'professional'
                                        ? 'font-bold text-slate-950 text-xs pt-1.5'
                                        : 'font-medium text-slate-900 pt-1'
                                      : template === 'ats'
                                      ? 'text-slate-700'
                                      : 'text-slate-600'
                                  } ${
                                    isEditMode
                                      ? 'outline-dashed outline-1 outline-amber-400 focus:outline-indigo-600 rounded px-1'
                                      : ''
                                  }`}
                                >
                                  {item}
                                </p>

                                {isEditMode && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSectionItem(sIdx, itIdx)}
                                    className="text-slate-400 hover:text-rose-600 opacity-0 group-hover/item:opacity-100 transition p-0.5 cursor-pointer"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Tombol Tambah Poin Baru dalam Bagian Saat Mode Edit Aktif */}
                      {isEditMode && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => handleAddSectionItem(sIdx)}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer py-0.5"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Tambah Butir Poin di {section.title || 'Bagian Ini'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tombol Tambah Bagian Baru Saat Mode Edit Aktif */}
              {isEditMode && (
                <div className="pt-4 border-t border-slate-200 text-center">
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="px-4 py-2 rounded-xl border border-dashed border-indigo-400 bg-indigo-50/70 hover:bg-indigo-50 text-indigo-700 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Tambah Bagian (Section) Baru di CV</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Print CSS Stylesheet scoped */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #cv-printable-area,
          #cv-printable-area * {
            visibility: visible !important;
          }
          #cv-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 15mm 20mm !important;
            box-shadow: none !important;
            border: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
