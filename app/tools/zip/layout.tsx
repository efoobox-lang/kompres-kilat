import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pengolah Arsip ZIP Online - Buat, Kunci Password & Ekstrak Berkas | KompresKilat',
  description: 'Kemas banyak berkas ke dalam arsip ZIP berproteksi kata sandi (ZipCrypto) atau ekstrak file dari arsip ZIP terkunci secara instan, aman, dan gratis langsung di browser Anda.',
  keywords: [
    'arsip zip online',
    'kompres zip multi file',
    'kunci password zip',
    'enkripsi zip online',
    'ekstrak zip terkunci',
    'unprotect zip online',
    'zip crypto online',
    'buka proteksi zip'
  ],
  openGraph: {
    title: 'Pengolah Arsip ZIP Online: Buat, Kunci Sandi & Ekstrak Berkas | KompresKilat',
    description: 'Kemas banyak berkas ke dalam arsip ZIP berpassword atau ekstrak file dari arsip ZIP terkunci secara instan tanpa aplikasi pihak ketiga.',
    url: 'https://kompreskilat.site/tools/zip',
    siteName: 'KompresKilat',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pengolah Arsip ZIP Online: Buat, Kunci Sandi & Ekstrak Berkas | KompresKilat',
    description: 'Kemas banyak berkas ke dalam arsip ZIP berpassword atau ekstrak file dari arsip ZIP terkunci secara instan tanpa aplikasi pihak ketiga.',
  },
};

export default function ZipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
