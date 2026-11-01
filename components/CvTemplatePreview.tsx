'use client';

import React, { useMemo } from 'react';
import { Printer, Copy, Check, Sparkles, FileText, Briefcase, Award } from 'lucide-react';

export type CvTemplateType = 'ats' | 'professional' | 'minimalist';

interface CvTemplatePreviewProps {
  cvText: string;
  template: CvTemplateType;
  onTemplateChange: (template: CvTemplateType) => void;
  onLoadSample?: () => void;
}

interface ParsedCvSection {
  title: string;
  items: string[];
}

interface ParsedCv {
  fullName: string;
  contactLine: string;
  summary: string;
  sections: ParsedCvSection[];
}

/**
 * Heuristic parser untuk memecah teks bebas CV menjadi struktur yang rapi
 */
function parseCvContent(rawText: string): ParsedCv {
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

  // Deteksi nama dan kontak di 1-3 baris pertama jika bukan judul section
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

export default function CvTemplatePreview({
  cvText,
  template,
  onTemplateChange,
  onLoadSample
}: CvTemplatePreviewProps) {
  const [copied, setCopied] = React.useState(false);

  const parsed = useMemo(() => parseCvContent(cvText), [cvText]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      {/* Template Selector Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Pilihan Tata Letak Template CV (Live Preview)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pilih gaya tampilan dokumen CV Anda. Pratinjau langsung diperbarui secara dinamis di bawah.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Cetak langsung atau simpan sebagai file PDF via dialog browser"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>

        {/* Option Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
              {/* HEADER */}
          {template === 'ats' && (
            <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
              <h1 className="text-xl sm:text-2xl font-bold tracking-wider uppercase text-slate-950 mb-1">
                {parsed.fullName}
              </h1>
              {parsed.contactLine && (
                <p className="text-[11px] text-slate-700 tracking-wide">{parsed.contactLine}</p>
              )}
            </div>
          )}

          {template === 'professional' && (
            <div className="border-b border-indigo-100 pb-4 mb-5">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-black text-indigo-950 tracking-tight mb-0.5">
                    {parsed.fullName}
                  </h1>
                  <span className="text-xs font-semibold text-indigo-700 uppercase tracking-widest">
                    Curriculum Vitae
                  </span>
                </div>
                {parsed.contactLine && (
                  <p className="text-[11px] text-slate-600 font-medium sm:text-right max-w-xs">
                    {parsed.contactLine}
                  </p>
                )}
              </div>
            </div>
          )}

          {template === 'minimalist' && (
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h1 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight mb-1">
                {parsed.fullName}
              </h1>
              {parsed.contactLine && (
                <p className="text-xs text-slate-500 font-normal">{parsed.contactLine}</p>
              )}
            </div>
          )}

          {/* SUMMARY */}
          {parsed.summary && (
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
                className={`leading-relaxed ${
                  template === 'ats'
                    ? 'text-slate-800'
                    : template === 'professional'
                    ? 'text-slate-700 text-[11.5px]'
                    : 'text-slate-600 text-[12px]'
                }`}
              >
                {parsed.summary}
              </p>
            </div>
          )}

          {/* SECTIONS */}
          <div className="space-y-4">
            {parsed.sections.map((section, sIdx) => {
              const isSkillsSection =
                section.title.toUpperCase().includes('KEAHLIAN') ||
                section.title.toUpperCase().includes('SKILL');

              return (
                <div key={sIdx} className="space-y-1.5">
                  {/* Section Title */}
                  {template === 'ats' && (
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-400 pb-0.5">
                      {section.title}
                    </h2>
                  )}

                  {template === 'professional' && (
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950 border-l-3 border-indigo-600 pl-2">
                      {section.title}
                    </h2>
                  )}

                  {template === 'minimalist' && (
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {section.title}
                    </h2>
                  )}

                  {/* Section Content Items */}
                  {isSkillsSection && template === 'minimalist' ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {section.items.map((it, itIdx) => (
                        <span
                          key={itIdx}
                          className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
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
                            <div key={itIdx} className="flex items-start gap-2 pl-2">
                              <span
                                className={`text-[11px] ${
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
                                className={`leading-relaxed flex-1 ${
                                  template === 'ats'
                                    ? 'text-slate-800'
                                    : template === 'professional'
                                    ? 'text-slate-700 text-[11.5px]'
                                    : 'text-slate-600'
                                }`}
                              >
                                {cleanText}
                              </p>
                            </div>
                          );
                        }

                        // Judul Pengalaman / Pekerjaan atau Subheading
                        const isLikelyJobTitle = item.includes('|') || item.includes('(') || itIdx === 0;

                        return (
                          <p
                            key={itIdx}
                            className={`leading-relaxed ${
                              isLikelyJobTitle
                                ? template === 'ats'
                                  ? 'font-bold text-slate-900 pt-1'
                                  : template === 'professional'
                                  ? 'font-bold text-slate-950 text-xs pt-1.5'
                                  : 'font-medium text-slate-900 pt-1'
                                : template === 'ats'
                                ? 'text-slate-700'
                                : 'text-slate-600'
                            }`}
                          >
                            {item}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
            padding: 20mm !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
