import { NextResponse } from 'next/server';
import { isSameOrigin, verifyAdminSession } from '@/lib/admin-auth';
import { aiEmployeeStoreRequest, isAIEmployeeStoreConfigured } from '@/lib/ai-employee-store';

interface StoredDraft {
  id: string;
  title: string;
  content: string;
  status: 'pending_review' | 'approved' | 'revision';
  type?: 'article' | 'video' | 'social';
  [key: string]: unknown;
}

export async function GET(request: Request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Sesi administrator tidak valid.' }, { status: 401 });
  }
  if (!isAIEmployeeStoreConfigured()) {
    return NextResponse.json(
      { error: 'Draf belum tersedia. Konfigurasikan Supabase untuk penyimpanan persisten.' },
      { status: 503 }
    );
  }

  try {
    const rows = await aiEmployeeStoreRequest<Array<Record<string, unknown>>>(
      '?record_type=eq.draft&select=id,division_id,division_name,prompt,output,model,status,data,created_at&order=created_at.desc&limit=200'
    );
    return NextResponse.json({ success: true, data: rows }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memuat draf AI Employee.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function PUT(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Permintaan lintas origin ditolak.' }, { status: 403 });
  }
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Sesi administrator tidak valid.' }, { status: 401 });
  }
  if (!isAIEmployeeStoreConfigured()) {
    return NextResponse.json({ error: 'Supabase belum dikonfigurasi.' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const drafts = Array.isArray(body) ? body : [body];
    if (drafts.length > 200 || drafts.some((draft) => !isValidDraft(draft))) {
      return NextResponse.json({ error: 'Data draf tidak valid.' }, { status: 400 });
    }

    const rows = drafts.map((draft) => ({
      id: draft.id,
      record_type: 'draft',
      division_id: draft.type === 'article' ? 'seo' : draft.type === 'video' ? 'creative' : 'sosmed',
      division_name: 'AI Employee',
      prompt: '',
      output: draft.content,
      model: 'human-reviewed',
      status: draft.status,
      data: draft,
      updated_at: new Date().toISOString(),
    }));

    if (rows.length) {
      await aiEmployeeStoreRequest(
        '?on_conflict=id',
        {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify(rows),
        }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal menyimpan draf.';
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
    return NextResponse.json({ error: 'ID draf tidak valid.' }, { status: 400 });
  }

  try {
    await aiEmployeeStoreRequest(`?record_type=eq.draft&id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal menghapus draf.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function isValidDraft(value: unknown): value is StoredDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Record<string, unknown>;
  return (
    typeof draft.id === 'string' &&
    /^[0-9a-f-]{36}$/i.test(draft.id) &&
    typeof draft.title === 'string' &&
    typeof draft.content === 'string' &&
    ['pending_review', 'approved', 'revision'].includes(String(draft.status)) &&
    (draft.type === undefined || ['article', 'video', 'social'].includes(String(draft.type)))
  );
}
