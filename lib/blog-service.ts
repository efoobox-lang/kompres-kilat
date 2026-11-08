// File: lib/blog-service.ts
// Layanan Pengelolaan Artikel Blog KompresKilat
// Mendukung Status: 'draft' | 'review' | 'published'
// Menggabungkan Static Posts + Dynamic Published Posts untuk SSR/ISR Real-Time tanpa Rebuild!

import fs from 'node:fs';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { BLOG_POSTS, type BlogPost } from '@/lib/blog-data';
import { aiEmployeeStoreRequest } from '@/lib/ai-employee-store';

export type BlogArticleStatus = 'draft' | 'review' | 'published';

export interface DynamicBlogArticle {
  id: string;
  title: string;
  slug: string;
  category: BlogPost['category'];
  excerpt: string;
  metaDescription: string;
  keywords: string;
  content: string;
  wordCount: number;
  readTime: string;
  author: string;
  status: BlogArticleStatus;
  relatedTool: {
    title: string;
    description: string;
    url: string;
    icon: string;
    buttonText: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

const STORE_FILE_PATH = path.join(process.cwd(), 'data', 'blog-published-store.json');

// In-Memory Cache untuk performa tinggi
interface ServerCache {
  publishedArticles: DynamicBlogArticle[];
  lastLoaded: number;
}

const getGlobalCache = (): ServerCache => {
  const globalRef = globalThis as unknown as { __BLOG_SERVER_CACHE__?: ServerCache };
  if (!globalRef.__BLOG_SERVER_CACHE__) {
    globalRef.__BLOG_SERVER_CACHE__ = { publishedArticles: [], lastLoaded: 0 };
  }
  return globalRef.__BLOG_SERVER_CACHE__;
};

/**
 * Membaca berkas persisten data/blog-published-store.json
 */
function readPersistentStore(): DynamicBlogArticle[] {
  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const content = fs.readFileSync(STORE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Gagal membaca data/blog-published-store.json:', err);
  }
  return [];
}

/**
 * Menulis ke berkas persisten data/blog-published-store.json
 */
function writePersistentStore(articles: DynamicBlogArticle[]): void {
  try {
    const dir = path.dirname(STORE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(articles, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Gagal menulis data/blog-published-store.json:', err);
  }
}

/**
 * Mengambil semua artikel yang berstatus 'published' (baik dari file lokal, Supabase, maupun memori)
 */
export async function getDynamicPublishedArticles(): Promise<DynamicBlogArticle[]> {
  const cache = getGlobalCache();
  const now = typeof performance !== 'undefined' ? performance.now() : 0;

  // Cache 5 detik untuk server-side rendering super cepat
  if (cache.publishedArticles.length > 0 && now - cache.lastLoaded < 5000) {
    return cache.publishedArticles;
  }

  // 1. Baca dari file persisten lokal
  let list = readPersistentStore();

  // 2. Baca dari store ai_employee_records jika tersedia
  try {
    const rows = await aiEmployeeStoreRequest<Array<Record<string, unknown>>>(
      '?record_type=eq.draft&status=eq.published&select=id,division_id,prompt,output,status,data,created_at,updated_at&limit=100'
    );
    if (Array.isArray(rows) && rows.length > 0) {
      for (const row of rows) {
        const data = (row.data || {}) as Record<string, unknown>;
        const articleId = String(row.id || data.id);
        const exists = list.some((item) => item.id === articleId);
        if (!exists && data.title && data.slug) {
          list.unshift({
            id: articleId,
            title: String(data.title),
            slug: String(data.slug),
            category: (data.category as BlogPost['category']) || 'Dokumen PDF',
            excerpt: String(data.metaDescription || data.excerpt || String(row.output || '').slice(0, 160)),
            metaDescription: String(data.metaDescription || data.excerpt || ''),
            keywords: String(data.keywords || 'kompres kilat'),
            content: String(row.output || data.content || ''),
            wordCount: Number(data.wordCount) || 800,
            readTime: String(data.readTime || data.readingTime || '5 menit'),
            author: String(data.author || 'Tim SEO & Content Writer KompresKilat'),
            status: 'published',
            relatedTool: (data.relatedTool as DynamicBlogArticle['relatedTool']) || {
              title: 'Alat Pendukung KompresKilat',
              description: 'Gunakan fitur utilitas berkas online gratis langsung di browser.',
              url: '/tools/image',
              icon: '⚡',
              buttonText: 'Coba Sekarang',
            },
            createdAt: String(row.created_at || data.createdAt || new Date().toISOString()),
            updatedAt: String(row.updated_at || data.updatedAt || new Date().toISOString()),
            publishedAt: String(data.publishedAt || row.updated_at || new Date().toISOString()),
          });
        }
      }
    }
  } catch (err) {
    console.warn('Gagal sinkronisasi data blog dari Supabase/Store:', err);
  }

  cache.publishedArticles = list;
  cache.lastLoaded = now;
  return list;
}

/**
 * Mengonversi DynamicBlogArticle ke tipe BlogPost standar
 */
export function convertToBlogPost(article: DynamicBlogArticle): BlogPost {
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt || article.metaDescription,
    category: article.category,
    date: article.publishedAt
      ? new Date(article.publishedAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : 'Hari ini',
    readTime: article.readTime || '5 menit',
    author: article.author || 'Tim SEO & Content Writer KompresKilat',
    content: article.content,
    relatedTool: article.relatedTool,
  };
}

/**
 * Mengambil SEMUA artikel blog publik:
 * Menggabungkan artikel statis bawaan (BLOG_POSTS) dengan artikel dinamis yang berstatus 'published'.
 * Artikel dinamis terbaru ditaruh paling depan!
 */
export async function getAllPublicBlogPosts(): Promise<BlogPost[]> {
  const dynamicPublished = await getDynamicPublishedArticles();
  const convertedDynamic = dynamicPublished.map(convertToBlogPost);

  // Hindari duplikasi slug jika ada yang sama dengan posting statis
  const dynamicSlugs = new Set(convertedDynamic.map((p) => p.slug));
  const filteredStatic = BLOG_POSTS.filter((p) => !dynamicSlugs.has(p.slug));

  return [...convertedDynamic, ...filteredStatic];
}

/**
 * Mengambil satu artikel blog berdasarkan slug:
 * Mencari di artikel dinamis 'published' terlebih dahulu, jika tidak ada cari di artikel statis.
 */
export async function getPublicBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const dynamicPublished = await getDynamicPublishedArticles();
  const foundDynamic = dynamicPublished.find((p) => p.slug === slug);
  if (foundDynamic) {
    return convertToBlogPost(foundDynamic);
  }
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/**
 * Publikasikan draf artikel:
 * Mengubah status artikel menjadi 'published', menyimpan ke file persisten dan database,
 * serta memicu revalidasi instan (ISR) di Next.js tanpa rebuild manual!
 */
export async function publishBlogArticle(articleData: Partial<DynamicBlogArticle> & { id: string }): Promise<DynamicBlogArticle> {
  const list = readPersistentStore();
  const now = new Date().toISOString();

  const title = articleData.title || 'Artikel Blog KompresKilat';
  const rawSlug = articleData.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const slug = rawSlug.slice(0, 80);

  const publishedArticle: DynamicBlogArticle = {
    id: articleData.id,
    title,
    slug,
    category: (articleData.category as BlogPost['category']) || 'Dokumen PDF',
    excerpt: articleData.excerpt || articleData.metaDescription || (articleData.content || '').slice(0, 160),
    metaDescription: articleData.metaDescription || articleData.excerpt || '',
    keywords: articleData.keywords || 'kompres kilat, tools online gratis',
    content: articleData.content || '',
    wordCount: articleData.wordCount || 800,
    readTime: articleData.readTime || '6 menit',
    author: articleData.author || 'Tim SEO & Content Writer KompresKilat',
    status: 'published',
    relatedTool: articleData.relatedTool || {
      title: 'Fitur Terkait di KompresKilat',
      description: 'Gunakan alat pendukung berkas online gratis langsung di browser Anda.',
      url: '/tools/image',
      icon: '⚡',
      buttonText: 'Coba Fitur Sekarang',
    },
    createdAt: articleData.createdAt || now,
    updatedAt: now,
    publishedAt: now,
  };

  const existingIdx = list.findIndex((a) => a.id === publishedArticle.id || a.slug === publishedArticle.slug);
  if (existingIdx >= 0) {
    list[existingIdx] = publishedArticle;
  } else {
    list.unshift(publishedArticle);
  }

  // Simpan ke file persisten
  writePersistentStore(list);

  // Perbarui cache memori
  const cache = getGlobalCache();
  cache.publishedArticles = list;
  cache.lastLoaded = typeof performance !== 'undefined' ? performance.now() : 0;

  // Sinkronkan ke store ai_employee_records
  try {
    await aiEmployeeStoreRequest(
      '?on_conflict=id',
      {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify([{
          id: publishedArticle.id,
          record_type: 'draft',
          division_id: 'seo',
          division_name: 'Divisi SEO & Content Writer',
          prompt: `Publikasi artikel: ${publishedArticle.title}`,
          output: publishedArticle.content,
          model: 'human-mandor-verified',
          status: 'published',
          data: publishedArticle,
          updated_at: now,
        }]),
      }
    );
  } catch (err) {
    console.warn('Gagal sinkronisasi publikasi ke ai_employee_records:', err);
  }

  // On-Demand Revalidation: Segarkan cache ISR halaman /blog dan /blog/[slug] secara instan
  try {
    revalidatePath('/blog');
    revalidatePath(`/blog/${publishedArticle.slug}`);
    revalidatePath('/sitemap.xml');
  } catch (revalidateErr) {
    console.warn('Gagal revalidatePath:', revalidateErr);
  }

  return publishedArticle;
}

/**
 * Batalkan publikasi artikel (kembalikan ke status 'draft')
 */
export async function unpublishBlogArticle(articleId: string): Promise<boolean> {
  let list = readPersistentStore();
  const target = list.find((a) => a.id === articleId);
  const targetSlug = target?.slug;

  list = list.filter((a) => a.id !== articleId);
  writePersistentStore(list);

  const cache = getGlobalCache();
  cache.publishedArticles = list;
  cache.lastLoaded = typeof performance !== 'undefined' ? performance.now() : 0;

  try {
    await aiEmployeeStoreRequest(`?record_type=eq.draft&id=eq.${encodeURIComponent(articleId)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'draft',
        'data.status': 'draft',
        updated_at: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.warn('Gagal unpublish di ai_employee_records:', err);
  }

  try {
    revalidatePath('/blog');
    if (targetSlug) {
      revalidatePath(`/blog/${targetSlug}`);
    }
  } catch {}

  return true;
}
