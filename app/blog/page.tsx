import { getAllPosts } from '@/lib/blog-data';
import BlogListClient from './BlogListClient';
import BlogHeaderClient from './BlogHeaderClient';
import Navbar from '@/components/Navbar';
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
      <Navbar />

      {/* Konten Blog */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <BlogHeaderClient />

        {/* Client Component untuk Search & Filter */}
        <BlogListClient initialPosts={posts} />
      </section>

      {/* Footer Komprehensif */}
      <Footer />
    </main>
  );
}
