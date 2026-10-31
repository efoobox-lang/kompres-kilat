import { NextResponse } from 'next/server';
import { checkRateLimit, sanitizeInput } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('cf-connecting-ip') ||
      'anonymous';

    // Proteksi DDoS & Rate Limiting: Maksimal 20 request per menit
    const { allowed } = checkRateLimit(ip, 20, 60000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Batas frekuensi tercapai. Harap tunggu 1 menit demi kenyamanan bersama.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      prompt = '',
      action = 'generate', // 'generate' (Poster/Brosur) atau 'adjust' (Enhancer)
      enhancementType = 'clarity',
      aspectRatio = 'square', // 'square' (1:1), 'portrait' (9:16), 'landscape' (16:9)
    } = body;

    const cleanPrompt = sanitizeInput(String(prompt), 600);

    // Validasi input prompt kosong untuk aksi generate
    if (action === 'generate' && !cleanPrompt.trim()) {
      return NextResponse.json(
        { success: false, message: 'Deskripsi prompt poster/brosur tidak boleh kosong.' },
        { status: 400 }
      );
    }

    // 1. FITUR UTAMA: GENERATE GAMBAR POSTER / BROSUR DENGAN OPENAI DALL-E 3 (ATAU FALLBACK CLOUD ENGINE)
    if (action === 'generate') {
      const openAiKey = process.env.OPENAI_API_KEY;

      // Optimasi prompt agar menghasilkan desain poster/brosur profesional
      const enhancedPrompt = `Professional marketing poster design, commercial brochure layout, visually stunning, high resolution 8k, modern typography and clean graphics for: ${cleanPrompt}`;

      // A. Jika OPENAI_API_KEY disetel di Environment Variable, panggil OpenAI DALL-E 3
      if (openAiKey) {
        try {
          const openAiRes = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${openAiKey}`,
            },
            body: JSON.stringify({
              model: 'dall-e-3',
              prompt: enhancedPrompt,
              n: 1,
              size: '1024x1024',
              quality: 'standard',
            }),
          });

          const openAiData = await openAiRes.json();
          const imageUrl = openAiData.data?.[0]?.url;

          if (imageUrl) {
            return NextResponse.json({
              success: true,
              imageUrl,
              provider: 'OpenAI DALL-E 3',
              prompt: cleanPrompt,
            });
          }
        } catch (err) {
          console.error('OpenAI DALL-E 3 error, falling back to high-res visual engine:', err);
        }
      }

      // B. Engine Generatif Berkualitas Tinggi (Berfungsi Langsung Tanpa Wajib Berlangganan API Key)
      let width = 1024;
      let height = 1024;
      if (aspectRatio === 'portrait') {
        width = 768;
        height = 1344;
      } else if (aspectRatio === 'landscape') {
        width = 1344;
        height = 768;
      }

      const encodedPrompt = encodeURIComponent(
        `Ultra detailed graphic design poster, professional commercial flyer brochure, modern typography, aesthetic color palette: ${cleanPrompt}`
      );
      const fallbackImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${Date.now()}`;

      return NextResponse.json({
        success: true,
        imageUrl: fallbackImageUrl,
        provider: 'AI Visual Studio Engine',
        prompt: cleanPrompt,
      });
    }

    // 2. FITUR PENDUKUNG: PENYESUAIAN PARAMETER ENHANCER (Gemini API / Presets)
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
              contents: [
                {
                  parts: [
                    {
                      text: `Analisis kebutuhan enhancement foto untuk: "${cleanPrompt}". Format JSON: { "contrast": 1.2, "brightness": 1.05, "sharpness": 1.5, "saturation": 1.1, "summary": "Deskripsi singkat" }`,
                    },
                  ],
                },
              ],
              generationConfig: { responseMimeType: 'application/json' },
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
