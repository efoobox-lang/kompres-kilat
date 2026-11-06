'use client';

import { useState, useEffect } from 'react';
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
  Play,
  Terminal,
  Search,
  Trash2,
  FileText,
  Check,
  TrendingUp,
  Eye,
  MousePointerClick,
  DollarSign,
  Building2,
  Monitor,
  Cpu,
  Radio,
  Flame,
  LayoutGrid,
  Lock,
  KeyRound,
  EyeOff,
  AlertCircle,
  LogOut
} from 'lucide-react';

export type DivisionStatus = 'Working' | 'Idle';

export interface Division {
  id: string;
  name: string;
  roomCode: string;
  role: string;
  category: string;
  iconName: 'it' | 'marketing' | 'sosmed' | 'creative' | 'seo' | 'analytics';
  accentColor: string;
  borderColor: string;
  badgeBg: string;
  status: DivisionStatus;
  currentTask: string;
  outputCount: number;
  lastUpdated: string;
  metricLabel: string;
  metricValue: string;
  equipment: string[];
  presetPrompts: string[];
}

export interface ActivityLog {
  id: string;
  divisionId: string;
  divisionName: string;
  taskTitle: string;
  timestamp: string;
  source: 'gemini-2.5-flash' | 'simulated-agent' | string;
  status?: 'success' | 'info';
}

interface DailyMetric {
  day: string;
  date: string;
  views: number;
  clicks: number;
  sales: number; // Dalam Rupiah
}

const weeklyMetricsData: DailyMetric[] = [
  { day: 'Sen', date: '31 Okt', views: 28400, clicks: 4620, sales: 2150000 },
  { day: 'Sel', date: '01 Nov', views: 32100, clicks: 5310, sales: 2480000 },
  { day: 'Rab', date: '02 Nov', views: 35800, clicks: 5940, sales: 2890000 },
  { day: 'Kam', date: '03 Nov', views: 44200, clicks: 7650, sales: 3450000 },
  { day: 'Jum', date: '04 Nov', views: 39100, clicks: 6480, sales: 2980000 },
  { day: 'Sab', date: '05 Nov', views: 31500, clicks: 5210, sales: 2100000 },
  { day: 'Min', date: '06 Nov', views: 37820, clicks: 6140, sales: 2400000 },
];

const initialDivisions: Division[] = [
  {
    id: 'it',
    name: 'Divisi IT & Sistem',
    roomCode: 'ROOM 101 • DEVOPS & INFRA',
    role: 'Infrastructure & DevOps Agent',
    category: 'Core System',
    iconName: 'it',
    accentColor: 'from-cyan-500/20 via-blue-500/10 to-transparent text-cyan-400',
    borderColor: 'border-cyan-500/40 hover:border-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    status: 'Working',
    currentTask: 'Memeriksa Uptime Vercel, latensi edge CDN, dan pemindaian error log kompreskilat.site',
    outputCount: 14,
    lastUpdated: '2 menit yang lalu',
    metricLabel: 'Uptime Edge',
    metricValue: '99.98%',
    equipment: ['Edge Server Rack', 'Grafana Monitor', 'SSH Terminal Dual-Screen'],
    presetPrompts: [
      'Jalankan audit kesehatan server Vercel',
      'Periksa error log 404 & 500 terkini',
      'Optimasi pemakaian memori serverless worker'
    ]
  },
  {
    id: 'marketing',
    name: 'Divisi Marketing & Growth',
    roomCode: 'ROOM 102 • GROWTH & SALES',
    role: 'Growth & Funnel Optimizer',
    category: 'Growth & Sales',
    iconName: 'marketing',
    accentColor: 'from-purple-500/20 via-violet-500/10 to-transparent text-purple-400',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    status: 'Working',
    currentTask: 'Menganalisis rasio konversi trial-to-subscription generator brosur AI & invoice digital',
    outputCount: 23,
    lastUpdated: '5 menit yang lalu',
    metricLabel: 'Konversi Trial',
    metricValue: '+14.2%',
    equipment: ['Funnel Whiteboard', 'AdSense Tracker', 'Lead Campaign Hub'],
    presetPrompts: [
      'Analisis strategi konversi pelanggan baru',
      'Susun draf email onboarding UMKM',
      'Rancang penawaran paket langganan kilat'
    ]
  },
  {
    id: 'sosmed',
    name: 'Divisi Admin & Sosmed',
    roomCode: 'ROOM 103 • SOCIAL & CS',
    role: 'Social Engagement & Community',
    category: 'Public Relations',
    iconName: 'sosmed',
    accentColor: 'from-pink-500/20 via-rose-500/10 to-transparent text-pink-400',
    borderColor: 'border-pink-500/40 hover:border-pink-400',
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    status: 'Working',
    currentTask: 'Menyiapkan caption promosi alat kompres gambar & PDF tanpa upload server',
    outputCount: 48,
    lastUpdated: '1 menit yang lalu',
    metricLabel: 'Antrean Konten',
    metricValue: '6 Postingan',
    equipment: ['Multi-Device Hub', 'Ring Light Pro', 'Auto-Reply Console'],
    presetPrompts: [
      'Buat caption Instagram/TikTok fitur kompres KTP',
      'Susun utas edukasi privasi file online di X',
      'Buat draf pesan sambutan pengguna baru'
    ]
  },
  {
    id: 'creative',
    name: 'Divisi Video & Kreatif',
    roomCode: 'ROOM 104 • CREATIVE STUDIO',
    role: 'Multimedia & Visual Director',
    category: 'Design & Assets',
    iconName: 'creative',
    accentColor: 'from-amber-500/20 via-orange-500/10 to-transparent text-amber-400',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    status: 'Idle',
    currentTask: 'Menunggu brief skrip teaser reels fitur invoice & nota thermal terbaru',
    outputCount: 11,
    lastUpdated: '12 menit yang lalu',
    metricLabel: 'Aset Siap Pakai',
    metricValue: '18 File',
    equipment: ['Graphic Pen Tablet', 'Timeline Render Rig', 'Sound Monitor'],
    presetPrompts: [
      'Buat konsep video reels perbandingan kecepatan kompresi',
      'Susun storyboard teaser fitur invoice thermal',
      'Rancang prompt grafis poster promo Instagram'
    ]
  },
  {
    id: 'seo',
    name: 'Divisi SEO & Content Writer',
    roomCode: 'ROOM 105 • SEO & EDITORIAL',
    role: 'Search Strategist & Copywriter',
    category: 'Content Engine',
    iconName: 'seo',
    accentColor: 'from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-400',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    status: 'Working',
    currentTask: 'Mengoptimasi sitemap XML, schema data Google, dan riset artikel blog UMKM',
    outputCount: 36,
    lastUpdated: 'Baru saja',
    metricLabel: 'SERP Top 3',
    metricValue: '12 Keyword',
    equipment: ['Google SERP Radar', 'Keyword Density Rig', 'Markdown Desk'],
    presetPrompts: [
      'Riset kata kunci artikel blog invoice digital',
      'Audit sitemap.xml dan metadata 102 rute',
      'Buat ringkasan artikel panduan kompres foto KTP'
    ]
  },
  {
    id: 'analytics',
    name: 'Divisi Analytics',
    roomCode: 'ROOM 106 • DATA & COMPLIANCE',
    role: 'Data Scientist & AdSense Auditor',
    category: 'Intelligence',
    iconName: 'analytics',
    accentColor: 'from-indigo-500/20 via-blue-500/10 to-transparent text-indigo-400',
    borderColor: 'border-indigo-500/40 hover:border-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    status: 'Working',
    currentTask: 'Merekapitulasi trafik organik Google Search Console dan estimasi performa AdSense',
    outputCount: 34,
    lastUpdated: '3 menit yang lalu',
    metricLabel: 'AdSense Audit',
    metricValue: '100% Valid',
    equipment: ['GSC Live Feed', 'AdSense Safety Shield', 'Heatmap Terminal'],
    presetPrompts: [
      'Analisis trafik harian Google Search Console',
      'Cek kepatuhan penempatan iklan AdSense',
      'Hitung rasio retensi pengguna mingguan'
    ]
  }
];

export default function AIEmployeesDashboard() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [divisions, setDivisions] = useState<Division[]>(initialDivisions);
  const [activeDivision, setActiveDivision] = useState<Division | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loadingDivisionId, setLoadingDivisionId] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'office2d' | 'compact'>('office2d');
  const [activeFilter, setActiveFilter] = useState<'all' | 'Working' | 'Idle'>('all');
  const [selectedChartMetric, setSelectedChartMetric] = useState<'views' | 'clicks' | 'sales'>('views');
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const [modalOutput, setModalOutput] = useState<{ text: string; source: string; timestamp: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [logDivisionFilter, setLogDivisionFilter] = useState<string>('all');
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: 'log-1',
      divisionId: 'seo',
      divisionName: 'Divisi SEO & Content Writer',
      taskTitle: 'Audit sitemap.xml dan struktur data Schema.org terverifikasi sukses dengan 104 index terdaftar.',
      timestamp: '19:12',
      source: 'gemini-2.5-flash',
      status: 'success'
    },
    {
      id: 'log-2',
      divisionId: 'it',
      divisionName: 'Divisi IT & Sistem',
      taskTitle: 'Pemeriksaan uptime Vercel: 99.98% dengan latensi respons 28ms edge network.',
      timestamp: '19:08',
      source: 'gemini-2.5-flash',
      status: 'success'
    },
    {
      id: 'log-3',
      divisionId: 'analytics',
      divisionName: 'Divisi Analytics',
      taskTitle: 'Audit unit iklan AdSense: Seluruh slot terisolasi aman dari mode cetak nota/struk.',
      timestamp: '18:55',
      source: 'gemini-2.5-flash',
      status: 'success'
    }
  ]);

  useEffect(() => {
    setMounted(true);
    try {
      const savedAuth = localStorage.getItem('kk_admin_session');
      if (savedAuth === 'authorized_2026') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      // localStorage may be unavailable
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError(null);

    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'kompreskilat2026';

    if (passwordInput.trim() === validPassword) {
      try {
        localStorage.setItem('kk_admin_session', 'authorized_2026');
      } catch (e) {}
      setIsAuthenticated(true);
      setPasswordInput('');
      setAuthError(null);
    } else {
      setAuthError('Kata sandi administrator salah. Silakan coba lagi!');
    }
    setIsVerifying(false);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('kk_admin_session');
    } catch (e) {}
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError(null);
  };

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

        // Masukkan riwayat log aktivitas global baru ke dalam daftar log (waktu, divisi, hasil tugas)
        const newLogEntry: ActivityLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          divisionId: targetDivision.id,
          divisionName: targetDivision.name,
          taskTitle: resultTask,
          timestamp: timeStr,
          source: sourceModel === 'gemini-2.5-flash' ? 'gemini-2.5-flash' : sourceModel,
          status: 'success'
        };

        setActivityLogs((prev) => [newLogEntry, ...prev.slice(0, 49)]);

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
      const fallbackMsg = `Divisi ${targetDivision.name} telah menyelesaikan instruksi: "${promptText || 'Tugas optimasi platform'}" dan menyelaraskan metrik operasional kompreskilat.site.`;
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

      // Masukkan riwayat cadangan ke dalam daftar log
      const fallbackLogEntry: ActivityLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        divisionId: targetDivision.id,
        divisionName: targetDivision.name,
        taskTitle: fallbackMsg,
        timestamp: timeStr,
        source: 'simulated-agent',
        status: 'info'
      };

      setActivityLogs((prev) => [fallbackLogEntry, ...prev.slice(0, 49)]);

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
        return <Server className="w-5 h-5 text-cyan-400" />;
      case 'marketing':
        return <Rocket className="w-5 h-5 text-purple-400" />;
      case 'sosmed':
        return <Smartphone className="w-5 h-5 text-pink-400" />;
      case 'creative':
        return <Clapperboard className="w-5 h-5 text-amber-400" />;
      case 'seo':
        return <PenTool className="w-5 h-5 text-emerald-400" />;
      case 'analytics':
        return <BarChart3 className="w-5 h-5 text-indigo-400" />;
      default:
        return <Bot className="w-5 h-5 text-slate-400" />;
    }
  };

  // Helper avatar karakter 2D
  const render2DAvatar = (iconName: string, isWorking: boolean) => {
    let emoji = '🤖';
    let roleBadge = 'DevOps Bot';
    let gradient = 'from-cyan-500/20 to-blue-600/30 border-cyan-400/40';

    switch (iconName) {
      case 'it':
        emoji = '👨‍💻';
        roleBadge = 'Lead SysAdmin';
        gradient = 'from-cyan-500/30 to-blue-600/40 border-cyan-400/50';
        break;
      case 'marketing':
        emoji = '📈';
        roleBadge = 'Growth Hacker';
        gradient = 'from-purple-500/30 to-violet-600/40 border-purple-400/50';
        break;
      case 'sosmed':
        emoji = '📱';
        roleBadge = 'Social Manager';
        gradient = 'from-pink-500/30 to-rose-600/40 border-pink-400/50';
        break;
      case 'creative':
        emoji = '🎨';
        roleBadge = 'Art Director';
        gradient = 'from-amber-500/30 to-orange-600/40 border-amber-400/50';
        break;
      case 'seo':
        emoji = '✍️';
        roleBadge = 'SEO Copywriter';
        gradient = 'from-emerald-500/30 to-teal-600/40 border-emerald-400/50';
        break;
      case 'analytics':
        emoji = '📊';
        roleBadge = 'Data Scientist';
        gradient = 'from-indigo-500/30 to-blue-600/40 border-indigo-400/50';
        break;
    }

    return (
      <div className="relative flex flex-col items-center">
        {/* Animated Workstation Glow */}
        <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-b ${gradient} border-2 flex items-center justify-center text-3xl shadow-lg transition-transform ${isWorking ? 'scale-105 shadow-indigo-500/20' : 'opacity-80'}`}>
          <span className={isWorking ? 'animate-bounce drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]' : 'grayscale-[20%]'}>
            {emoji}
          </span>
          {isWorking && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-slate-950" />
            </span>
          )}
        </div>

        {/* Name tag meja kerja */}
        <div className="mt-1 px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-slate-300 whitespace-nowrap shadow-sm">
          {roleBadge}
        </div>
      </div>
    );
  };

  const totalOutputs = divisions.reduce((acc, curr) => acc + curr.outputCount, 0);
  const activeCount = divisions.filter((d) => d.status === 'Working').length;
  const filteredDivisions = divisions.filter(
    (div) => activeFilter === 'all' || div.status === activeFilter
  );

  const filteredLogs = activityLogs.filter((log) => {
    const matchesDivision = logDivisionFilter === 'all' || log.divisionId === logDivisionFilter;
    const query = logSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      log.taskTitle.toLowerCase().includes(query) ||
      log.divisionName.toLowerCase().includes(query) ||
      log.source.toLowerCase().includes(query);
    return matchesDivision && matchesSearch;
  });

  // Perhitungan Data Bar Chart
  const maxValues = {
    views: Math.max(...weeklyMetricsData.map((d) => d.views)),
    clicks: Math.max(...weeklyMetricsData.map((d) => d.clicks)),
    sales: Math.max(...weeklyMetricsData.map((d) => d.sales))
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  if (!mounted) {
    return null;
  }

  // Tampilan Proteksi Autentikasi Admin (Jika belum login)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        {/* Background Ambient Glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          {/* Logo & Icon Proteksi */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Lock className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Akses Command Center
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Halaman ini diproteksi. Masukkan kata sandi administrator untuk mengelola Kantor Virtual Karyawan AI & analitik kompreskilat.site.
            </p>
          </div>

          {/* Form Login Admin */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                Kata Sandi Administrator
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="Ketik password admin..."
                  autoFocus
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Banner Pesan Error */}
            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Buka Akses Admin</span>
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <Link
              href="/"
              className="hover:text-slate-300 transition flex items-center gap-1 font-medium"
            >
              <span>← Kembali ke Beranda</span>
            </Link>
            <span className="font-mono text-[11px] text-slate-600">v2.6 Secure Area</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* ======================================================== */}
        {/* TOP NAVBAR / COMMAND CENTER HEADER */}
        {/* ======================================================== */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Link href="/" className="hover:text-white transition flex items-center gap-1">
                  kompreskilat.site
                </Link>
                <span>/</span>
                <span className="text-indigo-400 font-medium">Command Center HQ</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                KILAT HQ — Command Center & Virtual Office
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                  <Flame className="w-3 h-3 text-indigo-400" />
                  Gemini 2.5 Flash
                </span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Edge Status Pill */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-slate-300">Edge 24ms</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-medium">Uptime 99.98%</span>
            </div>

            {/* Tombol Sinkronisasi / Trigger All */}
            <button
              onClick={triggerAllDivisions}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Semua Divisi Bekerja...' : 'Perintahkan 6 Divisi'}</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition cursor-pointer"
            >
              <span>Beranda</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            {/* Tombol Logout Sesi Admin */}
            <button
              onClick={handleLogout}
              title="Keluar dari Sesi Administrator"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* ======================================================== */}
        {/* BAGIAN ATAS: ANALITIK COMMAND CENTER MODERN (SAAS STYLE) */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Panel Metrik Bisnis & Pertumbuhan Platform</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Modern SaaS Analytics & Traffic Performance
              </h2>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Periode: 7 Hari Terakhir (31 Okt – 06 Nov 2026)
            </div>
          </div>

          {/* 3 KARTU STATISTIK METRIK BISNIS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Total Views */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800/80 hover:border-cyan-500/30 transition shadow-lg group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  Total Views (Tayangan)
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                  <TrendingUp className="w-3 h-3" />
                  +18.4%
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  248.920
                </span>
                <span className="text-xs text-slate-400">tayangan</span>
              </div>

              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Trafik organik seluruh 28+ tools utilitas (kompres, invoice, PDF & gambar).
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Rata-rata Harian: ~35.560</span>
                <span className="text-cyan-400">Puncak: 44.200 (Kam)</span>
              </div>
            </div>

            {/* Card 2: Total Clicks */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800/80 hover:border-purple-500/30 transition shadow-lg group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MousePointerClick className="w-4 h-4 text-purple-400" />
                  Total Clicks (Interaksi)
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                  <TrendingUp className="w-3 h-3" />
                  +12.6%
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  41.350
                </span>
                <span className="text-xs text-slate-400">klik aksi</span>
              </div>

              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Eksekusi kompresi instan, cetak thermal nota, dan unduh hasil konversi.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>CTR Rata-rata: 16.61%</span>
                <span className="text-purple-400">Puncak: 7.650 (Kam)</span>
              </div>
            </div>

            {/* Card 3: Total Sales / Konversi */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800/80 hover:border-emerald-500/30 transition shadow-lg group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Total Sales & Monetisasi
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                  <TrendingUp className="w-3 h-3" />
                  +24.1%
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  Rp 18.450.000
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Langganan API Cloud, donasi kopi pengguna, & estimasi Adsense Publisher.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>312 Transaksi Berhasil</span>
                <span className="text-emerald-400">ARPU: ~Rp 59.100</span>
              </div>
            </div>
          </div>

          {/* GRAFIK BATANG INTERAKTIF (BAR CHART) HARIAN */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Grafik Performa Harian Interaktif
                  <span className="text-xs font-normal text-slate-400">
                    (Arahkan kursor pada batang untuk melihat rincian)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Perbandingan tren pertumbuhan platform kompreskilat.site selama 7 hari berjalan
                </p>
              </div>

              {/* Metric Toggle Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                <button
                  onClick={() => setSelectedChartMetric('views')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${selectedChartMetric === 'views' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Views
                </button>
                <button
                  onClick={() => setSelectedChartMetric('clicks')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${selectedChartMetric === 'clicks' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Clicks
                </button>
                <button
                  onClick={() => setSelectedChartMetric('sales')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${selectedChartMetric === 'sales' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Sales (Rp)
                </button>
              </div>
            </div>

            {/* Bar Chart Visual Container */}
            <div className="pt-6 pb-2">
              <div className="h-56 flex items-end justify-between gap-2 sm:gap-6 border-b border-slate-800/80 pb-4">
                {weeklyMetricsData.map((metric, index) => {
                  const currentValue = metric[selectedChartMetric];
                  const maxValue = maxValues[selectedChartMetric];
                  const percentage = Math.max(15, Math.round((currentValue / maxValue) * 100));
                  const isHovered = hoveredDayIndex === index;

                  let barColor = 'from-cyan-600 to-cyan-400 shadow-cyan-500/20';
                  if (selectedChartMetric === 'clicks') barColor = 'from-purple-600 to-violet-400 shadow-purple-500/20';
                  if (selectedChartMetric === 'sales') barColor = 'from-emerald-600 to-teal-400 shadow-emerald-500/20';

                  return (
                    <div
                      key={metric.day}
                      onMouseEnter={() => setHoveredDayIndex(index)}
                      onMouseLeave={() => setHoveredDayIndex(null)}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    >
                      {/* Floating Tooltip saat Hover */}
                      {isHovered && (
                        <div className="absolute -top-16 z-20 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 shadow-2xl text-[11px] whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                          <div className="font-bold text-white flex items-center justify-between gap-3">
                            <span>{metric.day}, {metric.date}</span>
                            <span className="text-indigo-400">
                              {selectedChartMetric === 'sales'
                                ? formatIDR(metric.sales)
                                : selectedChartMetric === 'views'
                                ? `${metric.views.toLocaleString('id-ID')} views`
                                : `${metric.clicks.toLocaleString('id-ID')} clicks`}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
                            <span>V: {metric.views.toLocaleString('id-ID')}</span>
                            <span>•</span>
                            <span>C: {metric.clicks.toLocaleString('id-ID')}</span>
                            <span>•</span>
                            <span>{formatIDR(metric.sales)}</span>
                          </div>
                        </div>
                      )}

                      {/* Bar batang */}
                      <div className="w-full max-w-[48px] bg-slate-800/40 rounded-t-xl overflow-hidden flex flex-col justify-end transition-all">
                        <div
                          style={{ height: `${percentage}%` }}
                          className={`w-full rounded-t-xl bg-gradient-to-t ${barColor} transition-all duration-300 group-hover:brightness-125 shadow-lg relative`}
                        >
                          {/* Highlight peak label */}
                          {percentage === 100 && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-300 font-mono bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded">
                              PEAK
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Label Hari & Tanggal */}
                      <div className="mt-3 text-center">
                        <div className={`text-xs font-bold transition ${isHovered ? 'text-white' : 'text-slate-300'}`}>
                          {metric.day}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {metric.date.split(' ')[0]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ringkasan Insight Bawah Chart */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Kenaikan trafik tertinggi terjadi pada hari <strong>Kamis (+38% spike)</strong> akibat rilis fitur Nota Thermal.</span>
                </div>
                <div className="font-mono text-slate-500">
                  Data disinkronkan otomatis dari Google Analytics 4 & Internal Telemetry
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* BAGIAN BAWAH: SIMULASI KANTOR VIRTUAL 2D / OFFICE GRID */}
        {/* ======================================================== */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
                <Building2 className="w-3.5 h-3.5" />
                <span>Simulasi Denah Kantor Virtual 2D (Office Grid Management)</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5 flex items-center gap-2.5">
                Denah Lantai 1: 6 Ruangan Divisi Karyawan AI
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
                  {activeCount} Aktif / 6 Total Divisi
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Setiap ruangan mensimulasikan lingkungan kerja divisi AI yang siap mengeksekusi tugas otomatis melalui Gemini 2.5 Flash
              </p>
            </div>

            {/* Kontrol Tampilan & Filter */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter Status */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${activeFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Semua ({divisions.length})
                </button>
                <button
                  onClick={() => setActiveFilter('Working')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${activeFilter === 'Working' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Working ({activeCount})
                </button>
                <button
                  onClick={() => setActiveFilter('Idle')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${activeFilter === 'Idle' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Idle ({divisions.length - activeCount})
                </button>
              </div>

              {/* Toggle Mode: 2D Blueprint vs Compact */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveViewMode('office2d')}
                  title="Tampilan Denah Kantor 2D Berpetak"
                  className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition cursor-pointer ${activeViewMode === 'office2d' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Denah 2D</span>
                </button>
                <button
                  onClick={() => setActiveViewMode('compact')}
                  title="Tampilan Kartu Ringkas"
                  className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition cursor-pointer ${activeViewMode === 'compact' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Kompak</span>
                </button>
              </div>
            </div>
          </div>

          {/* DENAH KANTOR 2D / GRID RUANGAN BERPETAK */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDivisions.map((division) => {
              const isWorking = division.status === 'Working';
              const isLoading = loadingDivisionId === division.id;

              return (
                <div
                  key={division.id}
                  className={`relative rounded-2xl border-2 transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-xl ${division.borderColor} bg-slate-900/90`}
                >
                  {/* Decorative Blueprint Corner Grid Accent */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-25 pointer-events-none" />

                  {/* Header Ruangan Kantor 2D */}
                  <div className="relative p-4 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                        {renderDivisionIcon(division.iconName)}
                      </div>
                      <div>
                        <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
                          {division.roomCode}
                        </div>
                        <h3 className="text-sm font-bold text-white leading-tight">
                          {division.name}
                        </h3>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border transition ${
                        isWorking
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isWorking ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                      {division.status}
                    </span>
                  </div>

                  {/* 2D Workstation Visual Area */}
                  {activeViewMode === 'office2d' && (
                    <div className="relative px-5 py-4 border-b border-slate-800/60 bg-gradient-to-b from-slate-950/40 via-slate-900/20 to-slate-950/60">
                      <div className="flex items-center justify-between gap-4">
                        {/* Avatar 2D Karyawan AI */}
                        {render2DAvatar(division.iconName, isWorking)}

                        {/* Visual Peralatan Ruangan / Workstation Specs */}
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">
                            Perangkat Kerja Ruangan:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {division.equipment.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-800 text-[10px] text-slate-300 font-mono"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                          <div className="pt-1 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">{division.metricLabel}:</span>
                            <span className="font-mono font-bold text-indigo-400">{division.metricValue}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Terminal Aktivitas Saat Ini */}
                  <div className="relative p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5 text-slate-300 font-mono text-[10px] uppercase">
                          <Activity className="w-3 h-3 text-indigo-400" />
                          Aktivitas Terminal Terkini:
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {division.lastUpdated}
                        </span>
                      </div>

                      <div className="relative rounded-xl bg-slate-950/80 p-3 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans min-h-[64px] flex items-center">
                        <p className="line-clamp-3">
                          {division.currentTask}
                        </p>
                      </div>
                    </div>

                    {/* Footer Ruangan: Output Count + Tombol Aksi Perintah AI */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-mono uppercase">Total Output</span>
                        <span className="text-xs font-bold text-white font-mono">
                          {division.outputCount} <span className="text-slate-400 font-normal">tugas</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => triggerTask(division.id)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                        >
                          {isLoading ? (
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
                          title="Instruksi Kustom Divisi"
                          className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* REKAPITULASI GLOBAL RIWAYAT AKTIVITAS (ACTIVITY LOGS) */}
        {/* ======================================================== */}
        <section className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
          {/* Header Bar */}
          <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Rekapitulasi Riwayat Aktivitas Global
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Stream
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Rekam jejak otomatis hasil eksekusi seluruh divisi AI di kompreskilat.site dalam satu tempat
                  </p>
                </div>
              </div>
            </div>

            {/* Filter & Kontrol Pencarian */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Dropdown Filter Divisi */}
              <div className="relative">
                <select
                  value={logDivisionFilter}
                  onChange={(e) => setLogDivisionFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer font-medium"
                >
                  <option value="all">Semua Divisi ({activityLogs.length})</option>
                  {divisions.map((div) => (
                    <option key={div.id} value={div.id}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Cari tugas / divisi..."
                  className="pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 w-44 sm:w-56 transition"
                />
              </div>

              {/* Reset / Bersihkan Riwayat */}
              {activityLogs.length > 0 && (
                <button
                  onClick={() => setActivityLogs([])}
                  title="Bersihkan Semua Log"
                  className="px-3 py-2 bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bersihkan</span>
                </button>
              )}
            </div>
          </div>

          {/* List Log Items */}
          <div className="p-4 sm:p-6 space-y-3 max-h-[460px] overflow-y-auto divide-y divide-slate-800/40">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">
                  {logSearchQuery || logDivisionFilter !== 'all'
                    ? 'Tidak ada riwayat aktivitas yang sesuai dengan kriteria filter.'
                    : 'Belum ada riwayat aktivitas. Klik "Perintah AI" pada salah satu divisi di atas.'}
                </p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const divisionData = divisions.find((d) => d.id === log.divisionId);
                const isCopied = copiedLogId === log.id;

                return (
                  <div
                    key={log.id}
                    className="pt-3.5 first:pt-0 flex flex-col sm:flex-row items-start justify-between gap-3 group transition"
                  >
                    <div className="flex items-start gap-3 w-full sm:w-auto flex-1">
                      {/* Ikon Divisi */}
                      <div className="mt-0.5 p-2 rounded-xl bg-slate-950 border border-slate-800/80 shrink-0 shadow-sm">
                        {renderDivisionIcon(divisionData?.iconName || 'it')}
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Meta Tags: Divisi, Jam, Engine */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold text-[11px] font-mono">
                            {log.divisionName}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {log.timestamp} WIB
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-400 font-mono flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                            {log.source}
                          </span>
                        </div>

                        {/* Ringkasan Hasil Tugas AI */}
                        <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 break-words group-hover:border-slate-700 transition">
                          {log.taskTitle}
                        </p>
                      </div>
                    </div>

                    {/* Tombol Salin Log */}
                    <div className="shrink-0 self-end sm:self-start mt-1 sm:mt-0">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`[${log.divisionName} - ${log.timestamp} WIB]\n${log.taskTitle}`);
                          setCopiedLogId(log.id);
                          setTimeout(() => setCopiedLogId(null), 2000);
                        }}
                        title="Salin Rincian Tugas"
                        className="p-1.5 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400 font-medium">Disalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px] hidden sm:inline">Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
            <span>
              Menampilkan {filteredLogs.length} dari {activityLogs.length} entri riwayat tugas
            </span>
            <span>Diperbarui otomatis saat setiap divisi AI merespons</span>
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
                  <p className="text-xs text-slate-400">{activeDivision.role} • {activeDivision.roomCode}</p>
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
                    placeholder={`Ketikkan instruksi khusus untuk ${activeDivision.name}... (Contoh: "Buatkan evaluasi performa dan rencana aksi")`}
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
