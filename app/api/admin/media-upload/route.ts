import { NextResponse } from 'next/server';
import { isSameOrigin, verifyAdminSession } from '@/lib/admin-auth';
import fs from 'fs/promises';
import path from 'path';

const ALLOWED_MIME_TYPES: Record<string, 'IMAGE' | 'VIDEO'> = {
  'image/jpeg': 'IMAGE',
  'image/jpg': 'IMAGE',
  'image/png': 'IMAGE',
  'image/webp': 'IMAGE',
  'video/mp4': 'VIDEO',
  'video/quicktime': 'VIDEO',
  'video/webm': 'VIDEO',
};

const ALLOWED_EXTS: Record<string, 'IMAGE' | 'VIDEO'> = {
  jpg: 'IMAGE',
  jpeg: 'IMAGE',
  png: 'IMAGE',
  webp: 'IMAGE',
  mp4: 'VIDEO',
  mov: 'VIDEO',
  webm: 'VIDEO',
};

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: 'Permintaan lintas origin ditolak.' }, { status: 403 });
  }
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Sesi administrator tidak valid.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ success: false, error: 'File media tidak ditemukan.' }, { status: 400 });
    }

    const rawExt = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = file.type.toLowerCase();

    const mediaType = ALLOWED_MIME_TYPES[mimeType] || ALLOWED_EXTS[rawExt];
    if (!mediaType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Format tidak didukung. Harap unggah foto (JPG, JPEG, PNG, WEBP) atau video (MP4, MOV, WEBM) saja.',
        },
        { status: 400 }
      );
    }

    // Limit ukuran: 25MB foto, 100MB video
    const maxBytes = mediaType === 'IMAGE' ? 25 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          success: false,
          error: `Ukuran file melebihi batas (${mediaType === 'IMAGE' ? '25 MB' : '100 MB'}).`,
        },
        { status: 400 }
      );
    }

    const ext = rawExt in ALLOWED_EXTS ? rawExt : mediaType === 'IMAGE' ? 'jpg' : 'mp4';
    const filename = `media_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kompreskilat.site').replace(/\/+$/, '');
    const canonicalBase = siteUrl.startsWith('https://kompreskilat.site')
      ? siteUrl.replace('https://kompreskilat.site', 'https://www.kompreskilat.site')
      : siteUrl;

    const publicUrl = `${canonicalBase}/uploads/${filename}`;
    const localUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      localUrl,
      mediaType,
      fileName: file.name,
      size: file.size,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal mengunggah file media.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
