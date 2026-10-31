import Link from 'next/link';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan Layanan (Terms of Service) - KompresKilat',
  description: 'Syarat dan ketentuan penggunaan layanan kompresi file dan pelacakan resi di KompresKilat.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-2xl font-black text-indigo-600">⚡ KompresKilat</Link>
        </div>
        <nav className="space-x-6 text-sm font-medium">
          <Link href="/" className="text-slate-600 hover:text-indigo-600">Beranda</Link>
          <Link href="/blog" className="text-slate-600 hover:text-indigo-600">Blog & Panduan</Link>
        </nav>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-sm leading-relaxed text-slate-700">
          <h1 className="text-3xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
            Syarat & Ketentuan Layanan (Terms of Service)
          </h1>
          <p className="text-xs text-slate-400">Pembaruan Terakhir: 31 Oktober 2026</p>

          <p>
            Selamat datang di <b>KompresKilat</b>. Dengan mengakses dan menggunakan situs web ini, Anda menyatakan setuju untuk terikat oleh Syarat dan Ketentuan berikut. Jika Anda tidak menyetujui salah satu bagian dari ketentuan ini, mohon untuk tidak menggunakan layanan kami.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">1. Penggunaan Layanan</h2>
          <p>
            KompresKilat menyediakan alat bantu utilitas berbasis peramban (browser) untuk keperluan kompresi file, manipulasi dokumen, dan pengecekan nomor resi pengiriman. Anda setuju untuk menggunakan layanan ini hanya untuk tujuan yang sah menurut hukum Republik Indonesia.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Anda dilarang menggunakan alat ini untuk memproses materi yang melanggar hak cipta, pornografi, atau konten yang melanggar hukum.</li>
            <li>Anda dilarang melakukan tindakan yang dapat mengganggu kestabilan atau membebani infrastruktur server kami secara tidak wajar (seperti serangan DDoS atau scraping otomatis yang berlebihan).</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 pt-2">2. Kepemilikan dan Hak File</h2>
          <p>
            Anda tetap memiliki hak kepemilikan penuh atas setiap berkas, gambar, dan dokumen yang Anda proses menggunakan KompresKilat. Kami tidak mengklaim hak kepemilikan apapun atas materi yang Anda kompres atau manipulasi di browser Anda.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">3. Batasan Tanggung Jawab &amp; Penafian (Disclaimer)</h2>
          <p>
            Layanan KompresKilat disediakan atas dasar "sebagaimana adanya" (*as-is*) tanpa jaminan dalam bentuk apapun, baik tersurat maupun tersirat. 
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Kami tidak bertanggung jawab atas kerugian data, kerusakan berkas, atau hilangnya kesempatan kerja/akademis yang timbul dari penggunaan alat ini. Pengguna disarankan untuk selalu menyimpan salinan (*backup*) file asli sebelum melakukan kompresi.</li>
            <li>Data pelacakan paket bersumber dari sistem pihak ketiga ekspedisi (Shopee Express, JNE, J&amp;T, dll.). KompresKilat tidak bertanggung jawab atas keterlambatan pengiriman paket fisik, kerusakan barang belanjaan, atau ketidakakuratan status dari server kurir ekspedisi.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 pt-2">4. Perubahan Layanan dan Ketentuan</h2>
          <p>
            KompresKilat berhak untuk mengubah, memperbarui, atau menghentikan fitur layanan sewaktu-waktu tanpa pemberitahuan sebelumnya. Penggunaan berkelanjutan atas situs ini setelah perubahan ketentuan dianggap sebagai penerimaan Anda terhadap ketentuan baru tersebut.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">5. Hubungi Kami</h2>
          <p>
            Pertanyaan seputar Syarat dan Ketentuan ini dapat disampaikan melalui halaman <Link href="/contact" className="text-indigo-600 underline font-semibold">Kontak Kami</Link>.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
