'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolEditorialSection from '@/components/ToolEditorialSection';
import JsonLd from '@/components/JsonLd';
import { PDFDocument, PageSizes } from 'pdf-lib';
import JSZip from 'jszip';
import { validateUploadedFile, downloadBlobSafely, loadImageSafely } from '@/lib/file-security';
import {
  FileImage,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  RotateCw,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Sliders,
  Plus,
  FileArchive
} from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
}

type PageOrientation = 'auto' | 'portrait' | 'landscape';
type PageSizeOption = 'a4' | 'letter' | 'fit';
type MarginOption = 'none' | 'small' | 'big';

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [orientation, setOrientation] = useState<PageOrientation>('auto');
  const [pageSize, setPageSize] = useState<PageSizeOption>('a4');
  const [margin, setMargin] = useState<MarginOption>('small');
  const [outputFileName, setOutputFileName] = useState<string>('KompresKilat_Gambar_Ke_PDF.pdf');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const cleanPreviews = useCallback(() => {
    images.forEach((img) => {
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
    });
  }, [images]);

  useEffect(() => {
    return () => {
      cleanPreviews();
    };
  }, [cleanPreviews]);

  const handleAddFiles = async (fileList: FileList | File[]) => {
    setErrorMessage('');
    setSuccessMessage('');
    const newItems: ImageItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validation = await validateUploadedFile(file, {
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSizeBytes: 50 * 1024 * 1024,
        checkMagicBytes: true,
      });

      if (!validation.valid) {
        setErrorMessage(validation.error || `File ${file.name} tidak valid.`);
        continue;
      }

      try {
        const { img, revoke } = await loadImageSafely(file);
        const previewUrl = URL.createObjectURL(file);
        newItems.push({
          id: `img-${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          previewUrl,
          width: img.naturalWidth || 800,
          height: img.naturalHeight || 600,
          rotation: 0,
        });
        revoke();
      } catch (err) {
        console.warn('Gagal memuat gambar:', err);
      }
    }

    if (newItems.length > 0) {
      setImages((prev) => [...prev, ...newItems]);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...images];
    const [removed] = updated.splice(index, 1);
    if (removed && removed.previewUrl) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    setImages(updated);
  };

  const rotateImage = (index: number) => {
    const updated = [...images];
    updated[index].rotation = (updated[index].rotation + 90) % 360;
    setImages(updated);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length || fromIndex === toIndex) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setImages(updated);
  };

  // Helper convert image (handling rotation & webp to standard PNG/JPEG buffer)
  const processImageToBytes = async (item: ImageItem): Promise<{ bytes: Uint8Array; format: 'jpg' | 'png' }> => {
    // If no rotation and already JPG or PNG, return raw bytes
    const isJpeg = item.file.type === 'image/jpeg' || item.name.toLowerCase().endsWith('.jpg') || item.name.toLowerCase().endsWith('.jpeg');
    const isPng = item.file.type === 'image/png' || item.name.toLowerCase().endsWith('.png');

    if (item.rotation === 0 && (isJpeg || isPng)) {
      const buf = await item.file.arrayBuffer();
      return { bytes: new Uint8Array(buf), format: isJpeg ? 'jpg' : 'png' };
    }

    // Otherwise render to offscreen canvas with rotation
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(item.file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        const isSideways = item.rotation === 90 || item.rotation === 270;
        canvas.width = isSideways ? img.naturalHeight : img.naturalWidth;
        canvas.height = isSideways ? img.naturalWidth : img.naturalHeight;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((item.rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();

        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob failed'));
              return;
            }
            const buf = await blob.arrayBuffer();
            resolve({ bytes: new Uint8Array(buf), format: 'jpg' });
          },
          'image/jpeg',
          0.92
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Gagal me-render gambar ke kanvas'));
      };

      img.src = objectUrl;
    });
  };

  // Generate & Download PDF
  const handleConvertToPdf = async (asZip = false) => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');
    setProcessingProgress({ current: 0, total: images.length });

    try {
      const marginPoints = margin === 'none' ? 0 : margin === 'small' ? 20 : 40;

      if (!asZip) {
        // Gabungkan semua gambar menjadi 1 dokumen PDF multi-halaman
        const pdfDoc = await PDFDocument.create();

        for (let i = 0; i < images.length; i++) {
          setProcessingProgress({ current: i + 1, total: images.length });
          const item = images[i];
          const { bytes, format } = await processImageToBytes(item);

          const embeddedImage = format === 'jpg' ? await pdfDoc.embedJpg(bytes) : await pdfDoc.embedPng(bytes);
          const imgWidth = embeddedImage.width;
          const imgHeight = embeddedImage.height;

          // Determine page dimensions
          let pageWidth = PageSizes.A4[0];
          let pageHeight = PageSizes.A4[1];

          if (pageSize === 'letter') {
            pageWidth = PageSizes.Letter[0];
            pageHeight = PageSizes.Letter[1];
          } else if (pageSize === 'fit') {
            pageWidth = imgWidth + marginPoints * 2;
            pageHeight = imgHeight + marginPoints * 2;
          }

          // Handle orientation
          if (pageSize !== 'fit') {
            const isImageLandscape = imgWidth > imgHeight;
            let finalLandscape = false;
            if (orientation === 'landscape') finalLandscape = true;
            else if (orientation === 'portrait') finalLandscape = false;
            else finalLandscape = isImageLandscape;

            if (finalLandscape && pageWidth < pageHeight) {
              const temp = pageWidth;
              pageWidth = pageHeight;
              pageHeight = temp;
            } else if (!finalLandscape && pageWidth > pageHeight) {
              const temp = pageWidth;
              pageWidth = pageHeight;
              pageHeight = temp;
            }
          }

          const page = pdfDoc.addPage([pageWidth, pageHeight]);

          // Calculate scaled dimensions to fit within margin
          const availWidth = pageWidth - marginPoints * 2;
          const availHeight = pageHeight - marginPoints * 2;
          const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight, 1);

          const drawWidth = imgWidth * scale;
          const drawHeight = imgHeight * scale;
          const drawX = (pageWidth - drawWidth) / 2;
          const drawY = (pageHeight - drawHeight) / 2;

          page.drawImage(embeddedImage, {
            x: drawX,
            y: drawY,
            width: drawWidth,
            height: drawHeight,
          });
        }

        const outBytes = await pdfDoc.save();
        const blob = new Blob([outBytes as unknown as BlobPart], { type: 'application/pdf' });
        downloadBlobSafely(blob, outputFileName || 'KompresKilat_Gambar.pdf');
        setSuccessMessage(`Berhasil mengonversi ${images.length} gambar ke dalam 1 berkas PDF.`);
      } else {
        // Unduh terpisah setiap gambar menjadi file PDF dalam arsip ZIP
        const zip = new JSZip();

        for (let i = 0; i < images.length; i++) {
          setProcessingProgress({ current: i + 1, total: images.length });
          const item = images[i];
          const singleDoc = await PDFDocument.create();
          const { bytes, format } = await processImageToBytes(item);

          const embedded = format === 'jpg' ? await singleDoc.embedJpg(bytes) : await singleDoc.embedPng(bytes);
          const page = singleDoc.addPage([embedded.width, embedded.height]);
          page.drawImage(embedded, {
            x: 0,
            y: 0,
            width: embedded.width,
            height: embedded.height,
          });

          const singleBytes = await singleDoc.save();
          const cleanName = item.name.replace(/\.[^/.]+$/, '');
          zip.file(`${cleanName}.pdf`, singleBytes);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlobSafely(zipBlob, 'KompresKilat_Gambar_PDF_Terpisah.zip');
        setSuccessMessage(`Berhasil mengekspor ${images.length} PDF ke arsip ZIP.`);
      }
    } catch (err) {
      console.error('Error converting images to PDF:', err);
      setErrorMessage('Terjadi kesalahan saat mengonversi gambar ke dokumen PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Konversi Gambar JPG/PNG ke PDF - KompresKilat',
    url: 'https://kompreskilat.site/tools/image-to-pdf',
    description: 'Ubah banyak foto JPG, PNG, dan WebP jadi dokumen PDF rapi ukuran A4/Letter langsung di peramban secara gratis, aman, dan tanpa watermark.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <JsonLd data={schema} />
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs px-3 py-1 rounded-full font-bold mb-3">
            <FileImage className="w-3.5 h-3.5" />
            <span>Konversi Gambar ke PDF 100% Client-Side</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
            Konversi JPG & PNG ke PDF Online
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Satukan banyak foto, pindaian kuitansi, atau dokumen identitas menjadi satu berkas PDF rapi siap cetak dan kirim.
          </p>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 mb-8 transition-colors">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingFile(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleAddFiles(e.dataTransfer.files);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDraggingFile
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[0.99]'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-indigo-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleAddFiles(e.target.files);
                }
              }}
            />

            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
              Pilih atau Tarik Berkas Gambar ke Sini
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
              Mendukung JPG, PNG, dan WebP. Anda dapat memilih beberapa gambar sekaligus untuk digabung.
            </p>

            <div className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all">
              <Plus className="w-4 h-4" />
              Pilih Gambar dari Perangkat
            </div>
          </div>

          {/* Privacy Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Gambar tidak diunggah ke internet
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Kualitas Asli 100% Terjaga
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Tanpa Tanda Air (No Watermark)
            </span>
          </div>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-emerald-700 dark:text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        {/* Image Grid & Options */}
        {images.length > 0 && (
          <div className="space-y-6 mb-8">
            {/* Settings Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    Pengaturan Dokumen PDF ({images.length} Gambar)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    cleanPreviews();
                    setImages([]);
                  }}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Ukuran Kertas */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Ukuran Kertas:
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as PageSizeOption)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="a4">A4 (Standar Indonesia)</option>
                    <option value="letter">US Letter (Surat Internasional)</option>
                    <option value="fit">Pas dengan Ukuran Gambar</option>
                  </select>
                </div>

                {/* 2. Orientasi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Orientasi Halaman:
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as PageOrientation)}
                    disabled={pageSize === 'fit'}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40"
                  >
                    <option value="auto">Otomatis (Ikuti Rasio Gambar)</option>
                    <option value="portrait">Tegak (Portrait)</option>
                    <option value="landscape">Mendatar (Landscape)</option>
                  </select>
                </div>

                {/* 3. Margin */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tepi Kertas (Margin):
                  </label>
                  <select
                    value={margin}
                    onChange={(e) => setMargin(e.target.value as MarginOption)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="none">Tanpa Margin (Gambar Penuh)</option>
                    <option value="small">Margin Sedang (Rapi)</option>
                    <option value="big">Margin Lebar (Formal)</option>
                  </select>
                </div>
              </div>

              {/* Custom Filename */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:w-36 flex-shrink-0">
                  Nama File PDF:
                </label>
                <input
                  type="text"
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  className="w-full sm:flex-1 text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedItemIndex(index);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedItemIndex !== null && draggedItemIndex !== index) {
                      moveImage(draggedItemIndex, index);
                    }
                    setDraggedItemIndex(null);
                  }}
                  className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:border-indigo-400 transition-all"
                >
                  {/* Top Bar */}
                  <div className="p-1.5 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px]">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded"
                      title="Hapus Gambar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="p-2 aspect-square flex items-center justify-center bg-slate-100 dark:bg-slate-950 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      style={{
                        transform: `rotate(${item.rotation}deg)`,
                        transition: 'transform 0.2s ease',
                      }}
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  </div>

                  {/* Caption & Controls */}
                  <div className="p-2 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="truncate max-w-[80px] text-slate-500 dark:text-slate-400" title={item.name}>
                      {formatFileSize(item.size)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => rotateImage(index)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        title="Putar 90 Derajat"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveImage(index, index - 1)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-20 text-slate-600 dark:text-slate-400"
                        title="Geser ke Atas"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={() => moveImage(index, index + 1)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-20 text-slate-600 dark:text-slate-400"
                        title="Geser ke Bawah"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {isProcessing
                  ? `Mengonversi gambar ${processingProgress.current} dari ${processingProgress.total}...`
                  : `Siap menyatukan ${images.length} gambar ke dalam format PDF.`}
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleConvertToPdf(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-xs sm:text-sm font-bold transition-all disabled:opacity-50"
                >
                  <FileArchive className="w-4 h-4" />
                  Unduh Terpisah (ZIP)
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleConvertToPdf(false)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Gabungkan & Unduh 1 PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Informative Article Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 mb-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                Cara Mudah Menyatukan Foto & Bukti Gambar Menjadi PDF
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Langkah cepat membuat berkas pendaftaran kerja, laporan keuangan, dan lampiran tugas kuliah.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-indigo-600" />
                1. Gabung Banyak Foto Sekaligus
              </h3>
              <p className="text-xs leading-relaxed">
                Pilih puluhan foto atau tangkapan layar (screenshot) sekaligus. Urutkan posisi gambar hanya dengan menggesernya secara visual agar alur dokumen runtut.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                2. Pilihan Format Kertas Fleksibel
              </h3>
              <p className="text-xs leading-relaxed">
                Sesuaikan ukuran lembar dengan standar dokumen Indonesia (A4), internasional (Letter), atau pilih &quot;Pas dengan Ukuran Gambar&quot; agar tidak ada bidang kosong tersisa.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                3. Kompresi Cerdas & Privasi
              </h3>
              <p className="text-xs leading-relaxed">
                Pemrosesan sepenuhnya berjalan di perangkat Anda, menjaga foto sensitif seperti KTP, ijazah, atau mutasi rekening bank tidak pernah bocor ke peladen online luar.
              </p>
            </div>
          </div>
        </div>

        {/* Editorial Section: Panduan, FAQ, AdSense Safe Zone & Hub-Spoke Links */}
        <div className="mt-8">
          <ToolEditorialSection toolId="image-to-pdf" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
