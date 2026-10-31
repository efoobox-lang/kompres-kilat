import Link from 'next/link';
import { getAllPosts } from '@/lib/blog-data';
import BlogListClient from './BlogListClient';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Blog & Panduan Kompres File & Cek Resi - KompresKilat',
  description: 'Kumpulan artikel dan panduan lengkap cara kompres foto KTP, dokumen PDF, ubah format file, hingga tips melacak resi pengiriman.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Header / Navbar */}
      <header className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-2xl font-black text-indigo-600">⚡ KompresKilat</Link>
        </div>
        <nav className="space-x-6 text-sm font-medium">
          <Link href="/" className="text-slate-600 hover:text-indigo-600">Beranda</Link>
          <Link href="/blog" className="text-indigo-600 font-bold">Blog & Panduan</Link>
        </nav>
      </header>

      {/* Konten Blog */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold mb-2">
            Pusat Pengetahuan & Solusi
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
            📚 Blog & Panduan File Digital
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Temukan panduan praktis, tips lolos validasi berkas instansi, hingga trik memantau paket kiriman belanja online.
          </p>
        </div>

        {/* Client Component untuk Search & Filter */}
        <BlogListClient initialPosts={posts} />
      </section>

      {/* Footer Komprehensif */}
      <Footer />
    </main>
  );
}
