// File: app/api/ai-agent/publish/route.ts
// Handler API untuk Publikasi Artikel Blog Divisi SEO (Human-in-the-Loop)
// Mengubah status draf menjadi 'published' dan memicu ISR / SSR Real-Time tanpa Rebuild

import { NextResponse } from 'next/server';
import { isSameOrigin, verifyAdminSession } from '@/lib/admin-auth';
import { publishBlogArticle, unpublishBlogArticle } from '@/lib/blog-service';

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: 'Permintaan lintas origin ditolak.' }, { status: 403 });
    }
    if (!verifyAdminSession(request)) {
      return NextResponse.json({ error: 'Sesi administrator tidak valid.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, article } = body;

    if (action === 'unpublish') {
      const id = String(article?.id || body?.id || '');
      if (!id) {
        return NextResponse.json({ error: 'ID artikel tidak valid untuk unpublish.' }, { status: 400 });
      }
      await unpublishBlogArticle(id);
      return NextResponse.json({
        success: true,
        message: 'Artikel berhasil ditarik kembali ke status draf.',
        status: 'draft',
      });
    }

    // Default action: publish
    if (!article || typeof article !== 'object') {
      return NextResponse.json({ error: 'Data artikel tidak valid.' }, { status: 400 });
    }

    if (!article.id || !article.title || !article.content) {
      return NextResponse.json({ error: 'Judul, konten, dan ID artikel wajib diisi.' }, { status: 400 });
    }

    const published = await publishBlogArticle({
      id: String(article.id),
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
      message: 'Artikel berhasil dipublikasikan ke blog publik secara langsung tanpa rebuild!',
      publishedUrl: `/blog/${published.slug}`,
      article: published,
      status: 'published',
    });
  } catch (error: any) {
    console.error('Error saat mempublikasikan artikel blog:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan internal saat mempublikasikan artikel.' },
      { status: 500 }
    );
  }
}
