const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Complete features dataset with in-depth technical explanations & operational guidelines
const FEATURES_DATA = [
  // ==========================================
  // KATEGORI 1: DOKUMEN & PDF
  // ==========================================
  {
    category: '1. DOKUMEN & PDF',
    id: 'pdf-editor',
    title: 'Direct PDF Text Editor',
    route: '/tools/pdf-editor',
    summary: 'Aplikasi editor PDF langsung di browser untuk memperbaiki typo, menambahkan teks baru, atau membubuhkan catatan tanpa mengubah layout asli.',
    howItWorks: 'Memanfaatkan engine PDF.js dan pdf-lib client-side untuk memetakan koordinat teks pada viewport canvas secara presisi. Modifikasi disimpan langsung ke dalam binary stream PDF tanpa diunggah ke server.',
    guide: [
      'Pilih file PDF yang ingin diedit dari perangkat Anda.',
      'Arahkan kursor ke area teks yang ingin diubah atau klik area kosong untuk menambah baris teks baru.',
      'Sesuaikan ukuran font, warna teks, dan perataan yang diinginkan.',
      'Klik tombol "Simpan & Unduh PDF" untuk mendapatkan hasil revisi secara instan.'
    ],
    tips: 'Sangat cocok untuk koreksi cepat surat resmi, perbaikan biodata pada formulir, atau menambahkan catatan penting pada modul kuliah.'
  },
  {
    category: '1. DOKUMEN & PDF',
    id: 'pdf-compress',
    title: 'Kompres Dokumen PDF',
    route: '/tools/pdf',
    summary: 'Memperkecil ukuran file PDF dokumen tugas kantor, skripsi, atau syarat seleksi CPNS/BUMN dengan tetap menjaga keterbacaan teks.',
    howItWorks: 'Menganalisis objek bitmap dan stream vektor di dalam PDF. Gambar beresolusi tinggi di-downsample dan dikompresi menggunakan algoritma lossy/lossless terkontrol sehingga file menyusut drastis.',
    guide: [
      'Unggah berkas PDF yang berukuran besar.',
      'Pilih tingkat kompresi: Standar CPNS (< 500 KB / < 1 MB), Kompresi Ekstrem, atau Kualitas Tinggi.',
      'Tekan tombol "Mulai Kompres PDF".',
      'Lihat perbandingan ukuran sebelum dan sesudah, lalu klik "Download Hasil PDF".'
    ],
    tips: 'Gunakan preset CPNS/BUMN untuk memastikan dokumen lolos seleksi berkas sistem otomatis SSCASN tanpa ditolak batas kuota.'
  },
  {
    category: '1. DOKUMEN & PDF',
    id: 'pdf-merge',
    title: 'Penggabung Berkas PDF (PDF Merge)',
    route: '/tools/pdf-merge',
    summary: 'Menyatukan beberapa file PDF (seperti CV, KTP, ijazah, transkrip nilai, sertifikat) menjadi satu dokumen utuh yang rapi dan berurutan.',
    howItWorks: 'Membaca struktur trailer dan xref table dari masing-masing file PDF secara lokal, kemudian menyusun ulang objek halaman ke dalam satu catalog document baru via pdf-lib.',
    guide: [
      'Unggah dua atau lebih file PDF yang ingin disatukan.',
      'Gunakan fitur drag-and-drop untuk mengatur urutan susunan halaman sesuai kebutuhan.',
      'Periksa preview susunan dokumen pada layar.',
      'Klik tombol "Gabungkan Berkas Sekarang" dan unduh PDF gabungan.'
    ],
    tips: 'Pastikan dokumen penting seperti CV berada di lembar pertama diikuti surat lamaran dan lampiran portofolio.'
  },
  {
    category: '1. DOKUMEN & PDF',
    id: 'pdf-to-word',
    title: 'Konversi PDF ke Word (.docx) dengan OCR',
    route: '/tools/pdf-to-word',
    summary: 'Mengubah lembaran PDF teks maupun hasil pemindaian (scan) menjadi berkas Microsoft Word siap edit tanpa mengetik ulang manual.',
    howItWorks: 'Mengintegrasikan Tesseract.js (Optical Character Recognition) berbasis WebAssembly untuk mendeteksi karakter teks pada dokumen scan, lalu mengemasnya menjadi berkas OpenXML .docx standar via JSZip.',
    guide: [
      'Pilih dokumen PDF yang ingin dikonversi.',
      'Pilih mode: Ekstraksi Teks Cepat atau Pindai Mendalam (OCR Bahasa Indonesia/Inggris).',
      'Tunggu beberapa detik saat mesin OCR mengenali baris kalimat.',
      'Klik "Download Berkas Word (.docx)" dan buka langsung di Microsoft Word atau Google Docs.'
    ],
    tips: 'Untuk hasil scan, pastikan resolusi dokumen awal minimal 200 DPI agar akurasi pembacaan karakter mencapai di atas 98%.'
  },
  {
    category: '1. DOKUMEN & PDF',
    id: 'pdf-to-ppt',
    title: 'Konversi PDF ke PowerPoint (PPTX)',
    route: '/tools/pdf-to-ppt',
    summary: 'Mengubah naskah materi atau laporan PDF menjadi slide presentasi PowerPoint (.pptx) berformat 16:9 siap tayang.',
    howItWorks: 'Mengekstrak visual halaman PDF beresolusi tajam dan menyematkannya secara proporsional ke dalam template slide OpenXML menggunakan library PptxGenJS di browser.',
    guide: [
      'Unggah file naskah PDF atau e-book yang ingin dijadikan slide.',
      'Pilih rasio tampilan slide (16:9 Widescreen atau 4:3 Standard).',
      'Tekan "Konversi ke PPTX".',
      'Unduh file PowerPoint dan sesuaikan layout animasi sesuai preferensi Anda.'
    ],
    tips: 'Gunakan fitur ini untuk merangkum modul materi kuliah atau laporan kerja bulanan menjadi presentasi singkat.'
  },
  {
    category: '1. DOKUMEN & PDF',
    id: 'pdf-to-excel',
    title: 'Konversi PDF ke Excel (.xlsx)',
    route: '/tools/pdf-to-excel',
    summary: 'Mengekstrak tabel angka, rekening koran, atau laporan keuangan PDF menjadi baris dan kolom spreadsheet Excel dinamis.',
    howItWorks: 'Memindai pola batas garis (bounding box) dan jarak antar karakter tabular pada PDF, lalu merekonstruksinya menjadi struktur worksheet SheetJS/XLSX.',
    guide: [
      'Pilih file PDF yang memiliki tabel data angka.',
      'Verifikasi area tabel yang terdeteksi secara otomatis.',
      'Klik tombol "Ekstrak ke Spreadsheet Excel".',
      'Unduh file .xlsx dan lakukan perhitungan formula matematika dengan mudah.'
    ],
    tips: 'Sangat berguna bagi staf akuntansi untuk mengolah laporan mutasi bank dan faktur pajak tanpa repot re-input manual.'
  },
  {
    category: '1. DOKUMEN & PDF',
    id: 'pdf-password',
    title: 'Kunci & Buka Password PDF',
    route: '/tools/pdf-password',
    summary: 'Memberi kata sandi enkripsi 128/256-bit AES pada dokumen rahasia, atau membuka password file milik sendiri agar mudah diakses.',
    howItWorks: 'Memanfaatkan library kriptografi client-side (@pdfsmaller/pdf-encrypt dan pdf-decrypt) untuk menerapkan atau menghapus hak izin dokumen PDF.',
    guide: [
      'Pilih dokumen PDF yang hendak dilindungi atau dibuka.',
      'Untuk proteksi: masukkan password baru dan konfirmasi.',
      'Untuk buka kunci: masukkan password valid saat ini untuk menghapus kewajiban input password permanen.',
      'Unduh dokumen hasil perlindungan atau dokumen terbuka.'
    ],
    tips: 'Selalu catat password yang Anda pasang. Gunakan proteksi ini untuk berkas rahasia seperti slip gaji, kontrak bisnis, dan polis asuransi.'
  },
  {
    category: '1. DOKUMEN & PDF',
    id: 'scan-dokumen',
    title: 'Smart Scan & Fotocopy Dokumen',
    route: '/tools/scan-dokumen',
    summary: 'Memindai berkas fisik menggunakan kamera smartphone, membersihkan background menjadi putih bersih seperti fotocopy, dan menyimpannya ke PDF.',
    howItWorks: 'Menggunakan algoritma adaptive thresholding dan contrast adjustment pada HTML5 Canvas untuk menghilangkan bayangan meja dan noda kertas.',
    guide: [
      'Arahkan kamera smartphone ke lembar dokumen atau unggah foto kertas yang sudah ada.',
      'Atur titik potong (crop) pada keempat sudut kertas.',
      'Pilih filter: "Fotocopy Bersih (Hitam Putih)", "Magic Color", atau "Greyscale".',
      'Klik "Ekspor ke PDF" untuk mengunduh dokumen siap cetak.'
    ],
    tips: 'Pastikan pencahayaan cukup merata saat memotret berkas agar tepi kertas terdeteksi otomatis dengan sempurna.'
  },
  {
    category: '1. DOKUMEN & PDF',
    id: 'organize-pdf',
    title: 'Atur, Hapus & Ekstrak PDF (Organize & Split)',
    route: '/tools/organize-pdf',
    summary: 'Mengatur ulang urutan lembaran PDF, menghapus halaman kosong, atau memisahkan bab tertentu ke dalam file PDF baru.',
    howItWorks: 'Membuat visual thumbnail untuk setiap lembar PDF. Perubahan susunan atau penghapusan halaman diproses instan melalui array manipulation pada page index pdf-lib.',
    guide: [
      'Unggah file PDF multi-halaman.',
      'Geser (drag) thumbnail halaman untuk menukar posisi susunan.',
      'Klik ikon tempat sampah pada halaman yang ingin dibuang (misal lembar kosong).',
      'Pilih opsi "Ekstrak Halaman Terpilih" atau "Simpan Susunan Baru", lalu download hasilnya.'
    ],
    tips: 'Sangat praktis untuk membersihkan halaman lampiran yang tidak diperlukan sebelum dikirim ke instansi resmi.'
  },
  {
    category: '1. DOKUMEN & PDF',
    id: 'page-number-pdf',
    title: 'Beri Nomor Halaman PDF',
    route: '/tools/page-number-pdf',
    summary: 'Menambahkan penomoran halaman otomatis pada dokumen skripsi, laporan magang, atau buku saku dengan pilihan format beragam.',
    howItWorks: 'Menghitung total lembar PDF dan mencetak teks nomor halaman pada posisi koordinat header/footer yang ditentukan dengan opsi melewati cover (halaman judul).',
    guide: [
      'Pilih file PDF yang belum memiliki penomoran halaman.',
      'Pilih letak nomor: Bawah Tengah, Bawah Kanan, Atas Tengah, dll.',
      'Atur format nomor (misal "1", "Halaman 1 dari 10", atau angka romawi "i, ii, iii").',
      'Centang opsi "Lewati Cover Pertama" bila lembar pertama adalah sampul.',
      'Klik "Terapkan Penomoran" dan unduh berkas yang sudah rapi.'
    ],
    tips: 'Gunakan font dan ukuran proporsional (ukuran 10-11 pt) agar sesuai dengan standar pedoman penulisan ilmiah kampus.'
  },
  {
    category: '1. DOKUMEN & PDF',
    id: 'image-to-pdf',
    title: 'Konversi Gambar ke PDF',
    route: '/tools/image-to-pdf',
    summary: 'Menggabungkan banyak file foto (JPG, PNG, WebP) menjadi satu dokumen PDF standar cetak berukuran A4 atau Letter.',
    howItWorks: 'Memuat gambar ke memori browser, menghitung rasio aspek foto, dan menempatkannya ke dalam lembar kerja PDF dengan margin rapi.',
    guide: [
      'Pilih atau tarik beberapa foto sekaligus ke area unggah.',
      'Atur orientasi halaman (Potret atau Lanskap) dan margin (Kecil, Standar, Tanpa Margin).',
      'Susun urutan foto menggunakan tombol panah atau drag-and-drop.',
      'Klik "Konversi ke PDF" dan unduh dokumen Anda.'
    ],
    tips: 'Cocok untuk membuat dokumen katalog produk UMKM atau laporan nota fisik belanja operasional kantor.'
  },
  {
    category: '1. DOKUMEN & PDF',
    id: 'pdf-to-image',
    title: 'Konversi PDF ke Gambar (High DPI)',
    route: '/tools/pdf-to-image',
    summary: 'Mengekstrak setiap lembar halaman dokumen PDF menjadi file foto JPG atau PNG tajam hingga resolusi 300 DPI.',
    howItWorks: 'Merender canvas per halaman melalui worker PDF.js dengan skala pembesaran tinggi (scale factor 2.0 - 3.0) untuk menjaga detail font kecil.',
    guide: [
      'Unggah dokumen PDF.',
      'Pilih format gambar yang diinginkan (JPG untuk ukuran kecil, PNG untuk ketajaman teks maksimal).',
      'Pilih resolusi: Standar (150 DPI) atau High Quality (300 DPI).',
      'Unduh foto satu per satu atau unduh seluruh halaman sekaligus dalam format arsip .ZIP.'
    ],
    tips: 'Gunakan format PNG jika gambar akan diposting ke media sosial atau disisipkan ke slide presentasi agar teks tidak blur.'
  },
  {
    category: '1. DOKUMEN & PDF',
    id: 'html-to-pdf',
    title: 'Konversi HTML ke PDF',
    route: '/tools/html-to-pdf',
    summary: 'Merender kode HTML atau template dokumen (surat dinas, nota, invoice, CV) menjadi lembar PDF standar cetak.',
    howItWorks: 'Memanfaatkan engine HTML renderer terisolasi dalam iframe sandbox dan mencetaknya ke format PDF dengan preservasi styling CSS murni.',
    guide: [
      'Tempelkan kode HTML Anda atau pilih salah satu template bawaan yang disediakan.',
      'Lihat live-preview di sisi kanan layar.',
      'Klik tombol "Cetak / Simpan PDF" untuk mengekspor dokumen.'
    ],
    tips: 'Manfaatkan CSS media print @page { margin: 15mm; } untuk hasil cetak dokumen yang rapi di atas kertas fisik.'
  },
  {
    category: '1. DOKUMEN & PDF',
    id: 'advanced-pdf',
    title: 'Perkakas PDF Tingkat Lanjut (Suite)',
    route: '/tools/advanced-pdf',
    summary: 'Paket utilitas canggih: Memperbaiki PDF rusak (repair), konversi arsip standar PDF/A ISO, perbandingan teks dua file (diff), dan penerjemah PDF.',
    howItWorks: 'Menggabungkan modul validasi struktur PDF, parsing header ISO 19005 (PDF/A), serta pembanding string teks tingkat baris.',
    guide: [
      'Pilih tab alat yang dibutuhkan: Perbaiki Berkas, Arsip PDF/A, Bandingkan PDF, atau Terjemahkan Dokumen.',
      'Unggah berkas yang hendak diproses.',
      'Ikuti instruksi khusus pada masing-masing tab dan unduh hasil perbaikan atau hasil analisis komparasi.'
    ],
    tips: 'Format PDF/A sangat direkomendasikan untuk arsip jangka panjang di institusi pemerintah atau perpustakaan digital.'
  },

  // ==========================================
  // KATEGORI 2: FOTO & GAMBAR
  // ==========================================
  {
    category: '2. FOTO & GAMBAR',
    id: 'image-compress',
    title: 'Kompres & Konversi Gambar (KTP/Foto)',
    route: '/tools/image',
    summary: 'Mengecilkan ukuran file foto JPG, PNG, dan WebP hingga 90% lebih hemat tanpa buram untuk memenuhi syarat seleksi online.',
    howItWorks: 'Memanfaatkan Web Workers dan browser-image-compression untuk melakukan kompresi adaptif langsung di memori RAM browser pengguna.',
    guide: [
      'Pilih foto atau dokumen identitas yang ingin dikompresi.',
      'Pilih preset ukuran cepat: CPNS (< 200 KB), Menengah (< 500 KB), atau Kualitas Maksimal.',
      'Pilih format keluaran: JPG, PNG, atau WebP.',
      'Klik "Mulai Kompres Gambar" lalu download hasilnya.'
    ],
    tips: 'Preset CPNS < 200KB dirancang presisi pada rentang 150-190KB agar pasti lolos validasi upload portal resmi.'
  },
  {
    category: '2. FOTO & GAMBAR',
    id: 'remove-bg',
    title: 'Ganti Background Pas Foto (Merah / Biru / AI)',
    route: '/tools/remove-bg',
    summary: 'Menghapus latar belakang foto otomatis dan menggantinya ke warna Merah (tahun lahir ganjil), Biru (tahun lahir genap), atau transparan.',
    howItWorks: 'Menggunakan model machine learning MediaPipe Selfie Segmentation yang berjalan langsung di browser tanpa mengirim foto ke cloud luar.',
    guide: [
      'Unggah foto diri setengah badan.',
      'Tunggu beberapa detik saat AI memisahkan subjek dari background.',
      'Pilih warna background: Merah Resmi (#D32F2F), Biru Resmi (#1976D2), Putih, atau Transparan (PNG).',
      'Download pas foto beresolusi tajam siap pakai.'
    ],
    tips: 'Gunakan foto dengan pencahayaan seimbang dan kontras rambut yang jelas terhadap latar belakang untuk hasil potongan paling rapi.'
  },
  {
    category: '2. FOTO & GAMBAR',
    id: 'object-eraser',
    title: 'Hapus Objek di Foto (Quantum Eraser)',
    route: '/tools/object-eraser',
    summary: 'Menghilangkan objek pengganggu, orang lewat, watermark, atau coretan tanggal pada foto menggunakan kuas inpainting cerdas.',
    howItWorks: 'Menggunakan algoritma content-aware inpainting lokal yang merekonstruksi tekstur piksel sekitar ke area yang dihapus.',
    guide: [
      'Unggah foto yang memiliki objek pengganggu.',
      'Atur ukuran kuas (brush size).',
      'Usapkan kuas tepat di atas objek yang ingin dihilangkan.',
      'Klik "Hapus Objek" dan simpan foto yang sudah bersih.'
    ],
    tips: 'Usapkan kuas sedikit melebihi tepi objek agar algoritma inpainting dapat membaurkan gradasi warna secara natural.'
  },
  {
    category: '2. FOTO & GAMBAR',
    id: 'resize-pasfoto',
    title: 'Resize Pas Foto & Tanda Tangan',
    route: '/tools/resize-pasfoto',
    summary: 'Menyesuaikan dimensi foto ke standar resmi ukuran cetak 2x3 cm, 3x4 cm, 4x6 cm atau ukuran piksel kustom tanda tangan digital.',
    howItWorks: 'Mengatur canvas clipping path sesuai rasio aspek standar cetak fisik dengan rasio DPI 300 sehingga proporsi wajah tidak gepeng/terdistorsi.',
    guide: [
      'Pilih foto yang ingin diubah ukurannya.',
      'Pilih ukuran preset: 2x3 cm, 3x4 cm, 4x6 cm, atau Kustom Piksel.',
      'Geser area crop agar posisi kepala dan pundak berada simetris di tengah.',
      'Klik "Simpan Foto" untuk mengunduh berkas dengan dimensi presisi.'
    ],
    tips: 'Ukuran 3x4 dan 4x6 cm adalah ukuran paling umum untuk kelengkapan administrasi ijazah, SKCK, buku nikah, dan CPNS.'
  },
  {
    category: '2. FOTO & GAMBAR',
    id: 'censor-ktp',
    title: 'Sensor & Blur KTP / Dokumen Rahasia',
    route: '/tools/censor-ktp',
    summary: 'Menutupi informasi sensitif (NIK KTP, nomor rekening, alamat, tanda tangan) dengan kotak hitam pekat atau efek blur mozaik.',
    howItWorks: 'Menerapkan overlay canvas pixelation atau fill rect hitam pada koordinat yang dipilih pengguna. Data yang ditutup terhapus permanen dari bitmap gambar.',
    guide: [
      'Unggah foto KTP, buku tabungan, atau dokumen penting Anda.',
      'Pilih jenis sensor: "Kotak Hitam Sensor" atau "Blur Mozaik".',
      'Tarik kursor kotak di atas angka NIK atau informasi yang ingin dirahasiakan.',
      'Klik "Unduh Dokumen Tersensor".'
    ],
    tips: 'Gunakan alat ini saat diminta mengirim foto KTP untuk verifikasi sewa kendaraan atau lamaran agar NIK tidak disalahgunakan pinjol ilegal.'
  },
  {
    category: '2. FOTO & GAMBAR',
    id: 'passport-id-utility',
    title: 'Global ID & Passport Utility',
    route: '/tools/passport-id-utility',
    summary: 'Menyesuaikan pasfoto paspor standar global (35x45mm Schengen/UK, 2x2 inci US/Visa) dengan panduan garis biometrik dan cap watermark resmi.',
    howItWorks: 'Menampilkan overlay panduan biometrik mata, dagu, dan puncak kepala (ICAO standard) untuk memastikan foto lolos mesin verifikasi imigrasi.',
    guide: [
      'Pilih negara tujuan atau standar paspor (Schengen 35x45mm, US Visa 51x51mm, Paspor RI).',
      'Posisikan foto wajah agar sejajar dengan garis bantu mata dan proporsi kepala (70-80% area foto).',
      'Beri cap watermark tujuan (opsional, misal "HANYA UNTUK VISA JEPANG").',
      'Unduh file digital siap unggah atau lembar cetak 4R isi 6 lembar.'
    ],
    tips: 'Foto paspor internasional mewajibkan ekspresi netral tanpa senyum lebar, kedua telinga terlihat jelas, dan latar belakang putih polos.'
  },
  {
    category: '2. FOTO & GAMBAR',
    id: 'tanda-tangan',
    title: 'Tanda Tangan Digital Transparan (e-Signature)',
    route: '/tools/tanda-tangan',
    summary: 'Membuat goresan tanda tangan basah digital di layar touchscreen atau mouse dan mengunduhnya sebagai PNG berlatar belakang transparan.',
    howItWorks: 'Menangkap koordinat vektor sentuhan dengan interpolasi kurva Bézier halus pada canvas HTML5, lalu mengekspornya ke format PNG 32-bit dengan alpha channel transparan.',
    guide: [
      'Goreskan tanda tangan Anda pada area pad interaktif menggunakan jari, stylus pen, atau mouse.',
      'Atur ketebalan garis dan warna tinta (Hitam Resmi atau Biru Pulpen).',
      'Gunakan tombol "Bersihkan" jika ingin mengulang goresan.',
      'Klik "Download Tanda Tangan PNG Transparan".'
    ],
    tips: 'Tanda tangan PNG transparan ini dapat langsung ditempel ke dokumen Word atau PDF tanpa ada kotak putih yang menutupi teks dokumen.'
  },
  {
    category: '2. FOTO & GAMBAR',
    id: 'watermark',
    title: 'Watermark Dokumen & KTP',
    route: '/tools/watermark',
    summary: 'Membubuhkan teks cap pengaman transparan miring di atas dokumen penting agar tidak dapat disalahgunakan pihak ketiga.',
    howItWorks: 'Merender teks dinamis berulang dengan derajat kemiringan 45 derajat dan opasitas terkontrol pada lapisan atas gambar.',
    guide: [
      'Unggah foto berkas atau KTP.',
      'Ketik teks pengaman, contoh: "VERIFIKASI PENDAFTARAN KERJA PT XYZ - TGL 08/11/2026".',
      'Atur tingkat transparansi (opasitas) dan ukuran font agar teks di bawahnya tetap terbaca.',
      'Download dokumen ber-watermark.'
    ],
    tips: 'Sertakan nama instansi penerima dan tanggal verifikasi di dalam teks watermark untuk mencegah kebocoran data di masa mendatang.'
  },
  {
    category: '2. FOTO & GAMBAR',
    id: 'pro-editor',
    title: 'Pro Photo & Document Editor',
    route: '/tools/pro-editor',
    summary: 'Editor grafis lengkap: rotasi sudut, crop bebas, penyesuaian kecerahan, kontras, saturasi, dan filter pemutih kertas dokumen.',
    howItWorks: 'Memanipulasi matriks piksel ImageData (RGBA) melalui WebGL/Canvas untuk rendering filter secara real-time pada 60 FPS.',
    guide: [
      'Buka foto yang ingin diperbaiki kualitasnya.',
      'Gunakan slider untuk menyesuaikan kecerahan (*brightness*) dan ketajaman teks (*contrast*).',
      'Putar posisi foto jika miring menggunakan tombol rotasi 90 derajat.',
      'Terapkan perubahan dan unduh gambar beresolusi tinggi.'
    ],
    tips: 'Menaikkan kontras dan menurunkan kecerahan sangat efektif untuk memperjelas tulisan tangan pada lembar kuitansi atau ijazah lama.'
  },
  {
    category: '2. FOTO & GAMBAR',
    id: 'meme-generator',
    title: 'Meme & Caption Generator',
    route: '/tools/meme-generator',
    summary: 'Membuat gambar meme lucu dan poster kutipan viral dengan tipografi gaya Impact klasik atau font modern.',
    howItWorks: 'Menyusun layer gambar dan teks dua baris (Header & Footer) dengan outline hitam tebal di atas kanvas grafis.',
    guide: [
      'Pilih template meme viral yang tersedia atau unggah foto kreasi sendiri.',
      'Ketik kalimat teks atas (Top Text) dan kalimat teks bawah (Bottom Text).',
      'Atur ukuran teks dan warna huruf.',
      'Unduh meme dalam format JPG siap bagikan ke WhatsApp dan media sosial.'
    ],
    tips: 'Gunakan huruf kapital (UPPERCASE) dengan gaya font Impact untuk tampilan meme klasik yang mudah dibaca sepintas.'
  },

  // ==========================================
  // KATEGORI 3: AI & KREATIF
  // ==========================================
  {
    category: '3. AI & KREATIF',
    id: 'ai-image-tools',
    title: 'AI Photo Enhancer & Upscale (4x HD)',
    route: '/ai-image-tools',
    summary: 'Memperjelas foto buram, menajamkan detail wajah, dan meningkatkan resolusi gambar hingga 4 kali lipat secara otomatis.',
    howItWorks: 'Menerapkan model neural network super-resolution berbasis AI untuk memprediksi dan mengisi piksel yang hilang pada gambar berkualitas rendah.',
    guide: [
      'Unggah foto lama, gambar buram, atau avatar beresolusi kecil.',
      'Pilih faktor perbesaran: 2x HD atau 4x Ultra HD.',
      'Klik tombol "Tingkatkan Ketajaman (Upscale)".',
      'Bandingkan perbandingan sebelum dan sesudah dengan slider interaktif, lalu unduh hasilnya.'
    ],
    tips: 'Sangat ampuh untuk merestorasi foto profil lawas atau gambar produk katalog sebelum dipasang pada banner promosi.'
  },
  {
    category: '3. AI & KREATIF',
    id: 'ai-presentation-maker',
    title: 'AI Presentation Generator (Auto PPTX)',
    route: '/ai-presentation-maker',
    summary: 'Menyusun materi presentasi lengkap dari topik singkat atau ringkasan ide menjadi file PowerPoint (.pptx) berstruktur rapi.',
    howItWorks: 'Memanfaatkan model bahasa besar untuk menyusun outline slide (Judul, Poin Kunci, Penjelasan) dan mengonversinya langsung ke format slide PPTX.',
    guide: [
      'Ketik topik presentasi (contoh: "Strategi Digital Marketing UMKM 2026").',
      'Tentukan jumlah slide yang diinginkan (5 - 15 slide) dan target audiens.',
      'Pilih palet tema desain presentasi.',
      'Klik "Generate Slide" dan unduh berkas .pptx siap presentasi.'
    ],
    tips: 'Anda bisa mengedit isi teks dan mengganti gambar di dalam Microsoft PowerPoint setelah berkas diunduh.'
  },
  {
    category: '3. AI & KREATIF',
    id: 'ats-resume',
    title: 'AI Resume / CV Reviewer & ATS Score Checker',
    route: '/tools/ats-resume',
    summary: 'Menganalisis keramahan format CV terhadap mesin ATS (Applicant Tracking System), memberikan saran perbaikan, menyediakan 3 template profesional, edit langsung, pasang foto formal, dan unduh ke format Word (.docx) & PDF.',
    howItWorks: 'Memeriksa rasio kata kunci aksi (action verbs), struktur hierarki heading, keberadaan nomor kontak/email, dan mengevaluasi format terhadap standar seleksi HRD modern.',
    guide: [
      'Ketik atau paste teks resume Anda pada kolom editor, atau unggah file PDF yang ada.',
      'Tentukan target posisi pekerjaan (misal: "Senior Digital Marketing").',
      'Klik "Analisis Skor ATS" untuk melihat nilai skor (0-100%) dan rekomendasi perbaikan.',
      'Pilih tab "Pilihan Template CV" untuk memilih layout (ATS Standar, Korporat Profesional, atau Kreatif Minimalis).',
      'Unggah foto formal (opsional) dan lakukan penyuntingan teks langsung pada preview template.',
      'Unduh hasil akhir dalam format dokumen Microsoft Word (.docx) atau cetak langsung ke format PDF.'
    ],
    tips: 'Hindari penggunaan tabel kompleks atau grafik berlebihan pada resume ATS. Gunakan poin-poin terukur (misal: "Meningkatkan penjualan 38%") agar skor ATS tinggi.'
  },
  {
    category: '3. AI & KREATIF',
    id: 'document-summarizer',
    title: 'AI Document Summarizer',
    route: '/tools/document-summarizer',
    summary: 'Meringkas bab buku, artikel ilmiah, naskah skripsi, atau PDF panjang menjadi intisari ringkas dalam hitungan detik.',
    howItWorks: 'Mengekstrak teks dokumen lalu memprosesnya melalui model ekstraktif/abstraktif untuk memilah premis utama dan argumen kunci.',
    guide: [
      'Tempelkan naskah teks panjang atau unggah file dokumen PDF.',
      'Pilih gaya ringkasan: "Poin-Poin Utama", "Ringkasan Eksekutif", atau "Tanya-Jawab Singkat".',
      'Klik "Mulai Meringkas Dokumen".',
      'Salin hasil ringkasan atau unduh dalam format teks bersih.'
    ],
    tips: 'Gunakan mode Poin-Poin Utama untuk memahami dokumen kontrak hukum atau laporan penelitian ilmiah tebal secara cepat.'
  },
  {
    category: '3. AI & KREATIF',
    id: 'creative-studio',
    title: 'Creative Studio & Kartu Ucapan',
    route: '/tools/creative-studio',
    summary: 'Merancang kartu ucapan hari raya (Idul Fitri, Natal), ulang tahun, hari guru, dan hari nasional, serta editor grafis cepat.',
    howItWorks: 'Menyediakan template kartu vektor dinamis berbasis SVG dan kanvas interaktif untuk kustomisasi nama penerima dan pesan doa.',
    guide: [
      'Pilih kategori kartu ucapan yang diinginkan.',
      'Ketik nama pengirim, nama penerima, dan pesan hangat personal.',
      'Pilih ornamen dekoratif dan palet warna latar.',
      'Unduh kartu ucapan beresolusi tajam dalam format gambar JPG/PNG.'
    ],
    tips: 'Sertakan foto keluarga atau logo bisnis Anda di dalam kartu ucapan untuk memberikan kesan yang lebih personal dan profesional.'
  },
  {
    category: '3. AI & KREATIF',
    id: 'poster-generator',
    title: 'AI Poster & Brosur Studio',
    route: '/tools/poster-generator',
    summary: 'Merancang pamflet promosi diskon, brosur produk kuliner, dan poster seminar beresolusi tinggi untuk kebutuhan pemasaran.',
    howItWorks: 'Mengombinasikan sistem tipografi dinamis, layer grid fleksibel, dan preset grafis siap cetak ukuran A4.',
    guide: [
      'Pilih tipe desain: Brosur Kuliner, Flyer Diskon Toko, atau Poster Acara.',
      'Isi data judul promo, periode diskon, dan nomor kontak pemesanan.',
      'Unggah foto produk unggulan Anda.',
      'Ekspor ke gambar tajam atau dokumen PDF siap kirim ke percetakan.'
    ],
    tips: 'Gunakan kontras warna yang tegas pada teks promo utama (misal: kuning di atas hitam) agar langsung menarik perhatian calon pelanggan.'
  },
  {
    category: '3. AI & KREATIF',
    id: 'batch-compress',
    title: 'Batch Kompres & ZIP',
    route: '/tools/batch-compress',
    summary: 'Mengecilkan puluhan hingga ratusan foto sekaligus dalam satu kali klik dan mengemasnya ke dalam satu file arsip .ZIP.',
    howItWorks: 'Menjalankan antrean pemrosesan paralel (multithreading) via Web Worker di browser sehingga tidak membebani memori laptop/HP.',
    guide: [
      'Pilih atau tarik banyak file gambar sekaligus ke jendela browser.',
      'Pilih tingkat kompresi yang diinginkan.',
      'Pantau progress bar kompresi secara real-time.',
      'Klik "Unduh Semua File (.ZIP)" untuk mendapatkan seluruh hasil kompresi dalam satu paket.'
    ],
    tips: 'Sangat efisien untuk fotografer acara atau pengelola toko online yang ingin mengunggah katalog foto ratusan produk.'
  },

  // ==========================================
  // KATEGORI 4: BISNIS & KALKULATOR
  // ==========================================
  {
    category: '4. BISNIS & KALKULATOR',
    id: 'invoice-generator',
    title: 'Pembuat Invoice, Nota & Kwitansi',
    route: '/tools/invoice-generator',
    summary: 'Membuat faktur tagihan resmi, nota penjualan toko, dan kwitansi kasir dengan logo bisnis, tanda tangan, stempel digital, serta unduh format PDF (A4, A5, dan Struk Thermal 58/80mm).',
    howItWorks: 'Menghitung subtotal, diskon item, PPN 11/12%, dan grand total secara otomatis secara real-time, lalu merendernya ke dokumen PDF siap cetak.',
    guide: [
      'Pilih jenis dokumen: Invoice Tagihan, Nota Penjualan, atau Kwitansi Pembayaran.',
      'Unggah logo toko/perusahaan Anda dan isi biodata pembeli.',
      'Tambahkan daftar barang, harga satuan, dan jumlah kuantitas.',
      'Bubuhkan tanda tangan basah dan stempel lunas digital.',
      'Pilih ukuran kertas (A4 untuk kantor, Struk Thermal 58/80mm untuk kasir mini printer), lalu unduh PDF.'
    ],
    tips: 'Simpan template nota Anda di browser agar saat membuat tagihan berikutnya, data toko tidak perlu diketik ulang.'
  },
  {
    category: '4. BISNIS & KALKULATOR',
    id: 'kalkulator-pajak',
    title: 'Kalkulator Pajak PPh 21, 23 & 4(2)',
    route: '/tools/kalkulator-pajak',
    summary: 'Menghitung simulasi pemotongan pajak penghasilan karyawan (Skema TER & UU HPP terbaru), pajak jasa/modal PPh 23, dan sewa properti PPh 4(2) final.',
    howItWorks: 'Menerapkan tabel Tarif Efektif Rata-Rata (TER Kategori A, B, C) PP 58/2023 dan lapisan tarif progresif Pasal 17 UU Harmonisasi Peraturan Perpajakan (HPP).',
    guide: [
      'Pilih jenis pajak yang hendak dihitung (PPh 21 Gaji, PPh 23 Jasa, atau PPh 4 ayat 2).',
      'Pilih status PTKP karyawan (TK/0, K/1, K/2, dll.) dan masukkan gaji bruto bulanan.',
      'Sistem akan menampilkan rincian potongan bulanan dan perbandingan rekonsiliasi masa pajak Desember.',
      'Salin rincian perhitungan atau cetak lembar simulasi pajak.'
    ],
    tips: 'Gunakan kalkulator ini bagi tim HRD atau pekerja lepas (freelancer) untuk mengetahui take home pay bersih setelah dipotong pajak resmi.'
  },
  {
    category: '4. BISNIS & KALKULATOR',
    id: 'currency-converter',
    title: 'Konverter Mata Uang Global',
    route: '/tools/currency-converter',
    summary: 'Menghitung nilai tukar valuta asing (USD, SAR, EUR, SGD, MYR, JPY ke Rupiah IDR) real-time serta simulasi estimasi anggaran biaya riyal perjalanan Haji & Umroh.',
    howItWorks: 'Mengambil data kurs valas terpercaya dan menghitung konversi instan dua arah dengan margin biaya penukaran uang wajar.',
    guide: [
      'Pilih mata uang asal dan mata uang tujuan.',
      'Masukkan nominal angka yang ingin dikonversi.',
      'Lihat nilai ekuivalen dalam Rupiah dan grafik pergerakan kurs.',
      'Gunakan kalkulator khusus Haji/Umroh untuk menghitung kebutuhan uang saku Riyal (SAR).'
    ],
    tips: 'Pantau kurs secara berkala sebelum menukarkan uang tunai di *money changer* agar mendapatkan rate terbaik.'
  },
  {
    category: '4. BISNIS & KALKULATOR',
    id: 'kalkulator-finansial',
    title: 'Kalkulator Finansial & Satuan',
    route: '/tools/kalkulator-finansial',
    summary: 'Menghitung diskon bertingkat (misal: diskon mall 50% + 20%), zakat mal berdasarkan nisab 85 gram emas, dan konversi satuan metrik/imperial.',
    howItWorks: 'Menghitung algoritma diskon berantai compound percentage dan mengaitkan harga emas terkini dengan formula nisab syariah.',
    guide: [
      'Pilih menu: Kalkulator Diskon, Zakat Mal, atau Konversi Satuan.',
      'Untuk diskon: masukkan harga banderol dan persentase diskon pertama serta kedua.',
      'Untuk zakat: masukkan total tabungan/aset cair; sistem mengecek apakah sudah melewati nisab emas.',
      'Dapatkan rincian nominal bayar dan jumlah kewajiban zakat.'
    ],
    tips: 'Diskon 50% + 20% tidak sama dengan 70%. Kalkulator ini menghitung harga riil yang harus Anda bayarkan di kasir.'
  },
  {
    category: '4. BISNIS & KALKULATOR',
    id: 'kalkulator-umkm',
    title: 'Kalkulator Bisnis & UMKM',
    route: '/tools/kalkulator-umkm',
    summary: 'Simulasi Harga Pokok Penjualan (HPP), margin keuntungan produk, titik impas (Break Even Point / BEP), dan target penjualan laba bersih.',
    howItWorks: 'Memperhitungkan biaya variabel (bahan baku, kemasan), biaya tetap (sewa, listrik, gaji), dan target laba kotor untuk menentukan harga jual ideal.',
    guide: [
      'Pilih kalkulator: HPP & Harga Jual, BEP Unit & Rupiah, atau Analisis Margin.',
      'Masukkan komponen biaya modal dan biaya operasional.',
      'Tentukan persentase margin keuntungan yang diinginkan.',
      'Lihat rekomendasi harga jual per porsi/produk dan jumlah minimal unit yang wajib terjual per bulan.'
    ],
    tips: 'Jangan lupa memasukkan biaya penyusutan alat dan biaya kemasan ke dalam HPP agar bisnis tidak mengalami kerugian terselubung.'
  },
  {
    category: '4. BISNIS & KALKULATOR',
    id: 'excel-to-csv',
    title: 'Excel ke CSV Converter',
    route: '/tools/excel-to-csv',
    summary: 'Mengubah lembar kerja Microsoft Excel (.xlsx/.xls) menjadi berkas teks CSV terpisah koma atau titik koma siap impor database.',
    howItWorks: 'Membaca workbook Excel menggunakan SheetJS di browser dan mengekspor sheet aktif ke format plain text RFC 4180.',
    guide: [
      'Unggah file Excel Anda.',
      'Pilih sheet mana yang ingin dikonversi.',
      'Pilih pemisah karakter (Delimiter: Koma ",", Titik Koma ";", atau Tab).',
      'Unduh file CSV hasil konversi.'
    ],
    tips: 'Gunakan pemisah titik koma (Semicolon) jika data Anda sering dibuka di Excel berbahasa Indonesia.'
  },
  {
    category: '4. BISNIS & KALKULATOR',
    id: 'csv-to-excel',
    title: 'CSV ke Excel (.xlsx)',
    route: '/tools/csv-to-excel',
    summary: 'Mengonversi file data mentah CSV menjadi lembar kerja spreadsheet Excel (.xlsx) dengan tabel rapi dan pemformatan sel otomatis.',
    howItWorks: 'Melakukan parsing baris teks CSV, mendeteksi tipe data angka/tanggal secara cerdas, dan membungkusnya ke file Excel OpenXML.',
    guide: [
      'Pilih file CSV yang ingin diubah.',
      'Periksa preview data pada tabel pratinjau.',
      'Klik tombol "Konversi ke Excel (.xlsx)".',
      'Buka berkas di Microsoft Excel tanpa risiko data berantakan dalam satu kolom.'
    ],
    tips: 'Sangat berguna untuk merapikan ekspor data transaksi dari platform e-commerce atau payment gateway.'
  },

  // ==========================================
  // KATEGORI 5: UTILITAS & LOGISTIK
  // ==========================================
  {
    category: '5. UTILITAS & LOGISTIK',
    id: 'tracking-resi',
    title: 'Cek Resi & Lacak Paket Multi-Ekspedisi',
    route: '/tools/tracking',
    summary: 'Melacak status perjalanan paket secara real-time untuk berbagai kurir besar di Indonesia (Shopee Xpress, JNE, J&T, SiCepat, Anteraja, Pos Indonesia, dll.).',
    howItWorks: 'Terhubung dengan gateway API pelacakan multi-kurir resmi. Mendeteksi kurir secara otomatis berdasarkan pola digit nomor resi dan menampilkan riwayat checkpoint.',
    guide: [
      'Masukkan nomor resi pengiriman belanja online Anda.',
      'Pilih nama ekspedisi atau biarkan sistem mendeteksi kurir secara otomatis.',
      'Tekan tombol "Lacak Paket Sekarang 🚚".',
      'Lihat status terkini, lokasi transit paket, dan riwayat perjalanan lengkap dari kota asal hingga kurir pengantar.'
    ],
    tips: 'Simpan nomor resi pada riwayat pencarian untuk memantau pembaruan status pengiriman harian dengan satu sentuhan.'
  },
  {
    category: '5. UTILITAS & LOGISTIK',
    id: 'qr-generator',
    title: 'QR Code Generator Kustom',
    route: '/tools/qr-generator',
    summary: 'Membuat kode QR beresolusi tinggi untuk tautan website, koneksi instan WiFi tanpa ketik sandi, chat langsung WhatsApp, atau kartu nama digital.',
    howItWorks: 'Mengompilasi string data ke dalam matriks dua dimensi QR code menggunakan qrcode library dengan tingkat koreksi error tinggi (Level H - 30%).',
    guide: [
      'Pilih tipe konten: URL Website, Sandi WiFi, Chat WhatsApp Langsung, atau Teks Bebas.',
      'Ketik rincian data (misal SSID & Password WiFi, atau Nomor WA beserta template teks pembuka).',
      'Pilih warna kode QR dan unduh dalam format gambar PNG tajam atau vektor SVG siap cetak.'
    ],
    tips: 'Cetak QR Code WiFi dan tempelkan di meja cafe atau ruang tamu agar pengunjung dapat terhubung ke internet secara otomatis tanpa menanyakan kata sandi.'
  },
  {
    category: '5. UTILITAS & LOGISTIK',
    id: 'file-utility',
    title: 'Konverter HEIC & Utilitas File Hash (MD5/SHA256)',
    route: '/tools/file-utility',
    summary: 'Mengubah foto format Apple iPhone HEIC/HEIF menjadi JPG/PNG serta menghitung nilai checksum hash (MD5, SHA-256) untuk verifikasi keaslian file.',
    howItWorks: 'Mendekode container format Nokia/Apple High Efficiency Image Format via heic2any di Web Worker dan menghitung algoritma kriptografi Web Crypto API.',
    guide: [
      'Untuk konversi HEIC: pilih foto dari iPhone/iPad, tentukan format JPG, dan download seketika.',
      'Untuk verifikasi Hash: pilih berkas apa saja (ISO, dokumen, exe), sistem akan menghitung kode hash unik MD5 dan SHA-256.',
      'Bandingkan kode hash dengan situs penyedia berkas untuk memastikan file tidak korup atau disisipi virus.'
    ],
    tips: 'Gunakan fitur ini sebelum mengunggah foto jepretan iPhone ke portal web yang belum mendukung format HEIC.'
  },
  {
    category: '5. UTILITAS & LOGISTIK',
    id: 'zip-utility',
    title: 'Arsip ZIP Multi-File (Zip & Unzip)',
    route: '/tools/zip',
    summary: 'Membungkus banyak file dan folder ke dalam satu file arsip .zip berukuran ringkas atau mengekstrak isi file ZIP tanpa aplikasi tambahan.',
    howItWorks: 'Memanfaatkan pustaka JSZip untuk kompresi Deflate murni di thread browser tanpa mengirim berkas ke server pihak ketiga.',
    guide: [
      'Untuk membuat ZIP: pilih beberapa berkas dari laptop/HP Anda, beri nama arsip, lalu klik "Bungkus ke .ZIP".',
      'Untuk ekstrak ZIP: unggah file .zip, lihat daftar berkas di dalamnya, dan unduh berkas yang diinginkan satu per satu atau sekaligus.'
    ],
    tips: 'Sangat berguna bagi pengguna smartphone yang ingin membuka lampiran tugas kuliah berformat .zip tanpa perlu menginstal aplikasi pihak ketiga.'
  },

  // ==========================================
  // KATEGORI 6: EKOSISTEM & INFRASTRUKTUR SISTEM
  // ==========================================
  {
    category: '6. EKOSISTEM & SISTEM PRIVASI',
    id: 'ai-employee-engine',
    title: 'AI Employee Content & SEO Writer Agent',
    route: '/admin/ai-employees',
    summary: 'Agen otonom AI terintegrasi untuk menyusun artikel blog berkualitas tinggi, ramah kaidah Google Helpful Content, dan bebas thin content secara mandiri.',
    howItWorks: 'Mengoperasikan arsitektur agen bertingkat: Riset Kata Kunci, Penyusunan Kerangka Naskah H2/H3, Penulisan Artikel Mendalam (>= 800 kata), hingga Penambahan Skema FAQ.',
    guide: [
      'Buka panel manajemen AI Employee di area admin.',
      'Pilih topik panduan atau ketik tema kebutuhan audiens.',
      'Agen AI akan membuat draft matang tanpa boilerplate generik.',
      'Mandor admin dapat meninjau naskah, mengedit langsung, atau langsung menekan tombol "Publish".',
      'Artikel yang telah terbit dapat dinonaktifkan (unpublish) kembali ke status draft sewaktu-waktu.'
    ],
    tips: 'Fitur deaktifkan/aktifkan artikel memastikan pengelola web memiliki kontrol penuh atas setiap materi yang tampil ke publik.'
  },
  {
    category: '6. EKOSISTEM & SISTEM PRIVASI',
    id: 'zero-knowledge-privacy',
    title: 'Arsitektur Keamanan Zero-Knowledge Privacy',
    route: 'Seluruh Layanan KompresKilat',
    summary: 'Standar keamanan tertinggi di mana file dokumen, foto KTP, dan data keuangan pengguna diproses 100% lokal di dalam peramban peramban (client-side) tanpa pernah diunggah atau disimpan ke server mana pun.',
    howItWorks: 'Seluruh pemrosesan memanfaatkan WebAssembly, Web Worker, HTML5 Canvas, dan memory buffer lokal pengguna. Tidak ada endpoint server penampung file.',
    guide: [
      'Gunakan seluruh alat utilitas KompresKilat dengan rasa tenang tanpa kekhawatiran kebocoran data pribadi.',
      'Setelah pemrosesan selesai dan tab browser ditutup, memori pemrosesan langsung terhapus dari peramban secara otomatis.'
    ],
    tips: 'Mendukung kepatuhan penuh terhadap UU Perlindungan Data Pribadi (UU PDP) Indonesia dan regulasi GDPR global.'
  }
];

// Helper to sanitize text for PDF StandardFonts (WinAnsiEncoding / Latin-1)
function sanitizeText(str) {
  if (!str) return '';
  return str
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/•/g, '*')
    .replace(/[^\x20-\x7E\xA0-\xFF\n\r]/g, ' ')
    .trim();
}

// Helper to wrap text according to maximum width
function wrapText(text, maxWidth, font, fontSize) {
  const clean = sanitizeText(text);
  const words = clean.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if (!word) continue;
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

async function generatePDF() {
  console.log('Generating comprehensive KompresKilat Features PDF...');

  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // A4 Dimensions in points: 595.28 x 841.89
  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const MARGIN_LEFT = 48;
  const MARGIN_RIGHT = 48;
  const MARGIN_TOP = 52;
  const MARGIN_BOTTOM = 52;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  let currentPage = null;
  let cursorY = 0;
  let pageIndex = 0;

  function addNewPage(isCover = false) {
    currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageIndex++;
    cursorY = PAGE_HEIGHT - MARGIN_TOP;

    if (!isCover) {
      // Header
      currentPage.drawText('KOMPRESKILAT.SITE  |  BUKU PANDUAN LENGKAP & SPESIFIKASI FITUR RESMI', {
        x: MARGIN_LEFT,
        y: PAGE_HEIGHT - 32,
        size: 8,
        font: fontBold,
        color: rgb(0.31, 0.27, 0.90) // Indigo
      });
      currentPage.drawLine({
        start: { x: MARGIN_LEFT, y: PAGE_HEIGHT - 38 },
        end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: PAGE_HEIGHT - 38 },
        thickness: 0.6,
        color: rgb(0.85, 0.88, 0.92)
      });

      // Footer
      currentPage.drawLine({
        start: { x: MARGIN_LEFT, y: 38 },
        end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: 38 },
        thickness: 0.6,
        color: rgb(0.85, 0.88, 0.92)
      });
      currentPage.drawText('100% Client-Side Processing  -  Zero-Knowledge Privacy  -  Gratis Tanpa Instalasi', {
        x: MARGIN_LEFT,
        y: 26,
        size: 7.5,
        font: fontRegular,
        color: rgb(0.45, 0.50, 0.58)
      });
      const pageNumberStr = `Halaman ${pageIndex}`;
      const pageNumWidth = fontRegular.widthOfTextAtSize(pageNumberStr, 7.5);
      currentPage.drawText(pageNumberStr, {
        x: PAGE_WIDTH - MARGIN_RIGHT - pageNumWidth,
        y: 26,
        size: 7.5,
        font: fontBold,
        color: rgb(0.31, 0.27, 0.90)
      });
    }

    return currentPage;
  }

  function ensureSpace(neededHeight) {
    if (cursorY - neededHeight < MARGIN_BOTTOM + 20) {
      addNewPage();
    }
  }

  // ==========================================
  // 1. COVER PAGE
  // ==========================================
  addNewPage(true);

  // Top Accent Banner
  currentPage.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 180,
    width: PAGE_WIDTH,
    height: 180,
    color: rgb(0.09, 0.11, 0.22) // Deep navy
  });

  // Top decorative stripe
  currentPage.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 10,
    width: PAGE_WIDTH,
    height: 10,
    color: rgb(0.31, 0.27, 0.90) // Vibrant Indigo
  });

  // Cover Header Badges
  currentPage.drawText('DOKUMEN RESMI SPESIFIKASI & PANDUAN PENGGUNA', {
    x: MARGIN_LEFT,
    y: PAGE_HEIGHT - 55,
    size: 9,
    font: fontBold,
    color: rgb(0.55, 0.65, 0.95)
  });

  currentPage.drawText('KompresKilat.site', {
    x: MARGIN_LEFT,
    y: PAGE_HEIGHT - 95,
    size: 28,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  currentPage.drawText('All-in-One Digital Productivity, AI & Document Suite', {
    x: MARGIN_LEFT,
    y: PAGE_HEIGHT - 122,
    size: 13,
    font: fontRegular,
    color: rgb(0.85, 0.88, 0.98)
  });

  currentPage.drawText('Buku Panduan Lengkap: Daftar Seluruh Fitur, Cara Kerja Teknis & Tata Cara Penggunaan', {
    x: MARGIN_LEFT,
    y: PAGE_HEIGHT - 145,
    size: 9.5,
    font: fontOblique,
    color: rgb(0.70, 0.75, 0.90)
  });

  cursorY = PAGE_HEIGHT - 210;

  // Metadata Card on Cover
  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: cursorY - 85,
    width: CONTENT_WIDTH,
    height: 85,
    color: rgb(0.96, 0.97, 1.0),
    borderColor: rgb(0.82, 0.85, 0.95),
    borderWidth: 1
  });

  currentPage.drawText('RINGKASAN DOKUMEN & IDENTITAS SISTEM', {
    x: MARGIN_LEFT + 16,
    y: cursorY - 20,
    size: 9,
    font: fontBold,
    color: rgb(0.20, 0.22, 0.40)
  });

  const metaRows = [
    'Nama Platform: KompresKilat (https://www.kompreskilat.site)',
    'Edisi / Versi: Versi Resmi 2026.11 (Pembaruan November 2026)',
    'Total Fitur Tercakup: 44 Alat Utilitas, AI Tools, Bisnis & Logistik',
    'Standar Keamanan: 100% Client-Side Processing (Zero-Knowledge Privacy, Tidak Ada Upload Berkas ke Server)'
  ];

  let metaY = cursorY - 36;
  for (const row of metaRows) {
    currentPage.drawText(`* ${row}`, {
      x: MARGIN_LEFT + 16,
      y: metaY,
      size: 8,
      font: fontRegular,
      color: rgb(0.25, 0.30, 0.40)
    });
    metaY -= 13;
  }

  cursorY -= 110;

  // Executive Introduction
  currentPage.drawText('KATA PENGANTAR & ARSITEKTUR PLATFORM', {
    x: MARGIN_LEFT,
    y: cursorY,
    size: 12,
    font: fontBold,
    color: rgb(0.12, 0.15, 0.25)
  });
  cursorY -= 16;

  const introText = 
    'KompresKilat lahir dari komitmen untuk menyelesaikan kendala administrasi digital masyarakat Indonesia secara instan, gratis, dan berstandar privasi tinggi. Berbeda dengan mayoritas situs utilitas konvensional yang mengharuskan pengguna mengunggah dokumen pribadi (seperti KTP, ijazah, dan CV) ke server pihak ketiga, KompresKilat dibangun di atas arsitektur Client-Side First. Seluruh berkas diproses langsung di dalam memori peramban pengguna memanfaatkan teknologi WebAssembly, Canvas API, dan Web Workers. Dokumen tidak pernah tersimpan di server kami.\n\nBuku panduan ini disusun sebagai rujukan teknis dan operasional komprehensif bagi seluruh pengguna, staf administrasi kantor, penggiat UMKM, pelamar kerja, dan instansi pendidikan dalam memanfaatkan seluruh kapabilitas yang tersedia di ekosistem KompresKilat.';

  const introLines = introText.split('\n\n');
  for (const p of introLines) {
    const wrapped = wrapText(p, CONTENT_WIDTH, fontRegular, 8.5);
    for (const l of wrapped) {
      currentPage.drawText(l, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.25, 0.28, 0.35)
      });
      cursorY -= 12;
    }
    cursorY -= 6;
  }

  cursorY -= 10;

  // Quick Table of Contents Overview
  currentPage.drawText('STRUKTUR KATEGORI FITUR TERSEDIA', {
    x: MARGIN_LEFT,
    y: cursorY,
    size: 11,
    font: fontBold,
    color: rgb(0.12, 0.15, 0.25)
  });
  cursorY -= 16;

  const categoriesOverview = [
    { cat: '1. Dokumen & PDF (14 Alat)', desc: 'Direct Text Editor, Kompresi, Merge, OCR Word, PPTX, Excel, Scan, Atur Lembar, dll.' },
    { cat: '2. Foto & Gambar (10 Alat)', desc: 'Kompres KTP <200KB, Ganti Background Pas Foto, Object Eraser, Sensor NIK, Paspor Global, dll.' },
    { cat: '3. AI & Kreatif (7 Alat)', desc: 'Photo Enhancer 4x, AI Presentation, ATS Resume Reviewer, Summarizer, Creative Studio, dll.' },
    { cat: '4. Bisnis & Kalkulator (7 Alat)', desc: 'Pembuat Nota/Invoice/Kwitansi, Pajak PPh 21 TER, Kurs Valas, Kalkulator UMKM & BEP, dll.' },
    { cat: '5. Utilitas & Logistik (4 Alat)', desc: 'Cek Resi Multi-Kurir (SPX, JNE, J&T), QR Code Generator, Konverter HEIC, Arsip ZIP.' },
    { cat: '6. Ekosistem & Sistem AI (2 Modul)', desc: 'AI Employee SEO Engine, Manajemen Publikasi/Drafting, dan Zero-Knowledge Framework.' }
  ];

  for (const c of categoriesOverview) {
    currentPage.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - 18,
      width: CONTENT_WIDTH,
      height: 24,
      color: rgb(0.97, 0.98, 0.99),
      borderColor: rgb(0.90, 0.92, 0.95),
      borderWidth: 0.5
    });

    currentPage.drawText(c.cat, {
      x: MARGIN_LEFT + 10,
      y: cursorY - 10,
      size: 8.5,
      font: fontBold,
      color: rgb(0.25, 0.20, 0.70)
    });

    currentPage.drawText(`: ${c.desc}`, {
      x: MARGIN_LEFT + 175,
      y: cursorY - 10,
      size: 8,
      font: fontRegular,
      color: rgb(0.35, 0.38, 0.45)
    });

    cursorY -= 28;
  }

  // Cover Footer
  currentPage.drawText('Disusun oleh Tim Pengembang KompresKilat  *  Komitmen Privasi 100% Aman', {
    x: MARGIN_LEFT,
    y: 36,
    size: 7.5,
    font: fontBold,
    color: rgb(0.45, 0.50, 0.60)
  });

  // ==========================================
  // 2. DETAILED BODY PAGES
  // ==========================================
  let currentCategoryHeader = '';

  for (let i = 0; i < FEATURES_DATA.length; i++) {
    const item = FEATURES_DATA[i];

    // Check if new category header is needed
    if (item.category !== currentCategoryHeader) {
      currentCategoryHeader = item.category;

      ensureSpace(80);
      cursorY -= 10;

      // Category Section Banner
      currentPage.drawRectangle({
        x: MARGIN_LEFT,
        y: cursorY - 26,
        width: CONTENT_WIDTH,
        height: 26,
        color: rgb(0.12, 0.15, 0.28)
      });

      currentPage.drawText(`KATEGORI ${currentCategoryHeader.toUpperCase()}`, {
        x: MARGIN_LEFT + 12,
        y: cursorY - 17,
        size: 10,
        font: fontBold,
        color: rgb(1, 1, 1)
      });

      cursorY -= 38;
    }

    // Measure space needed for this item
    // Roughly estimate: Title (15) + Route (12) + Summary (35) + HowItWorks (35) + Guide (60) + Tips (25) = ~180pt
    ensureSpace(160);

    // Feature Card Container Top Line
    currentPage.drawLine({
      start: { x: MARGIN_LEFT, y: cursorY },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: cursorY },
      thickness: 0.8,
      color: rgb(0.31, 0.27, 0.90)
    });
    cursorY -= 14;

    // Feature Number & Title
    const featureHeading = `FITUR ${String(i + 1).padStart(2, '0')}: ${item.title.toUpperCase()}`;
    currentPage.drawText(featureHeading, {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 10,
      font: fontBold,
      color: rgb(0.10, 0.12, 0.22)
    });

    // Route Badge on the right
    const routeText = `URL: ${item.route}`;
    const routeWidth = fontRegular.widthOfTextAtSize(routeText, 7.5);
    currentPage.drawText(routeText, {
      x: PAGE_WIDTH - MARGIN_RIGHT - routeWidth,
      y: cursorY,
      size: 7.5,
      font: fontOblique,
      color: rgb(0.35, 0.40, 0.75)
    });

    cursorY -= 15;

    // Ringkasan Fungsi
    currentPage.drawText('Tujuan & Manfaat:', {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 8,
      font: fontBold,
      color: rgb(0.20, 0.25, 0.35)
    });
    cursorY -= 11;

    const summaryLines = wrapText(item.summary, CONTENT_WIDTH - 12, fontRegular, 8);
    for (const line of summaryLines) {
      currentPage.drawText(line, {
        x: MARGIN_LEFT + 8,
        y: cursorY,
        size: 8,
        font: fontRegular,
        color: rgb(0.30, 0.33, 0.40)
      });
      cursorY -= 10.5;
    }
    cursorY -= 3;

    // Cara Kerja / Teknologi di Balik Layar
    ensureSpace(40);
    currentPage.drawText('Cara Kerja & Arsitektur Teknis:', {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 8,
      font: fontBold,
      color: rgb(0.20, 0.25, 0.35)
    });
    cursorY -= 11;

    const howLines = wrapText(item.howItWorks, CONTENT_WIDTH - 12, fontRegular, 8);
    for (const line of howLines) {
      currentPage.drawText(line, {
        x: MARGIN_LEFT + 8,
        y: cursorY,
        size: 8,
        font: fontRegular,
        color: rgb(0.30, 0.33, 0.40)
      });
      cursorY -= 10.5;
    }
    cursorY -= 3;

    // Panduan Penggunaan Langkah demi Langkah
    ensureSpace(item.guide.length * 15 + 20);
    currentPage.drawText('Panduan Penggunaan Langkah demi Langkah:', {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 8,
      font: fontBold,
      color: rgb(0.20, 0.25, 0.35)
    });
    cursorY -= 11;

    for (let g = 0; g < item.guide.length; g++) {
      const stepStr = `${g + 1}. ${item.guide[g]}`;
      const stepLines = wrapText(stepStr, CONTENT_WIDTH - 16, fontRegular, 8);
      for (const line of stepLines) {
        currentPage.drawText(line, {
          x: MARGIN_LEFT + 8,
          y: cursorY,
          size: 8,
          font: fontRegular,
          color: rgb(0.25, 0.28, 0.35)
        });
        cursorY -= 10.5;
      }
    }
    cursorY -= 3;

    // Tips & Rekomendasi
    ensureSpace(28);
    currentPage.drawText('Tips & Rekomendasi Terbaik:', {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 8,
      font: fontBold,
      color: rgb(0.15, 0.45, 0.25) // Subtle Green
    });
    cursorY -= 11;

    const tipsLines = wrapText(item.tips, CONTENT_WIDTH - 12, fontOblique, 7.8);
    for (const line of tipsLines) {
      currentPage.drawText(line, {
        x: MARGIN_LEFT + 8,
        y: cursorY,
        size: 7.8,
        font: fontOblique,
        color: rgb(0.20, 0.40, 0.25)
      });
      cursorY -= 10.5;
    }

    cursorY -= 14;
  }

  // ==========================================
  // FINAL CLOSING SUMMARY
  // ==========================================
  ensureSpace(120);
  cursorY -= 10;

  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: cursorY - 110,
    width: CONTENT_WIDTH,
    height: 110,
    color: rgb(0.95, 0.97, 1.0),
    borderColor: rgb(0.80, 0.85, 0.98),
    borderWidth: 1
  });

  currentPage.drawText('PENUTUP & DUKUNGAN LAYANAN', {
    x: MARGIN_LEFT + 14,
    y: cursorY - 20,
    size: 10,
    font: fontBold,
    color: rgb(0.20, 0.25, 0.55)
  });

  const closingText = 
    'Seluruh fitur di KompresKilat dapat digunakan secara cuma-cuma tanpa batasan kuota harian. Jika Anda menemukan kendala saat memproses dokumen, membutuhkan bantuan teknis khusus, atau ingin merekomendasikan penambahan utilitas baru, silakan hubungi tim kami melalui email resmi info.kompreskilat@gmail.com atau melalui menu Kontak Kami.\n\nWebsite Resmi: https://www.kompreskilat.site  |  Hak Cipta (c) 2026 KompresKilat. Dilindungi Undang-Undang.';

  const closingLines = closingText.split('\n\n');
  let closeY = cursorY - 36;
  for (const block of closingLines) {
    const wrapped = wrapText(block, CONTENT_WIDTH - 28, fontRegular, 7.8);
    for (const l of wrapped) {
      currentPage.drawText(l, {
        x: MARGIN_LEFT + 14,
        y: closeY,
        size: 7.8,
        font: fontRegular,
        color: rgb(0.25, 0.30, 0.40)
      });
      closeY -= 11;
    }
    closeY -= 4;
  }

  const pdfBytes = await pdfDoc.save();

  // Save to public/downloads/
  const outDir = path.join(__dirname, '..', 'public', 'downloads');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const publicFilePath = path.join(outDir, 'Panduan_Lengkap_Fitur_KompresKilat.pdf');
  fs.writeFileSync(publicFilePath, pdfBytes);

  // Also save to root workspace for immediate easy access
  const rootFilePath = path.join(__dirname, '..', 'Panduan_Lengkap_Fitur_KompresKilat.pdf');
  fs.writeFileSync(rootFilePath, pdfBytes);

  console.log('PDF successfully generated!');
  console.log(`- Public URL path: /downloads/Panduan_Lengkap_Fitur_KompresKilat.pdf`);
  console.log(`- File Path: ${publicFilePath}`);
  console.log(`- Total pages: ${pageIndex}`);
  console.log(`- File size: ${(pdfBytes.length / 1024).toFixed(2)} KB`);
}

generatePDF().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
