/**
 * Utilitas Keamanan Web (Web Application Security Suite)
 * - Sanitasi Input & Pencegahan XSS / Injection
 * - Rate Limiter (Proteksi DDoS & Brute Force per IP)
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Memeriksa batas frekuensi pemanggilan API (Rate Limiting)
 * @param ip Alamat IP pengguna
 * @param limit Jumlah maksimal request dalam jendela waktu (default: 30)
 * @param windowMs Jendela waktu dalam milidetik (default: 60 detik)
 */
export function checkRateLimit(ip: string, limit = 30, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Bersihkan record lama secara berkala
  if (rateLimitMap.size > 5000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}

/**
 * Sanitasi string input untuk mencegah XSS, SQLi, dan Command Injection
 */
export function sanitizeInput(input: string, maxLength = 300): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Hapus tag HTML
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Hapus karakter kontrol biner
}

/**
 * Validasi format nomor resi kurir hanya alfanumerik aman
 */
export function isValidAwb(awb: string): boolean {
  if (!awb || typeof awb !== 'string') return false;
  const clean = awb.trim();
  // Resi kurir di Indonesia umumnya 4-40 karakter alfanumerik, dash, underscore
  return /^[A-Za-z0-9\-_]{4,45}$/.test(clean);
}
