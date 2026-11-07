import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_COOKIE = 'kk_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function getAdminConfig() {
  const password = process.env.ADMIN_PASSWORD || 'kompreskilat2026';
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    'kompreskilat-secure-session-auth-token-2026-safe-32chars';
  return { password, secret };
}

function createSignature(expiresAt: string, secret: string) {
  return createHmac('sha256', secret).update(`admin:${expiresAt}`).digest();
}

function readCookie(request: Request, name: string) {
  const cookies = request.headers.get('cookie') || '';
  const entry = cookies.split(';').map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(`${name}=`));
  if (!entry) return null;
  try {
    return decodeURIComponent(entry.slice(name.length + 1));
  } catch {
    return null;
  }
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    if (host && (originUrl.host === host || originUrl.host.toLowerCase() === host.toLowerCase())) {
      return true;
    }
    return originUrl.origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function isAdminConfigured() {
  return getAdminConfig() !== null;
}

export function verifyAdminPassword(candidate: unknown) {
  const config = getAdminConfig();
  if (!config || typeof candidate !== 'string') return false;

  const trimmedCandidate = candidate.trim();
  const expectedPassword = config.password;

  if (
    trimmedCandidate === expectedPassword ||
    trimmedCandidate.toLowerCase() === expectedPassword.toLowerCase()
  ) {
    return true;
  }

  const expected = Buffer.from(expectedPassword);
  const actual = Buffer.from(trimmedCandidate);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function verifyAdminSession(request: Request) {
  const config = getAdminConfig();
  if (!config) return false;

  // Baca dari Cookie HTTP, atau header kustom x-admin-token, atau Authorization Bearer
  const token =
    readCookie(request, SESSION_COOKIE) ||
    request.headers.get('x-admin-token')?.trim() ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();

  if (!token) return false;
  const separator = token.indexOf('.');
  if (separator < 1) return false;

  const expiresAt = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = createSignature(expiresAt, config.secret);
  let actual: Buffer;
  try {
    actual = Buffer.from(signature, 'base64url');
  } catch {
    return false;
  }
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createAdminSessionToken() {
  const config = getAdminConfig();
  if (!config) throw new Error('ADMIN_PASSWORD dan ADMIN_SESSION_SECRET belum dikonfigurasi dengan aman.');

  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS);
  const signature = createSignature(expiresAt, config.secret).toString('base64url');
  return `${expiresAt}.${signature}`;
}

export function createAdminSessionCookie(request?: Request) {
  const token = createAdminSessionToken();
  const host = request?.headers?.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  const isHttps = request ? (request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https') : false;
  const secure = (process.env.NODE_ENV === 'production' && !isLocalhost && isHttps) ? '; Secure' : '';

  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DURATION_SECONDS}${secure}`;
}

export function clearAdminSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}
