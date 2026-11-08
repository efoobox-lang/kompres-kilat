import { notFound } from 'next/navigation';
import { getAllPosts } from '@/lib/blog-data';
import { getPublicBlogPostBySlug } from '@/lib/blog-service';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogPostClient from './BlogPostClient';

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
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Artikel Tidak Ditemukan - KompresKilat',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kompreskilat.site';

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
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kompreskilat.site';

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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <JsonLd data={articleSchema} />

      {/* Header / Navbar Responsif */}
      <Navbar />

      {/* Konten Artikel Interaktif & Bilingual */}
      <BlogPostClient post={post} />

      {/* Footer Komprehensif */}
      <Footer />
    </main>
  );
}
