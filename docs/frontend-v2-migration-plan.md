# Yogermeisters frontend v2 migration plan

Date: 2026-06-07
Audit update: 2026-06-07, task `t_7d62de6e`

## Goal

Port the updated landing frontend from `/Users/daniel/myai/coding/yogermeisters2` into the active project `/Users/daniel/myai/coding/Yogermeisters` while preserving the active backend, API routes, retreat detail pages, data model, deployment/build scripts, brand assets, and git remote.

## Source and target

### Active project: `/Users/daniel/myai/coding/Yogermeisters`

- Stack: Express + Vite + React 19 + TypeScript + Tailwind v4 + Wouter.
- Scripts: `npm run dev`, `npm run dev:client`, `npm run build`, `npm run check`.
- Baseline verified before this audit: `npm run check` exits 0.
- Current audit git status: `## main...origin/main` plus `?? docs/frontend-v2-migration-plan.md`.
- Active routes:
  - `/` -> `client/src/pages/Home.tsx`
  - `/retreats/:slug` -> `client/src/pages/RetreatPage.tsx`
- Active data and APIs to preserve:
  - API routes in `server/routes.ts`: `GET /api/retreats`, `GET /api/retreats/:slug`, `PATCH /api/retreats/:id/status`, plus `/healthz`.
  - Server retreat data access in `server/retreats.ts`.
  - Shared retreat content in `shared/retreat-content.ts` and `shared/retreats/{cirali,nepal,mountains}.ts`.
  - Client hooks and helpers in `client/src/lib/retreat-queries.ts`, `retreat-assets.ts`, `retreat-date.ts`, `retreat-localization.ts`, `i18n.ts`, `site-copy.ts`.
  - `client/src/lib/retreat-assets.ts` resolves retreat image file names from `attached_assets/**/*` via `import.meta.glob`; preserve this path unless a follow-up card intentionally moves active retreat images into `client/public`.
- Active public assets:
  - `client/public/assets/brand/*`
  - `client/public/assets/videos/hero.mp4`, `hero.webm`, `hero-poster.jpg`
  - `client/public/favicon.*`, `apple-touch-icon.png`, `site.webmanifest`, `opengraph.jpg`
- Important local convention: use `attached_assets/teacher-portrait-bamboo-wall.jpg` for the teacher portrait; avoid the old 16KB `client/public/assets/images/teacher-bamboo.jpg` optimization.
- Current home composition:
  - `client/src/pages/Home.tsx` renders `Navbar`, `Hero`, `ToursSection`, `ClassesSection`, `ReviewsSection`, `AboutSection`, `CTASection`, `Footer`.
  - `client/src/App.tsx` owns `useLanguage()` and passes `language`/`setLanguage` into `/` and `/retreats/:slug`.
  - `Navbar.tsx` uses Wouter `Link`/`useLocation`; keep its cross-route anchor behavior when porting source header links.

### Source project: `/Users/daniel/myai/coding/yogermeisters2`

- Stack: Next 16 app router + React 19 + CSS Modules + lucide-react.
- Baseline verified before this audit: `npm run build` exits 0.
- Current audit git status: `## main`; `git diff --name-only` and `git diff --cached --name-only` are empty.
- Uncommitted source changes: none were present during this audit. The files previously listed as uncommitted are now committed in HEAD `709b855 Refine Himalayan and practice sections`; treat current `main`/HEAD as the desired frontend.
- Updated landing entry:
  - `app/page.tsx` -> `components/YogaLanding.tsx`
  - `YogaLanding` renders: Header, HeroSection, RetreatsSection, ClassesSection, HimalayanSection, PracticeVideoSection, ContactSection.
- Design globals live in `app/globals.css`.
- Source uses `next/font/google` in `app/layout.tsx` for Bodoni Moda and Manrope; Vite target needs Google font links/CSS variables instead.
- Source public assets:
  - root reference/source images: `hero-photo.jpg`, `classes-photo.jpeg`, `himalayan-yoga-photo.jpeg`, `retreats-photo.jpeg`, screenshots, `logo.png`
  - live section background/cutout assets used by CSS: `public/assets/cutouts/hero2-bg.png`, `retreats-3-bg.png`, `classes-3-bg.png`, `himalayan-bg.png`
  - active source retreat card thumbnails used by `RetreatsSection.tsx`: `public/assets/retreats/thumb-nepal-retreat.jpg`, `thumb-cirali-retreat.jpeg`, `thumb-prague-retreat.png`
  - unused but potentially useful cutout variants: `hero-new-2.png`, `hero-figure.png`, `classes-figure.png`, `retreats-figure.png`, `himalayan-group.png`, `classes-2-bg.png`

## Recommended migration route

Use a port/adapt strategy, not a wholesale Next migration.

Why:
- The active project already has backend, routes, retreat detail pages, DB/schema, localization hooks, and production build pipeline.
- `yogermeisters2` is a static landing prototype with a better frontend, but it lacks the active Express/API and retreat detail routing.
- Vite supports CSS Modules, so most source components and `.module.css` files can be copied with small import/path adjustments.
- The active app already has `lucide-react`; no dependency is needed for the source icons. The source does not use Framer Motion; the active app already has it if integration wants to preserve existing motion patterns.

## Source frontend inventory

### Entrypoints and shared files

- `app/page.tsx`: imports `@/components/YogaLanding` and returns it.
- `components/YogaLanding.tsx`: section order is Header -> Hero -> Retreats -> Classes -> Himalayan -> Practice Video -> Contact.
- `components/landing/content.ts`: static nav/action/social/class/practice/contact content; retreat card data exists here but the current `RetreatsSection.tsx` now has its own local `retreatItems` array.
- `components/landing/types.ts`: `AnchorHref`, `NavItem`, `HeroAction`, `SocialLink`, `RetreatCard`, `ClassCard`, `PracticeBenefit`, `PracticeVideo`.
- `components/landing/ui.tsx`: shared `ButtonLink`, `SectionKicker`, `TitleOrnament`, `MultilineText` helpers.
- `components/landing/useActiveSection.ts`: browser-only `IntersectionObserver` hook for `main section[id]`.
- `components/landing/Header.tsx` + `Header.module.css`: responsive sticky header, active anchor highlighting, mobile menu, source `/logo.png`.

### Sections

- `HeroSection.tsx` + `HeroSection.module.css`:
  - Section id: `hero`.
  - Content: `Breathe • Move • Transform`, `Himalayan Yoga`, intro copy, `Learn more` -> `#online`, `Watch Practice` -> `#practice`.
  - CSS background/cutout: `/assets/cutouts/hero2-bg.png`.
  - Uses `heroActions` and `heroSocials` from `content.ts`.
- `RetreatsSection.tsx` + `RetreatsSection.module.css`:
  - Section id: `retreats`.
  - Static source cards: Nepal, Cirali/Turkey, Prague Mountains.
  - Card images: `/assets/retreats/thumb-nepal-retreat.jpg`, `/assets/retreats/thumb-cirali-retreat.jpeg`, `/assets/retreats/thumb-prague-retreat.png`.
  - CSS background/cutout: `/assets/cutouts/retreats-3-bg.png`.
  - Current prototype links cards to `#contact`; target should link active retreats to `/retreats/${retreat.slug}`.
- `ClassesSection.tsx` + `ClassesSection.module.css`:
  - Section id: `classes`.
  - Uses `classCards` from `content.ts`: Online Classes and Offline Classes — Prague.
  - CSS background/cutout: `/assets/cutouts/classes-3-bg.png`.
  - Prototype links to `#contact`; target should use active CTA behavior from `openExternal`/contact conventions.
- `HimalayanSection.tsx` + `HimalayanSection.module.css`:
  - Client state required: `useState`; remove Next-only `"use client"` when copying to Vite.
  - Section id: `online`, nav label is `Online`.
  - Contains two accordion states: Meditation and Yoga Practice.
  - CSS background/cutout: `/assets/cutouts/himalayan-bg.png`.
- `PracticeVideoSection.tsx` + `PracticeVideoSection.module.css`:
  - Section id: `practice`.
  - Uses `practiceVideo.src = https://www.youtube.com/embed/Z_AabfLhaHo` and practice benefits from `content.ts`.
  - Adds an iframe; keep `allowFullScreen` and responsive frame CSS.
- `ContactSection.tsx` + `ContactSection.module.css`:
  - Section id: `contact`.
  - Uses `contactEmail = hello@yogermeisters.com` from `content.ts`.
  - CSS background/cutout: `/assets/cutouts/hero2-bg.png`.

## Target integration inventory

- `client/src/App.tsx`: preserve Wouter `Switch` routes and language state. Only replace the `/` page implementation.
- `client/src/pages/Home.tsx`: best landing integration point. It currently receives `language` and `setLanguage`; keep that prop contract or wrap the new `YogaLandingV2` with the same props.
- `client/src/pages/RetreatPage.tsx`: leave intact. Smoke test a real slug after integration.
- `client/src/components/Navbar.tsx`: existing language toggle and non-home route anchor handling are useful. Either adapt source `Header` to this behavior or keep active `Navbar` with v2 styles.
- `client/src/components/ToursSection.tsx`: active retreat data example. Reuse its `useRetreats('upcoming', language)`, `formatRetreatDateLabel`, `getRetreatImageUrl`, `Link`, loading, and empty states when adapting source `RetreatsSection` visuals.
- `client/src/components/AboutSection.tsx`: imports `@assets/teacher-portrait-bamboo-wall.jpg`; preserve this source image if a teacher portrait is still needed.
- `client/src/lib/site-copy.ts`: bilingual copy source. Source prototype is English-only; add v2 copy here or a namespaced `landing-v2/content.ts` with `Record<Language, ...>` if preserving Russian UI in the new design.
- `client/src/index.css`: Tailwind v4 global theme plus dark app body. Merge source globals carefully so the warm editorial landing does not unintentionally restyle retreat detail pages.
- `client/index.html`: currently loads Montserrat and Playfair Display. Add/replace with Bodoni Moda and Manrope links when v2 font tokens are introduced.

## Implementation shape

1. Create a namespaced v2 landing folder in the active client:
   - `client/src/components/landing-v2/`
   - copy/adapt `Header.tsx`, `content.ts`, `types.ts`, `ui.tsx`, `useActiveSection.ts`, and `sections/*.tsx` + `*.module.css`.
   - create `client/src/components/YogaLandingV2.tsx` or adapt `client/src/pages/Home.tsx` to render a namespaced `YogaLandingV2`.

2. Port global design tokens safely:
   - merge source `app/globals.css` tokens into `client/src/index.css` using a landing wrapper class such as `.landingV2Root` where possible.
   - keep existing Tailwind import and active UI tokens needed by retreat detail pages and shadcn components.
   - avoid breaking existing `/retreats/:slug` dark-theme pages unless the task intentionally restyles them.
   - source reusable global classes are `.button`, `.button-dark`, `.arrow-button`, `.surface-panel`, `.round-icon`, `.panel-link`, `.section`, `.section-kicker`, `.extracted-photo`, and `.visually-hidden`; prefer renaming/scoping these to landing-v2 classes to avoid collisions.

3. Replace Next-specific font handling:
   - remove `next/font` dependency from copied code.
   - add Google font preconnect/link tags in `client/index.html`, or CSS `@import`, setting `--font-bodoni` and `--font-manrope` variables.
   - source `app/layout.tsx` uses `Bodoni_Moda({ subsets: ['latin'], variable: '--font-bodoni' })` and `Manrope({ subsets: ['latin'], variable: '--font-manrope' })`.
   - for bilingual active UI, request latin plus Cyrillic where Google Fonts supports it, and test Russian glyphs if v2 copy is localized.

4. Copy assets without overwriting active brand assets:
   - copy source `public/assets/cutouts/` to `client/public/assets/landing-v2/cutouts/`.
   - copy source retreat thumbnails to `client/public/assets/landing-v2/retreats/` only if the v2 card design needs these exact crops; otherwise prefer active attached-assets and `getRetreatImageUrl()`.
   - decide whether to use source `logo.png` or active `client/public/assets/brand/yogermeisters-logo-*.png`; active brand assets are preferred unless source logo is visually required.
   - update every copied CSS URL from `/assets/cutouts/...` to `/assets/landing-v2/cutouts/...` if namespacing assets.

5. Adapt behavior to active app:
   - preserve active `useLanguage()` and language toggle in `App.tsx`/`Home.tsx`.
   - Header links should work with Wouter and homepage anchors from non-home routes.
   - `RetreatsSection` should use active `useRetreats('upcoming', language)`, `formatRetreatDateLabel`, and link cards to `/retreats/${retreat.slug}` instead of `#contact`.
   - Keep `RetreatPage` route and APIs untouched.
   - Contact CTAs can keep current `https://t.me/AnastasiaPagliacci` unless product copy says otherwise; source prototype additionally has `mailto:hello@yogermeisters.com`.

6. Verify:
   - `npm run check`
   - `npm run build`
   - start a local dev/prod server and check `/` plus one `/retreats/:slug` page.
   - visual smoke test at mobile and desktop widths: header, hero, retreats, classes, Himalayan, practice video, contact.

## Exact source -> target migration checklist

### Entrypoints and shared components

- `yogermeisters2/app/page.tsx` -> no direct copy; replace/adapt `Yogermeisters/client/src/pages/Home.tsx` to render the v2 landing while preserving `HomeProps` (`language`, `setLanguage`).
- `yogermeisters2/components/YogaLanding.tsx` -> `Yogermeisters/client/src/components/YogaLandingV2.tsx` or `client/src/components/landing-v2/YogaLandingV2.tsx`.
- `yogermeisters2/components/landing/Header.tsx` -> `Yogermeisters/client/src/components/landing-v2/Header.tsx`; adapt anchors for Wouter/non-home routes and preserve language toggle behavior from `client/src/components/Navbar.tsx`.
- `yogermeisters2/components/landing/Header.module.css` -> `Yogermeisters/client/src/components/landing-v2/Header.module.css`; update logo path if using active brand.
- `yogermeisters2/components/landing/ui.tsx` -> `Yogermeisters/client/src/components/landing-v2/ui.tsx`; keep `ButtonLink`, `SectionKicker`, `TitleOrnament`, `MultilineText`.
- `yogermeisters2/components/landing/types.ts` -> `Yogermeisters/client/src/components/landing-v2/types.ts`; widen `AnchorHref` if target needs `/retreats/${slug}` or external URLs.
- `yogermeisters2/components/landing/useActiveSection.ts` -> `Yogermeisters/client/src/components/landing-v2/useActiveSection.ts`; safe in Vite because it runs inside `useEffect`.
- `yogermeisters2/components/landing/content.ts` -> `Yogermeisters/client/src/components/landing-v2/content.ts` for static non-retreat data, or merge content into `client/src/lib/site-copy.ts` for bilingual support.

### Sections

- `yogermeisters2/components/landing/sections/HeroSection.tsx` -> `Yogermeisters/client/src/components/landing-v2/sections/HeroSection.tsx`.
- `yogermeisters2/components/landing/sections/HeroSection.module.css` -> `Yogermeisters/client/src/components/landing-v2/sections/HeroSection.module.css`; replace `/assets/cutouts/hero2-bg.png` with `/assets/landing-v2/cutouts/hero2-bg.png`.
- `yogermeisters2/components/landing/sections/RetreatsSection.tsx` -> `Yogermeisters/client/src/components/landing-v2/sections/RetreatsSection.tsx`; replace static `retreatItems` with active `useRetreats('upcoming', language)` data and Wouter `Link` to `/retreats/${retreat.slug}`.
- `yogermeisters2/components/landing/sections/RetreatsSection.module.css` -> `Yogermeisters/client/src/components/landing-v2/sections/RetreatsSection.module.css`; replace `/assets/cutouts/retreats-3-bg.png` with `/assets/landing-v2/cutouts/retreats-3-bg.png`.
- `yogermeisters2/components/landing/sections/ClassesSection.tsx` -> `Yogermeisters/client/src/components/landing-v2/sections/ClassesSection.tsx`; connect CTAs to active `openExternal`/Telegram convention or preserve source `#contact` if the contact section handles conversion.
- `yogermeisters2/components/landing/sections/ClassesSection.module.css` -> `Yogermeisters/client/src/components/landing-v2/sections/ClassesSection.module.css`; replace `/assets/cutouts/classes-3-bg.png` with `/assets/landing-v2/cutouts/classes-3-bg.png`.
- `yogermeisters2/components/landing/sections/HimalayanSection.tsx` -> `Yogermeisters/client/src/components/landing-v2/sections/HimalayanSection.tsx`; remove `"use client"`, keep `useState`, consider changing id from `online` to a clearer target anchor if nav/copy is localized.
- `yogermeisters2/components/landing/sections/HimalayanSection.module.css` -> `Yogermeisters/client/src/components/landing-v2/sections/HimalayanSection.module.css`; replace `/assets/cutouts/himalayan-bg.png` with `/assets/landing-v2/cutouts/himalayan-bg.png`.
- `yogermeisters2/components/landing/sections/PracticeVideoSection.tsx` -> `Yogermeisters/client/src/components/landing-v2/sections/PracticeVideoSection.tsx`; keep YouTube embed `https://www.youtube.com/embed/Z_AabfLhaHo` and responsive iframe.
- `yogermeisters2/components/landing/sections/PracticeVideoSection.module.css` -> `Yogermeisters/client/src/components/landing-v2/sections/PracticeVideoSection.module.css`.
- `yogermeisters2/components/landing/sections/ContactSection.tsx` -> `Yogermeisters/client/src/components/landing-v2/sections/ContactSection.tsx`; reconcile `hello@yogermeisters.com` with active Telegram CTA.
- `yogermeisters2/components/landing/sections/ContactSection.module.css` -> `Yogermeisters/client/src/components/landing-v2/sections/ContactSection.module.css`; replace `/assets/cutouts/hero2-bg.png` with `/assets/landing-v2/cutouts/hero2-bg.png`.

### Global CSS and fonts

- `yogermeisters2/app/globals.css` -> merge scoped portions into `Yogermeisters/client/src/index.css`.
- Source `:root` tokens to preserve under the landing wrapper: `--ink`, `--soft-ink`, `--line`, `--line-strong`, `--paper`, `--paper-hot`, `--paper-cool`, `--sand`, `--gold`, `--panel`, `--panel-line`, `--shadow`, `--serif`, `--sans`.
- Source global body background should be scoped to the landing wrapper, not applied globally to all active routes.
- Source shared classes should be renamed/scoped if they conflict with active Tailwind/shadcn naming: `.button`, `.button-dark`, `.arrow-button`, `.surface-panel`, `.round-icon`, `.panel-link`, `.section`, `.section-kicker`, `.extracted-photo`, `.visually-hidden`.
- `yogermeisters2/app/layout.tsx` font setup -> `Yogermeisters/client/index.html` Google Fonts link and/or `client/src/index.css` variables:
  - Bodoni Moda -> `--font-bodoni`
  - Manrope -> `--font-manrope`
  - Existing Montserrat/Playfair links can remain only if active non-v2 pages still rely on them; otherwise replace after visual QA.

### Assets

- `yogermeisters2/public/assets/cutouts/hero2-bg.png` (1920x1080) -> `Yogermeisters/client/public/assets/landing-v2/cutouts/hero2-bg.png`.
- `yogermeisters2/public/assets/cutouts/retreats-3-bg.png` (1672x941) -> `Yogermeisters/client/public/assets/landing-v2/cutouts/retreats-3-bg.png`.
- `yogermeisters2/public/assets/cutouts/classes-3-bg.png` (1672x941) -> `Yogermeisters/client/public/assets/landing-v2/cutouts/classes-3-bg.png`.
- `yogermeisters2/public/assets/cutouts/himalayan-bg.png` (1920x1080) -> `Yogermeisters/client/public/assets/landing-v2/cutouts/himalayan-bg.png`.
- `yogermeisters2/public/assets/retreats/thumb-nepal-retreat.jpg` (1774x2660) -> optional `Yogermeisters/client/public/assets/landing-v2/retreats/thumb-nepal-retreat.jpg`; prefer active retreat image data if card mapping supports the design.
- `yogermeisters2/public/assets/retreats/thumb-cirali-retreat.jpeg` (1280x720) -> optional `Yogermeisters/client/public/assets/landing-v2/retreats/thumb-cirali-retreat.jpeg`; active Cirali assets already exist under `attached_assets/cirali/`.
- `yogermeisters2/public/assets/retreats/thumb-prague-retreat.png` (720x720) -> optional `Yogermeisters/client/public/assets/landing-v2/retreats/thumb-prague-retreat.png`; active corresponding data is `shared/retreats/mountains.ts`.
- `yogermeisters2/public/logo.png` (1254x1254) -> optional `Yogermeisters/client/public/assets/landing-v2/logo.png`; active brand assets in `client/public/assets/brand/` remain preferred.
- `yogermeisters2/public/hero-photo.jpg`, `classes-photo.jpeg`, `himalayan-yoga-photo.jpeg`, `retreats-photo.jpeg` -> do not copy for implementation unless a designer confirms these are needed; current source CSS uses the cutout PNGs instead.

### Active files expected to remain untouched by the implementation card

- `server/routes.ts`, `server/retreats.ts`, `shared/schema.ts`, `shared/retreat-content.ts`, `shared/retreats/*`.
- `client/src/pages/RetreatPage.tsx`, except for imports if a shared navbar/footer component is intentionally updated.
- `attached_assets/teacher-portrait-bamboo-wall.jpg` and active retreat image originals.
- `client/public/assets/brand/*`, unless a task explicitly approves replacing the logo system.

## Suggested Kanban graph

- T1 audit/map: produce a file-level migration checklist and confirm exact source files/assets to copy.
- T2 asset/design-token port: copy namespaced assets, fonts, and CSS module/global-token scaffolding.
- T3 component integration: port components, adapt Home/Header/RetreatsSection/language/routing.
- T4 verification/review: run typecheck/build/local smoke test, fix integration regressions or create a follow-up card with exact blockers.

T2 can start after T1. T3 depends on T1 and can use T2 outputs for final asset paths. T4 depends on T2 and T3.

## Task t_768fbabf asset and token handoff

Date: 2026-06-07

### Assets copied into active app

Copied source public assets from `/Users/daniel/myai/coding/yogermeisters2/public/assets/` into the namespaced active target `/Users/daniel/myai/coding/Yogermeisters/client/public/assets/landing-v2/`:

- `cutouts/classes-2-bg.png`
- `cutouts/classes-3-bg.png`
- `cutouts/classes-figure.png`
- `cutouts/hero-figure.png`
- `cutouts/hero-new-2.png`
- `cutouts/hero2-bg.png`
- `cutouts/himalayan-bg.png`
- `cutouts/himalayan-group.png`
- `cutouts/retreats-3-bg.png`
- `cutouts/retreats-figure.png`
- `retreats/thumb-cirali-retreat.jpeg`
- `retreats/thumb-nepal-retreat.jpg`
- `retreats/thumb-prague-retreat.png`

Active brand assets, video assets, `attached_assets/*`, and server/database files were not changed. The source `logo.png` was not copied because active `client/public/assets/brand/*` remains the preferred logo system.

### Design tokens and globals

`client/src/index.css` now contains a `.landing-v2-root` scoped token block for the source landing design. The active Tailwind v4 `@import`, `@custom-variant`, `@theme inline`, dark body styling, and existing utility classes remain in place for current home and `/retreats/:slug` pages.

The source `:root` and `body` assumptions were not applied globally. Warm paper backgrounds, `--ink`, `--paper`, `--sand`, `--gold`, `--panel`, `--serif`, `--sans`, and source shared classes such as `.button`, `.surface-panel`, `.section`, `.section-kicker`, `.round-icon`, `.panel-link`, `.extracted-photo`, and `.visually-hidden` are available only inside a wrapper element with `className="landing-v2-root"`.

When T3 ports components, wrap the v2 landing tree in `.landing-v2-root` and update copied CSS module asset URLs from `/assets/cutouts/...` to `/assets/landing-v2/cutouts/...`. If T3 keeps source static retreat thumbnails, update image URLs from `/assets/retreats/...` to `/assets/landing-v2/retreats/...`; if T3 uses active `useRetreats()` data, prefer `getRetreatImageUrl()` instead.

### Font loading

`client/index.html` now keeps the existing Montserrat and Playfair Display request and adds Vite-compatible Google Fonts loading for Bodoni Moda, Manrope, and Noto Serif Display. `client/src/index.css` defines:

- `--font-bodoni`: Bodoni Moda with Noto Serif Display and platform serif fallbacks.
- `--font-manrope`: Manrope with Inter/system sans fallbacks.

Manrope and Noto Serif Display provide Cyrillic-capable fallback coverage for bilingual UI while keeping the source Bodoni Moda and Manrope design intent. No `next/font/google` runtime dependency is required in the active Vite app.
