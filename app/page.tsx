import Link from 'next/link';
import { getAllPosts } from '@/lib/blog-data';
import Footer from '@/components/Footer';

export default function Home() {
  const latestPosts = getAllPosts().slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Header / Navbar */}
      <header className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-black text-indigo-600">⚡ KompresKilat</span>
        </div>
        <nav className="space-x-6 text-sm font-medium">
          <Link href="/" className="text-indigo-600 font-bold hover:text-indigo-700">Beranda</Link>
          <Link href="/blog" className="text-slate-600 hover:text-indigo-600">Blog & Panduan</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold mb-4">
          All-in-One Digital Productivity Suite
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
          Kompres, Konversi &amp; Lacak File Jadi <span className="text-indigo-600">Lebih Cepat</span>
        </h1>
        <p className="text-base md:text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
          Platform online gratis untuk kompresi foto KTP, optimasi PDF, arsip ZIP, hingga pelacakan nomor resi paket ekspedisi se-Indonesia.
        </p>

        {/* Kotak Pilihan Tools Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left mb-16">
          <Link href="/tools/image" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
            <div className="text-3xl mb-3">🖼️</div>
            <h2 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 mb-1">Kompres &amp; Konversi Gambar</h2>
            <p className="text-xs text-slate-500">Kecilkan JPG, PNG, atau WebP untuk syarat pendaftaran CPNS &amp; lamaran kerja.</p>
          </Link>

          <Link href="/tools/pdf" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
            <div className="text-3xl mb-3">📄</div>
            <h2 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 mb-1">Kompres Dokumen PDF</h2>
            <p className="text-xs text-slate-500">Perkecil ukuran dokumen PDF tugas kantor atau kuliah dengan aman di browser.</p>
          </Link>

          <Link href="/tools/tracking" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
            <div className="text-3xl mb-3">📦</div>
            <h2 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 mb-1">Cek Resi &amp; Lacak Paket</h2>
            <p className="text-xs text-slate-500">Lacak otomatis status paket SPX, JNE, J&amp;T, SiCepat, Anteraja &amp; Pos Indonesia.</p>
          </Link>

          <Link href="/tools/pdf-to-word" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
            <div className="text-3xl mb-3">🔄</div>
            <h2 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 mb-1">PDF ke Word</h2>
            <p className="text-xs text-slate-500">Ubah dokumen PDF menjadi file Microsoft Word (.docx) siap edit.</p>
          </Link>

          <Link href="/tools/pdf-to-excel" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
            <div className="text-3xl mb-3">📊</div>
            <h2 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 mb-1">PDF ke Excel</h2>
            <p className="text-xs text-slate-500">Ekstrak tabel dan data laporan PDF ke lembar kerja Excel (.xlsx).</p>
          </Link>

          <Link href="/tools/zip" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition duration-200 group">
            <div className="text-3xl mb-3">🗜️</div>
            <h2 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 mb-1">Arsip ZIP Multi-File</h2>
            <p className="text-xs text-slate-500">Gabungkan banyak file sekaligus menjadi satu berkas arsip ZIP siap kirim.</p>
          </Link>
        </div>

        {/* Section Artikel Blog Terbaru */}
        <div className="text-left pt-6 border-t border-slate-200">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Artikel &amp; Edukasi</span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Panduan &amp; Tips Terpopuler</h2>
            </div>
            <Link href="/blog" className="text-xs font-bold text-indigo-600 hover:underline">
              Lihat Semua Artikel →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 mb-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
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

      {/* Footer Komprehensif dengan Link Legalitas */}
      <Footer />
    </main>
  );
}
