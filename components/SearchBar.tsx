'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_TOOLS, ToolItem } from '@/lib/tools-data';
import { Search, X, Command, ArrowRight, Sparkles } from 'lucide-react';

interface SearchBarProps {
  className?: string;
  variant?: 'desktop-button' | 'mobile-icon' | 'full-input' | 'both';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  // Quick filter pills untuk pencarian instan satu-klik
  const QUICK_TAGS = ['PDF', 'Kompres Foto', 'Hapus BG', 'Kalkulator', 'Cek Resi', 'CV ATS', 'Scan'];

  // Filter tools secara real-time
  const filteredTools = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
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

  // Navigasi ke alat yang dipilih
  const handleSelect = useCallback(
    (tool: ToolItem) => {
      router.push(tool.href);
      setIsModalOpen(false);
      setQuery('');
      setSelectedIndex(0);
    },
    [router]
  );

  // Shortcut Keyboard (Ctrl+K / Cmd+K / Escape / Arrow navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut Ctrl+K atau Cmd+K untuk membuka modal
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsModalOpen(true);
        return;
      }

      // Tombol ESC untuk menutup
      if (e.key === 'Escape' && isModalOpen) {
        e.preventDefault();
        setIsModalOpen(false);
        return;
      }

      // Navigasi panah di dalam modal
      if (isModalOpen) {
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
  }, [isModalOpen, filteredTools, selectedIndex, handleSelect]);

  // Lock body scroll saat modal pencarian terbuka
  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen]);

  // Reset selected index ketika kata kunci filter berubah
  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelectedIndex(0);
  };

  const showDesktop = variant === 'desktop-button' || variant === 'both';
  const showMobile = variant === 'mobile-icon' || variant === 'both';
  const showFullInput = variant === 'full-input';

  return (
    <>
      {/* ============================================================ */}
      {/* 1. DESKTOP COMPACT TRIGGER BUTTON (Hemat Ruang Horizontal)   */}
      {/* ============================================================ */}
      {showDesktop && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`hidden md:flex items-center justify-between gap-3 px-3.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/70 rounded-xl transition-all duration-150 shadow-2xs group cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${className}`}
          title="Cari alat atau fitur (Ctrl + K)"
          aria-label="Cari alat atau fitur"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            <span className="font-normal">{placeholder || 'Cari alat atau fitur...'}</span>
          </div>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-850 rounded-md border border-slate-200 dark:border-slate-700/80 shadow-2xs select-none">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>
      )}

      {/* ============================================================ */}
      {/* 2. MOBILE TRIGGER BUTTON (Ikon Kaca Pembesar atau Baris Penuh) */}
      {/* ============================================================ */}
      {showMobile && (
        <div className={`${variant === 'both' ? 'flex md:hidden' : 'flex'} items-center ${className}`}>
          {mobileTriggerLabel ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 rounded-xl transition cursor-pointer border border-slate-200/80 dark:border-slate-700/60 shadow-2xs"
              aria-label={mobileTriggerLabel}
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-500" />
                <span>{mobileTriggerLabel}</span>
              </span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600 font-sans">
                ⌘K
              </kbd>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              aria-label="Buka pencarian alat"
              title="Cari alat (Ctrl + K)"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 2b. FULL INPUT TRIGGER (Untuk di dalam drawer/sidebar)        */}
      {/* ============================================================ */}
      {showFullInput && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 rounded-xl transition cursor-pointer border border-slate-200/80 dark:border-slate-700/60 shadow-2xs ${className}`}
          aria-label={mobileTriggerLabel || 'Cari alat...'}
        >
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-500" />
            <span>{mobileTriggerLabel || 'Cari 30+ alat & fitur...'}</span>
          </span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600 font-sans">
            ⌘K
          </kbd>
        </button>
      )}

      {/* ============================================================ */}
      {/* 3. UNIFIED COMMAND PALETTE / SEARCH MODAL DIALOG             */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 px-3 sm:px-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          {/* Backdrop click to close */}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={modalContentRef}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
          >
            {/* Modal Input Bar */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Search className="w-5 h-5" />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Cari alat atau fitur..."
                className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition cursor-pointer"
                  title="Hapus teks"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition cursor-pointer shrink-0"
              >
                ESC
              </button>
            </div>

            {/* Quick Filter Tags / Pills */}
            <div className="px-3.5 sm:px-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" /> Cepat:
              </span>
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    handleQueryChange(tag);
                    inputRef.current?.focus();
                  }}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 transition cursor-pointer border ${
                    query.toLowerCase() === tag.toLowerCase()
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-750'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Scrollable Results List */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
              <div className="px-2.5 py-1 flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                <span>
                  {query.trim()
                    ? `Hasil Pencarian (${filteredTools.length} alat)`
                    : '🔥 Alat & Fitur Paling Sering Digunakan'}
                </span>
                <span className="hidden sm:inline text-[10px]">Navigasi ↑↓ &bull; Buka ↵</span>
              </div>

              {filteredTools.length > 0 ? (
                filteredTools.map((tool, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => handleSelect(tool)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left p-3 rounded-2xl transition flex items-center gap-3 cursor-pointer group ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-950 dark:text-indigo-100'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span className="text-2xl p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-2xs shrink-0">
                        {tool.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {tool.title}
                          </p>
                          {tool.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {tool.description}
                        </p>
                        <span className="inline-block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {tool.category}
                        </span>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected
                            ? 'text-indigo-600 dark:text-indigo-400 translate-x-1'
                            : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </button>
                  );
                })
              ) : (
                <div className="py-12 text-center px-4">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Tidak ditemukan alat untuk &quot;{query}&quot;
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Periksa ejaan kata kunci atau coba kata umum seperti &quot;PDF&quot;, &quot;Foto&quot;, atau &quot;Kalkulator&quot;.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Tip */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                100% Client-Side Privacy: Bebas Upload ke Server
              </span>
              <span>Tekan Esc untuk tutup</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
