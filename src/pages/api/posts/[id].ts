export const prerender = false;

import type { APIContext } from 'astro';
import { createClient } from '@supabase/supabase-js';

export async function GET({ params, redirect }: APIContext) {
  return redirect('/admin/dashboard');
}

export async function POST({ params, request, redirect }: APIContext) {
  const postId = params.id;

  if (!postId) {
    return redirect('/admin/dashboard');
  }

  // Check for _method override
  const formData = await request.formData();
  const method = formData.get('_method')?.toString()?.toUpperCase() || 'POST';

  if (method === 'DELETE') {
    return handleDelete(postId, redirect);
  }

  // Handle PUT
  return handlePut(postId, formData, redirect);
}

export async function PUT({ params, request, redirect }: APIContext) {
  const postId = params.id;

  if (!postId) {
    return redirect('/admin/dashboard');
  }

  const formData = await request.formData();
  return handlePut(postId, formData, redirect);
}

export async function DELETE({ params, redirect }: APIContext) {
  const postId = params.id;

  if (!postId) {
    return redirect('/admin/dashboard');
  }

  return handleDelete(postId, redirect);
}

async function handlePut(
  postId: string,
  formData: FormData,
  redirect: (url: string) => Response
) {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return redirect('/admin/dashboard');
  }

  const title = formData.get('title')?.toString();
  const slug = formData.get('slug')?.toString();
  const excerpt = formData.get('excerpt')?.toString();
  const body_html = formData.get('body_html')?.toString();
  const cover_image = formData.get('cover_image')?.toString();
  const published = formData.get('published')?.toString() === 'true';

  if (!title || !slug) {
    return redirect(`/admin/posts/${postId}/edit?error=1`);
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get current post to preserve published_at if not publishing
    const { data: currentPost } = await supabaseAdmin
      .from('posts')
      .select('published_at')
      .eq('id', postId)
      .single();

    const updateData: any = {
      title,
      slug,
      excerpt: excerpt || null,
      body_html: body_html || null,
      cover_image: cover_image || null,
      published,
      updated_at: new Date().toISOString(),
    };

    // If publishing for the first time, set published_at
    if (published && !currentPost?.published_at) {
      updateData.published_at = new Date().toISOString();
    } else if (!published) {
      updateData.published_at = null;
    }

    const { error } = await supabaseAdmin
      .from('posts')
      .update(updateData)
      .eq('id', postId);

    if (error) {
      console.error('Error updating post:', error);
      return redirect(`/admin/posts/${postId}/edit?error=1`);
    }

    return redirect('/admin/dashboard');
  } catch (e) {
    console.error('Exception updating post:', e);
    return redirect(`/admin/posts/${postId}/edit?error=1`);
  }
}

async function handleDelete(
  postId: string,
  redirect: (url: string) => Response
) {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return redirect('/admin/dashboard');
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      return redirect('/admin/dashboard');
    }

    return redirect('/admin/dashboard');
  } catch (e) {
    console.error('Exception deleting post:', e);
    return redirect('/admin/dashboard');
  }
}
