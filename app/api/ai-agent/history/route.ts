import { NextResponse } from 'next/server';
import { isSameOrigin, verifyAdminSession } from '@/lib/admin-auth';
import { aiEmployeeStoreRequest, isAIEmployeeStoreConfigured } from '@/lib/ai-employee-store';

export async function GET(request: Request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Sesi administrator tidak valid.' }, { status: 401 });
  }
  if (!isAIEmployeeStoreConfigured()) {
    return NextResponse.json(
      { error: 'Riwayat belum tersedia. Konfigurasikan Supabase untuk penyimpanan persisten.' },
      { status: 503 }
    );
  }

  try {
    const rows = await aiEmployeeStoreRequest<Array<Record<string, unknown>>>(
      '?record_type=eq.task&select=id,division_id,division_name,prompt,output,model,status,data,created_at&order=created_at.desc&limit=100'
    );
    return NextResponse.json({ success: true, data: rows }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memuat riwayat AI Employee.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Permintaan lintas origin ditolak.' }, { status: 403 });
  }
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Sesi administrator tidak valid.' }, { status: 401 });
  }
  if (!isAIEmployeeStoreConfigured()) {
    return NextResponse.json({ error: 'Supabase belum dikonfigurasi.' }, { status: 503 });
  }
  const id = new URL(request.url).searchParams.get('id');
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'ID tugas tidak valid.' }, { status: 400 });
  }

  try {
    await aiEmployeeStoreRequest(`?record_type=eq.task&id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal menghapus riwayat tugas.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Permintaan lintas origin ditolak.' }, { status: 403 });
  }
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Sesi administrator tidak valid.' }, { status: 401 });
  }
  if (!isAIEmployeeStoreConfigured()) {
    return NextResponse.json({ error: 'Supabase belum dikonfigurasi.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id : '';
  const permalink = typeof body?.permalink === 'string' ? body.permalink : '';
  const publishedAt = typeof body?.publishedAt === 'string' ? body.publishedAt : '';
  if (!/^[0-9a-f-]{36}$/i.test(id) || !permalink.startsWith('https://www.facebook.com/') || !publishedAt) {
    return NextResponse.json({ error: 'Metadata publikasi tidak valid.' }, { status: 400 });
  }

  try {
    const records = await aiEmployeeStoreRequest<Array<{ data?: unknown }>>(
      `?record_type=eq.task&id=eq.${encodeURIComponent(id)}&select=data&limit=1`
    );
    if (!records[0]) {
      return NextResponse.json({ error: 'Riwayat tugas tidak ditemukan.' }, { status: 404 });
    }
    const existingData = records[0].data && typeof records[0].data === 'object'
      ? records[0].data as Record<string, unknown>
      : {};
    await aiEmployeeStoreRequest(`?record_type=eq.task&id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        status: 'published_to_social',
        data: {
          ...existingData,
          socialPublication: { platform: 'facebook', permalink, publishedAt },
        },
      }),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal menyimpan status publikasi.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
