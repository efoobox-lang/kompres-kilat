'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';

interface SlideData {
  slideNumber: number;
  title: string;
  subtitle: string;
  bulletPoints: string[];
  keyHighlight?: string;
  speakerNotes?: string;
}

interface PresentationResponse {
  title: string;
  theme: string;
  slides: SlideData[];
}

export default function AiPresentationMakerPage() {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState<number>(5);
  const [theme, setTheme] = useState<'corporate' | 'startup' | 'creative' | 'academic'>('corporate');
  const [audience, setAudience] = useState('Profesional Bisnis / Stakeholder');
  const [isLoading, setIsLoading] = useState(false);
  const [presentation, setPresentation] = useState<PresentationResponse | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    setPresentation(null);

    try {
      const res = await fetch('/api/ai-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          slideCount,
          theme,
          audience,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setPresentation(data.data);
        setCurrentSlideIndex(0);
      } else {
        setErrorMessage(data.message || 'Gagal membuat slide presentasi.');
      }
    } catch {
      setErrorMessage('Terjadi kendala jaringan saat menghubungi generator AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPptx = async () => {
    if (!presentation || presentation.slides.length === 0) return;
    setIsExporting(true);

    try {
      // Import dinamis pptxgenjs di client-side
      const pptxgen = (await import('pptxgenjs')).default;
      const pres = new pptxgen();

      pres.layout = 'LAYOUT_16x9';

      // Konfigurasi palet tema
      const themeColors: Record<string, { bg: string; title: string; text: string; accent: string; badge: string }> = {
        corporate: { bg: '0F172A', title: 'FFFFFF', text: 'CBD5E1', accent: '38BDF8', badge: '1E293B' },
        startup: { bg: 'F8FAFC', title: '0F172A', text: '334155', accent: '4F46E5', badge: 'EEF2FF' },
        creative: { bg: '1E1B4B', title: 'FFFFFF', text: 'E0E7FF', accent: 'A855F7', badge: '312E81' },
        academic: { bg: 'FFFFFF', title: '1E293B', text: '475569', accent: '0D9488', badge: 'F0FDFA' },
      };

      const pal = themeColors[presentation.theme] || themeColors.corporate;

      // Slide 1: Cover Slide
      const coverSlide = pres.addSlide();
      coverSlide.background = { color: pal.bg };
      coverSlide.addText(presentation.title, {
        x: 1.0,
        y: 2.0,
        w: 11.3,
        fontSize: 32,
        bold: true,
        color: pal.title,
        fontFace: 'Arial',
      });
      coverSlide.addText(`Disusun dengan AI Presentation Builder • KompresKilat`, {
        x: 1.0,
        y: 3.8,
        w: 11.3,
        fontSize: 14,
        color: pal.accent,
        fontFace: 'Arial',
      });

      // Slide Konten
      presentation.slides.forEach((s) => {
        const slide = pres.addSlide();
        slide.background = { color: pal.bg };

        // Nomor & Judul Slide
        slide.addText(`SLIDE ${s.slideNumber}`, {
          x: 1.0,
          y: 0.6,
          w: 5.0,
          fontSize: 10,
          bold: true,
          color: pal.accent,
          fontFace: 'Arial',
        });

        slide.addText(s.title, {
          x: 1.0,
          y: 1.0,
          w: 11.0,
          fontSize: 22,
          bold: true,
          color: pal.title,
          fontFace: 'Arial',
        });

        slide.addText(s.subtitle, {
          x: 1.0,
          y: 1.6,
          w: 11.0,
          fontSize: 12,
          italic: true,
          color: pal.text,
          fontFace: 'Arial',
        });

        // Highlight Badge / Metric jika ada
        if (s.keyHighlight) {
          slide.addText(`💡 Fokus Kunci: ${s.keyHighlight}`, {
            x: 1.0,
            y: 2.2,
            w: 11.0,
            fontSize: 11,
            bold: true,
            color: pal.accent,
            fontFace: 'Arial',
          });
        }

        // Poin-poin Peluru (Bullet points)
        const bulletItems = s.bulletPoints.map((bp) => ({
          text: bp,
          options: { fontSize: 13, color: pal.text, bullet: true, breakLine: true },
        }));

        slide.addText(bulletItems, {
          x: 1.0,
          y: 2.8,
          w: 11.0,
          h: 3.5,
          fontFace: 'Arial',
          margin: 0,
        });

        // Speaker Notes
        if (s.speakerNotes) {
          slide.addNotes(s.speakerNotes);
        }
      });

      // Simpan file .pptx ke komputer pengguna
      const safeFileName = presentation.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
      await pres.writeFile({ fileName: `presentasi_${safeFileName}.pptx` });
    } catch (err) {
      console.error('Error exporting PPTX:', err);
      alert('Gagal mengekspor file PowerPoint. Pastikan browser Anda mendukung unduhan file.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleEditBullet = (bulletIndex: number, newValue: string) => {
    if (!presentation) return;
    const updatedSlides = [...presentation.slides];
    updatedSlides[currentSlideIndex].bulletPoints[bulletIndex] = newValue;
    setPresentation({ ...presentation, slides: updatedSlides });
  };

  const handleEditTitle = (newTitle: string) => {
    if (!presentation) return;
    const updatedSlides = [...presentation.slides];
    updatedSlides[currentSlideIndex].title = newTitle;
    setPresentation({ ...presentation, slides: updatedSlides });
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Presentation Generator - KompresKilat',
    description: 'Aplikasi AI online untuk membuat draf slide presentasi PowerPoint (.pptx) otomatis dari topik atau rangkuman materi.',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'All',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={schemaData} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold mb-2">
            ✨ AI Slide Deck Builder
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            AI Presentation Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Masukkan topik, ide proyek, atau materi tugas Anda. AI akan merancang struktur slide lengkap dan mengekspornya langsung ke berkas Microsoft PowerPoint (<b>.pptx</b>) siap edit.
          </p>
        </div>

        {/* Form Pembuatan Slide */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Topik / Judul Presentasi atau Ringkasan Dokumen:
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Strategi Pemasaran Digital UMKM Kopi Susu Kekinian Menghadapi Tahun 2026..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Slide:</label>
                <select
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={3}>3 Slide (Pitch Cepat)</option>
                  <option value={5}>5 Slide (Standar Rekomendasi)</option>
                  <option value={8}>8 Slide (Paparan Lengkap)</option>
                  <option value={10}>10 Slide (Seminar / Bisnis)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gaya &amp; Palet Desain:</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="corporate">Dark Navy Corporate</option>
                  <option value="startup">Modern Startup Clean</option>
                  <option value="creative">Creative Indigo Violet</option>
                  <option value="academic">Academic Emerald Slate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audiens:</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Profesional Bisnis / Stakeholder">Profesional / Klien Bisnis</option>
                  <option value="Dosen & Mahasiswa Akademik">Akademik / Kuliah & Skripsi</option>
                  <option value="Investor Venture Capital">Investor & Pitch Deck</option>
                  <option value="Masyarakat Umum">Masyarakat Umum & Edukasi</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm disabled:bg-slate-300 cursor-pointer flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>AI Sedang Menyusun Struktur Presentasi...</span>
                </>
              ) : (
                <span>Buat Struktur Slide AI ⚡</span>
              )}
            </button>
          </form>
        </div>

        {/* Pesan Kesalahan */}
        {errorMessage && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            ⚠️ <b>Pemberitahuan:</b> {errorMessage}
          </div>
        )}

        {/* Hasil Slide Deck AI & Editor Langsung */}
        {presentation && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                    Pratinjau Slide Deck ({presentation.slides.length} Slide)
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">{presentation.title}</h2>
                </div>
                <button
                  onClick={handleDownloadPptx}
                  disabled={isExporting}
                  className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  {isExporting ? 'Sedang Menyusun PPTX...' : '📥 Unduh File PowerPoint (.pptx)'}
                </button>
              </div>

              {/* Tampilan Visual Slide Saat Ini */}
              {presentation.slides[currentSlideIndex] && (
                <div className={`p-6 sm:p-10 rounded-2xl shadow-inner mb-6 border transition ${
                  theme === 'corporate' ? 'bg-slate-900 text-white border-slate-800' :
                  theme === 'creative' ? 'bg-indigo-950 text-white border-indigo-900' :
                  theme === 'academic' ? 'bg-teal-950 text-white border-teal-900' :
                  'bg-white text-slate-900 border-slate-300'
                }`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 uppercase tracking-widest">
                      Slide {currentSlideIndex + 1} dari {presentation.slides.length}
                    </span>
                    {presentation.slides[currentSlideIndex].keyHighlight && (
                      <span className="text-[11px] font-bold text-amber-400">
                        ⚡ {presentation.slides[currentSlideIndex].keyHighlight}
                      </span>
                    )}
                  </div>

                  {/* Judul Slide (Editable) */}
                  <div className="mb-4">
                    <label className="text-[10px] opacity-60 block mb-1">Judul Slide (Dapat Anda Edit):</label>
                    <input
                      type="text"
                      value={presentation.slides[currentSlideIndex].title}
                      onChange={(e) => handleEditTitle(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-base sm:text-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  <p className="text-xs opacity-75 italic mb-5">
                    {presentation.slides[currentSlideIndex].subtitle}
                  </p>

                  {/* Poin-Poin Peluru (Editable) */}
                  <div className="space-y-2 mb-6">
                    <label className="text-[10px] opacity-60 block">Poin-poin Pembahasan:</label>
                    {presentation.slides[currentSlideIndex].bulletPoints.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-1 font-bold">•</span>
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => handleEditBullet(idx, e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Speaker Notes */}
                  {presentation.slides[currentSlideIndex].speakerNotes && (
                    <div className="p-3 bg-black/25 rounded-xl border border-white/5 text-[11px] opacity-80">
                      <span className="font-semibold block mb-0.5">🎙️ Catatan Pembicara (Speaker Notes):</span>
                      {presentation.slides[currentSlideIndex].speakerNotes}
                    </div>
                  )}
                </div>
              )}

              {/* Kontrol Navigasi Slide Carousel */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={currentSlideIndex === 0}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  ← Slide Sebelumnya
                </button>

                <div className="flex gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-none px-2">
                  {presentation.slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlideIndex(i)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                        currentSlideIndex === i
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, presentation.slides.length - 1))}
                  disabled={currentSlideIndex === presentation.slides.length - 1}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Slide Berikutnya →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Slot Iklan Kepatuhan AdSense */}
        <AdBanner zone="in-tool" label="Iklan" />

        {/* Panduan & FAQ Singkat */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs text-slate-600">
          <h3 className="text-sm font-bold text-slate-900">💡 Keunggulan AI Presentation Generator:</h3>
          <ul className="space-y-1.5 list-disc pl-5">
            <li><b>Format Asli PowerPoint (.pptx):</b> Bukan sekadar teks atau gambar, melainkan file OpenXML presentasi asli yang bisa dibuka dan diedit di Microsoft PowerPoint, Google Slides, maupun WPS Office.</li>
            <li><b>Dilengkapi Catatan Pembicara:</b> Setiap slide dibekali panduan apa yang harus diucapkan saat presentasi berlangsung di depan umum.</li>
            <li><b>Privasi Terjaga:</b> Ekspor dan perakitan file .pptx diproses langsung di peramban Anda.</li>
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
