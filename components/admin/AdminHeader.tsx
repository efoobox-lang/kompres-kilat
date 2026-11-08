'use client';

import React, { useState, useEffect } from 'react';
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
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Play,
  X,
} from 'lucide-react';
import type { SystemNotification } from '@/lib/notification-service';

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
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isRunningCron, setIsRunningCron] = useState<boolean>(false);
  const [cronMessage, setCronMessage] = useState<string | null>(null);

  // Ambil notifikasi dari server secara berkala
  useEffect(() => {
    let active = true;
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/admin/notifications', { cache: 'no-store' });
        const data = await res.json();
        if (active && res.ok && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      } catch {}
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleTriggerAutonomousCron = async () => {
    setIsRunningCron(true);
    setCronMessage(null);
    try {
      const res = await fetch('/api/cron/agents', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setCronMessage('✓ Autonomous AI berhasil dieksekusi untuk seluruh divisi!');
        // Refresh notifikasi
        const notifRes = await fetch('/api/admin/notifications', { cache: 'no-store' });
        const notifData = await notifRes.json();
        if (notifRes.ok && Array.isArray(notifData.notifications)) {
          setNotifications(notifData.notifications);
        }
        if (onSync) onSync();
      } else {
        throw new Error(data.error || 'Gagal menjalankan cron.');
      }
    } catch (err: any) {
      setCronMessage(`Gagal: ${err.message}`);
    } finally {
      setIsRunningCron(false);
      setTimeout(() => setCronMessage(null), 4000);
    }
  };

  return (
    <header className="space-y-3 pb-5 border-b border-slate-800/80 relative">
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

        {/* Top-Right Quick Utilities & Notification Bell */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Tombol Lonceng Notifikasi Terpusat */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              title="Notifikasi & Peringatan Sistem AI"
              className={`relative inline-flex items-center justify-center p-2 rounded-xl border text-xs transition cursor-pointer ${
                isNotifOpen
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center animate-pulse border-2 border-slate-950">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Notifikasi */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-xs text-white">Notifikasi & Peringatan</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                        {unreadCount} Baru
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        title="Tandai semua telah dibaca"
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition text-[11px] flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Tandai Dibaca</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tombol Eksekusi Manual Autonomous Cron */}
                <div className="p-2.5 bg-indigo-950/40 border-b border-indigo-900/40 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-indigo-300">Jadwal Otomatis: Vercel Cron</span>
                  <button
                    onClick={handleTriggerAutonomousCron}
                    disabled={isRunningCron}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isRunningCron ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-white" />
                        <span>Jalankan Cron Sekarang</span>
                      </>
                    )}
                  </button>
                </div>

                {cronMessage && (
                  <div className="px-3 py-1.5 text-[11px] bg-emerald-950/80 text-emerald-300 border-b border-emerald-900/60 font-medium">
                    {cronMessage}
                  </div>
                )}

                {/* Daftar Notifikasi */}
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      Belum ada notifikasi baru.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 text-xs space-y-1 transition ${
                          notif.isRead ? 'bg-slate-900/40 opacity-75' : 'bg-slate-900/90'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-indigo-300">
                            {notif.divisionName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(notif.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-[11px] leading-tight">
                          {notif.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
            <span className="hidden sm:inline">Edge:</span>
            <span className="text-emerald-400 font-semibold">{latency}</span>
          </div>

          {/* Uptime Status Pill */}
          <div className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono shrink-0">
            <span className="hidden sm:inline">Uptime:</span>
            <span className="text-indigo-400 font-semibold">{uptime}</span>
          </div>

          {/* Sync Trigger */}
          {onSync && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              title="Sinkronisasi Data Real-Time"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          )}

          {/* SFX Toggle */}
          {onToggleSfx && (
            <button
              onClick={onToggleSfx}
              title={sfxEnabled ? 'Matikan Suara SFX Kantor' : 'Nyalakan Suara SFX Kantor'}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer shrink-0"
            >
              {sfxEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
