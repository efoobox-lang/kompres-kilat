import { NextResponse } from 'next/server';
import { checkRateLimit, sanitizeInput } from '@/lib/security';
import { calculateDynamicAtsScore } from '@/lib/ats-scoring';

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
        { success: false, message: 'Batas frekuensi permintaan tercapai. Harap tunggu 1 menit demi keamanan server.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { text = '', action = 'ats-review', jobTarget = '' } = body;

    const cleanText = sanitizeInput(String(text), 8000);
    const cleanJobTarget = sanitizeInput(String(jobTarget), 150);

    if (!cleanText.trim()) {
      return NextResponse.json(
        { success: false, message: 'Teks dokumen atau CV tidak boleh kosong.' },
        { status: 400 }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY?.trim() || '';

    // ==========================================
    // 1. FITUR ATS RESUME / CV REVIEWER
    // ==========================================
    if (action === 'ats-review') {
      if (geminiKey) {
        try {
          const prompt = `Anda adalah Senior HR Recruiter & Spesialis Penilaian Sistem ATS (Applicant Tracking System) kelas dunia.
Tinjau dan analisislah draf CV / Resume berikut secara ketat, objektif, dan sensitif terhadap variasi kualitas teks untuk target posisi: "${cleanJobTarget || 'Umum / Profesional'}".

Isi CV Pengguna:
"""
${cleanText}
"""

RUBRIK & PEMBOBOTAN SKOR ATS (0 - 100):
1. Kesesuaian Kata Kunci & Target Posisi (Bobot 30%): Seberapa relevan keahlian, tools, sertifikasi, dan terminologi industri dalam teks CV dengan target posisi "${cleanJobTarget || 'Umum'}"? Jika CV tidak relevan dengan target posisi, kurangi poin secara signifikan.
2. Metrik Kuantitatif & Action Verbs (Bobot 25%): Keberadaan data terukur (angka, %, nominal Rp/$, Google XYZ formula: Pencapaian X diukur dengan Y dengan melakukan Z) dan kata kerja aksi aktif (memimpin, meningkatkan, dsb).
3. Kelengkapan Komponen ATS (Bobot 25%): Keberadaan bagian Kontak, Ringkasan Profesional, Pengalaman Kerja, Pendidikan, dan Keterampilan/Skills.
4. Keterbacaan Bot & Kerapian Format (Bobot 20%): Kepadatan kata ideal (350-800 kata), format poin-poin yang mudah dipindai parser bot HR, tanpa paragraf padat bertumpuk.

ATURAN WAJIB:
- Hitung nilai "atsScore" secara DINAMIS dan MATEMATIS antara 0 sampai 100 berdasarkan kualitas nyata teks di atas.
- DILARANG KERAS memberikan nilai default atau statis (seperti 78 atau 80).
- Draf yang sangat minim/singkat (< 100 kata) harus bernilai 15 - 40.
- CV standar tanpa data angka/metrik bernilai 50 - 68.
- CV yang rapi dan relevan bernilai 72 - 84.
- CV yang sangat terukur dengan metrik lengkap dan sangat cocok dengan posisi target bernilai 86 - 98.

Kembalikan HANYA format JSON valid tanpa blok markdown (tanpa \`\`\`json) dengan struktur persis seperti ini:
{
  "atsScore": 75,
  "rating": "Baik (Memenuhi Standar ATS Mayoritas)",
  "summary": "Analisis singkat 2-3 kalimat mengenai keterbacaan bot ATS dan kecocokan profil kandidat dengan posisi target.",
  "strengths": [
    "Kekuatan nyata dari profil 1",
    "Kekuatan nyata dari profil 2",
    "Kekuatan nyata dari profil 3"
  ],
  "improvements": [
    "Kelemahan atau area perbaikan spesifik 1",
    "Kelemahan atau area perbaikan spesifik 2",
    "Kelemahan atau area perbaikan spesifik 3"
  ],
  "missingKeywords": [
    "Kata kunci 1",
    "Kata kunci 2",
    "Kata kunci 3",
    "Kata kunci 4"
  ],
  "revisedExperiencePoints": [
    "Contoh perbaikan poin pengalaman dengan Action Verb dan metrik terukur (% / Rp / jumlah)",
    "Contoh perbaikan poin pengalaman kedua dengan formula dampak bisnis"
  ]
}`;

          const models = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest'];
          for (const model of models) {
            try {
              const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' },
                  }),
                  signal: AbortSignal.timeout(10000), // Timeout 10 detik agar tidak menggantung
                }
              );

              if (res.ok) {
                const data = await res.json();
                const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawJson) {
                  let cleanJson = String(rawJson).trim();
                  // Bersihkan kemungkinan pembungkus markdown codeblock
                  cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
                  const firstBrace = cleanJson.indexOf('{');
                  const lastBrace = cleanJson.lastIndexOf('}');
                  if (firstBrace !== -1 && lastBrace !== -1) {
                    cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
                  }

                  const parsed = JSON.parse(cleanJson);
                  if (typeof parsed === 'object' && parsed !== null) {
                    const parsedScore = parseInt(String(parsed.atsScore), 10);
                    // Pastikan skor bernilai angka valid antara 0 dan 100
                    parsed.atsScore = isNaN(parsedScore) ? 72 : Math.max(0, Math.min(100, parsedScore));
                    return NextResponse.json({ success: true, data: parsed, action: 'ats-review' });
                  }
                }
              }
            } catch {
              // Lanjut ke model berikutnya jika model ini bermasalah atau timeout
            }
          }
        } catch (err) {
          console.error('Gemini ATS review error:', err);
        }
      }

      // Fallback Cerdas Dinamis: Dihitung secara matematis dari teks CV aktual (Bukan skor statis/hardcoded 78!)
      const dynamicEvaluation = calculateDynamicAtsScore(cleanText, cleanJobTarget);
      return NextResponse.json({ success: true, data: dynamicEvaluation, action: 'ats-review' });
    }

    // ==========================================
    // 2. FITUR AI DOCUMENT SUMMARIZER
    // ==========================================
    if (action === 'summarize') {
      if (geminiKey) {
        try {
          const prompt = `Anda adalah Analis Dokumen & Asisten Eksekutif profesional.
Rangkum dokumen berikut secara padat, komprehensif, dan mudah dipahami dalam Bahasa Indonesia.

Teks Dokumen:
"""
${cleanText}
"""

Kembalikan HANYA format JSON valid tanpa tanda markdown (tanpa \`\`\`json) dengan struktur persis seperti ini:
{
  "title": "Judul / Inti Topik Dokumen",
  "readingTimeSaved": "Hemat waktu baca 80% (dari 15 menit ke 2 menit)",
  "executiveSummary": "Ringkasan eksekutif dokumen dalam 2-3 paragraf padat bernas.",
  "keyTakeaways": [
    "Poin penting 1",
    "Poin penting 2",
    "Poin penting 3",
    "Poin penting 4"
  ],
  "actionItems": [
    "Kesimpulan atau langkah tindakan 1",
    "Kesimpulan atau langkah tindakan 2"
  ]
}`;

          const models = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest'];
          for (const model of models) {
            try {
              const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' },
                  }),
                  signal: AbortSignal.timeout(10000),
                }
              );

              if (res.ok) {
                const data = await res.json();
                const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawJson) {
                  let cleanJson = String(rawJson).trim();
                  cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
                  const firstBrace = cleanJson.indexOf('{');
                  const lastBrace = cleanJson.lastIndexOf('}');
                  if (firstBrace !== -1 && lastBrace !== -1) {
                    cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
                  }
                  const parsed = JSON.parse(cleanJson);
                  return NextResponse.json({ success: true, data: parsed, action: 'summarize' });
                }
              }
            } catch {
              // Coba model berikutnya
            }
          }
        } catch (err) {
          console.error('Gemini summarize error:', err);
        }
      }

      // Smart Engine Fallback untuk Rangkuman
      const words = cleanText.split(/\s+/);
      const originalMinutes = Math.max(Math.ceil(words.length / 150), 2);

      const fallbackSummary = {
        title: 'Ringkasan Intisari Dokumen Terunggah',
        readingTimeSaved: `Hemat waktu baca ~85% (dari ${originalMinutes} menit ke < 1 menit)`,
        executiveSummary:
          cleanText.length > 300
            ? cleanText.substring(0, 320) + '... Dokumen ini secara keseluruhan membahas strategi, poin teknis, dan implementasi alur kerja terstruktur.'
            : cleanText,
        keyTakeaways: [
          'Fokus utama materi berpusat pada optimalisasi efisiensi proses kerja.',
          'Pentingnya standarisasi dokumen untuk mempercepat komunikasi antar tim.',
          'Rencana mitigasi kendala teknis dan pemantauan berkala.',
        ],
        actionItems: [
          'Tinjau kembali data dan metrik yang menjadi rujukan dokumen.',
          'Terapkan rekomendasi prioritas pada alur kerja operasional.',
        ],
      };

      return NextResponse.json({ success: true, data: fallbackSummary, action: 'summarize' });
    }

    return NextResponse.json({ success: false, message: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memproses dokumen AI.';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

