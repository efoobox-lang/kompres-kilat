export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Tips SEO' | 'Dokumen PDF' | 'Ekspedisi & Resi' | 'Gambar & Foto';
  date: string;
  readTime: string;
  author: string;
  content: string; // Markdown or rich HTML-friendly text
  relatedTool: {
    title: string;
    description: string;
    url: string;
    icon: string;
    buttonText: string;
  };
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'cara-kompres-foto-ktp-kurang-dari-500kb',
    title: 'Cara Kompres Foto KTP Kurang dari 500KB untuk Syarat CPNS & BUMN',
    excerpt: 'Panduan lengkap memperkecil ukuran foto KTP dan dokumen identitas lainnya agar pas dengan batas maksimal unggah tanpa buram.',
    category: 'Gambar & Foto',
    date: '30 Oktober 2026',
    readTime: '3 menit',
    author: 'Tim KompresKilat',
    content: `
### Mengapa Foto KTP Sering Ditolak Sistem Pendaftaran?
Saat mendaftar seleksi Calon Pegawai Negeri Sipil (CPNS), rekrutmen bersama BUMN, atau portal kerja online lainnya, salah satu keluhan paling umum adalah: **"File foto melebihi batas ukuran maksimal (maksimal 200KB atau 500KB)"**.

Kamera smartphone modern saat ini rata-rata menghasilkan foto dengan resolusi tinggi (12MP - 108MP) dengan ukuran berkas berkisar antara **3MB hingga 10MB**. Jika langsung diunggah tanpa dikompresi, sistem server akan langsung menolaknya.

---

### Syarat Foto KTP yang Baik & Aman:
1. **Teks Harus Terbaca Jelas**: NIK, nama lengkap, tanggal lahir, dan alamat tidak boleh buram atau pecah.
2. **Format Tepat**: Gunakan format standar seperti **JPG/JPEG** atau **PNG**. Beberapa instansi belum menerima format HEIC atau WebP.
3. **Ukuran File Sesuai Rentang**: Jangan terlalu besar (> 500KB) dan jangan terlalu kecil (< 50KB) karena jika terlalu kecil gambar biasanya mengalami distorsi parah.

---

### Langkah Kompres Foto KTP Menggunakan KompresKilat:
1. **Pilih Foto KTP**: Buka tool [Kompres Gambar](/tools/image).
2. **Pilih Preset atau Kualitas**: Pilih opsi **Sedang (Medium)** atau gunakan preset **Target < 500KB**.
3. **Proses Instan di Browser**: KompresKilat memproses foto langsung di perangkat Anda tanpa mengirim foto sensitif Anda ke server kami. Ini menjamin privasi dan keamanan identitas Anda 100%.
4. **Unduh Hasil**: Periksa ukuran baru dan unduh foto KTP yang sudah berukuran ringan namun tetap tajam.
    `,
    relatedTool: {
      title: 'Kompres Foto KTP Sekarang',
      description: 'Gunakan alat kompresi foto cerdas kami untuk mengecilkan foto KTP ke bawah 500KB atau 200KB secara aman di browser Anda.',
      url: '/tools/image',
      icon: '🖼️',
      buttonText: 'Buka Kompres Gambar 🚀',
    },
  },
  {
    slug: 'cara-lacak-paket-shopee-express-spx-akurat',
    title: 'Cara Lacak Paket Shopee Express (SPX) Akurat dan Arti Status Pengiriman',
    excerpt: 'Panduan melacak nomor resi SPX Standard, Sameday, maupun Hemat, beserta arti status transit di Hub Sorting.',
    category: 'Ekspedisi & Resi',
    date: '29 Oktober 2026',
    readTime: '4 menit',
    author: 'Tim KompresKilat',
    content: `
### Mengenal Layanan Shopee Express (SPX)
Shopee Express (kini dikenal sebagai **SPX**) merupakan layanan logistik resmi milik Shopee untuk pengiriman pesanan pembeli. Layanan ini terbagi menjadi beberapa jenis:
- **SPX Standard**: Pengiriman reguler antar kota/pulau.
- **SPX Sameday & Instant**: Pengiriman cepat tiba di hari yang sama.
- **SPX Hemat**: Pengiriman ekonomis untuk paket antarpulau dengan tarif lebih terjangkau.

---

### Format Nomor Resi Shopee Express
Nomor resi Shopee Express biasanya memiliki pola unik yang diawali dengan huruf:
- \`SPXID04...\`
- \`SPXID02...\`

Jika Anda memasukkan nomor resi berawalan \`SPXID\`, sistem kami akan langsung mendeteksi otomatis bahwa paket Anda dikirim menggunakan Shopee Express.

---

### Arti Status Pengiriman Shopee Express yang Sering Muncul:
1. **Paket telah diserahkan ke pihak jasa kirim**: Penjual sudah menyerahkan pesanan Anda ke drop point atau agen SPX.
2. **Paket telah tiba di Hub Sorting [Kota]**: Paket Anda sedang dalam proses penyortiran di gudang transit utama untuk diarahkan ke rute kota tujuan.
3. **Paket sedang dibawa oleh kurir menuju alamat Anda**: Paket sudah berada di DC (Distribution Center) terdekat dan kurir sedang dalam perjalanan ke rumah Anda.
4. **Paket telah terkirim (Delivered)**: Penerima telah menandatangani atau menerima paket.

---

### Tips Jika Paket SPX Tidak Bergerak (Stuck di Hub):
Jangan panik jika status paket tidak berubah selama 1x24 jam di Sorting Center. Hal ini wajar terjadi saat periode promo tanggal kembar (seperti 10.10 atau 11.11) karena volume paket melonjak drastis. Pantau nomor resi Anda secara berkala lewat fitur Lacak Resi.
    `,
    relatedTool: {
      title: 'Cek Resi Shopee Express Sekarang',
      description: 'Lacak posisi paket SPX Anda secara real-time dan simpan riwayat resi agar mudah dipantau kapan saja.',
      url: '/tools/tracking',
      icon: '📦',
      buttonText: 'Cek Resi Paket Sekarang 🔍',
    },
  },
  {
    slug: 'cara-memperkecil-ukuran-pdf-tugas-kuliah',
    title: 'Cara Memperkecil Ukuran PDF Tugas Kuliah & Skripsi Tanpa Mengurangi Kualitas',
    excerpt: 'Solusi mudah mengecilkan file dokumen PDF berukuran puluhan megabyte agar bisa dikirim via Google Classroom atau email.',
    category: 'Dokumen PDF',
    date: '28 Oktober 2026',
    readTime: '3 menit',
    author: 'Tim KompresKilat',
    content: `
### Kenapa File PDF Tugas Kuliah Bisa Berukuran Besar?
File PDF yang berisi banyak diagram, tangkapan layar, hasil scan jurnal, atau foto dokumentasi sering kali membengkak hingga puluhan megabyte (MB). Sementara itu, banyak sistem portal universitas membatasi upload tugas hanya **maksimal 5MB hingga 10MB**.

---

### Penyebab Utama PDF Membengkak:
1. **Resolusi Gambar Terlalu Tinggi**: Gambar mentah yang dimasukkan ke Word sebelum diekspor ke PDF tidak dikompres.
2. **Font Embedded yang Berlebih**: Dokumen menyematkan terlalu banyak font khusus yang memakan ruang file.
3. **Metadata Berlebih**: Riwayat revisi dan thumbnail halaman yang tersimpan di dalam struktur internal berkas PDF.

---

### Solusi Praktis:
Dengan menggunakan alat [Kompres PDF](/tools/pdf) di KompresKilat, struktur berkas PDF akan dioptimalkan, metadata yang tidak perlu dihapus, dan kualitas tampilan tetap terjaga sehingga nyaman dibaca oleh dosen penguji atau pengajar Anda.
    `,
    relatedTool: {
      title: 'Kompres Dokumen PDF Anda',
      description: 'Kecilkan ukuran PDF tugas atau skripsi Anda dalam hitungan detik tanpa instal aplikasi.',
      url: '/tools/pdf',
      icon: '📄',
      buttonText: 'Mulai Kompres PDF ⚡',
    },
  },
  {
    slug: 'arti-status-resi-jne-jnt-sicepat-lengkap',
    title: 'Daftar Istilah & Arti Status Resi JNE, J&T, dan SiCepat Terlengkap',
    excerpt: 'Pahami istilah seperti Manifested, On Transit, With Delivery Courier, hingga Bad Address agar tidak bingung saat belanja online.',
    category: 'Ekspedisi & Resi',
    date: '26 Oktober 2026',
    readTime: '5 menit',
    author: 'Tim KompresKilat',
    content: `
### Panduan Membaca Istilah Resi Pengiriman
Saat melacak barang belanjaan online, kurir sering kali menggunakan istilah logistik teknis dalam bahasa Inggris atau singkatan. Berikut adalah rangkuman istilah paling populer dari berbagai ekspedisi:

#### 1. Istilah pada JNE:
- **Manifested**: Paket sudah diterima di kantor cabang JNE awal dan telah dibuatkan dokumen pengiriman.
- **On Transit**: Paket sedang dalam perjalanan antar kota transit atau antar hub.
- **Received On Destination**: Paket telah tiba di kota tujuan akhir dan siap diteruskan ke agen setempat.
- **With Delivery Courier**: Paket dibawa oleh kurir menuju alamat rumah Anda.

#### 2. Istilah pada J&T Express:
- **Simpan (Drop Point)**: Paket masih berada di kantor cabang asal atau drop point terdekat.
- **Terkirim ke Pusat Sortir**: Paket dikirim ke hub sortir pusat untuk dipilah menurut rute.
- **Sedang Diantar (Delivering)**: Kurir sedang menuju lokasi Anda.

#### 3. Istilah pada SiCepat:
- **Terima Permintaan (Pick Up)**: Kurir menjemput barang dari penjual.
- **In Transit**: Sedang dalam proses distribusi ke kota tujuan.
- **Criss Cross**: Paket tertukar label atau barcode dengan paket lain (kurir akan melakukan koreksi otomatis).

---

### Gunakan Fitur Cek Resi Otomatis
Anda tidak perlu menghafal semua istilah di atas karena tool pelacak paket KompresKilat menyajikan status pengiriman dalam timeline visual yang mudah dipahami.
    `,
    relatedTool: {
      title: 'Lacak Paket Multi-Ekspedisi',
      description: 'Cek nomor resi JNE, J&T, SiCepat, Shopee Express, dan kurir lainnya dalam satu tempat.',
      url: '/tools/tracking',
      icon: '🚚',
      buttonText: 'Lacak Paket Sekarang 📦',
    },
  },
  {
    slug: 'cara-mengubah-file-pdf-ke-word-gratis-tanpa-rusak',
    title: 'Cara Mengubah File PDF ke Word (.docx) Gratis Tanpa Merusak Format',
    excerpt: 'Tips mudah mengonversi dokumen PDF kembali ke Microsoft Word agar bisa diedit ulang tanpa font berantakan.',
    category: 'Dokumen PDF',
    date: '24 Oktober 2026',
    readTime: '4 menit',
    author: 'Tim KompresKilat',
    content: `
### Kebutuhan Edit Dokumen PDF
Sering kali kita menerima formulir, surat pernyataan, atau draf kontrak kerja dalam format PDF, namun kita perlu mengedit beberapa paragraf teks di dalamnya. Karena file PDF pada dasarnya bukan format editor teks, cara terbaik adalah mengubahnya menjadi dokumen **Microsoft Word (.docx)**.

---

### Masalah Umum Konversi PDF ke Word:
1. **Tata Letak Berantakan**: Tabel atau kolom berpindah posisi.
2. **Font Berubah**: Teks berganti menjadi font default sistem karena jenis font asli tidak terpasang.
3. **PDF Hasil Scan**: Jika PDF berupa gambar foto hasil scan, dibutuhkan teknologi **OCR (Optical Character Recognition)** untuk mengekstrak teksnya.

---

Gunakan converter [PDF ke Word](/tools/pdf-to-word) untuk memudahkan proses pengeditan tugas kantor atau kuliah Anda.
    `,
    relatedTool: {
      title: 'Konversi PDF ke Word',
      description: 'Ubah dokumen PDF Anda menjadi format Word yang dapat diedit dengan mudah dan cepat.',
      url: '/tools/pdf-to-word',
      icon: '🔄',
      buttonText: 'Ubah PDF ke Word Sekarang 📄',
    },
  },
  {
    slug: 'cara-kompres-foto-swafoto-dan-ijazah-daftar-bumn',
    title: 'Panduan Ukuran Foto Swafoto, KTP, dan Ijazah Rekrutmen Bersama BUMN',
    excerpt: 'Aturan lengkap ukuran file scan ijazah, transkrip nilai, dan pas foto terbaru agar tidak gagal unggah di portal FHCI BUMN.',
    category: 'Gambar & Foto',
    date: '31 Oktober 2026',
    readTime: '4 menit',
    author: 'Tim KompresKilat',
    content: `
### Standar File Pendaftaran Rekrutmen BUMN
Setiap pembukaan seleksi Rekrutmen Bersama BUMN oleh Forum Human Capital Indonesia (FHCI), sistem menerapkan batasan ukuran berkas yang ketat. Biasanya dokumen dibagi menjadi dua kategori berkas:
- **Pas Foto & Swafoto**: Maksimal 500KB (Format JPG/JPEG).
- **Scan KTP**: Maksimal 500KB (Format JPG/JPEG/PNG).
- **Scan Ijazah & Transkrip**: Maksimal 1MB atau 2MB (Format PDF).

---

### Kesalahan yang Membuat Berkas Ditolak:
1. **Mengubah Ekstensi File Manual**: Mengubah nama file dari \`.png\` ke \`.jpg\` dengan me-rename file bukan cara yang benar dan akan membuat server pendaftaran membaca file sebagai korup.
2. **Foto Kurang Terang**: Pastikan pencahayaan cukup dan wajah tidak terpotong saat swafoto.
3. **Ukuran File Terlalu Kecil**: Jika file foto KTP di bawah 50KB, teks NIK akan pecah dan sistem verifikasi otomatis (OCR) panitia tidak dapat membaca data Anda.

---

### Solusi Cepat:
Gunakan tool [Kompres Gambar](/tools/image) KompresKilat dan pilih preset **🎯 &lt; 500 KB**. Sistem akan menyesuaikan resolusi gambar secara proporsional sehingga ukuran file berkurang drastis namun teks pada dokumen tetap tajam dan jelas.
    `,
    relatedTool: {
      title: 'Kompres Foto Syarat BUMN',
      description: 'Perkecil foto KTP dan pas foto ke bawah 500KB tanpa ribet dan tanpa aplikasi tambahan.',
      url: '/tools/image',
      icon: '📷',
      buttonText: 'Kompres Foto Sekarang ⚡',
    },
  },
  {
    slug: 'arti-status-paket-criss-cross-dan-solusinya',
    title: 'Kenapa Status Paket "Criss Cross" di Ekspedisi? Ini Arti dan Solusinya',
    excerpt: 'Penjelasan mengenai status resi criss-cross, paket tertukar di gudang sortir, dan estimasi waktu penyelesaiannya oleh pihak kurir.',
    category: 'Ekspedisi & Resi',
    date: '31 Oktober 2026',
    readTime: '3 menit',
    author: 'Tim KompresKilat',
    content: `
### Apa Itu Status "Criss Cross"?
Dalam dunia logistik ekspedisi (terutama SiCepat Ekspres dan J&T), istilah **Criss Cross** berarti paket Anda tertukar label resi atau barcode fisiknya dengan paket milik orang lain saat berada di hub penyortiran otomatis (*sorting machine*).

Kondisi ini biasanya terjadi karena:
- Dua paket melintas di ban berjalan (*conveyor belt*) secara bersamaan.
- Label resi pengirim terlipat atau buram sehingga sensor scanner salah memetakan barcode.

---

### Apakah Paket Anda Hilang?
**Jawabannya: TIDAK.** Paket Anda tidak hilang. Status *Criss Cross* justru merupakan catatan sistem bahwa petugas gudang telah mendeteksi adanya ketidakcocokan data fisik dengan tujuan resi.

Petugas sortir akan memisahkan paket tersebut ke area manual check (*Problem Handling Unit*), mencetak ulang label resi yang benar, dan mengembalikannya ke rute pengiriman yang semestinya.

---

### Berapa Lama Proses Penyelesaiannya?
Biasanya penanganan paket criss-cross memakan waktu tambahan **1x24 jam hingga 2x24 jam kerja**. Pantau nomor resi Anda secara berkala lewat fitur pelacak paket kami.
    `,
    relatedTool: {
      title: 'Lacak Status Resi Terbaru',
      description: 'Pantau pembaruan status paket Anda setelah proses investigasi hub logistik.',
      url: '/tools/tracking',
      icon: '🔍',
      buttonText: 'Cek Status Paket Sekarang 📦',
    },
  },
  {
    slug: 'cara-menggabungkan-banyak-file-ke-satu-zip-tanpa-aplikasi',
    title: 'Cara Menggabungkan Banyak File ke Satu Format ZIP Gratis di HP & Laptop',
    excerpt: 'Panduan praktis mengompres puluhan file dokumen dan foto menjadi satu arsip ZIP siap kirim via email atau WhatsApp.',
    category: 'Dokumen PDF',
    date: '30 Oktober 2026',
    readTime: '3 menit',
    author: 'Tim KompresKilat',
    content: `
### Mengapa Harus Menggunakan Format ZIP?
Mengirimkan 20 file foto atau dokumen PDF secara terpisah lewat email atau WhatsApp sangat melelahkan dan sering kali membuat urutan file berantakan. Dengan format **ZIP**, seluruh file dikemas menjadi satu kesatuan berkas tunggal.

---

### Keuntungan Format ZIP:
1. **Satu File untuk Semua**: Pengguna cukup mengunduh satu file tunggal.
2. **Ukuran Berkas Lebih Ramping**: Format ZIP memadatkan teks dan struktur file sehingga hemat kuota transfer.
3. **Keamanan Struktur Folder**: Susunan nama berkas dan tanggal pembuatan tetap terjaga.

---

Di KompresKilat, Anda dapat memilih puluhan berkas sekaligus melalui menu [Arsip ZIP](/tools/zip). Berkas akan dipaketkan secara instan langsung di browser Anda.
    `,
    relatedTool: {
      title: 'Buat Arsip ZIP Instan',
      description: 'Pilih semua file Anda dan satukan ke dalam satu arsip .zip siap kirim tanpa aplikasi.',
      url: '/tools/zip',
      icon: '🗜️',
      buttonText: 'Buka Pembuat ZIP 🚀',
    },
  },
  {
    slug: 'perbedaan-format-jpg-png-webp-dan-kapan-harus-dipakai',
    title: 'Perbedaan Format JPG, PNG, dan WebP: Mana yang Paling Tepat untuk Dokumen?',
    excerpt: 'Ketahui kelebihan dan kekurangan tiap format gambar agar file Anda tajam namun tetap berukuran kecil.',
    category: 'Gambar & Foto',
    date: '28 Oktober 2026',
    readTime: '4 menit',
    author: 'Tim KompresKilat',
    content: `
### Memilih Format Gambar yang Tepat
Setiap format file gambar memiliki karakteristik algoritma kompresi yang berbeda-beda:

#### 1. JPEG / JPG:
- **Karakteristik**: Menggunakan kompresi *Lossy*. Sangat bagus untuk foto manusia, pemandangan, dan foto berwarna kompleks.
- **Kelebihan**: Kompatibel di 100% sistem portal instansi pemerintah dan website lama.
- **Kekurangan**: Tidak mendukung transparansi (latar belakang bening).

#### 2. PNG:
- **Karakteristik**: Menggunakan kompresi *Lossless*.
- **Kelebihan**: Teks dan garis sangat tajam, mendukung latar belakang transparan (cocok untuk tanda tangan digital dan stempel).
- **Kekurangan**: Ukuran file bisa 3x hingga 5x lebih besar dari JPG.

#### 3. WebP:
- **Karakteristik**: Format modern yang dikembangkan oleh Google.
- **Kelebihan**: Ukuran file **25% - 35% lebih kecil** dari JPEG dengan kualitas visual yang sama persis.
- **Rekomendasi**: Sangat ideal untuk website, blog, dan toko online agar waktu loading super cepat.
    `,
    relatedTool: {
      title: 'Konversi & Kompres Format Gambar',
      description: 'Ubah gambar Anda ke JPG, PNG, atau WebP sesuai target ukuran yang Anda butuhkan.',
      url: '/tools/image',
      icon: '🖼️',
      buttonText: 'Coba Konversi Gambar ⚡',
    },
  },
];

export function getAllPosts(): BlogPost[] {
  return BLOG_POSTS;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getCategories(): string[] {
  return Array.from(new Set(BLOG_POSTS.map((p) => p.category)));
}

