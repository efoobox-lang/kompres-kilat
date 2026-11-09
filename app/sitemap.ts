import type { MetadataRoute } from 'next';
import { ALL_TOOLS } from '@/lib/tools-data';
import { getAllPosts } from '@/lib/blog-data';

// Indonesian month dictionary for resilient date parsing
const INDONESIAN_MONTHS: Record<string, string> = {
  januari: '01',
  februari: '02',
  maret: '03',
  april: '04',
  mei: '05',
  juni: '06',
  juli: '07',
  agustus: '08',
  september: '09',
  oktober: '10',
  november: '11',
  desember: '12',
};

function parseSafeDate(dateStr?: string): Date {
  if (!dateStr) return new Date();
  const directDate = new Date(dateStr);
  if (!isNaN(directDate.getTime())) return directDate;

  // Handle Indonesian date string format (e.g. "31 Oktober 2026")
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = INDONESIAN_MONTHS[parts[1].toLowerCase()];
    const year = parts[2];
    if (month && year) {
      const parsed = new Date(`${year}-${month}-${day}T00:00:00Z`);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }

  return new Date();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kompreskilat.site';
  const now = new Date();

  // 1. Core Static Pages (Home, Blog, Forum, About, Legal, Contact)
  const corePages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/forum`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // 2. All Productivity & AI Tools (Auto-derived from ALL_TOOLS catalog)
  const toolPages: MetadataRoute.Sitemap = ALL_TOOLS.map((tool) => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: now,
    changeFrequency: tool.isPopular ? 'daily' : 'weekly',
    priority: tool.isPopular ? 1.0 : 0.9,
  }));

  // 3. Educational Blog Posts & SEO Guides
  const blogPosts = getAllPosts();
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: parseSafeDate(post.date),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  return [...corePages, ...toolPages, ...blogPages];
}
