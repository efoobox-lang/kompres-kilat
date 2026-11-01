'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function BlogHeaderClient() {
  const { t } = useLanguage();

  return (
    <div className="mb-8 sm:mb-10 text-center">
      <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold mb-2">
        {t('blog_page_badge')}
      </span>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
        {t('blog_page_title')}
      </h1>
      <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
        {t('blog_page_desc')}
      </p>
    </div>
  );
}
