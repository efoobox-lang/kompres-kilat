export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Tips SEO' | 'Dokumen PDF' | 'Ekspedisi & Resi' | 'Gambar & Foto' | 'Spreadsheet & Excel';
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
  {
    slug: 'aturan-warna-background-pas-foto-cpns-bumn-merah-biru',
    title: 'Aturan Warna Background Pas Foto CPNS & BUMN: Kapan Pakai Merah dan Biru?',
    excerpt: 'Penjelasan resmi aturan warna latar belakang pas foto ijazah, KTP, dan seleksi instansi pemerintah berdasarkan tahun kelahiran.',
    category: 'Gambar & Foto',
    date: '31 Oktober 2026',
    readTime: '3 menit',
    author: 'Tim KompresKilat',
    content: `
### Aturan Resmi Warna Background Pas Foto di Indonesia
Salah satu penyebab berkas administrasi pelamar CPNS, PPPK, atau Rekrutmen Bersama BUMN dinyatakan Tidak Memenuhi Syarat (TMS) adalah **salah memilih warna latar belakang pas foto**.

Berikut adalah pedoman standar yang ditetapkan oleh Badan Kepegawaian Negara (BKN) dan Kementerian Pendayagunaan Aparatur Negara:

---

### 1. Kapan Harus Menggunakan Background Merah?
- **Tahun Kelahiran GANJIL**: Pelamar yang lahir pada tahun ganjil (contoh: 1993, 1995, 1997, 1999, 2001, 2003) diwajibkan menggunakan pas foto dengan latar belakang warna **MERAH**.
- Kode Warna Standar: \`#DC2626\` atau \`#D92525\`.

### 2. Kapan Harus Menggunakan Background Biru?
- **Tahun Kelahiran GENAP**: Pelamar yang lahir pada tahun genap (contoh: 1994, 1996, 1998, 2000, 2002, 2004) diwajibkan menggunakan pas foto dengan latar belakang warna **BIRU**.
- Kode Warna Standar: \`#2563EB\` atau \`#1D4ED8\`.

---

### Tips Pas Foto yang Lolos Verifikasi Sistem:
1. **Pakaian Formal**: Gunakan kemeja putih polos berkerah. Untuk pelamar wanita berhijab, gunakan hijab hitam atau gelap polos.
2. **Posisi Wajah Simetris**: Pandangan mata lurus ke depan, telinga terlihat (bagi yang tidak berhijab), dan tidak memakai kacamata hitam.
3. **Ukuran Berkas**: Pastikan ukuran file berkisar antara **100KB hingga 300KB** dalam format JPG atau JPEG.

Gunakan tool [Ganti Background Foto](/tools/remove-bg) kami untuk mengubah warna latar belakang pas foto Anda secara instan tanpa perlu ke studio foto.
    `,
    relatedTool: {
      title: 'Ubah Warna Pas Foto Anda Sekarang',
      description: 'Ganti latar belakang pas foto ke Merah atau Biru resmi dalam 5 detik tanpa Photoshop.',
      url: '/tools/remove-bg',
      icon: '🎨',
      buttonText: 'Ganti Warna Pas Foto ⚡',
    },
  },
  {
    slug: 'cara-ganti-background-pas-foto-online-gratis-tanpa-photoshop',
    title: 'Cara Ganti Background Pas Foto Online Gratis Tanpa Aplikasi Photoshop',
    excerpt: 'Tutorial mudah mengganti latar belakang foto selfie biasa menjadi pas foto resmi merah atau biru langsung lewat HP.',
    category: 'Gambar & Foto',
    date: '31 Oktober 2026',
    readTime: '4 menit',
    author: 'Tim KompresKilat',
    content: `
### Tidak Punya Laptop atau Mahir Photoshop?
Dulu, untuk mengubah latar belakang pas foto dari putih ke merah atau biru, kita harus mendatangi studio cetak foto atau menguasai software rumit seperti Adobe Photoshop.

Kini, dengan teknologi peramban modern di KompresKilat, Anda bisa melakukannya langsung dari smartphone Anda dalam hitungan detik.

---

### Langkah Mudah Mengganti Background Foto:
1. **Siapkan Foto Potret**: Ambil foto dengan posisi tegak formal menghadap ke depan. Sebaiknya gunakan latar belakang dinding polos agar pemisahan warna rapi.
2. **Buka Tool Ganti Background**: Akses halaman [Ganti Background Pas Foto](/tools/remove-bg).
3. **Pilih Preset Warna**: Klik tombol **Merah CPNS (Ganjil)** atau **Biru CPNS (Genap)**.
4. **Atur Slider Toleransi**: Jika masih ada sedikit sisa bayangan di sekitar bahu atau rambut, geser slider sensitivitas ke kanan.
5. **Download Hasil**: Klik tombol **Download Pas Foto Baru** dan berkas JPG siap digunakan untuk pendaftaran!
    `,
    relatedTool: {
      title: 'Coba Ganti Background Foto',
      description: 'Pilih warna merah, biru, atau hapus latar belakang menjadi transparan secara otomatis.',
      url: '/tools/remove-bg',
      icon: '📷',
      buttonText: 'Mulai Ganti Background 🚀',
    },
  },
  {
    slug: 'cara-menghapus-watermark-dan-objek-di-foto-online',
    title: 'Cara Menghapus Objek Mengganggu dan Watermark di Foto Tanpa Merusak Gambar',
    excerpt: 'Trik membersihkan teks, cap tanggal, watermark, atau orang lewat pada foto menggunakan kuas cerdas Magic Eraser.',
    category: 'Gambar & Foto',
    date: '31 Oktober 2026',
    readTime: '3 menit',
    author: 'Tim KompresKilat',
    content: `
### Foto Bagus Tapi Ada Objek Mengganggu?
Sering kali saat kita mengambil foto kenangan atau memotret dokumen, terdapat objek yang tidak diinginkan seperti:
- Orang lain yang lewat di latar belakang (*photobomb*).
- Cap tanggal dan waktu kamera ponsel di pojok gambar.
- Tanda air (*watermark*) atau logo aplikasi.
- Noda atau coretan pena pada hasil scan dokumen.

---

### Cara Kerja Magic Eraser di Browser:
Dengan memanfaatkan algoritma **Inpainting Digital**, sistem akan:
1. Mendeteksi area yang Anda warnai dengan kuas merah.
2. Menghapus piksel di dalam area tersebut.
3. Mengambil sampel pola warna dan tekstur dari lingkungan sekitar objek.
4. Membaurkan (*blending*) tekstur baru sehingga area yang dihapus tampak alami seperti foto aslinya.

Coba alat [Hapus Objek di Foto](/tools/object-eraser) kami sekarang secara gratis.
    `,
    relatedTool: {
      title: 'Hapus Objek & Watermark',
      description: 'Cukup warnai bagian yang ingin dihapus dengan kuas dan biarkan sistem membersihkannya.',
      url: '/tools/object-eraser',
      icon: '🪄',
      buttonText: 'Gunakan Magic Eraser 🪄',
    },
  },
  {
    slug: 'cara-ubah-pdf-hasil-scan-ke-word-bisa-diedit-ocr',
    title: 'Cara Mengubah PDF Hasil Scan Foto Menjadi Word yang Bisa Diedit dengan OCR',
    excerpt: 'Solusi mengubah dokumen PDF yang teksnya tidak bisa diseleksi atau hasil scan menjadi file Microsoft Word yang dapat diedit.',
    category: 'Dokumen PDF',
    date: '31 Oktober 2026',
    readTime: '4 menit',
    author: 'Tim KompresKilat',
    content: `
### Perbedaan PDF Teks vs PDF Hasil Scan
Banyak pengguna bingung saat mencoba meng-copy teks dari file PDF:
- **PDF Digital / Asli**: Dokumen yang dibuat langsung dari Microsoft Word atau Google Docs. Teksnya dapat diblok dan disalin dengan mudah.
- **PDF Scan / Gambar**: Dokumen yang berasal dari hasil foto kamera HP atau mesin fotokopi/scanner. Seluruh halaman sebenarnya adalah gambar foto, sehingga huruf-huruf di dalamnya tidak dikenali sebagai karakter teks oleh komputer.

---

### Apa Itu Teknologi OCR (Optical Character Recognition)?
OCR adalah teknologi kecerdasan buatan (*AI Recognition*) yang bertugas memindai bentuk kurva, garis, dan titik pada gambar, lalu mencocokkannya dengan bentuk alfabet huruf (A-Z, angka 0-9, dan tanda baca).

Dengan menggunakan fitur [PDF ke Word dengan OCR](/tools/pdf-to-word) di KompresKilat:
1. Mesin OCR Tesseract akan memindai halaman PDF atau foto berkas Anda baris demi baris.
2. Karakter yang terdeteksi disalin ke dalam struktur berkas **Microsoft Word (.docx)** asli.
3. Anda dapat mengedit kembali nama, tanggal, maupun angka laporan di Word tanpa perlu mengetik ulang dari awal!
    `,
    relatedTool: {
      title: 'Konversi PDF Scan ke Word',
      description: 'Gunakan teknologi OCR canggih untuk mengubah dokumen hasil scan ke Word siap edit.',
      url: '/tools/pdf-to-word',
      icon: '🔄',
      buttonText: 'Konversi dengan OCR Sekarang 📄',
    },
  },
  {
    slug: 'cara-mengubah-file-excel-ke-csv-agar-tidak-berantakan',
    title: 'Cara Mengubah File Excel ke CSV Pemisah Titik Koma Tanpa Berantakan',
    excerpt: 'Panduan mengekspor spreadsheet XLSX ke CSV dengan pemisah yang tepat agar angka ribuan dan teks Indonesia tidak menyatu.',
    category: 'Spreadsheet & Excel',
    date: '31 Oktober 2026',
    readTime: '3 menit',
    author: 'Tim KompresKilat',
    content: `
### Masalah Utama Saat Konversi Excel ke CSV
Salah satu keluhan paling umum bagi staf admin, akuntan, dan pengelola toko online saat mengubah file Excel ke CSV adalah: **"Kenapa saat dibuka semua datanya menumpuk di satu kolom pertama?"**

Penyebab utamanya adalah **perbedaan standar pemisah (*delimiter*)**:
- **Format Windows Indonesia / Eropa**: Menggunakan tanda **Titik Koma (;)** sebagai pemisah kolom, karena tanda Koma (,) digunakan untuk angka desimal (contoh: Rp 50.000,50).
- **Format Windows Internasional (US)**: Menggunakan tanda **Koma (,)** sebagai pemisah kolom.

---

### Solusi Praktis di KompresKilat:
Di alat [Excel ke CSV](/tools/excel-to-csv) kami:
1. Anda dapat memilih pemisah kolom sesuai kebutuhan: **Koma (,)** untuk upload ke database server, atau **Titik Koma (;)** untuk spreadsheet lokal.
2. Berkas CSV otomatis dibekali enkripsi **UTF-8 with BOM**, sehingga saat diklik dua kali di komputer Windows, Microsoft Excel akan otomatis memecah kolomnya dengan rapi.
    `,
    relatedTool: {
      title: 'Konversi Excel ke CSV',
      description: 'Ekspor berkas XLSX atau XLS ke CSV dengan pilihan tanda koma atau titik koma.',
      url: '/tools/excel-to-csv',
      icon: '📊',
      buttonText: 'Ubah Excel ke CSV Sekarang ⚡',
    },
  },
  {
    slug: 'cara-buka-file-csv-di-excel-rapi-per-kolom',
    title: 'Cara Membuka File CSV di Excel Agar Rapi Terpisah Kolom Otomatis',
    excerpt: 'Cara mudah mengonversi file CSV data ekspor toko online atau database menjadi file Microsoft Excel XLSX yang rapi.',
    category: 'Spreadsheet & Excel',
    date: '31 Oktober 2026',
    readTime: '3 menit',
    author: 'Tim KompresKilat',
    content: `
### Kenapa File CSV Data Toko Online Berantakan?
Saat kita mengunduh laporan pesanan atau data produk dari marketplace (Shopee, Tokopedia, TikTok Shop) atau sistem perbankan, format yang diberikan biasanya berupa file **.csv**.

Sering kali ketika dibuka di Excel, semua teks nama produk, harga, dan nomor resi tergabung menjadi satu baris panjang yang dipisahkan tanda koma sehingga sangat sulit dibaca.

---

### Cara Mengatasinya dalam 5 Detik:
Alih-alih repot mengatur *Text to Columns* di Excel:
1. Unggah berkas CSV Anda ke halaman [CSV ke Excel](/tools/csv-to-excel).
2. Sistem akan memetakan kolom secara otomatis.
3. Klik tombol **Download File Excel (.xlsx)**.
4. Buka berkas unduhan di Microsoft Excel, dan seluruh data Anda sudah tertata rapi di dalam sel tabel masing-masing!
    `,
    relatedTool: {
      title: 'Ubah CSV ke Excel XLSX',
      description: 'Rapikan file CSV Anda menjadi spreadsheet Microsoft Excel resmi tanpa rumus rumit.',
      url: '/tools/csv-to-excel',
      icon: '📑',
      buttonText: 'Konversi CSV ke Excel 📊',
    },
  },
  {
    slug: 'cara-komplain-paket-shopee-express-spx-tidak-bergerak',
    title: 'Paket Shopee Express Tidak Bergerak di Hub Transit? Ini Penyebab & Solusinya',
    excerpt: 'Langkah cepat menghubungi customer service dan arti resi SPX yang tertahan lebih dari 2 hari di DC atau Hub Sortir.',
    category: 'Ekspedisi & Resi',
    date: '31 Oktober 2026',
    readTime: '4 menit',
    author: 'Tim KompresKilat',
    content: `
### Resi SPX Anda Tidak Berubah Status Selama Berhari-hari?
Banyak pembeli cemas saat melacak resi Shopee Express (SPX) dan mendapati paket mereka berstatus **"Paket telah tiba di Hub Transit [Kota]"** dan tidak berpindah selama lebih dari 48 jam.

---

### Alasan Paket Tertahan di Hub Transit:
1. **Penyortiran Masif Tanggal Kembar (Mega Sale)**: Pada periode promo seperti 9.9, 11.11, atau Harbolnas, gudang sortir mengalami lonjakan volume barang hingga 5x lipat.
2. **Keterlambatan Armada Antarpulau**: Untuk pengiriman via jalur laut atau udara, faktor cuaca buruk dapat menunda keberangkatan kapal kargo logistik.
3. **Salah Masuk Jalur Sortir (Misroute)**: Paket sempat terbawa ke hub regional lain dan sedang dalam proses pengembalian rute.

---

### Tindakan yang Harus Dilakukan:
1. **Cek Nomor Resi Terkini**: Gunakan fitur [Lacak Paket](/tools/tracking) kami untuk memastikan waktu update terakhir dari kurir.
2. **Gunakan Live Chat Shopee**: Buka aplikasi Shopee ➔ menu *Saya* ➔ *Chat dengan Shopee* ➔ ketik "Live Agent" untuk dihubungkan dengan staf bantuan resmi.
3. **Minta Penjual Membantu Follow-up**: Penjual memiliki jalur tiket eskalasi prioritas ke tim logistik Shopee Express.
    `,
    relatedTool: {
      title: 'Lacak Resi Shopee Express',
      description: 'Pantau posisi terkini nomor resi SPX Anda dengan riwayat perjalanan lengkap.',
      url: '/tools/tracking',
      icon: '📦',
      buttonText: 'Lacak Paket Sekarang 🔍',
    },
  },
  {
    slug: 'cara-membuat-slide-presentasi-otomatis-ai-powerpoint',
    title: 'Cara Membuat Slide Presentasi Otomatis dengan AI Siap Download PPTX',
    excerpt: 'Panduan menyusun materi presentasi rapat kantor, pitch deck bisnis, atau tugas kuliah hanya dari satu kalimat topik.',
    category: 'Tips SEO',
    date: '31 Oktober 2026',
    readTime: '3 menit',
    author: 'Tim KompresKilat',
    content: `
### Buntu Saat Harus Membuat Slide Presentasi Mendadak?
Membuat slide presentasi PowerPoint sering kali memakan waktu berjam-jam: mulai dari memikirkan struktur alur bab, merumuskan poin ringkas, hingga menyiapkan catatan pembicara (*speaker notes*).

Kini dengan [AI Presentation Generator](/ai-presentation-maker) di KompresKilat, Anda cukup mengetikkan topik bahasan, dan kecerdasan buatan akan menyusun seluruh struktur slide dalam sekejap.

---

### Keunggulan Format Berkas Asli .PPTX:
- **Bisa Diedit Bebas**: File unduhan berupa ekstensi *.pptx* asli, bukan sekadar tangkapan layar gambar atau PDF kaku.
- **Kompatibel Lintas Platform**: Dapat dibuka di Microsoft PowerPoint, Google Slides, LibreOffice, maupun WPS Office di HP dan laptop.
- **Dilengkapi Catatan Pembicara**: Membantu Anda percaya diri saat berbicara di depan audiens tanpa harus menghafal seluruh isi materi.
    `,
    relatedTool: {
      title: 'Coba AI Presentation Generator',
      description: 'Ketik topik Anda dan unduh berkas PowerPoint (.pptx) lengkap dalam 5 detik.',
      url: '/ai-presentation-maker',
      icon: '📊',
      buttonText: 'Buat Slide AI Sekarang ⚡',
    },
  },
  {
    slug: 'cara-memperjelas-foto-buram-online-super-resolution',
    title: 'Cara Memperjelas Foto Buram & Pecah Menjadi HD dengan AI Super Resolution',
    excerpt: 'Teknik meningkatkan resolusi foto pas foto KTP atau gambar lama hingga 4x Ultra HD tanpa pecah secara instan.',
    category: 'Gambar & Foto',
    date: '31 Oktober 2026',
    readTime: '4 menit',
    author: 'Tim KompresKilat',
    content: `
### Mengapa Foto Terlihat Pecah dan Berbintik?
Saat foto beresolusi kecil diperbesar secara manual di aplikasi galeri, piksel gambar akan meregang dan menghasilkan efek kotak-kotak (*pixelated*) atau buram (*blur*).

Teknologi **AI Super Resolution & Unsharp Masking** di KompresKilat bekerja secara cerdas:
1. **Rekonstruksi Sub-Piksel**: Menghitung gradien warna di antara piksel yang renggang agar tekstur tetap halus.
2. **Penajaman Garis Tepi**: Mempertegas kontur mata, bibir, pakaian, dan huruf tulisan pada dokumen KTP atau ijazah.
3. **Peningkatan Resolusi Hingga 4x**: Mengubah foto kecil 500px menjadi gambar tajam 2000px siap cetak.

Coba langsung fitur [AI Photo Enhancer](/ai-image-tools) kami secara gratis langsung di browser Anda.
    `,
    relatedTool: {
      title: 'Perjelas Foto Anda Sekarang',
      description: 'Pertajam foto buram dan naikkan resolusi hingga 4x Ultra HD gratis.',
      url: '/ai-image-tools',
      icon: '✨',
      buttonText: 'Tingkatkan Kualitas Foto 📸',
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

