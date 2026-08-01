# DropshipGuru — Website Audit Report

**Audit date:** 1 Aug 2026
**Auditor roles:** Full‑Stack · Performance · SEO · UI/UX · Security · Payment‑Gateway Compliance
**Scope:** Static site at repository root (`index.html`, `consultation.html`, `plan-details.html`, `about/`, `contact/`, `privacy-policy/`, `terms-conditions/`, `refund-policy/`) plus supporting JS/CSS/assets.
**Method:** Read‑only static analysis of source, file sizes, and configuration. **No files were modified.** No runtime/Lighthouse profiling was run, so Core Web Vitals figures are *reasoned estimates* from payload/structure analysis, not measured values.

---

## 0. Executive Summary

The **public product is a static HTML site** (hand‑authored, no build step for the pages that ship except the legal‑page generator). It is visually polished and already has decent SEO/legal hygiene on most pages. However, it carries **severe payload bloat**, a **large amount of dead weight in the repo**, a few **functional bugs on the lead/checkout page**, and **missing production/SEO/security infrastructure**.

There is **no real payment integration** anywhere (no Cashfree/Razorpay/PhonePe/PayU SDK, no checkout, no order creation). Money is not collected on‑site; the site is a **lead‑generation funnel** that posts a form to a Google Apps Script → Google Sheet. "Payment‑gateway compliance" therefore reduces to **website‑verification readiness** (business identity, policies, contactability), which is largely in place after recent legal‑footer work.

### Overall scores (estimated)

| Area | Grade | Notes |
|---|---|---|
| Performance | 🔴 D | `index.html` is 3.77 MB; `logo.png` 996 KB; multi‑MB catalogue images |
| Project structure | 🔴 D | 620 MB dead Next.js app + 3.5 MB dead HTML in repo |
| Payment compliance | 🟡 C+ | No gateway integrated; verification metadata now mostly present |
| SEO | 🟢 B | Strong on most pages; gaps on `plan-details` & `consultation`; no robots/sitemap |
| Security | 🟡 C | No headers/CSP, unpinned CDN, open form endpoint |
| Accessibility | 🟢 B‑ | `lang`, alt, aria mostly good; form labels/contrast to verify |
| Mobile | 🟢 B | Good responsive + mobile perf passes; still heavy bytes |
| Production readiness | 🔴 D+ | Placeholder links, dead code, no host config, no root `package.json` |

### Issue count by severity

| Severity | Count |
|---|---|
| 🔴 Critical | 6 |
| 🟠 High | 9 |
| 🟡 Medium | 11 |
| 🟢 Low | 8 |

---

## 1. Severity Legend & Impact Model

- 🔴 **Critical** — Breaks functionality, blocks conversions, exposes security/compliance risk, or destroys performance for most users.
- 🟠 **High** — Significant negative impact on speed, ranking, security posture, or trust; fix before launch/scale.
- 🟡 **Medium** — Noticeable but non‑blocking; fix in normal cycle.
- 🟢 **Low** — Polish, hygiene, or nice‑to‑have.

"Est. impact" figures are directional estimates from payload/structure analysis (mobile, mid‑tier device, 4G ~10 Mbps).

---

## 2. 🔴 Critical Issues (fix first)

### C‑1 · `index.html` is 3.77 MB (inline base64 images) — Performance
- **Evidence:** `index.html` = **3,773 KB**. Contains many inline `background:url(data:image/jpeg;base64,…)` and `<img src="data:image/jpeg;base64,…">` blocks (e.g. `index.html:5884`, `5911`, `5929`, `6036`).
- **Why it matters:** The HTML document *is* the payload — the browser must download and parse ~3.8 MB before the page is usable. Inline base64 is ~33 % larger than binary, is **uncacheable separately**, and blocks HTML parsing.
- **Est. impact:** Homepage LCP on 4G ≈ **5–8 s** (should be < 2.5 s). Fixing → **‑60 to ‑75 % transfer**, LCP potentially **‑3 to ‑5 s**.
- **Fix:** Extract base64 images to optimized WebP/AVIF files under `assets/`, reference by URL, add `loading="lazy"` + width/height. Target < 400 KB HTML.

### C‑2 · `logo.png` is 996 KB and used as favicon + every logo — Performance
- **Evidence:** `logo.png` = **996 KB**; referenced 13× in `index.html`, and as the **favicon** (`index.html:14‑17`, all pages `rel="icon"`).
- **Why it matters:** A ~1 MB image is downloaded as the favicon and repeated logo on every page load. A logo should be 5–30 KB; a favicon a few KB.
- **Est. impact:** ‑950 KB per page (cached after first hit, but first paint/branding delayed). LCP/asset budget win.
- **Fix:** Export a properly sized logo (SVG or ≤ 30 KB PNG) and a real `favicon.ico`/32×32 PNG.

### C‑3 · Broken WhatsApp/Call links on the lead page (`XXXXXXXXXX` placeholders) — Functionality / Conversion
- **Evidence:** `consultation.html:2188`, `:2660`, `:4196` → `https://wa.me/91XXXXXXXXXX`; `:4197` → `tel:+91XXXXXXXXXX`.
- **Why it matters:** The primary "WhatsApp Expert" and "Call Expert" CTAs on the **conversion page** point to a non‑existent number — dead conversions and a broken‑trust signal for payment‑gateway reviewers.
- **Est. impact:** Direct conversion loss on the highest‑intent page.
- **Fix:** Replace with the real number used elsewhere (`917428329102`).

### C‑4 · 620 MB dead `dropshipguru-landing/` Next.js project in repo — Structure / Production
- **Evidence:** `dropshipguru-landing/` = **620.72 MB**, dominated by `.next/dev/cache/turbopack/*` (individual files up to 22 MB) and its own `node_modules`. Not referenced by the shipped static site.
- **Why it matters:** Abandoned parallel codebase + committed build cache. Bloats the repo, confuses "which site is deployed", risks accidentally shipping dev artifacts, and slows clones/CI.
- **Est. impact:** Repo/deploy hygiene; ~96 % of repo size is dead weight.
- **Fix:** Remove `dropshipguru-landing/` (or move to a separate archived repo). At minimum add `.next/`, `node_modules/` to `.gitignore` and delete build cache.

### C‑5 · No security headers / CSP anywhere — Security
- **Evidence:** No `_headers`, `.htaccess`, `vercel.json`, `netlify.toml`; no `<meta http-equiv="Content-Security-Policy">` in any page.
- **Why it matters:** No CSP, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, or HSTS. For a site handling PII lead data and seeking payment‑gateway trust, this is a baseline gap (clickjacking, MIME sniffing, injection blast radius).
- **Est. impact:** Security posture / compliance review risk.
- **Fix:** Add host‑level headers (see §6). Start with `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, HSTS, and a CSP.

### C‑6 · `_user-categories.html` — 3.5 MB dead file shipped in web root — Structure / Performance
- **Evidence:** `_user-categories.html` = **3,501 KB**, full of duplicated inline base64 category images; **not referenced by any page** (grep across `*.html` returns no links to it).
- **Why it matters:** A 3.5 MB orphan sitting in the public root is crawlable, wastes storage/bandwidth, and duplicates the same base64 blobs already inlined in `index.html`.
- **Est. impact:** ‑3.5 MB dead payload; removes a duplicate‑content/crawl liability.
- **Fix:** Delete it (or move outside web root if it's a source scratchpad).

---

## 3. 🟠 High Issues

### H‑1 · Heavy category/catalogue images (1–2.2 MB each) — Performance
- **Evidence:** `assets/categories/photos/Home Decor.png` **2.2 MB**, `Hand Bag.png` **2.1 MB**, `Ladies Wear.png` **1.8 MB**, `Travel bag pack.png` **1.7 MB**, `Led table lamp.png` **1.6 MB**, plus `assets/catalogues/Home Decor/*.jpg` (0.9–1.7 MB). Loaded via `product-gallery.js` / `jewellery-catalogue.js` / `catalogues-data.js` (`index.html:9236‑9238`).
- **Impact:** Gallery/catalogue interactions pull megabytes of PNG. Est. **several MB** avoidable per gallery open.
- **Fix:** Convert to WebP/AVIF, resize to display dimensions, ensure lazy‑loading + responsive `srcset`.

### H‑2 · Duplicate image assets (inline base64 vs. `assets/` files vs. `_user-categories.html`) — Performance / Structure
- **Evidence:** The same category imagery exists (a) inline base64 in `index.html`, (b) inline base64 in `_user-categories.html`, and (c) as binary files under `assets/`.
- **Impact:** Triplicated payload and maintenance drift.
- **Fix:** Single source of truth — externalized optimized files referenced by URL.

### H‑3 · Missing `robots.txt` and `sitemap.xml` — SEO
- **Evidence:** Both **MISSING** at root.
- **Impact:** Crawlers get no sitemap and no crawl directives; slower/incomplete indexing of the 8 public pages.
- **Fix:** Add `robots.txt` (allow + sitemap reference) and a `sitemap.xml` listing all canonical URLs.

### H‑4 · `plan-details.html` SEO metadata is thin — SEO
- **Evidence:** `plan-details.html` head has only `title`, `description`, `robots`, `theme-color`, `icon` (`:6‑10`). **No canonical, no Open Graph, no Twitter Card, no JSON‑LD.**
- **Impact:** Poor share previews and weaker canonical signals for a money page.
- **Fix:** Add canonical + OG/Twitter + `Product`/`Offer` schema.

### H‑5 · `consultation.html` SEO metadata is minimal — SEO
- **Evidence:** Only `title`, `viewport`, `icon` (`:5‑7`). No description/robots/canonical/OG/Twitter.
- **Impact:** The key landing/conversion URL has weak search + social presentation.
- **Fix:** Add description, canonical, robots, OG/Twitter.

### H‑6 · Third‑party CDN script pinned to `@latest` without SRI — Security / Reliability
- **Evidence:** `refund-policy/index.html:426`, `privacy-policy/index.html:419`, `terms-conditions/index.html`, and `about/`, `contact/` load `https://unpkg.com/lucide@latest` (no version, no `integrity`, no `crossorigin`).
- **Impact:** Supply‑chain risk (whatever unpkg serves runs on your origin) + breakage risk if the library changes. Relevant to payment‑trust reviews.
- **Fix:** Pin an exact version, add SRI `integrity`, or self‑host the icon script.

### H‑7 · Open, unauthenticated form endpoint (no anti‑abuse) — Security
- **Evidence:** `google-sheet-submit.js:5` exposes the Apps Script `/exec` URL; `consultation.html` posts leads with only client‑side validation (`validateStep1`). No CAPTCHA, honeypot, or rate limiting.
- **Impact:** Endpoint is publicly scriptable → spam/garbage rows, potential quota exhaustion. PII (name/phone/email) collected without server‑side validation.
- **Fix:** Add a honeypot field + timing check, optionally hCaptcha/Turnstile; validate/sanitize server‑side in the Apps Script; consider a rate limit.

### H‑8 · No root `package.json`; build depends on ambient `node_modules` (90 MB) — Production
- **Evidence:** `package-lock.json` present but **no `package.json`**; `node_modules/` (90 MB: `pdfjs-dist`, `pdf-parse`, `sharp`) exists only for build scripts (`_build-legal-pages.js`, `_scan-galleries.js`).
- **Impact:** Non‑reproducible builds; 90 MB of build‑only deps risk being deployed with the static site.
- **Fix:** Add a root `package.json` with pinned devDependencies and scripts; ensure `node_modules/` is dev‑only and excluded from deploy.

### H‑9 · No JSON‑LD structured data except homepage — SEO
- **Evidence:** `application/ld+json` present only in `index.html` (Organization + WebSite). Legal/about/contact/plan pages have none.
- **Impact:** Missed rich‑result eligibility (Breadcrumb, Organization on subpages, Product/Offer, FAQ).
- **Fix:** Add `BreadcrumbList` sitewide, `Organization` reference on subpages, `FAQPage` where FAQs exist, `Product`/`Offer` on plan pages.

---

## 4. 🟡 Medium Issues

| ID | Issue | Evidence | Impact | Fix |
|---|---|---|---|---|
| M‑1 | Desktop hero PNG 664 KB | `hero-character.png` 664 KB (mobile uses 36.8 KB WebP via `<picture>`) | Desktop LCP weight | Ship a desktop WebP/AVIF too |
| M‑2 | Google Fonts render‑blocking `<link>` | All pages load `fonts.googleapis.com/css2` stylesheet | Delays first paint | `preload`+swap already partly used; self‑host or subset fonts |
| M‑3 | Massive per‑page inline `<style>` (much unused per page) | `index.html`, `consultation.html`, `plan-details.html` each embed very large CSS blocks | Parse cost, duplicated CSS across pages | Extract shared CSS to a cached external file; purge unused |
| M‑4 | Mojibake characters in copy | `index.html:3322`, `consultation.html:1113` show `Apple � Stripe …` | Visible/encoding defect | Re‑save UTF‑8; replace `�` with intended `×`/`•` |
| M‑5 | Non‑existent brand claims may mislead | Marketing text lists "Stripe/Razorpay" as if partners (`consultation.html:14`, `index.html:1735` brand chips) | Trust/compliance nuance | Ensure claims are accurate for payment review |
| M‑6 | `innerHTML` assignments | `consultation.html:3342` (`list.innerHTML=…`), `:3445`, `:3489`, `:3504` | Low XSS surface (values are internal/static today) | Prefer `textContent`/DOM APIs; never interpolate user input |
| M‑7 | No `manifest.json` / PWA metadata | MISSING | No installability, weaker mobile signals | Add web app manifest + maskable icon |
| M‑8 | No real `favicon.ico` | Pages point `rel="icon"` to `logo.png` | Extra weight, some clients expect `.ico` | Add multi‑size favicon set |
| M‑9 | Footer‑heading color differs on `consultation.html` | Page theme (`.footer-col h4{color:#fff!important}`) overrides the new footer's gold | Minor visual inconsistency vs other pages | Optional: scope‑override to gold if strict consistency desired |
| M‑10 | Form field label/contrast verification pending | Consultation form uses floating‑label pattern | Possible a11y label association gaps | Verify `<label for>`/`aria-label` on every input |
| M‑11 | Duplicate/parallel legal content sources | `legal/content/*.html` (source) + generated `*/index.html` | Drift risk if edited in wrong place | Document that partials are the source of truth |

---

## 5. 🟢 Low Issues

| ID | Issue | Evidence | Fix |
|---|---|---|---|
| L‑1 | Orphan `package-lock.json` without `package.json` | root | Add matching `package.json` |
| L‑2 | `?v=` cache‑busting done manually | `product-gallery.js?v=4`, `product-gallery.css?v=2` | Automate via build hashing |
| L‑3 | External social/WhatsApp links use `rel="noopener"` ✅ but some lack `noreferrer` | footers | Add `noreferrer` for privacy |
| L‑4 | No `theme-color` on `consultation.html` | `:1‑10` | Add for consistency |
| L‑5 | Scattered scratch scripts in root (`_scan-galleries.js`, `_build-legal-pages.js`) | root | Move to `/scripts` |
| L‑6 | Legal PDFs (54–86 KB) shipped in root | `DropshipGuru_*.pdf` | Fine; consider `/assets/legal` |
| L‑7 | `og:image`/`twitter:image` use 996 KB logo | index/subpages | Provide a dedicated 1200×630 OG image |
| L‑8 | Mixed absolute prod URLs vs. relative links | canonical uses `dropshipguru.in`, nav uses relative | Consistent; ensure canonical host matches deploy |

---

## 6. Category Deep‑Dives

### 6.1 Performance
- **Large files:** `index.html` 3.77 MB (C‑1), `_user-categories.html` 3.5 MB (C‑6), `logo.png` 996 KB (C‑2), `hero-character.png` 664 KB (M‑1), category PNGs 1.5–2.2 MB (H‑1).
- **Heavy images:** category/catalogue imagery is uncompressed PNG/large JPG; no AVIF/WebP for desktop hero or gallery.
- **Duplicate assets:** base64 inlined twice + binary files (H‑2).
- **Unused CSS:** large inline `<style>` per page, much of it shared and/or unused per page (M‑3); `consultation.html` still carries CSS for a removed footer design.
- **Unused JS:** the entire `dropshipguru-landing/` app (C‑4); build‑only `node_modules` (H‑8).
- **Render‑blocking:** Google Fonts stylesheet (M‑2). Scripts are mostly at end of body/`defer` (good). Inline CSS is not network‑blocking but inflates the document.
- **Lazy loading:** partially present (12 `loading/decoding/fetchpriority` hits in `index.html`, 1 in `consultation.html`); many gallery images still need it.
- **Core Web Vitals (estimated, mobile 4G):**
  - **LCP:** Home ≈ **5–8 s** (🔴) driven by document weight; legal/about/contact ≈ **1.5–2.5 s** (🟢).
  - **CLS:** likely **< 0.1** on most (hero has width/height); watch JS‑injected gallery/toasts (🟡).
  - **INP/TBT:** moderate — heavy inline JS (constellation canvas, parallax) but guarded/disabled on mobile in recent passes (🟡).
  - **Estimated Lighthouse Perf:** Home **~35–50** 🔴; secondary pages **~85–95** 🟢.

### 6.2 Project Structure
- **Folder structure:** Clean public routes (`about/`, `contact/`, `privacy-policy/`, `terms-conditions/`, `refund-policy/` as folder‑index) — good for pretty URLs. Root holds pages + assets + build scripts.
- **Dead/duplicate:** `dropshipguru-landing/` (C‑4), `_user-categories.html` (C‑6), duplicate base64 (H‑2), scratch scripts (L‑5).
- **Unused folders:** `dropshipguru-landing/.next` build cache is pure artifact.

### 6.3 Payment‑Gateway Compliance
- **Integration status:** **None.** No Cashfree, Razorpay, PhonePe, or PayU SDK/JS, no checkout, no `createOrder`/`order_id`, no keys. "Razorpay/Stripe" appear only as **marketing/brand chips** (`index.html:1735`, `consultation.html:14`).
- **Model:** Lead‑gen → Google Apps Script → Google Sheet (`google-sheet-submit.js`). Payments (if any) happen **off‑platform**.
- **Website‑verification readiness (what Cashfree/Razorpay actually check):**
  - ✅ Legal business name sitewide ("DropshipGuru Private Limited"), footer + About + Contact.
  - ✅ Terms, Privacy, Refund/Cancellation policy pages exist and are linked in every footer.
  - ✅ Contact page with email, phone, WhatsApp, registered address.
  - ✅ Pricing shown; ⚠️ ensure product/pricing and refund terms are consistent.
  - ⚠️ **Fix broken contact CTAs (C‑3)** — reviewers test them.
  - ⚠️ Add **GSTIN/CIN** to About "Legal Business Information" if available (strengthens verification).
  - ⚠️ If you later collect payments on‑site, you must integrate a gateway server‑side and never expose secret keys client‑side.
- **Verdict:** **Verification‑ready after C‑3**; not payment‑integrated.

### 6.4 SEO
- **Meta tags:** `index.html` strong (20 SEO‑related tags), legal/about/contact solid (16 each). Gaps: `plan-details` (H‑4), `consultation` (H‑5).
- **Open Graph / Twitter:** present on index/legal/about/contact; missing on plan‑details & consultation.
- **robots.txt / sitemap.xml:** **missing** (H‑3).
- **Canonical:** present on index/legal/about/contact; missing on plan‑details/consultation.
- **Schema:** only homepage (H‑9).
- **Good:** every page has `<html lang="en">`, `<title>`, `viewport`, favicon link, unique descriptions on most.

### 6.5 Security
- **Headers/CSP:** none (C‑5).
- **Forms:** client‑side validation only; open endpoint, no anti‑abuse (H‑7); PII collected.
- **XSS:** limited `innerHTML` use with currently‑static values (M‑6) — low but tighten.
- **Supply chain:** `unpkg@latest` unpinned, no SRI (H‑6).
- **Secrets:** none found in source except the Apps Script `/exec` URL (public by design; keep it write‑only + validated). No API keys/tokens exposed.
- **Good:** external links use `target="_blank" rel="noopener"`; no `http://` resource loads (only SVG XML namespaces); HTTPS assets.

### 6.6 Accessibility
- ✅ `lang="en"` on all pages; ✅ social/icon links have `aria-label` + `aria-hidden` icons; ✅ meaningful `alt` on logo/hero; ✅ interactive controls are real `<button>`/`<a>`.
- ⚠️ Verify form inputs have associated `<label>`/`aria-label` (M‑10); verify gold‑on‑dark and muted‑grey text meet WCAG AA contrast; ensure decorative base64 `.cat-bg` divs stay `aria-hidden`/empty (they are backgrounds — OK).

### 6.7 Mobile Optimization
- ✅ Responsive layouts, `viewport` on all pages, mobile perf passes (animation disabling, `backdrop-filter` removal, IntersectionObserver pausing, `<picture>` WebP hero, overflow‑x hidden).
- ⚠️ Byte weight is still the mobile problem: 3.77 MB home doc + heavy images dominate mobile data/LCP (C‑1/C‑2/H‑1).

### 6.8 Loading Speed
- **Dominated by transfer size**, not requests. Externalizing + compressing images (C‑1, C‑2, H‑1) is the single biggest lever. Fonts (M‑2) and shared‑CSS extraction (M‑3) are secondary wins. Scripts are already deferred/end‑of‑body.

### 6.9 Bundle Size
- **Shipped static site** ≈ `index.html` 3.77 MB + `assets/` 23.86 MB + logo/hero + small JS/CSS. JS bundle itself is small (`brand-icons.js` 28 KB, `product-gallery.js` 18.7 KB, etc.) — **images, not JS, are the bundle problem**.
- **Repo** is 96 % dead weight: `dropshipguru-landing/` 620 MB + root `node_modules` 90 MB.

### 6.10 Production Readiness
- 🔴 Broken CTAs (C‑3), dead code (C‑4/C‑6), no host config/headers (C‑5), no root `package.json` (H‑8), no robots/sitemap (H‑3), no favicon.ico/manifest (M‑7/M‑8), encoding artifacts (M‑4).
- ✅ Legal/compliance pages, consistent footer, working lead pipeline (post‑CORS fix), mobile passes.

---

## 7. Prioritized Remediation Roadmap

**Phase 1 — Ship blockers (do now)**
1. C‑3 Fix WhatsApp/Call placeholder links in `consultation.html`.
2. C‑2 Replace 996 KB logo + add real favicon.
3. C‑1 Externalize & compress `index.html` base64 images (WebP/AVIF + lazy).
4. C‑6 Delete `_user-categories.html`; C‑4 remove/relocate `dropshipguru-landing/` and add `.gitignore`.
5. C‑5 Add security headers + CSP via host config.

**Phase 2 — High (pre‑scale)**
6. H‑1/H‑2 Optimize & de‑duplicate catalogue/category images.
7. H‑3 Add `robots.txt` + `sitemap.xml`.
8. H‑4/H‑5/H‑9 Complete SEO on `plan-details` & `consultation`; add schema sitewide.
9. H‑6 Pin/self‑host Lucide with SRI.
10. H‑7 Add form anti‑abuse + server‑side validation.
11. H‑8 Add root `package.json`; isolate dev deps.

**Phase 3 — Medium/Low (polish)**
12. Desktop hero WebP (M‑1), font strategy (M‑2), shared‑CSS extraction (M‑3), fix mojibake (M‑4), OG image (L‑7), manifest/favicon set (M‑7/M‑8), a11y label/contrast pass (M‑10).

---

## 8. Estimated Performance Impact Summary

| Action | Est. transfer saved (home) | Est. LCP improvement (mobile) |
|---|---|---|
| Externalize + compress `index.html` images (C‑1) | ‑2.5 to ‑3.0 MB | ‑3 to ‑5 s |
| Right‑size logo + favicon (C‑2) | ‑0.95 MB | ‑0.3 to ‑0.8 s |
| Optimize gallery/category images (H‑1) | ‑several MB (on interaction) | Smoother gallery |
| Remove dead code from deploy (C‑4/C‑6) | 0 to end‑users, ‑96 % repo | Faster CI/clone/deploy |
| Font + shared‑CSS (M‑2/M‑3) | ‑50 to ‑150 KB | ‑0.2 to ‑0.5 s |
| **Combined (home page)** | **≈ ‑3.5 to ‑4 MB (‑85–90 %)** | **LCP ~6 s → ~1.5–2.5 s (target)** |

---

## 9. What's Already Good (keep it)

- Consistent, premium visual design and a single shared footer across all public pages.
- Complete, well‑written legal suite (Terms/Privacy/Refund) + About/Contact with legal business identity for gateway verification.
- Strong homepage SEO (unique title/description, OG/Twitter, Organization + WebSite JSON‑LD with `legalName`).
- Deliberate mobile performance work (animation/blur reduction, `<picture>` WebP hero, off‑screen pausing).
- Sensible security basics on links (`rel="noopener"`), HTTPS assets, and a lead pipeline hardened against the earlier CORS/preflight failure.

---

*Report generated by static analysis only. No source files were modified. Core Web Vitals values are estimates — validate with Lighthouse/WebPageTest/CrUX after Phase 1 fixes.*
