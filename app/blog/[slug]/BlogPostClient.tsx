'use client';

import BlogPostTemplate, { BlogPostTemplateProps } from '@/components/BlogPostTemplate';

export default function BlogPostClient(props: BlogPostTemplateProps) {
  return <BlogPostTemplate {...props} />;
}
