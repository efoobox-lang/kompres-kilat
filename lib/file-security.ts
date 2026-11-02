/**
 * Security & File Validation Suite (100% Client-Side)
 * - Validasi MIME type, ekstensi file, dan batas ukuran file
 * - Deteksi Magic Number (Header Signature) biner untuk mencegah file spoofing
 * - Helper pengunduhan aman dengan pembersihan memori otomatis (URL.revokeObjectURL)
 */

export interface FileValidationOptions {
  allowedExtensions?: string[];
  allowedMimeTypes?: string[];
  maxSizeBytes?: number; // default: 100MB
  checkMagicBytes?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Magic bytes signatures untuk tipe file umum
const MAGIC_SIGNATURES: Record<string, number[][]> = {
  pdf: [
    [0x25, 0x50, 0x44, 0x46, 0x2D], // %PDF-
  ],
  jpg: [
    [0xFF, 0xD8, 0xFF], // JPEG SOI
  ],
  jpeg: [
    [0xFF, 0xD8, 0xFF],
  ],
  png: [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // \x89PNG\r\n\x1a\n
  ],
  webp: [
    [0x52, 0x49, 0x46, 0x46], // RIFF (posisi 8-11 berisi WEBP)
  ],
  zip: [
    [0x50, 0x4B, 0x03, 0x04], // PK..
    [0x50, 0x4B, 0x05, 0x06], // PK.. (empty zip)
  ],
};

/**
 * Validasi ekstensi, MIME type, dan ukuran berkas
 */
export async function validateUploadedFile(
  file: File,
  options: FileValidationOptions = {}
): Promise<ValidationResult> {
  const {
    allowedExtensions = [],
    allowedMimeTypes = [],
    maxSizeBytes = 100 * 1024 * 1024, // 100 MB default
    checkMagicBytes = true,
  } = options;

  if (!file) {
    return { valid: false, error: 'Berkas tidak ditemukan atau belum dipilih.' };
  }

  // 1. Validasi Batas Ukuran File (Anti-OOM & Anti Denial-of-Service Browser)
  if (file.size <= 0) {
    return { valid: false, error: 'Berkas kosong (0 byte) tidak dapat diproses.' };
  }

  if (file.size > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `Ukuran berkas (${(file.size / (1024 * 1024)).toFixed(1)} MB) melebihi batas aman maksimal ${maxMb} MB.`,
    };
  }

  // 2. Validasi Ekstensi Berkas
  const fileName = file.name.toLowerCase();
  const fileExt = '.' + fileName.split('.').pop();

  if (allowedExtensions.length > 0) {
    const extMatched = allowedExtensions.some(
      (ext) => ext.toLowerCase() === fileExt || ext.toLowerCase() === fileExt.replace('.', '')
    );
    if (!extMatched) {
      return {
        valid: false,
        error: `Format berkas "${fileExt}" tidak diizinkan. Ekstensi yang diterima: ${allowedExtensions.join(', ')}.`,
      };
    }
  }

  // 3. Validasi MIME Type (jika browser menyediakan)
  if (allowedMimeTypes.length > 0 && file.type) {
    const mimeMatched = allowedMimeTypes.some(
      (mime) => mime.toLowerCase() === file.type.toLowerCase() || (mime.endsWith('/*') && file.type.startsWith(mime.replace('/*', '')))
    );
    if (!mimeMatched) {
      return {
        valid: false,
        error: `Tipe MIME berkas (${file.type}) tidak sesuai dengan kriteria yang diizinkan.`,
      };
    }
  }

  // 4. Pemeriksaan Magic Number (Header Biner Asli)
  if (checkMagicBytes) {
    const extKey = fileExt.replace('.', '');
    const signatures = MAGIC_SIGNATURES[extKey];

    if (signatures && signatures.length > 0) {
      try {
        const slice = file.slice(0, 16);
        const buffer = await slice.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        const isSignatureMatch = signatures.some((sig) => {
          if (bytes.length < sig.length) return false;
          for (let i = 0; i < sig.length; i++) {
            if (bytes[i] !== sig[i]) return false;
          }
          return true;
        });

        // Kasus khusus WebP: byte 0-3 adalah RIFF, byte 8-11 adalah WEBP
        if (extKey === 'webp' && bytes.length >= 12) {
          const isWebpHeader =
            bytes[8] === 0x57 && // W
            bytes[9] === 0x45 && // E
            bytes[10] === 0x42 && // B
            bytes[11] === 0x50; // P
          if (!isWebpHeader) {
            return {
              valid: false,
              error: 'Struktur header berkas tidak sesuai dengan spesifikasi WebP asli (kemungkinan file rusak atau salah ekstensi).',
            };
          }
        } else if (!isSignatureMatch) {
          return {
            valid: false,
            error: `Struktur biner berkas "${file.name}" tidak valid untuk format .${extKey}. Harap pilih berkas asli yang tidak korup.`,
          };
        }
      } catch (err) {
        console.warn('Gagal membaca magic bytes berkas:', err);
      }
    }
  }

  return { valid: true };
}

/**
 * Unduh Blob secara aman dan langsung bersihkan memori browser setelah selesai
 */
export function downloadBlobSafely(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  // Bersihkan DOM dan Object URL dari memori peramban
  setTimeout(() => {
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Load HTMLImageElement dari File secara aman dengan pembersihan URL otomatis
 */
export function loadImageSafely(file: File): Promise<{ img: HTMLImageElement; revoke: () => void }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      resolve({
        img,
        revoke: () => URL.revokeObjectURL(objectUrl),
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal memproses gambar. Berkas mungkin bukan format citra yang valid atau telah rusak.'));
    };

    img.src = objectUrl;
  });
}

