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
  MessageSquare,
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
  LogOut,
  Coffee,
  Users,
  Wifi,
  Edit3,
  BookOpen,
  CheckSquare,
  Save,
  Volume2,
  VolumeX,
  Film,
  Video,
  Download,
  Share2,
  UploadCloud
} from 'lucide-react';
import PixelOfficeWorkstation from '@/components/admin/PixelOfficeWorkstation';
import AdminHeader from '@/components/admin/AdminHeader';

// Ikon Instagram Resmi berbasis SVG
const InstagramIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export type DivisionStatus = 'Working' | 'Idle';

export interface Division {
  id: string;
  name: string;
  roomCode: string;
  wing: 'West Wing (Teknologi)' | 'East Wing (Pertumbuhan)' | 'Central Suite (Konten & Media)';
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

export interface DailyMetric {
  day: string;
  date: string;
  views: number;
  clicks: number;
  sales: number | null;
}

export interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  totalSales: number | null;
  uniqueVisitors: number;
  viewsGrowth: string;
  clicksGrowth: string;
  salesGrowth: string;
  avgDailyViews: number;
  peakViews: number;
  ctr: string;
  latency: string;
  uptime: string;
  weekly: DailyMetric[];
  source: string;
  syncedAt: string;
}

export interface CreativeVideoData {
  id: string;
  title: string;
  caption: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  aspectRatio?: string;
  resolution?: string;
  model?: string;
  generatedAt?: string;
}

export interface SeoArticleDraft {
  id: string;
  title: string;
  slug: string;
  category: string;
  keywords: string;
  metaDescription: string;
  content: string;
  status: 'pending_review' | 'approved' | 'revision';
  createdAt: string;
  type?: 'article' | 'video' | 'social';
  videoUrl?: string;
  isPublishedToInstagram?: boolean;
  instagramPermalink?: string;
}

export interface AgentTaskBatch {
  id: string;
  divisionId: string;
  divisionName: string;
  userPrompt: string;
  outputContent: string;
  extractedQuote?: string;
  model: string;
  timestamp: string;
  status: 'pending_approval' | 'approved' | 'revision' | 'rejected' | 'completed' | 'published_to_social';
  socialPermalink?: string;
  supervisorNotes?: string;
  reviewedAt?: string;
}

function isSeoArticleDraft(value: unknown): value is SeoArticleDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Record<string, unknown>;
  return (
    typeof draft.id === 'string' &&
    typeof draft.title === 'string' &&
    typeof draft.content === 'string' &&
    ['pending_review', 'approved', 'revision'].includes(String(draft.status))
  );
}

const initialDivisions: Division[] = [
  {
    id: 'it',
    name: 'Divisi IT & Sistem',
    roomCode: 'RUANG 101 // SERVER & DEVOPS LAB',
    wing: 'West Wing (Teknologi)',
    role: 'Lead Infrastructure & Edge SysAdmin',
    category: 'Core System',
    iconName: 'it',
    accentColor: 'from-cyan-500/20 via-blue-500/10 to-transparent text-cyan-400',
    borderColor: 'border-cyan-500/40 hover:border-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    status: 'Idle',
    currentTask: 'Memeriksa Uptime Vercel, latensi edge CDN, dan pemindaian error log kompreskilat.site',
    outputCount: 14,
    lastUpdated: '2 menit yang lalu',
    metricLabel: 'Uptime Edge',
    metricValue: '99.98%',
    equipment: ['Edge Server Rack', 'Grafana Dual Monitor', 'Console Linux'],
    presetPrompts: [
      'Jalankan audit kesehatan server Vercel',
      'Periksa error log 404 & 500 terkini',
      'Optimasi pemakaian memori serverless worker'
    ]
  },
  {
    id: 'analytics',
    name: 'Divisi Analytics',
    roomCode: 'RUANG 102 // DATA & COMPLIANCE LAB',
    wing: 'West Wing (Teknologi)',
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
    metricLabel: 'AdSense Health',
    metricValue: '100% Valid',
    equipment: ['Live GSC Dashboard', 'AdSense Security Shield', 'Telemetry Matrix'],
    presetPrompts: [
      'Analisis trafik harian Google Search Console',
      'Cek kepatuhan penempatan iklan AdSense',
      'Hitung rasio retensi pengguna mingguan'
    ]
  },
  {
    id: 'marketing',
    name: 'Divisi Marketing & Growth',
    roomCode: 'RUANG 103 // GROWTH & SALES LAB',
    wing: 'East Wing (Pertumbuhan)',
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
    equipment: ['Funnel Strategy Board', 'Ad Campaign Tracker', 'Conversion Rig'],
    presetPrompts: [
      'Analisis strategi konversi pelanggan baru',
      'Susun draf email onboarding UMKM',
      'Rancang penawaran paket langganan kilat'
    ]
  },
  {
    id: 'sosmed',
    name: 'Divisi Admin & Sosmed',
    roomCode: 'RUANG 104 // SOCIAL & COMMUNITY HUB',
    wing: 'East Wing (Pertumbuhan)',
    role: 'Social Engagement & Community Manager',
    category: 'Public Relations',
    iconName: 'sosmed',
    accentColor: 'from-pink-500/20 via-rose-500/10 to-transparent text-pink-400',
    borderColor: 'border-pink-500/40 hover:border-pink-400',
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    status: 'Working',
    currentTask: 'Menyiapkan caption promosi alat kompres gambar & PDF tanpa upload server',
    outputCount: 48,
    lastUpdated: '1 menit yang lalu',
    metricLabel: 'Antrean Post',
    metricValue: '6 Konten',
    equipment: ['Smartphone Tree Rig', 'Ring Light Pro', 'Auto-Reply Console'],
    presetPrompts: [
      'Buat caption Instagram/TikTok fitur kompres KTP',
      'Susun utas edukasi privasi file online di X',
      'Buat draf pesan sambutan pengguna baru'
    ]
  },
  {
    id: 'creative',
    name: 'Divisi Video & Kreatif',
    roomCode: 'RUANG 105 // MULTIMEDIA & VIDEO SUITE',
    wing: 'Central Suite (Konten & Media)',
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
    metricLabel: 'Aset Siap',
    metricValue: '18 File',
    equipment: ['Wacom Display Rig', 'Render Engine 4K', 'Audio Monitor Desk'],
    presetPrompts: [
      'Buat konsep video reels perbandingan kecepatan kompresi',
      'Susun storyboard teaser fitur invoice thermal',
      'Rancang prompt grafis poster promo Instagram'
    ]
  },
  {
    id: 'seo',
    name: 'Divisi SEO & Content Writer',
    roomCode: 'RUANG 106 // SEO & EDITORIAL DESK',
    wing: 'Central Suite (Konten & Media)',
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
    equipment: ['Google SERP Radar', 'Keyword Density Stack', 'Markdown Rig'],
    presetPrompts: [
      'Riset kata kunci artikel blog invoice digital',
      'Audit sitemap.xml dan metadata 102 rute',
      'Buat ringkasan artikel panduan kompres foto KTP'
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

  const [divisions, setDivisions] = useState<Division[]>(() =>
    initialDivisions.map((division) => ({
      ...division,
      status: 'Idle',
      currentTask: 'Belum ada tugas yang dijalankan.',
      outputCount: 0,
      lastUpdated: 'Belum dijalankan',
      metricValue: 'Belum terhubung',
    }))
  );
  const [activeDivision, setActiveDivision] = useState<Division | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loadingDivisionId, setLoadingDivisionId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'Working' | 'Idle'>('all');
  const [modalOutput, setModalOutput] = useState<{ text: string; source: string; timestamp: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);

  // State Batch Riwayat Perintah & Output Terpadu Agen AI (Workstation Batches)
  const [agentBatches, setAgentBatches] = useState<AgentTaskBatch[]>([]);
  const [copiedBatchId, setCopiedBatchId] = useState<string | null>(null);

  // State khusus kurasi draf artikel Divisi SEO (Google AdSense Safety Queue)
  const [seoDrafts, setSeoDrafts] = useState<SeoArticleDraft[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<SeoArticleDraft | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  // State Generator Video & Pratinjau Divisi Video & Kreatif
  const [creativeVideo, setCreativeVideo] = useState<CreativeVideoData>({
    id: '',
    title: '',
    caption: '',
    videoUrl: '',
  });
  const [videoPrompt, setVideoPrompt] = useState<string>('');
  const [videoGenerationError, setVideoGenerationError] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [videoJobId, setVideoJobId] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  // State Notifikasi Rilis ke Instagram Graph API
  const [instagramNotice, setInstagramNotice] = useState<{
    status: 'idle' | 'publishing' | 'success' | 'error';
    message?: string;
    targetId?: string;
    permalink?: string;
  } | null>(null);

  // Helper publikasi otomatis ke Instagram Graph API
  const handlePublishToInstagram = async (params: {
    caption: string;
    videoUrl?: string;
    draftId?: string;
    title?: string;
  }): Promise<string | null> => {
    if (!params.videoUrl) {
      setInstagramNotice({
        status: 'error',
        targetId: params.draftId || 'creative',
        message: 'File video hasil generasi belum tersedia. Buat video terlebih dahulu.',
      });
      return null;
    }
    setInstagramNotice({
      status: 'publishing',
      targetId: params.draftId || 'creative',
      message: 'Mengunggah aset video & caption ke Instagram Graph API...'
    });
    play8BitSound('start');

    try {
      const res = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: params.caption,
          videoUrl: params.videoUrl,
          title: params.title || 'Konten KompresKilat',
          draftId: params.draftId,
          mediaType: 'REELS'
        }),
      });

      const result = await res.json();

      if (result.success) {
        play8BitSound('success');
        setInstagramNotice({
          status: 'success',
          targetId: params.draftId || 'creative',
          message: result.message || 'Konten berhasil dirilis ke Instagram!',
          permalink: result.permalink
        });

        if (params.draftId) {
          const updated = seoDrafts.map((draft) =>
            draft.id === params.draftId
              ? { ...draft, isPublishedToInstagram: true, instagramPermalink: result.permalink, status: 'approved' as const }
              : draft
          );
          await saveDraftsToStorage(updated);
        }
        return typeof result.permalink === 'string' ? result.permalink : null;
      } else {
        throw new Error(result.error || 'Gagal mempublikasikan ke Instagram.');
      }
    } catch (err: any) {
      setInstagramNotice({
        status: 'error',
        targetId: params.draftId || 'creative',
        message: err.message || 'Terjadi gangguan saat mempublikasikan ke Instagram.'
      });
      return null;
    }
  };

  const saveDraftsToStorage = async (updated: SeoArticleDraft[]) => {
    setSeoDrafts(updated);
    try {
      const response = await fetch('/api/ai-agent/drafts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menyimpan draf ke database.');

      const retainedIds = new Set(updated.map((draft) => draft.id));
      const removedIds = seoDrafts.filter((draft) => !retainedIds.has(draft.id));
      await Promise.all(removedIds.map(async (draft) => {
        const deleteResponse = await fetch(`/api/ai-agent/drafts?id=${encodeURIComponent(draft.id)}`, { method: 'DELETE' });
        if (!deleteResponse.ok) throw new Error('Gagal menghapus draf dari database.');
      }));
      setStorageError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan perubahan.';
      setStorageError(message);
      console.error('AI Employee persistence failed:', error);
    }
  };

  // Helper kelola Batch Perintah & Hasil Agen AI
  const handleDeleteBatch = async (batchId: string) => {
    const response = await fetch(`/api/ai-agent/history?id=${encodeURIComponent(batchId)}`, { method: 'DELETE' });
    if (!response.ok) {
      setStorageError('Gagal menghapus riwayat tugas dari database.');
      return;
    }
    setAgentBatches((prev) => {
      return prev.filter((batch) => batch.id !== batchId);
    });
    setActivityLogs((prev) => prev.filter((log) => log.id !== batchId));
  };

  const handlePublishBatchToSocial = async (
    batch: AgentTaskBatch,
    platform: 'facebook' | 'instagram' = 'facebook'
  ) => {
    if (batch.divisionId !== 'sosmed' && batch.divisionId !== 'creative') {
      setInstagramNotice({
        status: 'error',
        targetId: batch.id,
        message: 'Hanya draf dari Divisi Admin & Sosmed atau Kreatif yang dapat dipublikasikan ke media sosial.',
      });
      return;
    }
    setInstagramNotice({
      status: 'publishing',
      targetId: batch.id,
      message: platform === 'facebook'
        ? 'Mengirim posting teks ke Facebook...'
        : 'Mengunggah konten ke Instagram @kompreskilat...',
    });
    try {
      if (platform === 'facebook') {
        const response = await fetch('/api/facebook/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: batch.outputContent }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || 'Gagal mempublikasikan ke Facebook.');
        await fetch('/api/ai-agent/history', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: batch.id, permalink: result.permalink, publishedAt: result.publishedAt, platform: 'facebook' }),
        }).catch(() => {});
        setInstagramNotice({ status: 'success', targetId: batch.id, message: 'Posting berhasil dikirim ke Facebook.', permalink: result.permalink });
        setAgentBatches((previous) => previous.map((item) =>
          item.id === batch.id
            ? { ...item, status: 'published_to_social', socialPermalink: result.permalink }
            : item
        ));
      } else {
        const quoteImageUrl = 'https://kompreskilat.site/images/kompreskilat-quote.jpg';
        const response = await fetch('/api/instagram/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caption: batch.outputContent,
            imageUrl: quoteImageUrl,
            mediaType: 'IMAGE',
          }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || 'Publikasi Instagram gagal.');
        await fetch('/api/ai-agent/history', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: batch.id, permalink: result.permalink, publishedAt: result.publishedAt, platform: 'instagram' }),
        }).catch(() => {});
        setInstagramNotice({
          status: 'success',
          targetId: batch.id,
          message: 'Berhasil dirilis ke Instagram @kompreskilat!',
          permalink: result.permalink,
        });
        setAgentBatches((previous) => previous.map((item) =>
          item.id === batch.id
            ? { ...item, status: 'published_to_social', socialPermalink: result.permalink }
            : item
        ));
      }
    } catch (error) {
      setInstagramNotice({
        status: 'error',
        targetId: batch.id,
        message: error instanceof Error ? error.message : `Publikasi ${platform} gagal.`,
      });
    }
  };

  const resumeVideoJob = async (jobId: string) => {
    setIsGeneratingVideo(true);
    setVideoGenerationError(null);
    try {
      for (let attempt = 0; attempt < 120; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 8000));
        const statusResponse = await fetch(`/api/video/generate?jobId=${encodeURIComponent(jobId)}`, {
          cache: 'no-store',
        });
        const statusResult = await statusResponse.json();
        if (!statusResponse.ok) throw new Error(statusResult.error || 'Gagal memeriksa status video.');
        if (statusResult.status === 'failed') throw new Error(statusResult.error || 'Generasi video gagal.');
        if (statusResult.status !== 'completed') continue;

        const generatedVideo = statusResult.data as CreativeVideoData;
        setCreativeVideo(generatedVideo);
        const draft: SeoArticleDraft = {
          id: generatedVideo.id,
          title: generatedVideo.title,
          slug: `video-${generatedVideo.id}`,
          category: 'Video & Media Sosial',
          keywords: 'video promosi KompresKilat',
          metaDescription: generatedVideo.caption.slice(0, 160),
          content: generatedVideo.caption,
          status: 'pending_review',
          createdAt: generatedVideo.generatedAt || new Date().toISOString(),
          type: 'video',
          videoUrl: generatedVideo.videoUrl,
        };
        await saveDraftsToStorage([draft, ...seoDrafts.filter((item) => item.id !== draft.id)]);
        setVideoJobId(null);
        setVideoPrompt('');
        return;
      }
      setVideoGenerationError(`Generasi masih berjalan. ID pekerjaan: ${jobId}. Lanjutkan pemeriksaan kapan saja.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generasi video gagal.';
      setVideoGenerationError(message);
      console.error('Video generation failed:', error);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (videoPrompt.trim().length < 10) {
      setVideoGenerationError('Brief video minimal 10 karakter.');
      return;
    }
    setVideoGenerationError(null);
    try {
      const startResponse = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: videoPrompt.trim(), aspectRatio: '9:16' }),
      });
      const startResult = await startResponse.json();
      if (!startResponse.ok || typeof startResult.jobId !== 'string') {
        throw new Error(startResult.error || 'Provider video gagal memulai pekerjaan.');
      }
      setVideoJobId(startResult.jobId);
      await resumeVideoJob(startResult.jobId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generasi video gagal.';
      setVideoGenerationError(message);
      console.error('Video generation start failed:', error);
    }
  };

  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [logDivisionFilter, setLogDivisionFilter] = useState<string>('all');
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);

  // Helper suara 8-bit retro sintetis Web Audio API
  const play8BitSound = (type: 'start' | 'success') => {
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
    } catch (e) {}
  };

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Fungsi asinkron memuat data metrik riil secara dinamis dan real-time dari API
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics', { cache: 'no-store' });
      if (!res.ok) throw new Error('Status respon tidak valid');
      const json = await res.json();
      if (json.success && json.data) {
        setAnalyticsData(json.data);
        // Sinkronkan juga info telemetri dinamis divisi Analytics
        setDivisions((prev) =>
          prev.map((div) => {
            if (div.id === 'analytics') {
              return {
                ...div,
                metricValue: `${json.data.totalViews} Views (${json.data.uniqueVisitors} Users)`,
              };
            }
            return div;
          })
        );
      }
    } catch (err) {
      console.warn('Gagal memuat analitik dinamis:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    let active = true;
    const loadProductionData = async () => {
      try {
        const sessionResponse = await fetch('/api/admin/auth', { cache: 'no-store' });
        const session = await sessionResponse.json();
        if (!active) return;
        if (!sessionResponse.ok) {
          if (sessionResponse.status !== 401) throw new Error(session.error || 'Autentikasi admin belum dikonfigurasi.');
          return;
        }
        if (!session.authenticated) return;
        if (!isAuthenticated) {
          setIsAuthenticated(true);
          return;
        }

        const [historyResponse, draftsResponse] = await Promise.all([
          fetch('/api/ai-agent/history', { cache: 'no-store' }),
          fetch('/api/ai-agent/drafts', { cache: 'no-store' }),
        ]);
        const history = await historyResponse.json();
        const draftResult = await draftsResponse.json();
        if (!historyResponse.ok) throw new Error(history.error || 'Gagal memuat riwayat tugas.');
        if (!draftsResponse.ok) throw new Error(draftResult.error || 'Gagal memuat draf.');
        if (!active) return;

        const batches: AgentTaskBatch[] = history.data.map((row: Record<string, unknown>) => {
          const createdAt = typeof row.created_at === 'string' ? new Date(row.created_at) : new Date();
          const data = row.data && typeof row.data === 'object' ? row.data as Record<string, unknown> : {};
          return {
            id: String(row.id),
            divisionId: String(row.division_id),
            divisionName: String(row.division_name),
            userPrompt: String(row.prompt),
            outputContent: String(row.output),
            extractedQuote: typeof data.extractedQuote === 'string' ? data.extractedQuote : '',
            model: String(row.model),
            timestamp: createdAt.toLocaleString('id-ID'),
            status: row.status === 'published_to_social'
              ? 'published_to_social'
              : ['approved', 'revision', 'rejected', 'pending_approval'].includes(String(row.status))
                ? (row.status as any)
                : 'pending_approval',
            socialPermalink: typeof data.socialPublication === 'object' &&
              data.socialPublication !== null &&
              typeof (data.socialPublication as Record<string, unknown>).permalink === 'string'
              ? String((data.socialPublication as Record<string, unknown>).permalink)
              : undefined,
          };
        });
        setAgentBatches(batches);
        setActivityLogs(batches.map((batch) => ({
          id: batch.id,
          divisionId: batch.divisionId,
          divisionName: batch.divisionName,
          taskTitle: batch.outputContent,
          timestamp: batch.timestamp,
          source: batch.model,
          status: 'success',
        })));
        setSeoDrafts(draftResult.data
          .map((row: Record<string, unknown>) => row.data)
          .filter(isSeoArticleDraft));

        try {
          const videoJobsResponse = await fetch('/api/video/generate', { cache: 'no-store' });
          const videoJobsResult = await videoJobsResponse.json();
          if (!videoJobsResponse.ok || !Array.isArray(videoJobsResult.jobs)) {
            throw new Error(videoJobsResult.error || 'Gagal memuat pekerjaan video.');
          }
          const runningJob = videoJobsResult.jobs.find((job: Record<string, unknown>) =>
            job.status === 'running' || job.status === 'in_progress'
          );
          if (runningJob && typeof runningJob.id === 'string') setVideoJobId(runningJob.id);
          const completedJob = videoJobsResult.jobs.find((job: Record<string, unknown>) =>
            job.status === 'completed' && job.videoData && typeof job.videoData === 'object'
          );
          if (completedJob) setCreativeVideo(completedJob.videoData as CreativeVideoData);
        } catch (error) {
          setVideoGenerationError(error instanceof Error ? error.message : 'Gagal memuat pekerjaan video.');
        }

        setDivisions((previous) => previous.map((division) => {
          const divisionTasks = batches.filter((batch) => batch.divisionId === division.id);
          const latestTask = divisionTasks[0];
          return {
            ...division,
            outputCount: divisionTasks.length,
            currentTask: latestTask?.outputContent || 'Belum ada tugas yang dijalankan.',
            lastUpdated: latestTask?.timestamp || 'Belum dijalankan',
          };
        }));
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : 'Gagal memuat data produksi.';
        setStorageError(message);
        setAuthError(message);
      }
    };
    void loadProductionData();
    return () => { active = false; };
  }, [isAuthenticated]);

  // Hook sinkronisasi otomatis analitik real-time (polling + event visibility change)
  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoadingAnalytics(true);
    fetchAnalytics();

    // Polling setiap 15 detik untuk update angka seketika jika ada kunjungan baru
    const intervalId = setInterval(() => {
      fetchAnalytics();
    }, 15000);

    // Refresh seketika saat admin membuka/kembali ke tab ini
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAnalytics();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError(null);
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Login gagal.');
      setIsAuthenticated(true);
      setPasswordInput('');
      setAuthError(null);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login gagal.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
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
    play8BitSound('start');

    // 1. Ubah status divisi menjadi 'Working' dan tampilkan indikator proses berjalan
    setDivisions((prev) =>
      prev.map((div) => {
        if (div.id === id) {
          return {
            ...div,
            status: 'Working',
            currentTask: 'Sedang menjalankan instruksi menggunakan provider AI produksi...',
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
          customPrompt: promptText || (customPrompt.trim() ? customPrompt.trim() : undefined),
          analytics:
            targetDivision.id === 'analytics' && analyticsData
              ? {
                  totalViews: analyticsData.totalViews,
                  uniqueVisitors: analyticsData.uniqueVisitors,
                  totalClicks: analyticsData.totalClicks,
                  ctr: analyticsData.ctr,
                  source: analyticsData.source,
                }
              : undefined,
        })
      });

      const data = await res.json();

      if (data.success && data.task) {
        if (typeof data.draftId !== 'string' || !data.draftId) {
          throw new Error('Respon AI tidak menyertakan ID draf yang valid.');
        }
        const resultTask = data.task;
        const timeStr = data.timestamp || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const sourceModel = data.model || 'gemini-2.5-flash';
        play8BitSound('success');

        // 3. Perbarui aktivitas divisi dengan hasil nyata dari AI dan tambahkan total output tugas +1 secara real-time
        setDivisions((prev) =>
          prev.map((div) => {
            if (div.id === id) {
              return {
                ...div,
                status: 'Idle',
                currentTask: resultTask,
                outputCount: div.outputCount + 1,
                lastUpdated: 'Baru saja'
              };
            }
            return div;
          })
        );

        // Masukkan riwayat log aktivitas global baru ke dalam daftar log
        const newLogEntry: ActivityLog = {
          id: data.batchId,
          divisionId: targetDivision.id,
          divisionName: targetDivision.name,
          taskTitle: resultTask,
          timestamp: timeStr,
          source: sourceModel === 'gemini-2.5-flash' ? 'gemini-2.5-flash' : sourceModel,
          status: 'success'
        };

        setActivityLogs((prev) => [newLogEntry, ...prev.slice(0, 49)]);

        // Rekam paket Perintah Input + Hasil Output AI ke dalam Batch History (Tercatat & Terpadu)
        const promptGiven = data.userPrompt || promptText || customPrompt.trim() || `Tugas rutin (${targetDivision.name})`;
        const newBatchItem: AgentTaskBatch = {
          id: data.batchId,
          divisionId: targetDivision.id,
          divisionName: targetDivision.name,
          userPrompt: promptGiven,
          outputContent: resultTask,
          extractedQuote: data.extractedQuote || '',
          model: sourceModel,
          timestamp: `${timeStr} WIB`,
          status: 'pending_approval'
        };

        setAgentBatches((prev) => [newBatchItem, ...prev.slice(0, 99)]);

        // Jika tugas dari Divisi SEO, simpan otomatis ke antrean draf kurasi admin (AdSense Safety)
        if (id === 'seo') {
          const draftPayload: SeoArticleDraft = {
            id: data.draftId,
            title: data.articleDraft?.title || 'Draf Artikel SEO Baru: Panduan KompresKilat',
            slug: data.articleDraft?.slug || 'panduan-kompres-kilat-artikel-baru',
            category: data.articleDraft?.category || 'Panduan & Tutorial UMKM',
            keywords: data.articleDraft?.keywords || 'kompres kilat, tools online gratis',
            metaDescription: data.articleDraft?.metaDescription || 'Panduan edukasi utilitas berkas kompreskilat.site',
            content: data.articleDraft?.content || resultTask,
            status: 'pending_review',
            createdAt: `${timeStr} WIB`,
            type: 'article'
          };

          await saveDraftsToStorage([draftPayload, ...seoDrafts]);
        }

        if (id === 'sosmed') {
          const socialDraft: SeoArticleDraft = {
            id: crypto.randomUUID(),
            title: 'Draf Konten Sosial Media KompresKilat',
            slug: 'draf-sosial-media-kompreskilat',
            category: 'Media Sosial',
            keywords: 'caption, konten sosial media, kompres kilat',
            metaDescription: resultTask.slice(0, 160),
            content: resultTask,
            status: 'pending_review',
            createdAt: `${timeStr} WIB`,
            type: 'social'
          };

          await saveDraftsToStorage([socialDraft, ...seoDrafts]);
        }

        // Creative agent outputs a script; video generation is a separate, real provider operation.
        if (id === 'creative') {
          const scriptDraft: SeoArticleDraft = {
            id: data.draftId,
            title: 'Draf Skrip Video KompresKilat',
            slug: `skrip-video-${data.draftId}`,
            category: 'Skrip Video & Media Sosial',
            keywords: 'skrip video, storyboard, konten promosi',
            metaDescription: resultTask.slice(0, 160),
            content: resultTask,
            status: 'pending_review',
            createdAt: `${timeStr} WIB`,
            type: 'video'
          };
          await saveDraftsToStorage([scriptDraft, ...seoDrafts]);
        }

        if (activeDivision?.id === id) {
          setModalOutput({
            text: resultTask,
            source: sourceModel === 'gemini-2.5-flash' ? `Google ${sourceModel}` : sourceModel,
            timestamp: timeStr
          });
        }
      } else {
        throw new Error(data.error || 'Respon AI tidak valid');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tugas AI gagal diproses.';
      console.error('Gagal memproses tugas AI:', error);
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setStorageError(message);

      setDivisions((prev) =>
        prev.map((div) => {
          if (div.id === id) {
            return {
              ...div,
              status: 'Idle',
              currentTask: message,
              lastUpdated: timeStr
            };
          }
          return div;
        })
      );

      const failureLogEntry: ActivityLog = {
        id: `log-${crypto.randomUUID()}`,
        divisionId: targetDivision.id,
        divisionName: targetDivision.name,
        taskTitle: `Tugas gagal: ${error instanceof Error ? error.message : 'Kesalahan tidak diketahui'}`,
        timestamp: timeStr,
        source: 'AI provider',
        status: 'info'
      };

      setActivityLogs((prev) => [failureLogEntry, ...prev.slice(0, 49)]);

      if (activeDivision?.id === id) {
        setModalOutput({
          text: error instanceof Error ? error.message : 'Tugas gagal diproses.',
          source: 'AI provider',
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

  // Helper avatar karakter 2D dengan meja kerja & simulasi pixel-art office simulator
  const renderGameWorkstation = (division: Division, isWorking: boolean, isLoading: boolean) => {
    return (
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
              Akses Kantor Virtual HQ
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Halaman ini diproteksi. Masukkan kata sandi administrator untuk mengelola karyawan AI kompreskilat.site.
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
              <span>Buka Akses Denah Kantor</span>
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
      {/* Background Blueprint Grid Lines & Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* ======================================================== */}
        {/* TOP NAVBAR / COMMAND CENTER HEADER */}
        {/* ======================================================== */}
        <AdminHeader
          currentTab="hub"
          latency={analyticsData?.latency || 'Belum terukur'}
          uptime={analyticsData?.uptime || 'Belum terukur'}
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
        {/* METRIK EVENT ANALYTICS DARI SUPABASE */}
        {/* ======================================================== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metrik 1: Total Views */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                Total Views
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                7 hari
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-white font-mono">
              {analyticsData ? (
                analyticsData.totalViews.toLocaleString('id-ID')
              ) : (
                <span className="text-slate-500 text-lg animate-pulse">Menghitung...</span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              {analyticsData ? (
                `Rata-rata: ~${analyticsData.avgDailyViews.toLocaleString('id-ID')}/hari (Puncak: ${analyticsData.peakViews.toLocaleString('id-ID')})`
              ) : (
                'Sinkronisasi tayangan halaman...'
              )}
            </div>
          </div>

          {/* Metrik 2: Total Clicks */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MousePointerClick className="w-3.5 h-3.5 text-purple-400" />
                Total Clicks
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono">
                {analyticsData?.clicksGrowth || 'Belum terukur'}
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-white font-mono">
              {analyticsData ? (
                analyticsData.totalClicks.toLocaleString('id-ID')
              ) : (
                <span className="text-slate-500 text-lg animate-pulse">Menghitung...</span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              {analyticsData ? `CTR Interaksi: ${analyticsData.ctr}` : 'Menghitung interaksi...'}
            </div>
          </div>

          {/* Metrik 3: Unique Visitors */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Unique Visitors
              </span>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                7 hari
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-white font-mono">
              {analyticsData ? (
                analyticsData.uniqueVisitors.toLocaleString('id-ID')
              ) : (
                <span className="text-slate-500 text-lg animate-pulse">Menghitung...</span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              {analyticsData ? (
                `${analyticsData.uniqueVisitors.toLocaleString('id-ID')} pengunjung unik terdata`
              ) : (
                'Menghitung pengunjung unik 7 hari...'
              )}
            </div>
          </div>

          {/* Metrik 4: Total Monetisasi / Sales */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Total Monetisasi
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                {analyticsData?.salesGrowth || 'Belum terukur'}
              </span>
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-extrabold text-white font-mono">
              {analyticsData?.totalSales !== null && analyticsData ? formatIDR(analyticsData.totalSales) : 'Belum diukur'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              Konektor transaksi belum tersedia
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* DENAH KANTOR 2D INTERAKTIF (OFFICE FLOOR PLAN BLUEPRINT) */}
        {/* ======================================================== */}
        <section className="relative rounded-3xl border-2 border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Header Blueprint Denah Kantor */}
          <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  BLUEPRINT DENAH GEDUNG OPERASIONAL // LANTAI 01
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Tata Letak Denah Kantor 2D Karyawan AI
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
                  {activeCount} Ruangan Aktif Bekerja
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Klik tombol &apos;Perintah AI&apos; pada masing-masing ruangan untuk menugaskan divisi secara real-time via Gemini API.
              </p>
            </div>

            {/* Filter Ruangan */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  activeFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua Ruangan ({divisions.length})
              </button>
              <button
                onClick={() => setActiveFilter('Working')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  activeFilter === 'Working' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Working ({activeCount})
              </button>
              <button
                onClick={() => setActiveFilter('Idle')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  activeFilter === 'Idle' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Idle ({divisions.length - activeCount})
              </button>
            </div>
          </div>

          {/* DENAH LANTAI UTAMA (FLOOR PLAN GRID) */}
          <div className="p-6 sm:p-8 space-y-8 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]">
            {/* GRID 6 RUANGAN DIVISI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDivisions.map((division) => {
                const isWorking = division.status === 'Working';
                const isLoading = loadingDivisionId === division.id;

                return (
                  <div
                    key={division.id}
                    className={`relative rounded-2xl border-2 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl ${
                      isWorking || isLoading
                        ? 'border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.3)] ring-1 ring-indigo-400/40 bg-slate-900'
                        : `${division.borderColor} bg-slate-900/95`
                    } group`}
                  >
                    {/* Header Pintu Masuk Ruangan 2D */}
                    <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                          {division.roomCode}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500">
                        PINTU MASUK
                      </span>
                    </div>

                    {/* Area Interior Ruangan (Tile Pattern Lantai Kantor) */}
                    <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                      {/* Nama Divisi & Ikon */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                            {renderDivisionIcon(division.iconName)}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white leading-tight">
                              {division.name}
                            </h3>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {division.wing}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Karakter Pekerja 2D Meja Kerja */}
                      {renderGameWorkstation(division, isWorking, isLoading)}

                      {/* Layar Terminal Pekerjaan Terakhir */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Activity className="w-3 h-3 text-indigo-400" />
                            Aktivitas Tugas Saat Ini:
                          </span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {division.lastUpdated}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed min-h-[58px] flex items-center font-sans">
                          <p className="line-clamp-2">{division.currentTask}</p>
                        </div>
                      </div>

                      {/* Tombol Aksi di Ruangan */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        {/* Tombol Eksekusi AI Langsung */}
                        <button
                          onClick={() => triggerTask(division.id)}
                          disabled={isLoading}
                          className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Memproses AI...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5" />
                              <span>Perintah AI</span>
                            </>
                          )}
                        </button>

                        {/* Tombol Opsi Preset & Instruksi Kustom */}
                        <button
                          onClick={() => {
                            setActiveDivision(division);
                            setModalOutput(null);
                          }}
                          title="Instruksi Kustom"
                          className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
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

            {/* AREA LORONG TENGAH & BREAKROOM (OFFICE CORRIDOR SIMULATION) */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white">Central Corridor & Coffee Lounge</span>
                  <p className="text-[11px] text-slate-500">
                    Titik koordinasi antar 6 divisi operasional kompreskilat.site
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Jaringan Internal: Aktif
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Total Output: <strong>{totalOutputs} tugas</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* PANEL BATCH PERINTAH & HASIL KERJA AGEN AI (TERCATAT LENGKAP) */}
        {/* ======================================================== */}
        <section className="rounded-3xl border-2 border-indigo-500/30 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Header Panel */}
          <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  WORKSTATION BATCH LOG // PERINTAH & HASIL TERPADU
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Batch Riwayat Perintah & Hasil Output Agen AI
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-semibold">
                  {agentBatches.length} Batch Tercatat
                </span>
              </h2>
              <p className="text-xs text-slate-400 max-w-2xl">
                Riwayat instruksi dan hasil yang tersimpan di Supabase. Teks dapat dipublikasikan ke Facebook; Instagram memerlukan video hasil generasi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => {
                  const sosmedDiv = divisions.find(d => d.id === 'sosmed') || divisions[0];
                  setActiveDivision(sosmedDiv);
                  setCustomPrompt('Buatkan quote singkat untuk posting Facebook berdasarkan fitur KompresKilat.');
                  setModalOutput(null);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:opacity-90 active:scale-95 text-white text-xs font-bold transition shadow-md shadow-pink-600/25 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Buat Quote Posting Facebook</span>
              </button>
            </div>
          </div>

          {/* List of Batches */}
          <div className="p-4 sm:p-6 space-y-4">
            {agentBatches.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Layers className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs font-medium">Belum ada batch perintah yang tersimpan.</p>
                <p className="text-[11px] text-slate-600">
                  Gunakan tombol &quot;Instruksi Kustom&quot; atau &quot;Perintah AI&quot; pada salah satu divisi di atas.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {agentBatches.map((batch) => {
                  const isPublished = batch.status === 'published_to_social';

                  return (
                    <div
                      key={batch.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 space-y-3.5 shadow-lg"
                    >
                      {/* Batch Header Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-mono font-bold">
                            #{batch.id.slice(0, 16)}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-semibold">
                            🏢 {batch.divisionName}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            ⏱️ {batch.timestamp}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                            🤖 {batch.model}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isPublished ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              ✓ Terbit ke Facebook
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                              ● Siap Eksekusi
                            </span>
                          )}
                        </div>
                      </div>

                      {/* BLOK 1: PERINTAH / INPUT AGEN (PROMPT USER) */}
                      <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-400">
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" />
                            PERINTAH / INPUT AGEN:
                          </span>
                          <span className="text-[10px] text-indigo-300/70">Instruksi Pengguna</span>
                        </div>
                        <p className="text-xs font-semibold text-white leading-relaxed">
                          &ldquo;{batch.userPrompt}&rdquo;
                        </p>
                      </div>

                      {/* BLOK 2: HASIL / OUTPUT AI TERPADU */}
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-400">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            HASIL OUTPUT AI (DETAIL & TERCATAT):
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(batch.outputContent);
                              setCopiedBatchId(batch.id);
                              setTimeout(() => setCopiedBatchId(null), 2000);
                            }}
                            className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedBatchId === batch.id ? 'Tersalin!' : 'Salin Teks'}</span>
                          </button>
                        </div>

                        {batch.extractedQuote && (
                          <div className="p-2.5 rounded-lg bg-pink-950/30 border border-pink-500/30 text-pink-200 text-xs italic font-medium">
                            💡 Kutipan Terdeteksi: &ldquo;{batch.extractedQuote}&rdquo;
                          </div>
                        )}

                        <div className="text-xs text-slate-200 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap font-sans p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                          {batch.outputContent}
                        </div>
                      </div>

                      {/* BLOK 3: AKSI EKSEKUSI BATCH (1-CLICK PUBLISH) */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePublishBatchToSocial(batch)}
                            disabled={instagramNotice?.status === 'publishing' || batch.divisionId !== 'sosmed'}
                            title={batch.divisionId !== 'sosmed' ? 'Publikasi Facebook hanya tersedia untuk draf Divisi Admin & Sosmed.' : 'Publikasikan teks ini ke Facebook'}
                            className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:opacity-90 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-pink-600/25 cursor-pointer disabled:opacity-50"
                          >
                            {instagramNotice?.status === 'publishing' && instagramNotice.targetId === batch.id ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>Menerbitkan ke Facebook...</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Publikasikan ke Facebook</span>
                              </>
                            )}
                          </button>

                          {batch.socialPermalink && (
                            <a
                              href={batch.socialPermalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-pink-300 hover:text-white text-xs font-semibold transition flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Lihat di Facebook</span>
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteBatch(batch.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Hapus batch ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* PANEL KURASI DRAF ARTIKEL SEO (EDITORIAL REVIEW QUEUE) */}
        {/* ======================================================== */}
        <section className="rounded-3xl border-2 border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  KURASI EDITORIAL // DIVISI SEO & CONTENT WRITER
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Antrean Review Draf Artikel SEO (AdSense Safety Guard)
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
                  {seoDrafts.length} Draf Tersedia
                </span>
              </h2>
              <p className="text-xs text-slate-400 max-w-2xl">
                Artikel dari Divisi SEO disimpan di sini agar dapat ditinjau, diedit, dan disesuaikan kualitasnya oleh Administrator sebelum dirilis ke publik demi mematuhi kebijakan Google AdSense.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => triggerTask('seo')}
                disabled={loadingDivisionId === 'seo'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/25 cursor-pointer disabled:opacity-50"
              >
                {loadingDivisionId === 'seo' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menulis Draf Baru...</span>
                  </>
                ) : (
                  <>
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Generate Draf Artikel Baru</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Table / List of SEO Drafts */}
          <div className="p-4 sm:p-6 space-y-4">
            {storageError && (
              <div role="alert" className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs">
                Data belum tersimpan atau termuat dari server: {storageError}
              </div>
            )}
            {seoDrafts.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <BookOpen className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs font-medium">Belum ada draf artikel di antrean review.</p>
                <p className="text-[11px] text-slate-600">
                  Klik tombol &quot;Generate Draf Artikel Baru&quot; atau &quot;Perintah AI&quot; pada Ruang SEO 106 di atas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {seoDrafts.map((draft) => {
                  const isApproved = draft.status === 'approved';
                  const isRevision = draft.status === 'revision';

                  return (
                    <div
                      key={draft.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700/80 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Status Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                              isApproved
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : isRevision
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {isApproved
                              ? '✓ Siap Publikasi'
                              : isRevision
                              ? '⚠ Perlu Revisi'
                              : '⏳ Menunggu Review Admin'}
                          </span>

                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-600" />
                            Dibuat: {draft.createdAt}
                          </span>

                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                            Slug: /{draft.slug}
                          </span>
                        </div>

                        {/* Title & Excerpt */}
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition">
                            {draft.title}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {draft.metaDescription || draft.content.slice(0, 160)}
                          </p>
                        </div>

                        {/* Keyword tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-slate-500 font-mono">Keywords:</span>
                          {draft.keywords.split(',').map((kw, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800/80 text-[10px] text-slate-300 font-mono"
                            >
                              {kw.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-center">
                        {/* Tombol Review & Edit Manual */}
                        <button
                          onClick={() => {
                            setEditingDraft({ ...draft });
                            setIsReviewModalOpen(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Review & Edit</span>
                        </button>

                        {/* Tombol Rilis ke Instagram (Graph API) */}
                        <button
                          onClick={() =>
                            handlePublishToInstagram({
                              caption: draft.content,
                              videoUrl: draft.videoUrl,
                              title: draft.title,
                              draftId: draft.id,
                            })
                          }
                          disabled={
                            instagramNotice?.status === 'publishing' ||
                            !isApproved ||
                            !draft.videoUrl
                          }
                          title={
                            !isApproved
                              ? 'Setujui draf terlebih dahulu sebelum merilis.'
                              : !draft.videoUrl
                                ? 'Draf ini belum memiliki video hasil generasi.'
                                : 'Rilis ke Akun Instagram Bisnis via Graph API'
                          }
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
                            draft.isPublishedToInstagram
                              ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                              : 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-90 active:scale-95 text-white shadow-pink-600/25'
                          } disabled:opacity-50`}
                        >
                          {instagramNotice?.status === 'publishing' && instagramNotice.targetId === draft.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span className="hidden sm:inline">Mengunggah...</span>
                            </>
                          ) : draft.isPublishedToInstagram ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Dirilis ke IG</span>
                            </>
                          ) : (
                            <>
                              <InstagramIcon className="w-3.5 h-3.5" />
                              <span>Rilis ke Instagram</span>
                            </>
                          )}
                        </button>

                        {/* Tombol Salin Markdown */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(draft.content);
                            setCopiedLogId(draft.id);
                            setTimeout(() => setCopiedLogId(null), 2000);
                          }}
                          title="Salin Markdown Lengkap"
                          className="p-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedLogId === draft.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[11px] text-emerald-400">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[11px] hidden sm:inline">Salin</span>
                            </>
                          )}
                        </button>

                        {/* Quick Approve Toggle */}
                        <button
                          onClick={() => {
                            const newStatus = isApproved ? 'pending_review' : 'approved';
                            const updated = seoDrafts.map((d) =>
                              d.id === draft.id ? { ...d, status: newStatus as any } : d
                            );
                            saveDraftsToStorage(updated);
                          }}
                          title={isApproved ? 'Batalkan Persetujuan' : 'Setujui Draf'}
                          className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
                            isApproved
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-400'
                          }`}
                        >
                          <CheckSquare className="w-4 h-4" />
                        </button>

                        {/* Hapus Draf */}
                        <button
                          onClick={() => {
                            const updated = seoDrafts.filter((d) => d.id !== draft.id);
                            saveDraftsToStorage(updated);
                          }}
                          title="Hapus Draf"
                          className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

              {/* Output Result Preview Box (Tercatat dalam Batch) */}
              {modalOutput && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Batch Berhasil Dibuat & Tercatat ({modalOutput.timestamp} WIB)
                    </span>

                    <button
                      onClick={() => handleCopy(modalOutput.text)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {modalOutput.text}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono">
                      🤖 Model: {modalOutput.source}
                    </span>

                    <span className="text-[11px] text-slate-500">
                      Hasil tersimpan di riwayat. Publikasi Facebook tersedia dari batch; Instagram memerlukan video.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL EDITORIAL: REVIEW & EDIT MANUAL DRAF ARTIKEL SEO */}
      {/* ======================================================== */}
      {isReviewModalOpen && editingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Review & Kurasi Editorial Artikel SEO
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                      AdSense Safety Guard
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pastikan konten orisinal, bermanfaat bagi pengguna, dan bebas dari duplikasi sebelum dirilis.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setEditingDraft(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Judul & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Judul Artikel (H1):</label>
                  <input
                    type="text"
                    value={editingDraft.title}
                    onChange={(e) => setEditingDraft({ ...editingDraft, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Slug URL:</label>
                  <input
                    type="text"
                    value={editingDraft.slug}
                    onChange={(e) => setEditingDraft({ ...editingDraft, slug: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Meta Deskripsi & Target Keyword */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-300">Meta Deskripsi:</label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {editingDraft.metaDescription.length}/160 karakter
                    </span>
                  </div>
                  <input
                    type="text"
                    value={editingDraft.metaDescription}
                    onChange={(e) => setEditingDraft({ ...editingDraft, metaDescription: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Target Keyword:</label>
                  <input
                    type="text"
                    value={editingDraft.keywords}
                    onChange={(e) => setEditingDraft({ ...editingDraft, keywords: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Status Review Dropdown */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Status Kurasi Administrator:</label>
                <select
                  value={editingDraft.status}
                  onChange={(e) => setEditingDraft({ ...editingDraft, status: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="pending_review">⏳ Menunggu Review Administrator</option>
                  <option value="approved">✓ Siap Diterbitkan ke Blog Publik (Approved)</option>
                  <option value="revision">⚠ Perlu Revisi / Tambahan Panduan</option>
                </select>
              </div>

              {/* Textarea Konten Markdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-300">Konten Artikel Lengkap (Markdown):</label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(editingDraft.content);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Tersalin!' : 'Salin Markdown'}</span>
                  </button>
                </div>
                <textarea
                  rows={13}
                  value={editingDraft.content}
                  onChange={(e) => setEditingDraft({ ...editingDraft, content: e.target.value })}
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Format terverifikasi siap rilis untuk blog Next.js</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handlePublishToInstagram({
                      caption: editingDraft.content,
                      videoUrl: editingDraft.videoUrl,
                      title: editingDraft.title,
                      draftId: editingDraft.id,
                    });
                  }}
                  disabled={instagramNotice?.status === 'publishing' || !editingDraft.videoUrl}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-90 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-pink-600/25 disabled:opacity-50"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>Rilis ke Instagram</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setEditingDraft(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const updated = seoDrafts.map((d) =>
                      d.id === editingDraft.id ? editingDraft : d
                    );
                    saveDraftsToStorage(updated);
                    setIsReviewModalOpen(false);
                    setEditingDraft(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* POP-UP MODAL: PEMUTAR VIDEO AI & AKSI RILIS KE INSTAGRAM */}
      {/* ======================================================== */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
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
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label htmlFor="video-prompt" className="block text-xs font-bold text-slate-300">
                  Brief video AI
                </label>
                <textarea
                  id="video-prompt"
                  rows={3}
                  value={videoPrompt}
                  onChange={(event) => setVideoPrompt(event.target.value)}
                  placeholder="Jelaskan adegan, gaya visual, pesan, dan audiens video yang ingin dibuat."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => videoJobId ? resumeVideoJob(videoJobId) : handleGenerateVideo()}
                  disabled={isGeneratingVideo || (!videoJobId && videoPrompt.trim().length < 10)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  {isGeneratingVideo
                    ? 'Memeriksa status video...'
                    : videoJobId
                      ? 'Lanjutkan pemeriksaan video'
                      : 'Generate video asli'}
                </button>
                {videoGenerationError && (
                  <p role="alert" className="text-xs text-rose-300">{videoGenerationError}</p>
                )}
              </div>

              {creativeVideo.videoUrl ? (
                <div className="relative rounded-2xl overflow-hidden bg-black border border-amber-500/30 shadow-2xl group/video">
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    poster={creativeVideo.thumbnailUrl}
                    src={creativeVideo.videoUrl}
                    className="w-full max-h-[300px] object-cover bg-black"
                  >
                    Browser Anda tidak mendukung pemutar video HTML5.
                  </video>
                  {creativeVideo.duration && (
                    <div className="absolute top-3 right-3 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-black/80 text-[11px] font-mono font-bold text-amber-300 border border-amber-500/30">
                        {creativeVideo.duration}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                  Belum ada video produksi. Masukkan brief lalu jalankan generasi video.
                </div>
              )}

              {/* Info Model & Judul */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm line-clamp-1">{creativeVideo.title || 'Belum ada video'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0 ml-2">
                    {creativeVideo.model || 'Belum dibuat'}
                  </span>
                </div>

                {creativeVideo.caption && (
                  <div className="text-slate-300 text-xs leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 font-sans">
                    {creativeVideo.caption}
                  </div>
                )}

                {/* Status Rilis Instagram Langsung di Dalam Modal */}
                {instagramNotice && instagramNotice.targetId === 'creative' && (
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
                        <span>Buka publikasi</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions: Langsung Rilis ke Instagram */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block">
                Publikasi hanya aktif jika Instagram Business API dan video valid dikonfigurasi.
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
                    handlePublishToInstagram({
                      caption: creativeVideo.caption,
                      videoUrl: creativeVideo.videoUrl,
                      title: creativeVideo.title,
                    })
                  }
                  disabled={instagramNotice?.status === 'publishing' || !creativeVideo.videoUrl}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-90 active:scale-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-pink-600/30 cursor-pointer disabled:opacity-50"
                >
                  {instagramNotice?.status === 'publishing' && instagramNotice.targetId === 'creative' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengunggah ke IG...</span>
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
  );
}
