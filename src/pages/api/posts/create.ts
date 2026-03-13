export const prerender = false;

import type { APIContext } from 'astro';
import { createClient } from '@supabase/supabase-js';

export async function POST(context: APIContext) {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('PUBLIC_SUPABASE_URL');
    if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    return context.redirect(`/admin/posts/new?error=${encodeURIComponent('Missing env vars: ' + missing.join(', '))}`);
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
    return context.redirect(`/admin/posts/new?error=${encodeURIComponent('Title and slug are required')}`);
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
      return context.redirect(`/admin/posts/new?error=${encodeURIComponent(error.message)}`);
    }

    return context.redirect('/admin/dashboard');
  } catch (e: any) {
    console.error('Exception creating post:', e);
    return context.redirect(`/admin/posts/new?error=${encodeURIComponent(e.message || 'Unknown error')}`);
  }
}
