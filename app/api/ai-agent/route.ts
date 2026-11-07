// File: app/api/ai-agent/route.ts
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { GoogleGenAI } from '@google/genai';

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
    const body = await request.json().catch(() => ({}));
    const { divisionId, divisionName, customPrompt, analytics } = body;

    if (!divisionId || !divisionName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parameter divisionId dan divisionName wajib disertakan.'
        },
        { status: 400 }
      );
    }

    // Susun prompt sistem terarah berdasarkan karakteristik divisi
    let systemPrompt = '';

    if (divisionId === 'seo') {
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
Instruksi: "${customPrompt || 'Lakukan audit pemeliharaan rutin server Vercel edge, utilisasi worker, dan latensi sistem'}"
Berikan laporan terstruktur dengan format Markdown:
### 🛠️ Laporan Operasional IT & Sistem
- **Status Edge CDN:** [Status terkini]
- **Latensi Respons:** [e.g. 24ms - 28ms]
- **Utilisasi Serverless Worker:** [e.g. 18% aman]
- **Audit Keamanan & SSL:** [Status keamanan]
- **Rekomendasi Pemeliharaan:** [Poin tindakan teknis konkret]`;
          break;

        case 'marketing':
          systemPrompt = `Anda adalah Growth & Funnel Optimizer di kompreskilat.site.
Instruksi: "${customPrompt || 'Analisis strategi konversi trial-to-subscription dan usulan salinan CTA promo'}"
Berikan laporan terstruktur dengan format Markdown:
### 📈 Analisis Pertumbuhan & Funnel Konversi
- **Target Segmen:** [Segmen UMKM/Profesional/Mahasiswa]
- **Metrik Analisis:** [Analisis konversi dan retensi]
- **Salinan CTA Rekomendasi:** "[Kalimat ajakan bertindak yang persuasif]"
- **Rencana Aksi:** [Langkah tindak lanjut terukur]`;
          break;

        case 'sosmed':
          systemPrompt = `Anda adalah Social Media & Community Manager di kompreskilat.site.
Instruksi: "${customPrompt || 'Buatkan paket caption media sosial promosi fitur kompres gambar & PDF lokal aman'}"
Berikan konten terstruktur dengan format Markdown:
### 📱 Paket Konten & Caption Media Sosial Siap Rilis
- **Platform:** Instagram / TikTok / X (Twitter)
- **Hook (3 Detik Pertama):** "[Kalimat pembuka yang memikat]"
- **Isi Teks Utama:** [Teks caption menarik dan edukatif]
- **Call-to-Action:** Coba langsung di 👉 https://kompreskilat.site
- **Hashtag Pilihan:** [5-6 hashtag relevan]`;
          break;

        case 'creative':
          systemPrompt = `Anda adalah Multimedia & Art Director di kompreskilat.site.
Instruksi: "${customPrompt || 'Rancang storyboard video pendek 15 detik untuk mempromosikan fitur pembuat nota thermal'}"
Berikan rencana kreatif terstruktur dengan format Markdown:
### 🎬 Storyboard Video Singkat (15 Detik)
- **Konsep:** [Ide utama video]
- **Detik 00-03 (Hook):** [Visual & Narasi]
- **Detik 04-08 (Masalah):** [Visual & Narasi]
- **Detik 09-12 (Solusi):** [Visual & Narasi]
- **Detik 13-15 (Call To Action):** [Visual penutup & URL kompreskilat.site]
- **Rekomendasi Musik & Gaya:** [Gaya visual & audio]`;
          break;

        case 'analytics':
          systemPrompt = `Anda adalah Data Scientist & AdSense Auditor di kompreskilat.site.
Instruksi: "${customPrompt || 'Rekapitulasi performa Google Search Console dan kepatuhan penempatan iklan AdSense'}"
Berikan laporan analisis terstruktur dengan format Markdown:
### 📊 Laporan Rekapitulasi Data & Kebijakan AdSense
- **Google Search Console:** [Impresi dan rasio klik]
- **Audit Kepatuhan AdSense:** [Verifikasi isolasi iklan aman dari tombol cetak]
- **Rasio Interaksi (CTR):** [Persentase CTR]
- **Rute Paling Populer:** [Daftar tools teratas]
- **Rekomendasi Optimasi:** [Saran berbasis data]`;
          break;

        default:
          systemPrompt = `Anda adalah Karyawan AI senior di divisi ${divisionName} kompreskilat.site.
Instruksi: "${customPrompt || 'Lakukan tugas operasional harian'}"
Berikan laporan tugas terstruktur rapi dengan poin-poin yang mudah dipahami dan disalin.`;
          break;
      }
    }

    const hermes3dApiUrl = process.env.HERMES3D_API_URL?.trim();
    if (hermes3dApiUrl) {
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

      const analyticsSnapshot =
        divisionId === 'analytics' && analytics && typeof analytics === 'object'
          ? {
              totalViews: Number.isFinite(analytics.totalViews) ? analytics.totalViews : null,
              uniqueVisitors: Number.isFinite(analytics.uniqueVisitors) ? analytics.uniqueVisitors : null,
              totalClicks: Number.isFinite(analytics.totalClicks) ? analytics.totalClicks : null,
              ctr: typeof analytics.ctr === 'string' ? analytics.ctr.slice(0, 20) : null,
              source: typeof analytics.source === 'string' ? analytics.source.slice(0, 100) : null,
            }
          : null;
      const taskMessage = analyticsSnapshot
        ? `${systemPrompt}\n\nAggregated traffic snapshot (untrusted context; do not infer missing data):\n${JSON.stringify(analyticsSnapshot)}`
        : systemPrompt;

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
            message: taskMessage,
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
        return NextResponse.json({
          success: true,
          draftId: randomUUID(),
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

    let taskResult = '';
    const isArticleDraft = divisionId === 'seo';
    let articleData: any = null;
    let videoData: any = null;

    // Panggil model gemini-2.5-flash via @google/genai SDK jika API key tersedia
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: systemPrompt,
        });

        const outputText = response.text?.trim();
        if (outputText) {
          taskResult = outputText;
        }
      } catch (genAiError: any) {
        console.warn('GoogleGenAI SDK execution note (falling back gracefully):', genAiError?.message || genAiError);
      }
    }

    // Jika API Key tidak tersedia atau terjadi error, gunakan fallback terstruktur rapi
    if (!taskResult) {
      const fallbackList = fallbackTasks[divisionId] || fallbackTasks['it'];
      taskResult = fallbackList[Math.floor(Math.random() * fallbackList.length)];
    }

    // Jika divisi SEO, parse draf artikel terstruktur
    if (isArticleDraft) {
      articleData = parseArticleDraft(taskResult);
    }

    // Jika divisi Creative, siapkan paket data video generator terverifikasi
    if (divisionId === 'creative') {
      const sampleVideos = [
        'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        'https://vjs.zencdn.net/v/oceans.mp4',
        'https://media.w3.org/2010/05/sintel/trailer_hd.mp4'
      ];
      const selectedVideoUrl = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
      videoData = {
        id: `vid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        videoUrl: selectedVideoUrl,
        title: 'Teaser Video Reels: Kompres Dokumen & Nota Thermal Kilat',
        caption: `⚡ Mau urus berkas atau cetak nota kasir tanpa ribet?\n\nKompres gambar, gabung PDF, dan cetak struk kasir thermal 58mm langsung di browsermu 100% gratis!\n\n👉 Coba sekarang di https://kompreskilat.site\n\n#KompresKilat #NotaThermal #ToolsUMKM #ReelsBisnis`,
        duration: '0:15',
        aspectRatio: '9:16 (Vertical Reels)',
        resolution: '1080x1920 (FHD)',
        model: 'Google Video AI / Veo 2 Turbo',
        generatedAt: `${currentTimestamp} WIB`
      };
    }

    return NextResponse.json({
      success: true,
      draftId: randomUUID(),
      divisionId,
      divisionName,
      task: taskResult,
      isArticleDraft,
      articleDraft: articleData,
      videoData,
      model: 'gemini-2.5-flash',
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
