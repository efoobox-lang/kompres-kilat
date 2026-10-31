'use client';

import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setIsSubmitted(true);
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kolom Informasi Kontak */}
          <div className="md:col-span-1 space-y-6">
            <div>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Layanan Bantuan
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
                Hubungi Kami
              </h1>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Punya pertanyaan, kendala penggunaan tools, saran fitur baru, atau penawaran kerjasama periklanan? Kami siap membantu Anda.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Email Dukungan &amp; Iklan:</span>
                <a href="mailto:support@kompreskilat.com" className="font-bold text-indigo-600 hover:underline">
                  support@kompreskilat.com
                </a>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Jam Operasional:</span>
                <span className="font-semibold text-slate-800">Senin - Jumat (09:00 - 18:00 WIB)</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Waktu Respon:</span>
                <span className="font-semibold text-slate-800">Maksimal 1 x 24 Jam Kerja</span>
              </div>
            </div>
          </div>

          {/* Kolom Formulir Pesan */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Kirimkan Pesan Anda</h2>

              {isSubmitted ? (
                <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center space-y-2">
                  <span className="text-3xl block">✉️</span>
                  <h3 className="font-bold text-green-800 text-sm">Pesan Berhasil Terkirim!</h3>
                  <p className="text-xs text-green-700 max-w-sm mx-auto">
                    Terima kasih telah menghubungi KompresKilat. Tim kami akan segera meninjau pesan Anda dan membalas via email.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: '', email: '', subject: '', message: '' });
                    }}
                    className="mt-3 text-xs text-green-800 underline font-semibold"
                  >
                    Kirim Pesan Lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap:</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Masukkan nama Anda"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Alamat Email:</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama@domain.com"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subjek / Kategori Pesan:</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="">Pilih Subjek Pesan</option>
                      <option value="pertanyaan">Pertanyaan Penggunaan Tools</option>
                      <option value="laporan">Laporan Kendala / Bug</option>
                      <option value="saran">Saran Fitur Baru</option>
                      <option value="kerjasama">Kerjasama Iklan &amp; Bisnis</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Isi Pesan:</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tuliskan pesan, masukan, atau kendala Anda di sini..."
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm cursor-pointer"
                  >
                    Kirim Pesan Sekarang 🚀
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

