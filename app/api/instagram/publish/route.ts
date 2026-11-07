import { NextResponse } from 'next/server';
import { isSameOrigin, verifyAdminSession } from '@/lib/admin-auth';

export interface InstagramPublishRequest {
  caption: string;
  videoUrl?: string;
  imageUrl?: string;
  mediaType?: 'REELS' | 'VIDEO' | 'IMAGE';
  draftId?: string;
  title?: string;
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Permintaan lintas origin ditolak.' }, { status: 403 });
    }
    if (!verifyAdminSession(request)) {
      return NextResponse.json({ success: false, error: 'Sesi administrator tidak valid.' }, { status: 401 });
    }

    const body: InstagramPublishRequest = await request.json().catch(() => ({}));
    const {
      caption = '',
      videoUrl = '',
      imageUrl = '',
      mediaType = 'REELS',
      draftId = '',
      title = 'Konten KompresKilat',
    } = body;

    if (!caption.trim()) {
      return NextResponse.json(
        { success: false, error: 'Caption konten Instagram tidak boleh kosong.' },
        { status: 400 }
      );
    }
    if (caption.length > 2200) {
      return NextResponse.json(
        { success: false, error: 'Caption Instagram maksimal 2.200 karakter.' },
        { status: 400 }
      );
    }
    if (mediaType !== 'REELS' && mediaType !== 'VIDEO' && mediaType !== 'IMAGE') {
      return NextResponse.json({ success: false, error: 'Tipe media tidak valid.' }, { status: 400 });
    }

    // Ambil kredensial resmi Instagram Graph API dari environment variables
    const accessToken = (
      process.env.INSTAGRAM_ACCESS_TOKEN ||
      process.env.IG_ACCESS_TOKEN ||
      process.env.FACEBOOK_ACCESS_TOKEN ||
      ''
    ).trim();

    const igUserId = (
      process.env.INSTAGRAM_USER_ID ||
      process.env.IG_USER_ID ||
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ||
      ''
    ).trim();

    const targetMediaUrl = videoUrl || imageUrl;
    if (!targetMediaUrl) {
      return NextResponse.json(
        { success: false, error: 'Media publik yang nyata wajib disediakan sebelum publikasi.' },
        { status: 400 }
      );
    }
    try {
      if (new URL(targetMediaUrl).protocol !== 'https:') throw new Error('HTTPS required');
    } catch {
      return NextResponse.json(
        { success: false, error: 'URL media harus berupa alamat HTTPS publik yang valid.' },
        { status: 400 }
      );
    }

    // 1. JIKA KREDENSIAL LENGKAP: EKSEKUSI LANGSUNG KE INSTAGRAM GRAPH API
    if (accessToken && igUserId) {
      try {
        const isReel = mediaType === 'REELS' || mediaType === 'VIDEO';

        // LANGKAH 1: Buat Media Container di Instagram Graph API
        const containerUrl = new URL(`https://graph.facebook.com/v21.0/${igUserId}/media`);
        containerUrl.searchParams.set('access_token', accessToken);
        containerUrl.searchParams.set('caption', caption);

        if (isReel) {
          containerUrl.searchParams.set('media_type', 'REELS');
          containerUrl.searchParams.set('video_url', targetMediaUrl);
          containerUrl.searchParams.set('share_to_feed', 'true');
        } else {
          containerUrl.searchParams.set('image_url', targetMediaUrl);
        }

        const createRes = await fetch(containerUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const createData = await createRes.json();

        if (!createRes.ok || !createData.id) {
          throw new Error(
            createData.error?.message ||
              'Gagal membuat container media di Instagram Graph API.'
          );
        }

        const creationId = createData.id;

        // LANGKAH 2: Untuk Video/Reels, periksa status container sampai selesai diproses
        if (isReel) {
          let attempts = 0;
          let isFinished = false;

          while (attempts < 20 && !isFinished) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            attempts++;

            const statusRes = await fetch(
              `https://graph.facebook.com/v21.0/${creationId}?fields=status_code,status&access_token=${accessToken}`
            );
            const statusData = await statusRes.json();

            if (statusData.status_code === 'FINISHED') {
              isFinished = true;
            } else if (statusData.status_code === 'ERROR') {
              throw new Error(statusData.status || 'Instagram Graph API gagal memproses file video.');
            }
          }

          if (!isFinished) {
            throw new Error('Video sedang diproses di antrean Instagram. Silakan tekan tombol Rilis sekali lagi dalam beberapa detik.');
          }
        }

        // LANGKAH 3: Publikasikan Container Media ke Akun Instagram
        const publishUrl = new URL(`https://graph.facebook.com/v21.0/${igUserId}/media_publish`);
        publishUrl.searchParams.set('access_token', accessToken);
        publishUrl.searchParams.set('creation_id', creationId);

        const publishRes = await fetch(publishUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const publishData = await publishRes.json();

        if (!publishRes.ok || !publishData.id) {
          throw new Error(
            publishData.error?.message ||
              'Gagal mempublikasikan media ke Instagram feed/reels.'
          );
        }

        const publishedPostId = publishData.id;
        let permalink = `https://www.instagram.com/p/${publishedPostId}/`;

        try {
          const detailRes = await fetch(
            `https://graph.facebook.com/v21.0/${publishedPostId}?fields=permalink&access_token=${accessToken}`
          );
          const detailData = await detailRes.json();
          if (detailData.permalink) {
            permalink = detailData.permalink;
          }
        } catch {}

        // Instagram publication can succeed independently from an optional Facebook cross-post.
        let fbPostId: string | null = null;
        let facebookStatus: 'published' | 'not_configured' | 'failed' = 'not_configured';
        const facebookPageId = process.env.FACEBOOK_PAGE_ID?.trim();
        const facebookPageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim();
        if (facebookPageId && facebookPageToken) {
          try {
          const fbFeedUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(facebookPageId)}/feed`;
          const fbRes = await fetch(fbFeedUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: caption,
              access_token: facebookPageToken,
            }),
          });
          const fbData = await fbRes.json();
          if (fbData && fbData.id) {
            fbPostId = fbData.id;
            facebookStatus = 'published';
          } else {
            facebookStatus = 'failed';
          }
          } catch (facebookError) {
            console.error('Facebook Page publication failed:', facebookError);
            facebookStatus = 'failed';
          }
        }

        const fbNote = fbPostId
          ? ' & Halaman Facebook Kompres Kilat'
          : '';

        return NextResponse.json({
          success: true,
          isLive: true,
          postId: publishedPostId,
          facebookPostId: fbPostId,
          facebookStatus,
          permalink,
          message: facebookStatus === 'failed'
            ? `Konten "${title}" berhasil dirilis ke Instagram, tetapi publikasi Facebook gagal.`
            : facebookStatus === 'not_configured'
              ? `Konten "${title}" berhasil dirilis ke Instagram. Facebook belum dikonfigurasi.`
              : `Konten "${title}" berhasil dirilis ke Instagram${fbNote}!`,
          publishedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        });
      } catch (err: any) {
        console.error('Error saat menghubungi Instagram Graph API:', err);
        return NextResponse.json(
          {
            success: false,
            error: err.message || 'Terjadi kesalahan saat memproses Instagram Graph API.',
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Instagram belum dikonfigurasi. Atur INSTAGRAM_ACCESS_TOKEN dan INSTAGRAM_USER_ID.',
    }, { status: 503 });
  } catch (error: any) {
    console.error('Error in /api/instagram/publish:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memproses rilis Instagram',
      },
      { status: 500 }
    );
  }
}
