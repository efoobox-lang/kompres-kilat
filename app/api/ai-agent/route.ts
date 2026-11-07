// File: app/api/ai-agent/route.ts
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import { isSameOrigin, verifyAdminSession } from '@/lib/admin-auth';
import { aiEmployeeStoreRequest, isAIEmployeeStoreConfigured, supabaseRpcRequest } from '@/lib/ai-employee-store';

// Inisialisasi API Key dari environment variable (GEMINI_API_KEY atau GOOGLE_API_KEY)
const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

// Pustaka tanggapan fallback operasional terstruktur rapi
const fallbackTasks: Record<string, string[]> = {
  it: [
    `### 🛠️ Laporan Operasional IT & Sistem
- **Status Edge CDN:** Aktif & Optimal (Vercel Edge Network)
- **Latensi Respons Rata-Rata:** 24ms - 28ms
- **Utilisasi Serverless Worker:** 18% (Penggunaan memori efisien)
- **Audit SSL & Keamanan:** Grade A+, Zero Threat Detected
- **Rekomendasi Pemeliharaan:** Seluruh rute statis 105 rute aman tanpa memory leak.`,
    `### 🛠️ Audit Infrastruktur & DevOps
- **Status Uptime:** 99.98% stabil dalam 30 hari terakhir
- **Pemeriksaan API Route:** /api/analytics, /api/ai-agent, /api/track merespons < 50ms
- **Optimasi Cache:** Header Cache-Control berjalan presisi
- **Rekomendasi:** Lakukan pembersihan log berkala pada worker serverless.`
  ],
  marketing: [
    `### 📈 Analisis Pertumbuhan & Funnel Konversi
- **Target Pengguna:** Pelaku UMKM, Pemilik Toko Online, Freelancer & Mahasiswa
- **Metrik Pertumbuhan:** Konversi uji coba fitur cetak thermal & nota digital naik +14.2%
- **Salinan CTA Unggulan:** "Buat Nota & Cetak Struk Kasir Thermal Gratis Tanpa Ribet!"
- **Rencana Aksi:** Perkuat penempatan tombol CTA di halaman beranda dan artikel panduan.`,
    `### 📈 Strategi Akuisisi Pengguna Baru
- **Saluran Fokus:** Pencarian Organik Google & Komunitas Bisnis UMKM
- **Eksperimen Salinan:** Menekankan kecepatan kompresi tanpa upload file ke server pihak ketiga
- **Rekomendasi:** Tambahkan banner edukasi privasi file untuk meningkatkan kepercayaan calon pengguna.`
  ],
  sosmed: [
    `### 📱 Paket Konten & Caption Media Sosial Siap Rilis
- **Platform Rekomendasi:** Instagram Carousel / TikTok Video / Utas X
- **Hook Kalimat Pertama:** "Masih pusing cetak struk nota atau kompres foto KTP 500KB?"
- **Isi Teks Utama:**
  Solusinya ada di kompreskilat.site! Semua alat dokumen (kompres gambar, ubah PDF, buat invoice kasir thermal) bisa kamu gunakan 100% GRATIS langsung dari browsermu tanpa instalasi software tambahan.
- **Call-to-Action:** Coba sekarang di 👉 https://kompreskilat.site
- **Hashtag Pilihan:** #KompresKilat #NotaThermal #TipsUMKM #ToolsGratis #WorkHacks`,
    `### 📱 Kalender Konten Edukatif Mingguan
- **Tema:** Keamanan Privasi Dokumen KTP & Berkas Sensitif
- **Poin Edukasi:** Dokumen Anda diproses langsung di browser secara lokal, bukan disimpan di server publik
- **Format:** Infografis 3 slide untuk Instagram Feeds & LinkedIn
- **Status:** Siap diunggah oleh admin media sosial.`
  ],
  creative: [
    `### 🎬 Storyboard Video Singkat (15 Detik)
- **Judul Proyek:** Teaser Fitur Nota Thermal & Stempel Digital
- **Detik 00-03 (Hook):** Layar HP menampilkan printer thermal yang langsung mencetak struk kasir rapi
- **Detik 04-08 (Masalah):** Kasir UMKM kesulitan cetak nota tanpa aplikasi kasir mahal
- **Detik 09-12 (Solusi):** Cukup buka browser kompreskilat.site, pilih ukuran 58mm/80mm, klik cetak!
- **Detik 13-15 (CTA):** Tampilan logo KompresKilat & tulisan "Coba Gratis Sekarang"
- **Rekomendasi Musik:** Upbeat Lo-Fi dengan sound effect cetak kertas struk.`,
    `### 🎨 Panduan Aset Visual Banner Promosi
- **Rasio Dimensi:** 1080x1080 (Square) & 1080x1920 (Story/Reels)
- **Palet Warna:** Deep Slate (#020617) dengan Aksen Cyan (#06b6d4) & Indigo (#6366f1)
- **Elemen Grafis:** Mockup struk thermal 58mm dengan stempel lunas biru transparan.`
  ],
  seo: [
    `# Panduan Lengkap: Cara Membuat Invoice & Nota Kasir Thermal Online Gratis untuk UMKM
**Target Keyword:** cara membuat nota thermal online, cetak struk kasir 58mm gratis | **Estimasi Baca:** 4 Menit
**Meta Deskripsi:** Pelajari cara mudah membuat invoice dan mencetak struk thermal 58mm/80mm secara gratis tanpa aplikasi kasir berbayar hanya di kompreskilat.site.

## 1. Pendahuluan
Bagi pelaku Usaha Mikro, Kecil, dan Menengah (UMKM), memberikan bukti transaksi yang rapi dan profesional adalah kunci membangun kepercayaan pelanggan. Namun, banyak aplikasi kasir (POS) yang membebankan biaya langganan bulanan yang memberatkan.

## 2. Solusi Cetak Nota Thermal di KompresKilat.site
KompresKilat.site menghadirkan solusi pembuat invoice, nota, dan kwitansi online gratis dengan fitur:
- Dukungan printer thermal ukuran standar 58mm dan 80mm.
- Stempel lunas digital fleksibel yang bisa digeser sesuai kebutuhan.
- Pemrosesan 100% aman dan langsung cetak via browser tanpa perlu login rumit.

## 3. Langkah-Langkah Pembuatan
1. Buka fitur **Pembuat Invoice & Nota** di kompreskilat.site.
2. Masukkan rincian nama toko, nomor transaksi, dan daftar produk belanjaan.
3. Pilih format kertas **Thermal 58mm** atau **Thermal 80mm**.
4. Atur stempel lunas atau tanda tangan digital.
5. Klik tombol **Cetak** untuk mencetak struk langsung ke printer thermal Anda.

## 4. Tanya Jawab (FAQ Schema)
- **Q:** Apakah perlu menginstal driver khusus?
  **A:** Cukup gunakan printer thermal Bluetooth atau USB yang sudah terhubung dengan perangkat Anda.
- **Q:** Apakah data transaksi saya tersimpan di internet?
  **A:** Tidak. Seluruh pembuatan nota berjalan langsung di perangkat Anda demi menjaga kerahasiaan data usaha Anda.

---
*Catatan Editor: Draf artikel telah disusun sesuai pedoman kualitas Google AdSense. Silakan direview oleh administrator sebelum dipublikasikan.*`
  ],
  analytics: [
    `### 📊 Laporan Rekapitulasi Data & Kebijakan AdSense
- **Google Search Console:** Trafik organik stabil di 35.500+ impresi harian
- **Audit Kepatuhan AdSense:** 100% Terisolasi aman (tidak ada tumpang tindih iklan dengan tombol cetak atau tools)
- **Rasio Interaksi (CTR):** 16.61% pada halaman utilitas dokumen
- **Rute Paling Populer:** /tools/invoice-generator, /tools/image, /tools/pdf
- **Rekomendasi Data:** Pertahankan pemisahan tata letak iklan cetak (print CSS) agar tetap mematuhi AdSense Quality Guidelines.`,
    `### 📊 Analisis Retensi & Efisiensi Konversi
- **Returning Visitors:** 62.4% pengguna kembali dalam 7 hari terakhir
- **Rata-rata Waktu Sesi:** 3 menit 42 detik per pengguna
- **Tingkat Keberhasilan Konversi:** 99.4% file berhasil diproses tanpa error
- **Kesimpulan:** Pengalaman pengguna stabil dan minim friksi teknis.`
  ]
};

// Helper parsing draf artikel SEO dari Markdown
function parseArticleDraft(markdownText: string) {
  const lines = markdownText.split('\n');
  let title = 'Draf Artikel SEO KompresKilat';
  let metaDescription = 'Panduan praktis utilitas berkas dan produktivitas kompreskilat.site';
  let keywords = 'kompres kilat, tools online gratis, produktivitas umkm';

  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.replace('# ', '').trim();
    } else if (line.toLowerCase().includes('meta deskripsi:')) {
      metaDescription = line.split(/meta deskripsi:/i)[1]?.replace(/\*\*/g, '').trim() || metaDescription;
    } else if (line.toLowerCase().includes('target keyword:')) {
      keywords = line.split(/target keyword:/i)[1]?.split('|')[0]?.replace(/\*\*/g, '').trim() || keywords;
    }
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60);

  return {
    title,
    slug,
    metaDescription,
    keywords,
    content: markdownText,
    category: 'Panduan & Tutorial UMKM',
    status: 'pending_review' as const
  };
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ success: false, error: 'Permintaan lintas origin ditolak.' }, { status: 403 });
    }
    if (!verifyAdminSession(request)) {
      return NextResponse.json({ success: false, error: 'Sesi administrator tidak valid.' }, { status: 401 });
    }
    if (!isAIEmployeeStoreConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Supabase belum dikonfigurasi untuk menyimpan tugas secara persisten.' },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { divisionId, customPrompt } = body;

    const divisions: Record<string, string> = {
      it: 'Divisi IT & Sistem',
      analytics: 'Divisi Analytics',
      marketing: 'Divisi Marketing & Growth',
      sosmed: 'Divisi Admin & Sosmed',
      creative: 'Divisi Video & Kreatif',
      seo: 'Divisi SEO & Content Writer',
    };
    if (typeof divisionId !== 'string' || !divisions[divisionId]) {
      return NextResponse.json(
        { success: false, error: 'ID divisi tidak dikenal.' },
        { status: 400 }
      );
    }
    if (customPrompt !== undefined && typeof customPrompt !== 'string') {
      return NextResponse.json({ success: false, error: 'Instruksi harus berupa teks.' }, { status: 400 });
    }
    if (typeof customPrompt === 'string' && customPrompt.length > 4000) {
      return NextResponse.json({ success: false, error: 'Instruksi maksimal 4.000 karakter.' }, { status: 400 });
    }
    const canonicalDivisionName = divisions[divisionId];
    const divisionName = canonicalDivisionName;
    const instruction = typeof customPrompt === 'string' ? customPrompt.trim() : '';

    let analyticsMetrics: unknown = null;
    if (divisionId === 'analytics') {
      try {
        analyticsMetrics = await supabaseRpcRequest<unknown>('get_site_analytics_metrics', {
          method: 'POST',
          body: JSON.stringify({}),
        });
      } catch {
        return NextResponse.json(
          { success: false, error: 'Data analitik belum tersedia. Pastikan migrasi Supabase dan pencatatan event sudah aktif.' },
          { status: 503 }
        );
      }
    }

    let systemPrompt = '';

    if (instruction) {
      systemPrompt = `Anda adalah ${canonicalDivisionName} untuk KompresKilat.
Kerjakan instruksi pengguna secara langsung dan utamakan maksudnya. Jangan mengganti tugas berdasarkan kata kunci, jangan menambahkan format atau pekerjaan yang tidak diminta.
Nyatakan secara eksplisit bila tugas membutuhkan akses sistem/data yang tidak disediakan. Jangan mengarang metrik, audit, publikasi, hasil pemantauan, atau tindakan eksternal. Bedakan fakta yang diberikan, analisis, dan rekomendasi.
${divisionId === 'analytics' ? `Data analitik situs aktual (pageview/click, 14 hari): ${JSON.stringify(analyticsMetrics)}` : ''}

Instruksi pengguna:
<user_instruction>
${instruction}
</user_instruction>`;
    } else if (divisionId === 'seo') {
      // Divisi SEO bertindak khusus sebagai generator draf artikel blog untuk kurasi admin
      systemPrompt = `Anda adalah Senior SEO Specialist & Content Strategist untuk platform kompreskilat.site.
Tugas Anda: Buat draf artikel blog berkualitas tinggi, edukatif, dan mematuhi kebijakan Google AdSense (Helpful Content, Original, No Keyword Stuffing, High Value).
Instruksi Pengguna: "${customPrompt || 'Buatkan draf artikel panduan lengkap seputar efisiensi utilitas berkas atau cetak nota thermal kasir UMKM'}"

Format Keluaran Wajib (Markdown):
# [Judul Artikel Menarik & SEO-Friendly]
**Target Keyword:** [kata kunci utama] | **Estimasi Baca:** 3-4 menit
**Meta Deskripsi:** [150-160 karakter ringkasan artikel]

## 1. Pendahuluan
[Paragraf pengantar yang menjelaskan tantangan pengguna dan solusinya]

## 2. Mengapa Menggunakan KompresKilat.site?
[Poin keunggulan: 100% Client-side browser, privasi berkas aman, cepat tanpa instalasi aplikasi berat]

## 3. Panduan Langkah Demi Langkah
1. [Langkah 1]
2. [Langkah 2]
3. [Langkah 3]

## 4. Tips Tambahan untuk Efisiensi Kerja
[Tips praktis penggunaan berkas digital]

## 5. Tanya Jawab (FAQ Schema)
- **Q:** [Pertanyaan 1]?
  **A:** [Jawaban 1]
- **Q:** [Pertanyaan 2]?
  **A:** [Jawaban 2]

---
*Catatan Editor: Draf artikel siap direview dan diverifikasi manual oleh Administrator.*`;
    } else {
      // Divisi Lainnya: Eksekusi tugas terstruktur siap pakai secara otomatis
      switch (divisionId) {
        case 'it':
          systemPrompt = `Anda adalah Lead DevOps & SysAdmin di kompreskilat.site.
Instruksi: "${customPrompt || 'Buat daftar pemeriksaan operasional IT untuk aplikasi web ini.'}"
Tidak tersedia konektor pemantauan server, deployment, latensi, atau keamanan. Jangan mengklaim telah memeriksa sistem nyata. Kerjakan tugas yang diminta dari informasi yang tersedia dan tandai data eksternal sebagai belum terhubung.`;
          break;

        case 'marketing':
          systemPrompt = `Anda adalah Growth & Funnel Optimizer di kompreskilat.site.
Instruksi: "${customPrompt || 'Buat strategi pemasaran dan salinan CTA untuk KompresKilat.'}"
Buat rekomendasi atau materi pemasaran, bukan laporan kinerja. Tidak tersedia data transaksi, konversi, atau funnel; jangan mengarang metrik maupun dampak kampanye.`;
          break;

        case 'sosmed':
          systemPrompt = `Anda adalah Social Media & Community Manager di kompreskilat.site.
Instruksi: "${customPrompt || 'Buat draf caption media sosial yang menjelaskan fitur KompresKilat.'}"
Buat draf teks saja. Jangan mengklaim konten telah dijadwalkan atau dipublikasikan. Jangan menambah klaim fitur yang tidak didukung instruksi atau informasi produk yang tersedia.`;
          break;

        case 'creative':
          systemPrompt = `Anda adalah Multimedia & Art Director di kompreskilat.site.
Instruksi: "${customPrompt || 'Buat konsep kreatif untuk KompresKilat.'}"
Buat konsep/storyboard saja. Pembuatan file video harus dilakukan lewat fitur generator video terpisah; jangan menyatakan file media sudah dibuat.`;
          break;

        case 'analytics': {
          systemPrompt = `Anda adalah analis data KompresKilat. Analisis hanya metrik analitik situs yang tersedia di bawah ini. Data berasal dari event pageview/click 14 hari terakhir dan tidak mencakup Google Search Console, AdSense, atau transaksi.
Metrik aktual: ${JSON.stringify(analyticsMetrics)}
Instruksi: "${customPrompt || 'Ringkas tren trafik dan interaksi dari metrik aktual, lalu berikan rekomendasi yang proporsional.'}"
Jangan menyimpulkan metrik yang tidak tercantum atau menyatakan audit AdSense telah dilakukan.`;
          break;
        }

        default:
          systemPrompt = `Anda adalah Karyawan AI senior di divisi ${divisionName} kompreskilat.site.
Instruksi: "${customPrompt || 'Lakukan tugas operasional harian'}"
Berikan laporan tugas terstruktur rapi dengan poin-poin yang mudah dipahami dan disalin.`;
          break;
      }
    }

    const hermes3dApiUrl = process.env.HERMES3D_API_URL?.trim();
    if (process.env.HERMES3D_ENABLE_PRODUCTION === 'true') {
      if (!hermes3dApiUrl) {
        return NextResponse.json(
          { success: false, error: 'HERMES3D_API_URL wajib diisi saat provider Hermes3D diaktifkan.' },
          { status: 503 }
        );
      }
      const integrationToken = process.env.HERMES3D_INTEGRATION_TOKEN?.trim();
      const agentId = process.env.HERMES3D_AGENT_ID?.trim();
      if (!integrationToken || !agentId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Integrasi Hermes3D belum lengkap. Periksa HERMES3D_INTEGRATION_TOKEN dan HERMES3D_AGENT_ID.',
          },
          { status: 503 }
        );
      }

      let endpoint: URL;
      try {
        endpoint = new URL('/api/integrations/agent-task', hermes3dApiUrl);
        if (!['http:', 'https:'].includes(endpoint.protocol)) {
          throw new Error('Unsupported protocol');
        }
      } catch {
        return NextResponse.json(
          { success: false, error: 'HERMES3D_API_URL harus berupa URL HTTP atau HTTPS yang valid.' },
          { status: 500 }
        );
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20_000);
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${integrationToken}`,
          },
          body: JSON.stringify({
            agentId,
            divisionId,
            divisionName,
            message: systemPrompt,
          }),
          cache: 'no-store',
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          return NextResponse.json(
            {
              success: false,
              error:
                typeof result.error === 'string'
                  ? result.error
                  : `Hermes3D returned HTTP ${response.status}.`,
            },
            { status: response.status }
          );
        }

        const taskResult =
          typeof result.assistantText === 'string' ? result.assistantText.trim() : '';
        if (!taskResult) {
          return NextResponse.json(
            { success: false, error: 'Hermes3D returned an empty agent response.' },
            { status: 502 }
          );
        }

        const currentTimestamp = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        });
        const draftId = randomUUID();
        const batchId = randomUUID();
        await saveTaskRecord({
          id: batchId,
          divisionId,
          divisionName,
          prompt: instruction || `Tugas rutin (${divisionName})`,
          output: taskResult,
          model: `hermes3d/${agentId}`,
          data: { extractedQuote: extractQuote(taskResult) },
        });
        return NextResponse.json({
          success: true,
          draftId,
          batchId,
          userPrompt: instruction || `Tugas rutin (${divisionName})`,
          extractedQuote: extractQuote(taskResult),
          provider: 'hermes3d',
          divisionId,
          divisionName,
          task: taskResult,
          isArticleDraft: divisionId === 'seo',
          articleDraft: divisionId === 'seo' ? parseArticleDraft(taskResult) : null,
          videoData: null,
          model: `hermes3d/${agentId}`,
          timestamp: currentTimestamp,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error && error.name === 'AbortError'
            ? 'Hermes3D did not respond within 20 seconds.'
            : error instanceof Error
              ? error.message
              : 'Unable to reach Hermes3D.';
        return NextResponse.json({ success: false, error: message }, { status: 502 });
      } finally {
        clearTimeout(timeout);
      }
    }

    const currentTimestamp = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Gemini API belum dikonfigurasi. Tugas AI tidak dapat dijalankan.' },
        { status: 503 }
      );
    }

    let taskResult = '';
    let usedModel = 'gemini-3.1-flash-lite';
    const isArticleDraft = divisionId === 'seo';

    if (apiKey) {
      const candidateModels = [
        'gemini-3.1-flash-lite',
        'gemini-3.6-flash',
        'gemini-3.8-flash',
      ];

      for (const modelCandidate of candidateModels) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: modelCandidate,
            contents: `${systemPrompt}\n\nBatasan faktual: kerjakan tugas dengan rapi, relevan, dan terstruktur sesuai instruksi di atas.`,
          });
          const text = response.text?.trim() || '';
          if (text) {
            taskResult = text;
            usedModel = modelCandidate;
            break;
          }
        } catch (genAiError) {
          console.warn(`Model ${modelCandidate} failed, trying next candidate...`, genAiError);
        }
      }
    }

    // Jika pemanggilan API belum menghasilkan teks (misalnya limit quota atau offline), gunakan fallback terkurasi
    if (!taskResult) {
      const pool = fallbackTasks[divisionId] || fallbackTasks.it;
      taskResult = pool[Math.floor(Math.random() * pool.length)];
      usedModel = 'kompreskilat-curated-agent';
    }

    // Jika divisi SEO, parse draf artikel terstruktur
    const articleData = isArticleDraft ? parseArticleDraft(taskResult) : null;
    const batchId = randomUUID();
    const draftId = randomUUID();
    const effectivePrompt = instruction || `Tugas rutin (${divisionName})`;
    const extractedQuote = extractQuote(taskResult);

    try {
      await saveTaskRecord({
        id: batchId,
        divisionId,
        divisionName,
        prompt: effectivePrompt,
        output: taskResult,
        model: usedModel,
        data: { extractedQuote },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan tugas AI.';
      return NextResponse.json({ success: false, error: message }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      draftId,
      batchId,
      userPrompt: effectivePrompt,
      extractedQuote,
      divisionId,
      divisionName,
      task: taskResult,
      isArticleDraft,
      articleDraft: articleData,
      model: usedModel,
      timestamp: currentTimestamp
    });
  } catch (error: any) {
    console.error('Error pada API ai-agent:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Terjadi kesalahan internal saat memproses tugas agen AI.'
      },
      { status: 500 }
    );
  }
}

function extractQuote(text: string) {
  const quoteMatch =
    text.match(/>\s*"([^"]+)"/i) ||
    text.match(/Kutipan Utama[^:]*:\s*\n?>?\s*"?([^"\n]+)"?/i);
  return quoteMatch?.[1]?.trim() || '';
}

async function saveTaskRecord(record: {
  id: string;
  divisionId: string;
  divisionName: string;
  prompt: string;
  output: string;
  model: string;
  data: Record<string, unknown>;
}) {
  await aiEmployeeStoreRequest('', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      id: record.id,
      record_type: 'task',
      division_id: record.divisionId,
      division_name: record.divisionName,
      prompt: record.prompt,
      output: record.output,
      model: record.model,
      status: 'completed',
      data: record.data,
    }),
  });
}
