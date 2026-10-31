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
        { success: false, message: 'Batas frekuensi tercapai. Harap tunggu 1 menit demi kenyamanan server.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      prompt = '',
      action = 'generate', // 'generate' (Poster/Brosur) atau 'adjust' (Enhancer)
      enhancementType = 'clarity',
      apiKey: clientApiKey = '',
    } = body;

    const cleanPrompt = sanitizeInput(String(prompt), 600);

    // Validasi input prompt kosong untuk aksi generate
    if (action === 'generate' && !cleanPrompt.trim()) {
      return NextResponse.json(
        { success: false, message: 'Deskripsi prompt poster/brosur tidak boleh kosong.' },
        { status: 400 }
      );
    }

    // 1. FITUR GENERATE DENGAN OPENAI DALL-E 3 RESMI
    if (action === 'generate') {
      const openAiKey = clientApiKey?.trim() || process.env.OPENAI_API_KEY?.trim();

      // Jika Kunci API OpenAI belum ada
      if (!openAiKey) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Kunci API OpenAI DALL-E 3 belum dimasukkan. Silakan masukkan kunci API OpenAI Anda (sk-...) pada kolom yang disediakan, atau gunakan tab "Studio Desain Grafis" yang 100% gratis dan instan.',
          },
          { status: 400 }
        );
      }

      // Panggil OpenAI DALL-E 3 Image Generation API
      const enhancedPrompt = `Professional marketing poster design, promotional flyer brochure, ultra sharp typography and aesthetics for: ${cleanPrompt}`;

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

        if (openAiRes.ok && openAiData.data?.[0]?.url) {
          return NextResponse.json({
            success: true,
            imageUrl: openAiData.data[0].url,
            provider: 'OpenAI DALL-E 3 Resmi',
            prompt: cleanPrompt,
          });
        } else {
          const errDetail =
            openAiData.error?.message ||
            'OpenAI menolak permintaan pembuatan gambar. Pastikan kuota saldo akun OpenAI Anda aktif.';
          return NextResponse.json(
            { success: false, message: `OpenAI DALL-E 3 Error: ${errDetail}` },
            { status: 400 }
          );
        }
      } catch (err: any) {
        console.error('OpenAI fetch error:', err);
        return NextResponse.json(
          { success: false, message: 'Gagal terhubung ke server OpenAI. Periksa jaringan internet atau kevalidan kunci API Anda.' },
          { status: 502 }
        );
      }
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
