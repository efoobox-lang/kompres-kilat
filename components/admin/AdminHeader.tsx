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
    <header className="space-y-3 pb-5 border-b border-slate-800/80">
      {/* Top Row: Brand & Status & Quick Exit */}
      <div className="flex items-center justify-between gap-3">
        {/* Brand & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono truncate">
              <Link href="/" className="hover:text-white transition shrink-0">
                kompreskilat.site
              </Link>
              <span>/</span>
              <span className="text-indigo-400 font-semibold truncate">
                {currentTab === 'virtual-office'
                  ? 'Kantor 2D'
                  : currentTab === 'monitoring'
                  ? 'Pemantauan'
                  : 'Hub'}
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2 truncate">
              HQ Virtual Karyawan AI
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-semibold font-mono">
                Gemini 2.5 Flash
              </span>
            </h1>
          </div>
        </div>

        {/* Top-Right Quick Utilities */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/"
            target="_blank"
            title="Buka Website Utama kompreskilat.site"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition cursor-pointer"
          >
            <span className="text-[11px] font-mono">Web</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            onClick={onLogout}
            title="Keluar dari Sesi Administrator"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[11px] font-mono hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Second Row: Responsive Tabs & Telemetry Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-1">
        {/* Navigation Tabs (Full Width on Mobile, Auto on Desktop) */}
        <nav className="grid grid-cols-3 sm:flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-inner">
          <Link
            href="/admin/ai-employees/virtual-office"
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-center ${
              currentTab === 'virtual-office'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Tv className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Kantor 2D</span>
          </Link>

          <Link
            href="/admin/ai-employees/monitoring"
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-center ${
              currentTab === 'monitoring'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Pemantauan</span>
          </Link>

          <Link
            href="/admin/ai-employees"
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-center ${
              currentTab === 'hub'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Semua Panel</span>
          </Link>
        </nav>

        {/* Telemetry and Sound / Sync Controls */}
        <div className="flex items-center justify-between md:justify-end gap-2 overflow-x-auto">
          {/* Edge Status Pill */}
          <div className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200">{latency}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{uptime}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Sync Button */}
            {onSync && (
              <button
                onClick={onSync}
                disabled={isSyncing}
                title="Sinkronkan data analitik real-time dari API"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
                <span className="text-[11px] font-mono hidden xs:inline">{isSyncing ? '...' : 'Sinkron'}</span>
              </button>
            )}

            {/* SFX Toggle */}
            {onToggleSfx && (
              <button
                onClick={onToggleSfx}
                title={sfxEnabled ? 'Matikan SFX 8-Bit' : 'Nyalakan SFX 8-Bit'}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition cursor-pointer ${
                  sfxEnabled
                    ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {sfxEnabled ? <Volume2 className="w-3 h-3 text-indigo-400" /> : <VolumeX className="w-3 h-3 text-slate-500" />}
                <span className="text-[10px]">{sfxEnabled ? 'ON' : 'OFF'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
