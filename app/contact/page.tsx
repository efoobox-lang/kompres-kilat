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
