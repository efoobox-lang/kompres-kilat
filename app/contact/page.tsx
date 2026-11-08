'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('https://formspree.io/f/myeedvkk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'Pesan Kontak KompresKilat',
          message: formData.message,
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(
          data?.errors?.[0]?.message || 'Gagal mengirim pesan. Silakan coba lagi atau hubungi via email langsung.'
        );
      }
    } catch {
      setErrorMessage('Terjadi kendala jaringan saat mengirim pesan. Harap periksa koneksi internet Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Kolom Informasi Kontak */}
          <div className="md:col-span-1 space-y-4 sm:space-y-6">
            <div>
              <span className="text-[10px] sm:text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Layanan Bantuan
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Hubungi Kami
              </h1>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Punya pertanyaan, kendala penggunaan tools, saran fitur baru, atau penawaran kerjasama periklanan? Kami siap membantu Anda.
              </p>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3 sm:space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Email Dukungan &amp; Iklan:</span>
                <a href="mailto:info.kompreskilat@gmail.com" className="font-bold text-indigo-600 hover:underline break-all">
                  info.kompreskilat@gmail.com
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

            {/* Kanal Media Sosial Resmi */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Media Sosial Resmi
                </span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Dapatkan tips berkas, nota kasir, dan pengumuman fitur baru:
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <a
                  href="https://www.instagram.com/kompreskilat/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-amber-500/10 hover:from-pink-500/20 hover:to-amber-500/20 border border-pink-500/25 flex items-center justify-between group transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-600 flex items-center justify-center">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">Instagram</span>
                      <span className="text-[11px] text-pink-600 font-medium">@kompreskilat</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-pink-600 group-hover:translate-x-0.5 transition-transform">
                    Ikuti &rarr;
                  </span>
                </a>

                <a
                  href="https://www.facebook.com/1411463522052642"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 flex items-center justify-between group transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-600 flex items-center justify-center">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">Facebook</span>
                      <span className="text-[11px] text-blue-600 font-medium">Kompres Kilat</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                    Kunjungi &rarr;
                  </span>
                </a>

                <a
                  href="https://www.youtube.com/@kompreskilat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 flex items-center justify-between group transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-600 flex items-center justify-center">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">YouTube</span>
                      <span className="text-[11px] text-red-600 font-medium">@kompreskilat</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-red-600 group-hover:translate-x-0.5 transition-transform">
                    Tonton &rarr;
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Kolom Formulir Pesan */}
          <div className="md:col-span-2">
            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Kirimkan Pesan Anda</h2>

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
                    className="mt-3 text-xs text-green-800 underline font-semibold cursor-pointer"
                  >
                    Kirim Pesan Lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-xs">
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
                      <span>⚠️</span>
                      <span className="font-semibold">{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap:</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Masukkan nama Anda"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Alamat Email Anda:</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama@domain.com"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subjek / Kategori Pesan:</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tuliskan pesan, masukan, atau kendala Anda di sini..."
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>Mengirim Pesan...</span>
                      </>
                    ) : (
                      <span>Kirim Pesan Sekarang 🚀</span>
                    )}
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
