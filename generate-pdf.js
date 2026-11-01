const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createBlueprintPdf() {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Palette Warna Modern
  const primaryColor = rgb(0.31, 0.27, 0.90); // Indigo 600
  const titleColor = rgb(0.09, 0.09, 0.15);   // Slate 900
  const textColor = rgb(0.20, 0.23, 0.28);    // Slate 700
  const mutedColor = rgb(0.40, 0.44, 0.52);   // Slate 500
  const lineBg = rgb(0.92, 0.94, 0.98);       // Light Indigo
  const cardBorder = rgb(0.85, 0.88, 0.94);

  let currentPage = null;
  let y = 0;
  let pageNumber = 0;

  function addNewPage() {
    currentPage = pdfDoc.addPage([595.28, 841.89]); // A4 Size
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

    currentPage.drawText('KOMPRESKILAT • BLUEPRINT PENGEMBANGAN APLIKASI ANDROID', {
      x: 36,
      y: 824,
      size: 8,
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

    currentPage.drawText('https://kompreskilat.site • Hak Cipta Dilindungi 2026', {
      x: 36,
      y: 24,
      size: 8,
      font: fontRegular,
      color: mutedColor,
    });

    currentPage.drawText(`Halaman ${pageNumber}`, {
      x: 510,
      y: 24,
      size: 8,
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
      y: 680,
      width: 523,
      height: 105,
      color: lineBg,
      borderColor: primaryColor,
      borderWidth: 1.5,
    });

    currentPage.drawText('BLUEPRINT & PANDUAN PENGEMBANGAN', {
      x: 52,
      y: 758,
      size: 11,
      font: fontBold,
      color: primaryColor,
    });

    currentPage.drawText('APLIKASI ANDROID KOMPRESKILAT', {
      x: 52,
      y: 732,
      size: 20,
      font: fontBold,
      color: titleColor,
    });

    currentPage.drawText('Arsitektur Teknis, Konversi Fitur Web ke Mobile, Integrasi AI Gemini,', {
      x: 52,
      y: 712,
      size: 9.5,
      font: fontRegular,
      color: textColor,
    });

    currentPage.drawText('Monetisasi Google AdMob, dan Kepatuhan Kebijakan Google Play Store', {
      x: 52,
      y: 698,
      size: 9.5,
      font: fontBold,
      color: primaryColor,
    });

    y = 650;
  }

  function addSectionTitle(title) {
    checkPageBreak(50);
    y -= 10;
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

    y -= 18;
    currentPage.drawRectangle({
      x: 36,
      y: y + 8,
      width: 523,
      height: 0.8,
      color: cardBorder,
    });
    y -= 6;
  }

  function addSubSectionTitle(subtitle) {
    checkPageBreak(30);
    y -= 4;
    currentPage.drawText(subtitle, {
      x: 36,
      y: y,
      size: 10.5,
      font: fontBold,
      color: primaryColor,
    });
    y -= 14;
  }

  function addParagraph(text, isBold = false) {
    const maxWidth = 523;
    const font = isBold ? fontBold : fontRegular;
    const size = 9;
    const words = text.split(' ');
    let line = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const width = font.widthOfTextAtSize(testLine, size);
      if (width > maxWidth && i > 0) {
        checkPageBreak(13);
        currentPage.drawText(line.trim(), {
          x: 36,
          y: y,
          size,
          font,
          color: textColor,
        });
        line = words[i] + ' ';
        y -= 13;
      } else {
        line = testLine;
      }
    }

    if (line.trim().length > 0) {
      checkPageBreak(13);
      currentPage.drawText(line.trim(), {
        x: 36,
        y: y,
        size,
        font,
        color: textColor,
      });
      y -= 14;
    }
  }

  function addBullet(bulletTitle, bulletDesc) {
    checkPageBreak(25);
    const size = 9;
    currentPage.drawText('•', {
      x: 42,
      y: y,
      size: 10,
      font: fontBold,
      color: primaryColor,
    });

    currentPage.drawText(bulletTitle + ': ', {
      x: 52,
      y: y,
      size,
      font: fontBold,
      color: titleColor,
    });

    const titleWidth = fontBold.widthOfTextAtSize(bulletTitle + ': ', size);
    const remainingWidth = 523 - (16 + titleWidth);

    // Hitung sisa teks deskripsi
    const words = bulletDesc.split(' ');
    let line = '';
    let isFirstLine = true;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const currentLimit = isFirstLine ? remainingWidth : 507;
      const width = fontRegular.widthOfTextAtSize(testLine, size);

      if (width > currentLimit && i > 0) {
        checkPageBreak(13);
        currentPage.drawText(line.trim(), {
          x: isFirstLine ? 52 + titleWidth : 52,
          y: y,
          size,
          font: fontRegular,
          color: textColor,
        });
        line = words[i] + ' ';
        y -= 13;
        isFirstLine = false;
      } else {
        line = testLine;
      }
    }

    if (line.trim().length > 0) {
      checkPageBreak(13);
      currentPage.drawText(line.trim(), {
        x: isFirstLine ? 52 + titleWidth : 52,
        y: y,
        size,
        font: fontRegular,
        color: textColor,
      });
      y -= 14;
    }
  }

  function addCalloutBox(title, text) {
    checkPageBreak(50);
    currentPage.drawRectangle({
      x: 36,
      y: y - 42,
      width: 523,
      height: 48,
      color: lineBg,
      borderColor: primaryColor,
      borderWidth: 1,
    });

    currentPage.drawText(title, {
      x: 48,
      y: y - 10,
      size: 9.5,
      font: fontBold,
      color: primaryColor,
    });

    currentPage.drawText(text, {
      x: 48,
      y: y - 26,
      size: 8.5,
      font: fontRegular,
      color: textColor,
    });

    y -= 54;
  }

  // ==========================================
  // ISI DOKUMEN BLUEPRINT
  // ==========================================

  addCoverHeader();

  addSectionTitle('1. Ringkasan Eksekutif & Pilihan Pendekatan Arsitektur Mobile');
  addParagraph('Website KompresKilat telah memiliki arsitektur hybrid yang sangat efisien: pemrosesan berkas lokal berbasis client-side yang hemat bandwidth server, ditambah backend API terenkripsi untuk fitur AI dan pelacakan resi. Dalam membawa ekosistem ini ke Android, terdapat 2 pendekatan utama yang dapat dipilih:');

  addSubSectionTitle('Pendekatan A: PWA / Trusted Web Activity (TWA) — Rekomendasi Instan (1 Hari)');
  addBullet('Cara Kerja', 'Mengemas website Next.js kompreskilat.site menggunakan protokol Google Chrome Custom Tabs (TWA / Bubblewrap).');
  addBullet('Waktu Pengerjaan', 'Hanya 1 - 2 hari kerja. Tidak perlu menulis ulang kode fitur yang sudah ada.');
  addBullet('Kelebihan', 'Ukuran APK sangat kecil (< 3 MB), otomatis terupdate setiap kali website diperbarui, dan 100% mematuhi Google Play Store.');
  addBullet('Monetisasi', 'Dapat menggunakan Google AdSense Web yang sudah terpasang atau ditambahkan Google AdMob Web SDK.');

  addSubSectionTitle('Pendekatan B: Cross-Platform Native (Flutter / React Native) — Rekomendasi Jangka Panjang');
  addBullet('Cara Kerja', 'Membangun aplikasi mobile mandiri dengan Flutter (Dart) atau React Native yang memanggil API KompresKilat.');
  addBullet('Waktu Pengerjaan', '2 - 3 minggu pengerjaan bertahap.');
  addBullet('Kelebihan', 'Akses kamera asli, integrasi notifikasi push resi paket di status bar, dan performa pemrosesan gambar offline 100%.');
  addBullet('Monetisasi', 'Integrasi Google AdMob Native (Banner, Interstitial saat selesai proses, dan Rewarded Video Ads).');

  addSectionTitle('2. Matriks Konversi Fitur Web ke Teknologi Android Native');
  addParagraph('Berikut adalah pemetaan setiap fitur di web kompreskilat.site beserta pustaka (library) dan komponen Android yang digunakan:');

  addBullet('1. Kompres Gambar KTP/CPNS', 'Gunakan pustaka "flutter_image_compress" (Flutter) atau "Luban Algorithm" / "Android Bitmap.compress(Bitmap.CompressFormat.JPEG, quality, stream)". Menghasilkan kompresi super cepat di bawah 200KB/500KB tanpa buram.');
  addBullet('2. Ganti Background & Hapus Objek', 'Gunakan "Google ML Kit Selfie Segmentation" untuk deteksi tubuh instan di perangkat tanpa internet, dan Custom Touch Canvas untuk kuas penghapus objek.');
  addBullet('3. Konversi Dokumen PDF ke Excel', 'Gunakan library "syncfusion_flutter_xlsio" atau "SheetJS (via WebView Headless)" untuk membaca baris tabel PDF dan mengekspor lembar kerja .xlsx murni.');
  addBullet('4. Pelacakan Paket All-Ekspedisi', 'Panggil endpoint API KompresKilat: "https://kompreskilat.site/api/track" (meneruskan nomor AWB & kurir ke Binderbyte). Simpan riwayat resi di SQLite / Room Database lokal.');
  addBullet('5. AI Poster & Brosur Studio', 'Panggil API "https://kompreskilat.site/api/ai-image" atau gunakan "Google AI Client SDK for Android" dengan model Gemini 3.8 Flash untuk menyusun konsep visual dan merendernya di Custom Painter.');
  addBullet('6. AI Presentation Maker', 'Panggil API "https://kompreskilat.site/api/ai-presentation" untuk mendapatkan struktur slide JSON, lalu ekspor file PowerPoint (.pptx) menggunakan modul pembuat berkas presentasi mobile.');
  addBullet('7. Pembuat Arsip ZIP Multi-File', 'Gunakan pustaka bawaan "java.util.zip" pada Android native atau package "archive" di Flutter.');

  addCalloutBox('KEUNGGULAN UTAMA DI GOOGLE PLAY STORE (PRIVACY-FIRST)', 'Fitur pemrosesan foto dan PDF berjalan di memori lokal smartphone pengguna (tanpa upload database). Jadikan ini sebagai nilai jual utama (Unique Selling Point) pada deskripsi Play Store!');

  addSectionTitle('3. Strategi Monetisasi Google AdMob (Pengganti AdSense di Mobile)');
  addParagraph('Di platform Android, Google AdSense digantikan oleh Google AdMob. Strategi penempatan iklan terbaik yang mematuhi kebijakan Google Play:');

  addBullet('AdMob Adaptive Banner', 'Diletakkan di bagian paling bawah layar (bottom pinned) dengan ukuran responsif. Selalu aktif selama pengguna memilih menu.');
  addBullet('AdMob Interstitial Ad (Iklan Transisi)', 'Dimunculkan HANYA setelah pengguna berhasil mengompresi gambar atau mengunduh berkas (frekuensi dibatasi maksimal 1 kali per 3 menit agar pengguna nyaman).');
  addBullet('AdMob Rewarded Video Ad (Pilihan)', 'Beri pengguna opsi menonton 1 video iklan singkat berdurasi 15 detik untuk mendapatkan kuota "Generate AI Poster HD Unlimited".');

  addSectionTitle('4. Panduan Perizinan & Kepatuhan Google Play Data Safety');
  addParagraph('Google Play Store memiliki aturan ketat terkait keamanan data (*Data Safety*). Konfigurasi izin (*Permissions*) pada AndroidManifest.xml:');

  addBullet('android.permission.INTERNET', 'Wajib untuk menghubungkan fitur Pelacakan Paket dan AI Gemini.');
  addBullet('android.permission.READ_MEDIA_IMAGES', 'Wajib pada Android 13+ untuk memilih foto yang akan dikompresi dari galeri.');
  addBullet('Formulir Data Safety Play Console', 'Deklarasikan bahwa aplikasi "Tidak Membagikan Data Pengguna ke Pihak Ketiga" karena seluruh foto diproses secara lokal pada perangkat pengguna.');

  addSectionTitle('5. Roadmap Pelaksanaan Pengembangan 4 Minggu (Siap Rilis)');
  addBullet('Minggu 1 (Inisialisasi)', 'Setup project Flutter/Kotlin, implementasi tema warna Indigo KompresKilat, Bottom Navigation Bar, dan struktur navigasi layar.');
  addBullet('Minggu 2 (Fitur Inti Berkas)', 'Implementasi modul kompresi gambar, pengubah background pas foto, dan konverter PDF ke Excel.');
  addBullet('Minggu 3 (Fitur AI & Lacak Resi)', 'Integrasi API Pelacakan Resi Binderbyte dengan Linimasa visual, integrasi Google Gemini Studio untuk pembuatan poster dan materi presentasi.');
  addBullet('Minggu 4 (Monetisasi & Publikasi)', 'Integrasi Google AdMob SDK, pengujian pada berbagai perangkat Android (Xiaomi, Samsung, Oppo), pembuatan ikon & screenshot promosi, dan upload AAB ke Google Play Console.');

  addCalloutBox('REKOMENDASI SOLUSI TERCEPAT (PUBLISH DALAM 1 HARI)', 'Jika Anda ingin aplikasi hadir di Google Play Store dalam hitungan hari tanpa biaya pembuatan aplikasi baru, gunakan pendekatan TWA (Trusted Web Activity). Tim pengembang siap membantu proses konversinya.');

  const pdfBytes = await pdfDoc.save();

  // Simpan ke berbagai lokasi
  const publicPath = path.join(__dirname, 'public', 'Panduan_Pengembangan_Aplikasi_Android_KompresKilat.pdf');
  const rootPath = path.join(__dirname, 'Panduan_Pengembangan_Aplikasi_Android_KompresKilat.pdf');
  const brainPath = 'C:\\Users\\HN\\.gemini\\antigravity\\brain\\6fc9235a-58ac-4767-b466-123af14dbf02\\Panduan_Pengembangan_Aplikasi_Android_KompresKilat.pdf';

  fs.writeFileSync(publicPath, pdfBytes);
  fs.writeFileSync(rootPath, pdfBytes);
  try {
    fs.writeFileSync(brainPath, pdfBytes);
  } catch (err) {
    console.error('Brain copy err:', err);
  }

  console.log('PDF generated successfully at:', publicPath);
}

createBlueprintPdf().catch(console.error);
