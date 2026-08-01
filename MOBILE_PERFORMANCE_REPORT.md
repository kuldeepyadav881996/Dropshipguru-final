# Mobile Performance Report — Dropship Guru

**Role:** Senior Performance Engineer
**Scope:** `index.html` (homepage) — mobile profile
**Test target:** Mid-range Android (e.g. Moto G / Galaxy A-class), **4G (≈1.6 Mbps, 150 ms RTT)**, **4× CPU throttling** (Lighthouse "Mobile" preset equivalent).
**Date:** 2026-08-01
**Method:** Static production audit. Metric values are engineering **estimates** from measured payload/DOM/effect counts (no live Lighthouse run possible in this environment). Every number is backed by a measured file fact.

> **Note:** No code was modified. This is analysis only.

---

## 1. What already helps mobile (credit where due)
The codebase already includes partial mobile tuning — the audit accounts for it:

| Mitigation | Count | Effect |
|---|---:|---|
| `@media (max-width:767.98px)` mobile block | 1 large block | disables some effects < 768px |
| `prefers-reduced-motion` guards | 9 | respects OS reduce-motion |
| `animation:none` (mobile/reduced) | 19 | kills some decorative motion |
| `backdrop-filter:none` (mobile) | **only 4** of 44 | most blurs still active ⚠️ |
| `IntersectionObserver` | 6 | pauses/loads off-screen work |
| `content-visibility` | 1 | one section skips render |
| `loading="lazy"` images | 11 | defers below-fold images |
| Hero `<picture>` → `hero-character-mobile.webp` | 36.8 KB | correct mobile LCP asset ✅ |

**The gap:** mitigation is *partial* — only **4 / 44** backdrop-filters and **19 / 291** animations are neutralized on mobile, so most paint-heavy effects still run on the throttled device.

---

## 2. Measured Facts that hurt most on mobile

| Factor | Measured | Why it hurts a mid-range Android |
|---|---:|---|
| Inline CSS to parse | **~198 KB** | CSS parse is CPU-bound → 4× slower; delays first paint a lot |
| DOM nodes | **~1,884** | style recalc & memory scale with node count; > 1,400 = Lighthouse flag |
| `backdrop-filter` blur (above fold) | **sticky nav blur(28px)**, hero cards blur(14–22px) | real-time GPU blur on scroll = jank/low FPS |
| `box-shadow` | **226** | large-radius shadows are expensive raster on mobile GPU |
| `animation` / `@keyframes` | **291 / 85** | compositor + main-thread; only 19 disabled on mobile |
| `will-change` | **37** | forces many compositor layers → memory pressure / eviction |
| `radial-gradient` | **155** | gradient rasterization cost |
| Forced preloader delay | **600 ms** | adds 600 ms before hero reveal on top of slow network |
| JS (not deferred) | **~60 KB**, `defer:0` | 4× slower execution → longer TBT |

---

## 3. Estimated Mobile Core Web Vitals

*(4G + 4× CPU throttle.)*

| Metric | Estimate | Rating | Primary driver |
|---|---:|:--:|---|
| **FCP** | ~2.5 – 3.5 s | 🟠 | 198 KB inline CSS parse on throttled CPU + Google Fonts fetch |
| **LCP** | ~3.8 – 5.5 s | 🔴 | CSS parse + font + **600 ms preloader** + hero WebP (37 KB) decode |
| **TBT** | ~400 – 800 ms | 🔴 | ~60 KB JS @4× + SVG injection + style recalc over 1,884 nodes w/ 226 shadows |
| **CLS** | ~0.03 – 0.08 | 🟢/🟡 | hero sized; risk from font swap + `Fraunces`/`Bebas` fallback reflow |
| **Speed Index** | ~4.0 – 6.0 s | 🔴 | preloader + heavy paint |
| **Est. Lighthouse Mobile score** | **~55 – 70** | 🟠 | held down by CSS weight, DOM size, blur/shadow paint |

---

## 4. Lag-Source Diagnosis (per requested checks)

| Check | Finding |
|---|---|
| **Heavy animations** | 291 animations / 85 keyframes; only 19 disabled < 768px. Ambient glows/particles/gradients still animate on mobile in several sections. |
| **Expensive blur / backdrop-filter** | **44 total, only 4 disabled on mobile.** Worst offenders are **above the fold**: sticky nav `blur(28px) saturate(180%)` (re-rasterized every scroll frame) and hero trust-cards `blur(14–22px)`. |
| **Expensive box-shadows** | 226 declarations; many large-radius/multi-layer (e.g. `0 30px 90px`) shadows on cards → costly raster + repaint on scroll. |
| **Paint / repaint issues** | Sticky blurred nav + fixed `#constellation-bg` + animated gradients force repeated compositing/repaint during scroll. |
| **Layout shifts** | Low overall (hero has intrinsic size). Residual risk: web-font swap and unloaded `Fraunces`/`Bebas Neue` headings reflowing to fallback metrics. |
| **Long tasks (>50 ms)** | Likely during: (a) initial CSS parse, (b) `brand-icons.js` SVG injection, (c) gallery/catalogue DOM build. Expect 2–4 long tasks contributing the ~400–800 ms TBT. |
| **Excessive DOM size** | **~1,884 nodes > 1,400** → flagged; inflated by pre-rendered (hidden) catalogue/gallery items. |
| **Render-blocking resources** | 198 KB inline CSS (parse-blocking) + Google Fonts CSS + `brand-icons.css` in `<head>`. |

---

## 5. Top 10 Mobile Bottlenecks (ranked by impact)

| # | Bottleneck | Evidence | Impact |
|---|---|---|:--:|
| 1 | **198 KB inline render-blocking CSS** (parse-bound, 4× on mobile CPU) | 202,458 chars | 🔴 Critical |
| 2 | **Above-fold `backdrop-filter` blur** (nav blur(28px) + hero cards), only 4/44 disabled | measured | 🔴 Critical |
| 3 | **600 ms forced preloader delay** | `setTimeout(…,600)` | 🔴 High (LCP) |
| 4 | **226 box-shadows / 155 radial-gradients** raster cost | measured | 🔴 High (paint/FPS) |
| 5 | **Excessive DOM ~1,884 nodes** | > 1,400 | 🟠 Medium |
| 6 | **291 animations, only 19 gated on mobile** | measured | 🟠 Medium |
| 7 | **~60 KB JS not deferred** (`defer:0`) | measured | 🟠 Medium (TBT) |
| 8 | **37 `will-change` → excess compositor layers/memory** | measured | 🟡 Low-Med |
| 9 | **Google Fonts blocking + 2 unused families** | `Fraunces`/`Bebas` | 🟡 Low |
| 10 | **Catalogue JPGs 2.5 MB (not WebP)** on gallery interaction | 87 files | 🟡 Low (lazy) |

---

## 6. Recommended Fixes — Ranked by Impact (Mobile)

> Estimates are **incremental** on the throttled mobile profile.

| Rank | Fix | Effort | Expected mobile improvement |
|---|---|:--:|---|
| 1 | **Critical-CSS split**: inline ~15–25 KB above-fold rules, defer the rest (`preload`/async). | M | **FCP −0.8–1.4 s, LCP −0.8–1.3 s, TBT −60–120 ms** |
| 2 | **Disable/greatly reduce `backdrop-filter` < 768px** (extend the existing `backdrop-filter:none` from 4 → all above-fold blurs; use solid `rgba` nav). | S | **Scroll FPS to ~60, TBT −80–150 ms, paint ↓ large** |
| 3 | **Remove the 600 ms preloader `setTimeout`** (hide on load). | S | **LCP −0.4–0.6 s** |
| 4 | **Flatten heavy shadows on mobile** (single small-radius shadow or border) + cap large-radius `box-shadow`. | M | **Paint/SI ↓, TBT −40–80 ms** |
| 5 | **Gate all decorative animations < 768px** (blanket `animation:none` for `.*-glow/.*-particle/gradient` layers; extend from 19 → all). | S | **TBT −40–90 ms, battery ↓** |
| 6 | **`defer` all bottom scripts**; lazy-init gallery/catalogue only when scrolled into view. | S | **TBT −60–120 ms** |
| 7 | **Reduce DOM**: build catalogue/gallery nodes on demand (they're pre-rendered hidden). | M | Recalc/memory ↓; **TBT −30–70 ms** |
| 8 | **Cut `will-change` to only actively-animating elements**; remove idle promotions. | S | Memory ↓, fewer layer evictions |
| 9 | **`preload` real fonts + drop `Fraunces`/`Bebas` references.** | S | −1 blocking chain; **−0.1–0.3 s** |
| 10 | **Convert catalogue JPGs → WebP** (gallery). | M | Gallery transfer −60–70% (post-LCP) |

**Projected mobile score after Fixes 1–5:** **~78 – 88** (from ~55–70), with visibly smoother 60 FPS scroll.

---

## 7. Highest-Leverage Summary (both platforms)
If only **three** changes are made, do these — they move every metric on both profiles:
1. **Critical-CSS split** (removes the 198 KB parse-block).
2. **Kill above-the-fold `backdrop-filter` blur on mobile** (removes scroll jank).
3. **Delete the 600 ms preloader delay** (direct LCP win).

*Desktop companion analysis is in `DESKTOP_PERFORMANCE_REPORT.md`.*
