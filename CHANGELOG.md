# CHANGELOG — Guardian Cleaners Website

## 2026-03-13
- Fix: body_html sync on editor mount + prevent null constraint violation (Razor & Blade)
- Fix: Vercel project linking — CLI pointed at wrong project, caused queue jam, deploys stuck
- Fix: Deleted duplicate `guardian-cleaners` Vercel project (twice — CLI recreated it)
- Fix: Comprehensive audit — added Blog to nav, error reporting in API, tiptap cleanup (Razor & Blade)
- Fix: Upload progress spinner, success indicator, image preview UX (Razor & Blade)
- Fix: Authenticated Supabase client for storage uploads (was using anon key → 400 error)
- Fix: Correct import paths for supabase client in admin scripts
- Fix: Tiptap SSR crash — switched from `client:load` to `client:only="react"` (Razor & Blade)
- Deploy: Vercel production deploy live at guardian-cleaners-website.vercel.app
- Setup: Supabase storage RLS policies applied (Z ran SQL)
- Created: AGENTS.md with full project documentation
- Created: CHANGELOG.md

## 2026-03-12
- Initial implementation — all 7 phases complete (Razor & Blade)
- SPEC.md and AUDIT.md finalized (7 audit rounds)
- Supabase project configured with posts table, blog-images bucket
- Admin panel: login, dashboard, post creation with Tiptap editor
- Public pages: home, services, about, contact, blog listing, blog post
- Vercel project created and connected to GitHub
