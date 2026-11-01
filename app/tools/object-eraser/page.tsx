'use client';

import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';

export default function ObjectEraserPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [brushSize, setBrushSize] = useState<number>(20);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasMask, setHasMask] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setHasMask(false);
        setStatusMessage('');

        const img = new Image();
        img.onload = () => {
          // Setup Canvas Gambar Utama
          const imgCanvas = imageCanvasRef.current;
          if (imgCanvas) {
            imgCanvas.width = img.width;
            imgCanvas.height = img.height;
            const ctx = imgCanvas.getContext('2d');
            if (ctx) ctx.drawImage(img, 0, 0);
          }

          // Setup Canvas Masking (Transparan di atasnya)
          const maskCanvas = maskCanvasRef.current;
          if (maskCanvas) {
            maskCanvas.width = img.width;
            maskCanvas.height = img.height;
            const mCtx = maskCanvas.getContext('2d');
            if (mCtx) mCtx.clearRect(0, 0, img.width, img.height);
          }
        };
        img.src = URL.createObjectURL(file);
      } else {
        alert('Harap pilih file gambar (JPG, PNG, atau WebP)!');
      }
    }
  };

  // Helper koordinat pointer pada canvas
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = maskCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;

    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'; // Merah transparan sebagai penanda mask

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    setHasMask(true);
  };

  const clearMask = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasMask(false);
      setStatusMessage('');
    }
  };

  // Algoritma Smart Inpainting (Penghapus Objek & Rekonstruksi Piksel)
  const handleEraseObject = () => {
    const imgCanvas = imageCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!imgCanvas || !maskCanvas || !hasMask) return;

    setIsLoading(true);
    setStatusMessage('Sedang menganalisis tekstur sekeliling dan menghapus objek terpilih...');

    setTimeout(() => {
      try {
        const width = imgCanvas.width;
        const height = imgCanvas.height;

        const imgCtx = imgCanvas.getContext('2d')!;
        const maskCtx = maskCanvas.getContext('2d')!;

        const imgData = imgCtx.getImageData(0, 0, width, height);
        const maskData = maskCtx.getImageData(0, 0, width, height);

        const pixels = imgData.data;
        const mask = maskData.data;

        // Temukan batas kotak area yang ditandai merah (Bounding Box)
        let minX = width, maxX = 0, minY = height, maxY = 0;
        let maskedCount = 0;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            // Jika channel Alpha mask > 0, berarti piksel ini ditandai untuk dihapus
            if (mask[idx + 3] > 20) {
              maskedCount++;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (maskedCount === 0) {
          setIsLoading(false);
          return;
        }

        // Ekspansi area bounding box sedikit untuk sampling tekstur luar
        const pad = Math.max(10, Math.floor(brushSize / 2));
        const startX = Math.max(0, minX - pad);
        const endX = Math.min(width - 1, maxX + pad);
        const startY = Math.max(0, minY - pad);
        const endY = Math.min(height - 1, maxY + pad);

        // Algoritma Difusi Interpolasi Bilateral (Membaurkan batas luar ke dalam objek)
        // Lakukan multi-pass blending agar area tertutup rata dan halus
        const passes = 3;
        for (let pass = 0; pass < passes; pass++) {
          for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
              const idx = (y * width + x) * 4;

              if (mask[idx + 3] > 20) {
                // Sampel piksel tetangga yang TIDAK terkena mask
                let totalR = 0, totalG = 0, totalB = 0, count = 0;

                // Cari tetangga dalam radius brush
                const radius = Math.ceil(brushSize * 0.8);
                const step = 2;

                for (let dy = -radius; dy <= radius; dy += step) {
                  const ny = y + dy;
                  if (ny < 0 || ny >= height) continue;

                  for (let dx = -radius; dx <= radius; dx += step) {
                    const nx = x + dx;
                    if (nx < 0 || nx >= width) continue;

                    const nIdx = (ny * width + nx) * 4;
                    // Hanya ambil tetangga yang TIDAK berada dalam mask
                    if (mask[nIdx + 3] <= 20) {
                      const dist = Math.sqrt(dx * dx + dy * dy);
                      const weight = 1 / (dist + 0.1);

                      totalR += pixels[nIdx] * weight;
                      totalG += pixels[nIdx + 1] * weight;
                      totalB += pixels[nIdx + 2] * weight;
                      count += weight;
                    }
                  }
                }

                if (count > 0) {
                  pixels[idx] = Math.round(totalR / count);
                  pixels[idx + 1] = Math.round(totalG / count);
                  pixels[idx + 2] = Math.round(totalB / count);
                }
              }
            }
          }
        }

        // Terapkan hasil kembali ke Canvas Gambar
        imgCtx.putImageData(imgData, 0, 0);

        // Bersihkan mask merah
        maskCtx.clearRect(0, 0, width, height);
        setHasMask(false);
        setStatusMessage('✨ Berhasil! Objek telah dihapus dan tekstur foto diselaraskan secara halus.');
      } catch (err: any) {
        console.error(err);
        setStatusMessage('Gagal menghapus objek. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    }, 150);
  };

  const handleDownloadClean = () => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'foto-bersih-tanpa-objek.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Hapus Objek & Watermark Foto Online',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    featureList: 'Hapus objek yang tidak diinginkan, teks, stempel tanggal, dan watermark di foto gratis',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={jsonLd} />
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-[11px] sm:text-xs px-3 py-1 rounded-full font-semibold mb-2">
            🪄 Magic Eraser &amp; Inpainting
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            Hapus Objek &amp; Watermark di Foto
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Hapus orang yang lewat, teks, cap tanggal, noda, atau watermark di foto Anda. Cukup warnai objek yang ingin dihapus dengan kuas.
          </p>
        </div>

        {/* Kotak Upload Foto */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Pilih Foto yang Ingin Dibersihkan:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400 mt-2">
            Semua proses penghapusan objek dijalankan secara privat di browser komputer atau HP Anda.
          </p>
        </div>

        {selectedFile && (
          <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-6">
            {/* Toolbar Kuas / Eraser */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">🖌️ Ukuran Kuas:</span>
                <input
                  type="range"
                  min="6"
                  max="60"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full sm:w-40 accent-indigo-600 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-indigo-600 w-8">{brushSize}px</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={clearMask}
                  disabled={!hasMask || isLoading}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer disabled:opacity-50"
                >
                  ↩️ Hapus Coretan
                </button>
              </div>
            </div>

            <p className="text-[11px] text-indigo-700 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 text-center">
              💡 <b>Petunjuk:</b> Usapkan jari atau mouse Anda di atas objek / teks yang ingin dihilangkan (akan muncul warna merah transparan), lalu klik tombol <b>Hapus Objek Sekarang</b> di bawah.
            </p>

            {/* Kanvas Interaktif untuk Coret Objek */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 flex items-center justify-center p-2 min-h-[300px]">
              <div className="relative max-w-full">
                {/* Canvas Gambar Bawah */}
                <canvas 
                  ref={imageCanvasRef} 
                  className="max-h-[500px] max-w-full block rounded-lg shadow-sm"
                />
                {/* Canvas Masking Atas (Tempat Coret Kuas) */}
                <canvas
                  ref={maskCanvasRef}
                  onMouseDown={startDrawing}
                  onMouseUp={stopDrawing}
                  onMouseMove={draw}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchEnd={stopDrawing}
                  onTouchMove={draw}
                  className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                />
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="space-y-3">
              <button
                onClick={handleEraseObject}
                disabled={!hasMask || isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-md disabled:bg-slate-300 cursor-pointer flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Sedang Menghapus Objek &amp; Merapikan Tekstur...</span>
                  </>
                ) : (
                  <span>Hapus Objek Sekarang 🪄</span>
                )}
              </button>

              <button
                onClick={handleDownloadClean}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-xl transition duration-200 shadow-sm flex justify-center items-center gap-2 cursor-pointer"
              >
                <span>📥 Download Foto yang Sudah Bersih</span>
              </button>
            </div>

            {statusMessage && (
              <p className="text-center text-xs font-medium text-slate-700">{statusMessage}</p>
            )}
          </div>
        )}

        {/* Slot Iklan */}
        <AdBanner zone="in-tool" label="Iklan Sponsor" />
      </section>

      <Footer />
    </main>
  );
}

