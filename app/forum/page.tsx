import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { MessageSquare, Sparkles, HelpCircle, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forum Komunitas & Tanya Jawab - KompresKilat',
  description: 'Ruang diskusi komunitas pengguna KompresKilat: tips kompresi dokumen resmi CPNS/BUMN, solusi konversi berkas, dan tanya jawab pelacakan resi pengiriman.',
};

export default function ForumPage() {
  const topics = [
    {
      title: 'Solusi Dokumen Gagal Unggah di Portal SSCASN / BUMN',
      category: 'Tips Dokumen',
      replies: 42,
      lastActive: 'Baru saja',
      author: 'Admin KompresKilat',
      badge: 'Solusi Resmi',
      badgeColor: 'emerald',
      description: 'Panduan lengkap kompresi file scan PDF dan KTP ke batas maksimal 200KB tanpa buram untuk pendaftaran CPNS & CASN.',
    },
    {
      title: 'Cara Mengubah Background Pas Foto Menjadi Merah/Biru Instan',
      category: 'Foto & Gambar',
      replies: 28,
      lastActive: '2 jam lalu',
      author: 'Komunitas Pasfoto',
      badge: 'Populer',
      badgeColor: 'indigo',
      description: 'Tips menghasilkan potongan rambut halus dan warna latar resmi Merah (Ganjil) atau Biru (Genap) via AI browser lokal.',
    },
    {
      title: 'Kenapa Nomor Resi SPX / J&T Belum Bergerak di Tracking?',
      category: 'Logistik & Resi',
      replies: 35,
      lastActive: '5 jam lalu',
      author: 'Pengguna Ekspedisi',
      badge: 'FAQ',
      badgeColor: 'amber',
      description: 'Penjelasan tahapan status paket dari pengirim, drop point, transit hub, hingga kurir pengantaran ke alamat rumah.',
    },
    {
      title: 'Keamanan Privasi: Apakah File Saya Diunggah ke Server?',
      category: 'Keamanan',
      replies: 19,
      lastActive: '1 hari lalu',
      author: 'Security Lead',
      badge: 'Penting',
      badgeColor: 'purple',
      description: 'Penjelasan teknis bagaimana HTML5 Canvas & WebAssembly memproses dokumen 100% di peramban pengguna tanpa data tersimpan.',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8">
        {/* Header Hero */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>Komunitas Pengguna KompresKilat</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Forum Komunitas &amp; Tanya Jawab
          </h1>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed">
            Pusat diskusi, berbagi solusi pengelolaan berkas digital, tips seleksi instansi resmi, dan panduan pelacakan kiriman belanja online.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kirim Pertanyaan / Masukan</span>
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Baca Panduan Tutorial</span>
            </Link>
          </div>
        </div>

        {/* Daftar Topik Diskusi */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Topik Diskusi Terhangat</span>
            </h2>
            <span className="text-xs text-slate-400">Diperbarui setiap hari</span>
          </div>

          <div className="space-y-3">
            {topics.map((t, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-indigo-50/30 hover:border-indigo-200 transition space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {t.category}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {t.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Aktif: {t.lastActive}</span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 hover:text-indigo-600 transition">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.description}
                </p>

                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-slate-100/80">
                  <span>Ditulis oleh: <b className="text-slate-600">{t.author}</b></span>
                  <span className="flex items-center gap-1 font-semibold text-indigo-600">
                    <MessageSquare className="w-3 h-3" />
                    <span>{t.replies} balasan</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kotak Bantuan & Panduan Cepat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-indigo-600">
              <HelpCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">Perlu Bantuan Penggunaan Alat?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Jika Anda mengalami kendala teknis saat mengompresi PDF, memperjelas foto AI, atau mengecek resi, tim kami siap membantu melalui halaman kontak.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline pt-1"
            >
              <span>Hubungi Pengembang</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">Privasi Tanpa Kompromi</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              KompresKilat tidak pernah membaca, menyimpan, atau menyebarkan dokumen Anda ke server pihak ketiga. Semua data diproses langsung di peramban web Anda.
            </p>
            <Link
              href="/privacy-policy"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline pt-1"
            >
              <span>Baca Kebijakan Privasi</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
