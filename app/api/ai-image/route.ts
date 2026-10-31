import { NextResponse } from 'next/server';
import { checkRateLimit, sanitizeInput } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('cf-connecting-ip') ||
      'anonymous';

    // Proteksi DDoS & Rate Limiting: Maksimal 25 request per menit
    const { allowed } = checkRateLimit(ip, 25, 60000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Batas frekuensi tercapai. Harap tunggu 1 menit demi keamanan server.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      prompt = '',
      action = 'generate',
      enhancementType = 'clarity',
      apiKey: clientApiKey = '',
    } = body;

    const cleanPrompt = sanitizeInput(String(prompt), 600);

    if (action === 'generate' && !cleanPrompt.trim()) {
      return NextResponse.json(
        { success: false, message: 'Deskripsi konsep poster/brosur tidak boleh kosong.' },
        { status: 400 }
      );
    }

    const geminiKey = clientApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();

    // 1. FITUR GENERATE DENGAN GOOGLE GEMINI AI STUDIO
    if (action === 'generate') {
      if (geminiKey) {
        try {
          // Gunakan Gemini 1.5 Flash untuk analisis materi dan copywriting poster profesional
          const geminiPrompt = `Anda adalah Creative Art Director & Desainer Grafis kelas dunia. Buatkan rancangan desain poster/brosur komersial dalam Bahasa Indonesia berdasarkan permintaan pengguna: "${cleanPrompt}".

Kembalikan HANYA format JSON valid tanpa tanda markdown (tanpa \`\`\`json) dengan struktur berikut:
{
  "headline": "Judul Utama Poster (Singkat, Padat, Maksimal 5 kata, Huruf Kapital)",
  "badge": "Teks Badge Promosi (Contoh: PROMO SPESIAL 50% atau KOPI NIKMAT)",
  "subheadline": "Kalimat deskripsi persuasif iklan yang menggugah minat (1-2 kalimat)",
  "bulletPoints": [
    "Poin keunggulan 1",
    "Poin keunggulan 2",
    "Poin keunggulan 3"
  ],
  "callToAction": "Teks Ajakan Bertindak (Contoh: PESAN SEKARANG VIA WA ⚡)",
  "colorPalette": "amber",
  "iconEmoji": "☕"
}
Catatan untuk colorPalette: pilih salah satu dari: "amber" (kopi/makanan hangat), "indigo" (bisnis/teknologi), "rose" (kuliner/promo diskon besar), "emerald" (sehat/organik/alami), atau "dark" (mewah/eksklusif).`;

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: geminiPrompt }] }],
                generationConfig: { responseMimeType: 'application/json' },
              }),
            }
          );

          const geminiData = await geminiRes.json();

          if (geminiRes.ok && geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
            const parsedDesign = JSON.parse(geminiData.candidates[0].content.parts[0].text);
            return NextResponse.json({
              success: true,
              designData: parsedDesign,
              provider: 'Google Gemini AI Studio',
              prompt: cleanPrompt,
            });
          } else {
            const errDetail = geminiData.error?.message || 'Google Gemini menolak permintaan.';
            return NextResponse.json(
              { success: false, message: `Google Gemini API Error: ${errDetail}` },
              { status: 400 }
            );
          }
        } catch (err: any) {
          console.error('Gemini API fetch error:', err);
          return NextResponse.json(
            { success: false, message: 'Gagal terhubung ke Google Gemini API. Periksa kunci API Anda.' },
            { status: 502 }
          );
        }
      }

      // Jika Kunci API Gemini belum dimasukkan, berikan template cerdas otomatis
      const lower = cleanPrompt.toLowerCase();
      const isCoffee = lower.includes('kopi') || lower.includes('coffee') || lower.includes('cafe');
      const isFood = lower.includes('makan') || lower.includes('kuliner') || lower.includes('restoran');
      const isSeminar = lower.includes('seminar') || lower.includes('bisnis') || lower.includes('digital');

      const fallbackDesign = {
        headline: isCoffee ? 'CITA RASA KOPI TERBAIK' : isFood ? 'KULINER SPESIAL LEZAT' : isSeminar ? 'SEMINAR BISNIS DIGITAL' : 'PROMO SPESIAL HARI INI',
        badge: isCoffee ? '☕ KOPI PILIHAN NIKMAT' : '🔥 PENAWARAN TERBATAS',
        subheadline: isCoffee 
          ? 'Nikmati kelezatan biji kopi pilihan dengan racikan barista profesional dan suasana menyenangkan.' 
          : 'Dapatkan penawaran istimewa dengan kualitas terbaik khusus untuk Anda hari ini.',
        bulletPoints: [
          'Kualitas Bahan Terjamin & Higienis',
          'Pelayanan Ramah & Proses Cepat',
          'Garansi Kepuasan Pelanggan 100%',
        ],
        callToAction: 'PESAN SEKARANG & DAPATKAN DISKON ⚡',
        colorPalette: isCoffee ? 'amber' : isFood ? 'rose' : 'indigo',
        iconEmoji: isCoffee ? '☕' : isFood ? '🍽️' : '🚀',
      };

      return NextResponse.json({
        success: true,
        designData: fallbackDesign,
        provider: 'Studio Desain Grafis KompresKilat',
        prompt: cleanPrompt,
      });
    }

    // 2. FITUR PENDUKUNG: PARAMETER IMAGE ENHANCER
    const cleanType = sanitizeInput(String(enhancementType), 30);
    const presets: Record<string, any> = {
      clarity: { contrast: 1.25, brightness: 1.05, sharpness: 1.6, saturation: 1.15, summary: 'Penajaman visual dan koreksi pencahayaan wajah.' },
      upscale: { contrast: 1.15, brightness: 1.02, sharpness: 2.0, saturation: 1.05, summary: 'Peningkatan detail mikroskopis 2x/4x.' },
      vibrant: { contrast: 1.2, brightness: 1.08, sharpness: 1.4, saturation: 1.35, summary: 'Pemberian warna hidup natural.' },
      formal: { contrast: 1.18, brightness: 1.06, sharpness: 1.5, saturation: 1.02, summary: 'Standarisasi pas foto formal CPNS.' },
    };

    return NextResponse.json({
      success: true,
      aiAdjustment: presets[cleanType] || presets.clarity,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memproses gambar AI.' },
      { status: 500 }
    );
  }
}
