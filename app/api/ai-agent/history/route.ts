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
    return NextResponse.json({ error: 'Penyimpanan data belum siap.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id : '';
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'ID tugas tidak valid.' }, { status: 400 });
  }

  const status = typeof body?.status === 'string' ? body.status : '';
  const permalink = typeof body?.permalink === 'string' ? body.permalink : '';
  const platform = typeof body?.platform === 'string' ? body.platform : 'facebook';
  const publishedAt = typeof body?.publishedAt === 'string' ? body.publishedAt : new Date().toISOString();
  const supervisorNotes = typeof body?.supervisorNotes === 'string' ? body.supervisorNotes : '';
  const output = typeof body?.output === 'string' ? body.output : undefined;
  const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl : undefined;
  const videoUrl = typeof body?.videoUrl === 'string' ? body.videoUrl : undefined;
  const mediaType = typeof body?.mediaType === 'string' ? body.mediaType : undefined;

  // 1. Publikasi Media Sosial (Facebook atau Instagram)
  if (status === 'published_to_social' || permalink) {
    const isValidSocialPermalink =
      permalink.startsWith('https://www.facebook.com/') ||
      permalink.startsWith('https://facebook.com/') ||
      permalink.startsWith('https://www.instagram.com/') ||
      permalink.startsWith('https://instagram.com/');

    if (!isValidSocialPermalink) {
      return NextResponse.json({ error: 'Tautan permalink media sosial tidak valid.' }, { status: 400 });
    }

    try {
      const records = await aiEmployeeStoreRequest<Array<{ data?: unknown }>>(
        `?record_type=eq.task&id=eq.${encodeURIComponent(id)}&select=data&limit=1`
      );
      const existingData = records[0]?.data && typeof records[0].data === 'object'
        ? (records[0].data as Record<string, unknown>)
        : {};

      await aiEmployeeStoreRequest(`?record_type=eq.task&id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          status: 'published_to_social',
          data: {
            ...existingData,
            socialPublication: { platform, permalink, publishedAt },
            supervisorApproval: {
              status: 'approved',
              approvedAt: publishedAt,
              executedPlatform: platform
            }
          },
        }),
      });
      return NextResponse.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan status publikasi.';
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  // 2. Persetujuan / Review Supervisor (Approval Workflow) & Edit Redaksi Manual / Media
  const validApprovalStatuses = ['approved', 'revision', 'rejected', 'pending_approval', 'completed'];
  if (validApprovalStatuses.includes(status) || output !== undefined || imageUrl !== undefined || videoUrl !== undefined) {
    try {
      const records = await aiEmployeeStoreRequest<Array<{ data?: unknown; output?: string }>>(
        `?record_type=eq.task&id=eq.${encodeURIComponent(id)}&select=data,output&limit=1`
      );
      const existingData = records[0]?.data && typeof records[0].data === 'object'
        ? (records[0].data as Record<string, unknown>)
        : {};

      const patchBody: Record<string, unknown> = {
        data: {
          ...existingData,
          ...(status ? { supervisorStatus: status } : {}),
          ...(supervisorNotes ? { supervisorNotes } : {}),
          ...(output !== undefined ? { lastEditedAt: new Date().toISOString(), manuallyEdited: true } : {}),
          ...(imageUrl !== undefined ? { imageUrl } : {}),
          ...(videoUrl !== undefined ? { videoUrl } : {}),
          ...(mediaType !== undefined ? { mediaType } : {}),
          reviewedAt: new Date().toISOString()
        },
      };

      if (validApprovalStatuses.includes(status)) {
        patchBody.status = status;
      }
      if (typeof output === 'string') {
        patchBody.output = output;
      }

      await aiEmployeeStoreRequest(`?record_type=eq.task&id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(patchBody),
      });
      return NextResponse.json({ success: true, status: patchBody.status || 'updated', output });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui status persetujuan atau redaksi supervisor.';
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  return NextResponse.json({ error: 'Aksi atau status tidak dikenali.' }, { status: 400 });
}
