'use client';

import React, { useEffect, useRef } from 'react';

export interface PixelWorkstationProps {
  divisionId: string;
  divisionName: string;
  iconName: string;
  isWorking: boolean;
  isLoading: boolean;
  metricLabel: string;
  metricValue: string;
  outputCount: number;
  liveViews?: number;
  liveVisitors?: number;
}

export default function PixelOfficeWorkstation({
  divisionId,
  divisionName,
  iconName,
  isWorking,
  isLoading,
  metricLabel,
  metricValue,
  outputCount,
  liveViews,
  liveVisitors,
}: PixelWorkstationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas particle engine for game effects when agent is working
  useEffect(() => {
    if (!isWorking && !isLoading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      char: string;
      color: string;
    }> = [];

    const getDivisionParticles = () => {
      switch (iconName) {
        case 'it':
          return ['0', '1', '⚡', '</>', '24ms', 'SYS'];
        case 'analytics':
          return [String(liveViews ?? 'Live'), String(liveVisitors ?? 'Users'), '📈', '%', 'CTR', '+1'];
        case 'marketing':
          return ['🚀', '🔥', 'ROI', '100%', 'BOOST'];
        case 'sosmed':
          return ['❤️', '💬', '🔔', 'LIKE', 'DM'];
        case 'creative':
          return ['✨', '🎨', '4K', '🎬', 'FX'];
        case 'seo':
          return ['📝', '🛡️', 'SEO', 'A+', 'SAFE'];
        default:
          return ['⚡', '✨', '100%'];
      }
    };

    const particlePool = getDivisionParticles();
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7'];

    const spawnParticle = () => {
      if (particles.length >= 16) return;
      particles.push({
        x: canvas.width * 0.3 + Math.random() * (canvas.width * 0.4),
        y: canvas.height * 0.75,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -1.2 - Math.random() * 1.5,
        size: 9 + Math.random() * 4,
        alpha: 1,
        char: particlePool[Math.floor(Math.random() * particlePool.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.25) {
        spawnParticle();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;

        if (p.alpha <= 0 || p.y <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.font = `bold ${Math.round(p.size)}px monospace`;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillText(p.char, p.x, p.y);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isWorking, isLoading, iconName]);

  // Color accents based on division
  const getThemeColors = () => {
    switch (iconName) {
      case 'it':
        return {
          glow: 'rgba(34, 197, 94, 0.4)',
          screenBg: '#052e16',
          screenContent: '#22c55e',
          hair: '#1e293b',
          shirt: '#10b981',
          roleBadge: 'DevOps SysAdmin',
          statusText: '⚡ Compiling & Edge Sync',
        };
      case 'analytics':
        return {
          glow: 'rgba(168, 85, 247, 0.4)',
          screenBg: '#2e1065',
          screenContent: '#c084fc',
          hair: '#475569',
          shirt: '#8b5cf6',
          roleBadge: 'Data Scientist',
          statusText: liveViews !== undefined ? `📊 Telemetri ${liveVisitors || 0} Visitors / ${liveViews} Views` : '📊 Telemetri Real-Time Sync',
        };
      case 'marketing':
        return {
          glow: 'rgba(249, 115, 22, 0.4)',
          screenBg: '#431407',
          screenContent: '#fb923c',
          hair: '#78350f',
          shirt: '#f97316',
          roleBadge: 'Growth Hacker',
          statusText: '🚀 Optimasi Ads & Konversi',
        };
      case 'sosmed':
        return {
          glow: 'rgba(236, 72, 153, 0.4)',
          screenBg: '#500724',
          screenContent: '#f472b6',
          hair: '#831843',
          shirt: '#ec4899',
          roleBadge: 'Community Manager',
          statusText: '💬 Respon DM & Draf Medsos',
        };
      case 'creative':
        return {
          glow: 'rgba(99, 102, 241, 0.4)',
          screenBg: '#1e1b4b',
          screenContent: '#818cf8',
          hair: '#312e81',
          shirt: '#6366f1',
          roleBadge: 'Art Director',
          statusText: '🎨 Rendering Thumbnail & Aset',
        };
      case 'seo':
      default:
        return {
          glow: 'rgba(16, 185, 129, 0.4)',
          screenBg: '#064e3b',
          screenContent: '#34d399',
          hair: '#065f46',
          shirt: '#059669',
          roleBadge: 'SEO & Editorial Writer',
          statusText: '✍️ Menulis Draf Artikel AdSense',
        };
    }
  };

  const theme = getThemeColors();

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden transition-all duration-300 border ${
        isWorking || isLoading
          ? 'border-indigo-500/80 bg-slate-950/90 shadow-[0_0_25px_rgba(99,102,241,0.35)]'
          : 'border-slate-800/80 bg-slate-950/70'
      }`}
    >
      {/* Canvas Partikel Animasi Game */}
      <canvas
        ref={canvasRef}
        width={320}
        height={180}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />

      {/* Speed lines & neon overlay when working */}
      {isWorking && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-30">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(99,102,241,0.15)_10px,rgba(99,102,241,0.15)_20px)] animate-[pulse_1.5s_infinite]" />
        </div>
      )}

      {/* Status Bar Atas Avatar Game */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono bg-slate-900/60 relative z-30">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isWorking || isLoading ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`}
          />
          <span className="font-bold text-white text-[11px]">{theme.roleBadge}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-slate-500">{metricLabel}:</span>
          <span className="text-indigo-300 font-bold">{metricValue}</span>
        </div>
      </div>

      {/* Game Stage / Pixel Room Viewport */}
      <div className="relative p-3 sm:p-4 flex flex-col items-center justify-center min-h-[160px] select-none">
        {/* Floating Bubble Status */}
        <div className="relative mb-2 z-30">
          {isWorking || isLoading ? (
            <div className="px-3 py-1 rounded-full bg-indigo-600/90 border border-indigo-400/80 text-[10px] font-mono font-bold text-white shadow-lg shadow-indigo-600/40 flex items-center gap-1.5 animate-bounce">
              <span className="animate-spin text-amber-300">⚡</span>
              <span>{isLoading ? 'Menghubungkan Gemini 3.x...' : theme.statusText}</span>
            </div>
          ) : (
            <div className="px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <span>☕</span>
              <span>Standby // Siap bertugas</span>
            </div>
          )}
        </div>

        {/* Pixel Art SVG Simulator */}
        <div className="relative w-full max-w-[280px] h-[120px] flex items-center justify-center">
          <svg
            viewBox="0 0 240 120"
            className="w-full h-full drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]"
            style={{ shapeRendering: 'crispEdges' }}
          >
            <defs>
              {/* Scanline pattern for pixel monitor */}
              <pattern id={`scanlines-${divisionId}`} width="100%" height="4" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="100%" y2="0" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Lantai Ruangan Berpola Pixel */}
            <rect x="10" y="86" width="220" height="30" fill="#0f172a" />
            <line x1="10" y1="96" x2="230" y2="96" stroke="#1e293b" strokeWidth="1" />
            <line x1="10" y1="106" x2="230" y2="106" stroke="#1e293b" strokeWidth="1" />
            <line x1="60" y1="86" x2="60" y2="116" stroke="#1e293b" strokeWidth="1" />
            <line x1="120" y1="86" x2="120" y2="116" stroke="#1e293b" strokeWidth="1" />
            <line x1="180" y1="86" x2="180" y2="116" stroke="#1e293b" strokeWidth="1" />

            {/* Bayangan Meja & Kursi */}
            <ellipse cx="120" cy="100" rx="65" ry="10" fill="#020617" opacity="0.6" />

            {/* Kursi Ergonomis Kantor Gaming */}
            <g className={isWorking ? 'animate-[pulse_1s_infinite]' : ''}>
              {/* Sandaran Kursi */}
              <rect x="106" y="32" width="28" height="34" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <rect x="110" y="36" width="20" height="26" fill={theme.shirt} opacity="0.8" />
              {/* Tiang Kursi */}
              <rect x="118" y="66" width="4" height="24" fill="#475569" />
              {/* Kaki Roda Kursi */}
              <line x1="106" y1="90" x2="134" y2="90" stroke="#334155" strokeWidth="3" />
              <circle cx="106" cy="92" r="2" fill="#0f172a" />
              <circle cx="134" cy="92" r="2" fill="#0f172a" />
            </g>

            {/* KARAKTER KARYAWAN PIXEL ART (BADAN, KEPALA, TANGAN) */}
            <g id="character-group">
              {/* Badan / Baju */}
              <rect
                x="110"
                y="46"
                width="20"
                height="22"
                fill={theme.shirt}
                className={isWorking ? 'animate-[bounce_0.25s_infinite]' : 'animate-[pulse_3s_infinite]'}
              />

              {/* Kepala Karakter */}
              <g className={isWorking ? 'animate-[bounce_0.2s_infinite]' : 'animate-[pulse_4s_infinite]'}>
                {/* Rambut Karakter */}
                <rect x="110" y="22" width="20" height="10" fill={theme.hair} />
                <rect x="108" y="25" width="4" height="12" fill={theme.hair} />
                <rect x="128" y="25" width="4" height="12" fill={theme.hair} />

                {/* Wajah / Kulit */}
                <rect x="112" y="26" width="16" height="14" fill="#fcd34d" />

                {/* Mata Karakter */}
                <rect x="114" y="30" width="3" height="3" fill="#0f172a" />
                <rect x="123" y="30" width="3" height="3" fill="#0f172a" />

                {/* Mulut / Ekspresi */}
                {isWorking ? (
                  /* Ekspresi Konsentrasi Mengetik Cepat */
                  <rect x="117" y="36" width="6" height="2" fill="#e11d48" />
                ) : (
                  /* Senyum Tenang */
                  <rect x="118" y="36" width="4" height="1" fill="#475569" />
                )}

                {/* Aksesoris Kepala Berdasarkan Divisi */}
                {iconName === 'it' && (
                  /* Headset Gaming Hijau */
                  <g>
                    <path d="M 108 26 A 12 12 0 0 1 132 26" stroke="#22c55e" strokeWidth="2" fill="none" />
                    <rect x="106" y="28" width="4" height="8" rx="1" fill="#22c55e" />
                    <rect x="130" y="28" width="4" height="8" rx="1" fill="#22c55e" />
                  </g>
                )}
                {iconName === 'analytics' && (
                  /* Kacamata Analisis */
                  <g>
                    <rect x="113" y="29" width="5" height="4" fill="none" stroke="#38bdf8" strokeWidth="1" />
                    <rect x="122" y="29" width="5" height="4" fill="none" stroke="#38bdf8" strokeWidth="1" />
                    <line x1="118" y1="31" x2="122" y2="31" stroke="#38bdf8" strokeWidth="1" />
                  </g>
                )}
                {iconName === 'marketing' && (
                  /* Topi Cap Terbalik */
                  <rect x="108" y="20" width="24" height="4" fill="#ea580c" />
                )}
                {iconName === 'creative' && (
                  /* Baret Seniman */
                  <ellipse cx="120" cy="21" rx="12" ry="4" fill="#ec4899" />
                )}
              </g>

              {/* Tangan & Lengan Karakter */}
              {isWorking ? (
                /* Animasi Mengetik Sangat Cepat (Alternating Arms) */
                <g>
                  {/* Tangan Kiri Mengetik Cepat */}
                  <rect
                    x="108"
                    y="50"
                    width="6"
                    height="12"
                    fill="#fcd34d"
                    className="animate-[bounce_0.12s_infinite]"
                  />
                  {/* Tangan Kanan Mengetik Cepat */}
                  <rect
                    x="126"
                    y="52"
                    width="6"
                    height="12"
                    fill="#fcd34d"
                    className="animate-[bounce_0.14s_infinite]"
                  />
                  {/* Percikan Ketikan di Keyboard */}
                  <circle cx="114" cy="66" r="2" fill="#38bdf8" className="animate-ping" />
                  <circle cx="126" cy="66" r="1.5" fill="#facc15" className="animate-ping" />
                </g>
              ) : (
                /* Tangan Santai di Meja */
                <g>
                  <rect x="108" y="54" width="6" height="10" fill="#fcd34d" />
                  <rect x="126" y="54" width="6" height="10" fill="#fcd34d" />
                </g>
              )}
            </g>

            {/* MEJA KERJA KANTOR (DESK TOP & LEGS) */}
            <g id="desk-group">
              {/* Permukaan Meja Kayu Modern */}
              <rect x="40" y="64" width="160" height="8" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />
              <rect x="40" y="70" width="160" height="2" fill="#1e293b" />

              {/* Kaki Meja Baja */}
              <rect x="46" y="72" width="4" height="28" fill="#1e293b" />
              <rect x="190" y="72" width="4" height="28" fill="#1e293b" />
            </g>

            {/* SETUP KOMPUTER DUAL MONITOR DI MEJA */}
            <g id="monitors-group">
              {/* Stand Monitor Utama */}
              <rect x="116" y="58" width="8" height="6" fill="#0f172a" />
              <rect x="112" y="63" width="16" height="2" fill="#475569" />

              {/* Monitor Utama (Tengah/Kiri) */}
              <rect x="68" y="24" width="60" height="36" rx="2" fill="#020617" stroke="#334155" strokeWidth="2" />
              {/* Layar Aktif dengan Glow */}
              <rect x="71" y="27" width="54" height="30" fill={theme.screenBg} />
              <rect x="71" y="27" width="54" height="30" fill={`url(#scanlines-${divisionId})`} />

              {/* Konten Layar Berdasarkan Divisi */}
              {iconName === 'it' && (
                /* Kode Terminal Matrix */
                <g fill={theme.screenContent} fontSize="5" fontFamily="monospace">
                  <text x="73" y="34" className={isWorking ? 'animate-pulse' : ''}>&gt; VERCEL OK</text>
                  <text x="73" y="41">&gt; 24ms EDGE</text>
                  <text x="73" y="48" fill="#22c55e" className={isWorking ? 'animate-bounce' : ''}>&gt; 0101 100%</text>
                  <rect x="73" y="51" width="18" height="2" fill="#22c55e" />
                </g>
              )}

              {iconName === 'analytics' && (
                /* Grafik Batang Bouncing */
                <g fill={theme.screenContent}>
                  <rect x="75" y="46" width="6" height="8" fill="#38bdf8" />
                  <rect x="84" y="38" width="6" height="16" fill="#a855f7" className={isWorking ? 'animate-pulse' : ''} />
                  <rect x="93" y="42" width="6" height="12" fill="#38bdf8" />
                  <rect x="102" y="32" width="6" height="22" fill="#10b981" className={isWorking ? 'animate-[bounce_0.5s_infinite]' : ''} />
                  <text x="74" y="32" fontSize="5" fill="#f8fafc" fontFamily="monospace">
                    {liveViews !== undefined ? `${liveViews} VIEWS` : 'LIVE DATA'}
                  </text>
                </g>
              )}

              {iconName === 'marketing' && (
                /* Roket & Tren */
                <g>
                  <path d="M 75 52 Q 95 44 115 32" stroke="#ea580c" strokeWidth="2" fill="none" />
                  <polygon points="115,32 108,34 112,38" fill="#f97316" />
                  <circle cx="95" cy="44" r="3" fill="#facc15" className={isWorking ? 'animate-ping' : ''} />
                  <text x="74" y="32" fontSize="5" fill="#fb923c" fontFamily="monospace">GROWTH +100%</text>
                </g>
              )}

              {iconName === 'sosmed' && (
                /* Notifikasi Chat & Heart */
                <g fill={theme.screenContent}>
                  <circle cx="84" cy="38" r="4" fill="#ec4899" />
                  <text x="82" y="40" fontSize="5" fill="#ffffff" fontFamily="monospace">♥</text>
                  <rect x="92" y="35" width="24" height="8" rx="2" fill="#3b82f6" />
                  <text x="94" y="41" fontSize="4" fill="#ffffff" fontFamily="monospace">NEW POST</text>
                  <circle cx="114" cy="48" r="3" fill="#22c55e" className={isWorking ? 'animate-ping' : ''} />
                </g>
              )}

              {iconName === 'creative' && (
                /* Video Timeline Scrubber & Palette */
                <g>
                  <rect x="74" y="31" width="48" height="12" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" />
                  <circle cx="82" cy="37" r="3" fill="#ec4899" />
                  <circle cx="90" cy="37" r="3" fill="#38bdf8" />
                  <circle cx="98" cy="37" r="3" fill="#facc15" />
                  <line x1="74" y1="48" x2="122" y2="48" stroke="#475569" strokeWidth="2" />
                  <line
                    x1="74"
                    y1="48"
                    x2={isWorking ? "110" : "90"}
                    stroke="#ec4899"
                    strokeWidth="2"
                    className={isWorking ? 'animate-pulse' : ''}
                  />
                  <polygon points="106,45 110,48 106,51" fill="#f8fafc" />
                </g>
              )}

              {iconName === 'seo' && (
                /* Artikel Draf & Perisai AdSense */
                <g>
                  <rect x="74" y="30" width="30" height="22" fill="#f8fafc" rx="1" />
                  <line x1="77" y1="34" x2="100" y2="34" stroke="#0f172a" strokeWidth="1.5" />
                  <line x1="77" y1="38" x2="98" y2="38" stroke="#64748b" strokeWidth="1" />
                  <line x1="77" y1="42" x2="94" y2="42" stroke="#64748b" strokeWidth="1" />
                  <line x1="77" y1="46" x2="96" y2="46" stroke="#64748b" strokeWidth="1" />
                  {/* Perisai Hijau AdSense Safe */}
                  <polygon points="112,32 119,34 119,42 112,47 105,42 105,34" fill="#10b981" />
                  <text x="109" y="42" fontSize="5" fill="#ffffff" fontWeight="bold">✓</text>
                </g>
              )}

              {/* Monitor Tambahan / Layar Telemetri Kanan */}
              <rect x="134" y="28" width="38" height="32" rx="2" fill="#020617" stroke="#334155" strokeWidth="2" />
              <rect x="136" y="30" width="34" height="26" fill="#0f172a" />
              {/* Lampu LED Status di Monitor */}
              <circle cx="140" cy="34" r="1.5" fill="#10b981" className="animate-pulse" />
              <circle cx="145" cy="34" r="1.5" fill="#38bdf8" />
              <circle cx="150" cy="34" r="1.5" fill={isWorking ? '#f59e0b' : '#334155'} className={isWorking ? 'animate-ping' : ''} />
              {/* Mini Sparkline */}
              <polyline
                points="140,48 146,44 152,50 158,40 164,45"
                fill="none"
                stroke={isWorking ? '#22c55e' : '#475569'}
                strokeWidth="1.5"
                className={isWorking ? 'animate-pulse' : ''}
              />
            </g>

            {/* KEYBOARD MEKANIKAL & MOUSE */}
            <g id="peripherals-group">
              {/* Keyboard RGB */}
              <rect
                x="100"
                y="65"
                width="40"
                height="4"
                rx="1"
                fill="#0f172a"
                stroke={isWorking ? theme.screenContent : '#475569'}
                strokeWidth="1"
                className={isWorking ? 'animate-pulse' : ''}
              />
              {/* Mouse */}
              <rect x="146" y="65" width="4" height="4" rx="1" fill="#475569" />
            </g>

            {/* DEKORASI MEJA (CANGKIR KOPI BERASAP & SERVER / MASKOT) */}
            <g id="decor-group">
              {/* Cangkir Kopi / Boba */}
              <rect x="52" y="60" width="8" height="6" rx="1" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.5" />
              <line x1="60" y1="62" x2="62" y2="62" stroke="#94a3b8" strokeWidth="1" />
              {/* Asap Panas Kopi Bergelombang */}
              <path
                d="M 54 58 Q 56 55 54 52"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="1"
                fill="none"
                className="animate-[pulse_2s_infinite]"
              />
              <path
                d="M 58 58 Q 60 55 58 52"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1"
                fill="none"
                className="animate-[pulse_1.5s_infinite]"
              />

              {/* Tanaman Kaktus / Server Tower */}
              {iconName === 'it' ? (
                /* Mini Server Tower dengan LED Kedip */
                <g>
                  <rect x="180" y="44" width="14" height="22" rx="1" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
                  <circle cx="184" cy="48" r="1" fill="#22c55e" className="animate-ping" />
                  <circle cx="184" cy="52" r="1" fill="#38bdf8" />
                  <circle cx="184" cy="56" r="1" fill="#22c55e" />
                  <line x1="188" y1="48" x2="192" y2="48" stroke="#334155" strokeWidth="1" />
                  <line x1="188" y1="52" x2="192" y2="52" stroke="#334155" strokeWidth="1" />
                  <line x1="188" y1="56" x2="192" y2="56" stroke="#334155" strokeWidth="1" />
                </g>
              ) : (
                /* Tanaman Hias Pot Hijau */
                <g>
                  <polygon points="182,64 188,64 187,60 183,60" fill="#b45309" />
                  <circle cx="185" cy="57" r="3" fill="#10b981" />
                  <circle cx="187" cy="55" r="2" fill="#34d399" />
                </g>
              )}
            </g>
          </svg>
        </div>

        {/* Status Lampu Telemetri Bawah */}
        <div className="w-full mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-400 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isWorking ? 'bg-indigo-400 animate-ping' : 'bg-slate-600'}`} />
            <span>Output: <strong className="text-white">{outputCount}</strong> selesai</span>
          </span>

          <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            isWorking
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
          }`}>
            {isWorking ? 'Active Working' : 'Idle Standby'}
          </span>
        </div>
      </div>
    </div>
  );
}
