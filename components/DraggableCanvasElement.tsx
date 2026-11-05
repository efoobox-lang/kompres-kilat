'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Move, ZoomIn, ZoomOut, RotateCw, Check, Trash2, Maximize2 } from 'lucide-react';

export interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height?: number;
  rotation?: number;
}

interface DraggableCanvasElementProps {
  id: string;
  title: string;
  position: ElementPosition;
  minWidth?: number;
  maxWidth?: number;
  aspectRatio?: number; // e.g. 1 for circle or square
  isSelected: boolean;
  isLocked?: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (id: string) => void;
  onChange: (newPos: ElementPosition) => void;
  onDelete?: () => void;
  onRotate?: (newRotation: number) => void;
  zIndex?: number;
  children: React.ReactNode;
}

export default function DraggableCanvasElement({
  id,
  title,
  position,
  minWidth = 40,
  maxWidth = 600,
  aspectRatio,
  isSelected,
  isLocked = false,
  containerRef,
  onSelect,
  onChange,
  onDelete,
  onRotate,
  zIndex = 20,
  children,
}: DraggableCanvasElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Drag & Resize tracking state via ref to prevent stale closures
  const dragInfoRef = useRef<{
    mode: 'move' | 'resize';
    handle?: string;
    startMouseX: number;
    startMouseY: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  // 1. Mulai Seret (Move / Drag) Elemen
  const handlePointerDownMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Abaikan jika target adalah tombol atau resize handle
    if ((e.target as HTMLElement).closest('[data-drag-ignore="true"]')) {
      return;
    }

    e.stopPropagation();
    onSelect(id);

    if (isLocked) return;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Fallback safe for browsers
    }

    dragInfoRef.current = {
      mode: 'move',
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: position.x,
      startY: position.y,
      startWidth: position.width,
      startHeight: position.height || position.width,
    };
    setIsDragging(true);
  };

  // 2. Mulai Ubah Ukuran (Resize Handles)
  const handlePointerDownResize = (e: React.PointerEvent<HTMLDivElement>, handle: string) => {
    e.stopPropagation();
    onSelect(id);

    if (isLocked) return;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Fallback safe
    }

    dragInfoRef.current = {
      mode: 'resize',
      handle,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: position.x,
      startY: position.y,
      startWidth: position.width,
      startHeight: position.height || position.width,
    };
    setIsResizing(true);
  };

  // 3. Pointer Move Global / Captured
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfoRef.current) return;
    const { mode, handle, startMouseX, startMouseY, startX, startY, startWidth, startHeight } = dragInfoRef.current;

    const container = containerRef.current;
    const containerW = container ? container.clientWidth : 794;
    const containerH = container ? container.clientHeight : 1123;

    const deltaX = e.clientX - startMouseX;
    const deltaY = e.clientY - startMouseY;

    if (mode === 'move') {
      const currentH = position.height || (aspectRatio ? position.width / aspectRatio : position.width);
      const nextX = Math.max(0, Math.min(containerW - position.width, startX + deltaX));
      const nextY = Math.max(0, Math.min(containerH - currentH, startY + deltaY));

      onChange({
        ...position,
        x: Math.round(nextX),
        y: Math.round(nextY),
      });
    } else if (mode === 'resize') {
      let nextW = startWidth;

      if (handle === 'se' || handle === 'e') {
        nextW = startWidth + deltaX;
      } else if (handle === 'sw' || handle === 'w') {
        nextW = startWidth - deltaX;
      } else if (handle === 'ne') {
        nextW = startWidth + deltaX;
      } else if (handle === 'nw') {
        nextW = startWidth - deltaX;
      }

      // Batasi ukuran minimum dan maksimum
      nextW = Math.max(minWidth, Math.min(maxWidth, Math.min(containerW - position.x, nextW)));

      let nextH: number | undefined;
      if (aspectRatio) {
        nextH = Math.round(nextW / aspectRatio);
      } else if (position.height) {
        const ratio = startWidth / (startHeight || 1);
        nextH = Math.round(nextW / ratio);
      }

      onChange({
        ...position,
        width: Math.round(nextW),
        height: nextH,
      });
    }
  }, [containerRef, position, aspectRatio, minWidth, maxWidth, onChange]);

  // 4. Pointer Up (Selesai Seret / Resize)
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfoRef.current) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Safe fallback
    }
    dragInfoRef.current = null;
    setIsDragging(false);
    setIsResizing(false);
  };

  // Keyboard Nudge (Panah atas, bawah, kiri, kanan untuk fine-tuning posisi saat terpilih)
  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Jangan intercept jika user sedang mengetik di input text
        const activeTag = (document.activeElement?.tagName || '').toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea') return;

        e.preventDefault();
        const step = e.shiftKey ? 10 : 2;
        let nx = position.x;
        let ny = position.y;

        if (e.key === 'ArrowLeft') nx -= step;
        if (e.key === 'ArrowRight') nx += step;
        if (e.key === 'ArrowUp') ny -= step;
        if (e.key === 'ArrowDown') ny += step;

        const container = containerRef.current;
        const containerW = container ? container.clientWidth : 794;
        const containerH = container ? container.clientHeight : 1123;
        const curH = position.height || position.width;

        nx = Math.max(0, Math.min(containerW - position.width, nx));
        ny = Math.max(0, Math.min(containerH - curH, ny));

        onChange({ ...position, x: Math.round(nx), y: Math.round(ny) });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, position, containerRef, onChange]);

  // Quick Scaling (+/- 10px)
  const handleQuickScale = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    const nextW = Math.max(minWidth, Math.min(maxWidth, position.width + delta));
    let nextH = position.height;
    if (aspectRatio) {
      nextH = Math.round(nextW / aspectRatio);
    }
    onChange({ ...position, width: nextW, height: nextH });
  };

  // Quick Rotation (+15 deg)
  const handleQuickRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentRot = position.rotation || 0;
    const nextRot = (currentRot + 15) % 360;
    if (onRotate) {
      onRotate(nextRot);
    } else {
      onChange({ ...position, rotation: nextRot });
    }
  };

  return (
    <div
      ref={elementRef}
      onPointerDown={handlePointerDownMove}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width}px`,
        height: position.height ? `${position.height}px` : 'auto',
        zIndex: isSelected ? zIndex + 20 : zIndex,
        touchAction: 'none',
      }}
      className={`group select-none transition-shadow ${
        isSelected
          ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white shadow-xl rounded-lg cursor-move'
          : 'hover:ring-1 hover:ring-indigo-300 hover:ring-offset-1 rounded-lg cursor-grab active:cursor-grabbing'
      } ${isDragging ? 'opacity-90 shadow-2xl cursor-grabbing' : ''} ${isResizing ? 'ring-2 ring-indigo-600' : ''}`}
    >
      {/* ---------------------------------------------------- */}
      {/* Mini Floating Action Toolbar (Hanya Tampil Saat Dipilih) */}
      {/* ---------------------------------------------------- */}
      {isSelected && (
        <div
          data-drag-ignore="true"
          data-html2canvas-ignore="true"
          className="absolute -top-11 left-0 flex items-center gap-1 bg-slate-900/95 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-xl backdrop-blur-xs z-50 whitespace-nowrap pointer-events-auto border border-slate-700 print:hidden animate-in fade-in zoom-in-95 duration-100"
        >
          <span className="flex items-center gap-1 text-indigo-300 font-bold pr-1 border-r border-slate-700">
            <Move className="w-3 h-3 text-indigo-400" />
            <span>{title}</span>
          </span>

          <span className="text-[10px] text-slate-400 px-1 font-mono">{position.width}px</span>

          {/* Tombol Perkecil (-) */}
          <button
            type="button"
            title="Kecilkan (-10px)"
            onClick={(e) => handleQuickScale(e, -10)}
            className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ZoomOut className="w-3 h-3" />
          </button>

          {/* Tombol Perbesar (+) */}
          <button
            type="button"
            title="Besarkan (+10px)"
            onClick={(e) => handleQuickScale(e, 10)}
            className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ZoomIn className="w-3 h-3" />
          </button>

          {/* Tombol Putar Rotasi (Jika Elemen Memiliki Rotasi) */}
          {(position.rotation !== undefined || onRotate) && (
            <button
              type="button"
              title={`Putar Rotasi (${position.rotation || 0}°)`}
              onClick={handleQuickRotate}
              className="p-1 hover:bg-slate-700 rounded text-amber-400 hover:text-amber-300 transition cursor-pointer flex items-center gap-0.5"
            >
              <RotateCw className="w-3 h-3" />
              <span className="text-[9px] font-mono">{position.rotation || 0}°</span>
            </button>
          )}

          {/* Tombol Hapus */}
          {onDelete && (
            <button
              type="button"
              title="Hapus Elemen"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 hover:bg-red-900/80 rounded text-red-400 hover:text-red-200 transition cursor-pointer ml-0.5"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}

          {/* Tombol Selesai Atur */}
          <button
            type="button"
            title="Selesai (Tutup Toolbar)"
            onClick={(e) => {
              e.stopPropagation();
              onSelect('');
            }}
            className="p-1 hover:bg-emerald-900/80 rounded text-emerald-400 hover:text-emerald-200 transition cursor-pointer ml-0.5 border-l border-slate-700 pl-1.5"
          >
            <Check className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Konten Asli Elemen (Logo, Tanda Tangan, atau Stempel) */}
      <div
        style={{
          transform: position.rotation ? `rotate(${position.rotation}deg)` : undefined,
          transformOrigin: 'center center',
        }}
        className="w-full h-full pointer-events-none"
      >
        {children}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 4 Corner Resize Handles (Hanya Tampil Saat Dipilih) */}
      {/* ---------------------------------------------------- */}
      {isSelected && !isLocked && (
        <>
          {/* Top-Left NW */}
          <div
            data-drag-ignore="true"
            data-html2canvas-ignore="true"
            onPointerDown={(e) => handlePointerDownResize(e, 'nw')}
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow-sm cursor-nwse-resize z-50 print:hidden"
          />

          {/* Top-Right NE */}
          <div
            data-drag-ignore="true"
            data-html2canvas-ignore="true"
            onPointerDown={(e) => handlePointerDownResize(e, 'ne')}
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow-sm cursor-nesw-resize z-50 print:hidden"
          />

          {/* Bottom-Left SW */}
          <div
            data-drag-ignore="true"
            data-html2canvas-ignore="true"
            onPointerDown={(e) => handlePointerDownResize(e, 'sw')}
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow-sm cursor-nesw-resize z-50 print:hidden"
          />

          {/* Bottom-Right SE (Primary Resize Handle dengan Indikator Sudut) */}
          <div
            data-drag-ignore="true"
            data-html2canvas-ignore="true"
            onPointerDown={(e) => handlePointerDownResize(e, 'se')}
            title="Tarik sudut ini untuk mengubah ukuran"
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-indigo-600 border-2 border-white rounded-full shadow-md cursor-nwse-resize z-50 flex items-center justify-center text-white print:hidden hover:scale-125 transition-transform"
          >
            <Maximize2 className="w-2.5 h-2.5 transform rotate-90" />
          </div>
        </>
      )}
    </div>
  );
}
