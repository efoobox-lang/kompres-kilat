import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/blog-data';
import type { Metadata } from 'next';
import AdBanner from '@/components/AdBanner';
import JsonLd from '@/components/JsonLd';
import Footer from '@/components/Footer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Artikel Tidak Ditemukan - KompresKilat',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kompres-kilat.vercel.app';

  return {
    title: `${post.title} - KompresKilat`,
    description: post.excerpt,
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `${siteUrl}/blog/${post.slug}`,
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kompres-kilat.vercel.app';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'KompresKilat',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.ico`,
      },
    },
    datePublished: post.date,
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };

  const paragraphs = post.content.trim().split('\n\n');
  const midPoint = Math.floor(paragraphs.length / 2);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={articleSchema} />

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

      {/* Konten Artikel */}
      <article className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link href="/blog" className="text-xs font-semibold text-indigo-600 hover:underline mb-4 inline-flex items-center gap-1">
            <span>←</span> Kembali ke Semua Artikel
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span className="bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded">
              {post.category}
            </span>
            <span>•</span>
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime} baca</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 italic border-l-2 border-indigo-400 pl-3">
            Oleh {post.author} • KompresKilat Edukasi Digital
          </p>
        </div>

        {/* Isi Artikel */}
        <div className="bg-white p-6 md:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-sm text-slate-700 leading-relaxed">
          {paragraphs.map((p, idx) => {
            const trimmed = p.trim();
            const isMidArticle = idx === midPoint;

            return (
              <div key={idx}>
                {trimmed.startsWith('### ') && (
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 pt-4 pb-1 border-b border-slate-100">
                    {trimmed.replace('### ', '')}
                  </h3>
                )}
                {trimmed.startsWith('#### ') && (
                  <h4 className="text-base font-bold text-slate-800 pt-3">
                    {trimmed.replace('#### ', '')}
                  </h4>
                )}
                {trimmed.startsWith('---') && <hr className="my-4 border-slate-200" />}
                {(trimmed.startsWith('- ') || trimmed.startsWith('1. ')) && (
                  <ul className="space-y-1.5 pl-5 list-disc marker:text-indigo-500">
                    {trimmed.split('\n').map((line, lIdx) => (
                      <li key={lIdx} className="text-xs md:text-sm text-slate-700">
                        {line.replace(/^[-*]\s+|\d+\.\s+/, '')}
                      </li>
                    ))}
                  </ul>
                )}
                {!trimmed.startsWith('### ') &&
                  !trimmed.startsWith('#### ') &&
                  !trimmed.startsWith('---') &&
                  !trimmed.startsWith('- ') &&
                  !trimmed.startsWith('1. ') && (
                    <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                      {trimmed}
                    </p>
                  )}

                {/* Slot Iklan In-Article (Mid-Content) untuk CTR Maksimal */}
                {isMidArticle && (
                  <AdBanner zone="mid-article" label="Iklan Sponsor di Artikel" />
                )}
              </div>
            );
          })}

          {/* Kotak Call to Action (CTA) Terintegrasi ke Tool Terkait */}
          {post.relatedTool && (
            <div className="mt-10 p-6 md:p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 text-center shadow-sm">
              <span className="text-3xl mb-2 block">{post.relatedTool.icon}</span>
              <h3 className="font-extrabold text-lg text-indigo-950 mb-2">
                {post.relatedTool.title}
              </h3>
              <p className="text-xs text-indigo-800 max-w-md mx-auto mb-5 leading-relaxed">
                {post.relatedTool.description}
              </p>
              <Link
                href={post.relatedTool.url}
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-bold py-3 px-6 rounded-xl shadow-md transition duration-200"
              >
                {post.relatedTool.buttonText}
              </Link>
            </div>
          )}
        </div>
      </article>

      {/* Footer Komprehensif */}
      <Footer />
    </main>
  );
}
