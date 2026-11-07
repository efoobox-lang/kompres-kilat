import { NextResponse } from 'next/server';
import { isSameOrigin, verifyAdminSession } from '@/lib/admin-auth';
import { getSocialCredentials } from '@/lib/social-config';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: 'Permintaan lintas origin ditolak.' }, { status: 403 });
  }
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Sesi administrator tidak valid.' }, { status: 401 });
  }

  const socialCreds = getSocialCredentials();
  const pageId = process.env.FACEBOOK_PAGE_ID?.trim() || socialCreds.facebookPageId;
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim() || socialCreds.facebookToken;
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
    const graphVersion = process.env.META_GRAPH_API_VERSION?.trim() || 'v26.0';

    // Cek apakah token yang tersimpan adalah User Token atau Page Token.
    // Jika User Token dengan izin pages_show_list / pages_manage_posts,
    // ambil Page Access Token resmi secara otomatis dari endpoint halaman.
    let activeToken = pageToken;
    try {
      const pageInfoRes = await fetch(
        `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(pageId)}?fields=access_token&access_token=${encodeURIComponent(pageToken)}`,
        { cache: 'no-store' }
      );
      const pageInfo = await pageInfoRes.json();
      if (pageInfo && typeof pageInfo.access_token === 'string' && pageInfo.access_token.length > 10) {
        activeToken = pageInfo.access_token;
      }
    } catch {
      // Gunakan token asli jika pengecekan otomatis gagal
    }

    const response = await fetch(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(pageId)}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, access_token: activeToken }),
      cache: 'no-store',
    });
    const result = await response.json();
    if (!response.ok || typeof result.id !== 'string') {
      console.error('Facebook Graph API publication failed:', result.error || response.status);
      const rawError = result.error?.message || '';
      let friendlyError = rawError || `Facebook menolak publikasi (HTTP ${response.status}).`;

      if (rawError.includes('pages_manage_posts') || rawError.includes('(#200)')) {
        friendlyError = 'Izin publikasi Facebook belum lengkap (#200). Di Meta Graph API Explorer: (1) Tambahkan izin "pages_manage_posts", (2) Pada dropdown "Pengguna atau Halaman", pilih Halaman Facebook Anda (bukan Token Pengguna), lalu salin token tersebut.';
      }

      return NextResponse.json(
        { success: false, error: friendlyError, rawError },
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
