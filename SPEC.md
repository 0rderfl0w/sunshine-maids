---
priority: "1st"
category: "engineering"
tags: ["website", "astro", "cleaning-service", "seo", "blog", "client-project"]
created: "2026-03-12"
client: "Nick — Guardian Cleaners"
---

# Guardian Cleaners — New Website

## Mission

Build Nick a modern, blazing-fast website so he can stop paying $100/month for his current site at [guardian-cleaners.com](https://guardian-cleaners.com/). The site must include a simple admin panel focused on blog post creation so Nick can publish cleaning tips weekly to improve his Google rankings.

## Client Context

- **Business:** Guardian Cleaners — residential & commercial cleaning
- **Coverage:** Oklahoma City, Edmond, Norman OK
- **Owner:** Nick — solo operator, makes his own tech decisions
- **Current site:** guardian-cleaners.com (hosted on Vercel, paying $100/mo)
- **Pain point:** Overpaying for a website he can't easily update
- **Goal:** Own his site, add blog content weekly for SEO, save $1,200/year
- **CRM ID:** Prospect #3 in Mission Control

## Pre-Flight Checklist (Blocking Prerequisites)

These must be completed BEFORE implementation begins:

- [ ] **Supabase project created** — Nick (or Z on Nick's behalf) creates a Supabase account and project ("guardian-cleaners"). Free tier is sufficient.
- [ ] **Credentials shared** — Project URL + anon key + service role key provided to Z and added to `.env`
- [ ] **Content confirmed** — Nick confirms he owns the images on his current site (not stock from his web designer) and approves us migrating them
- [ ] **Nick's admin email** — email address for his admin account (Supabase invite flow)
- [ ] **GitHub repo created** — `guardian-cleaners-website` repo under Z's GitHub account. Local path: `~/projects/websites/guardian-cleaners/`
- [ ] **Service area content** — Nick provides brief notes for Edmond and Norman pages (neighborhoods served, any city-specific details). OKC is primary — we can draft that from scraped content + public knowledge.
- [ ] **Default OG image** — branded Guardian Cleaners image for social shares (1200×630px). **Z or agent generates** from logo + brand colors scraped in Phase 2. Nick approves.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Astro 5 (`output: 'static'` default, SSR routes opt in with `prerender = false`) |
| UI Components | React 19 (interactive islands — admin only) |
| Styling | Tailwind CSS 4 + `@tailwindcss/typography` (blog post prose styling) |
| Database | Supabase (blog posts, site config, auth) |
| Rich Text Editor | Tiptap (WYSIWYG, stores JSON) + `@tiptap/html` (JSON→HTML rendering, must be in `dependencies` not `devDependencies` — used server-side) |
| Sanitization | DOMPurify (sanitize HTML before storage) |
| Runtime | Bun |
| Hosting | **Vercel free tier** (SSR support via serverless functions, edge CDN) |

### Key Architectural Decisions

1. **Fresh scaffold, not fork.** Paws-platform has 28 files with i18n references, Portuguese page filenames, and 772 lines of homegrown i18n code. Stripping it takes as long as scaffolding fresh. We'll `bun create astro`, then copy over `lib/supabase.ts` and adapt the `AdminPanel.tsx` pattern. Clean repo, no archaeology.

2. **Vercel free tier, not Hostinger.** The blog requires SSR so Nick can publish posts and see them live immediately (no rebuild trigger needed). Hostinger is static-only — incompatible with self-publishing. Vercel free tier includes 100GB bandwidth, 6,000 build minutes/mo, serverless function execution. More than enough for a cleaning service blog.

3. **Tiptap editor, not markdown.** Nick is a cleaning service operator posting from his phone between jobs. Markdown is a non-starter. Tiptap provides WYSIWYG editing with good mobile support. Bundle cost (~50-80KB gzipped) only hits `/admin`, not any public page. Content stored as JSON in Supabase (`jsonb` column). HTML pre-rendered on save via `@tiptap/html`, sanitized with DOMPurify before storage.

4. **Astro 5 rendering model.** `output: 'hybrid'` was removed in Astro 5. The correct approach: `output: 'static'` (default) with `export const prerender = false` on SSR routes (`/blog`, `/blog/[slug]`, `/admin/*`, `/sitemap.xml`). All other pages are static by default — no directive needed.

5. **Vercel serverless, not edge.** The `@supabase/ssr` package uses Node.js APIs unavailable in Vercel's edge runtime. Use `@astrojs/vercel` adapter (the `/serverless` subpath is deprecated — use the bare import).

### Astro Config Reference
```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  adapter: vercel(),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  },
  image: {
    remotePatterns: [{
      protocol: 'https',
      hostname: '**.supabase.co'
    }]
  }
});
```

### Environment Variables
| Variable | Source | Scope | Notes |
|----------|--------|-------|-------|
| `PUBLIC_SUPABASE_URL` | Supabase project settings | All environments | `PUBLIC_` prefix = client-safe (Astro convention) |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings | All environments | Client-safe, used in browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings | Server only | **No `PUBLIC_` prefix** — server-only, never exposed to client |
| `ADMIN_USER_ID` | Nick's Supabase auth UUID | Server only | For application-level admin checks (e.g., middleware redirects to /admin, admin-only feature flags). NOT used in RLS — RLS section handles DB security separately via hardcoded UUID in policies. |

These must be set in both `.env` (local dev) AND Vercel project settings (production).

### Vercel Config
```json
// vercel.json — Do NOT add "bunVersion". SSR functions must run on Node.js (@supabase/ssr needs it).
// Bun is build-time only (install + build). The function runtime stays Node.js.
// ⚠️ X-Robots-Tag: Remove headers section in Phase 7 before DNS cutover.
{
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "framework": "astro",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
      ]
    }
  ]
}
```

## Architecture Overview

### What We Adapt from paws-platform
- `lib/supabase.ts` — Supabase client factories (written from scratch, see Phase 1)

### Supabase Client Architecture

| Context | Client Type | Source | Notes |
|---------|------------|--------|-------|
| `src/middleware.ts` | `createServerClient()` | `@supabase/ssr` | Created per-request, reads/writes cookies, passed via `context.locals.supabase` |
| Astro SSR routes (blog, sitemap) | `context.locals.supabase` | From middleware | Uses **anon key** — RLS filters published posts only. Do NOT use service role key for public routes. |
| React islands (AdminPanel) | `createBrowserClient()` | `@supabase/ssr` | Instantiated in component via `createBrowserSupabaseClient()` from `lib/supabase.ts` |
| Admin server routes | `context.locals.supabase` | From middleware | Auth context from cookies — RLS checks Nick's UUID |
| **Never use** | bare `createClient()` | `@supabase/supabase-js` | No session awareness — don't import this package |

**⚠️ Blog SSR routes must use the anon client** (via middleware), NOT the service role key. The service role key bypasses RLS — if an agent forgets `.eq('status', 'published')` in the query, draft posts appear on the public blog. The anon key + RLS provides a safety net.
- `AdminPanel.tsx` — admin panel pattern (adapt for blog CRUD)
- Astro + Bun + Tailwind config patterns

### What We Build New
- **Layout.astro** — base layout with system font stack, meta tag infrastructure, structured data, default OG image
- **Homepage** — hero, services list, testimonials, service areas, CTA (static, zero JS)
- **About page** — Nick's story, why Guardian Cleaners (static)
- **Services page** — detailed service descriptions (static)
- **Service area pages** — dedicated pages per city for local SEO (static)
- **Blog system** — listing page + individual post pages (SSR, fresh from Supabase)
- **Contact page** — phone, email, static map image, CTA (static)
- **Admin panel** — blog post CRUD with Tiptap editor + business info editor (React island, auth-protected)
- **SEO infrastructure** — dynamic sitemap, structured data components, meta tags, Open Graph
- **Mobile navigation** — hamburger menu with slide-out nav for mobile breakpoints

## Pages

| Route | Rendering | `prerender` | Description |
|-------|-----------|-------------|-------------|
| `/` | Static | _(default)_ | Homepage — hero, services overview, testimonials, CTA. **Zero client JS.** |
| `/about` | Static | _(default)_ | About Guardian Cleaners, Nick's story |
| `/services` | Static | _(default)_ | Full service descriptions |
| `/cleaning-services-edmond-ok` | Static | _(default)_ | Service area page — Edmond |
| `/cleaning-services-norman-ok` | Static | _(default)_ | Service area page — Norman |
| `/house-cleaning-oklahoma-city` | Static | _(default)_ | Service area page — OKC (different slug targets "house cleaning" residential intent) |
| `/blog` | **SSR** | `false` | Blog listing with pagination (server-rendered HTML, no React island) |
| `/blog/[slug]` | **SSR** | `false` | Individual blog post — fresh from Supabase, cached at edge |
| `/contact` | Static | _(default)_ | Contact info, static map image, service area |
| `/admin` | **SSR** | `false` | Blog admin + business info editor (server-side auth guard) |
| `/admin/login` | **SSR** | `false` | Login form (server-side redirect if already authenticated) |
| `/sitemap.xml` | **SSR** | `false` | Dynamic sitemap including blog post URLs from Supabase |
| `404.astro` | Static | _(default)_ | Custom 404 — branded, links to homepage/services/contact |

### Blog Listing — Static HTML, Not React Island

The blog listing page does NOT need client-side interactivity. Pagination is handled via query params (`/blog?page=2`) or path segments. The page is server-rendered HTML with zero client JavaScript. No React island needed.

### SSR Caching Strategy

Blog pages are SSR but rarely change. Apply edge caching via response headers:

- **Blog listing (`/blog`):** `Cache-Control: s-maxage=300, must-revalidate` (5-minute edge cache, no stale serving). On a low-traffic site, `stale-while-revalidate` can serve stale content for much longer than the SWR window because revalidation only triggers on a request. `must-revalidate` ensures a fresh response after 5 minutes. Nick should be told: "New posts appear on the blog listing within 5 minutes."
- **Individual posts (`/blog/[slug]`):** `Cache-Control: s-maxage=3600, stale-while-revalidate=86400` (1-hour edge cache). Posts change rarely after publish.
- **Sitemap (`/sitemap.xml`):** `Cache-Control: s-maxage=86400, stale-while-revalidate=604800` (1-day edge cache). Nick publishes weekly at most.

**Lighthouse target for SSR blog pages:** 85+ on mobile (cold start can add 500ms-1s). With edge caching, warm requests will match static page performance.

**Implementation — Setting Cache-Control Headers in Astro SSR:**

Each SSR route sets headers on the Response object. Example for `/blog/index.astro`:

```astro
---
export const prerender = false;

import { createServerClient } from '@supabase/ssr';
import { serialize } from 'cookie';

export async function GET({ cookies, redirect }) {
  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (k) => cookies.get(k)?.value } }
  );
  
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(10);
  
  // Render HTML...
  
  return new Response(html, {
    status: 200,
    headers: {
      'Cache-Control': 's-maxage=300, must-revalidate',
      'Content-Type': 'text/html'
    }
  });
}
```

For `/blog/[slug].astro` use `s-maxage=3600, stale-while-revalidate=86400`. For `/sitemap.xml` use `s-maxage=86400, stale-while-revalidate=604800`.

### SSR Error Handling

All Supabase fetch calls in SSR routes must be wrapped in try/catch:
- **Blog listing:** On Supabase error, return empty list with friendly "Check back soon" message. Never a raw 500.
- **Blog post:** On error, redirect to `/blog` with a flash message or show a graceful "Post not found" page.
- **Sitemap:** On error, return a minimal sitemap with static pages only (no blog URLs). Google retries sitemaps — a temporary error is acceptable.
- **⚠️ Supabase free tier pauses after 7 days of inactivity.** If Nick doesn't interact with the site/admin for a week, the DB pauses and SSR routes fail. Document this in the admin walkthrough: "Log into the admin panel at least once a week to keep the database active." Add to Phase 7 handoff.

## Supabase Schema

### `blog_posts` table
```sql
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content jsonb not null,        -- Tiptap JSON document
  content_html text,             -- Pre-rendered + sanitized HTML (generated on save via @tiptap/html + DOMPurify)
  cover_image text,              -- Supabase Storage URL
  cover_image_alt text,          -- Alt text for cover image (SEO)
  status text default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  meta_title text,               -- SEO override
  meta_description text,         -- SEO override
  tags text[]                    -- e.g. ['cleaning-tips', 'okc', 'airbnb']
);

-- Enforce: if cover image exists, alt text is required
alter table blog_posts add constraint cover_image_alt_required
  check (cover_image is null or (cover_image_alt is not null and cover_image_alt != ''));

-- Auto-update updated_at on every edit
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on blog_posts
for each row execute function update_updated_at_column();

-- Indexes
create index idx_blog_posts_status_published on blog_posts (status, published_at desc);
create index idx_blog_posts_slug on blog_posts (slug);
create index idx_blog_posts_tags on blog_posts using gin(tags);

-- RLS Policies (Phase 1: public read only. Admin policies added in Phase 5 after Nick's UUID is known.)
alter table blog_posts enable row level security;

-- Public: read published posts only (Phase 1)
create policy "Public can read published posts"
on blog_posts for select
to anon
using (status = 'published');

-- Admin policies are NOT created in Phase 1.
-- See "Phase 5 Admin RLS Migration" section below.
```

#### Phase 5 Admin RLS Migration

After Nick's account is created (Phase 5 step 14), capture his auth UUID and run this migration **once**:

```sql
-- Replace <NICK_UUID> with the actual UUID from Supabase Auth → Users
-- blog_posts admin access
create policy "Admin has full access"
on blog_posts for all
to authenticated
using (auth.uid() = '<NICK_UUID>'::uuid)
with check (auth.uid() = '<NICK_UUID>'::uuid);

-- site_config admin access
create policy "Admin can update site config"
on site_config for all to authenticated
using (auth.uid() = '<NICK_UUID>'::uuid)
with check (auth.uid() = '<NICK_UUID>'::uuid);

-- Storage admin access
create policy "Admin can manage images"
on storage.objects for all to authenticated
using (auth.uid() = '<NICK_UUID>'::uuid and bucket_id in ('blog-images', 'site-assets'))
with check (auth.uid() = '<NICK_UUID>'::uuid and bucket_id in ('blog-images', 'site-assets'));
```

**⚠️ Why not `current_setting()`?** Supabase's PostgREST does NOT set arbitrary `app.*` session variables. Using `current_setting('app.admin_user_id')` will either throw "unrecognized configuration parameter" or silently return NULL — locking Nick out of his own admin. Always hardcode the UUID directly in the policy SQL.

**⚠️ Why not just `to authenticated`?** The Supabase anon key is public (shipped client-side). Anyone can call `signUp()` against the auth API even with registration disabled in the dashboard. `to authenticated` grants access to ANY signed-up user. RLS must check `auth.uid()` against Nick's specific UUID.

### `site_config` table (Phase 1 — NOT optional)
```sql
create table site_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Auto-update trigger (same function as blog_posts)
create trigger set_site_config_updated_at
before update on site_config
for each row execute function update_updated_at_column();

-- Seed with initial values from content scrape
-- Nick can update these from admin panel without a code deploy

-- Required keys and JSONB value schemas:
-- phone:         string                             → "(405) 555-0123"
-- email:         string                             → "nick@guardiancleaners.com"
-- address:       { street, city, state, zip }       → {"street":"123 Main St","city":"Oklahoma City","state":"OK","zip":"73101"}
-- service_areas: string[]                           → ["Oklahoma City", "Edmond", "Norman"]
-- hours:         { [day]: string }                  → {"mon-fri":"8am-5pm","sat":"9am-2pm","sun":"Closed"}
-- testimonials:  Array<{name, text, city}>          → [{"name":"Sarah M.","text":"Amazing job...","city":"Edmond"}]
-- ⚠️ address must match PostalAddress shape used in LocalBusiness JSON-LD schema
-- ⚠️ Testimonials: max 5 displayed. No star ratings or photos for MVP.

alter table site_config enable row level security;

create policy "Public can read site config"
on site_config for select to anon using (true);

-- Admin policy added in Phase 5 (see "Phase 5 Admin RLS Migration" above)
```

### Storage
- Bucket: `blog-images` — cover photos and inline images for posts (lowercase, case-sensitive!)
- Bucket: `site-assets` — scraped images from current site + any new brand assets (lowercase!)

```sql
-- Create buckets (run via Supabase Dashboard or CLI — names are CASE-SENSITIVE)
insert into storage.buckets (id, name, public) values ('blog-images', 'blog-images', true);
insert into storage.buckets (id, name, public) values ('site-assets', 'site-assets', true);
-- ⚠️ Buckets MUST be `public: true` for unauthenticated image access via /object/public/ URLs.
-- A bucket with public:false + anon RLS policy still requires auth tokens on the URL.
-- Write access is restricted by RLS (admin-only policies in Phase 5), not bucket visibility.

-- Storage RLS (public read, admin write added in Phase 5)
create policy "Public can read blog images"
on storage.objects for select to anon
using (bucket_id = 'blog-images');

create policy "Public can read site assets"
on storage.objects for select to anon
using (bucket_id = 'site-assets');

-- Admin storage policy added in Phase 5 (see "Phase 5 Admin RLS Migration" above)
```

### Supabase Migration Strategy

Run migrations via the **Supabase Dashboard SQL Editor** (no CLI setup needed). Execute in this order:

1. **Block 1:** Create `update_updated_at_column()` function. This function must exist before any triggers can be created.
2. **Block 2:** `blog_posts` table (includes the trigger inline), constraints, indexes, public read RLS policy
3. **Block 3:** `site_config` table, trigger, public read RLS policy
4. **Block 4:** Storage bucket creation (`blog-images`, `site-assets`)
5. **Block 5:** Storage public read RLS policies
6. **Block 6 (Phase 5 only):** Admin RLS policies for all tables + storage (after Nick's UUID is known)

`CREATE POLICY` cannot be replaced — use `DROP POLICY IF EXISTS "name" ON table;` before recreating if you need to update a policy.

**⚠️ Gotcha:** Supabase bucket names are case-sensitive. Always use lowercase `blog-images` and `site-assets`. The paws-platform had a bug with `Avatars` (capital A) — don't repeat it. Verify bucket names match RLS policies exactly.

### `published_at` Lifecycle
- **Set on first publish:** When Nick changes `status` from `draft` → `published`, set `published_at = now()` in the admin save handler (application code, not a trigger).
- **Preserved on unpublish/republish:** If Nick unpublishes and later republishes, `published_at` retains the original date. This preserves SEO freshness signals and `BlogPosting.datePublished`.
- **Never null for published posts:** Blog listing orders by `published_at desc`. If `published_at` is null, the post won't appear correctly.
- **`updated_at` always updates:** The trigger handles this — reflects "last edited" in `BlogPosting.dateModified`.

### Slug Collision Handling
Handled in the app layer before insert:
1. Generate slug from title using `toSlug()` (adapted from paws-platform)
2. Query Supabase: Use parameterized query with `ilike` to prevent injection:
   ```typescript
   const { data: existing } = await supabase
     .from('blog_posts')
     .select('slug')
     .ilike('slug', `${baseSlug}%`)
     .order('slug', { ascending: false })
     .limit(1);
   ```
3. If collision: append `-2`, `-3`, etc. (check again for double collisions)
4. Nick can manually edit the slug before saving

## Admin Panel — Blog Focus

The admin panel is Nick's primary interaction point. Must be dead simple.

### Features
1. **Dashboard** — list of all posts (title, status, date), sorted newest first
2. **Create post** — title, Tiptap WYSIWYG editor, cover image upload + alt text field, tags, excerpt
3. **Edit post** — same form, pre-filled
4. **Publish/unpublish toggle** — draft ↔ published with one click
5. **Delete post** — with confirmation
6. **Image upload** — drag-and-drop or click, stored in Supabase Storage
7. **Business Info tab** — edit phone, email, service areas, hours (reads/writes `site_config`)

### Image Upload Guards
- **Client-side:** Accept `image/jpeg, image/png, image/webp` only. Max 5MB per file. (UX guard only — easily bypassed)
- **Server-side:** Use an Astro API route (`src/pages/api/upload-guard.ts`) to validate MIME type + size before upload. The route should: (1) check `request.headers.get('content-type')` is `image/jpeg`, `image/png`, or `image/webp`, (2) check `request.headers.get('content-length')` ≤ 5MB, (3) reject any request failing validation with 400 status. Use this route for all cover image and inline blog image uploads. Supabase Storage bucket policies CANNOT enforce MIME type or file size — they only control auth and object naming patterns. The server-side validation must happen in application code, not bucket RLS.
- **Naming:** Files renamed to UUID on upload (prevents path traversal, strips metadata).
- **Alt text:** Required field on cover image upload. Placeholder hint: "e.g., Deep cleaning kitchen in Edmond OK"
- **Cover image dimensions:** Recommended 1200×675 (16:9). Used for `<Image>` width/height props to prevent CLS.

### Inline Image Uploads (Within Blog Post Body)
Tiptap's `Image` extension accepts URLs only — it does NOT handle file uploads natively. Implement a custom upload handler:
1. When Nick inserts an image in the editor body, open a file picker
2. Upload to `blog-images` bucket (same guards: 5MB, JPEG/PNG/WebP, UUID rename)
3. Get the public URL back from Supabase Storage
4. Call `editor.commands.setImage({ src: url, alt: userProvidedAlt })` — **REQUIRED** prompt for alt text before inserting. Do NOT allow insertion without alt text. Best practice: modal with "Describe this image for accessibility" and a Save button disabled until text is entered.
5. Inline images use raw `<img>` tags in `content_html` (not Astro's `<Image>` component — these are user-generated, dimensions unknown). Apply `loading="lazy"` and `max-width: 100%` via the `prose` styles.

### Auth
- Supabase email/password auth (one account for Nick)
- **Server-side auth guard:** Astro middleware (`src/middleware.ts`) uses `createServerClient()` from `@supabase/ssr`. Access cookies via `context.cookies` (NOT `Astro.cookies` — `Astro` is not in scope in middleware files). Call `getSession()` for the middleware guard (local JWT verification, instant). Note: `getSession()` reads the JWT without verifying it server-side — acceptable for a single-admin site where the only risk is Nick's own tampered JWT. For any future multi-user feature, switch to `getUser()` (server-verified, 100-300ms round-trip). Redirect to `/admin/login` if no session. Pass the Supabase client instance via `context.locals.supabase` for downstream route use.
- No public registration — admin account created via Supabase "Invite user by email" flow during setup
- **CRITICAL — Disable user registration:** After creating Nick's account, go to Supabase Dashboard → Authentication → Providers → Email → **Uncheck "Enable sign-ups"**. This prevents anyone else from creating accounts on your site.
- **Account creation process:** During Phase 5, use Supabase Dashboard → Auth → Users → Invite User with Nick's email. Nick receives magic link, sets his own password. No credentials exchanged over chat. After creation, capture Nick's auth UUID → set `ADMIN_USER_ID` in `.env` + Vercel env vars → run RLS migration with his UUID.
- **Password reset:** Supabase handles this automatically via the built-in "Forgot Password" flow. Configure SMTP in Supabase Dashboard (Settings → Auth → Email Templates) so reset emails come from a proper domain, not `noreply@mail.app.supabase.io`. The login page should include a "Forgot password?" link.

### Auto-Save Strategy
- **Primary:** Save to `localStorage` on every change (debounced, 3-second delay)
- **Key structure:** `guardian-draft-{postId}` for existing posts, `guardian-draft-new` for unsaved new posts. Keys are per-post — multiple tabs editing different posts don't clobber each other.
- **New post flow:** On first save to Supabase (gets UUID back), migrate `guardian-draft-new` → `guardian-draft-{newId}` and delete old key.
- **Secondary:** Sync to Supabase as draft every 30 seconds (if authenticated)
- **Token expiry handling:** Use Supabase `onAuthStateChange` listener to detect token refresh. If access token expires mid-edit, the localStorage copy preserves the draft. On re-auth, sync localStorage → Supabase. Show a non-blocking toast: "Session expired — your draft is saved locally. Please log in again." Do NOT show a blocking modal that destroys editor state.
- **localStorage value shape:** Each draft entry stores `{ content: TiptapJSON, savedAt: number }` (where `savedAt` = `Date.now()` at time of save). This timestamp is critical for conflict resolution.
- **Conflict resolution:** On mount, load post from Supabase (get `updated_at`). Check localStorage. If `draftEntry.savedAt > new Date(supabasePost.updated_at).getTime()`, show prompt: "You have unsaved changes from [time]. Restore draft?" If localStorage is older or same age, discard it silently. This prevents the multi-device scenario where an older localStorage draft overwrites newer Supabase content.
- **Cleanup on delete:** When Nick deletes a post, also call `localStorage.removeItem(`guardian-draft-${postId}`)`. Prevents orphaned drafts accumulating.

### UX Priority
- Mobile-friendly (Nick posts from his phone between jobs)
- Auto-save drafts (localStorage + Supabase sync)
- Inline preview (rendered HTML below the editor, updates live as Nick types)
- Slug auto-generated from title (editable)

### Tiptap Editor Configuration
- **Extensions:** StarterKit (bold, italic, headings, lists, blockquote), Image, Link, Placeholder
- **Shared extensions module:** Create `src/lib/tiptap-extensions.ts` exporting a single `TIPTAP_EXTENSIONS` array. This same array is used in: (1) editor constructor in AdminPanel, (2) `generateHTML()` in save handler, (3) server-side fallback in `/blog/[slug].astro`. **Exclude `Placeholder`** from the `generateHTML()` calls — it's editor-UI only and has no HTML serializer.
- **Content format:** Stored as Tiptap JSON (`jsonb` column).
- **HTML generation on save:** Use `@tiptap/html`'s `generateHTML(doc, extensions)` to convert Tiptap JSON → HTML. Then sanitize with `DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })`. Store sanitized HTML in `content_html` column.
- **Fallback:** If `content_html` is null on blog post page, fall back to server-side `generateHTML()` from the `content` JSON column. Don't render nothing.
- **Mobile:** Tiptap has good mobile support. Toolbar should be sticky/floating for phone use.

### Excerpt Generation
The `generateExcerpt` function works on `content_html` (not raw Tiptap JSON):
```
generateExcerpt(contentHtml: string, maxLength = 155): string
  1. Strip HTML tags
  2. Trim whitespace
  3. Truncate at word boundary
  4. Add ellipsis if truncated
```
Called on save if Nick hasn't written a custom excerpt. Stored in the `excerpt` column.

## Content Migration (from current site)

### Scraping Plan
The current site at guardian-cleaners.com is behind Vercel's bot protection, so we need browser-based scraping:

1. **Use browser tool** to navigate guardian-cleaners.com
2. **Capture:**
   - All text content (hero, services, about, testimonials)
   - All images (download to `/public/images/`)
   - Color scheme / branding elements (logo, brand colors)
   - Service descriptions and pricing (if listed)
   - Any testimonials or reviews displayed
   - Phone number, email, service areas
   - Font family used (to inform font decision)
3. **Save scraped content** to `src/data/content.json` for initial build AND seed into `site_config` table
4. **Download images** to `public/images/` with descriptive filenames
5. **Write SEO-conscious alt text** for every migrated image. Template: `"{service} in {city}, OK — Guardian Cleaners"`

### Scraping Fallback
If Vercel's bot protection blocks browser scraping:
1. Create `src/data/content-fallback.json` with the correct structure but placeholder text (e.g., `"[HERO_HEADLINE]"`, `"[SERVICE_1_DESC]"`)
2. Note all fields Nick needs to provide
3. Notify Z — content can be filled from Nick's input or by temporarily disabling bot protection
4. **Phase 3 proceeds with placeholders** — final content populated before launch

### Content Mapping
| Current Site Section | New Site Location | Editable by Nick? |
|---------------------|-------------------|-------------------|
| Hero / banner | Homepage hero | Yes (via `site_config`) |
| Services list | Services page + homepage summary | Future (hardcoded initially) |
| About / story | About page | Future (hardcoded initially) |
| Testimonials | Homepage testimonials section | Yes (via `site_config`) |
| Contact info | Contact page + footer | Yes (via `site_config`) |
| Images / photos | `/public/images/` (optimized) | Via admin uploads |

## Performance Requirements (Critical)

The homepage MUST load fast. This is non-negotiable.

### Targets
- **Lighthouse Performance (homepage):** 95+ on mobile
- **Lighthouse Performance (SSR blog pages):** 85+ on mobile (cold start adds latency; edge caching mitigates for repeat visitors)
- **LCP (Largest Contentful Paint):** < 2.0s
- **INP (Interaction to Next Paint):** < 200ms (replaces deprecated FID)
- **CLS (Cumulative Layout Shift):** < 0.1
- **Homepage page weight budget:**
  - HTML + CSS: ≤ 50KB
  - Hero image: ≤ 150KB (WebP)
  - Other images (testimonials, etc.): ≤ 50KB each
  - Client JavaScript: **0 KB** (zero JS on homepage)
  - Total: ≤ 500KB

### Optimization Strategy
1. **Static-first rendering** — Homepage, about, services, contact are pure static Astro pages. Zero JS shipped. No `client:*` directives on these pages.
2. **Image optimization** — Astro's `<Image>` component for automatic WebP/AVIF conversion, responsive srcset, lazy loading below the fold. Explicit width/height attributes to prevent CLS. For remote Supabase Storage images: `image.remotePatterns` configured in `astro.config.mjs` to whitelist `**.supabase.co`. Cover images use fixed 1200×675 (16:9) dimensions.
3. **Zero JavaScript on homepage** — No React islands on the homepage. Verify after build: check `.vercel/output/static/` for homepage JS bundles (`grep -r '<script[^>]*src=' .vercel/output/static/index.html` should return nothing — excludes JSON-LD `<script type="application/ld+json">`). With the Vercel adapter, output goes to `.vercel/output/`, NOT `dist/`.
4. **Font strategy** — System font stack: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. No external font requests. If the current site uses a distinctive brand font, self-host the WOFF2 with `font-display: swap` and preload — but only with Nick's explicit sign-off on the added weight.
5. **CSS optimization** — Tailwind purges unused styles automatically
6. **Asset compression** — Verify Brotli is active on Vercel: `curl -H 'Accept-Encoding: br' -I <url>` → confirm `content-encoding: br`
7. **No Google Maps iframe** — Contact page uses a static map image with "Open in Google Maps" link. Options: OpenStreetMap static tile (no API key), or pre-captured screenshot of Google Maps stored as `/public/images/map-service-area.webp`. No external API dependency.
8. **No third-party bloat** — no analytics trackers, chat widgets, or heavy embeds on initial load
9. **Lazy load below-fold** — testimonials, service area details, images below the fold
10. **Alt text on all images** — SEO-conscious, locally-relevant alt text on every `<img>`
11. **SSR edge caching** — Blog listing: `s-maxage=300, must-revalidate`. Individual posts: `s-maxage=3600, stale-while-revalidate=86400`. Sitemap: `s-maxage=86400`. Verify against SSR Caching Strategy section.

### Performance Verification
- Run Lighthouse after every major change
- Verify zero JS on homepage: `grep -r '<script[^>]*src=' .vercel/output/static/index.html` should return nothing (excludes JSON-LD)
- Verify `export const prerender = false` is present on all SSR routes
- Test on throttled 3G to ensure mobile performance
- Compare against current site's scores as baseline
- Post-launch: monitor Core Web Vitals via Search Console

## SEO Strategy

### Technical SEO
- **Dynamic sitemap** — Custom SSR endpoint at `/sitemap.xml` that queries Supabase for all published blog posts. Includes all static pages + all `/blog/[slug]` URLs with `lastmod` from `updated_at`. `@astrojs/sitemap` does NOT automatically include SSR routes — a custom sitemap is required.
- `robots.txt` — static file at `/public/robots.txt`:
  ```
  User-agent: *
  Allow: /
  Disallow: /admin
  Sitemap: https://guardian-cleaners.com/sitemap.xml
  ```
- Structured data (JSON-LD) — via shared `<JsonLd />` Astro component
- **Canonical URLs** — Every page (static and SSR) includes `<link rel="canonical">` pointing to its own URL. Blog posts: `/blog/{slug}`. Static pages: `/`, `/about`, `/services`, `/contact`, `/service-areas/{city}`.
- Open Graph + Twitter Card meta tags with fallback OG image
- Clean URL structure (`/blog/cleaning-tips-for-spring` not `/blog?id=123`)

### Accessibility (WCAG 2.1 AA)
- **Skip navigation link** — Hidden link at top of `<body>` that becomes visible on focus, jumps to `<main id="main-content">`
- **ARIA landmarks** — Use `<nav>`, `<main>`, `<footer>` semantic elements
- **Focus management** — Visible focus indicators on all interactive elements
- **Alt text** — Required on all images (DB constraint for cover images, admin prompt for inline images)
- Alt text is covered. Skip nav, ARIA landmarks, and focus management are implementing agent's responsibility.

### Structured Data Architecture
Implemented via a shared Astro component at `src/components/JsonLd.astro`:

```astro
---
// src/components/JsonLd.astro
interface Props {
  schema: Record<string, unknown>;  // Caller builds the full schema object; component serializes
}
const { schema } = Astro.props;
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

Usage: `<JsonLd schema={{ "@context": "https://schema.org", "@type": "LocalBusiness", name: "Guardian Cleaners", ... }} />`

Renders structured data in `<head>`:

1. **`LocalBusiness` (sitewide baseline)** — in `Layout.astro`. Includes business name, phone, email, address, `areaServed: ["Oklahoma City, OK", "Edmond, OK", "Norman, OK"]`
2. **Service area pages override** — each page extends `LocalBusiness` with page-specific `areaServed` (single city) and city-specific description
3. **`BlogPosting` (per blog post)** — dynamically generated in `/blog/[slug].astro` from Supabase data: title, slug, excerpt, cover_image, author ("Guardian Cleaners"), published_at, updated_at

### Open Graph & Social
- Default OG image: `/public/images/og-default.jpg` (1200×630px, branded Guardian Cleaners image)
- `Layout.astro` meta tag fallback: `cover_image ?? props.ogImage ?? '/images/og-default.jpg'`
- Per-page OG title and description via props
- **Blog posts:** `/blog/[slug].astro` must pass post-specific OG data to Layout: `ogTitle={post.title}`, `ogDescription={post.excerpt}`, `ogImage={post.cover_image ?? '/images/og-default.jpg'}`. These come from the Supabase query — the SSR route has them available.

### Content SEO (Nick's Blog)
- Each blog post gets proper `<title>`, `<meta description>`, and heading hierarchy
- **Auto-generated excerpt** from `content_html` if Nick doesn't write one (see Excerpt Generation section)
- Tag system for topic clustering
- Blog post dates visible for freshness signals
- **Alt text required** on cover images (admin form field + DB constraint)

### Local SEO
- **Dedicated service area pages** with genuinely unique content per city:
  - `/house-cleaning-oklahoma-city` — OKC-specific: neighborhoods served (e.g., Nichols Hills, Midtown, Bricktown), OKC testimonials, metro-specific services
  - `/cleaning-services-edmond-ok` — Edmond-specific: neighborhoods, why Edmond residents choose Guardian, any Edmond testimonials
  - `/cleaning-services-norman-ok` — Norman-specific: university area coverage, Norman-specific details
  - **Content strategy:** Nick provides brief city-specific notes (pre-flight checklist). We expand into full page content. Template-swapped content is NOT acceptable — Google flags thin/duplicate content.
  - **Minimum content per page:** ≥ 400 words of unique content. Breakdown: intro paragraph (50w), neighborhoods served with 5-8 specific names (100w), "why us in [city]" section (100w), city-specific FAQ (100w), local testimonial if available (50w).
  - **If Nick provides nothing:** Draft pages using public knowledge (neighborhood names, local context are well-documented for OKC/Edmond/Norman). Flag for Nick's review before launch.
  - Each page has unique meta title, meta description, and `LocalBusiness` schema with city-specific `areaServed`
- NAP (Name, Address, Phone) consistent across ALL pages (pulled from `site_config`)
- Static map image on contact page with "Open in Google Maps" link
- **Google Business Profile checklist (Phase 7):**
  1. Confirm Nick has a verified GBP listing
  2. Ensure NAP on new site matches GBP exactly
  3. Update GBP website URL to new site after launch
  4. `LocalBusiness` schema matches GBP data

### Image Alt Text Policy
- **During migration (Phase 2):** Write descriptive, locally-relevant alt text for all migrated images. Template: `"{service} in {city}, OK — Guardian Cleaners"`
- **Blog cover images:** Nick prompted to write alt text in admin (required field with hint). DB constraint enforces non-null alt when cover image exists.
- **Hero/static images:** Hardcoded in components with deliberate, SEO-conscious alt text

## Blog Post Rendering

Blog posts display `content_html` (pre-rendered, sanitized HTML from Tiptap) wrapped in Tailwind Typography styles. **Security note:** Sanitization happens at save time only (DOMPurify). No render-time sanitization. Acceptable for MVP (Nick is the sole author). If guest posts or multi-author features are ever added, implement server-side DOMPurify in the Astro route before enabling that feature.

```html
<article class="prose prose-base md:prose-lg max-w-none">
  <Fragment set:html={post.content_html} />
</article>
```

**Why `@tailwindcss/typography`:** Tailwind CSS resets all browser default styles. Without the `prose` class, Tiptap's semantic HTML (`<h2>`, `<p>`, `<ul>`, etc.) renders as unstyled plain text — no margins, no font weights, no list indentation. The `prose` class restores readable typography for user-generated content.

**Canonical tag for blog posts:** Each blog post must include a self-referential canonical tag in `<head>`:
```astro
<link rel="canonical" href={`https://guardian-cleaners.com/blog/${post.slug}`} />
```
This prevents duplicate content issues if search engines access the post via multiple URLs.

**Tailwind CSS 4 setup:** Tailwind v4 uses CSS-first configuration — NO `tailwind.config.js`. The base Tailwind uses `@tailwindcss/vite` in astro.config.mjs (already specified). The typography plugin is loaded via CSS `@plugin` directive, NOT as a Vite plugin:
1. `bun add @tailwindcss/vite @tailwindcss/typography`
2. In `astro.config.mjs`: `vite: { plugins: [tailwindcss()] }` (base Tailwind only — already in spec)
3. In `src/styles/global.css`:
   ```css
   @import "tailwindcss";
   @plugin "@tailwindcss/typography";
   ```
4. Import `global.css` in `Layout.astro`

## Implementation Plan

### Phase 0: Pre-Flight (Blocking — before agents run)
1. Nick creates Supabase account + project (or Z does on his behalf)
2. Credentials (Project URL, anon key, service role key) added to `.env`
3. Nick confirms image ownership from current site
4. Nick provides email for admin account
5. GitHub repo created: `guardian-cleaners-website`
6. Nick provides city-specific notes for service area pages
7. Default OG image prepared (1200×630px)

### Phase 1: Scaffold & Foundation
1. `bun create astro` — fresh Astro project, **minimal template**. Local path: `~/projects/websites/guardian-cleaners/`
2. Write `src/lib/supabase.ts` from scratch (do NOT copy from capapvl.pt — that uses bare `createClient` without session awareness). Export two client factories:
   - `createBrowserSupabaseClient()` — uses `createBrowserClient` from `@supabase/ssr`, for React islands (AdminPanel)
   - Server client is created per-request in middleware via `createServerClient()` from `@supabase/ssr`, passed via `context.locals.supabase`
3. Configure `astro.config.mjs` — `output: 'static'`, `@astrojs/vercel` adapter (bare import, NOT `/serverless` subpath), React integration, Tailwind via Vite, `image.remotePatterns` for Supabase. Do NOT add `bunVersion` to vercel.json — SSR functions must run on Node.js.
4. Add `vercel.json` with explicit Bun build/install commands
5. Create base `Layout.astro` — system font stack (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`), meta tag infrastructure, `<JsonLd />` component, default OG image fallback, `<link rel="icon">` + `<link rel="apple-touch-icon">` + `<meta name="theme-color">` in `<head>`
6. Run Supabase migrations in order (see Migration Strategy section): function → blog_posts table + public RLS → site_config table + public RLS → storage buckets + public read policies. **No admin RLS yet** — that's Phase 5 after Nick's UUID is known.
7. Create `src/lib/tiptap-extensions.ts` — shared extensions array (StarterKit, Image, Link). Placeholder excluded from non-editor uses.
8. `git init`, connect to GitHub remote (`guardian-cleaners-website`), initial commit. Work on `main`.
   - **⚠️ Vercel noindex until launch:** The `*.vercel.app` URL is publicly accessible from day 1. Add to `vercel.json`: `"headers": [{ "source": "/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }] }]`. Remove this header in Phase 7 before DNS cutover. This prevents Google from indexing the in-progress site and creating duplicate content issues at launch.
9. Verify clean build (`bun build` succeeds)

### Phase 2: Scrape & Migrate Content
_Depends on: Phase 1 (Supabase configured)_
1. Browser-scrape guardian-cleaners.com for all content + images
2. **If scraping fails:** create `content-fallback.json` with placeholder structure, notify Z, proceed with placeholders
3. Download images, optimize (WebP, compress to budget targets)
4. Write alt text for all migrated images
5. Structure content into `src/data/content.json` AND seed `site_config` table
6. Note font, colors, and brand elements from current site
7. Decide: system font stack or self-host current font (get Nick's input if needed)
8. Generate favicon set from scraped logo: `favicon.ico` (32×32), `favicon.svg` (preferred), `apple-touch-icon.png` (180×180). Save to `/public/`
9. Generate default OG image (1200×630) from logo + brand colors. Save to `/public/images/og-default.jpg`

### Phase 3: Core Pages + Layout
_Depends on: Phase 1 (scaffold). Phase 2 content is preferred but can use placeholders._
1. Nav component — desktop + mobile hamburger menu (Tailwind `md:` breakpoint)
2. Footer component — NAP from `site_config`, nav links
3. Homepage — hero (headline + subheadline + primary CTA button), services summary (3-4 service cards), testimonials (from `site_config`, max 5), secondary CTA. **Primary CTA:** "Call Now" button as `<a href="tel:+14059774237">` (Nick's phone). **Secondary CTA:** "Get a Free Quote" linking to contact page. Zero JS, fully static.
4. Services page — detailed service descriptions
5. Service area pages — OKC, Edmond, Norman (with unique content + local schema)
6. About page — Nick's story
7. Contact page — phone, email, static map image, service area
8. Custom 404 page (`src/pages/404.astro`) — Guardian Cleaners branding, navigation, links to homepage/services/contact. Friendly text: "Page not found — but we can still clean your home."
9. Responsive design — mobile-first, test at `sm`, `md`, `lg` breakpoints
10. **Verify: no `client:*` directives on any static page**

### Phase 4: Blog System
_Depends on: Phase 1 (Supabase schema + RLS), Phase 3 (Layout.astro, Nav, Footer must exist)_
1. Add `export const prerender = false` to `/blog/index.astro` and `/blog/[slug].astro`
2. Blog listing page (SSR, static HTML, paginated via `/blog?page=2` query params). Each paginated page is **self-canonical** (e.g., `/blog?page=2` canonicalizes to itself, NOT to `/blog`). Add `rel="prev"` / `rel="next"` link tags for crawler hints. Do NOT canonicalize page 2+ to page 1 — Google treats that as declaring pages 2+ are duplicates and ignores their content.
3. Individual blog post pages (SSR, fresh from Supabase)
4. Blog post rendering: `content_html` displayed inside `<article class="prose prose-base md:prose-lg max-w-none">`. Fallback: server-side `generateHTML()` using shared `TIPTAP_EXTENSIONS` (excluding Placeholder) if `content_html` is null.
5. Blog post SEO (structured data: `BlogPosting` schema via `<JsonLd />`, meta tags)
6. SSR caching headers: listing = `s-maxage=300`, posts = `s-maxage=3600` (see SSR Caching Strategy)
7. Error handling: try/catch on all Supabase calls, graceful fallbacks (see SSR Error Handling)
8. Dynamic sitemap endpoint at `/sitemap.xml` (`prerender = false`) — queries Supabase for published posts, includes all static pages, `lastmod` from `updated_at`. Cache: `s-maxage=86400`.

### Phase 5: Admin Panel
_Depends on: Phase 1 (Supabase auth + schema), Phase 4 (blog rendering for preview)_

**⚠️ Testing strategy for steps 1-14:** Admin RLS policies don't exist until step 15 (Nick's UUID needed). To test admin CRUD during development: create a temporary test account in Supabase Dashboard → Auth → Users → Create New User (email: `admin-test@guardian-dev.local`). Capture the test UUID. Run the Phase 5 Admin RLS Migration using this test UUID. Develop and test all admin functionality. When Nick's real account is created in step 15: `DROP POLICY IF EXISTS` on all admin policies, recreate with Nick's UUID, delete the test account.

1. Astro middleware for `/admin/*` server-side auth guard (`@supabase/ssr`)
2. `export const prerender = false` on all `/admin/*` routes
3. Login page (`/admin/login`) with email/password form + "Forgot password?" link
4. Admin dashboard — post listing (title, status, date)
5. Create/edit post form with Tiptap WYSIWYG editor (shared `TIPTAP_EXTENSIONS`, `@tiptap/html` + DOMPurify in save flow)
6. Cover image upload with guards (5MB max, JPEG/PNG/WebP only, UUID rename, 1200×675 recommended)
7. Inline image upload handler for Tiptap editor body (same guards, prompt for alt text before insert)
8. Cover image alt text field (required — DB constraint enforces)
9. Publish/unpublish/delete controls. Set `published_at = now()` on first publish only. Preserve on republish. Clean up localStorage on delete.
   - **Publish validation (client-side):** Before publishing (NOT before draft-saving), validate: (a) title is non-empty, (b) body has content (`editor.isEmpty === false` — Tiptap provides this natively). Show toast: "Add some content before publishing" if validation fails. Drafts can be saved empty.
10. Auto-save (localStorage keyed by `guardian-draft-{postId}`, Supabase sync secondary)
11. Excerpt auto-generation from `content_html` on save (if Nick hasn't written one)
12. Business Info tab — edit phone, email, service areas, hours from `site_config`. Read all keys on mount, write changed keys on save. Show error on partial failure.
13. Slug collision detection + resolution
14. Mobile-responsive admin UI — post list as **card layout** on mobile (not horizontal-scroll table). Sticky/floating Tiptap toolbar.
15. **Create Nick's admin account:** Supabase Dashboard → Invite User → Nick's email. Capture UUID → run Phase 5 Admin RLS Migration (see schema section) — this creates all admin policies for the first time (not a re-run).
16. Configure Supabase SMTP + email templates (Settings → Auth → Email Templates) for password reset

### Phase 6: Performance & SEO
_Depends on: Phases 3-5 complete_
1. Lighthouse audit + optimization pass (homepage target: 95+, blog target: 85+)
2. **Verify zero JS on homepage** — check `.vercel/output/static/index.html` for `<script>` tags (should have none)
3. **Verify `prerender = false`** on all SSR routes (`/blog/*`, `/admin/*`, `/sitemap.xml`)
4. **Verify Brotli active** on Vercel
5. Image budget verification (hero ≤ 150KB, others ≤ 50KB)
6. Structured data validation (Google Rich Results Test)
7. Sitemap verification — all blog URLs present, `lastmod` correct
8. Open Graph validation — default image renders, per-page overrides work
9. Alt text audit — every image must have descriptive alt text
10. Replace any placeholder content from scraping fallback with final content

### Phase 7: Polish & Handoff
_Depends on: Phase 6 (performance verified)_
1. Cross-browser testing (Chrome, Safari, Firefox, mobile)
2. Final Lighthouse scores
3. **Admin walkthrough for Nick** — written Markdown guide with `[SCREENSHOT: description]` placeholders (Z fills in actual screenshots after first login — do NOT attempt browser automation for screenshots):
   - How to log in
   - How to create a blog post (with images and alt text)
   - How to publish
   - How to update business info (phone, hours, etc.)
   - How to reset password
   - "Log into admin at least once a week to keep the database active" (Supabase free tier pauses after 7 days of inactivity)
   - "New posts appear on the blog listing within ~5 minutes of publishing" (edge caching)
4. Deploy to Vercel (connect GitHub repo, configure env vars from table above)
5. DNS cutover plan (from current Vercel site to new deployment)
6. **GBP checklist** — verify NAP match, update website URL
7. Confirm Nick can log in, create a test post, and publish it

## Design Direction

- **Modern, clean, professional** — not flashy, not corporate. Trustworthy.
- **Brand colors** — preserve Guardian Cleaners' existing palette (scraped from current site)
- **Typography** — system font stack (fast, no external requests). Self-host only if brand font is critical to Nick.
- **Photography** — Nick's existing photos + stock if needed. All with SEO alt text.
- **White space** — generous, breathable layout
- **Mobile-first** — Nick's customers are searching on phones. Hamburger nav on mobile, full nav on `md:` breakpoint.
- **No Google Maps iframe** — static map image + link

## Hosting: Vercel Free Tier

**Decision: Vercel free tier.** Rationale:
- SSR support required for self-publishing blog (Hostinger is static-only — incompatible)
- Edge CDN with automatic Brotli compression
- 100GB bandwidth/mo, 6,000 build minutes/mo — more than sufficient
- Nick is already on Vercel (currently paying) — familiar platform
- Git-based deploys (push to main → auto-deploy)
- **Monthly cost: $0** (free tier covers this use case entirely)

### Supabase Free Tier Budget
| Resource | Limit | Guardian Cleaners Usage | Headroom |
|----------|-------|------------------------|----------|
| Database | 500MB | ~5MB (500 blog posts) | 100x |
| Storage | 1GB | ~200MB (images) | 5x |
| Auth | 50K requests/mo | ~100/mo (just Nick) | 500x |
| Bandwidth | 5GB/mo | ~500MB | 10x |

Nick will never hit these limits with a weekly blog.

## Out of Scope (For Now)
- Online booking/scheduling
- Payment processing
- Live chat
- Email newsletter signup (phase 2)
- Misty bot integration (separate evaluation — may add later)
- Multi-language support
- Analytics (phase 2 — consider Plausible or Vercel Analytics when Nick asks)
- Backup/recovery automation (Supabase has point-in-time recovery on paid plans; for free tier, periodic pg_dump via cron — evaluate in month 2)

## Success Criteria
- [ ] Homepage Lighthouse mobile score ≥ 95
- [ ] Blog page Lighthouse mobile score ≥ 85
- [ ] Homepage ships zero client JavaScript
- [ ] Homepage loads in < 2s on 4G
- [ ] Nick can create, edit, and publish a blog post without help
- [ ] Nick can update his phone number / hours without a code deploy
- [ ] Nick can reset his password without help
- [ ] All content from current site migrated with SEO alt text
- [ ] SEO fundamentals in place (dynamic sitemap, structured data, meta, service area pages)
- [ ] Mobile responsive on all pages (tested at sm/md/lg breakpoints)
- [ ] Admin works on mobile (Nick posts between jobs)
- [ ] Total monthly cost: $0 (Vercel free + Supabase free)
- [ ] GBP NAP matches website NAP
- [ ] Nick says "this is better than what I had"
