'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Eye,
  MousePointerClick,
  Users,
  DollarSign,
  Search,
  Filter,
  CheckSquare,
  ShieldCheck,
  Edit3,
  Copy,
  Lock,
  KeyRound,
  EyeOff,
  Terminal,
  Zap,
  ArrowLeftRight,
  Plus,
  Trash2,
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

export type AgentStatusType = 'Working' | 'Idle' | 'Blocked';

export interface MonitoredAgent {
  id: string;
  name: string;
  role: string;
  status: AgentStatusType;
  cpuLoad: number;
  memoryUsage: string;
  currentAction: string;
  blockedReason?: string;
  lastActive: string;
  totalCompleted: number;
}

export interface TaskHandover {
  id: string;
  fromDivision: string;
  toDivision: string;
  taskTitle: string;
  timestamp: string;
  status: 'transferred' | 'accepted' | 'in_review';
}

export interface KanbanItem {
  id: string;
  title: string;
  divisionId: string;
  divisionName: string;
  priority: 'low' | 'medium' | 'high';
  stage: 'backlog' | 'in_progress' | 'review' | 'done';
  dueDate: string;
}

const initialMonitoredAgents: MonitoredAgent[] = [
  {
    id: 'it',
    name: 'Divisi IT & Sistem',
    role: 'Lead SysAdmin',
    status: 'Working',
    cpuLoad: 38,
    memoryUsage: '42MB / 128MB',
    currentAction: 'Pemantauan latensi edge network 24ms & sinkronisasi Vercel worker',
    lastActive: 'Baru saja',
    totalCompleted: 42,
  },
  {
    id: 'analytics',
    name: 'Divisi Analytics',
    role: 'Data Scientist',
    status: 'Working',
    cpuLoad: 24,
    memoryUsage: '36MB / 128MB',
    currentAction: 'Pengambilan telemetri 91 views & 7 pengunjung unik platform',
    lastActive: '1 menit lalu',
    totalCompleted: 34,
  },
  {
    id: 'marketing',
    name: 'Divisi Marketing & Growth',
    role: 'Growth Optimizer',
    status: 'Idle',
    cpuLoad: 4,
    memoryUsage: '22MB / 128MB',
    currentAction: 'Standby: Menunggu penetapan target funnel kampanye baru',
    lastActive: '8 menit lalu',
    totalCompleted: 19,
  },
  {
    id: 'sosmed',
    name: 'Divisi Admin & Sosmed',
    role: 'Community Manager',
    status: 'Working',
    cpuLoad: 45,
    memoryUsage: '48MB / 128MB',
    currentAction: 'Penyusunan caption edukasi kompresi foto KTP CPNS tanpa bocor privasi',
    lastActive: '2 menit lalu',
    totalCompleted: 48,
  },
  {
    id: 'creative',
    name: 'Divisi Video & Kreatif',
    role: 'Art Director',
    status: 'Idle',
    cpuLoad: 6,
    memoryUsage: '28MB / 128MB',
    currentAction: 'Standby: Menunggu skrip storyboard invoice thermal selesai direview',
    lastActive: '12 menit lalu',
    totalCompleted: 11,
  },
  {
    id: 'seo',
    name: 'Divisi SEO & Content Writer',
    role: 'Search Strategist',
    status: 'Working',
    cpuLoad: 52,
    memoryUsage: '56MB / 128MB',
    currentAction: 'Penyusunan draf panduan UMKM & evaluasi schema data AdSense',
    lastActive: 'Baru saja',
    totalCompleted: 36,
  },
];

const initialHandovers: TaskHandover[] = [
  {
    id: 'ho-1',
    fromDivision: 'Divisi SEO & Content Writer',
    toDivision: 'Divisi Admin & Sosmed',
    taskTitle: 'Draf Artikel Invoice Thermal UMKM diserahkan untuk dibuatkan 3 variasi caption Instagram & X',
    timestamp: '08:42 WIB',
    status: 'accepted',
  },
  {
    id: 'ho-2',
    fromDivision: 'Divisi IT & Sistem',
    toDivision: 'Divisi Analytics',
    taskTitle: 'Laporan Telemetri Vercel Edge diserahkan untuk audit keselarasan rasio konversi',
    timestamp: '08:35 WIB',
    status: 'transferred',
  },
  {
    id: 'ho-3',
    fromDivision: 'Divisi Marketing & Growth',
    toDivision: 'Divisi Video & Kreatif',
    taskTitle: 'Brief Visual Promo Fitur Kompres KTP CPNS 200KB diserahkan untuk pembuatan thumbnail',
    timestamp: '08:15 WIB',
    status: 'in_review',
  },
];

const initialKanban: KanbanItem[] = [
  {
    id: 'kb-1',
    title: 'Audit Kompatibilitas AdSense pada Mode Cetak Struk Kasir',
    divisionId: 'analytics',
    divisionName: 'Analytics',
    priority: 'high',
    stage: 'done',
    dueDate: 'Hari ini',
  },
  {
    id: 'kb-2',
    title: 'Draf Panduan Tutorial: Pembuatan Kwitansi Digital Resmi UMKM',
    divisionId: 'seo',
    divisionName: 'SEO & Content',
    priority: 'high',
    stage: 'review',
    dueDate: 'Hari ini',
  },
  {
    id: 'kb-3',
    title: 'Optimasi Web Worker untuk Kompresi Batch Gambar 20+ Berkas Sekaligus',
    divisionId: 'it',
    divisionName: 'IT & Sistem',
    priority: 'medium',
    stage: 'in_progress',
    dueDate: 'Besok',
  },
  {
    id: 'kb-4',
    title: 'Penyusunan Utas Edukasi Privasi File Client-Side di X/Twitter',
    divisionId: 'sosmed',
    divisionName: 'Admin & Sosmed',
    priority: 'low',
    stage: 'in_progress',
    dueDate: 'Besok',
  },
  {
    id: 'kb-5',
    title: 'Riset Kata Kunci Ekspor PDF ke Word Tanpa Merusak Format',
    divisionId: 'seo',
    divisionName: 'SEO & Content',
    priority: 'medium',
    stage: 'backlog',
    dueDate: 'Lusa',
  },
];

export default function MonitoringCenterPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [agents, setAgents] = useState<MonitoredAgent[]>(initialMonitoredAgents);
  const [handovers, setHandovers] = useState<TaskHandover[]>(initialHandovers);
  const [kanban, setKanban] = useState<KanbanItem[]>(initialKanban);
  const [agentFilter, setAgentFilter] = useState<'all' | AgentStatusType>('all');
  const [kanbanSearch, setKanbanSearch] = useState<string>('');

  // Live Telemetry Vercel
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);

  // Quick New Task Modal / Input
  const [newKanbanTitle, setNewKanbanTitle] = useState<string>('');
  const [newKanbanDivision, setNewKanbanDivision] = useState<string>('it');

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch('/api/analytics', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setAnalyticsData(json.data);
      }
    } catch (e) {
      console.warn('Gagal memuat analitik:', e);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    try {
      const savedAuth = localStorage.getItem('kk_admin_session');
      if (savedAuth === 'authorized_2026') {
        setIsAuthenticated(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'kompreskilat2026';
    if (passwordInput.trim() === validPassword) {
      try {
        localStorage.setItem('kk_admin_session', 'authorized_2026');
      } catch {}
      setIsAuthenticated(true);
    } else {
      setAuthError('Password salah. Akses ditolak.');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('kk_admin_session');
    } catch {}
    setIsAuthenticated(false);
  };

  // Move Kanban Stage
  const moveKanban = (id: string, direction: 'next' | 'prev') => {
    const stages: Array<KanbanItem['stage']> = ['backlog', 'in_progress', 'review', 'done'];
    setKanban((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const currentIndex = stages.indexOf(item.stage);
          const nextIndex = direction === 'next' ? Math.min(stages.length - 1, currentIndex + 1) : Math.max(0, currentIndex - 1);
          return { ...item, stage: stages[nextIndex] };
        }
        return item;
      })
    );
  };

  const addKanbanItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKanbanTitle.trim()) return;

    const divisionNames: Record<string, string> = {
      it: 'IT & Sistem',
      analytics: 'Analytics',
      marketing: 'Marketing',
      sosmed: 'Admin & Sosmed',
      creative: 'Kreatif',
      seo: 'SEO & Content',
    };

    const newItem: KanbanItem = {
      id: `kb-${Date.now()}`,
      title: newKanbanTitle.trim(),
      divisionId: newKanbanDivision,
      divisionName: divisionNames[newKanbanDivision] || 'General',
      priority: 'medium',
      stage: 'backlog',
      dueDate: 'Baru dibuat',
    };

    setKanban((prev) => [newItem, ...prev]);
    setNewKanbanTitle('');
  };

  // Toggle Agent Status (Working / Idle / Blocked for testing)
  const toggleAgentStatus = (id: string, newStatus: AgentStatusType) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus, lastActive: 'Baru diubah' } : a))
    );
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  if (!mounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Akses Pusat Pemantauan</h2>
            <p className="text-xs text-slate-400">Masukkan kata sandi administrator kompreskilat.site</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Password rahasia admin..."
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && <p className="text-xs text-rose-400 mt-1.5">{authError}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              Buka Pemantauan
            </button>
          </form>
          <div className="text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredAgents = agents.filter((a) => agentFilter === 'all' || a.status === agentFilter);
  const filteredKanban = kanban.filter(
    (k) => !kanbanSearch || k.title.toLowerCase().includes(kanbanSearch.toLowerCase()) || k.divisionName.toLowerCase().includes(kanbanSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Header */}
        <AdminHeader
          currentTab="monitoring"
          latency={analyticsData?.latency || '24ms Edge'}
          uptime={analyticsData?.uptime || '99.98%'}
          onSync={fetchAnalytics}
          isSyncing={isLoadingAnalytics}
          sfxEnabled={sfxEnabled}
          onToggleSfx={() => setSfxEnabled(!sfxEnabled)}
          onLogout={handleLogout}
        />

        {/* ======================================================== */}
        {/* PANEL METRIK REAL-TIME VERCEL & TELEMETRI */}
        {/* ======================================================== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                Total Views
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-white font-mono">
              {analyticsData ? analyticsData.totalViews.toLocaleString('id-ID') : <span className="animate-pulse text-lg text-slate-500">Menghitung...</span>}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              {analyticsData ? `Rata-rata: ~${analyticsData.avgDailyViews}/hari` : 'Sinkronisasi...'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <MousePointerClick className="w-3.5 h-3.5 text-purple-400" />
                Total Clicks
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono">
                {analyticsData?.clicksGrowth || 'Live'}
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-white font-mono">
              {analyticsData ? analyticsData.totalClicks.toLocaleString('id-ID') : <span className="animate-pulse text-lg text-slate-500">Menghitung...</span>}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              {analyticsData ? `CTR: ${analyticsData.ctr}` : 'Menghitung CTR...'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Unique Visitors
              </span>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                Real-Time
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-white font-mono">
              {analyticsData ? analyticsData.uniqueVisitors.toLocaleString('id-ID') : <span className="animate-pulse text-lg text-slate-500">Menghitung...</span>}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              {analyticsData ? `${analyticsData.uniqueVisitors} pengunjung aktif` : 'Menghubungkan...'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Monetisasi
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                {analyticsData?.salesGrowth || '0%'}
              </span>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-extrabold text-white font-mono">
              {analyticsData ? formatIDR(analyticsData.totalSales) : formatIDR(0)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">Tahap awal platform</div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 1: MATRIKS STATUS AGEN (WORKING, IDLE, BLOCKED) */}
        {/* ======================================================== */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  AGENT STATUS MATRIX // LIVE TELEMETRY
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                Status Kapasitas & Beban Kerja 6 Divisi AI
              </h2>
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              {(['all', 'Working', 'Idle', 'Blocked'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setAgentFilter(st)}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-bold ${
                    agentFilter === st ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'all' ? `Semua (${agents.length})` : st}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => {
              const isWorking = agent.status === 'Working';
              const isBlocked = agent.status === 'Blocked';

              return (
                <div
                  key={agent.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 bg-slate-950/70 flex flex-col justify-between space-y-3 ${
                    isBlocked
                      ? 'border-rose-500/50 shadow-rose-500/10 shadow-lg'
                      : isWorking
                      ? 'border-indigo-500/40 shadow-indigo-500/10 shadow-lg'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{agent.role}</p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                        isWorking
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse'
                          : isBlocked
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>

                  {/* CPU / Token Load Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Beban Agen (CPU / Token):</span>
                      <strong className="text-slate-200">{agent.cpuLoad}%</strong>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          agent.cpuLoad > 45 ? 'bg-indigo-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${agent.cpuLoad}%` }}
                      />
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 text-right">
                      Memori: {agent.memoryUsage}
                    </div>
                  </div>

                  {/* Action Description */}
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-300 min-h-[48px] flex items-center">
                    <p className="line-clamp-2">{agent.currentAction}</p>
                  </div>

                  {/* Status Toggle Quick Buttons */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">{agent.totalCompleted} tugas tuntas</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleAgentStatus(agent.id, isWorking ? 'Idle' : 'Working')}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
                      >
                        Set: {isWorking ? 'Idle' : 'Work'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: LOG PERPINDAHAN TUGAS (TASK HANDOVERS) */}
        {/* ======================================================== */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">Log Perpindahan Tugas Antar Divisi (Task Handovers)</h3>
                <p className="text-xs text-slate-400">
                  Riwayat otomatis operasional saat satu agen menyerahkan draf / data ke divisi pendukung
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              {handovers.length} Handover
            </span>
          </div>

          <div className="p-6 space-y-3">
            {handovers.map((ho) => (
              <div
                key={ho.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-500/30 font-bold">
                      {ho.fromDivision}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="px-2.5 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-500/30 font-bold">
                      {ho.toDivision}
                    </span>
                    <span className="text-slate-500 text-[11px]">• {ho.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{ho.taskTitle}</p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    ✓ {ho.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: PAPAN KANBAN OPERASIONAL INTERAKTIF */}
        {/* ======================================================== */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-purple-400" />
                Papan Kanban Integrasi Alat Kerja & QA Pipeline
              </h3>
              <p className="text-xs text-slate-400">
                Lacak seluruh status tugas otomatis, tahap uji QA, dan draf artikel sebelum dirilis
              </p>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={kanbanSearch}
                onChange={(e) => setKanbanSearch(e.target.value)}
                placeholder="Cari kartu tugas..."
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Form Tambah Kartu Cepat */}
          <form onSubmit={addKanbanItem} className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={newKanbanTitle}
              onChange={(e) => setNewKanbanTitle(e.target.value)}
              placeholder="Tambahkan tugas atau item backlog baru..."
              className="flex-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <select
              value={newKanbanDivision}
              onChange={(e) => setNewKanbanDivision(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono"
            >
              <option value="it">IT & Sistem</option>
              <option value="analytics">Analytics</option>
              <option value="marketing">Marketing</option>
              <option value="sosmed">Admin & Sosmed</option>
              <option value="creative">Kreatif</option>
              <option value="seo">SEO & Content</option>
            </select>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kartu</span>
            </button>
          </form>

          {/* 4 Kolom Kanban */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(
              [
                { stage: 'backlog', title: '📋 Backlog & Ideasi', border: 'border-slate-800' },
                { stage: 'in_progress', title: '⚡ Sedang Dikerjakan', border: 'border-indigo-500/40' },
                { stage: 'review', title: '🔍 QA & Editorial Review', border: 'border-amber-500/40' },
                { stage: 'done', title: '✅ Selesai / Terbit', border: 'border-emerald-500/40' },
              ] as const
            ).map((col) => {
              const items = filteredKanban.filter((k) => k.stage === col.stage);

              return (
                <div key={col.stage} className={`p-4 rounded-2xl bg-slate-950/60 border ${col.border} space-y-3 flex flex-col justify-between`}>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-xs font-bold text-white font-mono">{col.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                      {items.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1 min-h-[140px]">
                    {items.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[11px] text-slate-600 font-mono py-6">
                        Kosong
                      </div>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-2 shadow-sm"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/20">
                              {item.divisionName}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded uppercase font-bold text-[9px] ${
                                item.priority === 'high'
                                  ? 'text-rose-400 bg-rose-500/10'
                                  : item.priority === 'medium'
                                  ? 'text-amber-400 bg-amber-500/10'
                                  : 'text-slate-400 bg-slate-800'
                              }`}
                            >
                              {item.priority}
                            </span>
                          </div>

                          <p className="text-xs text-slate-200 leading-snug">{item.title}</p>

                          {/* Tombol Geser Kolom */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                            <button
                              onClick={() => moveKanban(item.id, 'prev')}
                              disabled={col.stage === 'backlog'}
                              className="text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Pindahkan ke kolom sebelumnya"
                            >
                              ← Mundur
                            </button>
                            <span className="text-slate-600 text-[9px]">{item.dueDate}</span>
                            <button
                              onClick={() => moveKanban(item.id, 'next')}
                              disabled={col.stage === 'done'}
                              className="text-indigo-400 hover:text-indigo-300 disabled:opacity-30 cursor-pointer font-bold"
                              title="Pindahkan ke kolom selanjutnya"
                            >
                              Maju →
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
