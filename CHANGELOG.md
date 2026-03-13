# CHANGELOG — Guardian Cleaners Website

## 2026-03-13 (Continued)
- Task: Scrape images from original site + add to homepage + add latest posts section
- Feat: Downloaded 14 hero/service images from guardian-cleaners.com via Wayback Machine (static.wixstatic.com CDN)
- Feat: Created `public/images/` directory with hero-banner, service images (basic, deep, move-in, airbnb, recurring, commercial, construction), and about images
- Feat: Updated `src/pages/index.astro` — converted to SSR (`export const prerender = false`) to fetch blog posts at runtime
- Feat: Added hero image background to hero section
- Feat: Added image to each service card in services section (4 main services displayed)
- Feat: Added "Latest Blog Posts" section — queries Supabase for 3 most recent published posts, displays title, excerpt, cover image, published date, and "Read More" links
- Feat: "Latest Blog Posts" section only renders if posts exist (no empty state on public page)
- Feat: Added "View All Posts →" link to `/blog` page
- Feat: Service areas section with clickable area links
- Fix: Build verified locally — all SSR and image imports working correctly
- Deploy: Production deployment successful to https://guardian-cleaners-website.vercel.app
- Verify: ✅ Hero image present and rendering
- Verify: ✅ All service images (basic, deep, move-in, airbnb) present and rendering
- Verify: ✅ Latest Blog Posts section present with Supabase integration
- Verify: ✅ "View All Posts" link present and functional
- Status: COMPLETE — Tasks 1-5 all done, images scraped, blog section live, deployed to production

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
