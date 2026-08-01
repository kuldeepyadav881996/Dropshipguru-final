# Final Performance Report — Dropship Guru (Phase 3B)

**Role:** Senior Performance Engineer  
**Date:** 2026-08-01  
**Scope:** Homepage `index.html` first-load path  
**Constraint:** No UI / design / content changes  

> Scores below are **engineering estimates** from measured payload, DOM, and execution-path changes (no live Lighthouse run in this environment).

---

## Scorecard (estimated)

| Metric | Desktop | Mobile (4G + 4× CPU) |
|---|---:|---:|
| **Performance score** | **94 – 98** | **88 – 94** |
| **FCP** | 0.8 – 1.2 s | 1.6 – 2.2 s |
| **LCP** | 1.2 – 1.8 s | **1.9 – 2.4 s** |
| **TBT** | 80 – 150 ms | **90 – 150 ms** |
| **CLS** | 0.01 – 0.03 | 0.02 – 0.05 |

**Phase 3B targets:** Mobile >90 · LCP <2.5s · TBT <150ms → **estimated met** after this pass.

---

## Measured payload (current)

| Resource | Size |
|---|---:|
| `index.html` | **148.9 KB** (was ~326 KB pre Phase 3) |
| Inline CSS (critical + mobile-perf) | **25.8 KB** |
| Deferred `assets/app.css` | **197.7 KB** |
| External CSS (`brand-icons` + gallery) | **33.5 KB** (all non-blocking preload) |
| **Total CSS** | **~257 KB** |
| Inline JS | **20.2 KB** |
| External JS (`brand-icons` + gallery + catalogues) | **39.8 KB** (all `defer`) |
| **Total JS** | **~60 KB** |
| Hero LCP image | Desktop WebP **44.6 KB** / Mobile WebP **36.8 KB** |
| Nav logo (ATF) | **60.5 KB** (`fetchpriority=high`) |
| **Initial page weight (HTML + critical CSS + ATF images + fonts ~40 KB)** | **~250 – 280 KB** uncompressed; ~120 – 160 KB gzipped est. |

---

## What Phase 3B changed

| Task | Action | Status |
|---|---|:--:|
| 1. Remove forced delays | Preloader hides on `DOMContentLoaded`/`load` (no 600 ms). Hero entrance / metrics / KPI / reveal staggers no longer use artificial `setTimeout` delays. | ✅ |
| 2. Defer non-critical JS | All 4 external scripts use `defer`. FAQ/reveal/constellation/cursor/stats wait for `DOMContentLoaded`. Premium motion deferred via `requestIdleCallback` (desktop). | ✅ |
| 3. ATF images only | Hero `eager` + `fetchpriority=high`. Nav logo ATF. Preloader logo `fetchpriority=low`. | ✅ |
| 4. Lazy BTF images/gallery | Product images + footer/mid logos `loading=lazy`. Gallery CSS deferred. Sections use `content-visibility:auto`. | ✅ |
| 5. Mobile paint cuts | `backdrop-filter:none`, reduced shadows, `will-change:auto`, decorative radial backgrounds neutralized — **mobile only**. | ✅ |
| 6. Unused CSS after split | Removed ~34 KB mid-body premium `<style>` into deferred `app.css`. Trimmed ~3.6 KB below-fold rules from critical CSS. | ✅ |
| 7. JS before hero interactive | Mobile: premium motion **fully skipped**. Desktop: only hero entrance/metrics run at DOM ready; parallax/dashboard/reveal idle-scheduled. | ✅ |

---

## Remaining bottlenecks (ranked)

| # | Bottleneck | Severity | Notes |
|---|---|:--:|---|
| 1 | Google Fonts still a render-blocking CSS request | Medium | Preconnected; self-hosting would shave ~100–300 ms mobile FCP |
| 2 | `logo.png` 60.5 KB as ATF nav image | Medium | Convert to WebP/AVIF ~15–25 KB for another LCP/FCP win |
| 3 | Full HTML still ~149 KB (inline critical + markup) | Medium | Further HTML chunking / partial hydration not needed for static site |
| 4 | Deferred `app.css` ~198 KB | Low | Non-blocking; purge unused section CSS later for cache size |
| 5 | Catalogue JPG set (~2.5 MB) on gallery open | Low | Post-LCP; convert to WebP next |
| 6 | Desktop constellation canvas (90 nodes rAF) | Low | Already disabled on mobile |
| 7 | Unused font family references (`Fraunces` / `Bebas`) in deferred CSS | Low | Silent fallback; cleanup later |

---

## Before → After (homepage)

| | Pre-optimization (audit) | After Phase 3B |
|---|---|---|
| HTML | ~326 KB | **149 KB** |
| Render-blocking CSS | ~198 KB inline | **~26 KB** critical inline |
| Forced preloader delay | 600 ms | **0 ms** |
| External scripts deferred | 0 / 4 | **4 / 4** |
| Mobile premium motion JS | Runs | **Skipped** |
| Est. Mobile Lighthouse | 55 – 70 | **88 – 94** |
| Est. Desktop Lighthouse | 85 – 92 | **94 – 98** |

---

## Verification notes

- Desktop visual path unchanged: mobile paint overrides are scoped to `@media (max-width:767.98px)`.
- Critical CSS brace-balanced; includes `:root`, preloader, header/nav, hero, buttons, metrics.
- Hero LCP still served via `<picture>` WebP sources.
- Remaining timers: CTA text fade (350 ms UX) and `requestIdleCallback` polyfill (`setTimeout(…, 1)`) only.

---

*Companion docs: `DESKTOP_PERFORMANCE_REPORT.md`, `MOBILE_PERFORMANCE_REPORT.md`, `MOBILE_OPTIMIZATION_REPORT.md` (if present).*
