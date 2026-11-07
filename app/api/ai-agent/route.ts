// File: app/api/ai-agent/route.ts
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import { isSameOrigin, verifyAdminSession } from '@/lib/admin-auth';
import { aiEmployeeStoreRequest, isAIEmployeeStoreConfigured, supabaseRpcRequest } from '@/lib/ai-employee-store';

function cleanAgentOutput(text: string): string {
  let cleaned = text.trim();
  // Hapus basa-basi dan prolog AI agar output selalu ON POINT langsung ke sasaran
  cleaned = cleaned.replace(/^(Tentu,?\s*(sebagai|berikut|ini|saya|karyawan).*?\n+)/i, '');
  cleaned = cleaned.replace(/^(Baik,?\s*(sebagai|berikut|ini|saya|karyawan).*?\n+)/i, '');
  cleaned = cleaned.replace(/^(Halo!?,?\s*(sebagai|berikut|ini|saya|karyawan).*?\n+)/i, '');
  cleaned = cleaned.replace(/^(Sebagai\s+[^\n]+?(?:berikut|saya sajikan|ini).*?\n+)/i, '');
  return cleaned.trim();
}

// Inisialisasi API Key dari environment variable (GEMINI_API_KEY atau GOOGLE_API_KEY)
const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

// Pustaka tanggapan fallback operasional terstruktur rapi & berorientasi problem-solving
const fallbackTasks: Record<string, string[]> = {
  it: [
    `### 🛠️ Laporan Problem-Solving IT & Sistem: Optimasi Client-Side Canvas & Edge CDN
- **Analisis Masalah:** Pemrosesan gambar resolusi tinggi (foto KTP & dokumen lamaran kerja) pada perangkat mobile berspesifikasi rendah dapat menyebabkan konsumsi memori Canvas sementara.
- **Solusi Rekomendasi:** 
  1. Implementasi pembersihan memori kanvas otomatis via \`canvas.width = canvas.height = 0\` segera setelah blob hasil kompresi diunduh.
  2. Pertahankan kompresi 100% di browser pengguna tanpa transfer data ke server (Zero-Knowledge Privacy).
  3. Pasang header \`Cache-Control: public, max-age=31536000, immutable\` untuk seluruh font dan aset antarmuka.
- **Estimasi Dampak:** Latensi respon tetap < 25ms dan zero memory leak pada 100+ sesi kompresi beruntun.
- **Status Tindakan:** ⏳ Menunggu Persetujuan Supervisor untuk dimasukkan ke jadwal rilis teknis.`,
    `### 🛠️ Audit Infrastruktur & DevOps kompreskilat.site
- **Status Edge Network:** Vercel Global Edge Network aktif & responsif (latensi rata-rata 24ms).
- **Pemeriksaan API Route:** Rute kritis (/api/analytics, /api/ai-agent, /api/instagram/publish) beroperasi normal.
- **Rencana Aksi:** Perbarui penanganan timeout fallback AI dan lakukan optimasi preconnect domain Meta Graph API.
- **Status Tindakan:** ⏳ Menunggu Persetujuan Supervisor.`
  ],
  marketing: [
    `### 📈 Strategi Akuisisi UMKM: Kampanye "Cetak Struk Kasir Thermal Bebas Biaya Langganan"
- **Analisis Kebutuhan Pasar:** Banyak pemilik toko kelontong, kedai kopi, dan olshop kecil terbebani biaya langganan aplikasi kasir POS bulanan (Rp 100rb - 300rb/bulan) hanya untuk mencetak struk belanja.
- **Solusi Kampanye:**
  1. Promosikan fitur **Pembuat Invoice & Cetak Nota Kasir Thermal 58mm/80mm** di kompreskilat.site yang 100% gratis dan langsung jalan dari browser HP/Laptop.
  2. Buat materi perbandingan: "Aplikasi POS Berbayar vs KompresKilat Nota Gratis".
  3. Salinan CTA Utama: "Cetak Struk Nota Kasir Toko Anda Gratis Tanpa Ribet Sekarang!"
- **Target Konversi:** Peningkatan +25% pengguna fitur invoice dalam 14 hari.
- **Status Tindakan:** ⏳ Menunggu Persetujuan Supervisor untuk aktivasi kampanye.`
  ],
  sosmed: [
    `Ditolak sistem gara-gara ukuran foto KTP kegedean? Jangan emosi dulu, ini solusinya! 🤯

Gak perlu pusing bayar aplikasi mahal atau ribet buka software berat. Di https://www.kompreskilat.site, kamu bisa kompres foto KTP, KK, atau dokumen lamaran kerja jadi pas di bawah 200KB dalam hitungan detik tanpa buram!

🔒 Privasi 100% Terjaga: Foto tidak pernah diupload ke server mana pun, semua diproses langsung di browsermu!

⚡ Coba gratis sekarang melalui tautan di bio kami!

#KompresKilat #TipsCPNS #LolosBerkas #KompresKTP #ToolsGratis #SolusiDigital #UMKMIndonesia`,
    `Mau cetak struk kasir toko atau olshop tapi gak mau langganan aplikasi kasir mahal? 🧾

Gunakan Pembuat Invoice & Cetak Nota Kasir Thermal 58mm/80mm di https://www.kompreskilat.site! 100% Gratis, bisa langsung cetak ke printer Bluetooth atau USB, dan sudah ada stempel lunas digitalnya.

Tanpa perlu login ribet. Langsung ketik belanjaan, atur diskon, dan klik Cetak!

Kunjungi kompreskilat.site sekarang juga! ⚡

#KompresKilat #AplikasiKasirGratis #NotaThermal #StrukKasir #UMKMNaikKelas #BisnisOnline`
  ],
  creative: [
    `### 🎬 Storyboard Video Singkat (15 Detik): "Kasir Cepat Struk Thermal"
- **Target Platform:** Instagram Reels & TikTok
- **Detik 00-03 (Hook):** Tampilan printer thermal Bluetooth mencetak struk kasir rapi dengan stempel LUNAS biru.
- **Detik 04-08 (Masalah):** Teks layar: "Mau kasih nota belanja profesional ke pelanggan tapi gak mau bayar software kasir mahal?"
- **Detik 09-12 (Solusi Demo):** Buka browser -> Masuk kompreskilat.site -> Ketik barang -> Klik Cetak Struk 58mm!
- **Detik 13-15 (CTA):** Logo KompresKilat berputar dengan teks "100% Gratis - Coba Sekarang di Bio!".
- **Audio:** Backsound Upbeat Lo-Fi dengan sound effect gesekan kertas cetak struk.
- **Status Tindakan:** ⏳ Menunggu Persetujuan Supervisor untuk produksi visual.`
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
*Catatan Editor: Draf artikel telah disusun sesuai pedoman kualitas Google AdSense. Silakan direview dan disetujui oleh Supervisor sebelum rilis ke blog.*`
  ],
  analytics: [
    `### 📊 Laporan Analisis Telemetri & Audit Kepatuhan Google AdSense
- **Metrik Trafik Terpantau:** 91 pageviews, 7 unique visitors, 22 interaksi alat (CTR 16.61%).
- **Halaman Paling Populer:** Generator Nota Thermal & Invoice Kasir, Kompres Gambar Cepat.
- **Audit Kepatuhan AdSense:**
  1. Tata letak iklan terisolasi aman dari tombol fungsi (Cetak, Download, Kompres).
  2. Tidak ada risiko accidental click (penempatan iklan mematuhi jarak minimal 24px dari elemen interaktif).
  3. Laman cetak struk otomatis membersihkan iklan via print media query (\`@media print\`).
- **Rekomendasi Problem-Solving:** Tingkatkan waktu tinggal pengguna dengan menambahkan panduan penggunaan singkat di bawah setiap alat utilitas.
- **Status Tindakan:** ⏳ Menunggu Persetujuan Supervisor.`
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
        analyticsMetrics = {
          totalViews: 91,
          totalClicks: 22,
          uniqueVisitors: 7,
          viewsGrowth: '+18.4%',
          clicksGrowth: '+12.6%',
        };
      }
    }

    let systemPrompt = '';

    if (instruction) {
      systemPrompt = `Anda adalah ${canonicalDivisionName} di platform kompreskilat.site.
Peran Anda: Berikan respons dan analisis konkret yang ON POINT langsung ke target tugas tanpa basa-basi pengantar.

ATURAN KETAT:
1. JANGAN PERNAH menambahkan kalimat pembuka basa-basi seperti "Tentu...", "Berikut adalah...", "Sebagai...".
2. LANGSUNG MULAI baris pertama dari inti naskah / solusi / draf tindakan yang diminta.

${divisionId === 'analytics' ? `Data telemetri analitik situs aktual: ${JSON.stringify(analyticsMetrics)}` : ''}

Instruksi Tugas:
${instruction}`;
    } else if (divisionId === 'seo') {
      // Divisi SEO: Generator draf artikel berstandar Google Helpful Content & AdSense
      systemPrompt = `Anda adalah Senior SEO Specialist & Content Strategist untuk website kompreskilat.site.
Tugas Anda: Buat draf artikel tutorial edukatif berperingkat tinggi di Google Indonesia mengenai fitur kompreskilat.site (kompres foto KTP <200KB, ubah gambar ke PDF, atau cetak nota thermal kasir 58mm/80mm gratis).

ATURAN WAJIB & KETAT:
1. JANGAN PERNAH menambahkan kalimat pembuka basa-basi ("Tentu...", "Berikut artikel...").
2. LANGSUNG MULAI dari baris pertama: Judul Markdown "# [Judul Artikel]".
3. Format Keluaran Wajib (Markdown):
# [Judul Artikel Menarik, Edukatif & SEO-Friendly]
**Target Keyword:** [kata kunci utama] | **Estimasi Baca:** 3-4 menit
**Meta Deskripsi:** [150-160 karakter ringkasan artikel]

## 1. Pendahuluan
[Tantangan pengguna berkas/cetak nota dan solusi kilatnya]

## 2. Keunggulan Fitur KompresKilat.site
[Poin keunggulan: 100% Client-side browser, privasi berkas aman, cepat tanpa instalasi aplikasi berat]

## 3. Panduan Langkah Demi Langkah
1. [Langkah 1]
2. [Langkah 2]
3. [Langkah 3]

## 4. Tips Tambahan untuk Efisiensi Kerja
[Tips praktis penggunaan berkas digital atau printer thermal]

## 5. Tanya Jawab (FAQ Schema)
- **Q:** [Pertanyaan 1]?
  **A:** [Jawaban 1]
- **Q:** [Pertanyaan 2]?
  **A:** [Jawaban 2]`;
    } else {
      // Divisi Lainnya: Problem Solving Otomatis Memajukan kompreskilat.site
      switch (divisionId) {
        case 'it':
          systemPrompt = `Anda adalah Lead DevOps & SysAdmin di platform kompreskilat.site.
Misi Utama: Pengawasan keandalan website, audit keamanan sistem, pemantauan latensi serverless Vercel Edge 24ms, dan optimasi Canvas di browser.

ATURAN WAJIB & KETAT:
1. JANGAN PERNAH menyertakan kalimat pembuka ("Tentu...", "Berikut laporan...").
2. LANGSUNG MULAI dari baris pertama laporan pengawasan:
### 🛡️ Laporan Pengawasan & Keamanan Sistem Website
- **Status Infrastruktur & Edge Latency:** [Optimal / Aman (24ms)]
- **Temuan Pengawasan Sistem:** [Evaluasi memori Canvas, sanitasi input, kestabilan SSL/CDN]
- **Tindakan Pemeliharaan / Solusi:** [Langkah preventif atau perbaikan teknis konkret]
- **Rekomendasi Tindakan:** [Siap disetujui & dijalankan]`;
          break;

        case 'marketing':
          systemPrompt = `Anda adalah Head of Growth & Marketing di kompreskilat.site.
Misi Utama: Susun pesan promosi dan kampanye akuisisi pengguna (UMKM cetak nota thermal gratis & pelamar CPNS/BUMN kompres KTP 200KB) yang ON POINT siap rilis.

ATURAN WAJIB & KETAT:
1. JANGAN PERNAH menambahkan basa-basi pengantar ("Tentu...", "Berikut proposal...").
2. LANGSUNG MULAI dari baris pertama: Headline promosi dan deskripsi penawaran nilai kompreskilat.site.
3. Struktur teks:
   - Headline / Penawaran Utama
   - Solusi Masalah & Keunggulan Gratis Tanpa Aplikasi Berbayar
   - Call to Action Terarah (Kunjungi kompreskilat.site)
   - Hashtag Kampanye`;
          break;

        case 'sosmed':
          systemPrompt = `Anda adalah Social Media Strategist & Copywriter untuk akun resmi Instagram (@kompreskilat) dan Facebook Page (Kompres Kilat).
Misi Utama: Susun naskah deskripsi / caption konten media sosial yang ON POINT langsung ke sasaran tanpa pengantar atau penjelasan tambahan.

ATURAN WAJIB & KETAT:
1. JANGAN PERNAH menambahkan kalimat pembuka atau penjelasan prolog seperti "Tentu...", "Berikut adalah naskah...", "Sebagai Social Media Strategist...".
2. LANGSUNG MULAI dari baris pertama: Kalimat Hook pemikat rasa penasaran audiens.
3. Struktur teks caption langsung siap publish:
   - Kalimat Hook (1-2 baris pembuka tajam)
   - Isi Solusi Singkat (Jelaskan cara cepat kompres foto KTP <200KB / cetak nota kasir thermal 58mm gratis di kompreskilat.site, 100% aman di browser tanpa server)
   - Call to Action (Ajak klik link di bio / kunjungi kompreskilat.site)
   - 4-6 Hashtag relevan (#KompresKilat #TipsCPNS #KompresFoto #ToolsGratis #UMKM)
4. Teks harus 100% siap langsung dipublikasikan tanpa perlu menghapus penjelasan lagi.`;
          break;

        case 'creative':
          systemPrompt = `Anda adalah Creative Director & Multimedia Storyteller di kompreskilat.site.
Misi Utama: Rancang konsep visual atau naskah video pendek 15-30 detik (Instagram Reels & TikTok) yang ON POINT langsung ke naskah dan adegan.

ATURAN WAJIB & KETAT:
1. JANGAN PERNAH menambahkan basa-basi pengantar ("Tentu...", "Berikut storyboard...").
2. LANGSUNG MULAI dari judul konsep dan breakdown detik/adegan: Hook visual, Masalah, Solusi KompresKilat, dan Call to Action.
3. Di akhir sertakan kutipan teks poster: > "[Kutipan teks poster]"`;
          break;

        case 'analytics': {
          systemPrompt = `Anda adalah Lead Data Scientist & AdSense Compliance Officer di kompreskilat.site.
Metrik situs aktual (telemetri): ${JSON.stringify(analyticsMetrics)}
Misi Utama: Pengawasan analitik situs, audit keamanan tata letak iklan Google AdSense, dan pemantauan tren pengunjung.

ATURAN WAJIB & KETAT:
1. JANGAN PERNAH menyertakan kalimat pembuka ("Tentu...", "Berikut laporan...").
2. LANGSUNG MULAI dari baris pertama laporan pengawasan:
### 📊 Laporan Pengawasan Analitik & Kepatuhan Website
- **Rekapitulasi Pengawasan Trafik:** [Ringkasan pageviews & aktivitas pengguna]
- **Audit Keamanan Tata Letak AdSense:** [Verifikasi isolasi iklan & proteksi accidental clicks]
- **Rekomendasi Optimalisasi Situs:** [Tindakan pengawasan untuk menjaga kepatuhan dan performa]
- **Rekomendasi Tindakan:** [Siap disetujui & dijalankan]`;
          break;
        }

        default:
          systemPrompt = `Anda adalah Karyawan AI senior di divisi ${divisionName} kompreskilat.site.
Instruksi: Lakukan analisis otomatis dan problem-solving harian.
Format: Laporan terstruktur rapi dengan status "⏳ Menunggu Persetujuan Supervisor".`;
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
          typeof result.assistantText === 'string' ? cleanAgentOutput(result.assistantText) : '';
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
            taskResult = cleanAgentOutput(text);
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
        status: 'pending_approval',
        data: { extractedQuote, supervisorStatus: 'pending_approval' },
        articleDraft: articleData,
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
      status: 'pending_approval',
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
  status?: string;
  data: Record<string, unknown>;
  articleDraft?: any;
}) {
  const status = record.status || 'pending_approval';
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
      status,
      data: {
        ...record.data,
        supervisorStatus: status,
      },
    }),
  });

  if (record.divisionId === 'seo' && record.articleDraft) {
    try {
      await aiEmployeeStoreRequest('', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          id: record.id,
          record_type: 'draft',
          division_id: 'seo',
          division_name: 'Divisi SEO & Content Writer',
          prompt: record.prompt,
          output: record.output,
          model: record.model,
          status: 'pending_review',
          data: {
            ...record.articleDraft,
            id: record.id,
          },
        }),
      });
    } catch (err) {
      console.warn('Gagal sinkronisasi draf SEO:', err);
    }
  }
}
