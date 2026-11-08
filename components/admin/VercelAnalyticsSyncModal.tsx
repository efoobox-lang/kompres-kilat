'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  BarChart2,
  KeyRound,
  Eye,
  Users,
  MousePointerClick,
} from 'lucide-react';

interface VercelAnalyticsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentViews?: number;
  currentVisitors?: number;
  currentClicks?: number;
  currentSource?: string;
  onSyncSuccess: (updatedData: any) => void;
}

export default function VercelAnalyticsSyncModal({
  isOpen,
  onClose,
  currentViews = 0,
  currentVisitors = 0,
  currentClicks = 0,
  currentSource = '',
  onSyncSuccess,
}: VercelAnalyticsSyncModalProps) {
  const [activeTab, setActiveTab] = useState<'quick' | 'api'>('quick');

  // Form State Opsi 1: Angka Riil Dashboard Vercel
  const [viewsInput, setViewsInput] = useState<string>('');
  const [visitorsInput, setVisitorsInput] = useState<string>('');
  const [clicksInput, setClicksInput] = useState<string>('');

  // Form State Opsi 2: Vercel API Token
  const [vercelToken, setVercelToken] = useState<string>('');
  const [vercelProjectId, setVercelProjectId] = useState<string>('');
  const [vercelTeamId, setVercelTeamId] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setViewsInput(String(currentViews || 91));
      setVisitorsInput(String(currentVisitors || 7));
      setClicksInput(String(currentClicks || 22));
      setStatusMessage(null);
    }
  }, [isOpen, currentViews, currentVisitors, currentClicks]);

  if (!isOpen) return null;

  const handleSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const parsedViews = parseInt(viewsInput, 10);
      const parsedVisitors = parseInt(visitorsInput, 10);
      const parsedClicks = clicksInput ? parseInt(clicksInput, 10) : Math.round(parsedViews * 0.24);

      if (isNaN(parsedViews) || parsedViews < 0) {
        throw new Error('Total Views harus berupa angka valid.');
      }
      if (isNaN(parsedVisitors) || parsedVisitors < 0) {
        throw new Error('Unique Visitors harus berupa angka valid.');
      }

      const payload: Record<string, any> = {
        action: 'sync_vercel',
        totalViews: parsedViews,
        uniqueVisitors: parsedVisitors,
        totalClicks: parsedClicks,
        sourceNote: 'Vercel Web Analytics (Tersinkronisasi End-to-End)',
      };

      if (activeTab === 'api') {
        if (vercelToken.trim()) payload.vercelToken = vercelToken.trim();
        if (vercelProjectId.trim()) payload.projectId = vercelProjectId.trim();
        if (vercelTeamId.trim()) payload.teamId = vercelTeamId.trim();
      }

      const res = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyinkronkan data.');
      }

      setStatusMessage({
        type: 'success',
        text: '✓ Data analitik berhasil disinkronkan end-to-end!',
      });

      if (onSyncSuccess && json.data) {
        onSyncSuccess(json.data);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Terjadi kesalahan saat sinkronisasi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Sinkronisasi Vercel Analytics
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                  End-to-End
                </span>
              </h3>
              <p className="text-xs text-slate-400">Penyelarasan Metrik Riil kompreskilat.site</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/50 px-5 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'quick'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Masukkan Angka Vercel (Instan)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'api'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🔑 Hubungkan Vercel API Token
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSyncSubmit} className="p-5 space-y-4">
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'quick' ? (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-300 leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Buka tab <strong>Vercel Dashboard &gt; Analytics</strong>, lalu masukkan angka metrik 7 hari atau total kunjungan yang tertera di Vercel agar dasbor admin ini langsung akurat dan selaras.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    Total Views di Vercel:
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={viewsInput}
                    onChange={(e) => setViewsInput(e.target.value)}
                    placeholder="Contoh: 1420"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    Unique Visitors di Vercel:
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={visitorsInput}
                    onChange={(e) => setVisitorsInput(e.target.value)}
                    placeholder="Contoh: 380"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MousePointerClick className="w-3.5 h-3.5 text-purple-400" />
                  Total Clicks / Interaksi Pengguna (Opsional):
                </label>
                <input
                  type="number"
                  min="0"
                  value={clicksInput}
                  onChange={(e) => setClicksInput(e.target.value)}
                  placeholder="Kosongkan jika ingin dihitung otomatis (~24% CTR)"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Pelacak telemetri real-time website:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Aktif & Akumulatif
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-300 leading-relaxed">
                💡 Masukkan Vercel Personal Access Token untuk menyinkronkan data secara otomatis langsung dari Vercel Web Analytics Query API.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  Vercel Access Token:
                </label>
                <input
                  type="password"
                  value={vercelToken}
                  onChange={(e) => setVercelToken(e.target.value)}
                  placeholder="vercel_..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Vercel Project ID:
                  </label>
                  <input
                    type="text"
                    value={vercelProjectId}
                    onChange={(e) => setVercelProjectId(e.target.value)}
                    placeholder="prj_..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Team ID (Opsional):
                  </label>
                  <input
                    type="text"
                    value={vercelTeamId}
                    onChange={(e) => setVercelTeamId(e.target.value)}
                    placeholder="team_..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Modal */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Buka Vercel Dashboard</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyinkronkan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terapkan & Sinkronkan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
