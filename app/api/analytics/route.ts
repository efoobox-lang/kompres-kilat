import { createHmac } from 'node:crypto';
import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getSupabaseConfig, supabaseTableRequest } from '@/lib/ai-employee-store';
import { checkRateLimit } from '@/lib/security';
import {
  getSiteAnalyticsMetrics,
  recordAnalyticsEvent,
  syncVercelAnalyticsBaseline,
} from '@/lib/analytics-service';

export async function GET(request: Request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Sesi administrator tidak valid.' }, { status: 401 });
  }

  try {
    const metrics = await getSiteAnalyticsMetrics();

    return NextResponse.json(
      {
        success: true,
        data: metrics,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/analytics:', error);
    const message = error instanceof Error ? error.message : 'Gagal memuat analitik.';
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
  if (!checkRateLimit(`analytics:${ip}`, 180, 60_000).allowed) {
    return NextResponse.json({ success: false, error: 'Batas pencatatan analitik tercapai.' }, { status: 429 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const action = body?.action;

    // 1. Aksi Sinkronisasi Angka Vercel Analytics dari Admin Panel
    if (action === 'sync_vercel') {
      if (!verifyAdminSession(request)) {
        return NextResponse.json({ success: false, error: 'Sesi administrator tidak valid.' }, { status: 401 });
      }

      const totalViews = Number(body.totalViews);
      const uniqueVisitors = Number(body.uniqueVisitors);
      const totalClicks = body.totalClicks !== undefined ? Number(body.totalClicks) : undefined;
      const vercelToken = typeof body.vercelToken === 'string' ? body.vercelToken.trim() : undefined;
      const projectId = typeof body.projectId === 'string' ? body.projectId.trim() : undefined;
      const teamId = typeof body.teamId === 'string' ? body.teamId.trim() : undefined;

      const updated = await syncVercelAnalyticsBaseline({
        totalViews,
        uniqueVisitors,
        totalClicks,
        vercelToken,
        projectId,
        teamId,
        sourceNote: body.sourceNote || 'Vercel Web Analytics (Tersinkronisasi)',
      });

      return NextResponse.json({
        success: true,
        message: 'Data analitik berhasil disinkronkan dengan Vercel Analytics.',
        data: updated,
      });
    }

    // 2. Aksi Telemetri Pengunjung Riil (Pageview & Click)
    if (action !== 'pageview' && action !== 'click') {
      return NextResponse.json({ success: false, error: 'Jenis event analitik tidak valid.' }, { status: 400 });
    }

    const visitorId = typeof body.visitorId === 'string' ? body.visitorId.slice(0, 128) : '';
    const pagePath = typeof body.path === 'string' && body.path.startsWith('/') ? body.path.slice(0, 300) : '/';

    // Rekam ke sistem analitik persisten internal secara real-time
    recordAnalyticsEvent({
      action,
      path: pagePath,
      visitorId,
    });

    // Jika Supabase aktif, rekam juga salinannya ke Supabase
    const config = getSupabaseConfig();
    if (config) {
      try {
        const visitorHash = visitorId ? createHmac('sha256', config.key).update(visitorId).digest('hex') : null;
        await supabaseTableRequest('site_analytics_events', '', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            event_type: action,
            visitor_hash: action === 'pageview' ? visitorHash : null,
            page_path: pagePath,
          }),
        });
      } catch (err) {
        console.warn('Gagal mencatat event ke Supabase, data disimpan lokal:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/analytics:', error);
    const message = error instanceof Error ? error.message : 'Gagal mencatat analitik.';
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
