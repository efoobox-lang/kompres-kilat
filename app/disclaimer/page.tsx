import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Penafian Hukum (Disclaimer) - KompresKilat',
  description: 'Pernyataan penafian hukum, batasan tanggung jawab, kebijakan periklanan, dan ketentuan penggunaan utilitas di KompresKilat.',
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors">
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="text-[10px] sm:text-xs bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Legal &amp; Transparansi
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Penafian Hukum (Disclaimer)
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Pembaruan Terakhir: 9 November 2026</p>
          </div>

          <p>
            Selamat datang di <b>KompresKilat</b> (dapat diakses melalui <Link href="/" className="text-indigo-600 dark:text-indigo-400 font-semibold underline">kompreskilat.site</Link>). Pernyataan Penafian (*Disclaimer*) ini mengatur batasan tanggung jawab hukum, sifat penyediaan layanan, dan ketentuan periklanan pada seluruh alat utilitas, artikel panduan, dan fitur yang kami sediakan.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-2">
            1. Sifat Layanan dan Penafian Umum (*As-Is Basis*)
          </h2>
          <p>
            Seluruh layanan utilitas digital, perangkat lunak berbasis peramban, dan konten informasi di KompresKilat disediakan atas dasar <b>&quot;sebagaimana adanya&quot; (*as-is*)</b> dan <b>&quot;sebagaimana tersedia&quot; (*as-available*)</b> tanpa jaminan tersurat maupun tersirat dalam bentuk apa pun. Kami berusaha semaksimal mungkin memastikan akurasi alat dan kelancaran sistem, namun tidak menjamin bahwa layanan akan bebas dari interupsi, bebas kekeliruan teknis, atau kompatibel sempurna dengan seluruh konfigurasi perangkat keras dan peramban pengguna.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-2">
            2. Pemrosesan Berkas di Sisi Klien (*Client-Side Zero-Knowledge Privacy*)
          </h2>
          <p>
            KompresKilat menerapkan filosofi <b>Zero-Knowledge Privacy</b>. Seluruh proses manipulasi dokumen (seperti kompresi gambar KTP, optimasi PDF, penggabungan berkas, pembuatan struk/nota, dan konversi format) diproses secara lokal langsung di dalam memori peramban (*web browser*) perangkat Anda menggunakan teknologi HTML5 Canvas, WebAssembly, dan Web Workers.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Berkas pribadi, foto identitas resmi, atau naskah rahasia Anda <b>tidak pernah diunggah, disimpan, atau ditransmisikan</b> ke server pusat kami maupun pihak ketiga.</li>
            <li>Pengguna memegang tanggung jawab mutlak atas konten, hak cipta, dan keabsahan berkas yang diproses melalui situs ini.</li>
          </ul>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-2">
            3. Kewajiban Cadangan Berkas Asli (*Backup Obligation*)
          </h2>
          <p>
            Meskipun algoritma kompresi dan manipulasi kami dirancang untuk mempertahankan kualitas visual dokumen secara optimal, proses kompresi atau konversi berkas secara inheren berpotensi mengubah metadata atau resolusi gambar. 
          </p>
          <p>
            KompresKilat <b>tidak bertanggung jawab atas kehilangan berkas, kerusakan data, atau kegagalan pemrosesan dokumen asli</b>. Pengguna diwajibkan untuk selalu menyimpan salinan cadangan (*backup*) berkas asli di perangkat masing-masing sebelum melakukan tindakan pemrosesan digital.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-2">
            4. Data Pelacakan Paket dan Integrasi Pihak Ketiga
          </h2>
          <p>
            Fitur pelacakan resi paket multi-ekspedisi (seperti Shopee Xpress, JNE, J&amp;T, SiCepat, Anteraja, Pos Indonesia, dll.) bersumber dari *Application Programming Interface* (API) publik dan sistem pihak ketiga penyedia logistik resmi.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>KompresKilat adalah portal utilitas independen dan <b>tidak berafiliasi, didukung, atau terafiliasi secara resmi</b> dengan badan usaha ekspedisi maupun lokapasar (*marketplace*) yang disebutkan.</li>
            <li>Segala bentuk keterlambatan pengantaran fisik, kerusakan barang belanjaan, atau ketidaksinkronan riwayat status perjalanan paket merupakan tanggung jawab penuh pihak ekspedisi yang bersangkutan.</li>
          </ul>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-2">
            5. Penafian Kalkulator Finansial, Pajak &amp; Bisnis
          </h2>
          <p>
            Alat kalkulator (seperti Simulasi PPh 21 TER, PPh 23, PPh 4(2), Perhitungan BEP/HPP UMKM, Zakat Mal, dan Konversi Kurs Valuta Asing) dirancang semata-mata sebagai <b>alat simulasi dan estimasi edukatif</b>. Hasil kalkulasi tidak boleh dianggap sebagai nasihat perpajakan formal, audit akuntansi berlisensi, atau konsultasi hukum finansial yang mengikat. Untuk pelaporan SPT resmi atau transaksi bernilai besar, konsultasikan dengan Konsultan Pajak Resmi atau Kantor Pelayanan Pajak (KPP) terdaftar.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-2">
            6. Kebijakan Periklanan Google AdSense &amp; Tautan Eksternal
          </h2>
          <p>
            Situs ini menampilkan iklan yang disajikan oleh <b>Google AdSense</b> dan mitra jaringan iklan resmi pihak ketiga. Penayangan iklan ini memungkinkan kami menyediakan seluruh alat utilitas secara gratis tanpa memungut biaya langganan dari pengguna.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pihak ketiga termasuk Google dapat menggunakan kuki (*cookies*) untuk menayangkan iklan relevan berdasarkan riwayat kunjungan pengguna. Pelajari selengkapnya di <Link href="/privacy-policy" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">Kebijakan Privasi</Link> kami.</li>
            <li>Tautan keluar (*hyperlinks*) ke situs eksternal disediakan semata-mata untuk kemudahan referensi. Kami tidak memiliki kendali atas materi, kebijakan, atau keandalan situs pihak ketiga tersebut.</li>
          </ul>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-2">
            7. Kontak &amp; Saluran Bantuan
          </h2>
          <p>
            Jika Anda memiliki pertanyaan, permohonan klarifikasi hukum, atau ingin melaporkan kendala seputar isi penafian ini, Anda dapat menghubungi kami melalui:
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
            <p><b>Email Dukungan:</b> <a href="mailto:info.kompreskilat@gmail.com" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">info.kompreskilat@gmail.com</a></p>
            <p><b>Halaman Kontak:</b> <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">Kirim Pesan Resmi</Link></p>
            <p><b>Jam Operasional:</b> Senin - Jumat (09:00 - 18:00 WIB)</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
