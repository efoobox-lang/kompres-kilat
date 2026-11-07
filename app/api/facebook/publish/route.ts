import { NextResponse } from 'next/server';
import { isSameOrigin, verifyAdminSession } from '@/lib/admin-auth';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: 'Permintaan lintas origin ditolak.' }, { status: 403 });
  }
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Sesi administrator tidak valid.' }, { status: 401 });
  }

  const pageId = process.env.FACEBOOK_PAGE_ID?.trim();
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim();
  if (!pageId || !pageToken) {
    return NextResponse.json(
      { success: false, error: 'Facebook belum dikonfigurasi. Atur FACEBOOK_PAGE_ID dan FACEBOOK_PAGE_ACCESS_TOKEN.' },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Format permintaan tidak valid.' }, { status: 400 });
  }
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message || message.length > 63_000) {
    return NextResponse.json({ success: false, error: 'Teks posting Facebook harus berisi 1-63.000 karakter.' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(pageId)}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, access_token: pageToken }),
      cache: 'no-store',
    });
    const result = await response.json();
    if (!response.ok || typeof result.id !== 'string') {
      console.error('Facebook Graph API publication failed:', result.error || response.status);
      return NextResponse.json(
        { success: false, error: result.error?.message || `Facebook menolak publikasi (HTTP ${response.status}).` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      postId: result.id,
      permalink: `https://www.facebook.com/${result.id}`,
      publishedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Facebook Graph API request failed:', error);
    return NextResponse.json({ success: false, error: 'Tidak dapat terhubung ke Facebook Graph API.' }, { status: 502 });
  }
}
