import { NextRequest, NextResponse } from 'next/server';
import zlib from 'zlib';
import AdmZip from 'adm-zip';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ZipCrypto = require('adm-zip/methods/zipcrypto');

// CRC32 table for ZipCrypto checksums
const crctable = new Uint32Array(256).map((t, crc) => {
  for (let j = 0; j < 8; j++) {
    crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return crc >>> 0;
});

function getCrc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crctable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipFileInput {
  name: string;
  data: Buffer;
}

export function buildZipArchive(files: ZipFileInput[], password?: string): Buffer {
  if (!password || password.trim().length === 0) {
    const zip = new AdmZip();
    for (const f of files) {
      zip.addFile(f.name, f.data);
    }
    return zip.toBuffer();
  }

  const localHeaders: Buffer[] = [];
  const cdHeaders: Buffer[] = [];
  let offset = 0;

  const now = new Date();
  const time = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
  const date = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

  for (const f of files) {
    const rawBuf = f.data;
    const crc = getCrc32(rawBuf);
    const nameBuf = Buffer.from(f.name, 'utf8');

    // Deflate raw stream
    const deflated = zlib.deflateRawSync(rawBuf);

    // Encrypt deflated payload with ZipCrypto
    const encrypted = ZipCrypto.encrypt(deflated, { crc }, password);

    // Local File Header (PK\x03\x04)
    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // Signature
    localHeader.writeUInt16LE(20, 4); // Version needed to extract (2.0)
    localHeader.writeUInt16LE(1, 6); // Flags: bit 0 = encrypted
    localHeader.writeUInt16LE(8, 8); // Compression method: Deflate
    localHeader.writeUInt16LE(time, 10);
    localHeader.writeUInt16LE(date, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(encrypted.length, 18); // Compressed size (includes 12-byte salt header)
    localHeader.writeUInt32LE(rawBuf.length, 22); // Uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // Extra field length
    nameBuf.copy(localHeader, 30);

    // Central Directory Header (PK\x01\x02)
    const cdHeader = Buffer.alloc(46 + nameBuf.length);
    cdHeader.writeUInt32LE(0x02014b50, 0); // Signature
    cdHeader.writeUInt16LE(20, 4); // Version made by
    cdHeader.writeUInt16LE(20, 6); // Version needed
    cdHeader.writeUInt16LE(1, 8); // Flags: encrypted
    cdHeader.writeUInt16LE(8, 10); // Deflate
    cdHeader.writeUInt16LE(time, 12);
    cdHeader.writeUInt16LE(date, 14);
    cdHeader.writeUInt32LE(crc, 16);
    cdHeader.writeUInt32LE(encrypted.length, 20);
    cdHeader.writeUInt32LE(rawBuf.length, 24);
    cdHeader.writeUInt16LE(nameBuf.length, 28);
    cdHeader.writeUInt16LE(0, 30); // Extra field length
    cdHeader.writeUInt16LE(0, 32); // Comment length
    cdHeader.writeUInt16LE(0, 34); // Disk number start
    cdHeader.writeUInt16LE(0, 36); // Internal file attributes
    cdHeader.writeUInt32LE(0, 38); // External file attributes
    cdHeader.writeUInt32LE(offset, 42); // Relative offset of local header
    nameBuf.copy(cdHeader, 46);

    localHeaders.push(Buffer.concat([localHeader, encrypted]));
    cdHeaders.push(cdHeader);

    offset += localHeader.length + encrypted.length;
  }

  const cdBuf = Buffer.concat(cdHeaders);

  // End of Central Directory Record (PK\x05\x06)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // Signature
  eocd.writeUInt16LE(0, 4); // Disk number
  eocd.writeUInt16LE(0, 6); // Disk with central directory
  eocd.writeUInt16LE(files.length, 8); // CD records on this disk
  eocd.writeUInt16LE(files.length, 10); // Total CD records
  eocd.writeUInt32LE(cdBuf.length, 12); // Size of central directory
  eocd.writeUInt32LE(offset, 16); // Offset of start of CD
  eocd.writeUInt16LE(0, 20); // ZIP comment length

  return Buffer.concat([...localHeaders, cdBuf, eocd]);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const action = formData.get('action') as string || 'protect';
    const password = (formData.get('password') as string || '').trim();

    // 1. ACTION: PROTECT (Buat & Kunci ZIP)
    if (action === 'protect') {
      const files = formData.getAll('files') as File[];
      if (!files || files.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Tidak ada file yang diunggah untuk dikompres.' },
          { status: 400 }
        );
      }

      const fileInputs: ZipFileInput[] = [];
      for (const file of files) {
        if (!file.name) continue;
        const arrayBuf = await file.arrayBuffer();
        fileInputs.push({
          name: file.name,
          data: Buffer.from(arrayBuf),
        });
      }

      if (fileInputs.length === 0) {
        return NextResponse.json(
          { success: false, error: 'File yang dipilih tidak valid.' },
          { status: 400 }
        );
      }

      const zipBuffer = buildZipArchive(fileInputs, password);
      const filename = password ? 'arsip-terproteksi.zip' : 'arsip-kompreskilat.zip';

      return new NextResponse(new Uint8Array(zipBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': zipBuffer.length.toString(),
        },
      });
    }

    // 2. ACTION: UNPROTECT (Buka Proteksi & Ekstrak Isi ZIP)
    if (action === 'unprotect') {
      const zipFile = formData.get('file') as File | null;
      if (!zipFile) {
        return NextResponse.json(
          { success: false, error: 'File arsip ZIP belum diunggah.' },
          { status: 400 }
        );
      }

      const arrayBuf = await zipFile.arrayBuffer();
      const zipBuffer = Buffer.from(arrayBuf);

      let zip: AdmZip;
      try {
        zip = new AdmZip(zipBuffer);
      } catch (err) {
        return NextResponse.json(
          { success: false, error: 'Format berkas rusak atau bukan arsip ZIP standar.' },
          { status: 400 }
        );
      }

      const entries = zip.getEntries();
      if (!entries || entries.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Arsip ZIP kosong (tidak memiliki file di dalamnya).' },
          { status: 400 }
        );
      }

      // Check if any entry is encrypted
      const hasEncryptedEntry = entries.some(e => !e.isDirectory && (e.header as any)?.encrypted);

      if (hasEncryptedEntry && !password) {
        return NextResponse.json(
          { success: false, error: 'Arsip ini terkunci oleh kata sandi. Harap masukkan kata sandi untuk membukanya.' },
          { status: 400 }
        );
      }

      if (hasEncryptedEntry) {
        const isValid = zip.test(password);
        if (!isValid) {
          return NextResponse.json(
            { success: false, error: 'Kata sandi salah! Berkas arsip tidak dapat didekripsi.' },
            { status: 400 }
          );
        }
      }

      const extractedFiles: Array<{
        name: string;
        size: number;
        dataBase64: string;
      }> = [];

      for (const entry of entries) {
        if (entry.isDirectory) continue;
        try {
          const entryData = entry.getData(password || undefined);
          if (entryData) {
            extractedFiles.push({
              name: entry.entryName,
              size: entryData.length,
              dataBase64: entryData.toString('base64'),
            });
          }
        } catch (decErr) {
          return NextResponse.json(
            { success: false, error: `Gagal mendekripsi berkas "${entry.entryName}". Pastikan kata sandi sudah tepat.` },
            { status: 400 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: `Berhasil mengekstrak ${extractedFiles.length} berkas dari arsip ZIP.`,
        files: extractedFiles,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Aksi tidak dikenal. Gunakan "protect" atau "unprotect".' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('ZIP API Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Terjadi kesalahan internal pada server saat memproses arsip.' },
      { status: 500 }
    );
  }
}
