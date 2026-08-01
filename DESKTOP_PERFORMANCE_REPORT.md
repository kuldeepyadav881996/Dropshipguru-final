# Desktop Performance Report — Dropship Guru

**Role:** Senior Performance Engineer
**Scope:** `index.html` (homepage) — desktop profile
**Date:** 2026-08-01
**Method:** Static production audit (exact measurements from source + assets on disk). Metric values are engineering **estimates** derived from measured payload/DOM/effect counts — this environment cannot execute a live Lighthouse/DevTools run. Every number below is backed by a measured file fact.

> **Note:** No code was modified. This is analysis only.

---

## 1. Measured Facts (ground truth)

| Metric | Measured value | Notes |
|---|---:|---|
| `index.html` size | **326 KB** (326,146 B) | uncompressed; ~90–100 KB gzip est. |
| Inline `<style>` CSS | **~198 KB** (202,458 chars, 2 blocks) | render/parse-blocking in `<head>` |
| Inline `<script>` JS | **~19.4 KB** (19,873 chars, 3 blocks) | |
| DOM elements | **~1,884** | exceeds Lighthouse "excessive DOM" limit (1,400) |
| `box-shadow` declarations | **226** | paint cost |
| `backdrop-filter` declarations | **44** | expensive; several above the fold |
| `blur()` usages | **64** | |
| `animation` declarations | **291** | across **85** `@keyframes` |
| `will-change` | **37** | memory / layer promotion |
| `transition` | **125** | |
| `radial-gradient` / `linear-gradient` | **155 / 131** | paint cost |
| `<img>` tags | **15** (11 lazy, 1 eager hero) | |

**External requests from the page:**
| Resource | Size | Blocking? |
|---|---:|---|
| Google Fonts CSS (`Inter` + `Playfair Display`) | ~1–2 KB + font files | **Render-blocking** `<link>` (preconnected) |
| `brand-icons.css?v=3` | 12.6 KB | Render-blocking (`<head>`) |
| `brand-icons.js?v=10` | 22.3 KB | End of body, not deferred |
| `product-gallery.js?v=4` | 10.2 KB | End of body |
| `jewellery-catalogue.js` | 5.9 KB | End of body |
| `catalogues-data.js` | 1.4 KB | End of body |
| `product-gallery.css` / `jewellery-catalogue.css` | 12.0 / 8.9 KB | Injected before gallery (mid-body) |
| **Hero LCP** `hero-character.webp` (desktop) | **44.6 KB** | `<picture>` WebP, `fetchpriority=high`, eager ✅ |
| Hero PNG fallback `hero-character.png` | **664 KB** | Only served to non-WebP browsers (≈0% today) |

---

## 2. Estimated Desktop Core Web Vitals

*(Fast desktop CPU, cable/broadband, no throttling — Lighthouse "Desktop" preset equivalent.)*

| Metric | Estimate | Rating | Primary driver |
|---|---:|:--:|---|
| **FCP** | ~1.0 – 1.6 s | 🟢/🟡 | 198 KB inline CSS parse + Google Fonts |
| **LCP** | ~1.6 – 2.4 s | 🟡 | Hero WebP is small (45 KB) but **600 ms forced preloader delay** + CSS parse gate it |
| **TBT** | ~150 – 300 ms | 🟢/🟡 | ~60 KB JS + `brand-icons.js` SVG injection + style recalc over 1,884 nodes |
| **CLS** | ~0.02 – 0.05 | 🟢 | Hero has `width/height`; minor risk from font swap + unloaded `Fraunces` fallback |
| **Speed Index** | ~1.8 – 2.6 s | 🟡 | preloader + CSS |
| **Est. Lighthouse Desktop score** | **~85 – 92** | 🟢 | Good, held back mainly by CSS weight + preloader |

### Sub-metric breakdown
- **JavaScript execution time (desktop):** low-moderate. ~60 KB total JS; `brand-icons.js` mutates the DOM to inject inline SVGs on load. Fast on desktop CPU (~50–120 ms scripting).
- **CSS blocking time:** **the dominant desktop cost.** ~198 KB inline CSS must be parsed before first paint. Much is not used by the initial viewport (catalogue, gallery, FAQ, legal-flow rules all inline).
- **Image loading:** healthy — hero is a 44.6 KB WebP; below-fold images lazy-loaded. The 664 KB PNG and 143/132 KB PWA icons are on disk but not on the critical path.
- **Font loading:** `display=swap` avoids FOIT. Two families requested (`Inter`, `Playfair Display`). CSS also references **`Fraunces`** and **`Bebas Neue`** that are **never loaded** → those headings silently fall back to Georgia/serif (correctness gap, negligible perf).
- **Network requests:** lean for a page this size (1 HTML + Google Fonts + 2 CSS + 4 JS + hero). No third-party trackers/tag managers detected.
- **Memory usage:** elevated by 37 `will-change`, 85 `@keyframes`, and 44 `backdrop-filter` promoting many compositor layers; acceptable on desktop.
- **Main-thread blocking tasks:** style/layout recalculation over ~1,884 nodes with 226 shadows + 155 radial-gradients is the main recalc cost; brief on desktop.

---

## 3. Top 10 Desktop Bottlenecks (ranked by impact)

| # | Bottleneck | Evidence | Impact |
|---|---|---|:--:|
| 1 | **~198 KB render-blocking inline CSS** | 202,458 chars in 2 `<style>` blocks | 🔴 High |
| 2 | **600 ms forced preloader `setTimeout`** | `setTimeout(…hidden, 600)` | 🔴 High (LCP) |
| 3 | **Excessive DOM (~1,884 nodes)** | > 1,400 threshold | 🟠 Medium |
| 4 | **Google Fonts render-blocking + 2 unused families** | `Fraunces`/`Bebas Neue` referenced, not loaded | 🟠 Medium |
| 5 | **226 box-shadows + 155 radial-gradients** | measured | 🟠 Medium (paint) |
| 6 | **~60 KB JS not deferred** (`defer:0`) | scripts at body end, no `defer` | 🟡 Low-Med |
| 7 | **664 KB PNG hero fallback on disk** | rarely fetched but ships in repo | 🟡 Low |
| 8 | **PWA icons 143 KB + 132 KB** | `maskable-512`, `icon-512` | 🟡 Low |
| 9 | **brand-icons.css render-blocking in head** | 12.6 KB extra blocking request | 🟡 Low |
| 10 | **`brand-icons.js` runtime SVG injection** | 22.3 KB + DOM mutation on load | 🟡 Low |

---

## 4. Recommended Fixes — Ranked by Impact (Desktop)

> Estimates are **incremental** improvements to the metric noted.

| Rank | Fix | Effort | Expected desktop improvement |
|---|---|:--:|---|
| 1 | **Split critical vs. non-critical CSS**: inline only above-the-fold rules (~15–25 KB), move the rest to an external stylesheet loaded `media=print`→`onload` (or `rel=preload`). | M | **FCP −0.3–0.6 s, LCP −0.3–0.5 s**; Lighthouse "reduce unused CSS" cleared |
| 2 | **Remove the 600 ms preloader `setTimeout`**; hide preloader on `window.load` / first paint instead. | S | **LCP −0.4–0.6 s** (direct) |
| 3 | **Purge unused CSS** (PurgeCSS/manual) from the inline block — page carries catalogue/gallery/legal rules. | M | −60–120 KB CSS → **FCP −0.2–0.4 s** |
| 4 | **Self-host or `preload` the 2 real fonts; delete `Fraunces`/`Bebas Neue` references** (or load them). | S | Removes 1 blocking chain + fixes silent fallback; **−0.1–0.2 s** |
| 5 | **Add `defer` to `brand-icons.js`, `product-gallery.js`, etc.** | S | **TBT −30–80 ms** |
| 6 | **Reduce DOM**: the catalogue/gallery renders many hidden nodes — build them lazily on interaction. | M | Recalc + memory ↓; **TBT −20–50 ms** |
| 7 | **Trim shadow/gradient count** or precompute as flat colors where invisible. | M | Paint ↓; small SI gain |
| 8 | **Delete 664 KB PNG fallback** (WebP support is universal) or generate a smaller PNG. | S | Repo −664 KB (no runtime CWV change) |
| 9 | **Compress PWA icons** (512 pngs → ~30–40 KB each). | S | −180 KB transfer on install (no CWV change) |
| 10 | **Move `brand-icons.css` out of the blocking head chain** (inline its few critical rules). | S | −1 blocking request |

**Projected desktop score after Fixes 1–5:** **~94 – 98** (from ~85–92).

---

## 5. Housekeeping (not runtime, but ships in repo)
- `dropshipguru-landing/.next/` contains **~2 MB** of stray Next.js build chunks unrelated to this static site — exclude from deploy.
- `assets/catalogues/` = **2.54 MB across 87 JPGs** (not WebP). Lazy-loaded, so no LCP impact, but converting to WebP would cut gallery transfer ~60–70%.
- `assets/inline/` = **1.32 MB across 23 WebP** (already optimized; lazy).

---

*End of Desktop report. See `MOBILE_PERFORMANCE_REPORT.md` for the throttled mid-range Android analysis, where several of these costs become significantly more severe.*
