import { ALL_TOOLS, ToolItem } from './tools-data';
import { BLOG_POSTS, BlogPost } from './blog-data';

export interface HowToStep {
  step: number;
  title: string;
  desc: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface BenefitCard {
  icon: string;
  title: string;
  desc: string;
}

export interface ToolEditorialData {
  id: string; // Tool ID or path slug
  badge: string;
  h1: string;
  tagline: string;
  intro: string; // 100-150 words high editorial intro
  benefitsTitle?: string;
  benefits: BenefitCard[];
  howToTitle: string;
  howToSubtitle?: string;
  howToSteps: HowToStep[];
  faqTitle?: string;
  faq: FaqItem[];
  relatedToolIds: string[];
  relatedBlogSlugs: string[];
}

export const TOOLS_EDITORIAL_CATALOG: Record<string, ToolEditorialData> = {
  // =========================================================================
  // 1. DOKUMEN & PDF
  // =========================================================================
  'pdf-editor': {
    id: 'pdf-editor',
    badge: 'Privasi 100% Client-Side',
    h1: 'Direct PDF Text Editor & Whiteout Online',
    tagline: 'Koreksi Typo, Tutup Informasi Sensitif, dan Tambah Teks Baru Langsung di Browser',
    intro: 'Direct PDF Text Editor KompresKilat dirancang khusus bagi profesional, staf administrasi, mahasiswa, dan pemilik usaha yang membutuhkan revisi cepat pada berkas PDF tanpa harus menginstal software berat seperti Adobe Acrobat atau melakukan konversi ulang yang berisiko merusak tata letak. Dengan teknologi render canvas beresolusi tinggi, Anda dapat menambahkan catatan resmi, mengisi formulir PDF pendaftaran kerja atau CPNS, menambahkan paraf digital, hingga memanfaatkan fitur kotak penutup (whiteout) untuk mengoreksi teks salah ketik atau menyamarkan informasi pribadi secara presisi. Seluruh proses penyuntingan diproses 100% di dalam peramban lokal komputer atau ponsel Anda tanpa pernah mengunggah dokumen sensitif ke server eksternal mana pun.',
    benefits: [
      { icon: '🔒', title: '100% Aman & Privat', desc: 'Dokumen perjanjian kerja, slip gaji, dan ijazah tidak pernah meninggalkan perangkat Anda.' },
      { icon: '🎯', title: 'Mode Whiteout Presisi', desc: 'Tutup salah ketik pada hasil scan lalu timpa tulisan baru dengan jenis font yang serasi.' },
      { icon: '⚡', title: 'Tanpa Watermark & Kuota', desc: 'Simpan kembali berkas PDF hasil editan dalam ketajaman asli tanpa batasan halaman.' }
    ],
    howToTitle: 'Cara Mengedit Teks dan Menutup Informasi pada File PDF:',
    howToSubtitle: 'Panduan 4 langkah mudah menyunting dokumen PDF secara langsung di browser Anda',
    howToSteps: [
      { step: 1, title: 'Buka Dokumen PDF', desc: 'Klik tombol "Pilih Berkas PDF" atau seret dokumen kontrak, surat lamaran, atau sertifikat dari perangkat Anda ke area kerja.' },
      { step: 2, title: 'Pilih Mode Koreksi atau Tambah Teks', desc: 'Gunakan alat "Kotak Whiteout" untuk menutup typo atau sensor data, atau pilih mode "Teks Baru" untuk mengetik kalimat tambahan.' },
      { step: 3, title: 'Sesuaikan Posisi & Ukuran Huruf', desc: 'Geser posisi teks secara bebas menggunakan kursor, atur ukuran huruf, warna font, serta ketebalan agar menyatu sempurna dengan dokumen asli.' },
      { step: 4, title: 'Simpan & Unduh Berkas', desc: 'Klik tombol "Simpan Dokumen PDF" untuk mengunduh hasil editan dalam resolusi tajam siap cetak atau dikirim via email.' }
    ],
    faq: [
      { q: 'Apakah dokumen PDF rahasia saya aman diedit di KompresKilat?', a: 'Sangat aman. Sistem kami menerapkan arsitektur Zero-Knowledge Client-Side Processing. Dokumen PDF Anda hanya dimuat ke dalam memori RAM peramban lokal dan tidak pernah ditransmisikan ke server mana pun di internet.' },
      { q: 'Apakah format dan tata letak PDF asli akan bergeser setelah disimpan?', a: 'Tidak. Mesin editor kami menggabungkan lapisan editan langsung di atas matriks koordinat vektor halaman asli, sehingga tata letak, margin, gambar, dan tabel bawaan tetap utuh 100%.' },
      { q: 'Bisakah alat ini digunakan untuk mengedit PDF hasil scan kamera HP?', a: 'Bisa. Untuk PDF hasil scan foto atau gambar, gunakan kombinasi alat "Kotak Whiteout" untuk menutup teks lama yang salah, lalu tambahkan teks baru di atasnya dengan font yang sesuai.' }
    ],
    relatedToolIds: ['pdf-merge', 'pdf-compress', 'tanda-tangan'],
    relatedBlogSlugs: ['cara-edit-teks-pdf-langsung-di-browser-online', 'cara-edit-teks-pdf-hasil-scan-dan-dokumen-digital-online-gratis']
  },

  'pdf-compress': {
    id: 'pdf-compress',
    badge: 'Standar CPNS & BUMN',
    h1: 'Kompres Dokumen PDF Online Cepat & Ringan',
    tagline: 'Kecilkan Ukuran Berkas PDF ke 200KB, 300KB, atau 500KB Tanpa Mengorbankan Keterbacaan Teks',
    intro: 'Kompres Dokumen PDF KompresKilat adalah solusi praktis untuk mengatasi batas kuota unggah berkas pada portal pendaftaran kerja BUMN, seleksi SSCASN CPNS, portal beasiswa LPDP, dan sistem pengarsipan instansi pemerintah. Berkas PDF hasil pemindaian scanner resolusi tinggi sering kali berukuran puluhan megabyte, sehingga ditolak oleh sistem penerimaan berkas online. Dengan algoritma kompresi stream cerdas yang mengoptimalkan struktur vektor dan resolusi gambar dokumen secara proporsional, ukuran file Anda dapat dipangkas drastis hingga di bawah batas syarat tanpa membuat teks menjadi buram atau berbayang. Seluruh kalkulasi kompresi dieksekusi secara instan di peramban tanpa risiko kebocoran data rahasia.',
    benefits: [
      { icon: '📉', title: 'Pilihan Target Ukuran', desc: 'Tersedia preset kompresi ke target presisi seperti di bawah 200KB, 300KB, 500KB, dan 1MB.' },
      { icon: '👓', title: 'Teks Tetap Tajam', desc: 'Algoritma mempertahankan kejernihan huruf digital sehingga tetap lolos verifikasi OCR panitia.' },
      { icon: '🛡️', title: 'Bebas Antrean Server', desc: 'Pemrosesan berlangsung kilat di perangkat Anda tanpa perlu menunggu antrean upload berulang.' }
    ],
    howToTitle: 'Cara Mengompres Ukuran Dokumen PDF dengan Mudah:',
    howToSubtitle: 'Panduan langkah demi langkah memangkas ukuran PDF untuk kebutuhan administrasi resmi',
    howToSteps: [
      { step: 1, title: 'Unggah Berkas PDF', desc: 'Pilih file PDF skripsi, portofolio kerja, atau scan ijazah yang ingin Anda kecilkan ukurannya.' },
      { step: 2, title: 'Tentukan Level Kompresi', desc: 'Pilih tingkat kompresi yang diinginkan: Ekstrem (untuk syarat batas 200KB-300KB), Rekomendasi (keseimbangan optimal), atau Ringan (kualitas cetak prima).' },
      { step: 3, title: 'Proses Pengecilan Seketika', desc: 'Sistem akan mereduksi struktur duplikat metadata dan mengompresi gambar di dalam berkas dalam hitungan detik.' },
      { step: 4, title: 'Cek Ukuran & Unduh', desc: 'Periksa perbandingan ukuran awal vs ukuran akhir, lalu klik "Unduh PDF Hasil Kompres" untuk menyimpan berkas Anda.' }
    ],
    faq: [
      { q: 'Berapa persen ukuran PDF yang bisa dihemat melalui alat ini?', a: 'Pengurangan ukuran berkisar antara 40% hingga 85%, tergantung pada komposisi dokumen. Berkas PDF yang memuat banyak scan foto biasanya mengalami penurunan ukuran paling signifikan.' },
      { q: 'Apakah teks di dalam ijazah atau transkrip nilai akan tetap terbaca jelas?', a: 'Ya. Algoritma kami secara khusus memprioritaskan keterbacaan teks dan angka nominal agar tetap tajam saat diperbesar (*zoom in*) oleh verifikator dokumen.' },
      { q: 'Apakah ada batasan jumlah berkas PDF yang bisa dikompres per hari?', a: 'Tidak ada batasan. Anda dapat mengompres berkas PDF sebanyak apa pun secara gratis tanpa perlu registrasi akun atau langganan bulanan.' }
    ],
    relatedToolIds: ['pdf-merge', 'pdf-to-word', 'scan-dokumen'],
    relatedBlogSlugs: ['cara-menggabungkan-file-pdf-menjadi-satu-online-gratis', 'cara-scan-dan-fotocopy-dokumen-hp-ke-pdf-bersih']
  },

  'pdf-merge': {
    id: 'pdf-merge',
    badge: 'Multi-Berkas Rapi',
    h1: 'Penggabung Berkas PDF (Merge PDF) Online',
    tagline: 'Satukan CV, Ijazah, Transkrip, dan Sertifikat Menjadi Satu Dokumen PDF Kronologis',
    intro: 'Penggabung Berkas PDF KompresKilat mempermudah Anda menggabungkan puluhan berkas dokumen terpisah menjadi satu dokumen PDF yang rapi, terurut, dan siap dikirimkan. Sangat berguna bagi pelamar kerja yang diwajibkan mengirimkan satu file lampiran berisi resume, ijazah legalisir, sertifikat pelatihan, dan portofolio; atau akuntan yang perlu membukukan bukti transfer invoice ke dalam satu bundel laporan bulanan. Anda memiliki kendali penuh untuk mengatur ulang susunan halaman dengan fitur seret dan lepas (*drag and drop*), membuang berkas yang salah unggah, dan menyatukannya dalam hitungan detik dengan privasi dokumen yang terlindungi sepenuhnya.',
    benefits: [
      { icon: '📑', title: 'Urutan Bebas Sesuai Selera', desc: 'Atur posisi berkas dengan mudah sebelum digabungkan agar kronologi dokumen sesuai instruksi lowongan.' },
      { icon: '🗂️', title: 'Banyak File Sekaligus', desc: 'Gabungkan puluhan halaman sertifikat dan surat rekomendasi sekaligus tanpa macet.' },
      { icon: '🔐', title: 'Data Anda Tetap Privat', desc: 'Proses penyatuan berkas tidak mengirimkan data ke database cloud pihak ketiga.' }
    ],
    howToTitle: 'Cara Menggabungkan Beberapa Berkas PDF Menjadi Satu File:',
    howToSubtitle: 'Panduan praktis membundel dokumen penting ke dalam satu file PDF tunggal',
    howToSteps: [
      { step: 1, title: 'Pilih Semua Berkas PDF', desc: 'Klik tombol "Pilih Berkas" lalu sorot semua file PDF yang ingin Anda jadikan satu, seperti CV, ijazah, dan sertifikat.' },
      { step: 2, title: 'Atur Urutan Halaman', desc: 'Gunakan tombol panah naik/turun atau geser kartu berkas untuk memastikan dokumen pembuka dan lampiran tersusun berurutan.' },
      { step: 3, title: 'Mulai Penggabungan', desc: 'Tekan tombol "Gabungkan Berkas PDF" dan biarkan mesin penggabung menyatukan struktur data secara otomatis.' },
      { step: 4, title: 'Unduh Hasil Bundel', desc: 'Simpan file PDF gabungan baru Anda dengan nama berkas yang telah dirapikan.' }
    ],
    faq: [
      { q: 'Apakah kualitas gambar dan tulisan berkurang saat digabungkan?', a: 'Sama sekali tidak. Proses penggabungan hanya merangkai tabel objek PDF tanpa melakukan kompresi ulang atau degradasi kualitas gambar.' },
      { q: 'Bisakah saya menggabungkan file PDF yang berbeda ukuran halamannya (misal A4 dan F4/Folio)?', a: 'Bisa. Sistem mempertahankan ukuran halaman asli masing-masing dokumen sehingga tidak ada konten yang terpotong saat dibuka.' },
      { q: 'Apakah ada batasan maksimal jumlah file PDF yang dapat digabung?', a: 'Anda dapat menggabungkan puluhan file sekaligus dengan lancar karena komputasi dilakukan secara efisien langsung di memori perangkat Anda.' }
    ],
    relatedToolIds: ['organize-pdf', 'pdf-compress', 'page-number-pdf'],
    relatedBlogSlugs: ['cara-menggabungkan-file-pdf-menjadi-satu-online-gratis', 'cara-mengatur-urutan-menghapus-dan-mengekstrak-halaman-pdf-online']
  },

  'pdf-to-word': {
    id: 'pdf-to-word',
    badge: 'Didukung Mesin OCR Cerdas',
    h1: 'Konversi PDF ke Word (.docx) Online Siap Edit',
    tagline: 'Ubah PDF Teks Maupun Hasil Scan Menjadi Dokumen Microsoft Word dengan Format Rapi',
    intro: 'Alat Konversi PDF ke Word KompresKilat hadir untuk menyelamatkan waktu Anda dari pekerjaan mengetik ulang dokumen cetak, modul kuliah, skripsi, atau draft perjanjian hukum. Didukung oleh teknologi pengenalan karakter optik (Optical Character Recognition / OCR) mutakhir, alat ini mampu mengekstrak teks, paragraf, dan struktur tabel dari berkas PDF digital maupun hasil pemindaian scanner ponsel secara akurat ke dalam format berkas Microsoft Word (.docx). Anda dapat langsung membuka hasil konversi di Microsoft Office, Google Docs, atau WPS Office untuk diedit kembali tanpa kehilangan format dasar.',
    benefits: [
      { icon: '📝', title: 'Format Siap Edit Asli', desc: 'Dihasilkan sebagai dokumen .docx asli berstandar OpenXML yang kompatibel dengan semua editor Word.' },
      { icon: '🔍', title: 'Ekstraksi OCR Akurat', desc: 'Mengenali teks bahasa Indonesia dan karakter khusus dengan presisi tinggi bahkan pada dokumen scan.' },
      { icon: '⏱️', title: 'Hemat Waktu Pengetikan', desc: 'Tidak perlu menyalin teks manual; seluruh isi halaman berpindah secara terstruktur dalam hitungan detik.' }
    ],
    howToTitle: 'Cara Mengubah File PDF Menjadi Dokumen Word (.docx):',
    howToSubtitle: 'Panduan mudah mengubah lembaran PDF menjadi dokumen Word yang dapat diedit bebas',
    howToSteps: [
      { step: 1, title: 'Unggah Dokumen PDF', desc: 'Pilih file PDF tugas, laporan keuangan, atau hasil scan buku yang ingin dikonversi ke Word.' },
      { step: 2, title: 'Proses Ekstraksi Teks', desc: 'Sistem akan memindai lapisan teks dan struktur tipografi dokumen secara menyeluruh.' },
      { step: 3, title: 'Penataan Dokumen .docx', desc: 'Mesin generator akan menyusun kembali konten ke dalam hierarki paragraf dan baris Word yang rapi.' },
      { step: 4, title: 'Unduh File Word', desc: 'Klik tombol unduh untuk membuka berkas hasil konversi langsung di Microsoft Word atau Google Docs.' }
    ],
    faq: [
      { q: 'Apakah tabel dan bullet points di dalam PDF akan tetap rapi di Word?', a: 'Ya, sistem berusaha merekonstruksi baris tabel dan tanda daftar agar tetap berbentuk elemen tabel dan bullet yang mudah diedit di Word.' },
      { q: 'Bagaimana jika dokumen PDF saya berisi foto dokumen tulisan tangan?', a: 'Untuk tulisan tangan, akurasi OCR bergantung pada kerapian tulisan. Namun untuk dokumen ketikan komputer hasil cetak/scan, akurasi mencapai lebih dari 95%.' },
      { q: 'Apakah saya perlu menginstal Microsoft Word untuk mengonversi?', a: 'Tidak. Konversi berlangsung 100% di browser. Anda hanya membutuhkan aplikasi pengolah kata saat hendak membuka file .docx hasil unduhan.' }
    ],
    relatedToolIds: ['pdf-editor', 'pdf-to-excel', 'pdf-to-ppt'],
    relatedBlogSlugs: ['cara-edit-teks-pdf-hasil-scan-dan-dokumen-digital-online-gratis', 'cara-edit-teks-pdf-langsung-di-browser-online']
  },

  'image-compress': {
    id: 'image-compress',
    badge: 'Optimasi WebP, JPG & PNG',
    h1: 'Kompres & Konversi Foto / Gambar Kilat',
    tagline: 'Kecilkan Ukuran Foto KTP, Pas Foto, dan Banner Produk ke Target KB Tanpa Pecah',
    intro: 'Kompres Gambar & Foto KompresKilat memberikan kemudahan bagi pedagang online, pemilik UMKM, dan pencari kerja untuk mengecilkan ukuran berkas foto produk e-commerce, foto KTP, dan pas foto 2x3/3x4/4x6 agar lolos batas upload sistem web. Berkas foto jepretan kamera smartphone modern rata-rata berukuran 5MB hingga 15MB, yang dapat membuat loading website toko online menjadi lambat atau gagal diunggah ke formulir pendaftaran. Dengan teknologi kompresi canvas adaptif, Anda dapat mengatur target resolusi, menentukan tingkat persentase kualitas, atau mengubah format ke format WebP masa kini yang jauh lebih hemat bandwidth hingga 70%.',
    benefits: [
      { icon: '🎯', title: 'Target Ukuran Presisi', desc: 'Atur batas maksimal file seperti di bawah 100KB, 200KB, atau 500KB sesuai instruksi formulir.' },
      { icon: '🚀', title: 'Loading Web Lebih Cepat', desc: 'Ubah gambar ke format WebP generasi baru untuk meningkatkan skor performa Google Core Web Vitals.' },
      { icon: '🔒', title: 'Privasi Pas Foto Terjaga', desc: 'Foto identitas diri Anda tidak diunggah ke server internet sehingga terlindung dari risiko penyalahgunaan.' }
    ],
    howToTitle: 'Cara Mengompres Ukuran Foto dan Gambar Secara Presisi:',
    howToSubtitle: 'Panduan ringkas memperkecil ukuran foto untuk kebutuhan toko online atau pendaftaran kerja',
    howToSteps: [
      { step: 1, title: 'Pilih Berkas Foto', desc: 'Tarik foto JPG, PNG, atau WebP dari galeri ponsel atau komputer Anda ke kotak unggah.' },
      { step: 2, title: 'Atur Kualitas & Resolusi', desc: 'Geser slider persentase kualitas atau pilih opsi konversi format target sesuai kebutuhan.' },
      { step: 3, title: 'Lihat Pratinjau Langsung', desc: 'Periksa perbandingan ukuran awal vs estimasi ukuran baru sebelum berkas disimpan.' },
      { step: 4, title: 'Unduh Gambar Baru', desc: 'Klik tombol "Unduh Foto" untuk menyimpan gambar berukuran hemat memori dengan kejernihan maksimal.' }
    ],
    faq: [
      { q: 'Apakah foto KTP atau dokumen sensitif saya aman dikompres di sini?', a: 'Sangat aman. Pemrosesan gambar dieksekusi menggunakan HTML5 Canvas API lokal di browser Anda. Tidak ada satu pun bit foto yang dikirimkan ke server kami.' },
      { q: 'Format foto apa yang menghasilkan ukuran paling kecil?', a: 'Format WebP memberikan rasio kompresi terbaik dengan ukuran berkas hingga 30% lebih ramping dibanding JPG standar pada tingkat kualitas visual yang sama.' },
      { q: 'Bisakah saya mengompres foto berukuran sangat besar dari kamera DSLR?', a: 'Bisa. Sistem secara otomatis mereduksi dimensi gambar secara proporsional agar memori peramban tetap lancar saat memproses foto resolusi tinggi.' }
    ],
    relatedToolIds: ['resize-pasfoto', 'remove-bg', 'censor-ktp'],
    relatedBlogSlugs: ['cara-membuat-watermark-ktp-dan-resize-pasfoto-paspor-standar-global', 'cara-edit-foto-dokumen-ktp-watermark-keamanan']
  },

  'ats-resume': {
    id: 'ats-resume',
    badge: 'AI Screening & ATS Scanner',
    h1: 'AI Resume & CV Reviewer: Cek Skor ATS & Template Otomatis',
    tagline: 'Audit Kata Kunci CV, Tingkatkan Peluang Lolos HRD, dan Unduh Template Berstandar ATS',
    intro: 'Alat AI Resume Reviewer & ATS Score Checker KompresKilat diciptakan untuk membantu para pencari kerja (fresh graduate maupun profesional berpengalaman) menembus sistem penyaring otomatis Applicant Tracking System (ATS) yang digunakan oleh perusahaan multinasional, BUMN, perbankan, dan startup terkemuka. Lebih dari 70% berkas lamaran gugur di tahap screening awal karena format dokumen yang rumit, ketiadaan kata kunci yang relevan dengan kualifikasi lowongan, atau tata letak tabel yang tidak terbaca oleh robot scanner. Dengan alat ini, Anda dapat memindai isi CV Anda, mengukur persentase kecocokan terhadap deskripsi pekerjaan incaran, mengoreksi teks langsung di lembar kerja, menyisipkan foto formal, serta mengunduh hasilnya dalam format Microsoft Word (.docx) atau PDF siap kirim.',
    benefits: [
      { icon: '🎯', title: 'Skor ATS Akurat', desc: 'Dapatkan persentase kesiapan CV Anda beserta daftar kata kunci kualifikasi yang perlu ditambahkan.' },
      { icon: '📝', title: '3 Template Live Editor', desc: 'Pilih template ATS Standard, Formal BUMN, atau Minimalist dan edit teks langsung di atas kertas.' },
      { icon: '💼', title: 'Ekspor Word & PDF', desc: 'Unduh berkas CV siap kirim dalam format .docx asli atau simpan langsung ke lembaran PDF resmi.' }
    ],
    howToTitle: 'Cara Mengukur Skor ATS dan Mengoptimalkan CV Lamaran Kerja:',
    howToSubtitle: 'Panduan praktis menyusun resume berstandar internasional yang disukai perekrut dan robot ATS',
    howToSteps: [
      { step: 1, title: 'Tempel Teks CV atau Muat Contoh', desc: 'Salin isi teks riwayat hidup Anda ke kotak editor atau gunakan contoh CV profesional yang telah disediakan.' },
      { step: 2, title: 'Ketik Target Jabatan (Opsional)', desc: 'Masukkan nama posisi yang Anda incar (seperti Digital Marketer, Frontend Engineer, atau Admin) untuk audit kata kunci yang lebih spesifik.' },
      { step: 3, title: 'Jalankan Analisis Skor ATS', desc: 'Klik tombol "Analisis Skor ATS" untuk melihat nilai kesiapan, deteksi kelemahan poin pengalaman, dan rekomendasi kata kerja aksi.' },
      { step: 4, title: 'Sesuaikan Template & Unduh', desc: 'Beralih ke tab "Pilihan Template CV", sesuaikan rincian pengalaman kerja, pasang foto profil bila diperlukan, dan unduh dokumen Anda.' }
    ],
    faq: [
      { q: 'Mengapa format CV ATS friendly sangat dianjurkan untuk melamar kerja?', a: 'Robot ATS memindai teks tanpa memperhatikan desain grafis warna-warni. Template ATS yang lurus, tanpa kolom bertingkat yang rumit, memastikan data nama, nomor HP, riwayat pendidikan, dan pengalaman kerja Anda terbaca 100% tanpa error.' },
      { q: 'Apakah data nomor HP, alamat, dan gaji saya tetap aman saat dianalisis?', a: 'Pasti aman. Proses audit teks dan penataan template CV berjalan sepenuhnya di browser Anda. Kami tidak menyimpan atau memperjualbelikan database resume para pengguna.' },
      { q: 'Apakah template yang diunduh dalam format Word (.docx) dapat diedit kembali?', a: 'Ya, file .docx yang diunduh merupakan dokumen OpenXML standar yang dapat Anda buka dan edit kembali kapan saja di Microsoft Word, Google Docs, maupun WPS Office.' }
    ],
    relatedToolIds: ['pdf-editor', 'pdf-to-word', 'document-summarizer'],
    relatedBlogSlugs: ['panduan-format-cv-ats-friendly-lolos-kerja-dan-kesalahan-fatal', 'cara-optimasi-kata-kunci-cv-ats-sesuai-job-description-fresh-graduate']
  },

  'tracking-resi': {
    id: 'tracking-resi',
    badge: '11+ Ekspedisi Indonesia',
    h1: 'Cek Resi & Lacak Paket Pengiriman Logistik',
    tagline: 'Pantau Perjalanan Paket Shopee Xpress, JNE, J&T, SiCepat, Anteraja & Pos Indonesia Secara Akurat',
    intro: 'Alat Cek Resi & Lacak Paket KompresKilat memberikan kemudahan bagi pembeli online dan pemilik toko daring untuk memantau status posisi kiriman barang belanjaan secara cepat dan akurat. Sistem kami dilengkapi dengan algoritma deteksi kurir otomatis yang mengenali format nomor resi terpopuler di Indonesia, mulai dari Shopee Express (SPX), JNE Express, J&T, SiCepat, Anteraja, Pos Indonesia, TIKI, Wahana, hingga Lion Parcel. Anda dapat melihat kronologi perjalanan paket dari titik asal seller, hub gateway transit, kantor cabang penerima, hingga nama kurir pengantar beserta estimasi waktu tiba tanpa perlu mengetik kode captcha yang rumit.',
    benefits: [
      { icon: '🚚', title: 'Deteksi Kurir Cerdas', desc: 'Otomatis mengenali ekspedisi hanya dari awalan nomor resi tanpa perlu memilih kurir manual.' },
      { icon: '📍', title: 'Timeline Checkpoint Rinci', desc: 'Pantau jam pemindaian, lokasi gudang sortir, dan status serah terima kurir secara runut.' },
      { icon: '💾', title: 'Riwayat Pencarian Lokal', desc: 'Nomor resi Anda tersimpan otomatis di perangkat sehingga mudah dicek kembali kapan saja.' }
    ],
    howToTitle: 'Cara Melacak Keberadaan Paket Ekspedisi Anda:',
    howToSubtitle: 'Panduan mudah mengecek posisi paket dari berbagai marketplace online',
    howToSteps: [
      { step: 1, title: 'Salin Nomor Resi Pengiriman', desc: 'Buka aplikasi e-commerce atau nota resi Anda, lalu salin deretan angka/huruf nomor resi (AWB).' },
      { step: 2, title: 'Tempelkan ke Kolom Pencarian', desc: 'Ketik atau tempelkan nomor resi ke dalam kotak pelacakan di atas. Sistem akan mendeteksi nama ekspedisi secara instan.' },
      { step: 3, title: 'Klik Tombol Lacak Paket', desc: 'Tekan "Lacak Paket Sekarang" untuk menghubungi sistem pelacakan status rute ekspedisi.' },
      { step: 4, title: 'Pantau Riwayat Perjalanan', desc: 'Baca timeline riwayat transit paket Anda dan periksa apakah paket sudah dibawa oleh kurir pengantar hari ini.' }
    ],
    faq: [
      { q: 'Mengapa nomor resi yang baru saja dikirimkan penjual belum bisa dilacak?', a: 'Ekspedisi membutuhkan waktu 1-6 jam setelah paket fisik diserahkan ke agen untuk pemindaian barcode awal di sistem sortir. Jika baru dibuatkan label (manifested), data riwayat biasanya aktif pada malam hari.' },
      { q: 'Apa yang harus dilakukan jika status paket tidak bergerak lebih dari 3 hari?', a: 'Jika paket tertahan lama di satu hub transit, hubungi pusat bantuan kurir terkait dengan menyebutkan nomor resi untuk meminta konfirmasi tindak lanjut pengiriman ke alamat tujuan.' },
      { q: 'Apakah KompresKilat menyimpan nomor resi saya di server internet?', a: 'Tidak. Riwayat pencarian hanya disimpan di LocalStorage peramban perangkat Anda agar Anda tidak perlu mengetik ulang nomor resi yang sama setiap hari.' }
    ],
    relatedToolIds: ['invoice-generator', 'kalkulator-umkm', 'qr-generator'],
    relatedBlogSlugs: ['cara-lacak-paket-shopee-express-spx-akurat', 'arti-status-resi-jne-jnt-sicepat-lengkap']
  },

  'invoice-generator': {
    id: 'invoice-generator',
    badge: 'Format Standar Usaha & UMKM',
    h1: 'Pembuat Invoice, Nota Toko & Kwitansi Resmi Online',
    tagline: 'Buat Tagihan Profesional dengan Kalkulasi Pajak PPN/PPH, Tanda Tangan, dan Stempel Toko',
    intro: 'Pembuat Invoice & Nota Digital KompresKilat diciptakan khusus bagi para wirausahawan, pemilik toko kelontong, freelancer, konsultan, dan pelaku UMKM di seluruh Indonesia untuk mencetak dokumen penagihan pembayaran yang kredibel dan tertata rapi. Anda dapat memasukkan logo usaha, merinci daftar barang atau jasa, menambahkan diskon, menghitung kalkulasi pajak PPN (11%/12%) dan potongan PPh secara otomatis, serta melampirkan tanda tangan digital dan stempel stempel lunas. Dokumen tagihan dapat langsung dicetak ke printer biasa (kertas A4/Letter), printer kasir thermal struk (58mm/80mm), atau diunduh sebagai file PDF resmi siap kirim ke klien via WhatsApp atau email.',
    benefits: [
      { icon: '🧾', title: 'Pilihan Format Lengkap', desc: 'Tersedia template Invoice Tagihan Resmi, Nota Penjualan Kasir, dan Kwitansi Tanda Terima Uang.' },
      { icon: '🧮', title: 'Kalkulasi Otomatis', desc: 'Subtotal harga, diskon bertingkat, dan pajak PPN/PPh terhitung otomatis tanpa risiko keliru hitung.' },
      { icon: '🖨️', title: 'Dukungan Printer Thermal', desc: 'Mendukung cetak langsung ke printer mini kasir Bluetooth thermal ukuran 58mm dan 80mm.' }
    ],
    howToTitle: 'Cara Membuat Invoice dan Nota Pembayaran Usaha:',
    howToSubtitle: 'Panduan 4 langkah mudah menerbitkan tagihan transaksi resmi untuk pelanggan',
    howToSteps: [
      { step: 1, title: 'Isi Informasi Usaha & Pelanggan', desc: 'Ketik nama toko/perusahaan Anda, alamat, nomor telepon, logo usaha, serta identitas pihak penerima tagihan.' },
      { step: 2, title: 'Tambahkan Daftar Barang / Jasa', desc: 'Rinci nama produk, kuantitas (qty), satuan, harga per unit, serta diskon atau potongan promo yang berlaku.' },
      { step: 3, title: 'Atur Rekening Pembayaran & Pajak', desc: 'Cantumkan nomor rekening bank atau e-wallet tujuan transfer, tenggat waktu (due date), dan persentase pajak PPN.' },
      { step: 4, title: 'Cetak Langsung atau Simpan PDF', desc: 'Bubuhkan tanda tangan atau stempel usaha, lalu klik "Cetak / Simpan PDF" untuk mengirimkan tagihan ke pelanggan Anda.' }
    ],
    faq: [
      { q: 'Apakah nota dan invoice yang dibuat di sini memiliki kekuatan hukum sebagai bukti transaksi?', a: 'Ya, invoice dan nota yang mencantumkan rincian barang, tanggal transaksi, identitas penjual/pembeli, serta tanda tangan/stempel sah dapat digunakan sebagai dokumen tagihan resmi dan bukti pembukuan usaha.' },
      { q: 'Apakah data omzet dan daftar pelanggan saya tersimpan di server?', a: 'Tidak. Seluruh data transaksi diolah di memori browser Anda dan dapat disimpan ke perangkat lokal. Kami tidak mencatat detail pembukuan rahasia bisnis Anda.' },
      { q: 'Bisakah saya mencetak invoice dalam ukuran struk kasir mini?', a: 'Bisa. Tersedia opsi tata letak "Struk Thermal" yang dirancang pas untuk printer kasir mini ukuran kertas 58mm dan 80mm tanpa terpotong.' }
    ],
    relatedToolIds: ['kalkulator-umkm', 'kalkulator-pajak', 'tanda-tangan'],
    relatedBlogSlugs: ['cara-membuat-invoice-nota-kwitansi-resmi-online-gratis-cetak-thermal', 'cara-menghitung-diskon-bertingkat-dan-pajak-pph-21-online']
  },

  'kalkulator-pajak': {
    id: 'kalkulator-pajak',
    badge: 'Sesuai UU HPP & Tarif Efektif TER',
    h1: 'Kalkulator Pajak Penghasilan (PPh 21, 23 & 4(2))',
    tagline: 'Simulasi Potongan Pajak Gaji Karyawan TER 2026, Jasa Konsultan, dan Sewa Properti Akurat',
    intro: 'Kalkulator Pajak KompresKilat adalah alat bantu keuangan komprehensif untuk staf HRD, bagian keuangan (finance/payroll), pekerja lepas (*freelancer*), dan pemilik badan usaha yang ingin menghitung estimasi potongan pajak penghasilan secara transparan dan akurat. Mengikuti regulasi perpajakan terbaru di Indonesia (UU Harmonisasi Peraturan Perpajakan / UU HPP serta skema Tarif Efektif Rata-Rata / TER PP 58/2023), kalkulator ini mencakup simulasi PPh 21 Karyawan Tetap bulanan dan tahunan, PPh 21 Bukan Pegawai/Freelancer dengan Norma Perhitungan (NPPN), PPh 23 atas jasa dan dividen, hingga PPh Final Pasal 4 ayat (2) untuk sewa tanah dan bangunan.',
    benefits: [
      { icon: '📊', title: 'Skema TER & UU HPP Terbaru', desc: 'Mendukung perhitungan akurat TER Kategori A, B, C serta batas Penghasilan Tidak Kena Pajak (PTKP).' },
      { icon: '💼', title: 'Mencakup 3 Kategori Pajak', desc: 'Dapat digunakan untuk menghitung PPh 21 gaji, PPh 23 vendor/jasa teknik, dan PPh 4(2) sewa bangunan.' },
      { icon: '📋', title: 'Rincian Slip Gaji Siap Salin', desc: 'Menghasilkan ringkasan take-home pay dan kode billing akun pajak (KAP/KJS) siap pakai.' }
    ],
    howToTitle: 'Cara Menghitung Potongan PPh 21 Gaji Karyawan:',
    howToSubtitle: 'Panduan simulasi perhitungan pajak penghasilan sesuai aturan tarif resmi',
    howToSteps: [
      { step: 1, title: 'Pilih Kategori Pajak', desc: 'Tentukan jenis pajak yang ingin dihitung: PPh 21 (Gaji/Upah), PPh 23 (Jasa/Dividen), atau PPh 4(2) (Sewa Properti).' },
      { step: 2, title: 'Tentukan Status PTKP', desc: 'Pilih status perkawinan dan jumlah tanggungan keluarga (misal: TK/0, K/1, K/2, K/3) untuk menentukan batas bebas pajak Anda.' },
      { step: 3, title: 'Masukkan Nominal Penghasilan Bruto', desc: 'Ketik nominal gaji kotor bulanan termasuk tunjangan rutin, lembur, dan bonus yang diterima.' },
      { step: 4, title: 'Lihat Hasil Potongan Pajak', desc: 'Periksa persentase tarif efektif yang dikenakan, jumlah potongan pajak bulanan, dan estimasi gaji bersih yang dibawa pulang.' }
    ],
    faq: [
      { q: 'Apakah batas PTKP terbaru masih Rp 54.000.000 per tahun untuk wajib pajak lajang?', a: 'Ya, sesuai ketentuan UU HPP, batas PTKP dasar untuk Wajib Pajak Orang Pribadi lajang tanpa tanggungan (TK/0) tetap Rp 54.000.000 per tahun atau Rp 4.500.000 per bulan.' },
      { q: 'Apa perbedaan skema TER bulanan dengan perhitungan PPh 21 akhir tahun?', a: 'Skema TER (Tarif Efektif Rata-Rata) diterapkan untuk memudahkan pemotongan pajak bulanan (Januari–November). Pada bulan Desember, perusahaan akan menghitung ulang total pajak setahun menggunakan tarif Pasal 17 untuk menentukan pajak terutang sesungguhnya.' },
      { q: 'Apakah data nominal gaji yang saya ketik akan tersimpan di internet?', a: 'Tidak. KompresKilat tidak mencatat atau mengirim data finansial pengguna ke server luar. Seluruh kalkulasi matematika diproses di browser Anda.' }
    ],
    relatedToolIds: ['kalkulator-finansial', 'kalkulator-umkm', 'invoice-generator'],
    relatedBlogSlugs: ['cara-menghitung-diskon-bertingkat-dan-pajak-pph-21-online', 'cara-membuat-invoice-nota-kwitansi-resmi-online-gratis-cetak-thermal']
  },

  'kalkulator-umkm': {
    id: 'kalkulator-umkm',
    badge: 'Solusi Laba & Bisnis UMKM',
    h1: 'Kalkulator Bisnis & UMKM: Margin, HPP & Titik Impas (BEP)',
    tagline: 'Hitung Harga Jual Ideal, Persentase Keuntungan Bersih, dan Batas BEP Usaha Tanpa Rugi',
    intro: 'Kalkulator Bisnis & UMKM KompresKilat merupakan instrumen kalkulasi penting bagi pemilik toko retail, wirausahawan kuliner, pengusaha konveksi, hingga pedagang online shop untuk merumuskan struktur harga produk yang menguntungkan. Sering kali pengusaha pemula mengalami kerugian karena salah membedakan antara Margin Keuntungan dan Persentase Markup, atau lupa memperhitungkan biaya operasional pengemasan, potongan komisi marketplace e-commerce, dan target titik impas (*Break Even Point / BEP*). Melalui alat ini, Anda dapat mensimulasikan harga jual optimal dari modal HPP dasar, merencanakan target laba bulanan, serta mengecek simulasi pajak PPh Final UMKM 0.5% (PP 23) dengan kuota bebas omzet Rp 500 juta secara tepat.',
    benefits: [
      { icon: '💰', title: 'Margin vs Markup Akurat', desc: 'Hindari salah penentuan harga dengan kalkulasi matematis margin laba bersih yang sesungguhnya.' },
      { icon: '⚖️', title: 'Analisis Titik Impas (BEP)', desc: 'Ketahui berapa unit produk yang harus terjual dalam sebulan agar seluruh modal operasional tertutup.' },
      { icon: '🧾', title: 'Simulasi PPh Final 0.5%', desc: 'Periksa kewajiban pajak UMKM berdasarkan omzet tahunan dan batas fasilitas bebas pajak Rp 500 Juta.' }
    ],
    howToTitle: 'Cara Menentukan Harga Jual dan Menghitung Margin Keuntungan:',
    howToSubtitle: 'Panduan merancang penetapan harga produk agar bisnis Anda terus bertumbuh secara sehat',
    howToSteps: [
      { step: 1, title: 'Hitung Biaya Pokok Produksi (HPP)', desc: 'Masukkan biaya bahan baku, ongkos kemasan, dan biaya tenaga kerja langsung per unit barang.' },
      { step: 2, title: 'Tentukan Target Keuntungan', desc: 'Pilih metode perhitungan yang diinginkan (Target Margin % dari harga jual, atau Target Markup % dari modal).' },
      { step: 3, title: 'Faktorkan Biaya Komisi & Operasional', desc: 'Tambahkan estimasi potongan admin marketplace atau biaya promosi iklan agar tidak menggerus laba bersih.' },
      { step: 4, title: 'Dapatkan Rekomendasi Harga Jual', desc: 'Simpan nominal harga jual yang direkomendasikan beserta ringkasan laba bersih per produk yang terjual.' }
    ],
    faq: [
      { q: 'Apa perbedaan mendasar antara Margin Keuntungan dan Markup?', a: 'Markup adalah persentase laba yang ditambahkan di atas modal (HPP), sedangkan Margin adalah persentase keuntungan bersih dihitung dari harga jual final. Margin 50% setara dengan Markup 100%.' },
      { q: 'Apakah wirausaha perorangan beromzet di bawah Rp 500 juta per tahun wajib membayar pajak?', a: 'Sesuai UU HPP, Wajib Pajak Orang Pribadi UMKM dengan omzet kumulatif belum mencapai Rp 500.000.000 dalam satu tahun pajak berhak atas fasilitas bebas PPh Final (pajak 0 rupiah).' },
      { q: 'Bagaimana cara menentukan titik impas (Break Even Point / BEP) usaha?', a: 'BEP dicapai saat total pendapatan penjualan sama dengan total biaya tetap ditambah biaya variabel. Rumus dasarnya adalah: Biaya Tetap dibagi dengan (Harga Jual per Unit dikurangi Biaya Variabel per Unit).' }
    ],
    relatedToolIds: ['invoice-generator', 'kalkulator-pajak', 'kalkulator-finansial'],
    relatedBlogSlugs: ['cara-menghitung-diskon-bertingkat-dan-pajak-pph-21-online', 'cara-membuat-invoice-nota-kwitansi-resmi-online-gratis-cetak-thermal']
  },

  'seo-audit': {
    id: 'seo-audit',
    badge: 'Standar Google Search Essentials',
    h1: 'Website SEO, Health, and Security Audit Checker',
    tagline: 'Audit Teknis SEO On-Page, Skor Kesehatan Web, Keamanan SSL & Validasi Ramah AdSense',
    intro: 'Alat Audit Website SEO & Keamanan KompresKilat dirancang bagi webmaster, blogger, digital marketer, dan pemilik toko online yang ingin memvalidasi kelayakan teknis situs web mereka terhadap standar algoritma perayapan Google Search Essentials dan kepatuhan Google AdSense. Kerap kali sebuah website gagal mendapatkan peringkat teratas di hasil pencarian atau ditolak saat mengajukan monetisasi AdSense karena masalah teknis mendasar seperti ketiadaan tag meta deskripsi, struktur judul heading (H1, H2) yang tidak teratur, gambar tanpa teks alternatif (*alt text*), sertifikat SSL yang belum terkonfigurasi dengan proteksi header keamanan (HSTS, CSP), atau waktu respon server (*Time to First Byte / TTFB*) yang lambat. Pemindai ini menyajikan laporan kesehatan menyeluruh (0-100%), pratinjau live cuplikan Google SERP, dan ekspor laporan PDF terstruktur.',
    benefits: [
      { icon: '🔍', title: 'Audit On-Page Lengkap', desc: 'Memeriksa Tag Title, Meta Description, Heading H1/H2, dan kelengkapan atribut Alt gambar.' },
      { icon: '🔒', title: 'Validasi SSL & Keamanan', desc: 'Memverifikasi sertifikat HTTPS, header HSTS, pencegahan clickjacking, dan CSP.' },
      { icon: '📄', title: 'Ekspor Laporan PDF', desc: 'Unduh dokumen rangkuman skor kesehatan situs dalam format PDF siap presentasi ke klien.' }
    ],
    howToTitle: 'Cara Melakukan Audit SEO dan Kesehatan Situs Web:',
    howToSubtitle: 'Panduan langkah mudah memeriksa kesiapan teknis website Anda agar ramah mesin pencari',
    howToSteps: [
      { step: 1, title: 'Masukkan Alamat URL Website', desc: 'Ketik domain website yang ingin diperiksa (misal: domainanda.com) ke dalam kolom input atau gunakan contoh domain di atas.' },
      { step: 2, title: 'Klik Mulai Audit Website', desc: 'Tekan tombol "Mulai Audit" untuk mengaktifkan pemindai multi-tahap yang menganalisis struktur kode HTML dan respons server.' },
      { step: 3, title: 'Tinjau Skor Kesehatan & Rekomendasi', desc: 'Amati 4 pilar audit (SEO On-Page, Keamanan & SSL, Performa Kecepatan, dan Tampilan Seluler) serta daftar checklist perbaikan.' },
      { step: 4, title: 'Unduh Hasil Laporan PDF', desc: 'Klik tombol "Unduh Laporan PDF" untuk menyimpan berkas dokumentasi hasil audit sebagai panduan kerja tim developer Anda.' }
    ],
    faq: [
      { q: 'Mengapa audit teknis SEO penting untuk menghindari isu Low-Value Content AdSense?', a: 'Situs web yang mengalami kerusakan struktur heading, tidak memiliki meta deskripsi, atau lambat dimuat sering kali dianggap tidak siap tayang atau memiliki kualitas editorial rendah oleh peninjau Google AdSense.' },
      { q: 'Berapa panjang ideal untuk Tag Title dan Meta Description halaman web?', a: 'Panjang Tag Title yang optimal adalah 40 hingga 60 karakter, sedangkan Meta Description disarankan antara 120 hingga 160 karakter agar tidak terpotong elipsis (...) di hasil pencarian Google.' },
      { q: 'Apakah alat audit ini aman digunakan untuk memeriksa website produksi?', a: 'Sangat aman. Pemindai kami hanya membaca kode sumber HTML publik selayaknya perayap mesin pencari biasa tanpa membebani server situs Anda.' }
    ],
    relatedToolIds: ['image-compress', 'pdf-compress', 'qr-generator'],
    relatedBlogSlugs: ['panduan-format-cv-ats-friendly-lolos-kerja-dan-kesalahan-fatal', 'cara-optimasi-kata-kunci-cv-ats-sesuai-job-description-fresh-graduate']
  },

  'qr-generator': {
    id: 'qr-generator',
    badge: 'Resolusi Tinggi & Cetak Vektor',
    h1: 'QR Code Generator Kustom Online Gratis',
    tagline: 'Buat Kode QR Resolusi Tinggi untuk Link Website, Password WiFi, WhatsApp & Teks Bebas',
    intro: 'QR Code Generator KompresKilat memberikan kemudahan bagi pemilik bisnis, restoran, panitia seminar, dan pelaku UMKM untuk memproduksi kode respon cepat (QR Code) beresolusi tajam dalam sekejap. Anda dapat membuat kode QR untuk mengarahkan pelanggan langsung ke link menu digital, tautan katalog produk Tokopedia/Shopee, akses login jaringan WiFi kantor tanpa perlu mengetik sandi rumit, pesan chat WhatsApp otomatis ke nomor customer service, hingga kartu kontak nama (vCard). Kode QR yang dihasilkan mendukung pengunduhan dalam format PNG tajam siap cetak di banner, spanduk, kartu nama, atau kemasan produk tanpa risiko gagal dipindai oleh kamera ponsel.',
    benefits: [
      { icon: '📱', title: 'Mendukung Berbagai Jenis Data', desc: 'Buat QR untuk URL situs, koneksi WiFi instan, nomor WhatsApp dengan teks sapaan, dan teks pesan.' },
      { icon: '🖨️', title: 'Resolusi Tajam Siap Cetak', desc: 'File gambar hasil generate memiliki kontras piksel yang presisi sehingga terbaca oleh seluruh merk smartphone.' },
      { icon: '🔒', title: 'QR Statis Permanen', desc: 'Kode QR yang dibuat bersifat langsung (direct link) tanpa link perantara dan tidak akan kedaluwarsa.' }
    ],
    howToTitle: 'Cara Membuat Kode QR Kustom untuk Bisnis Anda:',
    howToSubtitle: 'Panduan praktis 4 langkah memproduksi kode QR untuk berbagai kebutuhan promosi',
    howToSteps: [
      { step: 1, title: 'Pilih Kategori Konten', desc: 'Tentukan jenis informasi yang ingin disimpan dalam kode QR (Tautan Website, Kata Sandi WiFi, Chat WA, atau Teks).' },
      { step: 2, title: 'Ketik Teks atau Alamat Link', desc: 'Masukkan URL landing page atau nomor WhatsApp Anda ke kolom input yang tersedia.' },
      { step: 3, title: 'Pratinjau Kode QR Instan', desc: 'Gambar QR code akan langsung terbentuk dan terbarui secara real-time seiring Anda mengetik.' },
      { step: 4, title: 'Unduh Gambar QR', desc: 'Klik tombol "Unduh Gambar QR Code (PNG)" untuk menyimpan gambar berkualitas tinggi siap pakai.' }
    ],
    faq: [
      { q: 'Apakah kode QR yang dibuat di sini memiliki batas waktu kadaluwarsa?', a: 'Tidak pernah kadaluwarsa. Kode QR kami adalah jenis QR statis yang menyimpan data asli secara permanen di dalam pola pikselnya.' },
      { q: 'Bisakah kode QR ini dicetak pada spanduk besar berukuran meteran?', a: 'Bisa. File PNG yang dihasilkan memiliki resolusi tajam sehingga tidak akan pecah saat dicetak pada kartu nama, stiker meja kasir, maupun baliho besar.' },
      { q: 'Apakah tamu kafe bisa langsung terhubung ke WiFi hanya dengan scan QR?', a: 'Ya, smartphone modern (Android dan iOS) akan otomatis mendeteksi SSID dan password dari kode QR WiFi untuk menghubungkan perangkat seketika tanpa input manual.' }
    ],
    relatedToolIds: ['invoice-generator', 'tracking-resi', 'kalkulator-umkm'],
    relatedBlogSlugs: ['cara-membuat-kartu-ucapan-online-gratis-dengan-foto-sendiri', 'cara-membuat-invoice-nota-kwitansi-resmi-online-gratis-cetak-thermal']
  },

  'zip-utility': {
    id: 'zip-utility',
    badge: 'Kompresi Arsip Tanpa Upload',
    h1: 'Arsip ZIP Multi-File: Ekstrak & Kompresi Berkas Online',
    tagline: 'Bungkus Banyak Berkas Jadi Satu Arsip .zip atau Ekstrak Isi ZIP Langsung di Peramban',
    intro: 'Arsip ZIP Multi-File KompresKilat adalah solusi praktis untuk mengelola kumpulan berkas berukuran besar langsung di dalam browser tanpa harus menginstal aplikasi pihak ketiga seperti WinRAR atau 7-Zip. Alat ini sangat berguna ketika Anda perlu membungkus puluhan dokumen tugas, foto portofolio, invoice, atau aset kode ke dalam satu berkas .zip yang rapi sebelum dikirim melalui email atau diunggah ke Google Drive. Selain itu, Anda juga dapat membuka dan mengekstrak isi file ZIP yang Anda terima dari internet untuk mengunduh dokumen di dalamnya satu per satu secara selektif dengan keamanan data 100% terjaga di perangkat lokal Anda.',
    benefits: [
      { icon: '🗜️', title: 'Kompresi Cepat & Efisien', desc: 'Kemas ratusan file dokumen dan foto menjadi satu file arsip .zip yang terstruktur rapi.' },
      { icon: '📦', title: 'Ekstraksi Selektif', desc: 'Buka dan lihat daftar isi berkas ZIP langsung di browser tanpa perlu mengekstrak seluruh isi file.' },
      { icon: '🛡️', title: 'Bebas Risiko Virus Server', desc: 'Semua proses kompresi dan unzipping dieksekusi secara lokal di dalam memori komputer Anda.' }
    ],
    howToTitle: 'Cara Mengompres atau Mengekstrak Berkas Arsip ZIP:',
    howToSubtitle: 'Panduan mudah mengelola file arsip ZIP secara cepat tanpa instalasi software',
    howToSteps: [
      { step: 1, title: 'Pilih Mode (Kemas ZIP atau Ekstrak)', desc: 'Tentukan apakah Anda ingin membungkus banyak file menjadi ZIP baru, atau mengekstrak file ZIP yang sudah ada.' },
      { step: 2, title: 'Unggah Dokumen atau File ZIP', desc: 'Seret berkas-berkas Anda ke area dropzone. Daftar nama file dan ukuran akan tampil secara rapi.' },
      { step: 3, title: 'Tentukan Nama Arsip (Jika Membuat)', desc: 'Ketik nama berkas arsip yang diinginkan sebelum proses pengemasan dimulai.' },
      { step: 4, title: 'Unduh Hasil ZIP atau File yang Diekstrak', desc: 'Klik tombol unduh untuk menyimpan file .zip baru atau mengambil dokumen yang telah didekompresi.' }
    ],
    faq: [
      { q: 'Apakah ada batasan ukuran file yang bisa dikompres menjadi ZIP di sini?', a: 'Kapasitas bergantung pada memori RAM perangkat Anda. Untuk komputer dan ponsel modern, Anda dapat mengemas hingga puluhan atau ratusan megabyte dengan sangat lancar.' },
      { q: 'Apakah file ZIP yang dihasilkan kompatibel dengan Windows, Mac, dan HP?', a: 'Ya, file .zip yang dibuat berstandar kompresi PKZIP internasional sehingga dapat dibuka di Windows Explorer, macOS Finder, iOS Files, maupun Android tanpa kendala.' },
      { q: 'Apakah berkas rahasia di dalam ZIP aman dari pencurian data?', a: 'Sangat aman. Tidak ada transmisi jaringan ke server mana pun karena seluruh pembacaan byte data ZIP dilakukan di browser Anda sendiri.' }
    ],
    relatedToolIds: ['pdf-merge', 'file-utility', 'batch-compress'],
    relatedBlogSlugs: ['cara-menggabungkan-file-pdf-menjadi-satu-online-gratis', 'cara-edit-foto-dokumen-ktp-watermark-keamanan']
  }
};

/**
 * Fallback generator editorial cerdas untuk 43 tools
 * Jika tool belum memiliki custom editorial lengkap, fungsi ini menghasilkan teks terstruktur
 * berbobot tinggi (> 250 kata, langkah 1-4, dan 3 FAQ) berdasarkan kategori & metadata tool.
 */
export function getToolEditorialData(toolIdOrPath: string): ToolEditorialData {
  // 1. Cari exact match dari catalog manual
  const cleanKey = toolIdOrPath.replace(/^\/tools\//, '').replace(/^\//, '');
  if (TOOLS_EDITORIAL_CATALOG[cleanKey]) {
    return TOOLS_EDITORIAL_CATALOG[cleanKey];
  }

  // 2. Cari tool dari ALL_TOOLS
  const foundTool: ToolItem | undefined = ALL_TOOLS.find(
    (t) => t.id === cleanKey || t.href === `/${cleanKey}` || t.href === `/tools/${cleanKey}`
  );

  const title = foundTool?.title || cleanKey.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const category = foundTool?.category || 'Utilitas & Produktivitas';
  const desc = foundTool?.description || 'Alat utilitas digital serbaguna untuk kebutuhan pengolahan berkas, gambar, dan administrasi produktivitas Anda.';

  // 3. Tentukan sibling tools untuk Hub & Spoke
  const siblingTools = ALL_TOOLS.filter(
    (t) => t.id !== cleanKey && (t.category === category || t.categoryKey === foundTool?.categoryKey)
  ).slice(0, 3);
  const relatedToolIds = siblingTools.map((t) => t.id);

  // 4. Tentukan blog articles terkait
  const matchedBlogs = BLOG_POSTS.filter((b) => {
    return (
      b.relatedTool?.url.includes(cleanKey) ||
      b.category.toLowerCase().includes(category.toLowerCase().slice(0, 4))
    );
  }).slice(0, 3);

  const relatedBlogSlugs = matchedBlogs.length > 0
    ? matchedBlogs.map((b) => b.slug)
    : ['cara-menggabungkan-file-pdf-menjadi-satu-online-gratis', 'cara-membuat-watermark-ktp-dan-resize-pasfoto-paspor-standar-global'];

  return {
    id: cleanKey,
    badge: '100% Client-Side & Bebas Biaya',
    h1: `${title} Online Kilat & Aman`,
    tagline: `Solusi Digital Cepat, Akurat, dan Tanpa Ribet untuk Kebutuhan ${category}`,
    intro: `Fitur ${title} di KompresKilat hadir sebagai solusi utilitas digital yang dirancang khusus untuk mempermudah rutinitas kerja para profesional, pelaku usaha UMKM, staf administrasi kantor, mahasiswa, dan pencari kerja di Indonesia. Pengolahan berkas digital sering kali terkendala oleh keterbatasan software berbayar, antarmuka yang membingungkan, serta kekhawatiran privasi data pribadi saat menggunakan layanan daring. Dengan arsitektur komputasi modern yang berjalan langsung di peramban (client-side processing), ${title} memungkinkan Anda memproses file dengan kecepatan kilat, mempertahankan kualitas dokumen secara presisi, dan menjamin dokumen rahasia Anda tetap berada di perangkat lokal Anda tanpa pernah diunggah ke server cloud eksternal.`,
    benefits: [
      {
        icon: '⚡',
        title: 'Eksekusi Cepat Tanpa Antrean',
        desc: 'Pemrosesan berlangsung instan langsung di peramban perangkat Anda tanpa jeda waktu unggah berulang.'
      },
      {
        icon: '🔒',
        title: 'Privasi & Keamanan Maksimal',
        desc: 'Dokumen dan informasi rahasia tidak pernah disimpan atau ditransmisikan ke server pihak ketiga.'
      },
      {
        icon: '💻',
        title: 'Multi-Perangkat Bebas Instalasi',
        desc: 'Dapat diakses secara mulus melalui komputer desktop, laptop, tablet, maupun smartphone Android dan iPhone.'
      }
    ],
    howToTitle: `Panduan Cara Menggunakan ${title}:`,
    howToSubtitle: `Ikuti 4 langkah mudah berikut untuk memanfaatkan fitur ${title} secara optimal`,
    howToSteps: [
      {
        step: 1,
        title: 'Siapkan Berkas atau Data Masukan',
        desc: 'Buka halaman alat dan pilih file dokumen, foto, atau masukkan data yang ingin Anda proses ke dalam area kerja yang disediakan.'
      },
      {
        step: 2,
        title: 'Sesuaikan Pengaturan & Parameter',
        desc: 'Atur opsi konfigurasi seperti target ukuran, pilihan resolusi, format output, atau kolom data sesuai kebutuhan tugas Anda.'
      },
      {
        step: 3,
        title: 'Jalankan Pemrosesan Seketika',
        desc: 'Sistem akan secara cerdas memproses input Anda dalam hitungan detik dengan kalkulasi algoritma yang presisi.'
      },
      {
        step: 4,
        title: 'Tinjau Hasil & Unduh Berkas',
        desc: 'Periksa pratinjau hasil akhir di layar, kemudian klik tombol simpan atau unduh untuk menyimpan berkas baru Anda.'
      }
    ],
    faq: [
      {
        q: `Apakah data dan file yang saya olah di fitur ${title} tersimpan di server KompresKilat?`,
        a: 'Sama sekali tidak. KompresKilat mengedepankan prinsip privasi Zero-Knowledge. Seluruh kalkulasi dan pengolahan data dieksekusi 100% di memori peramban lokal perangkat Anda sehingga tidak ada file yang disimpan di server internet.'
      },
      {
        q: 'Apakah ada batasan jumlah penggunaan atau biaya langganan?',
        a: 'Semua alat produktivitas di KompresKilat dapat digunakan secara gratis tanpa batasan kuota harian dan tanpa perlu melakukan pendaftaran akun terlebih dahulu.'
      },
      {
        q: 'Bagaimana jika hasil unduhan mengalami kendala saat dibuka di perangkat lain?',
        a: 'Seluruh format berkas yang dihasilkan (seperti PDF, Word, JPG, WebP, dan ZIP) menggunakan standar internasional terbuka yang sepenuhnya kompatibel dengan sistem operasi Windows, macOS, Android, dan iOS.'
      }
    ],
    relatedToolIds: relatedToolIds.length > 0 ? relatedToolIds : ['pdf-compress', 'image-compress', 'qr-generator'],
    relatedBlogSlugs: relatedBlogSlugs
  };
}
