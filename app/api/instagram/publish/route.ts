import { NextResponse } from 'next/server';

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

    const targetMediaUrl =
      videoUrl ||
      imageUrl ||
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

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

        return NextResponse.json({
          success: true,
          isLive: true,
          postId: publishedPostId,
          permalink,
          message: `Konten "${title}" berhasil dirilis langsung ke Instagram Reels & Feed!`,
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

    // 2. MODE SIMULASI / SANDBOX JIKA TOKEN BELUM DIISI DI .env.local
    // Memberikan validasi alur penuh tanpa memblokir administrator
    const mockPostId = `ig_reel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const mockPermalink = `https://www.instagram.com/kompreskilat.site/`;

    return NextResponse.json({
      success: true,
      isLive: false,
      isDemo: true,
      postId: mockPostId,
      permalink: mockPermalink,
      message: `Konten "${title}" berhasil divalidasi dan disimulasikan siap rilis ke Instagram Graph API. (Atur INSTAGRAM_ACCESS_TOKEN & INSTAGRAM_USER_ID di .env.local untuk rilis live publik).`,
      captionPreview: caption.slice(0, 100) + '...',
      mediaUrl: targetMediaUrl,
      publishedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    });
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
