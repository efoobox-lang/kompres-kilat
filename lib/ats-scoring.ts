/**
 * Engine Penilaian ATS CV Dinamis (Rule-Based & NLP Heuristic)
 * Digunakan sebagai mesin evaluasi cerdas mandiri dan fallback yang presisi
 * agar skor tidak pernah statis/hardcoded (misal angka 78), melainkan dihitung
 * berdasarkan parameter objektif: panjang teks, kelengkapan komponen, metrik hasil,
 * dan kesesuaian kata kunci target posisi.
 */

export interface AtsEvaluationResult {
  atsScore: number;
  rating: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  revisedExperiencePoints: string[];
}

export function calculateDynamicAtsScore(text: string, jobTarget: string): AtsEvaluationResult {
  const clean = text.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Jika input teks sangat minim (belum berupa CV utuh)
  if (wordCount < 20) {
    const rawScore = Math.min(25, Math.max(10, Math.round(wordCount * 1.2)));
    return {
      atsScore: rawScore,
      rating: 'Sangat Rendah (Draf Belum Lengkap)',
      summary: `Teks CV hanya memuat ${wordCount} kata. Dokumen terlalu singkat untuk dapat diproses oleh parser sistem ATS HR.`,
      strengths: ['Teks dokumen berhasil dimasukkan ke dalam sistem analisis.'],
      improvements: [
        'Tambahkan riwayat pengalaman kerja terperinci dengan peran dan nama perusahaan.',
        'Sertakan riwayat pendidikan, kontak resmi (email & nomor telepon), serta daftar keterampilan utama.',
        'Panjang teks CV profesional standar ATS yang disarankan adalah 350 - 800 kata.',
      ],
      missingKeywords: ['Pengalaman Kerja', 'Pendidikan', 'Keahlian Utama', 'Kontak'],
      revisedExperiencePoints: [
        'Contoh: Mengelola operasional harian dan meningkatkan efisiensi proses kerja tim sebesar 20%.',
        'Contoh: Berkolaborasi lintas divisi untuk menyelesaikan proyek tepat waktu sesuai target perusahaan.',
      ],
    };
  }

  // 1. Analisis Panjang & Kepadatan Teks (Bobot: 20 poin)
  let lengthScore = 0;
  if (wordCount < 100) lengthScore = 7;
  else if (wordCount < 200) lengthScore = 12;
  else if (wordCount < 350) lengthScore = 16;
  else if (wordCount <= 900) lengthScore = 20; // Panjang ideal (1 - 2 halaman ATS)
  else if (wordCount <= 1300) lengthScore = 17;
  else lengthScore = 13; // Terlalu panjang untuk resume standar

  // 2. Analisis Struktur Bagian Wajib ATS (Bobot: 25 poin)
  let sectionScore = 0;
  const missingSections: string[] = [];
  const foundSections: string[] = [];

  // Kontak (Email / No. Telepon / LinkedIn)
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(clean);
  const hasPhone = /(\+62|62|08)[0-9\-\s]{8,14}/.test(clean);
  if (hasEmail || hasPhone) {
    sectionScore += 5;
    foundSections.push('Informasi Kontak');
  } else {
    missingSections.push('Kontak Resmi (Email / No. HP)');
  }

  // Ringkasan Profesional (Professional Summary)
  if (/(ringkasan|summary|profil|tentang saya|about me|ikhtisar|latar belakang)/i.test(clean)) {
    sectionScore += 5;
    foundSections.push('Ringkasan Profesional');
  } else {
    missingSections.push('Ringkasan Profesional (Professional Summary)');
  }

  // Pengalaman Kerja (Work Experience)
  if (/(pengalaman|experience|riwayat kerja|employment|work history|pekerjaan|karir)/i.test(clean)) {
    sectionScore += 5;
    foundSections.push('Riwayat Pengalaman Kerja');
  } else {
    missingSections.push('Bagian Riwayat Pengalaman Kerja');
  }

  // Pendidikan (Education)
  if (/(pendidikan|education|sarjana|diploma|universitas|sekolah|bachelor|master|ipk|gpa|kuliah)/i.test(clean)) {
    sectionScore += 5;
    foundSections.push('Riwayat Pendidikan');
  } else {
    missingSections.push('Bagian Riwayat Pendidikan');
  }

  // Keahlian / Skills / Tools
  if (/(keahlian|skills|kemampuan|kompetensi|tools|teknologi|keahlian teknis)/i.test(clean)) {
    sectionScore += 5;
    foundSections.push('Daftar Keterampilan & Tools');
  } else {
    missingSections.push('Bagian Keterampilan (Skills)');
  }

  // 3. Analisis Metrik Kuantitatif & Action Verbs (Bobot: 25 poin)
  let metricScore = 0;
  const percentMatches = clean.match(/\b\d+(\.\d+)?%/g) || [];
  const moneyMatches = clean.match(/(rp|idr|\$|usd|juta|miliar)\s*[\d\.,]+/gi) || [];
  const numberMetricMatches = clean.match(/\b\d+\s*(x|orang|klien|proyek|project|user|pengguna|siswa|transaksi)\b/gi) || [];

  const totalMetrics = percentMatches.length + moneyMatches.length + numberMetricMatches.length;
  if (totalMetrics >= 4) metricScore += 13;
  else if (totalMetrics >= 2) metricScore += 9;
  else if (totalMetrics >= 1) metricScore += 5;
  else metricScore += 2;

  const actionVerbs = [
    'memimpin', 'mengelola', 'meningkatkan', 'merancang', 'mengoptimalkan',
    'mengembangkan', 'mengeksekusi', 'membangun', 'meluncurkan', 'memangkas',
    'menghemat', 'menganalisis', 'mengkoordinasi', 'mengimplementasikan',
    'spearheaded', 'led', 'managed', 'increased', 'designed', 'optimized',
    'developed', 'executed', 'built', 'launched', 'reduced', 'analyzed',
    'coordinated', 'implemented', 'supervised', 'generated'
  ];
  let verbCount = 0;
  for (const v of actionVerbs) {
    const rx = new RegExp(`\\b${v}`, 'i');
    if (rx.test(clean)) verbCount++;
  }
  if (verbCount >= 5) metricScore += 12;
  else if (verbCount >= 3) metricScore += 9;
  else if (verbCount >= 1) metricScore += 5;
  else metricScore += 2;

  // 4. Analisis Kesesuaian Target Posisi & Kata Kunci (Bobot: 30 poin)
  let targetScore = 0;
  const targetTokens = (jobTarget || '')
    .toLowerCase()
    .split(/[\s,/-]+/)
    .filter((t) => t.length > 2 && !['dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'yang', 'the', 'and', 'for', 'staff', 'posisi'].includes(t));

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  if (targetTokens.length > 0) {
    let matchedCount = 0;
    for (const token of targetTokens) {
      const rx = new RegExp(token, 'i');
      if (rx.test(clean)) {
        matchedCount++;
        matchedKeywords.push(token.toUpperCase());
      } else {
        missingKeywords.push(token.charAt(0).toUpperCase() + token.slice(1));
      }
    }
    const matchRatio = matchedCount / targetTokens.length;
    targetScore = Math.round(matchRatio * 20); // 0 - 20 poin

    // 10 poin dari keterampilan industri & analitis
    const industrySkills = [
      'komunikasi', 'leadership', 'manajemen', 'analisis', 'strategi',
      'kolaborasi', 'negosiasi', 'problem solving', 'teamwork', 'agile'
    ];
    let skillMatches = 0;
    for (const s of industrySkills) {
      if (new RegExp(s, 'i').test(clean)) {
        skillMatches++;
      } else if (missingKeywords.length < 5) {
        missingKeywords.push(s.charAt(0).toUpperCase() + s.slice(1));
      }
    }
    targetScore += Math.min(10, Math.round(skillMatches * 2));
  } else {
    // Evaluasi kata kunci profesional umum jika target posisi tidak diisi
    const genericSkills = [
      'komunikasi', 'leadership', 'manajemen', 'analisis', 'strategi',
      'kolaborasi', 'negosiasi', 'problem solving', 'teamwork', 'agile',
      'microsoft excel', 'reporting', 'presentasi', 'perencanaan'
    ];
    let genericFound = 0;
    for (const s of genericSkills) {
      if (new RegExp(s, 'i').test(clean)) {
        genericFound++;
        matchedKeywords.push(s.toUpperCase());
      } else if (missingKeywords.length < 5) {
        missingKeywords.push(s.charAt(0).toUpperCase() + s.slice(1));
      }
    }
    targetScore = Math.min(30, Math.round((genericFound / 6) * 30));
  }

  // Format poin / bullet points bonus
  let rawTotal = lengthScore + sectionScore + metricScore + targetScore;
  const bulletLines = clean.split('\n').filter((l) => /^(\s*[-*•]|\s*\d+\.)/.test(l)).length;
  if (bulletLines >= 4) rawTotal += 4;
  else if (bulletLines === 0 && wordCount > 200) rawTotal -= 6; // Paragraf terlalu padat

  const finalScore = Math.max(15, Math.min(97, Math.round(rawTotal)));

  // Tentukan rating teks berdasarkan skor
  let rating = 'Perlu Banyak Peningkatan';
  if (finalScore >= 85) rating = 'Sangat Baik (Sangat Siap Lolos Skrining ATS)';
  else if (finalScore >= 75) rating = 'Baik (Memenuhi Standar ATS Mayoritas)';
  else if (finalScore >= 60) rating = 'Cukup (Perlu Optimalisasi Kata Kunci & Metrik)';
  else if (finalScore >= 45) rating = 'Kurang (Banyak Komponen Utama Belum Lengkap)';

  // Susun Kekuatan (Strengths) secara dinamis berdasarkan data aktual
  const strengths: string[] = [];
  if (foundSections.length >= 3) {
    strengths.push(`Struktur dokumen memuat bagian ${foundSections.slice(0, 3).join(', ')} secara jelas.`);
  }
  if (totalMetrics >= 2) {
    strengths.push(`Terdapat ${totalMetrics} metrik kuantitatif hasil kerja yang membuktikan dampak nyata pencapaian Anda.`);
  }
  if (verbCount >= 3) {
    strengths.push('Menggunakan kata kerja tindakan profesional (Action Verbs) yang efektif dalam deskripsi peran.');
  }
  if (matchedKeywords.length > 0) {
    strengths.push(`Kata kunci posisi relevan terdeteksi (${matchedKeywords.slice(0, 3).join(', ')}).`);
  }
  if (strengths.length === 0) {
    strengths.push('Format teks berhasil diekstrak dan dibaca dengan lancar oleh mesin pengurai.');
  }

  // Susun Perbaikan (Improvements) secara spesifik
  const improvements: string[] = [];
  if (missingSections.length > 0) {
    improvements.push(`Lengkapi bagian esensial yang belum terdeteksi: ${missingSections.join(', ')}.`);
  }
  if (totalMetrics < 2) {
    improvements.push('Perbanyak metrik kuantitatif terukur (% peningkatan, efisiensi waktu, atau nilai nominal).');
  }
  if (wordCount < 300) {
    improvements.push(`Panjang teks (${wordCount} kata) tergolong ringkas. Standar CV profesional yang optimal berkisar 350 - 800 kata.`);
  }
  if (bulletLines < 3) {
    improvements.push('Gunakan daftar poin (bullet points) pada uraian pengalaman kerja agar mudah dipindai mesin scanner HR.');
  }
  if (improvements.length === 0) {
    improvements.push('Tambahkan sertifikasi profesional terbaru untuk memperkuat nilai tawar profil Anda.');
  }

  // Lengkapi missing keywords hingga 4-5 item
  const defaultKeywords = ['Cross-functional Teamwork', 'Strategic Planning', 'KPI Management', 'Process Optimization'];
  for (const kw of defaultKeywords) {
    if (!missingKeywords.includes(kw) && missingKeywords.length < 5) {
      missingKeywords.push(kw);
    }
  }

  const roleName = jobTarget ? `posisi "${jobTarget}"` : 'posisi profesional';
  const summary = `Analisis berbasis teks mendeteksi ${wordCount} kata dengan ${foundSections.length} bagian utama. Terhadap ${roleName}, dokumen memperoleh skor ATS ${finalScore}/100 (${rating}).`;

  const revisedExperiencePoints = [
    `Memimpin inisiatif perbaikan proses kerja yang mempercepat efisiensi operasional tim sebesar 25%.`,
    `Mengelola koordinasi multi-disiplin dan menyelesaikan proyek strategis 2 minggu lebih cepat dari target dengan ROI terukur.`,
  ];

  return {
    atsScore: finalScore,
    rating,
    summary,
    strengths,
    improvements,
    missingKeywords: missingKeywords.slice(0, 5),
    revisedExperiencePoints,
  };
}

