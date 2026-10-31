import Link from 'next/link';
import { getAllPosts } from '@/lib/blog-data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  const latestPosts = getAllPosts().slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Header / Navbar Responsif */}
      <Navbar />

      {/* Hero Section Responsif */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16 text-center">
        <span className="inline-block bg-indigo-100 text-indigo-700 text-[11px] sm:text-xs px-3 py-1 rounded-full font-semibold mb-3 sm:mb-4">
          All-in-One Digital Productivity Suite
        </span>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3 sm:mb-4 leading-tight">
          Kompres, Konversi &amp; Lacak File Jadi <span className="text-indigo-600">Lebih Cepat</span>
        </h1>
        <p className="text-xs sm:text-base md:text-lg text-slate-600 mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
          Platform online gratis untuk kompresi foto KTP, optimasi PDF, arsip ZIP, hingga pelacakan nomor resi paket ekspedisi se-Indonesia.
        </p>

        {/* Kotak Pilihan Tools Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-left mb-10 sm:mb-16">
          <Link href="/tools/image" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🖼️</div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">Kompres &amp; Konversi Gambar</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Kecilkan JPG, PNG, atau WebP untuk syarat pendaftaran CPNS &amp; lamaran kerja.</p>
          </Link>

          <Link href="/tools/remove-bg" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🎨</div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">Ganti Background Pas Foto</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Ubah warna latar ke Merah (Ganjil), Biru (Genap) CPNS, atau Transparan PNG.</p>
          </Link>

          <Link href="/tools/object-eraser" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🪄</div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">Hapus Objek di Foto</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Hilangkan orang lewat, tulisan, tanggal, atau watermark dengan kuas cerdas.</p>
          </Link>

          <Link href="/tools/pdf" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📄</div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">Kompres Dokumen PDF</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Perkecil ukuran dokumen PDF tugas kantor atau kuliah dengan aman di browser.</p>
          </Link>

          <Link href="/tools/tracking" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📦</div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">Cek Resi &amp; Lacak Paket</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Lacak otomatis status paket SPX, JNE, J&amp;T, SiCepat, Anteraja &amp; Pos Indonesia.</p>
          </Link>

          <Link href="/tools/pdf-to-word" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🔄</div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">PDF ke Word</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Ubah dokumen PDF menjadi file Microsoft Word (.docx) siap edit.</p>
          </Link>

          <Link href="/tools/pdf-to-excel" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📊</div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">PDF ke Excel</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Ekstrak tabel dan data laporan PDF ke lembar kerja Excel (.xlsx).</p>
          </Link>

          <Link href="/tools/zip" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🗜️</div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 mb-1">Arsip ZIP Multi-File</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Gabungkan banyak file sekaligus menjadi satu berkas arsip ZIP siap kirim.</p>
          </Link>
        </div>

        {/* Section Artikel Blog Terbaru */}
        <div className="text-left pt-6 border-t border-slate-200">
          <div className="flex justify-between items-end mb-5">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Artikel &amp; Edukasi</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">Panduan &amp; Tips Terpopuler</h2>
            </div>
            <Link href="/blog" className="text-xs font-bold text-indigo-600 hover:underline whitespace-nowrap ml-2">
              Lihat Semua →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {latestPosts.map((post) => (
              <Link 
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                      {post.category}
                    </span>
                    <span className="text-[11px] text-slate-400">{post.readTime}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 mb-1.5 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-indigo-600 font-semibold group-hover:underline flex items-center justify-between">
                  <span>Baca panduan</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Komprehensif */}
      <Footer />
    </main>
  );
}
