const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function generateSystemDesignPdf() {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Palet Warna UI Profesional
  const primaryColor = rgb(0.31, 0.27, 0.90); // Indigo 600
  const primaryLight = rgb(0.93, 0.94, 0.99); // Indigo 50
  const titleColor = rgb(0.09, 0.11, 0.19);   // Slate 900
  const textColor = rgb(0.20, 0.23, 0.28);    // Slate 700
  const mutedColor = rgb(0.40, 0.44, 0.53);   // Slate 500
  const emeraldColor = rgb(0.06, 0.58, 0.38); // Emerald 600
  const amberColor = rgb(0.85, 0.50, 0.05);   // Amber 600
  const cardBorder = rgb(0.85, 0.88, 0.94);
  const darkBg = rgb(0.06, 0.08, 0.14);

  let currentPage = null;
  let y = 0;
  let pageNumber = 0;

  function addNewPage() {
    currentPage = pdfDoc.addPage([595.28, 841.89]); // Standar A4
    pageNumber++;
    y = 800;

    // Header Dekoratif Halaman
    currentPage.drawRectangle({
      x: 36,
      y: 818,
      width: 523,
      height: 2,
      color: primaryColor,
    });

    currentPage.drawText('KOMPRESKILAT | DOKUMEN RANCANGAN SISTEM APLIKASI ANDROID (FITUR UTAMA)', {
      x: 36,
      y: 824,
      size: 7.5,
      font: fontBold,
      color: mutedColor,
    });

    // Footer Halaman
    currentPage.drawRectangle({
      x: 36,
      y: 35,
      width: 523,
      height: 1,
      color: cardBorder,
    });

    currentPage.drawText('Spesifikasi Arsitektur Sistem Mobile Android | Kerahasiaan Dokumen Terjaga', {
      x: 36,
      y: 24,
      size: 7.5,
      font: fontRegular,
      color: mutedColor,
    });

    currentPage.drawText(`Halaman ${pageNumber}`, {
      x: 512,
      y: 24,
      size: 7.5,
      font: fontBold,
      color: primaryColor,
    });

    y = 790;
  }

  function checkPageBreak(requiredHeight) {
    if (y - requiredHeight < 55) {
      addNewPage();
    }
  }

  function addCoverHeader() {
    addNewPage();

    // Banner Judul Utama
    currentPage.drawRectangle({
      x: 36,
      y: 665,
      width: 523,
      height: 120,
      color: primaryLight,
      borderColor: primaryColor,
      borderWidth: 1.5,
    });

    currentPage.drawText('DOKUMEN RANCANGAN SISTEM & ARSITEKTUR TEKNIS', {
      x: 52,
      y: 760,
      size: 10,
      font: fontBold,
      color: primaryColor,
    });

    currentPage.drawText('APLIKASI MOBILE ANDROID KOMPRESKILAT', {
      x: 52,
      y: 734,
      size: 18,
      font: fontBold,
      color: titleColor,
    });

    currentPage.drawText('Fokus Fitur Aplikasi Saja (Tanpa Blog): Kompresi File, PDF Editor, Smart Scan,', {
      x: 52,
      y: 712,
      size: 9,
      font: fontRegular,
      color: textColor,
    });

    currentPage.drawText('Tanda Tangan Digital, AI Generator, Tracking Resi, Arsitektur Flutter, Domain & Hosting', {
      x: 52,
      y: 698,
      size: 9,
      font: fontBold,
      color: primaryColor,
    });

    currentPage.drawText('Versi Dokumen: 1.0 (Produksi) | Tanggal: 1 November 2026 | Status: Disetujui', {
      x: 52,
      y: 680,
      size: 8,
      font: fontRegular,
      color: mutedColor,
    });

    y = 635;
  }

  function addSectionTitle(title) {
    checkPageBreak(50);
    y -= 12;
    currentPage.drawRectangle({
      x: 36,
      y: y - 4,
      width: 6,
      height: 18,
      color: primaryColor,
    });

    currentPage.drawText(title, {
      x: 48,
      y: y,
      size: 13,
      font: fontBold,
      color: titleColor,
    });

    currentPage.drawRectangle({
      x: 48,
      y: y - 7,
      width: 511,
      height: 1,
      color: primaryLight,
    });

    y -= 20;
  }

  function addSubSectionTitle(title) {
    checkPageBreak(35);
    y -= 8;
    currentPage.drawText(title, {
      x: 36,
      y: y,
      size: 10.5,
      font: fontBold,
      color: primaryColor,
    });
    y -= 15;
  }

  function addParagraph(text, isBold = false) {
    checkPageBreak(25);
    const words = text.split(' ');
    let line = '';
    const maxWidth = 523;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const testWidth = (isBold ? fontBold : fontRegular).widthOfTextAtSize(testLine, 8.5);

      if (testWidth > maxWidth && i > 0) {
        currentPage.drawText(line.trim(), {
          x: 36,
          y: y,
          size: 8.5,
          font: isBold ? fontBold : fontRegular,
          color: textColor,
        });
        y -= 13;
        checkPageBreak(20);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }

    if (line.trim().length > 0) {
      currentPage.drawText(line.trim(), {
        x: 36,
        y: y,
        size: 8.5,
        font: isBold ? fontBold : fontRegular,
        color: textColor,
      });
      y -= 14;
    }
  }

  function addBullet(bulletTitle, bulletDesc) {
    checkPageBreak(26);
    currentPage.drawRectangle({
      x: 44,
      y: y + 1,
      width: 4,
      height: 4,
      color: primaryColor,
    });

    currentPage.drawText(bulletTitle + ': ', {
      x: 56,
      y: y,
      size: 8.5,
      font: fontBold,
      color: titleColor,
    });

    const titleWidth = fontBold.widthOfTextAtSize(bulletTitle + ': ', 8.5);
    const availableFirstLineWidth = 523 - 20 - titleWidth;

    const words = bulletDesc.split(' ');
    let line = '';
    let isFirstLine = true;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const currentLimit = isFirstLine ? availableFirstLineWidth : 503;
      const testWidth = fontRegular.widthOfTextAtSize(testLine, 8.5);

      if (testWidth > currentLimit && i > 0) {
        currentPage.drawText(line.trim(), {
          x: isFirstLine ? 56 + titleWidth : 56,
          y: y,
          size: 8.5,
          font: fontRegular,
          color: textColor,
        });
        y -= 13;
        checkPageBreak(20);
        line = words[i] + ' ';
        isFirstLine = false;
      } else {
        line = testLine;
      }
    }

    if (line.trim().length > 0) {
      currentPage.drawText(line.trim(), {
        x: isFirstLine ? 56 + titleWidth : 56,
        y: y,
        size: 8.5,
        font: fontRegular,
        color: textColor,
      });
      y -= 14;
    }
  }

  function addInfoBox(boxTitle, points, borderColor = primaryColor, bgColor = primaryLight) {
    const estimatedHeight = 24 + points.length * 15;
    checkPageBreak(estimatedHeight + 15);

    currentPage.drawRectangle({
      x: 36,
      y: y - estimatedHeight,
      width: 523,
      height: estimatedHeight,
      color: bgColor,
      borderColor: borderColor,
      borderWidth: 1,
    });

    currentPage.drawText(boxTitle, {
      x: 46,
      y: y - 14,
      size: 9,
      font: fontBold,
      color: borderColor,
    });

    let currentY = y - 30;
    points.forEach((pt) => {
      currentPage.drawText(`[+] ${pt}`, {
        x: 48,
        y: currentY,
        size: 8,
        font: fontRegular,
        color: textColor,
      });
      currentY -= 14;
    });

    y = y - estimatedHeight - 14;
  }

  function addTable(headers, rows) {
    checkPageBreak(30 + rows.length * 20);
    const colWidths = [130, 200, 193];

    // Header Tabel
    currentPage.drawRectangle({
      x: 36,
      y: y - 18,
      width: 523,
      height: 18,
      color: primaryColor,
    });

    let curX = 42;
    headers.forEach((h, i) => {
      currentPage.drawText(h, {
        x: curX,
        y: y - 13,
        size: 8,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
      curX += colWidths[i];
    });

    y -= 18;

    // Baris Tabel
    rows.forEach((row, rIdx) => {
      checkPageBreak(22);
      const isEven = rIdx % 2 === 0;
      currentPage.drawRectangle({
        x: 36,
        y: y - 18,
        width: 523,
        height: 18,
        color: isEven ? rgb(0.98, 0.98, 1) : rgb(1, 1, 1),
        borderColor: cardBorder,
        borderWidth: 0.5,
      });

      let rX = 42;
      row.forEach((cell, cIdx) => {
        currentPage.drawText(cell, {
          x: rX,
          y: y - 13,
          size: 7.8,
          font: cIdx === 0 ? fontBold : fontRegular,
          color: cIdx === 0 ? titleColor : textColor,
        });
        rX += colWidths[cIdx];
      });

      y -= 18;
    });

    y -= 12;
  }

  // ====================== KONTEN DOKUMEN ======================
  addCoverHeader();

  // BAB 1: RINGKASAN EKSEKUTIF & TUJUAN
  addSectionTitle('1. Ringkasan Eksekutif & Karakteristik Aplikasi');
  addParagraph('Dokumen ini menyajikan rancangan sistem menyeluruh untuk pengembangan aplikasi mobile Android KompresKilat berbasis fitur murni (tanpa blog/artikel publikasi). Fokus utama aplikasi adalah menyediakan alat produktivitas digital utilitas dokumen, citra, kecerdasan buatan (AI), dan logistik pengiriman yang ringan, tanpa batas kuota, serta memprioritaskan privasi data.');
  addParagraph('Aplikasi mobile dirancang dengan filosofi "Client-Side First", di mana berkas dokumen sensitif (KTP, pas foto, kontrak kerja, ijazah, tanda tangan) diproses secara 100% lokal di memori perangkat smartphone pengunjung tanpa diunggah ke server database, sementara fitur berbasis komputasi awan (AI generator dan pelacak resi logistik) dialirkan melalui API proxy berkinerja tinggi.');

  addInfoBox('Prinsip Utama Arsitektur Sistem Mobile KompresKilat:', [
    'Zero Server File Upload: Berkas foto & PDF pribadi tidak pernah meninggalkan smartphone pengguna.',
    'Offline Capability: 80% fitur utilitas dapat dijalankan secara instan tanpa membutuhkan koneksi internet.',
    'High Performance Rendering: Manipulasi visual (kanvas teks, penajam dokumen, eraser) berjalan mulus di 60fps.',
    'Google Play Store & AdMob Ready: Mematuhi regulasi Scoped Storage Android 14/15 dan kebijakan iklan Google.'
  ]);

  // BAB 2: PEMILIHAN FRAMEWORK (MENGAPA FLUTTER)
  addSectionTitle('2. Analisis & Pemilihan Framework Mobile: Flutter');
  addParagraph('Dalam merancang aplikasi produktivitas dokumen berkecepatan tinggi, pemilihan teknologi sangat menentukan skalabilitas, kemudahan maintenance, dan performa olah citra grafis.');

  addTable(
    ['Kriteria Penilaian', 'Flutter (Dart) - DIREKOMENDASIKAN', 'React Native (JS/TS)'],
    [
      ['Rendering Engine', 'Impeller / Skia (Native C++ Skia Engine)', 'Bridge / Fabric ke Native Views'],
      ['Performa Olah Piksel', 'Sangat Tinggi (Canvas API, Shaders, Isolates)', 'Sedang (Lag saat manipulasi byte citra)'],
      ['Manipulasi PDF Lokal', 'Lengkap (syncfusion_flutter_pdf, pdf, printing)', 'Terbatas (Banyak modul third-party usang)'],
      ['Pencegahan Decompile', 'Kode Dart dikompilasi ke ARM Machine Code', 'JavaScript bundle mudah diekstrak/reverse'],
      ['Konsistensi UI Layar', '100% Identik di semua versi Android (Pixel Perfect)', 'Tergantung variasi OEM Android vendor'],
      ['Dukungan Offline Storage', 'Hive / Isar / SQLite native binding cepat', 'AsyncStorage (Lambat untuk file biner besar)']
    ]
  );

  addSubSectionTitle('Alasan Teknis Memilih Flutter untuk KompresKilat Android:');
  addBullet('Dukungan Dart Isolates (Multi-Threading)', 'Kompresi gambar berukuran 10MB atau PDF puluhan halaman dapat didelegasikan ke latar belakang (Background Worker Isolate) tanpa membuat antarmuka (UI) lag atau freeze.');
  addBullet('Ekosistem Library Pengolahan Citra & PDF', 'Flutter memiliki pustaka resmi seperti flutter_image_compress yang mengikat langsung ke pustaka native C++ libjpeg-turbo & libpng Android, menghasilkan kompresi yang jauh lebih cepat dibanding JavaScript.');
  addBullet('Akses Perangkat Keras Kamera Presisi', 'Modul kamera Flutter mendukung kustomisasi rasio dokumen (A4 & F4/Folio), autofokus presisi, serta konversi real-time stream piksel ke kanvas penajam dokumen.');

  // BAB 3: ARSITEKTUR FITUR LENGKAP APLIKASI
  addSectionTitle('3. Rincian & Spesifikasi Teknis Fitur Aplikasi (Fitur Saja)');
  addParagraph('Seluruh modul utilitas web KompresKilat dikelompokkan ke dalam 4 pilar arsitektur aplikasi Android:');

  addSubSectionTitle('A. Modul Pengolahan Dokumen & PDF (100% Local Processing):');
  addBullet('Direct PDF Text Editor', 'Mendeteksi matriks teks pada file PDF menggunakan syncfusion_flutter_pdf. Pengguna dapat mengetik ulang teks typo, menghapus kata dengan whiteout masking, menambah teks baru, dan menyeret (drag & drop) posisi teks ke koordinat manapun.');
  addBullet('Smart Scan & Fotocopy Digital', 'Mengambil citra kertas via kamera HP, menerapkan filter penajam kontras tinggi binarisasi (B/W) untuk memutihkan kertas kuning dan menghitamkan teks pekat, filter Magic Color untuk stempel/rapor, dan menyimpan ke PDF A4/F4.');
  addBullet('Tanda Tangan Digital Transparan', 'Signature Pad kanvas sentuh presisi tinggi (jari & stylus pen). Pilihan tinta hitam, biru, atau merah, dengan ekspor instan berformat PNG transparan (alpha channel murni) tanpa kotak putih.');
  addBullet('Kompres Dokumen PDF', 'Merampingkan struktur objek stream PDF, meresample gambar di dalam PDF, dan menghapus metadata redundan untuk memperkecil ukuran hingga 80% siap unggah email/portal.');
  addBullet('Kunci & Buka Password PDF', 'Penerapan enkripsi keamanan AES-256 standar perbankan serta utilitas dekripsi file PDF berpassword.');

  addSubSectionTitle('B. Modul Studio Foto & Citra Digital:');
  addBullet('Kompres & Konversi Gambar Massal', 'Mengecilkan foto KTP/ijazah ke batas < 200KB atau < 500KB dengan kompresi cerdas. Konversi massal JPG, PNG, WebP, dan format HEIC Apple.');
  addBullet('Ganti Background Pas Foto', 'Segmentasi objek manusia lokal (On-Device ML Kit Selfie Segmentation) untuk mengganti latar belakang ke Merah CPNS (ganjil), Biru (genap), atau Transparan PNG.');
  addBullet('Hapus Objek & Noda (Smart Eraser)', 'Kuas manual berbasis algoritma inpainting lokal untuk melenyapkan bayangan jari, noda kotoran kertas, dan debu pemindai tanpa merusak resolusi asli.');
  addBullet('Watermark Salinan Keamanan & KTP', 'Menempelkan cap teks transparan berulang secara diagonal (misal: "UNTUK KEPERLUAN VERIFIKASI BANK BCA") guna mencegah pencurian identitas.');
  addBullet('Sensor & Blur Dokumen Rahasia', 'Alat sensor selektif kotak hitam atau blur mozaik pada NIK KTP, nomor KK, dan tanda tangan.');
  addBullet('Meme & Image Caption Generator', 'Generator meme instan dengan tipografi font Impact tebal beroutline hitam, input teks atas-bawah real-time, dan unduh resolusi tinggi.');

  addSubSectionTitle('C. Modul Fitur Cerdas AI (Hybrid API Proxy):');
  addBullet('AI Slide Deck Presentation Generator', 'Menerima prompt topik ide bisnis/tugas kuliah, menyusun struktur outline slide lengkap melalui LLM Gemini, lalu mengonversi menjadi file Microsoft PowerPoint (.pptx) siap unduh.');
  addBullet('AI Poster & Brosur Studio', 'Membuat materi promosi visual flyer jualan atau pamflet bisnis siap cetak beresolusi 1080p.');
  addBullet('AI Document Summarizer', 'Mengekstrak teks dokumen PDF atau laporan panjang dan menghasilkan ringkasan poin-poin eksekutif dalam 5 detik.');
  addBullet('AI Resume & ATS Reviewer', 'Audit skor kecocokan CV pelamar terhadap sistem screening ATS HRD serta rekomendasi kata kunci industri.');

  addSubSectionTitle('D. Modul Logistik & Utilitas Bisnis UMKM:');
  addBullet('Cek Resi & Lacak Paket Multi-Ekspedisi', 'Pelacakan real-time nomor resi SPX (Shopee Express), JNE, J&T, SiCepat, Anteraja, dan Pos Indonesia dengan riwayat tersimpan offline di database lokal smartphone.');
  addBullet('Kalkulator Bisnis & UMKM', 'Simulasi margin keuntungan harga jual, diskon bertingkat (50% + 20%), dan kalkulasi PPh Final UMKM 0.5%.');
  addBullet('Konverter Spreadsheet & Arsip ZIP', 'Konversi dua arah Excel (.xlsx) ke CSV terformat rapi dan pembuat arsip multi-file ZIP.');

  // BAB 4: ALUR SISTEM & ARSITEKTUR DATA FLOW
  addSectionTitle('4. Alur Kerja Sistem & Diagram Arsitektur Data');
  addParagraph('Untuk memastikan performa tinggi dan keamanan data, alur aplikasi dibagi menjadi 3 jalur komunikasi utama:');

  addSubSectionTitle('Alur 1: Jalur Pengolahan Lokal On-Device (Zero Server Upload):');
  addParagraph('1. Pengguna memilih foto/dokumen PDF dari galeri, file manager (SAF), atau kamera smartphone.');
  addParagraph('2. Aplikasi memuat file ke dalam Sandbox Private App Storage (memori lokal cache).');
  addParagraph('3. Dart Isolate mengeksekusi operasi piksel / struktur vektor PDF (resize, kompresi, whiteout redaction, filter binarisasi, drawing signature).');
  addParagraph('4. File hasil diekspor langsung ke direktori Download/Pictures publik pengguna menggunakan MediaStore API Android.');
  addParagraph('5. File sementara di cache private otomatis dibersihkan saat proses selesai. Privasi pengguna terjamin 100%.');

  addSubSectionTitle('Alur 2: Jalur Hybrid Layanan AI (Reverse Proxy Backend):');
  addParagraph('1. Pengguna memasukkan topik presentasi atau mengunggah draf teks resume di aplikasi Flutter.');
  addParagraph('2. Aplikasi mengirimkan payload JSON terenkripsi HTTPS/TLS 1.3 ke endpoint Backend Proxy KompresKilat (misal: POST https://api.kompreskilat.site/api/ai-presentation).');
  addParagraph('3. Backend Proxy memvalidasi API Key rahasia internal dan rate-limit per-device (mencegah abuse).');
  addParagraph('4. Backend memanggil Google Gemini AI Studio API, memformat struktur respons ke berkas PPTX menggunakan pustaka officegen, dan mengembalikan file binary ke aplikasi mobile.');
  addParagraph('5. Aplikasi Flutter mengunduh dan menyajikan berkas presentasi siap buka di WPS Office / PowerPoint.');

  addSubSectionTitle('Alur 3: Jalur Pelacakan Nomor Resi Logistik (Multi-Courier Engine):');
  addParagraph('1. Pengguna memasukkan nomor resi dan memilih kurir ekspedisi (atau auto-detect via regex).');
  addParagraph('2. Aplikasi memeriksa cache lokal SQLite/Hive terlebih dahulu. Jika status paket sudah "DELIVERED", data langsung ditampilkan instan tanpa membebani server.');
  addParagraph('3. Jika paket masih dalam perjalanan, aplikasi menghubungi backend endpoint (GET https://api.kompreskilat.site/api/track?courier=spx&resi=SPXID...).');
  addParagraph('4. Backend melakukan orkestrasional query ke API ekspedisi resmi, menormalisasi riwayat perjalanan paket, dan menyimpannya ke cache lokal.');

  // BAB 5: DOMAIN, INFRASTRUKTUR & PILIHAN HOSTING
  addSectionTitle('5. Spesifikasi Domain, API Backend & Rekomendasi Hosting');
  addParagraph('Karena 80% fitur diproses secara lokal di ponsel, kebutuhan server backend hanya difokuskan untuk endpoint AI Proxy, pembuatan berkas PPTX, dan pelacakan resi ekspedisi. Hal ini membuat biaya server sangat hemat.');

  addSubSectionTitle('A. Konfigurasi Domain & Keamanan Jaringan:');
  addBullet('Domain Utama', 'Menggunakan domain produksi https://kompreskilat.site dengan subdomain khusus API: https://api.kompreskilat.site');
  addBullet('Cloudflare CDN & WAF', 'Mengamankan DNS via Cloudflare dengan SSL/TLS Full Strict, perlindungan mitigasi DDoS, dan Web Application Firewall (WAF) guna memblokir bot berbahaya.');
  addBullet('Network Security Config Android', 'Aplikasi mengunci komunikasi via Android Certificate Pinning & HSTS HTTPS untuk menggagalkan serangan Man-in-the-Middle (MitM).');

  addSubSectionTitle('B. Perbandingan & Rekomendasi Hosting Backend:');
  addTable(
    ['Opsi Infrastruktur', 'Spesifikasi & Keunggulan', 'Estimasi Biaya / Bulan'],
    [
      ['VPS Cloud (DigitalOcean / Hetzner) - SANGAT DIREKOMENDASIKAN', '2 vCPU, 4GB RAM, NVMe SSD, Docker Container, Nginx Reverse Proxy, Node.js API, Redis Cache. Biaya tetap terprediksi.', '~$6 - $12 / bulan (Sangat Terjangkau & Stabil)'],
      ['Google Cloud Run (Serverless Container)', 'Auto-scaling otomatis dari 0 hingga 1.000 container instance. Hanya membayar saat ada request request masuk.', '~$0 - $15 / bulan (Tergantung lonjakan trafik)'],
      ['Firebase Cloud Functions', 'Terintegrasi langsung dengan Firebase Auth & Crashlytics, namun cold-start sedikit lebih lambat untuk officegen.', '~$5 - $20 / bulan']
    ]
  );

  addInfoBox('Rekomendasi Arsitektur Server:', [
    'Backend Runtime: Node.js (Express / Fastify) dikemas dalam Docker Image.',
    'Reverse Proxy & SSL: Nginx dengan sertifikat otomatis Let\'s Encrypt + Cloudflare.',
    'Memory Cache: Redis untuk menyimpan data pelacakan resi ekspedisi selama 30 menit.',
    'Task Queue: BullMQ untuk mengantre pembuatan berkas PowerPoint kompleks.'
  ]);

  // BAB 6: KOMPONEN LAINNYA, STRUKTUR FOLDER & MONETISASI
  addSectionTitle('6. Struktur Arsitektur Kode, Penyimpanan & Monetisasi');
  addParagraph('Aplikasi Flutter disusun dengan pola Clean Architecture (Feature-First) yang memudahkan kerja tim pengembang dan pengujian otomatis (Unit Testing).');

  addSubSectionTitle('Struktur Direktori Proyek Flutter (lib/):');
  addParagraph('lib/');
  addParagraph(' |-- core/ (constants, theme Light/Dark, network Dio HTTP, utils MediaStore)');
  addParagraph(' |-- features/document_tools/ (PDF Editor, Smart Scan, E-Sign, Password)');
  addParagraph(' |-- features/photo_tools/ (Image Compress, Eraser, Watermark, Sensor, Meme)');
  addParagraph(' |-- features/ai_studio/ (Slide Maker PPTX, Image Upscale, Summarizer, Resume)');
  addParagraph(' |-- features/tracking/ (Cek Resi kurir multi-ekspedisi, local history cache)');
  addParagraph(' |-- main.dart (Entry point, provider scope, theme init)');

  addSubSectionTitle('Kepatuhan Google Play Store & Android 14/15:');
  addBullet('Scoped Storage Compliance', 'Aplikasi TIDAK meminta izin berbahaya seperti READ_EXTERNAL_STORAGE atau MANAGE_EXTERNAL_STORAGE. Seluruh interaksi file memakai Android Storage Access Framework (SAF) dan MediaStore.');
  addBullet('Monetisasi Ramah Pengguna (Google AdMob)', 'Penerapan Banner Ad adaptif di bagian bawah layar tanpa menutupi tombol simpan, Interstitial Ad dengan interval jeda wajar (setelah 3x proses kompresi berhasil), dan Rewarded Ad opsional untuk fitur AI intensif.');

  // BAB 7: KESIMPULAN & TAHAPAN IMPLEMENTASI (ROADMAP)
  addSectionTitle('7. Kesimpulan & Roadmap Implementasi');
  addParagraph('Rancangan sistem ini memberikan panduan teknis konkret untuk mengonversi fungsionalitas web KompresKilat ke dalam aplikasi mobile Android berperforma tinggi. Dengan memprioritaskan Flutter dan arsitektur pengolahan lokal, aplikasi menjamin kecepatan maksimal, biaya server minimal, dan kepuasan pengguna terbaik.');

  addTable(
    ['Fase Pengerjaan', 'Target Modul & Deliverable', 'Estimasi Waktu'],
    [
      ['Fase 1: Fondasi & UI Core', 'Setup Flutter project, Clean Architecture, Dark/Light Mode, Navigasi', 'Minggu 1'],
      ['Fase 2: Image & PDF Local Tools', 'Kompres gambar, Smart Scan kamera, E-Sign Pad, Watermark, PDF Editor', 'Minggu 2 - 3'],
      ['Fase 3: Backend Proxy & AI Engine', 'Dockerized Node.js API, integrasi Gemini AI PPTX, Cek Resi Logistik', 'Minggu 4'],
      ['Fase 4: Testing & Play Store Release', 'Pengujian perangkat Android 10-15, integrasi AdMob, rilis Google Play', 'Minggu 5']
    ]
  );

  // Simpan Dokumen PDF
  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(__dirname, 'Rancangan_Sistem_Aplikasi_Android_KompresKilat.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`PDF berhasil dibuat: ${outputPath} (${pdfBytes.length} bytes)`);

  // Salin juga ke direktori artifact agar bisa langsung diakses
  const artifactDir = 'C:\\Users\\HN\\.gemini\\antigravity\\brain\\6fc9235a-58ac-4767-b466-123af14dbf02';
  const artifactPath = path.join(artifactDir, 'Rancangan_Sistem_Aplikasi_Android_KompresKilat.pdf');
  try {
    fs.writeFileSync(artifactPath, pdfBytes);
    console.log(`PDF juga berhasil disalin ke artifact: ${artifactPath}`);
  } catch (err) {
    console.warn('Gagal menyalin ke artifact:', err.message);
  }
}

generateSystemDesignPdf().catch((err) => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
