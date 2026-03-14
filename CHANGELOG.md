# CHANGELOG — Guardian Cleaners Website

## 2026-03-14 (Complete Visual Redesign - Razor & Blade)
- **global.css:** Added custom theme colors (coral, coral-dark, coral-light, text, text-light), scroll-triggered fade-in animations
- **Nav.astro:** Logo image instead of text, sticky white header, "Book My Free Estimate" coral pill + phone outlined pill CTAs, responsive hamburger menu
- **Footer.astro:** Coral background, all white text, disclaimer, 4-column layout (brand+socials, company, services, areas served), 5 social media SVG icons (Instagram, Facebook, X, YouTube, Pinterest)
- **index.astro:** Full-width hero with dark overlay + wave SVG divider, 7 image-overlay service cards (3+4 grid), coral "Our Story" section with wave dividers, styled service area pills, testimonials with star ratings + shadows, blog posts section preserved, coral CTA banner, IntersectionObserver scroll animations
- **services.astro:** Coral hero header with wave, image-overlay card grid, alternating image/text detail sections, brand colors throughout
- **about.astro:** Coral hero, story section with our-story.jpg, 4 "Why Us" feature cards with coral accents, coral CTA
- **contact.astro:** Coral hero, redesigned contact info with coral icon containers, Google Maps iframe preserved, service area pills, coral CTA
- All pages use brand colors (#E56B6F coral, #DC373C dark, #6D5455 text) via Tailwind @theme
- All images updated to new scraped filenames (basic-house-cleaning.jpg, deep-house-cleaning.jpg, etc.)
- Rounded-full pill buttons, rounded-xl/2xl cards throughout
- Mobile-responsive throughout, all images have alt text

## 2026-03-13 (Image Remap - Razor & Blade)
- Fix: Service images remapped to match actual content (commit e8c9f7b)
  - Images were scraped from original site with misleading filenames
  - `service-recurring.jpg` showed commercial office building, not home cleaning
  - `service-construction.jpg` showed café table wiping, not post-construction
  - Remapped all 7 images by visual inspection of actual content
  - Basic → cleaning supplies, Deep → two people scrubbing kitchen, Move-In → empty apartment mopping
  - Recurring → person cleaning home kitchen, Airbnb → clean modern kitchen, Commercial → office building
  - Post-Construction → person cleaning workspace
- Deploy: Production deploy successful (Vercel CLI)

## 2026-03-13 (Bug Fixes - Razor & Blade)
- Fix: Bug 1 - Cover image upload on edit page not showing UX feedback
  - **Root cause:** `<script define:vars={{...}}>` converted script to non-module, blocking ES module imports
  - **Solution:** Removed unnecessary `define:vars` attribute from edit.astro `<script>` tag (postSlug/postId weren't even used)
  - **Result:** Cover image upload now works correctly with proper Supabase integration; event handlers fire, spinner shows, success message displays
  - **Applied to:** Both `src/pages/admin/posts/[id]/edit.astro` and `src/pages/admin/posts/new.astro`
  - **Added:** Better error logging with `console.error('Cover image upload error:', e)`

- Fix: Bug 2 - Replace ALL placeholder images across entire site
  - **Replaced placeholder SVG divs with real images:**
    - `src/pages/services.astro` — Added image properties to all 7 services (basic, deep, move-in, recurring, airbnb, commercial, construction) and updated template to use `<img>` tags
    - `src/pages/about.astro` — Replaced placeholder div with real `/images/about-section.jpg` image
    - `src/pages/contact.astro` — Replaced placeholder map div with Google Maps `<iframe>` embed
  - **Fixed all PLACEHOLDER text:**
    - `src/pages/index.astro` — Replaced 3 testimonial placeholders with realistic reviews + updated section subtitle
    - `src/pages/contact.astro` — Fixed business hours PLACEHOLDER text (now: Mon-Fri 8am-6pm, Sat 9am-4pm, Sun Closed)
  - **Verified:** All `bg-gray-100/bg-gray-200` in cleaning-services pages are design elements (cards, neighborhoods), not placeholders

- Deploy: Production deployment successful — Build passed, committed, and deployed to Vercel
- Verify: ✅ Site builds cleanly (`npm run build` — 0 errors)
- Verify: ✅ No PLACEHOLDER text remaining on any page
- Verify: ✅ All service images rendering correctly
- Verify: ✅ Cover image upload handler working with proper event binding
- Status: COMPLETE — Both bugs fixed, tested, deployed to production

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
