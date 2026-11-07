import { NextResponse } from 'next/server';
import { isSameOrigin, verifyAdminSession } from '@/lib/admin-auth';
import { getSocialCredentials } from '@/lib/social-config';

export interface InstagramPublishRequest {
  caption: string;
  videoUrl?: string;
  imageUrl?: string;
  mediaType?: 'REELS' | 'VIDEO' | 'IMAGE';
  draftId?: string;
  title?: string;
}

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION?.trim() || 'v26.0';

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

    // Ambil kredensial resmi Instagram Graph API dari environment variables atau config
    const socialCreds = getSocialCredentials();
    const accessToken = (
      process.env.INSTAGRAM_ACCESS_TOKEN ||
      process.env.IG_ACCESS_TOKEN ||
      process.env.FACEBOOK_ACCESS_TOKEN ||
      socialCreds.instagramToken ||
      ''
    ).trim();

    const igUserId = (
      process.env.INSTAGRAM_USER_ID ||
      process.env.IG_USER_ID ||
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ||
      socialCreds.instagramUserId ||
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

    // Pastikan URL media diarahkan ke domain kanonikal www.kompreskilat.site agar tidak terkena 308 redirect yang ditolak bot Meta
    let cleanMediaUrl = targetMediaUrl;
    if (cleanMediaUrl.startsWith('https://kompreskilat.site/')) {
      cleanMediaUrl = cleanMediaUrl.replace('https://kompreskilat.site/', 'https://www.kompreskilat.site/');
    }

    // 1. JIKA KREDENSIAL LENGKAP: EKSEKUSI LANGSUNG KE INSTAGRAM GRAPH API
    if (accessToken && igUserId) {
      try {
        const isReel = mediaType === 'REELS' || mediaType === 'VIDEO';

        // LANGKAH 1: Buat Media Container di Instagram Graph API
        const containerUrl = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(igUserId)}/media`);
        containerUrl.searchParams.set('access_token', accessToken);
        containerUrl.searchParams.set('caption', caption);

        if (isReel) {
          containerUrl.searchParams.set('media_type', 'REELS');
          containerUrl.searchParams.set('video_url', cleanMediaUrl);
          containerUrl.searchParams.set('share_to_feed', 'true');
        } else {
          containerUrl.searchParams.set('image_url', cleanMediaUrl);
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

        // LANGKAH 2: Periksa status container sampai selesai diunduh & diproses oleh Meta
        let attempts = 0;
        let isFinished = false;
        const maxAttempts = isReel ? 20 : 8;

        while (attempts < maxAttempts && !isFinished) {
          // Jeda antar polling (2.5 detik untuk video, 1.5 detik untuk gambar)
          await new Promise((resolve) => setTimeout(resolve, isReel ? 2500 : 1500));
          attempts++;

          try {
            const statusRes = await fetch(
              `https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(creationId)}?fields=status_code,status&access_token=${encodeURIComponent(accessToken)}`,
              { cache: 'no-store' }
            );
            const statusData = await statusRes.json();

            if (statusData.status_code === 'FINISHED') {
              isFinished = true;
            } else if (statusData.status_code === 'ERROR') {
              throw new Error(
                statusData.status ||
                  'Instagram gagal memproses/mengunduh media dari URL. Pastikan format JPG/PNG/MP4 valid.'
              );
            } else if (!statusData.status_code && !isReel) {
              // Untuk gambar pada sebagian versi API, status_code tidak dikembalikan jika langsung siap
              isFinished = true;
            }
          } catch (statusErr: any) {
            if (statusErr.message && !statusErr.message.includes('status_code')) {
              throw statusErr;
            }
          }
        }

        if (!isFinished && isReel) {
          throw new Error('Video sedang diproses di antrean Instagram. Silakan tekan tombol Rilis sekali lagi dalam beberapa detik.');
        }

        // LANGKAH 3: Publikasikan Container Media ke Akun Instagram
        const publishUrl = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(igUserId)}/media_publish`);
        publishUrl.searchParams.set('access_token', accessToken);
        publishUrl.searchParams.set('creation_id', creationId);

        const publishRes = await fetch(publishUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const publishData = await publishRes.json();

        if (!publishRes.ok || !publishData.id) {
          const rawError = publishData.error?.message || '';
          let friendlyError = rawError || 'Gagal mempublikasikan media ke Instagram feed/reels.';
          if (rawError.includes('Media ID is not available')) {
            friendlyError = 'Instagram belum selesai memproses container media. Silakan klik "Publikasikan ke Instagram" sekali lagi dalam beberapa detik.';
          }
          throw new Error(friendlyError);
        }

        const publishedPostId = publishData.id;
        let permalink = `https://www.instagram.com/p/${publishedPostId}/`;

        try {
          const detailRes = await fetch(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(publishedPostId)}?fields=permalink&access_token=${encodeURIComponent(accessToken)}`
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
          const graphVersion = process.env.META_GRAPH_API_VERSION?.trim() || 'v26.0';
          const fbFeedUrl = `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(facebookPageId)}/feed`;
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
