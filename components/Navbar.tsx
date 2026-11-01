'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  const navLinks = [
    { href: '/', label: t('nav_home') },
    { href: '/tools/image', label: t('nav_compress') },
    { href: '/ai-image-tools', label: t('nav_ai_image') },
    { href: '/ai-presentation-maker', label: t('nav_ai_slide') },
    { href: '/tools/tracking', label: t('nav_track') },
    { href: '/blog', label: t('nav_blog') },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo Brand */}
        <Link 
          href="/" 
          className="flex items-center gap-1.5 font-black text-indigo-600 text-lg sm:text-2xl tracking-tight whitespace-nowrap"
        >
          <span className="text-xl sm:text-2xl">⚡</span>
          <span>KompresKilat</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-3">
          <nav className="flex items-center space-x-1 lg:space-x-2 text-xs sm:text-sm font-semibold">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl transition ${
                  isActive(link.href)
                    ? 'bg-indigo-50 text-indigo-600 font-bold'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <LanguageToggle />
        </div>

        {/* Mobile Quick Action & Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-1.5">
          <LanguageToggle className="px-2 py-0.5 text-[11px]" />
          <Link
            href="/blog"
            className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 transition whitespace-nowrap"
          >
            {t('nav_blog')}
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100 focus:outline-none cursor-pointer"
            aria-label="Buka Menu"
          >
            {isOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Accordion */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 shadow-lg space-y-1 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-150">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2.5 rounded-xl transition ${
              pathname === '/' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            🏠 {t('nav_home')}
          </Link>
          <Link
            href="/tools/image"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2.5 rounded-xl transition ${
              pathname.startsWith('/tools/image') ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            🖼️ {t('tool_image_title')}
          </Link>
          <Link
            href="/ai-image-tools"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2.5 rounded-xl transition ${
              pathname.startsWith('/ai-image-tools') ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            ✨ {t('tool_ai_image_title')}
          </Link>
          <Link
            href="/ai-presentation-maker"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2.5 rounded-xl transition ${
              pathname.startsWith('/ai-presentation-maker') ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            📊 {t('tool_ai_slide_title')}
          </Link>
          <Link
            href="/tools/remove-bg"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2.5 rounded-xl transition ${
              pathname.startsWith('/tools/remove-bg') ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            🎨 {t('tool_bg_title')}
          </Link>
          <Link
            href="/tools/object-eraser"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2.5 rounded-xl transition ${
              pathname.startsWith('/tools/object-eraser') ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            🪄 {t('tool_eraser_title')}
          </Link>
          <Link
            href="/tools/meme-generator"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2.5 rounded-xl transition ${
              pathname.startsWith('/tools/meme-generator') ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            😂 {t('tool_meme_title')}
          </Link>
          <Link
            href="/tools/pdf"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2.5 rounded-xl transition ${
              pathname.startsWith('/tools/pdf') ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            📄 {t('tool_pdf_title')}
          </Link>
          <Link
            href="/tools/tracking"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2.5 rounded-xl transition ${
              pathname.startsWith('/tools/tracking') ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            📦 {t('tool_track_title')}
          </Link>
          <Link
            href="/tools/zip"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2.5 rounded-xl transition ${
              pathname.startsWith('/tools/zip') ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            🗜️ {t('tool_zip_title')}
          </Link>
          <Link
            href="/blog"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2.5 rounded-xl transition ${
              pathname.startsWith('/blog') ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            📚 {t('footer_link_all_blogs')}
          </Link>
        </div>
      )}
    </header>
  );
}

