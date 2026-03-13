export const prerender = false;

import type { APIContext } from 'astro';
import { createClient } from '@supabase/supabase-js';

export async function POST(context: APIContext) {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return context.redirect('/admin/posts/new?error=1');
  }

  // Get form data
  const formData = await context.request.formData();
  const title = formData.get('title')?.toString();
  const slug = formData.get('slug')?.toString();
  const excerpt = formData.get('excerpt')?.toString();
  const body_html = formData.get('body_html')?.toString();
  const cover_image = formData.get('cover_image')?.toString();
  const published = formData.get('published')?.toString() === 'true';

  // Validate required fields
  if (!title || !slug) {
    return context.redirect('/admin/posts/new?error=1');
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        title,
        slug,
        excerpt: excerpt || null,
        body_html: body_html || null,
        cover_image: cover_image || null,
        published,
        published_at: published ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return context.redirect('/admin/posts/new?error=1');
    }

    return context.redirect('/admin/dashboard');
  } catch (e) {
    console.error('Exception creating post:', e);
    return context.redirect('/admin/posts/new?error=1');
  }
}
