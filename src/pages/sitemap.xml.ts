// Dynamic sitemap - SSR
export const prerender = false;

import type { APIContext } from 'astro';
import { createServerClient } from '@supabase/ssr';

const siteUrl = 'https://guardian-cleaners-website.vercel.app';

// Static pages
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/services', priority: '0.8', changefreq: 'monthly' },
  { url: '/contact', priority: '0.8', changefreq: 'monthly' },
  { url: '/house-cleaning-oklahoma-city', priority: '0.8', changefreq: 'monthly' },
  { url: '/cleaning-services-edmond-ok', priority: '0.8', changefreq: 'monthly' },
  { url: '/cleaning-services-norman-ok', priority: '0.8', changefreq: 'monthly' },
];

export async function GET({ cookies }: APIContext) {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  let blogPosts: { slug: string; updated_at: string }[] = [];

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: { get: (k) => cookies.get(k)?.value }
      });

      const { data } = await supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (data) {
        blogPosts = data;
      }
    } catch (e) {
      // Fallback: no blog posts
      console.error('Error fetching blog posts for sitemap:', e);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${blogPosts.map(post => `  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${post.updated_at ? post.updated_at.split('T')[0] : today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800'
    }
  });
}
