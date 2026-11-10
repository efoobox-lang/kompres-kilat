import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { BadgeCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Kami (About Us) - KompresKilat',
  description: 'Mengenal KompresKilat: misi, teknologi pemrosesan file aman di browser, dan tim pengembang di baliknya.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-6 sm:space-y-8">
        <div className="bg-white p-6 sm:p-10 md:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm leading-relaxed text-slate-700">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] sm:text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Mengenal KompresKilat
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Tentang Kami (About Us)
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-800 font-medium">
            KompresKilat lahir dari kebutuhan sederhana masyarakat Indonesia: <b>kemudahan mengelola berkas digital dan memantau kiriman belanja online tanpa rasa khawatir akan privasi data pribadi</b>.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">🎯 Misi Kami</h2>
          <p>
            Setiap tahun, jutaan pelamar kerja, pendaftar seleksi CPNS/BUMN, dan mahasiswa sering kesulitan saat dokumen mereka ditolak portal pendaftaran karena ukuran berkas terlalu besar. Di sisi lain, masyarakat sering kali harus menginstal banyak aplikasi berbeda hanya untuk mengecek nomor resi belanja online dari berbagai ekspedisi.
          </p>
          <p>
            Misi kami adalah menyediakan <b>platform utilitas digital terpadu yang 100% gratis, super cepat, tanpa ribet instalasi aplikasi, dan menjamin privasi pengguna seutuhnya</b>.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">🔒 Komitmen Keamanan &amp; Privasi</h2>
          <p>
            Banyak situs kompresi konvensional mengharuskan Anda mengunggah dokumen sensitif (seperti foto KTP, ijazah, dan slip gaji) ke server asing mereka. 
          </p>
          <p>
            Di KompresKilat, kami menerapkan standar <b>Client-Side First</b>. Berkas Anda dikompresi langsung di dalam memori browser menggunakan teknologi modern HTML5 Canvas dan WebAssembly. Berkas Anda tidak pernah disimpan di server kami, sehingga keamanan identitas Anda terjamin 100%.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">⚙️ Fitur Utama Platform</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xl mb-1 block">🖼️</span>
              <h3 className="font-bold text-slate-800 text-xs">Kompresi Foto KTP &amp; Gambar</h3>
              <p className="text-[11px] text-slate-500 mt-1">Preset cepat ke bawah 200KB atau 500KB sesuai standar pendaftaran resmi.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xl mb-1 block">📄</span>
              <h3 className="font-bold text-slate-800 text-xs">Optimasi Berkas PDF</h3>
              <p className="text-[11px] text-slate-500 mt-1">Pengecilan ukuran dokumen skripsi dan laporan tanpa batasan kuota.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xl mb-1 block">📦</span>
              <h3 className="font-bold text-slate-800 text-xs">Multi-Ekspedisi Tracking</h3>
              <p className="text-[11px] text-slate-500 mt-1">Deteksi otomatis kurir Shopee Express, JNE, J&amp;T, SiCepat, dan ekspedisi lokal lainnya.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xl mb-1 block">📚</span>
              <h3 className="font-bold text-slate-800 text-xs">Pusat Edukasi &amp; Panduan</h3>
              <p className="text-[11px] text-slate-500 mt-1">Artikel tutorial mendalam seputar pengelolaan file dan solusi belanja online.</p>
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">🌐 Terhubung di Media Sosial</h2>
          <p>
            Ikuti akun resmi kami untuk mendapatkan tips produktivitas harian, inspirasi nota kasir UMKM, dan pembaruan fitur tools:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <a
              href="https://www.instagram.com/kompreskilat/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-amber-500/10 hover:from-pink-500/20 hover:to-amber-500/20 border border-pink-500/30 flex items-center justify-between group transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-600 flex items-center justify-center">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Instagram</span>
                  <span className="text-[11px] text-pink-600 font-medium">@kompreskilat</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-pink-600 group-hover:translate-x-0.5 transition-transform">
                Ikuti &rarr;
              </span>
            </a>

            <a
              href="https://www.facebook.com/1411463522052642"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 flex items-center justify-between group transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-600 flex items-center justify-center">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Facebook</span>
                  <span className="text-[11px] text-blue-600 font-medium">Kompres Kilat</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                Kunjungi &rarr;
              </span>
            </a>

            <a
              href="https://www.youtube.com/@kompreskilat"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 flex items-center justify-between group transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-600 flex items-center justify-center">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block text-xs">YouTube</span>
                  <span className="text-[11px] text-red-600 font-medium">@kompreskilat</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-red-600 group-hover:translate-x-0.5 transition-transform">
                Tonton &rarr;
              </span>
            </a>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">📬 Kontak &amp; Masukan</h2>
          <p>
            Kami selalu terbuka untuk saran fitur baru, kemitraan, atau laporan kendala. Kunjungi halaman <Link href="/contact" className="text-indigo-600 underline font-semibold">Kontak Kami</Link> untuk berbicara dengan tim pengembang.
          </p>
        </div>

        {/* Founder Profile Section */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="flex flex-col items-center justify-center">
            {/* Circular Frame for Founder's Photo */}
            <div className="relative group inline-block">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 ring-2 ring-slate-100">
                <Image
                  src="/images/founder.jpg"
                  alt="R. Ridhoulloh - Web Developer"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover filter grayscale hover:grayscale-0 group-hover:grayscale-0 transition-all duration-300 cursor-pointer"
                  priority
                />
              </div>

              {/* Small badge icon positioned at bottom right */}
              <div
                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                title="Verified Web Developer"
                aria-label="Verified Web Developer"
              >
                <BadgeCheck className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Text Details & Styling */}
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-4 tracking-tight">
              R. Ridhoulloh
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Web Developer
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
