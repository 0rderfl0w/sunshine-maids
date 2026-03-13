# AGENTS.md — Guardian Cleaners Website

## Project Overview
- **Client:** Nick — cleaning service in Oklahoma City area
- **Goal:** Replace $100/month website with self-managed Astro + Supabase site
- **Repo:** `~/projects/websites/guardian-cleaners/`
- **GitHub:** https://github.com/0rderfl0w/guardian-cleaners-website
- **Stack:** Astro 5 + React 19 + Tailwind CSS 4 + Supabase + Tiptap editor
- **Runtime:** Bun (local dev), Node (Vercel build)

---

## Hosting & Deployment

### Vercel
- **Project name:** `guardian-cleaners-website`
- **Project ID:** `prj_ccILxLcpGctySJsI9Yjxvf6ng1lV`
- **Org/Team ID:** `team_PSTzRSzJjOtgGyZn47GOwsze`
- **Production URL:** https://guardian-cleaners-website.vercel.app
- **Deploy method:** Auto-deploy from GitHub `main` branch
- **Plan:** Free tier (200 project limit, non-commercial restriction — may need Pro $20/mo)

### ⚠️ CRITICAL: Vercel Project Linking
- `.vercel/project.json` MUST point to `prj_ccILxLcpGctySJsI9Yjxvf6ng1lV`
- **NEVER** run `npx vercel` without checking `.vercel/project.json` first
- If the file is wrong, Vercel will CREATE A NEW PROJECT silently
- **Incident (2026-03-13):** CLI was linked to deleted `guardian-cleaners` project, deployed to wrong project, recreated the deleted one, caused queue jam. Two deploys stuck in QUEUED state while old buggy code stayed live. Took 30+ minutes to untangle.
- **Fix:** Always verify project linking before manual deploys: `cat .vercel/project.json`

### Environment Variables (Vercel)
All 4 required env vars are set in Vercel for production/preview/development:
1. `PUBLIC_SUPABASE_URL` — Supabase project URL
2. `PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
3. `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
4. `ADMIN_USER_ID` — UUID of the admin user (Nick's account)

**To check env vars:** Vercel Dashboard → guardian-cleaners-website → Settings → Environment Variables
**To update via CLI:** `npx vercel env add VAR_NAME production`

### Deploy Checklist
1. Commit and push to `main`
2. Vercel auto-deploys from GitHub (takes ~2-3 min)
3. Check deploy status: Vercel Dashboard or `npx vercel ls`
4. If auto-deploy is stuck, manual deploy: `npx vercel --prod --yes`
5. **Before manual deploy:** verify `.vercel/project.json` has correct project ID

---

## Supabase

- **Project URL:** https://cmpdoonysjbnjlykwwyg.supabase.co
- **Storage bucket:** `blog-images`
- **Tables:** `posts` (blog posts)
- **Auth:** Email/password (Nick's admin account)
- **SMTP:** Supabase built-in, rate limited to 2 emails/hour

### Database Schema — `posts` table
| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | NO | PK, auto-generated |
| title | text | NO | |
| slug | text | NO | URL slug |
| excerpt | text | YES | |
| body_html | text | NO | Tiptap HTML output — **must not be null** |
| cover_image | text | YES | URL from Supabase storage |
| published | boolean | NO | default false |
| published_at | timestamptz | YES | set when published=true |
| created_at | timestamptz | NO | auto |
| updated_at | timestamptz | NO | auto |

### Storage RLS
- `blog-images` bucket requires authenticated uploads
- Code uses `createBrowserClient` (authenticated, not anon) for uploads
- RLS policies must be applied via Supabase SQL Editor

---

## Architecture

### Key Files
| File | Purpose |
|------|---------|
| `src/pages/admin/posts/new.astro` | Post creation form |
| `src/pages/api/posts/create.ts` | POST endpoint — creates post in Supabase |
| `src/components/TiptapEditor.tsx` | WYSIWYG editor (React island) |
| `src/lib/tiptap-extensions.ts` | Tiptap extension config |
| `src/lib/supabase.ts` | Supabase client helpers |
| `src/components/Nav.astro` | Navigation (includes Blog link) |
| `src/pages/blog/index.astro` | Blog listing page |
| `src/pages/blog/[slug].astro` | Individual blog post page |
| `src/pages/admin/dashboard.astro` | Admin dashboard |

### SSR
- Blog and admin pages require SSR (not static)
- Vercel adapter handles SSR via serverless functions
- `astro.config.mjs` — `output: "server"` with Vercel adapter

### Tiptap Editor
- Uses `client:only="react"` — **NOT** `client:load`
- `client:load` causes SSR crash on Vercel (empty HTML returned)
- Editor syncs HTML to hidden `<input id="body_html">` via `onUpdate` AND `onCreate`
- `onCreate` handler needed for localStorage draft restore (otherwise hidden input stays empty)
- Draft auto-saves to localStorage keyed by post ID

---

## Known Gotchas

1. **Tiptap + SSR:** Must use `client:only="react"`. `client:load` causes Vercel SSR to return blank page silently.
2. **body_html NOT NULL:** The `posts` table has NOT NULL on `body_html`. API must send `''` not `null` for empty content.
3. **Supabase storage uploads:** Must use authenticated client, not anon key. Anon key returns 400.
4. **Vercel project confusion:** Project name `guardian-cleaners-website` (not `guardian-cleaners`). Always verify `.vercel/project.json`.
5. **Deploy queue jams:** Vercel free tier deploys sequentially. If deploys get stuck in QUEUED, cancel them via API and redeploy manually.
6. **Supabase SMTP rate limit:** 2 emails/hour. Don't spam invite/reset emails.
7. **Blog nav link:** Must be in `Nav.astro` navLinks array. Was missing initially.
8. **Error visibility:** API endpoints redirect with `?error=` param. Check URL bar for error messages if post creation seems to silently fail.
9. **`define:vars` kills ES module imports:** Astro `<script define:vars={{...}}>` converts to a non-module script. Any `import` statements in that script will silently fail. Split into two scripts: one `define:vars` for injecting server data, one module script for imports/logic. Or remove `define:vars` if the variables aren't needed.
10. **Scraped image filenames are lies:** Images scraped from original site had misleading names (e.g., `service-recurring.jpg` was actually a commercial office building). Always visually verify image content before mapping to service categories — never trust filenames.
11. **Vercel CLI creates duplicate projects silently:** If `.vercel/project.json` points to a deleted/wrong project, `npx vercel` creates a new project without warning. Always `cat .vercel/project.json` before manual deploys.
12. **Tiptap `onUpdate` doesn't fire on mount:** The hidden `body_html` input stays empty if content is loaded from localStorage draft. Must also use `onCreate` handler to sync initial content.
13. **Two Supabase client types in admin pages:** Server-side frontmatter uses `createServerClient` (for auth checks, DB reads). Client-side `<script>` uses `createBrowserSupabaseClient` (for storage uploads). Don't mix them up — the browser client picks up auth from cookies automatically.
14. **Post-deploy cache:** After Vercel deploy, the old version may be cached at the edge. Tell users to hard-refresh (Ctrl+Shift+R) or wait ~60 seconds for propagation.

---

## Admin Setup (Nick)

1. Nick accepts Supabase auth invite email → sets password
2. Update `ADMIN_USER_ID` in Vercel env vars with Nick's UUID
3. Apply database RLS policies via Supabase SQL Editor
4. Nick logs in at `/admin/login` → creates posts at `/admin/posts/new`

---

## Dev Commands

```bash
bun dev                    # Local dev server
bun run build             # Production build
npx vercel --prod --yes   # Manual deploy (check .vercel/project.json first!)
npx vercel ls             # List recent deployments
```

---

## Agents Working on This

- **Razor & Blade** — primary engineering
- **Do not deploy without verifying `.vercel/project.json`**
