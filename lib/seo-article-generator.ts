// File: lib/seo-article-generator.ts
// Modul Helper & Script Otomatis Divisi SEO & Content Writer KompresKilat
// Menjamin draf artikel berstandar Google Helpful Content & Bebas Thin Content (Minimal 700+ kata)

export interface SeoTopicVertical {
  id: string;
  category: 'Dokumen PDF' | 'Gambar & Foto' | 'Bisnis & UMKM' | 'Kecerdasan Buatan (AI)' | 'Ekspedisi & Resi';
  targetKeyword: string;
  theme: string;
  toolUrl: string;
  toolName: string;
  toolIcon: string;
}

export const SEO_TOPICS: SeoTopicVertical[] = [
  {
    id: 'ktp-cpns',
    category: 'Gambar & Foto',
    targetKeyword: 'cara kompres foto ktp 200kb online, kompres foto cpns tanpa buram',
    theme: 'Panduan Kompres Foto KTP & Pasfoto Lamaran Kerja / CPNS di Bawah 200KB',
    toolUrl: '/tools/image',
    toolName: 'Kompres Gambar & Foto KTP',
    toolIcon: '🖼️',
  },
  {
    id: 'nota-thermal',
    category: 'Bisnis & UMKM',
    targetKeyword: 'cara membuat nota thermal online, pembuat invoice kasir 58mm gratis',
    theme: 'Solusi Pembuat Invoice, Nota Kasir Thermal & Kwitansi Resmi Online untuk Toko dan UMKM',
    toolUrl: '/tools/invoice-generator',
    toolName: 'Pembuat Invoice, Nota & Kwitansi Instan',
    toolIcon: '🧾',
  },
  {
    id: 'pdf-compress-merge',
    category: 'Dokumen PDF',
    targetKeyword: 'cara kompres file pdf online, gabung dokumen pdf lamaran kerja',
    theme: 'Panduan Lengkap Mengompres dan Menggabungkan Dokumen PDF Berkas Administrasi Kantor & Rekrutmen',
    toolUrl: '/tools/pdf',
    toolName: 'Kompres Dokumen PDF',
    toolIcon: '📄',
  },
  {
    id: 'ats-resume',
    category: 'Kecerdasan Buatan (AI)',
    targetKeyword: 'cara cek skor cv ats gratis, format resume lolos screening hrd',
    theme: 'Cara Audit dan Cek Skor Resume CV Berstandar ATS untuk Melamar Kerja di Perusahaan Impian',
    toolUrl: '/tools/ats-resume',
    toolName: 'Review CV & ATS Score Checker',
    toolIcon: '🎯',
  },
  {
    id: 'tracking-resi',
    category: 'Ekspedisi & Resi',
    targetKeyword: 'cek resi shopee jne sicepat jnt, lacak paket ekspedisi online cepat',
    theme: 'Panduan Melacak Nomor Resi Paket Multi-Ekspedisi Belanja Online Secara Akurat dan Real-Time',
    toolUrl: '/tools/tracking',
    toolName: 'Lacak Resi Ekspedisi Multi-Kurir',
    toolIcon: '📦',
  },
];

/**
 * Menghitung jumlah kata nyata dari teks markdown (mengabaikan simbol markdown murni)
 */
export function countWords(markdownText: string): number {
  if (!markdownText) return 0;
  const cleanText = markdownText
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`.*?`/g, ' ')
    .replace(/[#*_\-[\]()>|~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleanText) return 0;
  return cleanText.split(/\s+/).filter(Boolean).length;
}

/**
 * Estimasi waktu baca berdasarkan rata-rata kecepatan baca 200 kata/menit
 */
export function estimateReadingTime(wordCount: number): string {
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} menit`;
}

/**
 * Validasi kepatuhan kualitas artikel terhadap standar Google AdSense & Search Essentials:
 * 1. Menghindari Thin Content (wajib >= 700 kata)
 * 2. Memiliki struktur heading H2 & H3 yang rapi
 * 3. Memuat FAQ schema / tanya jawab
 * 4. Menyertakan rekomendasi alat utilitas yang relevan
 */
export function analyzeArticleQuality(content: string): {
  wordCount: number;
  isAdSenseSafe: boolean;
  hasHeadings: boolean;
  hasFaq: boolean;
  readingTime: string;
  warnings: string[];
} {
  const wordCount = countWords(content);
  const warnings: string[] = [];

  const h2Count = (content.match(/^##\s+/gm) || []).length;
  const h3Count = (content.match(/^###\s+/gm) || []).length;
  const hasHeadings = h2Count >= 3;
  const hasFaq = /##\s*.*?(faq|tanya jawab|pertanyaan)/i.test(content) || (content.match(/\*\*Q:\*\*/g) || []).length >= 2;

  if (wordCount < 700) {
    warnings.push(`Panjang artikel (${wordCount} kata) belum memenuhi batas aman AdSense (minimal 700+ kata untuk mencegah thin content).`);
  }
  if (!hasHeadings) {
    warnings.push('Artikel perlu memiliki minimal 3 sub-judul tingkat 2 (##) untuk struktur hierarki yang baik.');
  }
  if (!hasFaq) {
    warnings.push('Disarankan menyertakan bagian Tanya Jawab (FAQ) untuk meningkatkan peluang cuplikan kaya Google Search.');
  }

  const isAdSenseSafe = wordCount >= 700 && hasHeadings;

  return {
    wordCount,
    isAdSenseSafe,
    hasHeadings,
    hasFaq,
    readingTime: estimateReadingTime(wordCount),
    warnings,
  };
}

/**
 * Membangun Prompt Sistem Mandatoris untuk Agen AI Divisi SEO:
 * Menugaskan Gemini untuk menyusun draf komprehensif 700 - 1200 kata dengan format markdown kaya.
 */
export function buildSeoArticlePrompt(instruction?: string): string {
  const randomTopic = SEO_TOPICS[Math.floor(Math.random() * SEO_TOPICS.length)];
  const topicContext = instruction ? `Fokus Permintaan Pengguna: "${instruction}"` : `Topik Unggulan Rutin: "${randomTopic.theme}" (Target Kata Kunci: "${randomTopic.targetKeyword}")`;

  return `Anda adalah Senior Technical SEO Specialist & Content Editor di portal produktivitas https://kompreskilat.site.
Tugas Anda: Susun satu draf artikel blog EDUKATIF, MENDALAM, dan SANGAT LENGKAP dengan standar Google Helpful Content System & Kebijakan Kualitas Google AdSense.

${topicContext}

KETENTUAN KUALITAS WAJIB & NON-NEGOTIABLE:
1. PANJANG MINIMAL 700 KATA: Artikel harus panjang, komprehensif, kaya fakta praktis, dan mengupas tuntas masalah (panjang 700 - 1.200 kata). DILARANG KERAS menghasilkan artikel pendek/ringkasan (thin content).
2. TANPA BASA-BASI PEMBUKA: JANGAN PERNAH memulai dengan kalimat pengantar seperti "Tentu...", "Berikut draf...", "Sebagai SEO Specialist...", atau "Halo...". Baris pertama WAJIB langsung berupa Judul Artikel tingkat 1 (# [Judul]).
3. STRUKTUR HIERARKI MARKDOWN WAJIB:
   # [Judul Menarik, Berisi Target Keyword & Solusi Nyata]
   **Target Keyword:** [kata kunci utama dan variasi LSI] | **Estimasi Waktu Baca:** 5-7 menit
   **Meta Deskripsi:** [145-160 karakter ringkasan mengundang klik di mesin pencari]

   ## 1. Latar Belakang & Kendala Nyata Pengguna
   [Ulas situasi nyata, studi kasus frustrasi pelamar kerja, UMKM, atau staf kantor saat berurusan dengan ukuran berkas, cetak struk, atau format dokumen]

   ## 2. Mengapa Standar Dokumen Sangat Krusial
   [Jelaskan aturan resmi, misalnya batas sistem portal SSCASN/BKN maksimal 200KB, standar legalitas bukti nota transaksi, atau cara kerja mesin filter parser resume ATS]

   ## 3. Panduan Langkah Demi Langkah Menggunakan KompresKilat
   ### Langkah 1: Persiapan & Unggah Berkas
   [Penjelasan rinci tahapan pertama]
   ### Langkah 2: Konfigurasi Parameter (Ukuran, Kompresi, atau Format)
   [Penjelasan mendalam tips pengaturan]
   ### Langkah 3: Unduh & Verifikasi Hasil Akhir
   [Penjelasan cara cek ukuran file dan kualitas visual]

   ## 4. Keunggulan Privasi 100% Client-Side di KompresKilat
   [Jelaskan mengapa pemrosesan langsung di peramban pengguna (tanpa kirim data ke server pihak ketiga) menjamin keamanan data pribadi KTP, keuangan nota, dan dokumen penting]

   ## 5. Tips Pro & Praktik Terbaik Menghindari Kesalahan Fatal
   [Berikan 3-5 tips praktis profesional berpoin-poin tebal]

   ## 6. Pertanyaan yang Sering Diajukan (FAQ Schema & Jawaban Lengkap)
   - **Q: [Pertanyaan Umum 1]?**
     **A:** [Jawaban mendalam dan solutif]
   - **Q: [Pertanyaan Umum 2]?**
     **A:** [Jawaban mendalam dan solutif]
   - **Q: [Pertanyaan Umum 3]?**
     **A:** [Jawaban mendalam dan solutif]

4. TONE OF VOICE: Profesional, bersahabat, terstruktur rapi, menggunakan Bahasa Indonesia yang baku dan mengalir natural, serta menyisipkan tautan internal alami ke fitur kompreskilat.site.`;
}

/**
 * Helper untuk mem-parsing draf artikel SEO yang dihasilkan oleh Agen AI
 */
export function parseGeneratedSeoDraft(markdownText: string) {
  const lines = markdownText.split('\n');
  let title = 'Panduan Lengkap Utilitas Digital & Dokumen KompresKilat';
  let metaDescription = 'Panduan komprehensif cara mengelola berkas digital, kompresi dokumen, dan alat produktivitas kantor gratis di kompreskilat.site.';
  let keywords = 'kompres kilat, tools berkas gratis, produktivitas kantor, kompres dokumen';
  let category: 'Tips SEO' | 'Dokumen PDF' | 'Ekspedisi & Resi' | 'Gambar & Foto' | 'Spreadsheet & Excel' | 'Kecerdasan Buatan (AI)' | 'Keamanan Data' | 'Bisnis & UMKM' = 'Dokumen PDF';

  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.replace('# ', '').replace(/\*\*/g, '').trim();
    } else if (line.toLowerCase().includes('meta deskripsi:')) {
      const parsed = line.split(/meta deskripsi:/i)[1]?.replace(/\*\*/g, '').trim();
      if (parsed) metaDescription = parsed;
    } else if (line.toLowerCase().includes('target keyword:')) {
      const parsed = line.split(/target keyword:/i)[1]?.split('|')[0]?.replace(/\*\*/g, '').trim();
      if (parsed) keywords = parsed;
    }
  }

  // Kategorisasi otomatis berdasarkan kata kunci judul/isi
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('ktp') || lowerTitle.includes('foto') || lowerTitle.includes('gambar') || lowerTitle.includes('pasfoto')) {
    category = 'Gambar & Foto';
  } else if (lowerTitle.includes('invoice') || lowerTitle.includes('nota') || lowerTitle.includes('kwitansi') || lowerTitle.includes('umkm') || lowerTitle.includes('kasir')) {
    category = 'Bisnis & UMKM';
  } else if (lowerTitle.includes('resume') || lowerTitle.includes('cv') || lowerTitle.includes('ats') || lowerTitle.includes('ai')) {
    category = 'Kecerdasan Buatan (AI)';
  } else if (lowerTitle.includes('resi') || lowerTitle.includes('paket') || lowerTitle.includes('ekspedisi')) {
    category = 'Ekspedisi & Resi';
  } else if (lowerTitle.includes('pdf') || lowerTitle.includes('dokumen')) {
    category = 'Dokumen PDF';
  }

  // Tautkan ke tool yang relevan
  let relatedTool = {
    title: 'Gunakan Alat Terkait di KompresKilat',
    description: 'Akses alat pendukung dokumen gratis langsung di browsermu tanpa registrasi.',
    url: '/tools/image',
    icon: '⚡',
    buttonText: 'Coba Fitur Sekarang',
  };

  if (category === 'Gambar & Foto') {
    relatedTool = {
      title: 'Kompres Gambar & Foto KTP < 200KB',
      description: 'Kompres foto KTP, ijazah, dan gambar hingga di bawah 200KB tanpa buram untuk syarat CPNS/BUMN.',
      url: '/tools/image',
      icon: '🖼️',
      buttonText: 'Kompres Foto Sekarang',
    };
  } else if (category === 'Bisnis & UMKM') {
    relatedTool = {
      title: 'Pembuat Invoice, Nota & Kwitansi Instan',
      description: 'Buat tagihan profesional, nota kasir thermal 58mm/80mm, dan kwitansi resmi lengkap stempel lunas.',
      url: '/tools/invoice-generator',
      icon: '🧾',
      buttonText: 'Buat Invoice & Nota',
    };
  } else if (category === 'Kecerdasan Buatan (AI)') {
    relatedTool = {
      title: 'Cek Skor CV ATS & Format Resume',
      description: 'Evaluasi kesesuaian berkas lamaran kerja dengan standar parsing ATS HRD perusahaan modern.',
      url: '/tools/ats-resume',
      icon: '🎯',
      buttonText: 'Audit CV Sekarang',
    };
  } else if (category === 'Dokumen PDF') {
    relatedTool = {
      title: 'Alat Utilitas PDF Komprehensif',
      description: 'Kompres, gabungkan, dan kelola dokumen PDF resmi dengan kecepatan kilat dan aman.',
      url: '/tools/pdf',
      icon: '📄',
      buttonText: 'Kelola PDF Sekarang',
    };
  } else if (category === 'Ekspedisi & Resi') {
    relatedTool = {
      title: 'Cek Resi Ekspedisi Multi-Kurir',
      description: 'Lacak posisi paket Shopee Xpress, JNE, J&T, SiCepat, dan Anteraja dalam satu klik.',
      url: '/tools/tracking',
      icon: '📦',
      buttonText: 'Lacak Resi Paket',
    };
  }

  // Pembuatan Slug Ramah SEO
  const rawSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);

  const slug = rawSlug || `panduan-kompres-kilat-${Date.now()}`;
  const quality = analyzeArticleQuality(markdownText);

  return {
    title,
    slug,
    metaDescription,
    keywords,
    content: markdownText,
    category,
    wordCount: quality.wordCount,
    readingTime: quality.readingTime,
    isAdSenseSafe: quality.isAdSenseSafe,
    warnings: quality.warnings,
    relatedTool,
    status: 'draft' as const, // Selalu berstatus 'draft' secara default saat pertama kali dibuat
  };
}

/**
 * Pustaka Draf Artikel Fallback Mendalam (Masing-masing 750+ kata)
 * Digunakan jika koneksi internet terputus atau batas kuota API tercapai,
 * sehingga draf yang tersimpan selalu bebas dari resiko Thin Content AdSense.
 */
export const FALLBACK_SEO_ARTICLES_700W: string[] = [
  `# Panduan Lengkap: Cara Kompres Foto KTP & Pasfoto di Bawah 200KB Tanpa Buram untuk Syarat CPNS dan BUMN
**Target Keyword:** cara kompres foto ktp 200kb, kompres pasfoto cpns online, perkecil foto tanpa buram | **Estimasi Waktu Baca:** 6 menit
**Meta Deskripsi:** Pelajari panduan lengkap cara kompres foto KTP dan pasfoto lamaran kerja menjadi di bawah 200KB tanpa buram secara gratis dan aman 100% di browser.

## 1. Latar Belakang: Mengapa Berkas KTP Sering Ditolak Sistem SSCASN & BUMN?
Setiap tahunnya, jutaan pelamar kerja di Indonesia menghadapi momen krusial saat mendaftarkan diri pada seleksi Calon Pegawai Negeri Sipil (CPNS), Pegawai Pemerintah dengan Perjanjian Kerja (PPPK), maupun Rekrutmen Bersama BUMN. Salah satu kendala teknis yang paling sering memicu kepanikan adalah batasan ukuran unggahan berkas identitas digital.

Sistem pendaftaran daring nasional umumnya memberlakukan ketentuan ketat: berkas Kartu Tanda Penduduk (KTP) dan pasfoto latar belakang merah atau biru wajib berukuran maksimal **200 KB** dalam format JPG atau JPEG. Ironisnya, kamera smartphone masa kini rata-rata menghasilkan jepretan foto beresolusi tinggi dengan ukuran berkas berkisar antara 3 MB hingga 8 MB. Ketika pelamar mencoba mengompres berkas tersebut menggunakan aplikasi sembarangan, hasilnya kerap kali menjadi pecah, buram, dan teks Nomor Induk Kependudukan (NIK) tidak lagi terbaca oleh verifikator instansi.

Kegagalan pada tahap seleksi administrasi akibat dokumen buram tentu merupakan kerugian besar yang sebenarnya dapat dicegah dengan metode kompresi adaptif yang tepat.

---

## 2. Mengapa Standar Dokumen Kependudukan Sangat Krusial?
Dalam verifikasi berkas rekrutmen pemerintah dan perbankan, kejelasan dokumen identitas diatur oleh standar verifikasi visual dan Optical Character Recognition (OCR). Dokumen KTP yang sah harus memenuhi elemen-elemen berikut:
1. **Keterbacaan NIK 16 Digit**: Setiap angka pada NIK tidak boleh kabur atau berpiksel agar sistem verifikasi kependudukan Dukcapil dapat mencocokkan data pelamar secara otomatis.
2. **Kejelasan Pasfoto Pemilik**: Garis wajah dan tanda khusus harus tetap tajam dan tidak mengalami artefak kompresi berlebih.
3. **Ukuran File Optimal**: Berada di rentang aman 120 KB – 195 KB untuk memastikan server portal tidak menolak unggahan karena *exceed limit*.
4. **Keaslian Rasio Dimensi**: Tidak terdistorsi atau meregang akibat perubahan resolusi yang tidak proporsional.

---

## 3. Panduan Langkah Demi Langkah Kompres Foto KTP di KompresKilat
Untuk memperoleh dokumen KTP berkualitas tinggi dengan bobot di bawah 200 KB, Anda dapat memanfaatkan fitur [Kompres Gambar & Foto KTP](/tools/image) di KompresKilat dengan langkah praktis berikut:

### Langkah 1: Siapkan Foto KTP dengan Pencahayaan Merata
Letakkan fisik e-KTP Anda di atas permukaan datar berwarna putih atau netral. Pastikan cahaya ruangan cukup terang dan tidak memantulkan kilau lampu (glare) pada lapisan plastik KTP. Ambil foto tepat dari arah atas secara tegak lurus (tegak 90 derajat).

### Langkah 2: Buka Fitur Kompres Gambar di KompresKilat
Akses peramban Anda di HP atau Laptop dan buka alat [Kompres Gambar Online](/tools/image). Unggah foto KTP yang baru saja Anda ambil.

### Langkah 3: Pilih Preset Target "200 KB (Syarat CPNS/BUMN)"
KompresKilat telah menyediakan tombol preset otomatis yang dirancang khusus untuk portal SSCASN. Cukup klik preset **"Pas 200 KB"**. Algoritma cerdas KompresKilat akan menyesuaikan level *lossless chroma subsampling* dan kompresi kanvas sehingga ukuran berkas menyusut tepat di angka 150 KB – 180 KB tanpa mengurangi ketajaman teks NIK.

### Langkah 4: Tinjau Pratinjau & Unduh Berkas
Periksa pratinjau hasil sebelum mengunduh. Pastikan seluruh nama lengkap, tempat tanggal lahir, dan masa berlaku KTP terbaca jernih. Klik tombol **"Unduh Foto Siap Unggah"**. Dokumen Anda siap dilampirkan ke sistem SSCASN!

---

## 4. Keunggulan Privasi 100% Client-Side di KompresKilat
Keamanan data identitas kependudukan adalah hal yang tidak boleh dikompromikan. Banyak situs kompresi daring konvensional mewajibkan berkas Anda diunggah terlebih dahulu ke server penyimpanan jarak jauh (remote server), yang berpotensi menimbulkan celah kebocoran data pribadi KTP atau NIK kepada pihak ketiga.

Di KompresKilat, kami menerapkan standar **Zero-Knowledge Privacy**. Seluruh proses pengolahan piksel, penyesuaian resolusi, dan kompresi berkas dilakukan **100% langsung di dalam peramban perangkat Anda** (menggunakan teknologi HTML5 Canvas & WebAssembly). Berkas foto KTP Anda tidak pernah dikirim, disimpan, atau melewati jaringan server kami. Anda bahkan dapat mematikan koneksi internet setelah halaman terbuka dan kompresi tetap berjalan dengan sempurna!

---

## 5. Tips Tambahan Menghindari Kesalahan Administrasi CPNS
- **Hindari Mengirim Foto via Chat WhatsApp Sebelum Kompres**: Aplikasi pengirim pesan sering kali menerapkan kompresi agresif sekunder yang merusak metadata dan ketajaman teks. Selalu gunakan file asli dari galeri kamera.
- **Perhatikan Format Berkas Akhir**: Jika portal SSCASN meminta format .jpg, pastikan ekstensi berkas Anda berakhiran .jpg atau .jpeg, bukan .webp atau .png. KompresKilat menyediakan konverter format terintegrasi.
- **Gunakan Alat Sensor NIK untuk Keperluan Non-Resmi**: Jika Anda mengirimkan KTP untuk keperluan transaksi sewa atau administrasi umum non-pemerintah, gunakan alat [Sensor KTP & NIK Otomatis](/tools/censor-ktp) kami untuk menutupi digit sensitif demi pencegahan penyalahgunaan pinjaman online ilegal.

---

## 6. Pertanyaan yang Sering Diajukan (FAQ)
- **Q: Apakah layanan kompres foto KTP di KompresKilat berbayar?**
  **A:** Layanan ini 100% gratis tanpa batasan jumlah berkas dan tanpa perlu mendaftar atau membuat akun.
- **Q: Mengapa hasil kompresi saya tetap jernih meski ukurannya turun dari 5MB menjadi 180KB?**
  **A:** KompresKilat membuang data metadata kamera (EXIF) yang tidak diperlukan dan menerapkan algoritma kuantisasi warna adaptif yang mempertahankan ketajaman tepi kontras teks.
- **Q: Bisakah alat ini digunakan untuk pasfoto lamaran kerja dengan latar belakang merah atau biru?**
  **A:** Sangat bisa. Anda dapat mengompres pasfoto 3x4 maupun 4x6 untuk memenuhi kualifikasi unggahan formulir pendaftaran kerja apapun.`,

  `# Solusi Lengkap: Cara Membuat Invoice, Nota Kasir Thermal & Kwitansi Resmi Online Gratis untuk Pelaku UMKM
**Target Keyword:** cara membuat nota thermal online, cetak struk kasir 58mm gratis, aplikasi kasir gratis tanpa langganan | **Estimasi Waktu Baca:** 7 menit
**Meta Deskripsi:** Panduan praktis bagi pemilik toko dan UMKM untuk menerbitkan invoice resmi, nota kasir thermal 58mm/80mm, dan kwitansi lengkap stempel lunas gratis tanpa biaya langganan bulanan.

## 1. Beban Biaya Aplikasi POS Bulanan bagi Pemilik Toko & UMKM
Di era digitalisasi usaha, para pelaku Usaha Mikro, Kecil, dan Menengah (UMKM)—mulai dari pemilik kedai kopi, toko kelontong, butik pakaian, bengkel motor, apotek herbal, hingga penyedia jasa freelance—dituntut untuk memberikan bukti transaksi yang tertib dan profesional kepada para konsumennya.

Namun kendala nyata yang dihadapi pelaku usaha pemula adalah mahalnya biaya langganan software kasir (Point of Sale/POS) modern. Banyak vendor aplikasi POS di pasaran membebankan biaya langganan berkisar antara Rp 150.000 hingga Rp 500.000 per bulan per kasir, belum termasuk biaya tambahan jika ingin mengaktifkan fitur cetak struk thermal atau laporan perpajakan. Bagi UMKM yang baru merintis atau memiliki margin tipis, biaya langganan tetap tersebut menjadi beban operasional yang cukup berat.

Di sisi lain, mengandalkan nota tulis tangan menggunakan buku nota kertas karbon manual sering kali tampak kurang profesional, rentan salah hitung, serta tidak praktis saat pelanggan meminta dikirimkan bukti pembayaran digital via WhatsApp.

---

## 2. Standar Hukum Bukti Transaksi Usaha di Indonesia
Berdasarkan tata kelola keuangan bisnis dan administrasi perpajakan yang berlaku, dokumen transaksi resmi memiliki klasifikasi dan fungsinya masing-masing:
1. **Invoice (Faktur Tagihan)**: Diterbitkan sebelum pelunasan dilakukan. Wajib memuat batas jatuh tempo (*due date*), nomor rekening bank tujuan, rincian biaya pengiriman, dan rincian PPN jika bisnis Anda berstatus Pengusaha Kena Pajak (PKP).
2. **Nota Penjualan Kasir**: Bukti transaksi tunai langsung di tempat yang memuat daftar belanjaan, harga satuan, subtotal, nominal uang tunai yang diserahkan pelanggan, dan jumlah kembalian (*cash change*).
3. **Kwitansi Pembayaran**: Bukti sah bahwa sejumlah dana telah efektif diterima oleh pihak penjual, dilengkapi kalimat nominal terbilang huruf dan cap tanda tangan pengesahan.

---

## 3. Langkah Praktis Membuat Dokumen di KompresKilat
Kini Anda tidak perlu lagi membeli software mahal atau berkutat dengan template spreadsheet Excel yang rumit. Anda dapat memanfaatkan fitur [Pembuat Invoice, Nota & Kwitansi Instan](/tools/invoice-generator) di KompresKilat:

### Langkah 1: Pilih Jenis Dokumen & Format Kertas Kasir
Buka peramban Anda dan kunjungi halaman [Pembuat Invoice & Nota](/tools/invoice-generator). Pada tab **Format**, tentukan jenis dokumen yang ingin Anda terbitkan:
- Pilih **Invoice** untuk penagihan berjangka kepada klien atau mitra bisnis.
- Pilih **Nota** untuk transaksi kasir harian toko.
- Pilih **Kwitansi** untuk tanda terima pelunasan resmi.
Sesuaikan format kertas: Anda dapat memilih **Kertas A4 / A5** untuk cetak dokumen besar, atau format **Thermal 80mm** dan **Thermal 58mm** untuk printer kasir mini Bluetooth.

### Langkah 2: Masukkan Identitas Usaha & Unggah Logo Toko
Ketik nama toko atau merek usaha Anda, alamat lengkap, dan nomor kontak WhatsApp. Anda juga dapat mengunggah logo toko berformat PNG atau JPG. Logo ini dapat diatur posisinya secara bebas (*drag and drop*) di atas lembar kerja pratinjau.

### Langkah 3: Rincikan Item Produk atau Jasa
Masukkan nama produk, kuantitas, harga satuan, serta persentase diskon promo (jika ada). Sistem akan secara otomatis menghitung subtotal, PPN, dan Grand Total secara akurat hingga angka desimal terakhir, menghindarkan Anda dari risiko kesalahan perhitungan manual.

### Langkah 4: Bubuhkan Cap Stempel Dinas Digital & Tanda Tangan
Aktifkan fitur **Cap Stempel Toko**. Pilih bentuk stempel (bulat dinas konsentris atau stempel kotak toko modern), pilih warna tinta (biru dinas, merah lunas, atau ungu), serta ubah teks stempel sesuai nama toko Anda. Anda bahkan dapat mengatur derajat kemiringan stempel agar terlihat seperti stempel basah manual asli. Jika diperlukan, goreskan tanda tangan Anda langsung di layar sentuh ponsel.

### Langkah 5: Cetak Langsung atau Simpan sebagai PDF
Klik tombol **Cetak Dokumen**. Sistem akan membuka dialog print bawaan peramban Anda. Anda dapat langsung memilih printer thermal kasir USB/Bluetooth Anda, atau memilih opsi "Save as PDF" untuk mengirimkan bukti pembayaran beresolusi tajam langsung ke nomor WhatsApp pelanggan Anda.

---

## 4. Keunggulan Arsitektur Client-Side: Kerahasiaan Data Usaha Terjamin
Banyak pemilik bisnis merasa khawatir data omset, daftar pelanggan, dan nominal transaksi rahasia mereka terekam oleh penyedia aplikasi gratisan.

Di KompresKilat, seluruh kalkulasi keuangan dan lembar dokumen diproses **100% secara lokal di dalam browser Anda**. Tidak ada data penjualan, nomor rekening, maupun daftar transaksi yang dikirimkan ke server kami. Usaha Anda bebas beroperasi secara mandiri, aman, dan tanpa jejak digital di pihak ketiga.

---

## 5. Pertanyaan yang Sering Diajukan (FAQ)
- **Q: Apakah saya bisa mencetak struk kasir langsung ke printer thermal Bluetooth dari HP Android?**
  **A:** Ya! Anda cukup menghubungkan printer kasir mini Bluetooth Anda ke HP, buka browser Chrome, buat nota di KompresKilat, lalu klik Cetak dan pilih printer Bluetooth Anda.
- **Q: Apakah ada batasan jumlah invoice yang bisa saya buat per hari?**
  **A:** Tidak ada batasan sama sekali. Anda dapat menerbitkan ratusan nota transaksi kasir setiap hari tanpa biaya langganan sepeser pun.
- **Q: Apakah hasil cetak invoice di kertas A4 terlihat resmi dan profesional?**
  **A:** Sangat resmi. Tata letak KompresKilat dirancang mengikuti standar faktur korporat modern dengan tipografi bersih, garis tepi presisi, dan barcode transaksi otomatis.`,

  `# Panduan Terpadu: Cara Mengompres & Menggabungkan Dokumen PDF Berkas Administrasi Kantor Tanpa Rusak
**Target Keyword:** cara kompres pdf online gratis, cara gabung file pdf resmi, perkecil ukuran pdf kantor | **Estimasi Waktu Baca:** 7 menit
**Meta Deskripsi:** Panduan lengkap cara mengompres ukuran file PDF dan menggabungkan banyak dokumen menjadi satu berkas rapi secara online, gratis, dan 100% aman privasi.

## 1. Tantangan Pengelolaan Berkas PDF di Lingkungan Kantor & Rekrutmen
Format Portable Document Format (PDF) telah menjadi standar universal dalam pertukaran berkas administrasi perkantoran, surat perjanjian kerja (SPK), laporan keuangan tahunan, hingga pengumpulan berkas lamaran kerja di seluruh dunia. Keunggulan utama PDF terletak pada konsistensi tata letaknya: dokumen akan selalu tampil identik baik dibuka di ponsel Android, iPhone, tablet, maupun komputer desktop.

Namun di balik keunggulannya, PDF kerap kali menimbulkan kendala teknis akibat ukuran berkas yang membengkak (*bloated file size*). Dokumen yang memuat banyak halaman hasil pemindaian (scan) scanner fisik beresolusi 300 DPI sering kali memiliki ukuran puluhan megabite (MB). Akibatnya:
- Surel (email) gagal terkirim karena melebihi batas lampiran server (biasanya 10 MB hingga 25 MB).
- Portal pendaftaran beasiswa, rekrutmen CPNS, dan lelang tender menolak unggahan dokumen yang melebihi 1 MB atau 2 MB.
- Memori penyimpanan smartphone cepat penuh hanya karena beberapa berkas PDF berbobot berat.

Selain kendala ukuran, masalah lain yang kerap dihadapi staf administrasi adalah kebutuhan untuk menggabungkan (merge) beberapa lembar berkas terpisah—seperti Surat Lamaran, CV, Ijazah, Transkrip Nilai, dan Sertifikat Pelatihan—menjadi satu kesatuan urutan berkas PDF yang sistematis.

---

## 2. Mengapa Banyak Layanan PDF Online Berbahaya bagi Privasi Anda?
Mayoritas situs web utilitas PDF gratis di internet beroperasi dengan skema *server-side processing*. Artinya, setiap kali Anda mengunggah berkas PDF, dokumen tersebut dikirimkan ke server cloud yang lokasinya tidak diketahui dan disimpan dalam jangka waktu tertentu sebelum diunduh kembali.

Jika berkas yang Anda unggah memuat informasi rahasia—seperti rincian kontrak bisnis, rekening koran bank, Kartu Keluarga, atau data kepegawaian internal—Anda berisiko mengekspos data sensitif tersebut ke pihak ketiga yang berpotensi tidak bertanggung jawab.

Oleh karena itu, KompresKilat menghadirkan solusi pengolahan PDF modern berbasis **Client-Side WebAssembly (Wasm)**. Seluruh operasi kompresi dan penggabungan berkas dijalankan 100% di dalam RAM browser Anda tanpa perlu mengunggah satu byte pun ke server eksternal.

---

## 3. Langkah Demi Langkah Mengompres Dokumen PDF di KompresKilat
Untuk mengecilkan ukuran berkas PDF tanpa mengorbankan keterbacaan teks dan diagram di dalamnya:

### Langkah 1: Buka Fitur Kompres PDF
Akses menu [Alat Utilitas PDF KompresKilat](/tools/pdf). Anda akan diarahkan ke antarmuka kompresi PDF yang responsif.

### Langkah 2: Unggah Berkas PDF Anda
Seret dan lepaskan berkas PDF berbobot besar ke dalam kotak unggahan, atau klik tombol pilih berkas dari memori perangkat Anda.

### Langkah 3: Pilih Tingkat Kompresi Sesuai Kebutuhan
KompresKilat menyediakan opsi kompresi yang fleksibel:
- **Kompresi Ringan**: Mempertahankan resolusi grafis tertinggi, cocok untuk portofolio desain dan dokumen arsitektur.
- **Kompresi Sedang (Direkomendasikan)**: Menyeimbangkan ketajaman teks dengan penurunan ukuran hingga 60-70%, sangat ideal untuk laporan kantor dan lampiran email.
- **Kompresi Kuat (Ekstrem)**: Memaksimalkan pengurangan ukuran hingga di bawah 1 MB untuk memenuhi syarat portal rekrutmen ketat.

### Langkah 4: Unduh PDF yang Telah Dioptimasi
Proses pengolahan hanya memakan waktu 2 hingga 5 detik. Setelah selesai, bandingkan ukuran awal dengan ukuran akhir dan klik tombol **"Unduh Dokumen PDF"**.

---

## 4. Cara Menggabungkan Berkas PDF Terpisah Menjadi Satu Dokumen
Jika Anda perlu menggabungkan beberapa lembar berkas pendaftaran menjadi satu:
1. Buka fitur **Gabung PDF (Merge PDF)** di menu alat KompresKilat.
2. Unggah seluruh lembar dokumen yang ingin disatukan (misal: Berkas-1.pdf, Berkas-2.pdf, Berkas-3.pdf).
3. Atur urutan halaman dengan menyeret kartu dokumen sesuai hierarki yang diminta instansi (contoh: Surat Lamaran di urutan pertama, disusul CV, lalu Ijazah).
4. Klik tombol **"Gabungkan Semua PDF"**. Dokumen tunggal yang tertata rapi akan langsung tercipta dalam hitungan detik.

---

## 5. Pertanyaan yang Sering Diajukan (FAQ)
- **Q: Apakah teks di dalam dokumen PDF hasil kompresi tetap bisa disorot (highlight) dan dicari (searchable)?**
  **A:** Ya! KompresKilat mempertahankan lapisan teks vektor asli dokumen Anda, sehingga teks tetap dapat dicari menggunakan fungsi Ctrl+F dan tidak diubah menjadi gambar buram.
- **Q: Berapa jumlah maksimal halaman PDF yang dapat diproses?**
  **A:** Karena pemrosesan berjalan di memori browser Anda, Anda dapat mengolah dokumen hingga ratusan halaman tanpa batasan kuota.
- **Q: Apakah dokumen PDF yang diproteksi kata sandi bisa dikompres?**
  **A:** Anda dapat membuka proteksi sandi dokumen terlebih dahulu menggunakan fitur [Buka Password PDF](/tools/pdf-password) kami sebelum melakukan kompresi.`
];
