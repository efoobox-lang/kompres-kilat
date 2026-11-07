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
  RefreshCw,
  Share2,
  X,
  Settings,
  Plus,
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

export type AgentStatusType = 'Working' | 'Idle' | 'Blocked';

export interface MonitoredAgent {
  id: string;
  name: string;
  role: string;
  status: AgentStatusType;
  cpuLoad: number | null;
  memoryUsage: string | null;
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
  priority?: 'low' | 'medium' | 'high';
  stage: 'backlog' | 'in_progress' | 'review' | 'done';
  createdAt: string;
}

type IntegrationStatus = 'connected' | 'missing' | 'error' | 'unverified';

interface IntegrationCheck {
  id: string;
  name: string;
  status: IntegrationStatus;
  message: string;
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
    createdAt: 'Hari ini',
  },
  {
    id: 'kb-2',
    title: 'Draf Panduan Tutorial: Pembuatan Kwitansi Digital Resmi UMKM',
    divisionId: 'seo',
    divisionName: 'SEO & Content',
    priority: 'high',
    stage: 'review',
    createdAt: 'Hari ini',
  },
  {
    id: 'kb-3',
    title: 'Optimasi Web Worker untuk Kompresi Batch Gambar 20+ Berkas Sekaligus',
    divisionId: 'it',
    divisionName: 'IT & Sistem',
    priority: 'medium',
    stage: 'in_progress',
    createdAt: 'Besok',
  },
  {
    id: 'kb-4',
    title: 'Penyusunan Utas Edukasi Privasi File Client-Side di X/Twitter',
    divisionId: 'sosmed',
    divisionName: 'Admin & Sosmed',
    priority: 'low',
    stage: 'in_progress',
    createdAt: 'Besok',
  },
  {
    id: 'kb-5',
    title: 'Riset Kata Kunci Ekspor PDF ke Word Tanpa Merusak Format',
    divisionId: 'seo',
    divisionName: 'SEO & Content',
    priority: 'medium',
    stage: 'backlog',
    createdAt: 'Lusa',
  },
];

export default function MonitoringCenterPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [agents, setAgents] = useState<MonitoredAgent[]>(() => initialMonitoredAgents);
  const [handovers, setHandovers] = useState<TaskHandover[]>(() => initialHandovers);
  const [kanban, setKanban] = useState<KanbanItem[]>(() => initialKanban);
  const [agentFilter, setAgentFilter] = useState<'all' | AgentStatusType>('all');
  const [kanbanSearch, setKanbanSearch] = useState<string>('');

  // Live Telemetry Vercel
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);
  const [integrations, setIntegrations] = useState<IntegrationCheck[]>([]);
  const [isCheckingIntegrations, setIsCheckingIntegrations] = useState<boolean>(false);
  const [integrationCheckError, setIntegrationCheckError] = useState<string | null>(null);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);

  // Modal Pengaturan Kredensial Medsos
  const [isSocialModalOpen, setIsSocialModalOpen] = useState<boolean>(false);
  const [fbPageId, setFbPageId] = useState<string>('122099691567541521');
  const [fbToken, setFbToken] = useState<string>('');
  const [igUserId, setIgUserId] = useState<string>('17841420772273253');
  const [igToken, setIgToken] = useState<string>('');
  const [isSavingSocial, setIsSavingSocial] = useState<boolean>(false);
  const [socialSaveSuccess, setSocialSaveSuccess] = useState<string | null>(null);

  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSocial(true);
    setSocialSaveSuccess(null);
    try {
      const res = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facebookPageId: fbPageId,
          facebookToken: fbToken,
          instagramUserId: igUserId,
          instagramToken: igToken || fbToken,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSocialSaveSuccess('Kredensial berhasil disimpan! Memverifikasi koneksi...');
        await fetchIntegrations();
        setTimeout(() => setIsSocialModalOpen(false), 1200);
      } else {
        throw new Error(data.error || 'Gagal menyimpan kredensial.');
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan.');
    } finally {
      setIsSavingSocial(false);
    }
  };

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

  const fetchIntegrations = async () => {
    setIsCheckingIntegrations(true);
    setIntegrationCheckError(null);
    try {
      const response = await fetch('/api/admin/integrations', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !Array.isArray(result.integrations)) {
        throw new Error(result.error || 'Gagal memeriksa koneksi layanan.');
      }
      setIntegrations(result.integrations);
    } catch (error) {
      setIntegrationCheckError(error instanceof Error ? error.message : 'Gagal memeriksa koneksi layanan.');
    } finally {
      setIsCheckingIntegrations(false);
    }
  };

  // Sinkronisasi data pemantauan agen, handover, dan papan kanban
  const loadMonitoringData = async (token?: string) => {
    try {
      const storedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('kk_admin_token') : null);
      const headers: Record<string, string> = {};
      if (storedToken) headers['x-admin-token'] = storedToken;

      const historyResponse = await fetch('/api/ai-agent/history', { cache: 'no-store', headers });
      const history = await historyResponse.json();
      const rows = historyResponse.ok && Array.isArray(history.data) ? (history.data as Array<Record<string, unknown>>) : [];

      const divisions = [
        ['it', 'Divisi IT & Sistem', 'SysAdmin'],
        ['analytics', 'Divisi Analytics', 'Data Analyst'],
        ['marketing', 'Divisi Marketing & Growth', 'Growth'],
        ['sosmed', 'Divisi Admin & Sosmed', 'Community Manager'],
        ['creative', 'Divisi Video & Kreatif', 'Art Director'],
        ['seo', 'Divisi SEO & Content Writer', 'SEO Strategist'],
      ] as const;

      setAgents(divisions.map(([id, name, role]) => {
        const base = initialMonitoredAgents.find((a) => a.id === id) || {
          id,
          name,
          role,
          status: 'Working' as AgentStatusType,
          cpuLoad: 28,
          memoryUsage: '36MB / 128MB',
          currentAction: 'Standby dalam sistem',
          lastActive: 'Baru saja',
          totalCompleted: 15,
        };
        const tasks = rows.filter((row) => row.division_id === id);
        const latest = tasks[0];

        if (latest) {
          const actionText = typeof latest.prompt === 'string' && latest.prompt.trim()
            ? `Tugas aktif: ${latest.prompt}`
            : base.currentAction;
          const timeText = typeof latest.created_at === 'string'
            ? new Date(latest.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
            : base.lastActive;
          return {
            ...base,
            status: 'Working' as AgentStatusType,
            cpuLoad: base.cpuLoad ? Math.max(base.cpuLoad, 32) : 38,
            memoryUsage: base.memoryUsage || '42MB / 128MB',
            currentAction: actionText,
            lastActive: timeText,
            totalCompleted: Math.max(base.totalCompleted, tasks.length),
          };
        }

        return base;
      }));

      // Handovers sync
      if (rows.length > 0) {
        const dynamicHandovers: TaskHandover[] = rows.slice(0, 3).map((r, idx) => ({
          id: `ho-live-${r.id || idx}`,
          fromDivision: String(r.division_name || 'Divisi Pelaksana'),
          toDivision: r.status === 'published_to_social' ? 'Divisi Admin & Sosmed' : 'Supervisor / QA Review',
          taskTitle: String(r.prompt || 'Tugas operasional diserahkan untuk proses lanjutan'),
          timestamp: typeof r.created_at === 'string'
            ? new Date(r.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
            : 'Baru saja',
          status: r.status === 'pending_approval' ? 'in_review' : 'accepted',
        }));

        setHandovers((prev) => {
          const combined = [...dynamicHandovers];
          const source = prev.length > 0 ? prev : initialHandovers;
          for (const h of source) {
            if (!combined.some((item) => item.id === h.id)) {
              combined.push(h);
            }
          }
          return combined;
        });
      }

      // Kanban sync
      const realKanbanItems: KanbanItem[] = rows.map((row) => {
        let stage: 'backlog' | 'in_progress' | 'review' | 'done' = 'done';
        if (row.status === 'pending_approval' || row.status === 'revision') {
          stage = 'review';
        } else if (row.status === 'approved') {
          stage = 'in_progress';
        } else if (row.status === 'completed' || row.status === 'published_to_social') {
          stage = 'done';
        } else {
          stage = 'in_progress';
        }
        return {
          id: String(row.id),
          title: typeof row.prompt === 'string' && row.prompt ? row.prompt : String(row.division_name),
          divisionId: String(row.division_id || 'sosmed'),
          divisionName: String(row.division_name || 'Admin & Sosmed'),
          stage,
          createdAt: typeof row.created_at === 'string'
            ? new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
            : 'Hari ini',
        };
      });

      setKanban((prev) => {
        const combined = [...realKanbanItems];
        const source = prev.length > 0 ? prev : initialKanban;
        for (const k of source) {
          if (!combined.some((item) => item.id === k.id)) {
            combined.push(k);
          }
        }
        return combined;
      });
    } catch (e) {
      console.warn('Gagal memuat detail riwayat pemantauan:', e);
    }
  };

  useEffect(() => {
    setMounted(true);
    let active = true;

    const checkSession = async () => {
      try {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('kk_admin_token') : null;
        const headers: Record<string, string> = {};
        if (storedToken) headers['x-admin-token'] = storedToken;

        const response = await fetch('/api/admin/auth', { cache: 'no-store', headers });
        const result = await response.json();
        if (!active) return;
        if (!response.ok && response.status !== 401) {
          setAuthError(result.error || 'Autentikasi admin belum dikonfigurasi.');
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          return;
        }

        if (!result.authenticated) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('kk_admin_token');
            localStorage.removeItem('kk_admin_auth');
          }
          return;
        }

        setIsAuthenticated(true);
        setIsCheckingAuth(false);
        await loadMonitoringData(storedToken || undefined);
      } catch {
        if (active) {
          setAuthError('Tidak dapat memeriksa sesi administrator.');
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
      }
    };

    void checkSession();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAnalytics();
    fetchIntegrations();
    const interval = setInterval(fetchAnalytics, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Login gagal.');

      if (result.token && typeof window !== 'undefined') {
        localStorage.setItem('kk_admin_token', result.token);
        localStorage.setItem('kk_admin_auth', 'true');
      }

      setIsAuthenticated(true);
      setIsCheckingAuth(false);
      setPasswordInput('');
      await loadMonitoringData(result.token);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login gagal.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kk_admin_token');
      localStorage.removeItem('kk_admin_auth');
    }
    setIsAuthenticated(false);
    setIsCheckingAuth(false);
    setPasswordInput('');
  };

  // Interaksi Supervisor: Toggle Status Divisi Agen
  const handleToggleAgentStatus = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== agentId) return a;
        const nextStatus: AgentStatusType = a.status === 'Working' ? 'Idle' : 'Working';
        return {
          ...a,
          status: nextStatus,
          cpuLoad: nextStatus === 'Working' ? Math.floor(Math.random() * 25 + 35) : Math.floor(Math.random() * 5 + 4),
        };
      })
    );
  };

  // Interaksi Supervisor: Simulasi Handover Antar Divisi
  const handleAddHandoverSimulation = () => {
    const simulationPool = [
      {
        from: 'Divisi SEO & Content Writer',
        to: 'Divisi Admin & Sosmed',
        title: 'Draf Panduan Kompres Foto KTP 200KB diserahkan untuk dijadwalkan ke Instagram feed & reels',
      },
      {
        from: 'Divisi IT & Sistem',
        to: 'Divisi Analytics',
        title: 'Log audit performa Web Worker & latensi CDN diserahkan untuk analisis rasio konversi',
      },
      {
        from: 'Divisi Marketing & Growth',
        to: 'Divisi Video & Kreatif',
        title: 'Konsep flyer promosi konversi PDF ke JPG kilat diserahkan untuk render visual HD',
      },
      {
        from: 'Divisi Video & Kreatif',
        to: 'Divisi Admin & Sosmed',
        title: 'Aset carousel 1080x1080 kompres dokumen lamaran kerja siap diunggah ke Facebook Page',
      },
    ];
    const picked = simulationPool[Math.floor(Math.random() * simulationPool.length)];
    const newHo: TaskHandover = {
      id: `ho-sim-${Date.now()}`,
      fromDivision: picked.from,
      toDivision: picked.to,
      taskTitle: picked.title,
      timestamp: 'Baru saja',
      status: 'transferred',
    };
    setHandovers((prev) => [newHo, ...prev]);
  };

  // Interaksi Supervisor: Ubah Status Handover (Diterima / Review / Diserahkan)
  const handleToggleHandoverStatus = (hoId: string) => {
    setHandovers((prev) =>
      prev.map((h) => {
        if (h.id !== hoId) return h;
        const nextStatus: 'transferred' | 'in_review' | 'accepted' =
          h.status === 'transferred' ? 'in_review' : h.status === 'in_review' ? 'accepted' : 'transferred';
        return { ...h, status: nextStatus };
      })
    );
  };

  // Interaksi Supervisor: Pindahkan Kartu Kanban Antar Kolom
  const kanbanStages: Array<'backlog' | 'in_progress' | 'review' | 'done'> = ['backlog', 'in_progress', 'review', 'done'];
  const handleMoveKanbanStage = (itemId: string, direction: 'prev' | 'next') => {
    setKanban((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const currentIndex = kanbanStages.indexOf(item.stage);
        const nextIndex = direction === 'next' ? Math.min(currentIndex + 1, kanbanStages.length - 1) : Math.max(currentIndex - 1, 0);
        return { ...item, stage: kanbanStages[nextIndex] };
      })
    );
  };

  // Interaksi Supervisor: Tambah Kartu Ideasi Cepat ke Backlog
  const handleQuickAddKanban = () => {
    const defaultTitle = prompt('Masukkan ide atau judul tugas untuk Backlog AI:');
    if (!defaultTitle || !defaultTitle.trim()) return;
    const newItem: KanbanItem = {
      id: `kb-user-${Date.now()}`,
      title: defaultTitle.trim(),
      divisionId: 'seo',
      divisionName: 'SEO & Content',
      priority: 'high',
      stage: 'backlog',
      createdAt: 'Baru saja',
    };
    setKanban((prev) => [newItem, ...prev]);
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  if (!mounted || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse mb-3">
          <Activity className="w-6 h-6 text-indigo-400" />
        </div>
        <p className="text-xs font-mono text-slate-400">Memverifikasi sesi supervisor...</p>
      </div>
    );
  }

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
          latency={analyticsData?.latency || 'Belum terukur'}
          uptime={analyticsData?.uptime || 'Belum terukur'}
          onSync={fetchAnalytics}
          isSyncing={isLoadingAnalytics}
          sfxEnabled={sfxEnabled}
          onToggleSfx={() => setSfxEnabled(!sfxEnabled)}
          onLogout={handleLogout}
        />

        <section className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-950/70 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                Pemeriksaan koneksi layanan
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Memvalidasi koneksi server-side. Cek token tidak menjamin izin publikasi; validasi aksi aktual tetap perlu dilakukan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSocialModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-600/20 px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30 transition cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5 text-indigo-400" />
                <span>Atur Kredensial Medsos</span>
              </button>
              <button
                type="button"
                onClick={fetchIntegrations}
                disabled={isCheckingIntegrations}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isCheckingIntegrations ? 'animate-spin' : ''}`} />
                {isCheckingIntegrations ? 'Memeriksa...' : 'Periksa koneksi'}
              </button>
            </div>
          </div>
          {integrationCheckError && (
            <p role="alert" className="m-4 rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-200">
              {integrationCheckError}
            </p>
          )}
          {integrations.length > 0 ? (
            <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {integrations.map((integration) => {
                const connected = integration.status === 'connected';
                const statusLabel = {
                  connected: 'Terhubung',
                  missing: 'Belum dikonfigurasi',
                  error: 'Pemeriksaan gagal',
                  unverified: 'Belum diverifikasi',
                }[integration.status];
                return (
                  <div key={integration.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-white">{integration.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        connected
                          ? 'bg-emerald-500/10 text-emerald-300'
                          : integration.status === 'unverified'
                            ? 'bg-amber-500/10 text-amber-300'
                            : 'bg-rose-500/10 text-rose-300'
                      }`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{integration.message}</p>
                  </div>
                );
              })}
            </div>
          ) : !integrationCheckError && (
            <p className="p-5 text-xs text-slate-500">
              {isCheckingIntegrations ? 'Memeriksa konfigurasi dan koneksi...' : 'Belum ada hasil pemeriksaan.'}
            </p>
          )}
        </section>

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
                7 hari
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-white font-mono">
              {analyticsData ? analyticsData.totalViews.toLocaleString('id-ID') : <span className="animate-pulse text-lg text-slate-500">Menghitung...</span>}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              {analyticsData ? `Rata-rata: ~${analyticsData.avgDailyViews}/hari` : 'Belum terhubung'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <MousePointerClick className="w-3.5 h-3.5 text-purple-400" />
                Total Clicks
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono">
                {analyticsData?.clicksGrowth || 'Belum terhubung'}
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
                7 hari
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-white font-mono">
              {analyticsData ? analyticsData.uniqueVisitors.toLocaleString('id-ID') : <span className="animate-pulse text-lg text-slate-500">Menghitung...</span>}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              {analyticsData ? `${analyticsData.uniqueVisitors} pengunjung unik (7 hari)` : 'Menghubungkan...'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Monetisasi
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                {analyticsData?.salesGrowth || 'Belum terukur'}
              </span>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-extrabold text-white font-mono">
              {analyticsData && analyticsData.totalSales !== null ? formatIDR(analyticsData.totalSales) : 'Belum diukur'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">Data transaksi belum diintegrasikan</div>
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
                  STATUS DIVISI // DATA TUGAS TERSIMPAN
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                Aktivitas Tugas 6 Divisi AI
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
            {filteredAgents.length === 0 && (
              <p className="md:col-span-2 lg:col-span-3 py-8 text-center text-sm text-slate-500">
                Data agen belum tersedia. Jalankan tugas melalui AI Employee untuk mencatat aktivitas.
              </p>
            )}
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

                    <button
                      type="button"
                      onClick={() => handleToggleAgentStatus(agent.id)}
                      title="Klik untuk ubah status divisi (Working / Idle)"
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border transition cursor-pointer hover:opacity-80 ${
                        isWorking
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse'
                          : isBlocked
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {agent.status}
                    </button>
                  </div>

                  {/* CPU / Token Load Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Beban CPU / token:</span>
                      <strong className="text-slate-200">{agent.cpuLoad !== null ? `${agent.cpuLoad}%` : '28%'}</strong>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          (agent.cpuLoad || 28) > 45 ? 'bg-indigo-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${agent.cpuLoad || 28}%` }}
                      />
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 text-right">
                      Memori: {agent.memoryUsage || '36MB / 128MB'}
                    </div>
                  </div>

                  {/* Action Description */}
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-300 min-h-[48px] flex items-center">
                    <p className="line-clamp-2">{agent.currentAction}</p>
                  </div>

                  {/* Status Toggle Quick Buttons */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">{agent.totalCompleted} tugas tersimpan</span>
                    <span className="text-slate-500">Terakhir: {agent.lastActive}</span>
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
          <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">Log Perpindahan Tugas Antar Divisi (Task Handovers)</h3>
                <p className="text-xs text-slate-400">
                  Riwayat otomatis operasional saat satu agen menyerahkan draf / data ke divisi pendukung
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddHandoverSimulation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-semibold text-indigo-300 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Simulasi Handover</span>
              </button>
              <span className="text-xs font-mono px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                {handovers.length} Handover
              </span>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {handovers.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                Belum ada perpindahan tugas antar divisi. Klik &apos;+ Simulasi Handover&apos; untuk menguji alur kerja.
              </p>
            ) : (
              handovers.map((ho) => (
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
                    <button
                      type="button"
                      onClick={() => handleToggleHandoverStatus(ho.id)}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition cursor-pointer ${
                        ho.status === 'accepted'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : ho.status === 'in_review'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                      }`}
                      title="Klik untuk ubah status penerimaan"
                    >
                      {ho.status === 'accepted' ? '✓ DITERIMA' : ho.status === 'in_review' ? '⏱ DALAM REVIEW' : '➔ DISERAHKAN'}
                    </button>
                  </div>
                </div>
              ))
            )}
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

            {/* Quick Add & Search Box */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleQuickAddKanban}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-semibold text-purple-300 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Ideasi Baru</span>
              </button>
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
          </div>

          <div className="px-5 py-3 border-b border-slate-800/80 text-xs text-slate-400">
            Alur kerja terpadu: pantau dan kelola tiket dari ideasi backlog, implementasi oleh AI Employee, review supervisor, hingga publikasi/selesai.
          </div>

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
                            <span className="text-[9px] text-slate-500">{item.createdAt || 'Aktif'}</span>
                          </div>

                          <p className="text-xs text-slate-200 leading-snug">{item.title}</p>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                            <span className="text-slate-500 text-[9px]">ID: {item.id.slice(-6)}</span>
                            <div className="flex items-center gap-1">
                              {col.stage !== 'backlog' && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveKanbanStage(item.id, 'prev')}
                                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[10px] font-bold cursor-pointer"
                                  title="Pindahkan ke kolom sebelumnya"
                                >
                                  ←
                                </button>
                              )}
                              {col.stage !== 'done' && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveKanbanStage(item.id, 'next')}
                                  className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition text-[10px] font-bold cursor-pointer"
                                  title="Lanjutkan ke kolom berikutnya"
                                >
                                  →
                                </button>
                              )}
                              {col.stage === 'done' && (
                                <span className="text-emerald-400 text-[10px] font-bold">✓ Tuntas</span>
                              )}
                            </div>
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

      {/* MODAL PENGATURAN KREDENSIAL MEDSOS */}
      {isSocialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Pengaturan Kredensial Medsos</h3>
                  <p className="text-xs text-slate-400">Hubungkan Meta Graph API (Facebook Page & Instagram)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSocialModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSocial} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Facebook Page ID
                </label>
                <input
                  type="text"
                  value={fbPageId}
                  onChange={(e) => setFbPageId(e.target.value)}
                  placeholder="122094750927548983"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">ID Halaman Facebook Kompres Kilat.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Facebook Page Access Token
                </label>
                <textarea
                  rows={2}
                  value={fbToken}
                  onChange={(e) => setFbToken(e.target.value)}
                  placeholder="Paste Access Token aktif dari Meta Graph API Explorer..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Token akses yang memiliki izin pages_show_list, pages_read_engagement, instagram_content_publish.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Instagram Business Account ID
                </label>
                <input
                  type="text"
                  value={igUserId}
                  onChange={(e) => setIgUserId(e.target.value)}
                  placeholder="17841420772273253"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">ID akun profesional Instagram @kompreskilat.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Instagram Access Token (Opsional jika sama dengan FB Token)
                </label>
                <textarea
                  rows={2}
                  value={igToken}
                  onChange={(e) => setIgToken(e.target.value)}
                  placeholder="Kosongkan jika menggunakan token yang sama dengan Facebook..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {socialSaveSuccess && (
                <p className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
                  {socialSaveSuccess}
                </p>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSocialModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingSocial}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingSocial ? 'Menyimpan & Memverifikasi...' : 'Simpan & Verifikasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
