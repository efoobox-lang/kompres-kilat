// File: app/api/blog/article/route.ts
// Endpoint sinkronisasi artikel blog publik real-time untuk Next.js serverless

import { NextResponse } from 'next/server';
import { getPublicBlogPostBySlug, publishBlogArticle, getDynamicPublishedArticles } from '@/lib/blog-service';
import { BLOG_POSTS } from '@/lib/blog-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug')?.trim();

    if (!slug) {
      const allDynamic = await getDynamicPublishedArticles();
      return NextResponse.json({
        success: true,
        articles: allDynamic,
      });
    }

    // Cari dari dynamic published store
    const post = await getPublicBlogPostBySlug(slug);
    if (post) {
      return NextResponse.json({
        success: true,
        article: post,
      });
    }

    // Cari dari artikel statis BLOG_POSTS
    const staticPost = BLOG_POSTS.find((p) => p.slug === slug);
    if (staticPost) {
      return NextResponse.json({
        success: true,
        article: staticPost,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Artikel tidak ditemukan.' },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memuat artikel.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { article } = body;

    if (!article || !article.title || !article.content) {
      return NextResponse.json(
        { success: false, error: 'Data artikel tidak lengkap.' },
        { status: 400 }
      );
    }

    const published = await publishBlogArticle({
      id: String(article.id || crypto.randomUUID()),
      title: String(article.title),
      slug: article.slug ? String(article.slug) : undefined,
      category: article.category,
      excerpt: article.excerpt || article.tagline || article.metaDescription,
      metaDescription: article.metaDescription,
      keywords: article.keywords,
      content: String(article.content),
      wordCount: Number(article.wordCount) || undefined,
      readTime: article.readTime || article.readingTime,
      author: article.author || 'Tim SEO & Content Writer KompresKilat',
      status: 'published',
      relatedTool: article.relatedTool,
      createdAt: article.createdAt,
    });

    return NextResponse.json({
      success: true,
      article: published,
      publishedUrl: `/blog/${published.slug}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menyimpan artikel.' },
      { status: 500 }
    );
  }
}
