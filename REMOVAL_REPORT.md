# Removal Report — "Dropship Guru Kyun?" Section

**Date:** 2026-08-01
**File affected:** `index.html` (only)
**Result:** Section fully removed. No other section modified. No broken CSS/JS. Lighthouse impact is neutral-to-positive (fewer DOM nodes + fewer running CSS animations).

---

## 1. What was removed

### HTML (section `#why-different`, ~108 lines)
| Element | Description |
|---|---|
| Section wrapper | `<section id="why-different">` + `.diff-grid` |
| Heading block | Pill `Dropship Guru Kyun?`, `<h2>Alag Banaya, Aapke Liye</h2>`, intro paragraph |
| Left feature cards | 4 × `.diff-item` (100% Done For You, Kahin Se Bhi Kaam Karo, Dedicated Support, Proven System) |
| Sample Store Dashboard | `.diff-panel` (brand head, "Sample Monthly Revenue" stat, status rows) |
| Revenue chart | `.diff-panel-chart` (7 animated bars) |
| Floating order cards | 3 × `.diff-float-card` (`.dfc-1/2/3`) |
| Ambient decor | `.diff-glow`, `.diff-grid-bg`, 3 × `.diff-particle` (`.dp-1/2/3`) |

### CSS (contiguous minified block, section-only)
Removed all selectors used exclusively by the section:
`.diff-grid`, `.diff-text`, `.diff-list`, `.diff-item`, `.di-icon`, `.diff-visual`,
`.diff-panel*`, `.dp-brand/logo/live/dot/label/value/sub`, `.diff-panel-chart`,
`.diff-panel-rows/row`, `.dpr-icon/text/check`, `.diff-float-card`, `.dfc-*`,
`.diff-particle`, `.diff-glow`, `.diff-grid-bg`, plus the standalone
`#why-different { background/box-shadow/clip-path }` rule and its responsive
`@media (max-width:980px)` / `@media (max-width:600px)` overrides.

### Animations (keyframes deleted — used only by this section)
- `@keyframes panelFloat` (dashboard float)
- `@keyframes barGrow` (revenue bars)
- `@keyframes particleFloat` (ambient particles)
- `floatCard1/2/3` references (float chips)

### Dead references cleaned from shared rules (section entries only; other selectors preserved)
- Mobile-perf animation/`will-change` lists: removed `.diff-item, .diff-panel`
- Landing-flow background list: removed `#why-different`
- Landing-flow decor list: removed `.diff-glow`
- Shared icon-sizing lists: removed `.di-icon`
- Scroll/animation JS selector string: removed `.diff-item`

### JavaScript
No dedicated JavaScript existed for this section — all motion was CSS-driven.
Only the dead `.diff-item` entry inside a shared reveal/animation selector string was removed.

---

## 2. Assets / scripts removed
| Asset | Status |
|---|---|
| Image files (PNG/JPG/WebP/SVG) | **None** — the section used no `<img>`; all icons came from the shared inline `brand-icons` library. |
| Standalone scripts | **None became unnecessary.** `brand-icons.js/.css` remain in active use by the navbar and other sections/pages. |

No orphaned binary assets were produced, so no files needed deletion from disk.

---

## 3. Spacing / layout
The previous **Roadmap** section (`</section>`) now connects directly to the
**Plans** section (`<!-- PLANS -->`) with a single blank line — no empty margins
or blank space. CSS join is clean: `#who-can-start … } } #categories { … }`.

---

## 4. Verification
| Check | Result |
|---|---|
| Residual `diff-` / `why-different` / `dfc-` / `dpr-` / `di-icon` / `dp-*` selectors | **0** |
| Section-only keyframes (`panelFloat`, `barGrow`, `particleFloat`) | **0** |
| CSS brace balance (`{` vs `}`) | **0 (balanced)** |
| Linter errors | **None** |
| Shared keyframes preserved (`dotBlink`, `plansBgPulse`) | **Yes** (defined/used elsewhere) |
| Other sections modified | **No** |

---

## 5. Size reduction
| Metric | Before | After | Saved |
|---|---:|---:|---:|
| `index.html` | 338,242 bytes | 326,146 bytes | **12,096 bytes (~11.8 KB, ‑3.6%)** |
| — HTML markup | — | — | 4,734 bytes |
| — CSS block | — | — | 6,196 bytes |
| — Dead shared-rule / JS refs | — | — | ~1,166 bytes |

**Performance note:** Removal eliminates ~15 animated DOM nodes and 3 continuously
running CSS animations (float, bar-grow, particles), which slightly reduces main-thread
work and layout cost on mobile — a net-positive for Lighthouse, with zero visual
regression to any remaining section.
