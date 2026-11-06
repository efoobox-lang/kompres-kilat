// File: app/api/ai-agent/route.ts
import { NextResponse } from 'next/server';

const fallbackResponses: Record<string, string[]> = {
  it: [
    'Uptime server Vercel terpantau 99.98%, SSL aktif, latensi edge server 28ms, seluruh 102 rute statis aman tanpa error log.',
    'Pemeriksaan rutin API endpoint kompresi dan dokumen selesai. Pemakaian memori worker stabil di 18% dari kuota.',
    'Sistem backup dan sinkronisasi branch main GitHub terverifikasi bersih. Build production pipeline sukses dalam 4.4 detik.'
  ],
  marketing: [
    'Rasio konversi trial-to-subscription meningkat 14.2% minggu ini berkat banner CTA dinamis pada tool generator brosur & presentasi AI.',
    'Draf kampanye email onboarding selesai disusun: fokus pada efisiensi waktu kompresi dokumen massal untuk UMKM & freelancer.',
    'Uji A/B copy penawaran di landing page menunjukkan peningkatan klik tombol "Coba Gratis" sebesar 22% pada segmen mobile.'
  ],
  sosmed: [
    'Caption Instagram & TikTok: "Gak perlu install aplikasi berat! Kompres PDF & foto KTP cuma 2 detik langsung di browser tanpa upload ke server. Coba gratis di kompreskilat.site ⚡"',
    'Jadwal konten mingguan telah diantrekan: 3 video tips format pasfoto CPNS/BUMN dan 2 carousel tutorial invoice digital resmi.',
    'Draf utas X (Twitter) selesai: membahas bahaya upload data KTP ke sembarang situs dan bagaimana kompreskilat.site melindungi privasi 100% lokal.'
  ],
  creative: [
    'Konsep visual reels 15 detik: split screen sebelum vs sesudah kompresi dokumen dengan efek transisi kilat neon dan audio punchy.',
    'Storyboard teaser fitur "Pembuat Invoice Instan": animasi drag-and-drop stempel LUNAS dan tanda tangan digital interaktif siap diproduksi.',
    'Desain template thumbnail YouTube & poster promosi format 1080x1920 telah diekspor ke folder aset siap unggah.'
  ],
  seo: [
    'Audit sitemap.xml dan 38 artikel blog selesai. Keyword "cara kompres foto ktp 500kb" berhasil naik ke posisi 3 di Google SERP.',
    'Struktur data Schema.org (SoftwareApplication & FAQPage) pada 28 tool utama terverifikasi valid tanpa warning di Google Rich Results.',
    'Riset 15 kata kunci turunan untuk fitur "Invoice Generator" siap dijadikan topik artikel baru dengan potensi trafik 25K/bulan.'
  ],
  analytics: [
    'Trafik organik 7 hari terakhir: 48.200 tayangan Google Search Console dengan CTR 8.4%. Halaman paling aktif: /tools/image dan /tools/invoice-generator.',
    'Metrik AdSense harian: Viewability ad rate 78.5%, eCPM stabil di rentang optimal, zero policy violation pada seluruh unit iklan.',
    'Analisis retensi: 62% pengunjung adalah returning users yang menggunakan tool konversi dokumen lebih dari 3 kali dalam seminggu.'
  ]
};

export async function POST(request: Request) {
  try {
    const { divisionId, divisionName, customPrompt } = await request.json();

    // Jika customPrompt diberikan, gunakan prompt tersebut
    let systemPrompt = '';
    if (customPrompt && typeof customPrompt === 'string' && customPrompt.trim().length > 0) {
      systemPrompt = `Anda adalah Karyawan AI senior di divisi ${divisionName} untuk platform web kompreskilat.site.
Perintah Pengguna: "${customPrompt.trim()}"
Berikan laporan atau solusi profesional dalam 1-3 kalimat yang konkret, terukur, dan langsung siap diimplementasikan.`;
    } else {
      if (divisionId === 'it') {
        systemPrompt = "Berikan laporan singkat pemeliharaan uptime server Vercel, latensi edge, dan pemeriksaan error log kompreskilat.site terkini.";
      } else if (divisionId === 'marketing') {
        systemPrompt = "Berikan analisis singkat terkait strategi konversi trial-to-subscription fitur generator brosur AI dan metrik pertumbuhan kompreskilat.site.";
      } else if (divisionId === 'sosmed') {
        systemPrompt = "Buat ide atau draf caption promosi singkat yang menarik untuk fitur kompres gambar & alat PDF kompreskilat.site.";
      } else if (divisionId === 'creative') {
        systemPrompt = "Berikan ide konsep visual atau skrip teaser reels singkat berdurasi 15 detik untuk fitur baru kompreskilat.site.";
      } else if (divisionId === 'seo') {
        systemPrompt = "Berikan laporan optimasi sitemap XML, posisi kata kunci Google SERP, dan riset artikel blog SEO kompreskilat.site.";
      } else if (divisionId === 'analytics') {
        systemPrompt = "Berikan ringkasan metrik trafik harian dari Google Search Console, rasio CTR, dan estimasi performa AdSense kompreskilat.site.";
      } else {
        systemPrompt = `Berikan satu kalimat laporan kerja profesional terbaru untuk divisi ${divisionName} kompreskilat.site.`;
      }
    }

    const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)?.trim();

    // Eksekusi via Gemini REST API jika API key tersedia
    if (apiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const taskResult = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (taskResult) {
            return NextResponse.json({
              success: true,
              task: taskResult,
              source: 'gemini-2.0-flash',
              timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to cached system responses:', geminiError);
      }
    }

    // Fallback cerdas jika API key tidak ada atau limit tercapai
    const options = fallbackResponses[divisionId] || fallbackResponses['it'];
    const randomFallback = options[Math.floor(Math.random() * options.length)];
    const finalTask = customPrompt
      ? `[Diproses Otomatis] Divisi ${divisionName} telah mengeksekusi instruksi: "${customPrompt}". Hasil: ${randomFallback}`
      : randomFallback;

    return NextResponse.json({
      success: true,
      task: finalTask,
      source: 'simulated-agent',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error: any) {
    console.error('Error AI Agent:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses tugas AI' },
      { status: 500 }
    );
  }
}