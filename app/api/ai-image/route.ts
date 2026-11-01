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
      hasUploadedImage = false,
      uploadedImageName = '',
    } = body;

    const cleanPrompt = sanitizeInput(String(prompt), 600);
    const cleanImageName = sanitizeInput(String(uploadedImageName), 100);

    if (action === 'generate' && !cleanPrompt.trim()) {
      return NextResponse.json(
        { success: false, message: 'Deskripsi konsep poster/brosur tidak boleh kosong.' },
        { status: 400 }
      );
    }

    const geminiKey =
      clientApiKey?.trim() ||
      process.env.GEMINI_API_KEY?.trim() ||
      '';

    // 1. FITUR GENERATE DENGAN GOOGLE GEMINI AI STUDIO
    if (action === 'generate') {
      if (geminiKey) {
        try {
          const imageContext = hasUploadedImage
            ? `\nINFORMASI PENTING: Pengguna mengunggah gambar/logo/produk fisik ("${cleanImageName || 'Produk'}"). Rancang teks headline, badge, dan deskripsi yang menyoroti visual produk/logo yang ditampilkan di poster agar selaras dan memikat pembeli.`
            : '';

          const geminiPrompt = `Anda adalah Creative Art Director & Desainer Grafis komersial. Rancanglah konsep poster/brosur promosi dalam Bahasa Indonesia yang sangat memikat untuk: "${cleanPrompt}".${imageContext}

Kembalikan HANYA format JSON valid tanpa tanda kutip markdown (tanpa \`\`\`json) dengan format persis berikut:
{
  "headline": "Judul Utama Poster (Singkat, Padat, Maksimal 5 kata)",
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
Catatan colorPalette: pilih antara "amber" (kopi/makanan hangat), "indigo" (bisnis/teknologi), "rose" (kuliner/promo meriah), "emerald" (sehat/organik/alami), atau "dark" (mewah).`;

          // Coba model gemini-3.8-flash, lalu fallback ke gemini-flash-latest
          const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
          let geminiData: Record<string, unknown> | null = null;

          for (const model of models) {
            try {
              const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: geminiPrompt }] }],
                    generationConfig: { responseMimeType: 'application/json' },
                  }),
                }
              );
              const data = await res.json() as Record<string, unknown>;
              const candidates = data.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined;
              if (res.ok && candidates?.[0]?.content?.parts?.[0]?.text) {
                geminiData = data;
                break;
              }
            } catch {
              // Coba model berikutnya
            }
          }

          const candidates = geminiData?.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined;
          if (candidates?.[0]?.content?.parts?.[0]?.text) {
            const rawText = candidates[0].content.parts[0].text;
            const cleanJsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedDesign = JSON.parse(cleanJsonText);
            return NextResponse.json({
              success: true,
              designData: parsedDesign,
              provider: 'Google Gemini (AI Studio)',
              prompt: cleanPrompt,
            });
          }
        } catch (err: unknown) {
          console.error('Gemini API fetch error:', err);
        }
      }

      // Fallback Cerdas jika kuota jaringan terganggu
      const lower = cleanPrompt.toLowerCase();
      const isCoffee = lower.includes('kopi') || lower.includes('coffee') || lower.includes('cafe');
      const isFood = lower.includes('makan') || lower.includes('kuliner') || lower.includes('restoran');
      const isSeminar = lower.includes('seminar') || lower.includes('bisnis') || lower.includes('digital');

      const fallbackDesign = {
        headline: isCoffee ? 'CITA RASA KOPI TERBAIK' : isFood ? 'KULINER SPESIAL LEZAT' : isSeminar ? 'SEMINAR BISNIS DIGITAL' : 'PROMO SPESIAL HARI INI',
        badge: isCoffee ? '☕ KOPI PILIHAN NIKMAT' : '🔥 PENAWARAN TERBATAS',
        subheadline: isCoffee 
          ? 'Nikmati kelezatan 100% biji kopi murni dengan aroma semerbak racikan barista profesional.' 
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

    // 2. PARAMETER IMAGE ENHANCER
    const cleanType = sanitizeInput(String(enhancementType), 30);
    const presets: Record<string, { contrast: number; brightness: number; sharpness: number; saturation: number; summary: string }> = {
      clarity: { contrast: 1.25, brightness: 1.05, sharpness: 1.6, saturation: 1.15, summary: 'Penajaman visual dan koreksi pencahayaan wajah.' },
      upscale: { contrast: 1.15, brightness: 1.02, sharpness: 2.0, saturation: 1.05, summary: 'Peningkatan detail mikroskopis 2x/4x.' },
      vibrant: { contrast: 1.2, brightness: 1.08, sharpness: 1.4, saturation: 1.35, summary: 'Pemberian warna hidup natural.' },
      formal: { contrast: 1.18, brightness: 1.06, sharpness: 1.5, saturation: 1.02, summary: 'Standarisasi pas foto formal CPNS.' },
    };

    return NextResponse.json({
      success: true,
      aiAdjustment: presets[cleanType] || presets.clarity,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memproses gambar AI.';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
