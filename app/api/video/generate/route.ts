import { randomUUID } from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { isSameOrigin, verifyAdminSession } from '@/lib/admin-auth';
import { aiEmployeeStoreRequest, isAIEmployeeStoreConfigured } from '@/lib/ai-employee-store';

const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
const videoModel = (process.env.GOOGLE_VIDEO_MODEL || 'gemini-omni-1.2-flash').trim();

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: 'Permintaan lintas origin ditolak.' }, { status: 403 });
  }
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Sesi administrator tidak valid.' }, { status: 401 });
  }
  if (!apiKey || !isAIEmployeeStoreConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Gemini dan Supabase wajib dikonfigurasi untuk membuat video produksi.' },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Format permintaan tidak valid.' }, { status: 400 });
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  const aspectRatio = body.aspectRatio === '16:9' ? '16:9' : '9:16';
  if (prompt.length < 10 || prompt.length > 2000) {
    return NextResponse.json(
      { success: false, error: 'Instruksi video harus berisi 10-2.000 karakter.' },
      { status: 400 }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const interaction = await ai.interactions.create({
      model: videoModel,
      input: `Buat video promosi orisinal untuk KompresKilat berdasarkan brief berikut. Hasilkan footage nyata, bukan storyboard atau penjelasan teks. Jangan menampilkan klaim faktual yang tidak ada di brief.\n\nBrief:\n${prompt}`,
      response_format: { type: 'video', aspect_ratio: aspectRatio },
      background: true,
    });

    if (!interaction.id) {
      return NextResponse.json({ success: false, error: 'Provider tidak mengembalikan ID pekerjaan video.' }, { status: 502 });
    }

    const jobId = randomUUID();
    await aiEmployeeStoreRequest('', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        id: jobId,
        record_type: 'video_job',
        division_id: 'creative',
        division_name: 'Divisi Video & Kreatif',
        prompt,
        output: '',
        model: videoModel,
        status: 'running',
        data: { interactionId: interaction.id, aspectRatio },
      }),
    });

    return NextResponse.json({ success: true, jobId, status: interaction.status, model: videoModel });
  } catch (error) {
    console.error('Video generation request failed:', error);
    return NextResponse.json(
      { success: false, error: 'Provider video tidak dapat memulai generasi. Periksa akses model dan billing Gemini.' },
      { status: 502 }
    );
  }
}

export async function GET(request: Request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Sesi administrator tidak valid.' }, { status: 401 });
  }
  if (!isAIEmployeeStoreConfigured()) {
    return NextResponse.json({ success: false, error: 'Supabase belum dikonfigurasi.' }, { status: 503 });
  }

  const jobId = new URL(request.url).searchParams.get('jobId');
  if (!jobId) {
    try {
      const jobs = await aiEmployeeStoreRequest<Array<{
        id: string;
        prompt: string;
        status: string;
        created_at: string;
        data: { videoData?: CreativeVideoRecord };
      }>>('?record_type=eq.video_job&select=id,prompt,status,created_at,data&order=created_at.desc&limit=20');
      return NextResponse.json({
        success: true,
        jobs: jobs.map(({ id, prompt, status, created_at, data }) => ({
          id,
          prompt,
          status,
          createdAt: created_at,
          videoData: status === 'completed' ? data.videoData || null : null,
        })),
      }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
      console.error('Video job history request failed:', error);
      return NextResponse.json({ success: false, error: 'Gagal memuat riwayat generasi video.' }, { status: 502 });
    }
  }
  if (!/^[0-9a-f-]{36}$/i.test(jobId)) {
    return NextResponse.json({ success: false, error: 'ID pekerjaan video tidak valid.' }, { status: 400 });
  }
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'Gemini API belum dikonfigurasi.' }, { status: 503 });
  }

  try {
    const rows = await aiEmployeeStoreRequest<Array<{
      id: string;
      prompt: string;
      status: string;
      data: { interactionId?: string; aspectRatio?: string; videoData?: CreativeVideoRecord };
    }>>(
      `?id=eq.${encodeURIComponent(jobId)}&record_type=eq.video_job&select=id,prompt,status,data&limit=1`
    );
    const job = rows[0];
    if (!job) return NextResponse.json({ success: false, error: 'Pekerjaan video tidak ditemukan.' }, { status: 404 });
    if (job.status === 'completed' && job.data.videoData) {
      return NextResponse.json({ success: true, status: 'completed', data: job.data.videoData });
    }
    if (!job.data.interactionId) {
      return NextResponse.json({ success: false, error: 'Data operasi video tidak lengkap.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const interaction = await ai.interactions.get(job.data.interactionId);
    if (interaction.status === 'failed' || interaction.status === 'cancelled') {
      await updateVideoJob(jobId, 'failed', { ...job.data, error: 'Provider gagal membuat video.' });
      return NextResponse.json({ success: false, status: 'failed', error: 'Provider gagal membuat video.' }, { status: 502 });
    }
    if (interaction.status !== 'completed') {
      return NextResponse.json({ success: true, status: interaction.status });
    }

    const encodedVideo = interaction.output_video?.data;
    if (!encodedVideo) {
      await updateVideoJob(jobId, 'failed', { ...job.data, error: 'Video output tidak tersedia.' });
      return NextResponse.json({ success: false, status: 'failed', error: 'Provider menyelesaikan tugas tanpa mengembalikan file video.' }, { status: 502 });
    }

    const video = Buffer.from(encodedVideo, 'base64');
    if (video.length === 0 || video.length > 100 * 1024 * 1024) {
      await updateVideoJob(jobId, 'failed', { ...job.data, error: 'Ukuran file video tidak valid.' });
      return NextResponse.json({ success: false, status: 'failed', error: 'Ukuran file video tidak valid.' }, { status: 502 });
    }

    const videoUrl = await uploadVideo(jobId, video);
    const videoData: CreativeVideoRecord = {
      id: jobId,
      title: 'Video KompresKilat',
      caption: job.prompt,
      videoUrl,
      duration: '15 detik',
      aspectRatio: job.data.aspectRatio || '9:16',
      model: videoModel,
      generatedAt: new Date().toISOString(),
    };
    await updateVideoJob(jobId, 'completed', { ...job.data, videoData });
    return NextResponse.json({ success: true, status: 'completed', data: videoData });
  } catch (error) {
    console.error('Video generation status check failed:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memeriksa atau menyimpan hasil video.' },
      { status: 502 }
    );
  }
}

interface CreativeVideoRecord {
  id: string;
  title: string;
  caption: string;
  videoUrl: string;
  duration: string;
  aspectRatio: string;
  model: string;
  generatedAt: string;
}

async function updateVideoJob(id: string, status: string, data: Record<string, unknown>) {
  await aiEmployeeStoreRequest(`?id=eq.${encodeURIComponent(id)}&record_type=eq.video_job`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status, data, updated_at: new Date().toISOString() }),
  });
}

async function uploadVideo(id: string, video: Buffer) {
  const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !key) throw new Error('Supabase Storage belum dikonfigurasi.');

  const objectPath = `${supabaseUrl}/storage/v1/object/ai-employee-videos/${id}.mp4`;
  const response = await fetch(objectPath, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'video/mp4',
      'x-upsert': 'true',
    },
    body: new Uint8Array(video),
  });
  if (!response.ok) {
    const details = await response.text();
    console.error('Generated video upload failed:', response.status, details.slice(0, 500));
    throw new Error(`Supabase Storage menolak video (HTTP ${response.status}).`);
  }
  return `${supabaseUrl}/storage/v1/object/public/ai-employee-videos/${id}.mp4`;
}
