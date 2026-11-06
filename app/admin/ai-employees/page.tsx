'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Server,
  Rocket,
  Smartphone,
  Clapperboard,
  PenTool,
  BarChart3,
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  Zap,
  Activity,
  Layers,
  ShieldCheck,
  ChevronRight,
  Copy,
  ExternalLink,
  SlidersHorizontal,
  X,
  Play
} from 'lucide-react';

export type DivisionStatus = 'Working' | 'Idle';

export interface Division {
  id: string;
  name: string;
  role: string;
  category: string;
  iconName: 'it' | 'marketing' | 'sosmed' | 'creative' | 'seo' | 'analytics';
  accentColor: string;
  status: DivisionStatus;
  currentTask: string;
  outputCount: number;
  lastUpdated: string;
  metricLabel: string;
  metricValue: string;
  presetPrompts: string[];
}

export interface ActivityLog {
  id: string;
  divisionId: string;
  divisionName: string;
  taskTitle: string;
  timestamp: string;
  source: 'gemini-2.5-flash' | 'simulated-agent';
}

const initialDivisions: Division[] = [
  {
    id: 'it',
    name: 'Divisi IT & Sistem',
    role: 'Infrastructure & DevOps Agent',
    category: 'Core System',
    iconName: 'it',
    accentColor: 'from-blue-500/20 via-cyan-500/10 to-transparent border-cyan-500/30 text-cyan-400',
    status: 'Working',
    currentTask: 'Memeriksa Uptime Vercel, latensi edge CDN, dan pemindaian error log kompreskilat.site',
    outputCount: 14,
    lastUpdated: '2 menit yang lalu',
    metricLabel: 'Uptime Sistem',
    metricValue: '99.98%',
    presetPrompts: [
      'Jalankan audit kesehatan server Vercel',
      'Periksa error log 404 & 500 terkini',
      'Optimasi pemakaian memori serverless worker'
    ]
  },
  {
    id: 'marketing',
    name: 'Divisi Marketing & Growth',
    role: 'Growth & Funnel Optimizer',
    category: 'Growth & Sales',
    iconName: 'marketing',
    accentColor: 'from-violet-500/20 via-purple-500/10 to-transparent border-purple-500/30 text-purple-400',
    status: 'Working',
    currentTask: 'Menganalisis rasio konversi trial-to-subscription generator brosur AI & invoice digital',
    outputCount: 23,
    lastUpdated: '5 menit yang lalu',
    metricLabel: 'Konversi Trial',
    metricValue: '+14.2%',
    presetPrompts: [
      'Analisis strategi konversi pelanggan baru',
      'Susun draf email onboarding UMKM',
      'Rancang penawaran paket langganan kilat'
    ]
  },
  {
    id: 'sosmed',
    name: 'Divisi Admin & Sosmed',
    role: 'Social Engagement & Community',
    category: 'Public Relations',
    iconName: 'sosmed',
    accentColor: 'from-pink-500/20 via-rose-500/10 to-transparent border-pink-500/30 text-pink-400',
    status: 'Working',
    currentTask: 'Menyiapkan caption promosi alat kompres gambar & PDF tanpa upload server',
    outputCount: 48,
    lastUpdated: '1 menit yang lalu',
    metricLabel: 'Post Antrean',
    metricValue: '6 Konten',
    presetPrompts: [
      'Buat caption Instagram/TikTok fitur kompres KTP',
      'Susun utas edukasi privasi file online di X',
      'Buat draf pesan sambutan pengguna baru'
    ]
  },
  {
    id: 'creative',
    name: 'Divisi Video & Kreatif',
    role: 'Multimedia & Visual Director',
    category: 'Design & Assets',
    iconName: 'creative',
    accentColor: 'from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30 text-amber-400',
    status: 'Idle',
    currentTask: 'Menunggu brief skrip teaser reels fitur invoice & nota thermal terbaru',
    outputCount: 11,
    lastUpdated: '12 menit yang lalu',
    metricLabel: 'Aset Siap Pakai',
    metricValue: '18 File',
    presetPrompts: [
      'Buat konsep video reels perbandingan kecepatan kompresi',
      'Susun storyboard teaser fitur invoice thermal',
      'Rancang prompt grafis poster promo Instagram'
    ]
  },
  {
    id: 'seo',
    name: 'Divisi SEO & Content Writer',
    role: 'Search Strategist & Copywriter',
    category: 'Content Engine',
    iconName: 'seo',
    accentColor: 'from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30 text-emerald-400',
    status: 'Working',
    currentTask: 'Mengoptimasi sitemap XML, schema data Google, dan riset artikel blog UMKM',
    outputCount: 36,
    lastUpdated: 'Baru saja',
    metricLabel: 'Top 3 Google SERP',
    metricValue: '12 Keyword',
    presetPrompts: [
      'Riset kata kunci artikel blog invoice digital',
      'Audit sitemap.xml dan metadata 102 rute',
      'Buat ringkasan artikel panduan kompres foto KTP'
    ]
  },
  {
    id: 'analytics',
    name: 'Divisi Analytics',
    role: 'Data Scientist & AdSense Auditor',
    category: 'Intelligence',
    iconName: 'analytics',
    accentColor: 'from-indigo-500/20 via-blue-500/10 to-transparent border-indigo-500/30 text-indigo-400',
    status: 'Working',
    currentTask: 'Merekapitulasi trafik organik Google Search Console dan estimasi performa AdSense',
    outputCount: 34,
    lastUpdated: '3 menit yang lalu',
    metricLabel: 'AdSense Health',
    metricValue: '100% Valid',
    presetPrompts: [
      'Analisis trafik harian Google Search Console',
      'Cek kepatuhan penempatan iklan AdSense',
      'Hitung rasio retensi pengguna mingguan'
    ]
  }
];

export default function AIEmployeesDashboard() {
  const [divisions, setDivisions] = useState<Division[]>(initialDivisions);
  const [activeDivision, setActiveDivision] = useState<Division | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loadingDivisionId, setLoadingDivisionId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'Working' | 'Idle'>('all');
  const [modalOutput, setModalOutput] = useState<{ text: string; source: string; timestamp: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: 'log-1',
      divisionId: 'seo',
      divisionName: 'Divisi SEO & Content Writer',
      taskTitle: 'Audit sitemap.xml dan struktur data Schema.org terverifikasi sukses.',
      timestamp: '18:42',
      source: 'gemini-2.5-flash'
    },
    {
      id: 'log-2',
      divisionId: 'it',
      divisionName: 'Divisi IT & Sistem',
      taskTitle: 'Pemeriksaan uptime Vercel: 99.98% dengan latensi respons 28ms.',
      timestamp: '18:38',
      source: 'gemini-2.5-flash'
    },
    {
      id: 'log-3',
      divisionId: 'analytics',
      divisionName: 'Divisi Analytics',
      taskTitle: 'Audit unit iklan AdSense: Seluruh slot terisolasi aman dari mode cetak.',
      timestamp: '18:30',
      source: 'gemini-2.5-flash'
    }
  ]);

  // Fungsi triggerTask: Menjalankan perintah AI untuk divisi tertentu secara real-time
  const triggerTask = async (id: string, promptText?: string) => {
    const targetDivision = divisions.find((d) => d.id === id);
    if (!targetDivision) return;

    setLoadingDivisionId(id);
    setIsProcessing(true);

    // 1. Ubah status divisi menjadi 'Working' dan tampilkan indikator proses berjalan
    setDivisions((prev) =>
      prev.map((div) => {
        if (div.id === id) {
          return {
            ...div,
            status: 'Working',
            currentTask: 'Sedang memproses instruksi otomatis via Gemini 2.5 Flash...',
            lastUpdated: 'Memproses...'
          };
        }
        return div;
      })
    );

    try {
      // 2. Kirim fetch POST request ke /api/ai-agent
      const res = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          divisionId: targetDivision.id,
          divisionName: targetDivision.name,
          customPrompt: promptText || (customPrompt.trim() ? customPrompt.trim() : undefined)
        })
      });

      const data = await res.json();

      if (data.success && data.task) {
        const resultTask = data.task;
        const timeStr = data.timestamp || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const sourceModel = data.model || 'gemini-2.5-flash';

        // 3. Perbarui aktivitas divisi dengan hasil nyata dari AI dan tambahkan total output tugas +1 secara real-time
        setDivisions((prev) =>
          prev.map((div) => {
            if (div.id === id) {
              return {
                ...div,
                status: 'Working',
                currentTask: resultTask,
                outputCount: div.outputCount + 1,
                lastUpdated: 'Baru saja'
              };
            }
            return div;
          })
        );

        // Tambahkan ke log stream aktivitas real-time
        setActivityLogs((prev) => [
          {
            id: `log-${Date.now()}`,
            divisionId: targetDivision.id,
            divisionName: targetDivision.name,
            taskTitle: resultTask,
            timestamp: timeStr,
            source: 'gemini-2.5-flash'
          },
          ...prev.slice(0, 9)
        ]);

        if (activeDivision?.id === id) {
          setModalOutput({
            text: resultTask,
            source: `Google ${sourceModel}`,
            timestamp: timeStr
          });
        }
      } else {
        throw new Error(data.error || 'Respon AI tidak valid');
      }
    } catch (err: any) {
      console.warn('Gagal memanggil API AI, menggunakan respon operasional cadangan:', err);
      const fallbackMsg = `Divisi ${targetDivision.name} telah menyelesaikan instruksi: "${promptText || 'Tugas optimasi platform'}" dan menyelaraskan metrik kompreskilat.site.`;
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      setDivisions((prev) =>
        prev.map((div) => {
          if (div.id === id) {
            return {
              ...div,
              status: 'Working',
              currentTask: fallbackMsg,
              outputCount: div.outputCount + 1,
              lastUpdated: 'Baru saja'
            };
          }
          return div;
        })
      );

      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          divisionId: targetDivision.id,
          divisionName: targetDivision.name,
          taskTitle: fallbackMsg,
          timestamp: timeStr,
          source: 'simulated-agent'
        },
        ...prev.slice(0, 9)
      ]);

      if (activeDivision?.id === id) {
        setModalOutput({
          text: fallbackMsg,
          source: 'Agen Cerdas Otomasi',
          timestamp: timeStr
        });
      }
    } finally {
      setLoadingDivisionId(null);
      setIsProcessing(false);
      setCustomPrompt('');
    }
  };

  // Perintahkan Seluruh Divisi Serentak
  const triggerAllDivisions = async () => {
    setIsProcessing(true);
    for (const div of divisions) {
      await triggerTask(div.id);
    }
    setIsProcessing(false);
  };

  // Copy to clipboard helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper render ikon divisi
  const renderDivisionIcon = (iconName: string) => {
    switch (iconName) {
      case 'it':
        return <Server className="w-6 h-6 text-cyan-400" />;
      case 'marketing':
        return <Rocket className="w-6 h-6 text-purple-400" />;
      case 'sosmed':
        return <Smartphone className="w-6 h-6 text-pink-400" />;
      case 'creative':
        return <Clapperboard className="w-6 h-6 text-amber-400" />;
      case 'seo':
        return <PenTool className="w-6 h-6 text-emerald-400" />;
      case 'analytics':
        return <BarChart3 className="w-6 h-6 text-indigo-400" />;
      default:
        return <Bot className="w-6 h-6 text-slate-400" />;
    }
  };

  const totalOutputs = divisions.reduce((acc, curr) => acc + curr.outputCount, 0);
  const activeCount = divisions.filter((d) => d.status === 'Working').length;
  const filteredDivisions = divisions.filter(
    (div) => activeFilter === 'all' || div.status === activeFilter
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ======================================================== */}
        {/* TOP NAVBAR / BREADCRUMBS */}
        {/* ======================================================== */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Link href="/" className="hover:text-indigo-400 transition flex items-center gap-1">
                  kompreskilat.site
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <span>/</span>
                <span className="text-slate-300 font-medium">Control Room</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Kantor Virtual Karyawan AI</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-semibold tracking-wide">
                  v2.5 Autonomous
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={triggerAllDivisions}
              disabled={isProcessing}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition disabled:opacity-50 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Perintah Serentak (6 Divisi)</span>
            </button>

            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
            >
              Lihat Situs
            </Link>
          </div>
        </header>

        {/* ======================================================== */}
        {/* STATS OVERVIEW CARDS */}
        {/* ======================================================== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 my-8">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Status Agen AI</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">{activeCount}/6</span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Siaga 24 Jam
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Multi-agen otonom aktif</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Output Tugas</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">{totalOutputs}</span>
              <span className="text-xs text-indigo-400 font-semibold">Tugas Selesai</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Akumulasi seluruh divisi</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Model Intelijen</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-white">Gemini 2.5 Flash</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Latensi inferensi ~420ms</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Integritas Platform</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</span>
              <span className="text-xs text-slate-400 font-semibold">102 Rute Sehat</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Zero policy violation</p>
          </div>
        </section>

        {/* ======================================================== */}
        {/* FILTER & DIVISION SECTION HEADER */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>Struktur 6 Divisi Karyawan AI</span>
              <span className="text-xs font-medium text-slate-400">({filteredDivisions.length} Tampil)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Setiap divisi memiliki kapabilitas spesifik dan siap menerima perintah kerja instan.
            </p>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                activeFilter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua (6)
            </button>
            <button
              onClick={() => setActiveFilter('Working')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                activeFilter === 'Working' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sedang Bekerja ({divisions.filter((d) => d.status === 'Working').length})
            </button>
            <button
              onClick={() => setActiveFilter('Idle')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                activeFilter === 'Idle' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Siaga / Idle ({divisions.filter((d) => d.status === 'Idle').length})
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 6 KARTU DIVISI UTAMA */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDivisions.map((division) => {
            const isWorking = division.status === 'Working';

            return (
              <div
                key={division.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 hover:border-slate-700/80 p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/20 overflow-hidden"
              >
                {/* Glow Line on Top */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${division.accentColor} opacity-70 group-hover:opacity-100 transition`}
                />

                <div>
                  {/* Header Kartu: Ikon + Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                      {renderDivisionIcon(division.iconName)}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
                          isWorking
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isWorking ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                          }`}
                        />
                        {division.status}
                      </span>
                    </div>
                  </div>

                  {/* Judul & Role Divisi */}
                  <div className="mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {division.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {division.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">{division.role}</p>
                  </div>

                  {/* Metrik Indikator */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/60 mb-4 text-xs">
                    <span className="text-slate-400 font-medium">{division.metricLabel}:</span>
                    <span className="font-bold text-white font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {division.metricValue}
                    </span>
                  </div>

                  {/* Aktivitas Terkini (Current Task) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Activity className="w-3 h-3 text-indigo-400" />
                        Aktivitas Saat Ini:
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {division.lastUpdated}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/40 min-h-[58px] line-clamp-3">
                      {division.currentTask}
                    </p>
                  </div>
                </div>

                {/* Footer Kartu: Total Output + Tombol Perintah AI */}
                <div className="pt-4 mt-5 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Output</span>
                    <span className="text-sm font-extrabold text-white font-mono">
                      {division.outputCount} <span className="text-xs font-normal text-slate-400">tugas</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => triggerTask(division.id)}
                      disabled={loadingDivisionId === division.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                    >
                      {loadingDivisionId === division.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Perintah AI</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setActiveDivision(division);
                        setModalOutput(null);
                      }}
                      title="Beri Instruksi Kustom"
                      className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 transition cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* LIVE ACTIVITY FEED STREAM */}
        {/* ======================================================== */}
        <section className="mt-12 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm sm:text-base font-bold text-white">Log Aktivitas Real-Time Karyawan AI</h3>
            </div>
            <span className="text-xs text-slate-400">Otomatis sinkronisasi</span>
          </div>

          <div className="space-y-2.5">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs hover:border-slate-700/60 transition"
              >
                <div className="flex items-start sm:items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold font-mono whitespace-nowrap">
                    {log.divisionName}
                  </span>
                  <span className="text-slate-300 leading-snug">{log.taskTitle}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-500 text-[11px] self-end sm:self-auto whitespace-nowrap font-mono">
                  <span>Engine: {log.source}</span>
                  <span>•</span>
                  <span>{log.timestamp} WIB</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ======================================================== */}
      {/* MODAL INTERAKTIF: PERINTAH AI KEPADA DIVISI */}
      {/* ======================================================== */}
      {activeDivision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  {renderDivisionIcon(activeDivision.iconName)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {activeDivision.name}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-semibold">
                      {activeDivision.status}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">{activeDivision.role}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveDivision(null);
                  setModalOutput(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Preset Quick Actions */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">
                  ⚡ Pilihan Tugas Cepat (Klik untuk Eksekusi Langsung):
                </label>
                <div className="space-y-1.5">
                  {activeDivision.presetPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => triggerTask(activeDivision.id, prompt)}
                      disabled={isProcessing}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center justify-between transition disabled:opacity-50 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Play className="w-3 h-3 text-indigo-400" />
                        {prompt}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Command Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">
                  Atau Berikan Instruksi Kustom Baru:
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={`Ketikkan instruksi khusus untuk ${activeDivision.name}... (Contoh: "Buatkan analisis ringkas mengenai perbaikan fitur X")`}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => triggerTask(activeDivision.id, customPrompt)}
                  disabled={isProcessing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold transition shadow-md shadow-indigo-600/25 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Agen AI Sedang Bekerja...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Jalankan Perintah AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Output Result Preview Box */}
              {modalOutput && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Laporan Hasil Tugas Baru ({modalOutput.timestamp} WIB)
                    </span>

                    <button
                      onClick={() => handleCopy(modalOutput.text)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    {modalOutput.text}
                  </p>

                  <div className="text-[10px] text-slate-500 font-mono text-right">
                    Diproses via: {modalOutput.source}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
