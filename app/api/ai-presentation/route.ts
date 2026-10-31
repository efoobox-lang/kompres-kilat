import { NextResponse } from 'next/server';
import { checkRateLimit, sanitizeInput } from '@/lib/security';

export interface SlideData {
  slideNumber: number;
  title: string;
  subtitle: string;
  bulletPoints: string[];
  keyHighlight?: string;
  speakerNotes?: string;
}

export interface PresentationResponse {
  title: string;
  theme: string;
  slides: SlideData[];
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('cf-connecting-ip') || 
               'anonymous';

    // Proteksi DDoS & Rate Limiting: Maksimal 15 request per menit
    const { allowed } = checkRateLimit(ip, 15, 60000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Batas frekuensi pembuatan slide tercapai. Harap tunggu 1 menit.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { topic = '', slideCount = 5, theme = 'corporate', audience = 'general' } = body;

    const cleanTopic = sanitizeInput(String(topic), 400);
    const cleanTheme = sanitizeInput(String(theme), 30);
    const cleanAudience = sanitizeInput(String(audience), 50);

    if (!cleanTopic) {
      return NextResponse.json(
        { success: false, message: 'Topik presentasi tidak boleh kosong.' },
        { status: 400 }
      );
    }

    const count = Math.min(Math.max(Number(slideCount) || 5, 3), 12);
    const geminiKey = process.env.GEMINI_API_KEY;

    // Jika user menghubungkan GEMINI_API_KEY, gunakan model Gemini untuk sintesis teks
    if (geminiKey) {
      try {
        const prompt = `Anda adalah konsultan presentasi kelas dunia. Buatlah materi presentasi PowerPoint profesional dalam Bahasa Indonesia tentang: "${cleanTopic}".
Jumlah slide yang diminta: ${count} slide.
Gaya tema: ${theme}.
Target audiens: ${audience}.

Kembalikan HANYA format JSON valid tanpa tanda markdown (tanpa \`\`\`json) dengan struktur persis seperti ini:
{
  "title": "Judul Utama Presentasi",
  "theme": "${theme}",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Judul Slide",
      "subtitle": "Subjudul atau Pengantar Singkat",
      "bulletPoints": ["Poin penting 1", "Poin penting 2", "Poin penting 3"],
      "keyHighlight": "Fokus Utama / Metrik Kunci",
      "speakerNotes": "Catatan pembicara saat presentasi"
    }
  ]
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );

        const geminiData = await geminiRes.json();
        const rawJsonText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJsonText) {
          const parsed = JSON.parse(rawJsonText);
          return NextResponse.json({ success: true, data: parsed });
        }
      } catch (err) {
        console.error('Gemini API fallback to smart template generator:', err);
      }
    }

    // Smart Engine Template Generator (Bekerja instan tanpa ketergantungan API key pihak ketiga)
    const templates: Record<number, SlideData> = {
      1: {
        slideNumber: 1,
        title: cleanTopic,
        subtitle: `Rencana Strategis & Paparan Komprehensif — Ditujukan untuk ${audience}`,
        bulletPoints: [
          'Ringkasan eksekutif dan sasaran utama paparan',
          'Tinjauan lanskap terkini dan urgensi pembahasan',
          'Visi jangka panjang dan tolak ukur keberhasilan',
        ],
        keyHighlight: 'Ringkasan Eksekutif',
        speakerNotes: `Buka presentasi dengan menyapa hadirin dan sampaikan tujuan utama membawakan topik ${cleanTopic}.`,
      },
      2: {
        slideNumber: 2,
        title: `Latar Belakang & Identifikasi Masalah`,
        subtitle: 'Tantangan Utama yang Dihadapi Saat Ini',
        bulletPoints: [
          'Kesenjangan antara kondisi aktual di lapangan dengan target ideal',
          'Dampak operasional dan finansial jika masalah tidak segera diselesaikan',
          'Peluang strategis yang dapat dimanfaatkan melalui inisiatif baru',
        ],
        keyHighlight: 'Tantangan Kritis',
        speakerNotes: 'Tekankan data dan fakta permasalahan agar audiens merasakan pentingnya solusi yang akan ditawarkan.',
      },
      3: {
        slideNumber: 3,
        title: `Kerangka Solusi & Pendekatan Baru`,
        subtitle: 'Metodologi yang Teruji dan Terukur',
        bulletPoints: [
          'Pendekatan bertahap dengan integrasi teknologi dan otomasi',
          'Penyederhanaan alur kerja untuk meningkatkan efisiensi waktu hingga 40%',
          'Pemberdayaan tim dengan SOP yang adaptif terhadap perubahan pasar',
        ],
        keyHighlight: '+40% Efisiensi',
        speakerNotes: 'Jelaskan bagaimana metodologi ini dirancang untuk menjawab akar masalah pada slide sebelumnya.',
      },
      4: {
        slideNumber: 4,
        title: `Rencana Implementasi & Roadmap`,
        subtitle: 'Tahapan Eksekusi Menuju Hasil Maksimal',
        bulletPoints: [
          'Fase 1: Persiapan infrastruktur, data, dan standarisasi tim',
          'Fase 2: Peluncuran program percontohan (pilot project) & evaluasi',
          'Fase 3: Ekspansi penuh dan pemantauan performa berkala',
        ],
        keyHighlight: 'Roadmap 3 Fase',
        speakerNotes: 'Sampaikan timeline realistis dan tetapkan ekspektasi deliverable di setiap akhir fase.',
      },
      5: {
        slideNumber: 5,
        title: `Kesimpulan & Rekomendasi Aksi`,
        subtitle: 'Langkah Nyata untuk Segera Dimulai',
        bulletPoints: [
          'Persetujuan alokasi sumber daya dan pembentukan tim pelaksana',
          'Penyelarasan target mingguan untuk mengukur akselerasi progress',
          'Komitmen bersama dalam mencapai keunggulan kompetitif berkelanjutan',
        ],
        keyHighlight: 'Call To Action',
        speakerNotes: 'Tutup presentasi dengan ajakan aksi yang tegas dan buka sesi tanya-jawab (Q&A).',
      },
    };

    // Susun array slide sesuai jumlah yang diminta pengguna
    const generatedSlides: SlideData[] = [];
    for (let i = 1; i <= count; i++) {
      if (templates[i]) {
        generatedSlides.push(templates[i]);
      } else {
        generatedSlides.push({
          slideNumber: i,
          title: `Strategi Lanjutan Bagian ${i}: ${cleanTopic}`,
          subtitle: `Optimasi Kinerja dan Metrik Keberhasilan Tahap ${i}`,
          bulletPoints: [
            `Analisis mendalam mengenai faktor pendorong performa tahap ${i}`,
            'Mitigasi risiko dan rencana kontinjensi operasional',
            'Sinergi lintas fungsi guna menjamin kepatuhan dan kualitas hasil',
          ],
          keyHighlight: `Pilar ${i}`,
          speakerNotes: `Paparkan rincian teknis pada bagian ${i} dan berikan contoh konkret penerapan di lapangan.`,
        });
      }
    }

    const presentationData: PresentationResponse = {
      title: cleanTopic,
      theme,
      slides: generatedSlides,
    };

    return NextResponse.json({ success: true, data: presentationData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memproses draf presentasi AI.' },
      { status: 500 }
    );
  }
}

