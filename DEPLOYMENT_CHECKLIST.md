# Deployment Checklist — DropshipGuru

**Target:** https://dropshipguru.in (static site)
**Date:** 2026-08-01
**Status:** Prepared for production. **Not deployed, not pushed** (per instructions).

> This is a **static HTML/CSS/JS site**. Any static host works (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3+CloudFront, Hostinger, cPanel). No server runtime is required. The consultation form posts to a Google Apps Script Web App (no backend to deploy).

---

## 1. Pre-Deploy Verification

- [x] Legal pages rebuilt from template (`node _build-legal-pages.js`)
- [x] `scripts/verify-production.js` passes — **0 broken links, 0 invalid JSON-LD, canonicals present, no placeholders**
- [x] Placeholder contact links fixed (`consultation.html`)
- [x] Favicons, `site.webmanifest`, `robots.txt`, `sitemap.xml` present
- [ ] Open each page locally and confirm no console errors
- [ ] Confirm the registered business address in `contact/index.html` matches incorporation records

---

## 2. Files to DEPLOY (publish)

```
index.html            consultation.html      plan-details.html
about/                contact/               privacy-policy/
terms-conditions/     refund-policy/
assets/               (catalogues, inline, icons, logo/)
brand-icons.css  brand-icons.js
product-gallery.css  product-gallery.js
jewellery-catalogue.css  jewellery-catalogue.js
catalogues-data.js  google-sheet-submit.js  legal-page.js  legal-page.css
logo.png  hero-character.png  hero-character.webp  hero-character-mobile.webp
favicon.ico  site.webmanifest  robots.txt  sitemap.xml
```

## 3. Files/Folders to EXCLUDE from deploy

| Exclude | Why |
|---|---|
| `_perf-backup/` | Local originals/backups (large, private) |
| `node_modules/`, `package-lock.json`, `.package-lock.json` | Local dev tooling only |
| `dropshipguru-landing/` | Separate/unused Next.js project |
| `scripts/` | Build/verification helpers |
| `_build-legal-pages.js`, `_scan-galleries.js` | Build-time scripts |
| `legal/content/` | Source partials for the legal builder |
| `*.md` (`WEBSITE_AUDIT_REPORT`, `PERFORMANCE_REPORT`, `SEO_REPORT`, checklists) | Internal docs |
| `DropshipGuru_*.txt` | Policy source text (PDF sources) |

> `robots.txt` already disallows `/_perf-backup/`, `/scripts/`, and `/legal/content/` as a safety net, but they should not be uploaded at all.

---

## 4. Hosting / Server Configuration

- [ ] **HTTPS/SSL** enabled and forced (HTTP → HTTPS redirect)
- [ ] Canonical host redirect: pick one of `www` / non-`www` and 301 the other (canonicals use non-`www`: `https://dropshipguru.in/`)
- [ ] **Clean URLs**: ensure `/about/`, `/contact/`, `/privacy-policy/`, `/terms-conditions/`, `/refund-policy/` serve their `index.html`
- [ ] `.webmanifest` served as `application/manifest+json`
- [ ] Compression (gzip/Brotli) enabled for HTML/CSS/JS
- [ ] Cache headers: long (`max-age=31536000, immutable`) for `assets/`, images, icons; short/no-cache for `.html`
- [ ] **Custom 404 page** — none exists yet (recommend adding `404.html`)

---

## 5. Forms / Integrations

- [ ] Consultation form endpoint reachable: `google-sheet-submit.js` posts to the Google Apps Script Web App (`script.google.com/a/macros/dropshipguru.info/...`)
- [ ] Apps Script deployment access = **Anyone**; submit a live test and confirm the row lands in the Google Sheet
- [ ] Success/error toast displays correctly after submit
- [ ] WhatsApp (`wa.me/917428329102`), phone, and email links open correctly on mobile

---

## 6. Post-Deploy Smoke Test

- [ ] Home, consultation, plan-details, about, contact, all 3 policy pages load
- [ ] Catalogue galleries open and images render (WebP-in-`.jpg` served correctly)
- [ ] Favicon shows in tab; manifest installs (Chrome “Install app”)
- [ ] `https://dropshipguru.in/robots.txt` and `/sitemap.xml` load
- [ ] Social preview correct (LinkedIn Post Inspector / X Card Validator / Facebook Sharing Debugger)
- [ ] Google Search Console: verify property, submit sitemap
- [ ] Lighthouse: Performance / SEO / Best Practices / Accessibility ≥ 90

---

## 7. Version Control (recommended)

This folder is **not a git repository**. Before/after deploying, consider:
```
git init
git add .            # node_modules/, dist/, build/, .cache/ already in .gitignore
git commit -m "Production-ready: Phase 1 perf + Phase 2 SEO"
```
> Do this only when you're ready — you asked not to push yet.
