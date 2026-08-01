# Performance Optimization Report — Phase 1

**Project:** DropshipGuru (static site)
**Scope:** Production performance optimization with **zero visual/design change**.
**Constraint honored:** No deploy, no push. All changes are local only.
**Safety net:** This is **not a git repository**, so every original file was copied to `_perf-backup/` before being modified. Nothing was hard-deleted — "removed" assets were **moved** to `_perf-backup/removed/` and can be restored instantly.

---

## 1. Executive Summary

| Metric | Before | After | Reduction |
|---|---:|---:|---:|
| **`index.html` (homepage document)** | 3,773 KB | **332 KB** | **−91%** |
| Homepage inline base64 images | 2.48 MB (in HTML) | 0 (moved to 23 external WebP) | −100% inline |
| Optimized raster images (catalogue + logo + hero) | 10.76 MB | **0.84 MB** | **−92%** |
| `logo.png` | 996 KB | **60.5 KB** | −94% |
| Hero image delivered | 664 KB (PNG) | **44.6 KB** (WebP) | −93% |
| External JS + CSS + inline `<style>` | 718 KB | 605 KB | −16% |
| Unused assets removed from shipped tree | — | **12.8 MB moved out** | — |
| **Total bytes eliminated from the site** | — | — | **≈ 24 MB** |

**Headline result:** The homepage HTML document shrank from **3.77 MB to 0.33 MB**. Because that 3.4 MB of inline base64 was previously parsed and blocked the main thread before anything could render, this is the single largest win for **LCP** and **Time to Interactive**.

---

## 2. What Was Changed (task by task)

### 2.1 Convert JPG/PNG > 150 KB to WebP + resize to displayed dimensions
Re-encoded **in place, keeping the exact same filenames**, so every dynamically-built reference (`assets/catalogues/<folder>/<file>` in `product-gallery.js`) keeps working via browser image content-sniffing — the same technique the project already used (`Kitchen *.jpg` were already WebP bytes). Oversized print-resolution images were capped to a 1600 px long edge.

| File | Before | After | Dimensions |
|---|---:|---:|---|
| `assets/catalogues/Home Decor/01.jpg` | 1692.8 KB | 96.5 KB | 2480×3509 → 1131×1600 |
| `assets/catalogues/Home Decor/02.jpg` | 944.9 KB | 27.2 KB | 2480×3509 → 1131×1600 |
| `assets/catalogues/Home Decor/03.jpg` | 1104.0 KB | 43.8 KB | 2480×3509 → 1131×1600 |
| `assets/catalogues/Home Decor/04.jpg` | 1372.2 KB | 50.5 KB | 2480×3509 → 1131×1600 |
| `assets/catalogues/Home Decor/05.jpg` | 980.4 KB | 36.7 KB | 2480×3509 → 1131×1600 |
| `assets/catalogues/Home Decor/06.jpg` | 1643.8 KB | 74.4 KB | 2480×3509 → 1131×1600 |
| `assets/catalogues/Hnad Bag/01.jpg` | 241.9 KB | 58.4 KB | 1066×1600 |
| `assets/catalogues/Hnad Bag/02.jpg` | 192.2 KB | 58.1 KB | 1600×1199 |
| `assets/catalogues/Hnad Bag/03.jpg` | 384.5 KB | 169.0 KB | 1600×1066 |
| `assets/catalogues/Hnad Bag/04.jpg` | 229.1 KB | 80.4 KB | 1600×1066 |
| `assets/catalogues/Hnad Bag/05.jpg` | 152.7 KB | 31.4 KB | 1153×1600 |
| `assets/catalogues/Hnad Bag/06.jpg` | 420.3 KB | 24.2 KB | 840×900 |

### 2.2 Replace inline Base64 images with external optimized files
All **23** inline base64 blobs in `index.html` (≈ **2.48 MB**) were extracted to `assets/inline/inline-01.webp … inline-23.webp` (total **1.32 MB** WebP) and each `src="…"` / `url(…)` reference was rewritten to point at the external file.

- 16 blobs were CSS `background-image` (category/product card art), capped to ≤ 1200 px.
- 7 blobs were `<img>` product photos (already carry `loading="lazy"`).
- The 8 remaining `data:image/svg+xml` URIs are tiny inline vector graphics (noise textures, icons) and were **intentionally left inline** — externalizing them would add HTTP requests for no benefit.

**Benefit:** These images are now cacheable, downloaded in parallel, and no longer block HTML parsing. Below-the-fold art is fetched only when needed.

### 2.3 Compress logo and hero
- **`logo.png`**: 1254×1254 → 512×512 optimized PNG, **996 KB → 60.5 KB (−94%)**. Kept as a **real PNG** on purpose — it is the `favicon` (declared `type="image/png"`) and the `og:image`/`twitter:image`, which social scrapers validate by format. Display size is ≤ 120 px, so 512 px remains crisp on retina.
- **`hero-character.png`** → new **`hero-character.webp`** (595×1009, alpha), **664 KB → 44.6 KB (−93%)**. Wired into the existing `<picture>` as a desktop `<source>`; the original PNG stays as the ultimate fallback. Mobile already used `hero-character-mobile.webp`.

### 2.4 Lazy loading
Audited every `<img>` in `index.html`. All non-critical images already carry `loading="lazy"` (7 product images, footer logo, and the gallery/lightbox `<img>` elements). The hero keeps `loading="eager"` + `fetchpriority="high"` (correct — it is the LCP element). Above-the-fold header logos are intentionally not lazy. **No changes needed; verified compliant.**

### 2.5 Remove duplicate / dead assets (moved to `_perf-backup/removed/`)
- `assets/categories/photos/` — seven 1.5–2.2 MB source PNGs (**12.8 MB**) that were the design originals for the now-externalized card art. **Not referenced by any shipped page** (only by the audit doc and a dead scratch file).
- `_user-categories.html` — dead scratch page, not linked anywhere.

### 2.6 Minify CSS & JS
External files minified in place (originals in `_perf-backup/originals/`), plus inline `<style>` blocks in the two large HTML files. **Inline `<script>` blocks were deliberately left unminified** to guarantee zero behavioral change on a production payment-flow site.

| File | Before | After | Reduction |
|---|---:|---:|---:|
| `brand-icons.js` | 28.2 KB | 22.3 KB | −21% |
| `product-gallery.js` | 18.7 KB | 10.2 KB | −46% |
| `jewellery-catalogue.js` | 10.5 KB | 5.9 KB | −44% |
| `catalogues-data.js` | 2.2 KB | 1.4 KB | −39% |
| `google-sheet-submit.js` | 6.3 KB | 3.2 KB | −49% |
| `legal-page.js` | 3.2 KB | 1.8 KB | −44% |
| `brand-icons.css` | 16.0 KB | 12.6 KB | −22% |
| `product-gallery.css` | 15.5 KB | 12.0 KB | −23% |
| `jewellery-catalogue.css` | 11.4 KB | 8.9 KB | −22% |
| `legal-page.css` | 8.0 KB | 6.2 KB | −23% |
| `index.html` inline `<style>` | 385.4 KB | 331.9 KB | −14% |
| `consultation.html` inline `<style>` | 212.5 KB | 188.3 KB | −11% |

**Verification:** All JS modules are self-initializing IIFEs bound to DOM elements. The one cross-file API (`GoogleSheetSubmit.submitToGoogleSheet`, called by `consultation.html`) and the Google Apps Script URL were confirmed intact after mangling; `window.ProductGallery` assignment preserved.

---

## 3. Impact on Core Web Vitals (estimated)

| Metric | Expected effect | Why |
|---|---|---|
| **LCP** | Large improvement | Homepage document 3.77 MB → 0.33 MB; hero delivered as 44 KB WebP instead of 664 KB PNG. Far less parse/decode before first paint. |
| **TBT / TTI** | Large improvement | 3.4 MB of base64 no longer decoded on the main thread during HTML parse. |
| **Total transfer (first load)** | Large improvement | Critical bytes drop from ≈ 4.8 MB to ≈ 0.45 MB (HTML + hero + logo); remaining art loads lazily/deferred. |
| **CLS** | Neutral / unchanged | No layout structure changed; hero keeps explicit `width`/`height`. |
| **Cache efficiency** | Improved | Images are now separate cacheable resources instead of embedded in the HTML on every visit. |

---

## 4. Intentionally Deferred (with rationale)

**Aggressive removal of unused CSS rules / JS branches** was **not** performed. Purging individual selectors from a 330 KB hand-written stylesheet without a full visual-regression pass is the highest-risk change for a "pixel-perfect identical" requirement (dynamic classes, `:hover`/`:has` states, JS-toggled classes, and print/media variants are easy to misjudge as "unused"). Minification already stripped comments, whitespace, and in-file duplication safely. A dedicated coverage-based purge (e.g., PurgeCSS with a rendered-DOM safelist) is recommended as **Phase 2** with before/after screenshot diffing.

---

## 5. Files Modified / Added / Moved

**Modified in place:** `index.html`, `consultation.html`, `logo.png`, 12 catalogue images, 6 external JS files, 4 external CSS files.
**Added:** `hero-character.webp`, `assets/inline/inline-01…23.webp` (23 files), `PERFORMANCE_REPORT.md`, helper scripts in `scripts/`.
**Moved to `_perf-backup/removed/`:** `assets/categories/photos/` (12.8 MB), `_user-categories.html`.

### How to revert
Every original lives under `_perf-backup/originals/` (mirrored paths). Moved assets are in `_perf-backup/removed/`. Copy any file back to restore its pre-optimization state. Machine-readable diffs: `_perf-backup/image-results.json`, `base64-results.json`, `minify-results.json`.

---

## 6. Recommended Next Steps (Phase 2)
1. Coverage-based unused-CSS purge with screenshot diffing.
2. Convert the remaining smaller catalogue thumbnails (< 150 KB HEIF/JPEG) to WebP for consistency.
3. Add long-cache headers / content hashing to filenames at the hosting layer.
4. Consider a proper `og:image` at 1200×630 (currently the square logo) — SEO polish, not performance.
5. Once satisfied, delete `_perf-backup/` before shipping (it is local-only and not referenced).
