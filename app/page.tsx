import { getAllPosts } from '@/lib/blog-data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeClient from './HomeClient';

export default function Home() {
  const latestPosts = getAllPosts().slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-16 transition-colors">
      <Navbar />
      <HomeClient latestPosts={latestPosts} />
      <Footer />
    </main>
  );
}
