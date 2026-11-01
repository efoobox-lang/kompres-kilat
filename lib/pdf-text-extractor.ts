/**
 * Client-Side PDF Text Extractor Helper
 * Menggunakan pdfjs-dist untuk ekstraksi lapisan teks native dengan rekonstruksi spasial baris & kata,
 * dilengkapi fallback OCR (Tesseract.js) untuk PDF pindaian/gambar murni.
 * 100% Client-Side di memori browser pengguna.
 */

export interface ExtractedPdfPage {
  pageNumber: number;
  text: string;
  charCount: number;
  isScanned: boolean;
}

export interface PdfExtractionResult {
  success: boolean;
  text: string;
  pageCount: number;
  pages: ExtractedPdfPage[];
  isScanned: boolean;
  isPasswordProtected: boolean;
  totalChars: number;
  totalWords: number;
  error?: string;
}

export interface ExtractPdfOptions {
  enableOcrFallback?: boolean;
  ocrLanguages?: string;
  maxPages?: number;
  onProgress?: (progress: { stage: string; percent: number; currentPage?: number; totalPages?: number }) => void;
}

/**
 * Load pdfjs-dist legacy build with local worker to prevent cross-origin issues
 */
export async function loadPdfJs() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }
  return pdfjs;
}

interface RawTextItem {
  str?: string;
  transform?: number[];
  width?: number;
  height?: number;
}

interface RawTextContent {
  items?: RawTextItem[];
}

/**
 * Rekonstruksi spasial baris teks native PDF berdasarkan koordinat Y (atas-ke-bawah) dan X (kiri-ke-kanan)
 */
export function reconstructNativePageText(textContent: RawTextContent | null | undefined): string {
  if (!textContent || !textContent.items || textContent.items.length === 0) {
    return '';
  }

  interface TextItemPos {
    str: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }

  const items: TextItemPos[] = [];
  for (const item of textContent.items) {
    if (item && typeof item.str === 'string' && item.str.length > 0) {
      items.push({
        str: item.str,
        x: item.transform ? item.transform[4] : 0,
        y: item.transform ? item.transform[5] : 0,
        width: item.width || 0,
        height: item.height || 0,
      });
    }
  }

  if (items.length === 0) return '';

  // Urutkan item: Y menurun (atas ke bawah halaman), X menaik (kiri ke kanan)
  items.sort((a, b) => {
    if (Math.abs(b.y - a.y) > 3.5) {
      return b.y - a.y;
    }
    return a.x - b.x;
  });

  const lines: string[] = [];
  let currentLine = '';
  let lastY: number | null = null;
  let lastX = 0;

  for (const item of items) {
    if (lastY === null) {
      currentLine = item.str;
      lastY = item.y;
      lastX = item.x + item.width;
    } else if (Math.abs(item.y - lastY) > 3.5) {
      // Pindah ke baris baru
      lines.push(currentLine.trimEnd());
      currentLine = item.str;
      lastY = item.y;
      lastX = item.x + item.width;
    } else {
      // Masih pada baris yang sama: hitung jarak horizontal
      const gap = item.x - lastX;
      if (gap > 2 && !currentLine.endsWith(' ') && !item.str.startsWith(' ')) {
        currentLine += ' ' + item.str;
      } else {
        currentLine += item.str;
      }
      lastX = item.x + item.width;
    }
  }

  if (currentLine.trim().length > 0) {
    lines.push(currentLine.trimEnd());
  }

  return lines.join('\n');
}

/**
 * Validasi apakah teks hasil ekstraksi merupakan teks bermakna atau hanya noise/kosong
 */
export function validateReadableText(text: string): { isValid: boolean; letterRatio: number; charCount: number } {
  const trimmed = text.trim();
  const charCount = trimmed.length;
  if (charCount < 30) {
    return { isValid: false, letterRatio: 0, charCount };
  }

  const letters = (trimmed.match(/[a-zA-Z0-9]/g) || []).length;
  const letterRatio = letters / charCount;

  // Setidaknya 35% karakter harus alfanumerik yang valid
  const isValid = letterRatio >= 0.35;
  return { isValid, letterRatio, charCount };
}

interface PdfPageLike {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (renderContext: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<unknown> };
}

/**
 * Render halaman PDF ke elemen HTML Canvas beresolusi tinggi (2.0x scale) untuk OCR
 */
async function renderPageToCanvas(page: PdfPageLike, scale = 2.0): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  if (!context) {
    throw new Error('Gagal menginisialisasi 2D Canvas context');
  }

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;
  return canvas;
}

/**
 * Ekstraksi teks dari berkas PDF (File atau ArrayBuffer)
 */
export async function extractTextFromPdf(
  input: File | ArrayBuffer,
  options: ExtractPdfOptions = {}
): Promise<PdfExtractionResult> {
  const {
    enableOcrFallback = true,
    ocrLanguages = 'ind+eng',
    maxPages = 30,
    onProgress
  } = options;

  let arrayBuffer: ArrayBuffer;
  if (input instanceof File) {
    arrayBuffer = await input.arrayBuffer();
  } else {
    arrayBuffer = input;
  }

  onProgress?.({ stage: 'Memuat mesin pembaca PDF...', percent: 10 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pdfjs: any;
  try {
    pdfjs = await loadPdfJs();
  } catch (err: unknown) {
    const error = err as Error;
    return {
      success: false,
      text: '',
      pageCount: 0,
      pages: [],
      isScanned: false,
      isPasswordProtected: false,
      totalChars: 0,
      totalWords: 0,
      error: `Gagal memuat modul PDF parser: ${error?.message || 'Error'}`
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pdfDoc: any;
  try {
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    pdfDoc = await loadingTask.promise;
  } catch (err: unknown) {
    const error = err as Error;
    const errMsg = (error?.message || '').toLowerCase();
    const isPassword = error?.name === 'PasswordException' || errMsg.includes('password') || errMsg.includes('encrypted');
    return {
      success: false,
      text: '',
      pageCount: 0,
      pages: [],
      isScanned: false,
      isPasswordProtected: isPassword,
      totalChars: 0,
      totalWords: 0,
      error: isPassword
        ? 'Dokumen PDF ini diproteksi dengan kata sandi (password).'
        : `Gagal membaca struktur berkas PDF: ${error?.message || 'Format tidak valid'}`
    };
  }

  const totalPages = Math.min(pdfDoc.numPages, maxPages);
  const extractedPages: ExtractedPdfPage[] = [];
  let scannedPagesCount = 0;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const pageProgressBase = 15 + ((pageNum - 1) / totalPages) * 70;
    onProgress?.({
      stage: `Membaca lapisan teks Halaman ${pageNum} dari ${totalPages}...`,
      percent: Math.round(pageProgressBase),
      currentPage: pageNum,
      totalPages
    });

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    let pageText = reconstructNativePageText(textContent);

    const validation = validateReadableText(pageText);
    const isPageScanned = !validation.isValid;

    if (isPageScanned) {
      scannedPagesCount++;

      // Jika halaman scan dan OCR fallback diaktifkan
      if (enableOcrFallback) {
        onProgress?.({
          stage: `Menjalankan OCR pindaian gambar Halaman ${pageNum}...`,
          percent: Math.round(pageProgressBase + (70 / totalPages) * 0.5),
          currentPage: pageNum,
          totalPages
        });

        try {
          const canvas = await renderPageToCanvas(page, 2.0);
          const tesseract = await import('tesseract.js');
          const ocrResult = await tesseract.recognize(canvas, ocrLanguages, {
            logger: (m: { status?: string; progress?: number }) => {
              if (m && m.status === 'recognizing text' && typeof m.progress === 'number') {
                const subPercent = pageProgressBase + (70 / totalPages) * m.progress;
                onProgress?.({
                  stage: `OCR Halaman ${pageNum}: ${Math.round(m.progress * 100)}%...`,
                  percent: Math.round(subPercent),
                  currentPage: pageNum,
                  totalPages
                });
              }
            }
          });

          const recognizedText = (ocrResult.data && ocrResult.data.text) ? ocrResult.data.text.trim() : '';
          if (recognizedText.length > 0) {
            pageText = recognizedText;
          }
        } catch (ocrErr) {
          console.warn(`OCR fallback failed on page ${pageNum}:`, ocrErr);
        }
      }
    }

    extractedPages.push({
      pageNumber: pageNum,
      text: pageText,
      charCount: pageText.length,
      isScanned: isPageScanned
    });
  }

  onProgress?.({ stage: 'Selesai mengekstrak dokumen.', percent: 100 });

  // Gabungkan seluruh teks halaman
  const fullText = extractedPages
    .map((p) => p.text.trim())
    .filter((t) => t.length > 0)
    .join('\n\n');

  const totalChars = fullText.length;
  const totalWords = (fullText.match(/\S+/g) || []).length;
  const isDocumentScanned = scannedPagesCount > (totalPages / 2);

  return {
    success: true,
    text: fullText,
    pageCount: totalPages,
    pages: extractedPages,
    isScanned: isDocumentScanned,
    isPasswordProtected: false,
    totalChars,
    totalWords
  };
}

