import Link from 'next/link';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Kami (About Us) - KompresKilat',
  description: 'Mengenal KompresKilat: misi, teknologi pemrosesan file aman di browser, dan tim pengembang di baliknya.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-2xl font-black text-indigo-600">⚡ KompresKilat</Link>
        </div>
        <nav className="space-x-6 text-sm font-medium">
          <Link href="/" className="text-slate-600 hover:text-indigo-600">Beranda</Link>
          <Link href="/blog" className="text-slate-600 hover:text-indigo-600">Blog & Panduan</Link>
        </nav>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-sm leading-relaxed text-slate-700">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Mengenal KompresKilat
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
              Tentang Kami (About Us)
            </h1>
          </div>

          <p className="text-base text-slate-800 font-medium">
            KompresKilat lahir dari kebutuhan sederhana masyarakat Indonesia: <b>kemudahan mengelola berkas digital dan memantau kiriman belanja online tanpa rasa khawatir akan privasi data pribadi</b>.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">🎯 Misi Kami</h2>
          <p>
            Setiap tahun, jutaan pelamar kerja, pendaftar seleksi CPNS/BUMN, dan mahasiswa sering kesulitan saat dokumen mereka ditolak portal pendaftaran karena ukuran berkas terlalu besar. Di sisi lain, masyarakat sering kali harus menginstal banyak aplikasi berbeda hanya untuk mengecek nomor resi belanja online dari berbagai ekspedisi.
          </p>
          <p>
            Misi kami adalah menyediakan <b>platform utilitas digital terpadu yang 100% gratis, super cepat, tanpa ribet instalasi aplikasi, dan menjamin privasi pengguna seutuhnya</b>.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">🔒 Komitmen Keamanan &amp; Privasi</h2>
          <p>
            Banyak situs kompresi konvensional mengharuskan Anda mengunggah dokumen sensitif (seperti foto KTP, ijazah, dan slip gaji) ke server asing mereka. 
          </p>
          <p>
            Di KompresKilat, kami menerapkan standar <b>Client-Side First</b>. Berkas Anda dikompresi langsung di dalam memori browser menggunakan teknologi modern HTML5 Canvas dan WebAssembly. Berkas Anda tidak pernah disimpan di server kami, sehingga keamanan identitas Anda terjamin 100%.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">⚙️ Fitur Utama Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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

          <h2 className="text-lg font-bold text-slate-900 pt-2">📬 Kontak &amp; Masukan</h2>
          <p>
            Kami selalu terbuka untuk saran fitur baru, kemitraan, atau laporan kendala. Kunjungi halaman <Link href="/contact" className="text-indigo-600 underline font-semibold">Kontak Kami</Link> untuk berbicara dengan tim pengembang.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

