'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Tv,
  Activity,
  ExternalLink,
  LogOut,
  RefreshCw,
  Volume2,
  VolumeX,
  LayoutDashboard,
} from 'lucide-react';

interface AdminHeaderProps {
  currentTab: 'hub' | 'virtual-office' | 'monitoring';
  latency?: string;
  uptime?: string;
  onSync?: () => void;
  isSyncing?: boolean;
  sfxEnabled?: boolean;
  onToggleSfx?: () => void;
  onLogout: () => void;
}

export default function AdminHeader({
  currentTab,
  latency = 'Belum terukur',
  uptime = 'Belum terukur',
  onSync,
  isSyncing = false,
  sfxEnabled = true,
  onToggleSfx,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
      {/* Brand & Breadcrumb */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/20 shrink-0">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Building2 className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Link href="/" className="hover:text-white transition">
              kompreskilat.site
            </Link>
            <span>/</span>
            <span className="text-indigo-400 font-semibold">Admin Command Center</span>
            <span>/</span>
            <span className="text-slate-500">
              {currentTab === 'virtual-office'
                ? 'Kantor Virtual 2D'
                : currentTab === 'monitoring'
                ? 'Pusat Pemantauan'
                : 'HQ Hub'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            HQ Virtual Karyawan AI
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold font-mono">
              Gemini 2.5 Flash
            </span>
          </h1>
        </div>
      </div>

      {/* Main Mode Navigation Tabs (Pemisahan 2 Halaman Utama) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
        <Link
          href="/admin/ai-employees/virtual-office"
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
            currentTab === 'virtual-office'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Kantor Virtual 2D</span>
        </Link>

        <Link
          href="/admin/ai-employees/monitoring"
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
            currentTab === 'monitoring'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Pusat Pemantauan</span>
        </Link>

        <Link
          href="/admin/ai-employees"
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
            currentTab === 'hub'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Semua Panel</span>
        </Link>
      </div>

      {/* Quick Action Controls */}
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        {/* Edge Status Pill */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-slate-500" />
          <span className="text-slate-300">{latency}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{uptime}</span>
        </div>

        {/* Sync Button */}
        {onSync && (
          <button
            onClick={onSync}
            disabled={isSyncing}
            title="Sinkronkan data analitik real-time dari API"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Sinkron...' : 'Sinkron'}</span>
          </button>
        )}

        {/* SFX Toggle */}
        {onToggleSfx && (
          <button
            onClick={onToggleSfx}
            title={sfxEnabled ? 'Matikan SFX 8-Bit' : 'Nyalakan SFX 8-Bit'}
            className={`inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border text-xs font-mono transition cursor-pointer ${
              sfxEnabled
                ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {sfxEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span className="text-[10px] hidden sm:inline">{sfxEnabled ? 'ON' : 'OFF'}</span>
          </button>
        )}

        {/* Website Link */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition cursor-pointer"
        >
          <span>Web</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          title="Keluar dari Sesi Administrator"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
