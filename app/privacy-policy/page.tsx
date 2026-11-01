import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi (Privacy Policy) - KompresKilat',
  description: 'Kebijakan privasi KompresKilat mengenai penggunaan data, cookies pihak ketiga, iklan Google AdSense, dan keamanan file Anda.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="bg-white p-6 sm:p-10 md:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm leading-relaxed text-slate-700">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
            Kebijakan Privasi (Privacy Policy)
          </h1>
          <p className="text-xs text-slate-400">Pembaruan Terakhir: 31 Oktober 2026</p>

          <p>
            Selamat datang di <b>KompresKilat</b> (dapat diakses melalui situs web ini). Privasi pengunjung adalah salah satu prioritas utama kami. Dokumen Kebijakan Privasi ini menjelaskan jenis informasi apa saja yang dikumpulkan dan dicatat oleh KompresKilat serta bagaimana kami menggunakannya.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">1. Keamanan File dan Dokumen Anda (Client-Side Privacy)</h2>
          <p>
            Alat kompresi gambar, optimasi PDF, dan pembuatan arsip ZIP di KompresKilat dirancang menggunakan teknologi <b>Client-Side Processing (WebAssembly &amp; Browser API)</b>. Artinya:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>File gambar (KTP, ijazah, foto pribadi) dan dokumen Anda diproses langsung di memori perangkat/browser Anda.</li>
            <li>File Anda <b>TIDAK PERNAH dikirim, diunggah, atau disimpan ke server database kami</b>.</li>
            <li>Saat Anda menutup tab browser, seluruh data sementara otomatis terhapus dari memori perangkat Anda.</li>
          </ul>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">2. Data Pelacakan Resi Paket (Tracking AWB)</h2>
          <p>
            Saat Anda menggunakan layanan Cek Resi, nomor resi dan kode kurir dikirimkan ke server kami untuk diteruskan ke penyedia API logistik terkait guna mengambil status pengiriman paket. Nomor resi yang Anda cek dapat disimpan di <em>LocalStorage</em> browser Anda sendiri untuk kenyamanan pelacakan ulang dan dapat Anda hapus kapan saja.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">3. File Log (Log Files)</h2>
          <p>
            KompresKilat mengikuti prosedur standar menggunakan file log. File ini mencatat pengunjung saat mereka mengunjungi situs web. Informasi yang dikumpulkan oleh file log meliputi alamat protokol internet (IP address), jenis browser, Penyedia Layanan Internet (ISP), tanggal dan cap waktu, serta halaman rujukan/keluar. Informasi ini tidak terkait dengan data pribadi apapun dan digunakan hanya untuk menganalisis tren dan mengelola situs.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">4. Cookie dan Web Beacon (Google AdSense &amp; Pihak Ketiga)</h2>
          <p>
            Seperti kebanyakan situs web lainnya, KompresKilat menggunakan &apos;cookie&apos;. Cookie digunakan untuk menyimpan preferensi pengunjung dan mengoptimalkan pengalaman pengguna.
          </p>
          <p>
            Google adalah salah satu vendor pihak ketiga di situs kami. Google juga menggunakan cookie, yang dikenal sebagai <b>cookie DART</b>, untuk menayangkan iklan kepada pengunjung situs kami berdasarkan kunjungan mereka ke situs kami dan situs lain di internet. Pengunjung dapat memilih untuk menolak penggunaan cookie DART dengan mengunjungi Kebijakan Privasi jaringan iklan dan konten Google di URL berikut: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">https://policies.google.com/technologies/ads</a>.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">5. Kebijakan Privasi Pihak Ketiga</h2>
          <p>
            Kebijakan Privasi KompresKilat tidak berlaku untuk pengiklan atau situs web lain. Karena itu, kami menyarankan Anda untuk berkonsultasi dengan Kebijakan Privasi masing-masing dari server iklan pihak ketiga ini untuk informasi yang lebih terperinci mengenai praktik mereka serta petunjuk tentang cara menyisih dari opsi tertentu.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">6. Persetujuan Anda</h2>
          <p>
            Dengan menggunakan situs web kami, Anda dengan ini menyetujui Kebijakan Privasi kami dan menyetujui syarat dan ketentuannya.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">7. Hubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan lebih lanjut atau memerlukan informasi lebih banyak tentang Kebijakan Privasi kami, jangan ragu untuk menghubungi kami melalui email resmi <b><a href="mailto:info.kompreskilat@gmail.com" className="text-indigo-600 underline">info.kompreskilat@gmail.com</a></b> atau melalui halaman <Link href="/contact" className="text-indigo-600 underline font-semibold">Kontak Kami</Link>.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
