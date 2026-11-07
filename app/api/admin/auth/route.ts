import { NextResponse } from 'next/server';
import {
  clearAdminSessionCookie,
  createAdminSessionCookie,
  createAdminSessionToken,
  isAdminConfigured,
  isSameOrigin,
  verifyAdminPassword,
  verifyAdminSession,
} from '@/lib/admin-auth';
import { checkRateLimit } from '@/lib/security';

export async function GET(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { authenticated: false, error: 'Atur ADMIN_PASSWORD dan ADMIN_SESSION_SECRET pada environment produksi.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(
    { authenticated: verifyAdminSession(request) },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Permintaan lintas origin ditolak.' }, { status: 403 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: 'Atur ADMIN_PASSWORD dan ADMIN_SESSION_SECRET pada environment produksi.' },
      { status: 503 }
    );
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const { allowed } = checkRateLimit(`admin-login:${ip}`, 10, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan masuk. Coba lagi nanti.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Format permintaan tidak valid.' }, { status: 400 });
  }

  const password =
    body && typeof body === 'object' && 'password' in body ? body.password : undefined;
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'Kata sandi administrator salah.' }, { status: 401 });
  }

  const token = createAdminSessionToken();
  const response = NextResponse.json({ authenticated: true, token });
  response.headers.set('Set-Cookie', createAdminSessionCookie(request));
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Permintaan lintas origin ditolak.' }, { status: 403 });
  }
  const response = NextResponse.json({ authenticated: false });
  response.headers.set('Set-Cookie', clearAdminSessionCookie());
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
