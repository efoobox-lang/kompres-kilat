import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getSupabaseConfig } from '@/lib/ai-employee-store';

type IntegrationStatus = 'connected' | 'missing' | 'error' | 'unverified';

interface IntegrationCheck {
  id: string;
  name: string;
  status: IntegrationStatus;
  message: string;
}

const timeoutSignal = () => AbortSignal.timeout(8_000);

async function checkIntegration(
  id: string,
  name: string,
  configured: boolean,
  check: () => Promise<boolean>,
  connectedMessage: string,
  failedMessage: string,
  missingMessage: string
): Promise<IntegrationCheck> {
  if (!configured) {
    return { id, name, status: 'missing', message: missingMessage };
  }
  try {
    const connected = await check();
    return connected
      ? { id, name, status: 'connected', message: connectedMessage }
      : { id, name, status: 'error', message: failedMessage };
  } catch {
    return { id, name, status: 'error', message: failedMessage };
  }
}

export async function GET(request: Request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Sesi administrator tidak valid.' }, { status: 401 });
  }

  const supabase = getSupabaseConfig();
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
  const videoModel = (process.env.GOOGLE_VIDEO_MODEL || 'gemini-omni-1.2-flash').trim();
  const instagramToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const instagramUserId = process.env.INSTAGRAM_USER_ID?.trim();
  const facebookPageId = process.env.FACEBOOK_PAGE_ID?.trim();
  const facebookToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim();
  const graphVersion = process.env.META_GRAPH_API_VERSION?.trim() || 'v26.0';

  const checks = await Promise.all([
    checkIntegration(
      'supabase',
      'Supabase (database)',
      Boolean(supabase),
      async () => {
        const response = await fetch(
          `${supabase!.url}/rest/v1/ai_employee_records?select=id&limit=1`,
          {
            headers: {
              apikey: supabase!.key,
              Authorization: `Bearer ${supabase!.key}`,
            },
            cache: 'no-store',
            signal: timeoutSignal(),
          }
        );
        return response.ok;
      },
      'Database AI Employee dapat diakses.',
      'Koneksi database gagal. Periksa URL, service-role key, dan skema SQL.',
      'Atur SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.'
    ),
    checkIntegration(
      'analytics',
      'Supabase Analytics',
      Boolean(supabase),
      async () => {
        const response = await fetch(`${supabase!.url}/rest/v1/rpc/get_site_analytics_metrics`, {
          method: 'POST',
          headers: {
            apikey: supabase!.key,
            Authorization: `Bearer ${supabase!.key}`,
            'Content-Type': 'application/json',
          },
          body: '{}',
          cache: 'no-store',
          signal: timeoutSignal(),
        });
        return response.ok;
      },
      'Tabel event dan RPC metrik dapat diakses.',
      'Pemeriksaan analytics gagal. Terapkan skema SQL dan periksa service-role key.',
      'Atur SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.'
    ),
    checkIntegration(
      'gemini',
      'Gemini (teks)',
      Boolean(geminiKey),
      async () => {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
          headers: { 'x-goog-api-key': geminiKey },
          cache: 'no-store',
          signal: timeoutSignal(),
        });
        if (!response.ok) return false;
        const result = await response.json() as { models?: Array<{ name?: string }> };
        return Boolean(result.models?.some((model) => model.name?.endsWith('/gemini-2.5-flash')));
      },
      'API key valid dan model gemini-2.5-flash tersedia.',
      'Gemini tidak dapat divalidasi atau model gemini-2.5-flash tidak tersedia.',
      'Atur GEMINI_API_KEY atau GOOGLE_API_KEY.'
    ),
    checkIntegration(
      'video',
      'Gemini Video + Supabase Storage',
      Boolean(geminiKey && supabase && videoModel),
      async () => {
        const [modelsResponse, bucketResponse] = await Promise.all([
          fetch('https://generativelanguage.googleapis.com/v1beta/models', {
            headers: { 'x-goog-api-key': geminiKey },
            cache: 'no-store',
            signal: timeoutSignal(),
          }),
          fetch(`${supabase!.url}/storage/v1/bucket/ai-employee-videos`, {
            headers: {
              apikey: supabase!.key,
              Authorization: `Bearer ${supabase!.key}`,
            },
            cache: 'no-store',
            signal: timeoutSignal(),
          }),
        ]);
        if (!modelsResponse.ok || !bucketResponse.ok) return false;
        const result = await modelsResponse.json() as { models?: Array<{ name?: string }> };
        return Boolean(result.models?.some((model) => model.name?.endsWith(`/${videoModel}`)));
      },
      `Model ${videoModel} terdaftar dan bucket video dapat diakses; izin generasi dan billing perlu diuji dengan job nyata.`,
      'Model tidak terdaftar atau bucket ai-employee-videos tidak dapat diakses. Akses generasi/billing perlu diuji dengan job nyata.',
      'Atur Gemini API key dan Supabase. Terapkan SQL untuk membuat bucket; set GOOGLE_VIDEO_MODEL bila perlu.'
    ),
    checkIntegration(
      'instagram',
      'Instagram Graph API',
      Boolean(instagramToken && instagramUserId),
      async () => {
        const url = new URL(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(instagramUserId!)}`);
        url.searchParams.set('fields', 'id,username');
        url.searchParams.set('access_token', instagramToken!);
        const response = await fetch(url, { cache: 'no-store', signal: timeoutSignal() });
        if (!response.ok) return false;
        const result = await response.json() as { id?: string };
        return result.id === instagramUserId;
      },
      'Token valid dan cocok dengan Instagram User ID; izin publikasi belum diuji.',
      'Instagram menolak token atau User ID tidak cocok.',
      'Atur INSTAGRAM_ACCESS_TOKEN dan INSTAGRAM_USER_ID.'
    ),
    checkIntegration(
      'facebook',
      'Facebook Page publishing',
      Boolean(facebookToken && facebookPageId),
      async () => {
        const url = new URL(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(facebookPageId!)}`);
        url.searchParams.set('fields', 'id,name');
        url.searchParams.set('access_token', facebookToken!);
        const response = await fetch(url, { cache: 'no-store', signal: timeoutSignal() });
        if (!response.ok) return false;
        const result = await response.json() as { id?: string };
        return result.id === facebookPageId;
      },
      'Page Access Token valid untuk Facebook Page; izin membuat post belum diuji.',
      'Facebook menolak token atau Page ID tidak cocok.',
      'Atur FACEBOOK_PAGE_ID dan FACEBOOK_PAGE_ACCESS_TOKEN.'
    ),
  ]);

  const hermesEnabled = process.env.HERMES3D_ENABLE_PRODUCTION === 'true';
  checks.push({
    id: 'hermes3d',
    name: 'Hermes3D',
    status: !hermesEnabled
      ? 'unverified'
      : process.env.HERMES3D_API_URL?.trim() &&
          process.env.HERMES3D_AGENT_ID?.trim() &&
          process.env.HERMES3D_INTEGRATION_TOKEN?.trim()
        ? 'unverified'
        : 'missing',
    message: hermesEnabled
      ? 'Konfigurasi tersedia, tetapi endpoint tidak diuji tanpa menjalankan tugas.'
      : 'Opsional dan tidak diaktifkan.',
  });

  const adminConfigured = process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 12 &&
    process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32;
  checks.unshift({
    id: 'admin',
    name: 'Admin session',
    status: adminConfigured ? 'connected' : 'missing',
    message: adminConfigured ? 'Password dan secret sesi memenuhi panjang minimum.' : 'Atur password dan secret sesi admin.',
  });

  return NextResponse.json(
    { success: true, checkedAt: new Date().toISOString(), integrations: checks },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
  );
}
