# SEO Plan — Yogermeisters

## Priority 1: Critical (Indexability & Crawling)

### 1.1 Create robots.txt
- Allow/disallow rules for all major crawlers
- Reference sitemap.xml location
- Block admin/dev endpoints if any

### 1.2 Create sitemap.xml
- Static URLs: homepage
- Dynamic URLs: all retreat pages (`/retreats/:slug`)
- Include lastmod, changefreq, priority
- Auto-generate via build script

### 1.3 Add canonical URLs
- `<link rel="canonical">` on all pages
- Handle language variants properly
- Prevent duplicate content issues

### 1.4 Add Google Search Console & Yandex.Webmaster
- Verify domain ownership
- Submit sitemap
- Monitor indexing status

---

## Priority 2: High (Meta Tags & Content Discovery)

### 2.1 Dynamic meta tags for retreats
- Install `react-helmet-async`
- Generate unique `<title>` per retreat
- Generate unique `<meta name="description">` per retreat
- Generate unique OpenGraph tags per retreat
- Generate unique Twitter Card tags per retreat

### 2.2 Dynamic meta tags structure
```
Title: {Retreat Title} | {Date} | Yogermeisters
Description: {Duration}-day {Type} retreat in {Location}. {Price}. {Hook}
```

### 2.3 Structured data (Schema.org)
- Organization schema (homepage)
- Event schema for each retreat
- Review schema for testimonials
- LocalBusiness schema
- JSON-LD format

### 2.4 Hreflang implementation
- `<link rel="alternate" hreflang="en" … />`
- `<link rel="alternate" hreflang="ru" … />`
- `<link rel="alternate" hreflang="x-default" … />`

---

## Priority 3: Medium (Technical Performance)

### 3.1 Image optimization
- Convert hero/retreat images to WebP
- Implement responsive images (srcset)
- Add width/height attributes to prevent CLS
- Lazy loading for below-fold images

### 3.2 Core Web Vitals
- Reduce LCP (Largest Contentful Paint)
- Improve CLS (Cumulative Layout Shift)
- Optimize FID/INP (Interaction)

### 3.3 Font optimization
- Preload critical fonts
- Use `font-display: swap`
- Subset font files if possible

### 3.4 Bundle optimization
- Code splitting per route
- Tree shaking verification
- Minimize main bundle size

---

## Priority 4: Low (Content & Advanced)

### 4.1 Breadcrumb navigation
- Structured data for breadcrumbs
- Visual breadcrumb UI

### 4.2 FAQ schema
- Add FAQ sections to retreat pages
- Schema markup for rich snippets

### 4.3 Internal linking strategy
- Link between related retreats
- Link classes → retreats
- Footer link structure

### 4.4 Image sitemap
- List all images in separate sitemap
- Improve image search visibility

### 4.5 Video schema
- Markup for video testimonials
- Include transcripts if available

---

## Priority 5: Future (SSR/Prerendering)

### 5.1 Static site generation
- Prerender retreat pages at build time
- Or use prerender.io service
- Fallback for dynamic routes

### 5.2 Full SSR implementation
- Server-side rendering for all routes
- Hydrate on client
- Requires infrastructure changes

---

## Checklist

- [ ] robots.txt created
- [ ] sitemap.xml created
- [ ] canonical tags added
- [ ] react-helmet-async installed
- [ ] Dynamic titles/descriptions for retreats
- [ ] Schema.org Organization markup
- [ ] Schema.org Event markup for retreats
- [ ] Schema.org Review markup for testimonials
- [ ] Hreflang tags implemented
- [ ] Images converted to WebP
- [ ] Search Console verified
- [ ] Sitemap submitted to Search Console
