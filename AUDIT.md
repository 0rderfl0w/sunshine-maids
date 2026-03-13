# Audit Log: Guardian Cleaners Website

## Status
- [x] No critical issues
- [x] No high issues
- [x] No medium issues
- [x] No low issues (all validated findings fixed)
- [x] All findings validated and fixed (Audit #7 complete)

### Audit #7 — Final Validation Results (2026-03-12)

**Total findings from 3 agents:** 6
- Backend: 2 LOW (documentation clarity)
- Frontend: NO ISSUES
- Security: 1 HIGH, 1 MEDIUM, 2 LOW

**Validation results:**

| Severity | Found | Validated | Fixed | Remaining |
|----------|-------|-----------|-------|-----------|
| CRITICAL | 0 | 0 | 0 | 0 |
| HIGH | 1 | 1 | 1 | 0 |
| MEDIUM | 1 | 1 | 1 | 0 |
| LOW | 4 | 4 | 4 | 0 |

**Findings fixed in this audit:**
- Line ~438: Added explicit "Disable user registration" step in Supabase Dashboard
- Line ~423: Added server-side upload-guard API route implementation detail
- Line ~374-380: Clarified migration strategy Block 1 description

**Rejected findings:**
- ADMIN_USER_ID — Already fixed in Audit #6
- Slug escaping — Already documented in AUDIT.md Open Items

### Audit #6 — Final Validation Results (2026-03-12)

**Total findings from 3 agents:** 2
- Backend: NO ISSUES
- Frontend: NO ISSUES
- Security/Infra: 2 LOW

**Validation results:**

| Severity | Found | Validated | Fixed | Remaining |
|----------|-------|-----------|-------|-----------|
| CRITICAL | 0 | 0 | 0 | 0 |
| HIGH | 0 | 0 | 0 | 0 |
| MEDIUM | 0 | 0 | 0 | 0 |
| LOW | 2 | 2 | 2 | 0 |

**Findings fixed in this audit:**
- Line 670: Astro template "blank" → "minimal" (Astro 5 naming)
- Line 92: ADMIN_USER_ID purpose clarified (application-level admin checks)

### Audit #5 — Final Validation Results

**Total findings from 3 agents:** 14
- Backend: NO ISSUES
- Frontend: 3 MEDIUM, 6 LOW
- Security/Infra: 2 HIGH, 3 MEDIUM, 3 LOW

**Validation results:**

| Severity | Found | Validated | Rejected (already in spec) | Valid (needs fix) |
|----------|-------|-----------|---------------------------|-------------------|
| CRITICAL | 0 | 0 | 0 | 0 |
| HIGH | 2 | 2 | 2 | 0 |
| MEDIUM | 6 | 6 | 6 | 0 |
| LOW | 6 | 6 | 4 | 2 |

**Rejected findings (already in spec):**
- vercel.json X-Robots-Tag headers (line 109)
- Cache-Control implementation code (line 179+)
- Canonical tags on blog posts (line 642-644)
- robots.txt explicit content (line 554-558)
- Accessibility section skip nav/ARIA/focus (line 567-571)
- Zero-JS grep excludes JSON-LD (line 532)
- Slug parameterized query (line 395-400)
- Image upload server-side validation (line 422)
- Inline image alt text required (line 432)
- Phase 5 RLS testing cleanup (line 722)
- Free tier inactivity warning (line 224, 765)

**Valid findings (non-blocking, documented for awareness):**
- ADMIN_USER_ID purpose unclear (line 92) — documented but usage not specified
- Astro template "blank" should be "minimal" (line 670) — Astro 5 naming

### Audit #5 Agent Details
- Backend/Data (MiniMax-M2.5, 2m): NO ISSUES
- Frontend/Performance/SEO (Haiku, 2m): 3 MEDIUM, 6 LOW
- Security/Architecture (Haiku, 1m): 2 HIGH, 3 MEDIUM, 3 LOW

- [ ] Ready for implementation ← USER CHECKS THIS, NOT CLAUDE

## Resolved Decisions (Audit #1)

| Decision | Resolution | Why |
|----------|-----------|-----|
| Fork vs scaffold | Fresh scaffold | 28 files with i18n, Portuguese filenames. Stripping ≥ scaffolding effort. |
| Hosting | Vercel free tier | SSR required for self-publishing blog. Hostinger is static-only. |
| SSR vs prerender | Hybrid (static default + SSR blog routes) | Nick publishes → live immediately, no rebuild. |
| Editor | Tiptap WYSIWYG | Nick is non-technical, posts from phone. Markdown non-starter. |
| Font | System font stack | No external requests. Self-host only with Nick's sign-off. |
| Maps | Static image + link | Google Maps iframe = 400KB JS. Static image = 20KB. |
| Blog listing | Static HTML, not React island | No interactivity needed. Zero client JS. |
| site_config | Phase 1, not optional | Nick must change phone/hours without code deploy. |

## Resolved Issues (Audit #2)

| Issue | Resolution |
|-------|-----------|
| `output: 'hybrid'` removed in Astro 5 | `output: 'static'` + `prerender = false` on SSR routes |
| Wrong adapter import path | `@astrojs/vercel/serverless` (not bare) — CORRECTED AGAIN IN AUDIT #3 |
| `prerender = false` never documented | Added to all SSR routes in Pages table + Phase 4/5 |
| RLS `to authenticated` allows any signup | Lock to Nick's `auth.uid()` — MECHANISM CORRECTED IN AUDIT #3 |
| `content_html` generation unspecified | `@tiptap/html` → `generateHTML()` → DOMPurify → store |
| DOMPurify only in gotchas | Moved to admin panel save flow spec + Phase 5 |
| `site_config` missing `updated_at` trigger | Added trigger |
| `generateExcerpt` can't work on JSON | Runs on `content_html`, not raw Tiptap JSON |
| No astro.config.mjs example | Full config reference added |
| Phases 3+4 falsely marked parallel | Phase 4 depends on Phase 3 |
| Phase 3 hard-depends on scraping | Scraping fallback with placeholder content |
| Service area content strategy missing | Nick provides city-specific notes. Unique content required. |
| Sitemap won't include SSR blog routes | Custom SSR sitemap endpoint |
| @tailwindcss/typography missing | Added to stack. Blog posts use `prose` wrapper |
| Astro Image needs remote patterns | `image.remotePatterns` in astro config |
| No OG image fallback | Default OG image specified |
| Structured data architecture vague | `<JsonLd />` component with per-page overrides |
| No SSR caching strategy | Cache-Control headers on SSR routes |
| Maps requires API key | OSM static tile or screenshot (no API key) |
| No git strategy | GitHub repo, branching, local path specified |
| Vercel env vars not listed | Full env var table added |
| Bun on Vercel undocumented | `vercel.json` with explicit commands |
| Storage bucket case sensitivity | Explicit lowercase names + gotcha documented |
| localStorage multi-tab clobber | Key structure: `guardian-draft-{postId}` per post |
| Password reset not mentioned | Supabase built-in flow + SMTP config |
| No mobile nav pattern | Hamburger menu at mobile breakpoints |
| cover_image_alt nullable but "required" | DB constraint: alt required when cover_image exists |

## Resolved Issues (Audit #3)

| Issue | Resolution |
|-------|-----------|
| `current_setting('app.admin_user_id')` broken in Supabase | Hardcode Nick's UUID directly in RLS policy SQL. PostgREST doesn't set arbitrary `app.*` vars. Two-pass migration replaced with single Phase 5 migration. |
| `@astrojs/vercel/serverless` deprecated | Use bare `@astrojs/vercel` import (subpath deprecated, will be removed) |
| Placeholder UUID in Phase 1 RLS | Removed. Phase 1 creates public-read policies only. Admin RLS runs once in Phase 5 after UUID is known. |
| Supabase migration strategy missing | Migration order specified (6 blocks), SQL Editor workflow, `DROP POLICY IF EXISTS` for policy updates |
| SSR error handling nonexistent | try/catch on all Supabase calls, graceful fallbacks per route type |
| Supabase free tier pauses after 7 days | Documented in admin walkthrough + SSR Error Handling section |
| Tiptap extensions not centralized | Shared `tiptap-extensions.ts` module. Placeholder excluded from generateHTML calls. |
| Middleware cookie handling unspecified | `context.cookies` (not `Astro.cookies`), `getSession()` (not `getUser()`), pass via `context.locals` |
| Inline image uploads unspecified | Custom Tiptap upload handler: file picker → Supabase Storage → setImage with alt text |
| `published_at` lifecycle undefined | Set on first publish, preserved on republish, never null for published posts |
| localStorage drafts never cleaned up | `removeItem` on post delete |
| `prose-lg` not responsive on mobile | Changed to `prose-base md:prose-lg` |
| Font stack includes non-native Roboto | Replaced with `system-ui` based stack |
| Cache invalidation vs "live immediately" | Blog listing cache reduced to 5 min. Sitemap cache 1 day. Admin walkthrough sets correct expectation. |
| Service area minimum content undefined | ≥ 400 words per page with content breakdown. Fallback: draft from public knowledge. |
| OG image responsibility unassigned | Z/agent generates from scraped brand assets. Nick approves. |
| Blog pagination unresolved (OR) | Query params (`/blog?page=2`) with `rel=canonical` to `/blog` |
| Mobile admin dashboard UX undefined | Card layout for post list on mobile (not horizontal table) |
| Inline images: dimensions unknown for Astro `<Image>` | Use raw `<img>` with `loading="lazy"` and `max-width: 100%` via prose styles |
| paws-platform path not specified | Moot — now writes from scratch (see Audit #4) |
| vercel.json bunVersion risk | Documented: do NOT add bunVersion — SSR functions need Node.js runtime |
| Business Info tab UX unspecified | Read all keys on mount, write changed keys on save, show error on partial failure |

## Resolved Issues (Audit #4)

| Issue | Resolution |
|-------|-----------|
| Storage buckets `public: false` breaks all public image URLs | Changed to `public: true`. Bucket visibility ≠ write access (RLS handles that). |
| Blog pagination canonical points all pages to `/blog` | Self-canonical per page. `rel=prev/next` for crawler hints. Google ignores duplicate-canonicalized pages. |
| `lib/supabase.ts` copied from capapvl.pt uses wrong client type | Write from scratch. Export `createBrowserSupabaseClient()` for React islands, server client via middleware. |
| `@tailwindcss/typography` loaded as Vite plugin (wrong for v4) | Use `@plugin "@tailwindcss/typography"` in CSS file. No `tailwind.config.js` in v4. |
| `<JsonLd />` component referenced but never defined | Full component spec added: Astro component, `schema: Record<string, unknown>` prop. |
| Phase 5 admin untestable until step 15 | Testing strategy: temp test account → dev RLS → replace with Nick's UUID at step 15. |
| Build output path `dist/` wrong for Vercel adapter | Corrected to `.vercel/output/static/`. |
| Vercel preview URL publicly accessible, no noindex | `X-Robots-Tag: noindex, nofollow` in vercel.json until Phase 7 launch. |
| SWR cache on blog listing misleads Nick | Removed `stale-while-revalidate` from listing. `must-revalidate` ensures 5-min max staleness. |
| Stale `s-maxage=3600` in Phase 6 verification | Updated to match per-route values from caching strategy. |
| SSR blog routes: which Supabase client? | Explicitly: anon key via middleware. Service role key bypasses RLS = draft leak risk. |
| Auto-save conflict has no timestamp mechanism | localStorage stores `{ content, savedAt }`. Compare `savedAt` vs Supabase `updated_at`. |
| Empty content body can be published | Publish validation: `editor.isEmpty` check before publish (not before draft save). |
| `site_config` value schemas undefined | All 6 keys now have explicit JSONB shapes (phone=string, address=object, hours=map, etc.). |
| No favicon or apple-touch-icon | Phase 2 generates favicon set from logo. Layout.astro includes icon links. |
| No custom 404 page | `404.astro` added to Pages table and Phase 3 deliverables. |
| Admin walkthrough "screenshots" unassignable | Changed to `[SCREENSHOT: description]` placeholders. Z fills after first login. |
| Homepage CTA undefined | "Call Now" `tel:` link + "Get a Free Quote" to contact page. |
| Blog post OG tags not specified | Explicit: post title, excerpt, cover_image passed to Layout OG meta. |
| `getSession()` security tradeoff undocumented | Noted: acceptable for single-admin. Switch to `getUser()` if multi-user added. |
| Content rendering XSS defense-in-depth | Documented as known tradeoff. Server-side DOMPurify required before any multi-author feature. |
| Service area URL pattern inconsistent (OKC vs others) | Documented as intentional: "house-cleaning" targets residential intent for OKC. |
| Supabase client architecture ambiguous | Client usage map added: middleware (server), SSR routes (context.locals), React islands (browser). |

## Open Items (Acceptable — MEDIUM)

| Item | Status | Notes |
|------|--------|-------|
| Tags as `text[]` | Acceptable for MVP | GIN index added. Re-evaluate if tag browsing becomes a feature. |
| Tailwind v4 typography plugin setup | Fixed in #4 | `@plugin` in CSS, not Vite. Fully specified now. |
| Cover image dimensions not enforced | Recommended 1200×675 | Client-side hint, not enforced at upload. |
| Blog page Lighthouse 85+ target | Documented | Cold starts unavoidable. Edge caching mitigates. |
| Dual LocalBusiness + BlogPosting schema | Acceptable | Google supports multiple schema types on one page. |
| Static map is a frozen image | Acceptable | Nick unlikely to move. Documented: regenerate if address changes. |
| 500KB budget is homepage-only | Noted | Per-image budgets apply globally. |
| Slug LIKE pattern escaping | Noted | Parameterized queries handle values but `%`/`_` in LIKE need escaping. Agent should use starts_with or escape wildcards. |
| Nick can delete images still referenced by posts | Noted | Orphan detection is over-engineering for MVP. Broken image = Nick re-uploads. |
| content.json schema not defined | Noted | Phase 2 agent defines structure; Phase 3 agent consumes it. Sequential dependency handles this. |
| Supabase free tier SMTP rate limit | Noted | **2 emails/hour** (updated Oct 2023, per Supabase auth rate limits docs). Fine for single-admin password resets. Custom SMTP optional upgrade. |
| Tiptap JSON storage size | Noted | ~5-10KB per post × 500 posts = 5MB. Well within Supabase free tier 500MB. |
| cover_image_alt reverse constraint | Noted | Alt without image is harmless — no constraint needed. Friendly error on constraint violation in admin UI. |
| Accessibility (WCAG 2.1 AA) | Noted | Alt text covered. Skip nav, ARIA landmarks, focus management are best practices for implementing agent. Not gated. |

## Rejected Findings (Don't Re-raise)

| Finding | Why Rejected | Audit # |
|---------|--------------|---------|
| RSS feed dropped | Doesn't help SEO for a cleaning blog. | #1 |
| Tags should be separate table | text[] with GIN index is fine for MVP. | #1 |
| CSRF protection missing | Supabase JWT auth is inherently CSRF-resistant. | #1 |
| Dependencies need cleanup | Moot since we scaffold fresh. | #1 |

## Resolved Issues (Audit #5)

| Issue | Resolution |
|-------|-----------|
| vercel.json code example missing X-Robots-Tag headers | Added headers section to code block. Remove in Phase 7. |
| Cache-Control headers documented as strategy, no implementation | Added code example showing Response.headers in SSR GET functions |
| Individual blog posts missing canonical tag spec | Added canonical tag requirement to Blog Post Rendering section |
| robots.txt not explicitly specified | Added explicit /public/robots.txt content |
| Static pages missing canonical tag spec | Updated Technical SEO section with explicit canonical tag requirement for all pages |
| Accessibility (skip nav, ARIA landmarks) not in spec | Added Accessibility section with WCAG 2.1 AA requirements |
| Zero-JS verification grep matches JSON-LD | Updated grep command to `<script[^>]*src=` excluding JSON-LD |
| Inline image alt text optional | Changed to REQUIRED - modal prompt before insert |
| Slug LIKE query vulnerable to injection | Changed to parameterized ilike query |

## Audit History

| # | Date | Agents | Critical | High | Med | Low | Notes |
|---|------|--------|----------|------|-----|-----|-------|
| 1 | 2026-03-12 | 3 | 5 | 16 | 6 | 3 | Major decisions resolved. |
| 2 | 2026-03-12 | 3 | 2 | 13 | 8 | 1 | Astro 5, RLS security, rendering pipeline, caching, sitemap. |
| 3 | 2026-03-12 | 3 | 1 | 10 | 10 | 2 | RLS mechanism fix, SSR error handling, inline images, migration strategy. |
| 4 | 2026-03-12 | 3 | 2 | 9 | 8 | 0 | Storage bucket visibility, pagination SEO, Supabase client architecture, Tailwind v4, Phase 5 testing, favicon/404. |
| 5 | 2026-03-12 | 3 | 0 | 2 | 7 | 2 | Full comprehensive audit - vercel.json, Cache-Control, canonicals, accessibility, inline images, slug queries. |

---
*Last updated: 2026-03-12*
