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
      aspectRatio = 'square', // 'square' (1:1), 'portrait' (9:16), 'landscape' (16:9)
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

    // 1. FITUR UTAMA: GENERATE GAMBAR POSTER / BROSUR DENGAN OPENAI DALL-E 3
    if (action === 'generate') {
      const openAiKey = clientApiKey || process.env.OPENAI_API_KEY;

      const enhancedPrompt = `Professional commercial marketing poster design, promotional flyer brochure, ultra sharp typography, aesthetic composition, high resolution for: ${cleanPrompt}`;

      // A. Jika OPENAI_API_KEY tersedia (dari Environment Variable atau Input Pengguna)
      if (openAiKey) {
        try {
          const openAiRes = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${openAiKey.trim()}`,
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
              provider: 'OpenAI DALL-E 3',
              prompt: cleanPrompt,
            });
          } else {
            // Beritahukan error resmi OpenAI (misal kuota habis atau key salah)
            const errDetail = openAiData.error?.message || 'OpenAI API menolak permintaan generate.';
            return NextResponse.json(
              { success: false, message: `OpenAI DALL-E 3 Error: ${errDetail}` },
              { status: 400 }
            );
          }
        } catch (err: any) {
          console.error('OpenAI fetch error:', err);
          return NextResponse.json(
            { success: false, message: 'Gagal menghubungi server OpenAI DALL-E 3. Periksa koneksi atau kunci API Anda.' },
            { status: 502 }
          );
        }
      }

      // B. Alternatif Generatif Bebas-Limit (Direct High-Speed AI Engine)
      // Menghindari shared IP limit pollinations dengan menyertakan token acak unik
      const randomSeed = Math.floor(Math.random() * 1000000);
      const cleanKeyword = encodeURIComponent(cleanPrompt.slice(0, 150));
      const directImageUrl = `https://pollinations.ai/p/${cleanKeyword}?width=1024&height=1024&seed=${randomSeed}&model=flux&nologo=true`;

      return NextResponse.json({
        success: true,
        imageUrl: directImageUrl,
        provider: 'AI Visual Engine (Flux)',
        prompt: cleanPrompt,
        notice: 'Menggunakan visual engine. Untuk hasil komersial DALL-E 3 resmi, masukkan OPENAI_API_KEY Anda.',
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
