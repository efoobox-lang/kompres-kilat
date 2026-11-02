'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_TOOLS, ToolItem } from '@/lib/tools-data';
import { Search, X, Command, ArrowRight, Sparkles } from 'lucide-react';

interface SearchBarProps {
  className?: string;
  variant?: 'desktop' | 'mobile' | 'both';
  placeholder?: string;
  mobileTriggerLabel?: string;
}

export default function SearchBar({
  className = '',
  variant = 'both',
  placeholder = 'Cari alat atau fitur...',
  mobileTriggerLabel,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const desktopInputRef = useRef<HTMLInputElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  // Quick filter pills untuk pencarian instan satu-klik di HP/Desktop
  const QUICK_TAGS = ['PDF', 'Kompres Foto', 'Hapus BG', 'Kalkulator', 'Cek Resi', 'CV ATS', 'Scan'];

  // Filter tools secara real-time (Instant Filtering)
  const filteredTools = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Rekomendasi alat populer saat kolom pencarian masih kosong
      return ALL_TOOLS.slice(0, 8);
    }

    const terms = trimmed.split(/\s+/);
    return ALL_TOOLS.filter((tool) => {
      const searchableContent = [
        tool.title,
        tool.description,
        tool.category,
        ...tool.keywords,
      ]
        .join(' ')
        .toLowerCase();

      return terms.every((term) => searchableContent.includes(term));
    });
  }, [query]);

  // Navigasi ke halaman alat yang dipilih
  const handleSelect = useCallback(
    (tool: ToolItem) => {
      router.push(tool.href);
      setIsOpen(false);
      setIsMobileOpen(false);
      setQuery('');
      setSelectedIndex(0);
    },
    [router]
  );

  // Keyboard navigation & Shortcuts (Ctrl+K / Cmd+K / Escape / Arrow Keys / Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut Ctrl+K atau Cmd+K untuk memfokuskan pencarian
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setIsMobileOpen(true);
        } else {
          setIsOpen(true);
          desktopInputRef.current?.focus();
        }
        return;
      }

      // Tutup saat tombol ESC ditekan
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsMobileOpen(false);
        desktopInputRef.current?.blur();
        return;
      }

      // Keyboard arrow navigation saat dropdown terbuka
      if (isOpen || isMobileOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (filteredTools.length > 0 ? (prev + 1) % filteredTools.length : 0));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (filteredTools.length > 0 ? (prev - 1 + filteredTools.length) % filteredTools.length : 0));
        } else if (e.key === 'Enter') {
          if (filteredTools.length > 0 && filteredTools[selectedIndex]) {
            e.preventDefault();
            handleSelect(filteredTools[selectedIndex]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMobileOpen, filteredTools, selectedIndex, handleSelect]);

  // Click outside listener untuk menutup dropdown desktop secara aman (anti-memory leak)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll saat modal mobile terbuka agar layar belakang tidak bergeser
  useEffect(() => {
    if (isMobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => mobileInputRef.current?.focus(), 80);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileOpen]);

  // Reset selected index ketika kata kunci filter berubah
  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelectedIndex(0);
    setIsOpen(true);
  };

  const showDesktop = variant === 'desktop' || variant === 'both';
  const showMobile = variant === 'mobile' || variant === 'both';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* ============================================================ */}
      {/* 1. DESKTOP SEARCH BAR (Tampilan Elegan di Header Navigasi)     */}
      {/* ============================================================ */}
      {showDesktop && (
        <div className={`${variant === 'both' ? 'hidden md:flex' : 'flex'} items-center relative w-48 lg:w-64 xl:w-72`}>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Search className="w-4 h-4" />
            </div>

            <input
              ref={desktopInputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full pl-9 pr-14 py-1.5 text-xs sm:text-sm bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-slate-200/90 dark:border-slate-700/80 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-150 shadow-2xs"
            />

            {/* Tombol Clear atau Keyboard Shortcut Badge */}
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    desktopInputRef.current?.focus();
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition cursor-pointer"
                  title="Hapus kata kunci"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-white/80 dark:bg-slate-800/80 rounded border border-slate-200/90 dark:border-slate-700/60 select-none shadow-2xs">
                  <Command className="w-2.5 h-2.5" /> K
                </span>
              )}
            </div>
          </div>

          {/* Dropdown Hasil Pencarian Desktop Melayang */}
          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 lg:-left-6 lg:-right-6 mt-2 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 max-h-[440px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150"
            >
              {/* Header Info Dropdown */}
              <div className="px-3.5 py-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                <span>{query.trim() ? `Hasil Pencarian (${filteredTools.length})` : '✨ Rekomendasi Fitur Populer'}</span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">Navigasi ↑↓ &bull; Enter ↵</span>
              </div>

              {/* Daftar Hasil Filter */}
              {filteredTools.length > 0 ? (
                <div className="space-y-0.5 px-1.5">
                  {filteredTools.map((tool, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => handleSelect(tool)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full text-left p-2.5 rounded-xl transition flex items-center gap-3 cursor-pointer group ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-100'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="text-xl shrink-0 p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-2xs border border-slate-100 dark:border-slate-700/60">
                          {tool.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {tool.title}
                            </p>
                            {tool.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {tool.description}
                          </p>
                        </div>
                        <ArrowRight
                          className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                            isSelected
                              ? 'text-indigo-600 dark:text-indigo-400 translate-x-0.5'
                              : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* State Hasil Pencarian Kosong */
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tidak ditemukan alat untuk &quot;{query}&quot;
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Coba kata kunci lain seperti <span className="font-semibold text-indigo-600">PDF</span>,{' '}
                    <span className="font-semibold text-indigo-600">Diskon</span>, atau{' '}
                    <span className="font-semibold text-indigo-600">Kompres</span>.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. MOBILE SEARCH TRIGGER BUTTON (Ikon Kaca Pembesar Mobile)   */}
      {/* ============================================================ */}
      {showMobile && (
        <div className={`${variant === 'both' ? 'flex md:hidden' : 'flex'} items-center ${className}`}>
          {mobileTriggerLabel ? (
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 rounded-xl transition cursor-pointer border border-slate-200/80 dark:border-slate-700/60"
              aria-label={mobileTriggerLabel}
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-500" />
                <span>{mobileTriggerLabel}</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600">
                Cari
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
              aria-label="Buka pencarian alat"
              title="Cari alat atau fitur"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MOBILE FULL-SCREEN / RESPONSIVE SEARCH MODAL OVERLAY      */}
      {/* ============================================================ */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm flex flex-col animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] rounded-b-3xl overflow-hidden animate-in slide-in-from-top-4 duration-200">
            {/* Header Bilah Pencarian Mobile */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Ketik alat (misal: PDF, HEIC, Resi)..."
                  className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      mobileInputRef.current?.focus();
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Bersihkan pencarian"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Tombol Tutup / Batal */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileOpen(false);
                  setQuery('');
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition cursor-pointer shrink-0"
              >
                Tutup
              </button>
            </div>

            {/* Quick Filter Tags / Pills Cepat */}
            <div className="px-3.5 py-2.5 bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" /> Cepat:
              </span>
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    handleQueryChange(tag);
                    mobileInputRef.current?.focus();
                  }}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 transition cursor-pointer border ${
                    query.toLowerCase() === tag.toLowerCase()
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 active:bg-indigo-50 dark:active:bg-slate-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Daftar Hasil Scrollable (Touch-Friendly) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                {query.trim()
                  ? `Hasil Pencarian (${filteredTools.length} alat ditemukan)`
                  : '🔥 Alat & Fitur Populer'}
              </div>

              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => handleSelect(tool)}
                    className="w-full text-left p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 active:bg-indigo-50 dark:active:bg-indigo-950/50 flex items-center gap-3 transition cursor-pointer shadow-2xs"
                  >
                    <span className="text-2xl p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0">
                      {tool.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {tool.title}
                        </p>
                        {tool.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {tool.description}
                      </p>
                      <span className="inline-block text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1">
                        Kategori: {tool.category}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                ))
              ) : (
                <div className="py-12 text-center px-4">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Tidak ditemukan alat untuk &quot;{query}&quot;
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Periksa ejaan kata kunci atau gunakan tombol kategori cepat di atas.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Area backdrop bawah yang bisa disentuh/diklik untuk menutup modal */}
          <div
            className="flex-1"
            onClick={() => {
              setIsMobileOpen(false);
              setQuery('');
            }}
          />
        </div>
      )}
    </div>
  );
}
