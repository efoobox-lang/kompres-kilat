import { NextResponse } from 'next/server';
import {
  getFormattedAnalyticsMetrics,
  recordPageView,
  recordClick,
} from '@/lib/telemetry';

export interface AnalyticsMetricData {
  totalViews: number;
  totalClicks: number;
  totalSales: number;
  uniqueVisitors: number;
  viewsGrowth: string;
  clicksGrowth: string;
  salesGrowth: string;
  avgDailyViews: number;
  peakViews: number;
  ctr: string;
  latency: string;
  uptime: string;
  weekly: {
    day: string;
    date: string;
    views: number;
    clicks: number;
    sales: number;
  }[];
  source: string;
  syncedAt: string;
}

export async function GET() {
  try {
    // 1. Integrasi Vercel Web Analytics API jika VERCEL_AUTH_TOKEN dan VERCEL_PROJECT_ID disediakan
    const vercelToken = process.env.VERCEL_AUTH_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;

    let vercelLiveStats: any = null;

    if (vercelToken && vercelProjectId) {
      try {
        const vercelRes = await fetch(
          `https://api.vercel.com/v1/analytics/stats?projectId=${vercelProjectId}`,
          {
            headers: {
              Authorization: `Bearer ${vercelToken}`,
            },
            cache: 'no-store',
          }
        );
        if (vercelRes.ok) {
          vercelLiveStats = await vercelRes.json();
        }
      } catch (err) {
        console.warn('Vercel Analytics API call fallback to telemetry engine:', err);
      }
    }

    // 2. Data dinamis dari real-time telemetry engine
    const metrics: AnalyticsMetricData = getFormattedAnalyticsMetrics(vercelLiveStats);

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
  } catch (error: any) {
    console.error('Error in GET /api/analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat analitik',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action = 'pageview', visitorId } = body;

    let updatedStore;
    if (action === 'click') {
      updatedStore = recordClick();
    } else {
      updatedStore = recordPageView(visitorId);
    }

    return NextResponse.json({
      success: true,
      totalViews: updatedStore.totalViews,
      uniqueVisitors: updatedStore.uniqueVisitors.length,
      totalClicks: updatedStore.totalClicks,
    });
  } catch (error: any) {
    console.error('Error in POST /api/analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal merekam telemetri',
      },
      { status: 500 }
    );
  }
}
