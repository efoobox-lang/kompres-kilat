import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { BadgeCheck, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Kami (About Us) - KompresKilat',
  description: 'Mengenal KompresKilat: misi, teknologi pemrosesan file aman di browser, dan tim pengembang di baliknya.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
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

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">📬 Kontak &amp; Masukan</h2>
          <p>
            Kami selalu terbuka untuk saran fitur baru, kemitraan, atau laporan kendala. Kunjungi halaman <Link href="/contact" className="text-indigo-600 underline font-semibold">Kontak Kami</Link> untuk berbicara dengan tim pengembang.
          </p>
        </div>

        {/* Meet the Founder Section */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Meet the Founder</span>
          </div>

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
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Web Developer
            </p>
            <p className="max-w-md mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed mt-2.5">
              Pengembang di balik KompresKilat yang berkomitmen menghadirkan perkakas web gratis, cepat, dan aman berbasis pemrosesan lokal (client-side) untuk masyarakat Indonesia.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
