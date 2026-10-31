import { NextResponse } from 'next/server';
import { checkRateLimit, sanitizeInput } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('cf-connecting-ip') || 
               'anonymous';

    // Proteksi DDoS & Rate Limiting: Maksimal 20 request per menit
    const { allowed } = checkRateLimit(ip, 20, 60000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Batas frekuensi tercapai. Harap tunggu 1 menit.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { prompt = '', enhancementType = 'clarity' } = body;

    const cleanPrompt = sanitizeInput(String(prompt), 300);
    const cleanType = sanitizeInput(String(enhancementType), 30);

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey && cleanPrompt) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Analisis kebutuhan enhancement foto untuk permintaan: "${cleanPrompt}". Berikan rekomendasi teknis parameter gambar dalam format JSON: { "contrast": 1.2, "brightness": 1.05, "sharpness": 1.5, "saturation": 1.1, "summary": "Deskripsi singkat hasil" }`
                }]
              }],
              generationConfig: { responseMimeType: 'application/json' }
            }),
          }
        );
        const data = await geminiRes.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return NextResponse.json({ success: true, aiAdjustment: JSON.parse(text) });
        }
      } catch (err) {
        console.error('Gemini AI image advice error:', err);
      }
    }

    // Default Smart Preset Parameters
    const presets: Record<string, any> = {
      clarity: { contrast: 1.25, brightness: 1.05, sharpness: 1.6, saturation: 1.15, summary: 'Penajaman tepi visual dan optimalisasi kecerahan wajah.' },
      upscale: { contrast: 1.15, brightness: 1.02, sharpness: 2.0, saturation: 1.05, summary: 'Peningkatan detail mikroskopis dan perbaikan resolusi 2x/4x.' },
      vibrant: { contrast: 1.2, brightness: 1.08, sharpness: 1.4, saturation: 1.35, summary: 'Pemberian warna hidup yang natural dan koreksi pencahayaan redup.' },
      formal: { contrast: 1.18, brightness: 1.06, sharpness: 1.5, saturation: 1.02, summary: 'Standarisasi pas foto formal kontras tinggi untuk berkas resmi.' },
    };

    return NextResponse.json({
      success: true,
      aiAdjustment: presets[cleanType] || presets.clarity,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memproses AI Image.' },
      { status: 500 }
    );
  }
}

