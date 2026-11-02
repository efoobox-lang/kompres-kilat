'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

// ============================================================================
// HOOK: useAIProgress
// Mengatur animasi progres realistis (0% s/d 100%) dengan fase deskriptif
// ============================================================================

export interface ProgressPhase {
  progress: number;
  text: string;
  delayMs: number;
}

export function useAIProgress() {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [phase, setPhase] = useState<string>('');
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  const startProgress = useCallback(
    (customPhases?: ProgressPhase[]) => {
      clearAllTimers();
      setIsGenerating(true);
      setProgress(8);
      setPhase('Menyiapkan data & parameter...');

      const phases: ProgressPhase[] = customPhases || [
        { progress: 24, text: 'Menyiapkan data & parameter prompt...', delayMs: 400 },
        { progress: 52, text: 'Menghubungi AI Engine & menganalisis...', delayMs: 1400 },
        { progress: 76, text: 'Menyusun struktur & konten visual...', delayMs: 2800 },
        { progress: 91, text: 'Melakukan rendering & finishing...', delayMs: 4500 },
        { progress: 95, text: 'Hampir selesai, memvalidasi hasil...', delayMs: 6500 },
      ];

      phases.forEach((p) => {
        const t = setTimeout(() => {
          setProgress(p.progress);
          setPhase(p.text);
        }, p.delayMs);
        timersRef.current.push(t);
      });
    },
    [clearAllTimers]
  );

  const completeProgress = useCallback(
    (callback?: () => void) => {
      clearAllTimers();
      setProgress(100);
      setPhase('Hasil berhasil digenerate! Selesai 100%');

      const t = setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        setPhase('');
        if (callback) callback();
      }, 500);
      timersRef.current.push(t);
    },
    [clearAllTimers]
  );

  const resetProgress = useCallback(() => {
    clearAllTimers();
    setIsGenerating(false);
    setProgress(0);
    setPhase('');
  }, [clearAllTimers]);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  return {
    isGenerating,
    progress,
    phase,
    startProgress,
    completeProgress,
    resetProgress,
  };
}

// ============================================================================
// COMPONENT: AIProgressBar
// Tampilan Bar Progres Animasi Halus & Indikator Persentase (0% - 100%)
// ============================================================================

interface AIProgressBarProps {
  isGenerating: boolean;
  progress: number;
  phase?: string;
  title?: string;
  variant?: 'inline' | 'overlay';
  className?: string;
}

export default function AIProgressBar({
  isGenerating,
  progress,
  phase = 'Memproses AI...',
  title = 'AI Generator Sedang Bekerja',
  variant = 'inline',
  className = '',
}: AIProgressBarProps) {
  if (!isGenerating && progress === 0) return null;

  const isDone = progress >= 100;

  // VARIANT: OVERLAY (Modal Backdrop yang Mengunci Layar & Mencegah Double Submit)
  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
            {isDone ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-500 animate-in zoom-in-75 duration-200" />
            ) : (
              <Loader2 className="w-7 h-7 animate-spin text-indigo-600 dark:text-indigo-400" />
            )}
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[1.25rem]">
              {phase}
            </p>
          </div>

          {/* Progress Bar Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Progres Generasi</span>
              </span>
              <span className="font-mono text-sm">{progress}%</span>
            </div>

            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out shadow-xs"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            Mohon tunggu sejenak, tombol aksi dikunci untuk menjaga integritas data.
          </p>
        </div>
      </div>
    );
  }

  // VARIANT: INLINE (Kartu Progres Halus di Dalam Halaman / Form)
  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-md space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isDone ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            {isDone ? 'Generasi Selesai!' : phase}
          </span>
        </div>

        <span className="font-mono font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900">
          {progress}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
