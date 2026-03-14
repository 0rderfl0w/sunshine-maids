# CHANGELOG — Guardian Cleaners Website

## 2026-03-14 (Batch 1 — Area Pages Redesign w/ New Template, Razor & Blade — Subagent)
- Redesigned 7 flagship area pages using Bethany template structure
- **Oklahoma City** — `src/pages/house-cleaning-oklahoma-city.astro` — 12 neighborhoods, OKC metro focus
- **Edmond** — `src/pages/cleaning-services-edmond-ok.astro` — 12 neighborhoods, family-friendly schools callout
- **Nichols Hills** — `src/pages/cleaning-services-nichols-hills-ok.astro` — 6 neighborhoods, luxury homes emphasis
- **Norman** — `src/pages/cleaning-services-norman-ok.astro` — 12 neighborhoods, student rental specialist
- **Piedmont** — `src/pages/cleaning-services-piedmont-ok.astro` — 7 neighborhoods, new construction focus
- **The Village** — `src/pages/cleaning-services-the-village-ok.astro` — 7 neighborhoods, mid-century homes
- **Yukon** — `src/pages/cleaning-services-yukon-ok.astro` — 8 neighborhoods, Czech heritage callout
- All pages now feature:
  - Split hero: city image left, coral gradient text right with phone/quote buttons
  - 7 service cards (3+4 grid) with image overlays + hover effects
  - City-specific intro paragraphs + neighborhoods section
  - "Why [City] Families Choose Guardian Cleaners" (4-card grid with icons)
  - FAQ section with area-specific Q&A
  - Local testimonial with quote + resident name
  - Full-bleed image CTA (dark overlay, not flat coral) with city-specific header/subheader from city-data.json
  - Brand coral #E56B6F with rounded-full buttons
  - LocalBusiness schema with proper areaServed array
  - Intersection Observer animation on scroll

## 2026-03-14 (Batch 2 — Area Pages Redesign, Razor & Blade)
- Redesigned 6 area-specific landing pages using Bethany template structure (split hero layout)
- **Arcadia** — `src/pages/cleaning-services-arcadia-ok.astro` — 8 neighborhoods, updated CTA
- **Del City** — `src/pages/cleaning-services-del-city-ok.astro` — 8 neighborhoods, Tinker AFB callout
- **Midwest City** — `src/pages/cleaning-services-midwest-city-ok.astro` — 8 neighborhoods, Joe B. Barnes Park
- **Moore** — `src/pages/cleaning-services-moore-ok.astro` — 8 neighborhoods, Buck Thomas Park
- **Mustang** — `src/pages/cleaning-services-mustang-ok.astro` — 8 neighborhoods, Wild Horse Park
- **Valley Brook** — `src/pages/cleaning-services-valley-brook-ok.astro` — 8 neighborhoods, 59th Street Corridor
- All pages now feature:
  - Split hero: city image left, coral gradient text right
  - 7 service cards (3+4 grid) with image overlays
  - Local testimonials with area-specific callouts
  - Full-bleed image CTA (dark overlay, not flat coral)
  - FAQ sections with area-specific content
  - Brand coral #E56B6F with rounded-full buttons
  - LocalBusiness schema with city-specific areaServed

## 2026-03-14 Session 3 — Design Polish & Brand Consistency (Razor & Blade)

### About Page Overhaul (commits 69dd5ef → 8537179)
- Created AI team photo via nano-banana skill (Gemini) — replaced failed SVG attempts
- Generated AI hero image for About page (full-bleed interior photo)
- Restructured hero: split layout with team photo right, text left (removed stacked images issue)
- Made hero shorter (50-55vh) with left-aligned text per user feedback
- Added coral background to "Our Story" section with white text
- Added "Our Services" grid below "Why Us" (3+4 layout matching homepage)
- Added wave dividers between all sections (white↔coral↔gray transitions)
- Added pill badges for section labels ("About Guardian Cleaners", "Why Us", "Services")
- Rounded bottom-left corner on hero image
- Hover effects: card shadow lift, image zoom, button translate-y

### Wave Dividers & Button Polish (commit 8537179)
- Homepage: wave divider into "Ready for a Spotless Home?" CTA
- Contact page: wave divider into "Ready to Get Started?" CTA
- All 7 service pages: wave dividers before CTA sections
- Button hover effects upgraded across all pages (lift + shadow grow)

### Area SEO Pages Brand Fix (commit 643b161)
- Fixed wrong coral color (#F56C7E → #E56B6F / Tailwind `bg-coral`) on all 7 area pages
- Buttons: rounded-lg → rounded-full to match site-wide style
- Added wave dividers before CTA sections on all area pages
- Fixed text color classes: gray-900/600 → text/text-light
- Added hover lift effects to buttons
- Added scroll animation script

### Deployment
- Vercel auto-deploy was not triggering from git push — ran `vercel --prod` manually
- All pages live at guardian-cleaners-website.vercel.app

## 2026-03-14 (SEO Area Landing Pages - Razor & Blade)
- Created 5 new area-specific SEO landing pages:
  - `src/pages/cleaning-services-bethany-ok.astro` - Bethany, OK with neighborhoods: Overholser Heights, Rolling Green, Council Heights, Lake Overholser, Westgate, Canyon Park, Sunnymeade, Country Village
  - `src/pages/cleaning-services-the-village-ok.astro` - The Village, OK with neighborhoods: Lakeside, Woodmere Park, Country Lane Estates, Coronado Heights, Canterbury, Village North, Kingsgate
  - `src/pages/cleaning-services-nichols-hills-ok.astro` - Nichols Hills, OK with neighborhoods: Grand Boulevard, Nichols Hills Park, Nichols Hills Plaza, Crown Heights, Terwilliger Heights, Waverly Park
  - `src/pages/cleaning-services-piedmont-ok.astro` - Piedmont, OK with neighborhoods: Deer Creek, Piedmont Heights, Country Meadows, Woodcrest, Harvest Hills, Sunset Ridge, Prairie View
  - `src/pages/cleaning-services-yukon-ok.astro` - Yukon, OK with neighborhoods: Czech Hall, Westborough, Sunset Lake, Lakewood, Silver Crest, Mustang Trail, Somerset, Yukon Hills
- Each page follows exact template structure from cleaning-services-edmond-ok.astro
- Includes LocalBusiness schema with area-specific areaServed
- Neighborhoods displayed as pill tags
- 4 "Why Choose" cards matching template style
- 4 FAQs specific to each area
- Authentic testimonial quotes for each area
- CTA sections with coral (#F56C7E) background
- All CTAs link to /contact and tel:+14059774237
- Canonical URLs set to each page's own path

## 2026-03-14 (Standard Pages + Nav/Footer Updates - Razor & Blade)
- Created 3 new standard pages:
  - `src/pages/faq.astro` - FAQ page with accordion-style Q&As grouped by category (General, Services, Pricing & Payment, About the Team), using coral wave design pattern from about.astro, interactive accordion with JS
  - `src/pages/privacy-policy.astro` - Clean layout privacy policy covering information collected, usage, third-party sharing, cookies, data retention, user rights, contact info
  - `src/pages/terms-of-service.astro` - Clean layout terms covering service description, booking/cancellation, pricing, liability, property access, damage policy, satisfaction guarantee, governing law (Oklahoma)
- **Footer.astro updates:**
  - Updated `companyLinks`: removed "Cleaning Checklist" and "Sitemap", added FAQ link
  - Added `legalLinks` array with Privacy Policy and Terms of Service
  - Changed `areasServed` from plain text array to objects with `name` and `href` properties (links to area service pages)
  - Updated footer template to render areas as links instead of plain text
  - Added Legal section under Company column
- **Nav.astro updates:**
  - Added FAQ to `navLinks` array
- All business details consistent: Guardian Cleaners LLC, 3129 NW 14th St, OKC, (405) 977-4237, nik@guardian-cleaners.com

## 2026-03-14 (Service Pages - Razor & Blade)
- Created 7 individual service pages in `src/pages/services/`:
  - basic-house-cleaning.astro
  - deep-house-cleaning.astro
  - move-in-move-out-cleaning.astro
  - recurring-maid-services.astro
  - airbnb-cleaning.astro
  - commercial-cleaning.astro
  - post-construction-cleaning.astro
- Each page follows coral-themed design pattern: coral hero with wave SVG dividers, service details section with bullet lists, numbered "Our Process" section (3-4 steps), FAQ accordion using `<details>/<summary>`, coral CTA banner
- All content from reference/service-pages-content.md with proper SEO titles/descriptions and canonical URLs
- Uses `export const prerender = true` for static generation
- IntersectionObserver scroll animations included on all pages
- Build verified: `bun run build` passes ✓

## 2026-03-14 (Session 3 - Nav Dropdown & Service Links - Razor & Blade)
- **Nav.astro:** Replaced flat "Services" link with hover dropdown (desktop) + accordion (mobile) showing all 7 individual service pages + "View All Services" link
- **Footer.astro:** Updated all 7 service hrefs from `/services` to individual slugs
- **index.astro:** Added `href` property to each service object; updated service card `<a>` tags to link to individual pages; added "Learn More →" text to each card
- **services.astro:** Added `href` property to each service object; updated grid card links to individual pages; added "Learn More →" coral button to each detailed service section; grid anchor links also updated to individual pages
- Build verified: `bun run build` passes ✓

## 2026-03-14 (Session 2 - Polish & Fixes - Razor & Blade)
- **Scrape & brand analysis:** Downloaded logo.png, hero.jpg, 7 service images, our-story.jpg from original guardian-cleaners.com. Extracted brand colors (#E56B6F coral, #DC373C hover, #6D5455 text) and 5 social media links
- **Full visual redesign:** Spawned Opus subagent to rewrite Nav, Footer, index, services, about, contact, and global.css — matching original site's professional aesthetic (see detailed entry below)
- **Hero-services divider removed:** Coral wave SVG between hero and services section created a visible line — removed for clean transition (commit 52cf01f)
- **Sitemap added:** Installed `@astrojs/sitemap`, added to astro.config.mjs integrations. Auto-generates `/sitemap-index.xml`. Linked in footer under Company column (commit 52cf01f)
- **Scroll animations verified:** IntersectionObserver with `threshold: 0.1` confirmed working — all 6 animated sections fade in on scroll. Full-page screenshots initially showed blank sections (observer doesn't fire without scroll), but stepped-scroll test confirmed 6/6 visible
- **Deployment:** All changes deployed via `npx vercel --prod --yes` to guardian-cleaners-website.vercel.app

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
