# DropshipGuru — Frontend Performance & Premium UI Report

**Date:** 2026-08-02  
**Scope:** Static frontend (`index.html`, `consultation.html`, shared assets)  
**Constraint:** Razorpay, Google Sheets, backend API, forms, SEO URLs preserved

---

## Summary

Consultation page HTML was cut roughly in half by extracting ~104 KB of inline CSS. Critical path scripts are deferred; fonts slimmed; CSS split into `base / components / layout / mobile / premium-ui`; motion moved to GPU transforms with `prefers-reduced-motion` respect. Hero already uses WebP (`~45 KB` / `~37 KB` mobile) with PNG fallback.

| Metric | Before (approx) | After (approx) |
|--------|-----------------|----------------|
| `consultation.html` | ~194 KB | **~89 KB** |
| Inline CSS on consultation | ~104 KB (3 blocks) | **~0.3 KB critical** |
| Google Font weights | Inter 4 + Playfair 3 | **Inter 3 + Playfair 1** |
| Hero LCP image | PNG ~680 KB | **WebP ~45 KB** (already wired) |

---

## Files modified / added

### Added
- `assets/consultation.css`
- `assets/consultation-footer.css`
- `assets/consultation-motion.css`
- `assets/base.css`
- `assets/components.css`
- `assets/layout.css`
- `assets/mobile.css` (from `mobile-layout.css` + extra breakpoints)
- `scripts/extract-consult-css.js`
- `scripts/verify-perf-hooks.js`
- `PERFORMANCE_REPORT.md` (this file)

### Updated
- `consultation.html` — CSS extract, async non-critical CSS, deferred payment/Sheets JS, GPU scroll/cursor, reduced-motion guards
- `index.html` — font slim, CSS architecture links, GPU cursor glow, `assets/mobile.css`
- `assets/premium-ui.css` — order summary, trust chips, overlay motion, scroll bar `scaleX`
- `assets/premium-ui.js` — rAF-throttled scroll handlers
- `mobile-layout.css` — compat shim → `@import assets/mobile.css`
- Font links on legal pages + `plan-details.html` + `_build-legal-pages.js`

---

## Performance gains

| Area | Change |
|------|--------|
| **CSS removed from HTML** | ~104 KB moved to cacheable external files |
| **JS critical path** | `google-sheet-submit.js` + `payment-client.js` now `defer` (Razorpay still lazy-loaded inside client) |
| **Fonts** | Dropped Inter 500 + Playfair 500/700 → fewer font files |
| **Layout thrash** | Scroll progress uses `transform: scaleX`; cursor glow uses `translate3d` |
| **Mobile paint** | Ambient blobs / cursor / constellation already skipped ≤768px; reinforced in `mobile.css` |
| **Duplicate CSS load** | Index end-of-body no longer only-pairs mobile; architecture files load once at end as sync fallback |

### Bundle / transfer (selected)

| Asset | Size |
|-------|------|
| `assets/app.css` | ~205 KB (legacy; still async-preloaded on index) |
| `assets/consultation.css` | ~92.5 KB |
| `assets/premium-ui.css` | ~14 KB+ |
| `assets/mobile.css` | ~9 KB |
| `hero-character.webp` | ~44.6 KB |
| `hero-character-mobile.webp` | ~36.8 KB |

---

## Lighthouse estimates (lab-style, not CI-measured)

These are **engineering estimates** after the above changes. Run Chrome Lighthouse locally after deploy for authoritative numbers.

| Page | Desktop (est.) | Mobile (est.) |
|------|----------------|---------------|
| `index.html` | **92–96** | **86–92** |
| `consultation.html` | **93–97** | **88–93** |

**Why not guaranteed ≥95/90 yet**
- `assets/app.css` remains large (~205 KB)
- Index still carries a large inline critical CSS block + preloader
- Catalogue JS/CSS still deferred but heavy when opened
- Third-party fonts + Razorpay checkout (on paid path) affect mobile TBT/LCP variance

**Core Web Vitals (expected)**
- **LCP:** Improved via WebP hero + deferred non-critical CSS on consultation  
- **CLS:** Dimensions already on hero; sticky/mobile layout contained  
- **INP:** Passive + rAF scroll; fewer left/top updates  

---

## Payment / integrations verification

| Check | Status |
|-------|--------|
| `DropshipGuruPayments.startCheckout` present | OK |
| `payment-client.js` deferred (loads before interact) | OK |
| `google-sheet-submit.js` deferred | OK |
| API base hostname-aware (local vs Render) | OK (unchanged logic) |
| Razorpay script lazy-loaded inside payment client | OK |
| Premium overlays only after verify | OK |
| Syntax check `payment-client.js` / Sheets / `premium-ui.js` | OK |

---

## Mobile responsiveness

`assets/mobile.css` covers ≤768px layout fixes plus refinements for **320 / 360 / 375 / 390 / 414 / 430**, tablet **768–1024**, and overflow clipping. Sticky submit CTA retained on consultation.

---

## Remaining recommendations (next pass)

1. **Split/minify `assets/app.css`** into critical + route chunks; remove dead selectors (largest remaining win).  
2. **Shorten or remove preloader** on index (hurts LCP perception).  
3. **Self-host Inter/Playfair** with `font-display: swap` + `preload` woff2 subset.  
4. **Compress PNG fallback** `hero-character.png` or serve only WebP for modern browsers.  
5. **Run Lighthouse CI** on production URLs after GitHub Pages + Render deploy.  
6. Optional: extract consultation inline JS (~40 KB) to `assets/consultation.js` with `defer`.

---

## Production readiness score

**90 / 100** (frontend performance + UX polish)

| Factor | Score |
|--------|-------|
| Functionality preserved (payment/Sheets/API) | 10/10 |
| Critical-path reduction | 9/10 |
| CSS architecture | 8/10 |
| Mobile layout | 9/10 |
| Motion / CWV hygiene | 8/10 |
| Measured Lighthouse proof | 6/10 (estimated only) |
| Legacy CSS debt (`app.css`) | 7/10 |

Deploy frontend + keep Render API unchanged. Re-run Lighthouse on `https://dropshipguru.in/` and `/consultation.html` after publish to confirm Desktop ≥95 / Mobile ≥90.
