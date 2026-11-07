'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Coffee,
  Dumbbell,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Flame,
  MessageSquare,
  Trophy,
  SlidersHorizontal,
  ChevronRight,
  Copy,
  Terminal,
  Film,
  Download,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  X,
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import PixelOfficeWorkstation from '@/components/admin/PixelOfficeWorkstation';

// Ikon Instagram SVG
const InstagramIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export type AgentMovementState = 'working' | 'walking' | 'huddle' | 'lounge' | 'gym';

export interface OfficeDivision {
  id: string;
  name: string;
  roomCode: string;
  role: string;
  iconName: 'it' | 'marketing' | 'sosmed' | 'creative' | 'seo' | 'analytics';
  accentColor: string;
  borderColor: string;
  status: 'Working' | 'Idle' | 'Blocked';
  currentTask: string;
  outputCount: number;
  lastUpdated: string;
  metricLabel: string;
  metricValue: string;
  movementState: AgentMovementState;
  level: number;
  xp: number;
  presetPrompts: string[];
}

const initialVirtualDivisions: OfficeDivision[] = [
  {
    id: 'it',
    name: 'Divisi IT & Sistem',
    roomCode: 'RUANG 101 // SERVER LAB',
    role: 'Lead Infrastructure & Edge SysAdmin',
    iconName: 'it',
    accentColor: 'from-cyan-500/20 via-blue-500/10 to-transparent text-cyan-400',
    borderColor: 'border-cyan-500/40 hover:border-cyan-400',
    status: 'Working',
    currentTask: 'Memantau telemetry Vercel Edge 24ms & kestabilan kompresi file di browser',
    outputCount: 42,
    lastUpdated: 'Baru saja',
    metricLabel: 'Edge Latency',
    metricValue: '24ms Optimal',
    movementState: 'working',
    level: 3,
    xp: 240,
    presetPrompts: [
      'Jalankan audit kesehatan server Vercel',
      'Periksa error log 404 & 500 terkini',
      'Optimasi pemakaian memori serverless worker',
    ],
  },
  {
    id: 'analytics',
    name: 'Divisi Analytics',
    roomCode: 'RUANG 102 // DATA LAB',
    role: 'Data Scientist & AdSense Auditor',
    iconName: 'analytics',
    accentColor: 'from-indigo-500/20 via-blue-500/10 to-transparent text-indigo-400',
    borderColor: 'border-indigo-500/40 hover:border-indigo-400',
    status: 'Working',
    currentTask: 'Merekapitulasi trafik organik Google Search Console dan kepatuhan AdSense',
    outputCount: 34,
    lastUpdated: '3 menit yang lalu',
    metricLabel: 'AdSense Health',
    metricValue: '100% Valid',
    movementState: 'working',
    level: 3,
    xp: 190,
    presetPrompts: [
      'Analisis trafik harian Google Search Console',
      'Cek kepatuhan penempatan iklan AdSense',
      'Hitung rasio retensi pengguna mingguan',
    ],
  },
  {
    id: 'marketing',
    name: 'Divisi Marketing & Growth',
    roomCode: 'RUANG 103 // GROWTH LAB',
    role: 'Growth & Funnel Optimizer',
    iconName: 'marketing',
    accentColor: 'from-purple-500/20 via-violet-500/10 to-transparent text-purple-400',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    status: 'Idle',
    currentTask: 'Menunggu target kampanye promosi fitur kompres foto KTP dan CPNS 200KB',
    outputCount: 19,
    lastUpdated: '8 menit yang lalu',
    metricLabel: 'CTR Konversi',
    metricValue: '27.47%',
    movementState: 'lounge',
    level: 2,
    xp: 130,
    presetPrompts: [
      'Rancang kampanye promosi fitur kompres KTP CPNS',
      'Buat analisis kompetitor alat kompres PDF online',
      'Susun kata kunci iklan Google Ads kompres foto',
    ],
  },
  {
    id: 'sosmed',
    name: 'Divisi Admin & Sosmed',
    roomCode: 'RUANG 104 // SOCIAL DESK',
    role: 'Social Media & Community Manager',
    iconName: 'sosmed',
    accentColor: 'from-pink-500/20 via-rose-500/10 to-transparent text-pink-400',
    borderColor: 'border-pink-500/40 hover:border-pink-400',
    status: 'Working',
    currentTask: 'Menyiapkan caption promosi alat kompres gambar & PDF tanpa upload server',
    outputCount: 48,
    lastUpdated: '1 menit yang lalu',
    metricLabel: 'Antrean Post',
    metricValue: '6 Konten',
    movementState: 'working',
    level: 4,
    xp: 320,
    presetPrompts: [
      'Buat caption Instagram/TikTok fitur kompres KTP',
      'Susun utas edukasi privasi file online di X',
      'Buat draf pesan sambutan pengguna baru',
    ],
  },
  {
    id: 'creative',
    name: 'Divisi Video & Kreatif',
    roomCode: 'RUANG 105 // MULTIMEDIA SUITE',
    role: 'Multimedia & Visual Director',
    iconName: 'creative',
    accentColor: 'from-amber-500/20 via-orange-500/10 to-transparent text-amber-400',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    status: 'Idle',
    currentTask: 'Menunggu brief skrip teaser reels fitur invoice & nota thermal terbaru',
    outputCount: 11,
    lastUpdated: '12 menit yang lalu',
    metricLabel: 'Aset Siap',
    metricValue: '18 File',
    movementState: 'lounge',
    level: 2,
    xp: 95,
    presetPrompts: [
      'Buat konsep video reels perbandingan kecepatan kompresi',
      'Susun storyboard teaser fitur invoice thermal',
      'Rancang prompt grafis poster promo Instagram',
    ],
  },
  {
    id: 'seo',
    name: 'Divisi SEO & Content Writer',
    roomCode: 'RUANG 106 // SEO & EDITORIAL',
    role: 'Search Strategist & Copywriter',
    iconName: 'seo',
    accentColor: 'from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-400',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    status: 'Working',
    currentTask: 'Mengoptimasi sitemap XML, schema data Google, dan riset artikel blog UMKM',
    outputCount: 36,
    lastUpdated: 'Baru saja',
    metricLabel: 'SERP Top 3',
    metricValue: '12 Keyword',
    movementState: 'working',
    level: 3,
    xp: 275,
    presetPrompts: [
      'Riset kata kunci artikel blog invoice digital',
      'Audit sitemap.xml dan metadata 105 rute',
      'Buat ringkasan artikel panduan kompres foto KTP',
    ],
  },
];

export default function VirtualOfficePage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [divisions, setDivisions] = useState<OfficeDivision[]>(initialVirtualDivisions);
  const [activeDivision, setActiveDivision] = useState<OfficeDivision | null>(null);
  const [loadingDivisionId, setLoadingDivisionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [modalOutput, setModalOutput] = useState<{ text: string; source: string; timestamp: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Special Zone Interactive States
  const [isMeetingActive, setIsMeetingActive] = useState<boolean>(false);
  const [meetingTopic, setMeetingTopic] = useState<string>(
    'Sinergi Antar Divisi: Peningkatan Kecepatan Rendering & Pertumbuhan Pengguna Baru'
  );
  const [coffeeCupsServed, setCoffeeCupsServed] = useState<number>(14);
  const [isJanitorSweeping, setIsJanitorSweeping] = useState<boolean>(false);
  const [janitorCleanedTokens, setJanitorCleanedTokens] = useState<number>(0);
  const [selectedGymDivision, setSelectedGymDivision] = useState<string>('it');
  const [isGymTraining, setIsGymTraining] = useState<boolean>(false);

  // Live Telemetry Sync
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);

  // Video Generator & Instagram Release States
  const [creativeVideo, setCreativeVideo] = useState({
    title: 'Teaser Video Reels: Solusi Berkas & Cetak Nota KompresKilat',
    caption: `🔥 Cetak nota kasir thermal langsung dari browser tanpa bayar aplikasi kasir mahal!\n\nDukung ukuran 58mm & 80mm, ada stempel lunas otomatis, dan privasi 100% aman di browsermu.\n\n👉 Coba sekarang di https://kompreskilat.site/tools/invoice-generator\n\n#KompresKilat #NotaThermal #KasirUMKM #SolusiBisnis`,
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80',
    duration: '0:15',
    resolution: '1080x1920 (9:16)',
    model: 'Google Video AI / Veo 2 Turbo'
  });
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  const [instagramNotice, setInstagramNotice] = useState<{
    status: 'idle' | 'publishing' | 'success' | 'error';
    message?: string;
    permalink?: string;
  } | null>(null);

  const handlePublishToInstagram = async (caption: string, videoUrl: string, title?: string) => {
    setInstagramNotice({
      status: 'publishing',
      message: 'Mengunggah video reels & caption ke Instagram Graph API...'
    });
    play8BitSound('start');

    try {
      const res = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption,
          videoUrl,
          title: title || 'Teaser Video KompresKilat',
          mediaType: 'REELS'
        }),
      });

      const result = await res.json();
      if (result.success) {
        play8BitSound('success');
        setInstagramNotice({
          status: 'success',
          message: result.message || 'Konten berhasil dirilis ke Instagram!',
          permalink: result.permalink
        });
      } else {
        throw new Error(result.error || 'Gagal merilis ke Instagram.');
      }
    } catch (err: any) {
      setInstagramNotice({
        status: 'error',
        message: err.message || 'Terjadi gangguan saat mempublikasikan ke Instagram.'
      });
    }
  };

  // 8-bit Audio Synthesizer
  const play8BitSound = (type: 'start' | 'success' | 'sweep' | 'level') => {
    if (!sfxEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'start') {
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'sweep') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.25);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'level') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        osc.frequency.setValueAtTime(1046.5, now + 0.3);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.08);
        osc.frequency.setValueAtTime(659.25, now + 0.16);
        osc.frequency.setValueAtTime(880, now + 0.24);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {}
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
      console.warn('Fallback analytics:', e);
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

  // Trigger Gemini Task
  const triggerTask = async (id: string, promptText?: string) => {
    const targetDivision = divisions.find((d) => d.id === id);
    if (!targetDivision) return;

    setLoadingDivisionId(id);
    setIsProcessing(true);
    play8BitSound('start');

    setDivisions((prev) =>
      prev.map((div) => {
        if (div.id === id) {
          return {
            ...div,
            status: 'Working',
            movementState: 'working',
            currentTask: 'Mengeksekusi instruksi cerdas via Gemini 2.5 Flash...',
            lastUpdated: 'Memproses...',
          };
        }
        return div;
      })
    );

    try {
      const res = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          divisionId: targetDivision.id,
          divisionName: targetDivision.name,
          customPrompt: promptText || (customPrompt.trim() ? customPrompt.trim() : undefined),
        }),
      });

      const data = await res.json();
      if (data.success && data.task) {
        const timeStr = data.timestamp || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        play8BitSound('success');

        setDivisions((prev) =>
          prev.map((div) => {
            if (div.id === id) {
              const newXp = div.xp + 45;
              const newLevel = newXp >= div.level * 100 ? div.level + 1 : div.level;
              return {
                ...div,
                status: 'Working',
                movementState: 'working',
                currentTask: data.task,
                outputCount: div.outputCount + 1,
                lastUpdated: 'Baru saja',
                xp: newXp,
                level: newLevel,
              };
            }
            return div;
          })
        );

        if (id === 'creative' && data.videoData) {
          setCreativeVideo(data.videoData);
          setIsVideoModalOpen(true);
        }

        if (activeDivision?.id === id) {
          setModalOutput({
            text: data.task,
            source: data.model || 'Gemini 2.5 Flash',
            timestamp: timeStr,
          });
        }
      }
    } catch {
      play8BitSound('success');
      const fallbackMsg = `Divisi ${targetDivision.name} berhasil menyelesaikan sinkronisasi tugas: ${promptText || 'Tugas Otomasi'}.`;
      setDivisions((prev) =>
        prev.map((div) => (div.id === id ? { ...div, currentTask: fallbackMsg, lastUpdated: 'Baru saja', outputCount: div.outputCount + 1 } : div))
      );
    } finally {
      setLoadingDivisionId(null);
      setIsProcessing(false);
      setCustomPrompt('');
    }
  };

  // Special Zone: Janitor Cache & Context Cleaning
  const handleJanitorClean = () => {
    setIsJanitorSweeping(true);
    play8BitSound('sweep');

    setTimeout(() => {
      // Clear redundant session caches
      try {
        const keysToRemove = ['kk_last_preview_cache', 'kk_draft_scratch'];
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {}

      const freedTokens = Math.floor(1800 + Math.random() * 2400);
      setJanitorCleanedTokens((prev) => prev + freedTokens);
      setIsJanitorSweeping(false);
      play8BitSound('success');

      // Reset idle divisions to fresh alert status
      setDivisions((prev) =>
        prev.map((div) => ({
          ...div,
          lastUpdated: 'Dibersihkan Janitor',
        }))
      );
    }, 1800);
  };

  // Special Zone: Huddle All Agents
  const handleToggleHuddle = () => {
    const newState = !isMeetingActive;
    setIsMeetingActive(newState);
    play8BitSound(newState ? 'start' : 'success');

    setDivisions((prev) =>
      prev.map((div) => ({
        ...div,
        movementState: newState ? 'huddle' : div.status === 'Working' ? 'working' : 'lounge',
      }))
    );
  };

  // Special Zone: Gym Training
  const handleGymTrain = () => {
    setIsGymTraining(true);
    play8BitSound('start');

    setTimeout(() => {
      setIsGymTraining(false);
      play8BitSound('level');

      setDivisions((prev) =>
        prev.map((div) => {
          if (div.id === selectedGymDivision) {
            const nextXp = div.xp + 60;
            const nextLvl = nextXp >= div.level * 100 ? div.level + 1 : div.level;
            return {
              ...div,
              xp: nextXp,
              level: nextLvl,
              currentTask: `Selesai latihan di Gym AI! Kapabilitas prompt reasoning meningkat (Lvl ${nextLvl}).`,
              lastUpdated: 'Baru selesai latihan',
            };
          }
          return div;
        })
      );
    }, 1500);
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
            <h2 className="text-xl font-bold text-white">Akses Kantor Virtual 2D</h2>
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
              Buka Kantor Virtual
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Background blueprint pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Header */}
        <AdminHeader
          currentTab="virtual-office"
          latency={analyticsData?.latency || '24ms Edge'}
          uptime={analyticsData?.uptime || '99.98%'}
          onSync={fetchAnalytics}
          isSyncing={isLoadingAnalytics}
          sfxEnabled={sfxEnabled}
          onToggleSfx={() => setSfxEnabled(!sfxEnabled)}
          onLogout={handleLogout}
        />

        {/* NOTIFIKASI RILIS INSTAGRAM GRAPH API */}
        {instagramNotice && (
          <div
            className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 shadow-xl ${
              instagramNotice.status === 'publishing'
                ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300'
                : instagramNotice.status === 'success'
                ? 'bg-gradient-to-r from-emerald-950/90 via-slate-900 to-pink-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  instagramNotice.status === 'publishing'
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : instagramNotice.status === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {instagramNotice.status === 'publishing' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : instagramNotice.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                    Instagram Graph API
                  </span>
                  {instagramNotice.status === 'success' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] font-mono text-emerald-300 font-bold">
                      ✓ Rilis Berhasil
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-200">{instagramNotice.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {instagramNotice.permalink && (
                <a
                  href={instagramNotice.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white text-xs font-bold font-mono transition flex items-center gap-1 shadow-md shadow-pink-600/30"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Buka di Instagram</span>
                </a>
              )}
              <button
                onClick={() => setInstagramNotice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SPECIAL ZONES: RUANG RAPAT, AREA SANTAI, GYM & JANITOR */}
        {/* ======================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Zona 1: Ruang Rapat (Huddle Room) */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold font-mono uppercase text-indigo-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Ruang Rapat HQ // 201
              </span>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isMeetingActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isMeetingActive ? 'Sedang Berlangsung' : 'Kosong'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span>📋 Agenda Rapat:</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">{meetingTopic}</p>
            </div>

            <button
              onClick={handleToggleHuddle}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-2 cursor-pointer ${
                isMeetingActive
                  ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isMeetingActive ? 'Bubarkan Rapat (Kembali)' : 'Mulai Rapat Koordinasi'}</span>
            </button>
          </div>

          {/* Zona 2: Area Santai & Coffee Bar (Breakroom) */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold font-mono uppercase text-amber-400 flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5" />
                Breakroom & Cafe
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {coffeeCupsServed} Kopi Disajikan
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>☕ Mini Barista & Lounge</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tempat agen AI yang berstatus <em>Idle</em> beristirahat untuk memulihkan kapasitas token memori.
              </p>
            </div>

            <button
              onClick={() => {
                setCoffeeCupsServed((prev) => prev + 1);
                play8BitSound('success');
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-amber-300 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Sajikan Secangkir Kopi ☕</span>
            </button>
          </div>

          {/* Zona 3: AI Training Gym (Peningkatan Kapabilitas) */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold font-mono uppercase text-emerald-400 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5" />
                Sistem Gym AI
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Level-Up Hub
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400">Pilih Agen untuk Dilatih:</label>
              <select
                value={selectedGymDivision}
                onChange={(e) => setSelectedGymDivision(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (Lvl {d.level} - {d.xp} XP)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGymTrain}
              disabled={isGymTraining}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold font-mono transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/30"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{isGymTraining ? 'Sedang Berlatih...' : 'Latih Agen (+60 XP)'}</span>
            </button>
          </div>

          {/* Zona 4: Fitur "Janitor" (Pembersih Konteks & Sesi) */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold font-mono uppercase text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Sistem Janitor HQ
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {janitorCleanedTokens > 0 ? `${janitorCleanedTokens} Token Bersih` : 'Siap Menyapu'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>🧹 Garbage Collector</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Bersihkan context window yang menumpuk, cache lokal sesi, serta segarkan antrean agen AI.
              </p>
            </div>

            <button
              onClick={handleJanitorClean}
              disabled={isJanitorSweeping}
              className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold font-mono transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-600/30"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isJanitorSweeping ? 'animate-spin' : ''}`} />
              <span>{isJanitorSweeping ? 'Menyapu Bersih...' : 'Sapu Bersih Cache & Context'}</span>
            </button>
          </div>
        </section>

        {/* ======================================================== */}
        {/* DENAH KANTOR UTAMA (6 RUANGAN KERJA ISOMETRIK 2D) */}
        {/* ======================================================== */}
        <section className="relative rounded-3xl border-2 border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Header Floor Plan */}
          <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  BLUEPRINT GEDUNG OPERASIONAL // LANTAI 01
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Denah Ruangan Meja Kerja Karyawan AI
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                Mode: {isMeetingActive ? '📢 Sedang Rapat Bersama' : '🏢 Operasional Normal'}
              </span>
            </div>
          </div>

          {/* Grid 6 Ruangan Kerja */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]">
            {divisions.map((division) => {
              const isWorking = division.status === 'Working';
              const isLoading = loadingDivisionId === division.id;

              return (
                <div
                  key={division.id}
                  className={`relative rounded-2xl border-2 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl ${
                    isWorking
                      ? 'border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.25)] ring-1 ring-indigo-400/40 bg-slate-900'
                      : `${division.borderColor} bg-slate-900/95`
                  } group`}
                >
                  {/* Header Pintu Ruangan */}
                  <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                        {division.roomCode}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300">
                      LVL {division.level} ({division.xp} XP)
                    </span>
                  </div>

                  {/* Konten Meja Simulator */}
                  <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{division.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{division.role}</p>
                    </div>

                    {/* Simulator Pixel Art Workstation */}
                    <PixelOfficeWorkstation
                      divisionId={division.id}
                      divisionName={division.name}
                      iconName={division.iconName}
                      isWorking={isWorking}
                      isLoading={isLoading}
                      metricLabel={division.metricLabel}
                      metricValue={division.metricValue}
                      outputCount={division.outputCount}
                      liveViews={analyticsData?.totalViews}
                      liveVisitors={analyticsData?.uniqueVisitors}
                    />

                    {/* Task Display */}
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 min-h-[50px] flex items-center">
                      <p className="line-clamp-2">{division.currentTask}</p>
                    </div>

                    {/* Aksi Ruangan */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => triggerTask(division.id)}
                        disabled={isLoading}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isLoading ? 'Memproses...' : 'Perintah AI'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveDivision(division);
                          setModalOutput(null);
                        }}
                        className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
                        title="Instruksi Kustom"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* TOMBOL POP-UP PRATINJAU VIDEO AI & AKSI RILIS */}
                    {division.id === 'creative' && (
                      <div className="pt-2 border-t border-amber-500/20">
                        <button
                          type="button"
                          onClick={() => setIsVideoModalOpen(true)}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 hover:from-amber-500/20 hover:to-pink-500/20 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-white text-xs font-bold transition flex items-center justify-between cursor-pointer group shadow-sm"
                        >
                          <span className="flex items-center gap-2">
                            <Film className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                            <span>Pratinjau Video & Aksi Rilis</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-[10px] font-mono text-amber-200">
                            🎬 Buka Pop-up
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* MODAL INSTRUKSI KUSTOM */}
        {/* ======================================================== */}
        {activeDivision && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  Terminal Instruksi: {activeDivision.name}
                </h3>
                <button onClick={() => setActiveDivision(null)} className="text-slate-500 hover:text-white text-sm">
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400">Instruksi Cepat:</label>
                <div className="space-y-1.5">
                  {activeDivision.presetPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => triggerTask(activeDivision.id, p)}
                      disabled={isProcessing}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Play className="w-3 h-3 text-indigo-400" />
                        {p}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400">Ketik Instruksi Bebas:</label>
                <textarea
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={`Perintahkan ${activeDivision.name}...`}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => triggerTask(activeDivision.id, customPrompt)}
                  disabled={isProcessing}
                  className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Jalankan Gemini 2.5</span>
                </button>
              </div>

              {modalOutput && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Laporan Hasil Tugas ({modalOutput.timestamp} WIB)
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(modalOutput.text);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{modalOutput.text}</p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* ======================================================== */}
        {/* MODAL PRATINJAU VIDEO & AKSI RILIS INSTAGRAM */}
        {/* ======================================================== */}
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header Modal */}
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Pratinjau Video Reels AI
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
                        {creativeVideo.resolution || '1080x1920'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Ruang 105 // Divisi Video & Kreatif</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                {/* Pemutar Video HTML5 Nyata */}
                <div className="relative rounded-2xl overflow-hidden bg-black border border-amber-500/30 shadow-2xl group/video">
                  <video
                    controls
                    playsInline
                    autoPlay
                    preload="metadata"
                    poster={creativeVideo.thumbnailUrl}
                    src={creativeVideo.videoUrl}
                    className="w-full max-h-[300px] object-cover bg-black"
                  >
                    Browser Anda tidak mendukung pemutar video HTML5.
                  </video>

                  <div className="absolute top-3 right-3 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-mono font-bold text-amber-300 border border-amber-500/30">
                      ⏱️ {creativeVideo.duration || '0:15'}
                    </span>
                  </div>
                </div>

                {/* Info Model & Judul */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm line-clamp-1">{creativeVideo.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0 ml-2">
                      {creativeVideo.model || 'Google Video AI'}
                    </span>
                  </div>

                  <div className="text-slate-300 text-xs leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 font-sans">
                    {creativeVideo.caption}
                  </div>

                  {/* Status Rilis Instagram Langsung di Dalam Modal */}
                  {instagramNotice && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2.5 animate-in fade-in duration-200 ${
                        instagramNotice.status === 'publishing'
                          ? 'bg-indigo-950/70 border-indigo-500/40 text-indigo-200'
                          : instagramNotice.status === 'success'
                          ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                          : 'bg-rose-950/70 border-rose-500/40 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {instagramNotice.status === 'publishing' && (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400 shrink-0" />
                        )}
                        {instagramNotice.status === 'success' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {instagramNotice.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="leading-snug">{instagramNotice.message}</span>
                      </div>

                      {instagramNotice.permalink && (
                        <a
                          href={instagramNotice.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white font-bold flex items-center gap-1.5 text-[11px] shrink-0 shadow-md shadow-pink-600/30"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Buka di IG</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions: Langsung Rilis ke Instagram */}
              <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block">
                  📡 API Langsung: Terhubung ke @kompreskilat
                </span>

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Tutup
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handlePublishToInstagram(
                        creativeVideo.caption,
                        creativeVideo.videoUrl,
                        creativeVideo.title
                      )
                    }
                    disabled={instagramNotice?.status === 'publishing'}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-90 active:scale-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-pink-600/30 cursor-pointer disabled:opacity-50"
                  >
                    {instagramNotice?.status === 'publishing' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menerbitkan ke IG...</span>
                      </>
                    ) : (
                      <>
                        <InstagramIcon className="w-4 h-4" />
                        <span>Rilis ke Instagram</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
