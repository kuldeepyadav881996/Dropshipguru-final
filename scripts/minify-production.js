'use strict';
/**
 * Minify production CSS/JS (external). Skips payment/sheets logic changes —
 * only compresses whitespace/identifiers safely via terser/clean-css.
 */
const fs = require('fs');
const path = require('path');
const { minify: terser } = require('terser');
const CleanCSS = require('clean-css');

const ROOT = path.join(__dirname, '..');
const BACKUP = path.join(ROOT, '_perf-backup', 'originals');
const cleaner = new CleanCSS({ level: 2 });
const rows = [];

function backup(rel) {
  const dst = path.join(BACKUP, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (!fs.existsSync(dst)) fs.copyFileSync(path.join(ROOT, rel), dst);
}

async function minJS(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return;
  const src = fs.readFileSync(abs, 'utf8');
  backup(rel);
  const res = await terser(src, {
    compress: { passes: 1, drop_console: false },
    mangle: true,
    format: { comments: false },
  });
  if (res.error) {
    console.log('JS ERROR', rel, res.error);
    return;
  }
  fs.writeFileSync(abs, res.code);
  rows.push({
    rel,
    before: Buffer.byteLength(src),
    after: Buffer.byteLength(res.code),
    kind: 'js',
  });
}

function minCSS(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return;
  const src = fs.readFileSync(abs, 'utf8');
  // Skip already tiny or empty
  if (!src.trim()) return;
  backup(rel);
  const out = cleaner.minify(src);
  if (out.errors.length) {
    console.log('CSS ERROR', rel, out.errors.join(';'));
    return;
  }
  fs.writeFileSync(abs, out.styles);
  rows.push({
    rel,
    before: Buffer.byteLength(src),
    after: Buffer.byteLength(out.styles),
    kind: 'css',
  });
}

(async () => {
  const jsFiles = [
    'payment-client.js',
    'google-sheet-submit.js',
    'brand-icons.js',
    'product-gallery.js',
    'jewellery-catalogue.js',
    'catalogues-data.js',
    'assets/premium-ui.js',
  ];
  const cssFiles = [
    'assets/base.css',
    'assets/components.css',
    'assets/layout.css',
    'assets/mobile.css',
    'mobile-layout.css',
    'assets/premium-ui.css',
    'assets/consultation.css',
    'assets/consultation-footer.css',
    'assets/consultation-motion.css',
    'assets/app-core.css',
    'assets/app-hero.css',
    'assets/app-components.css',
    'assets/app-sections.css',
    'assets/app.css',
    'brand-icons.css',
    'product-gallery.css',
    'jewellery-catalogue.css',
  ];

  for (const f of jsFiles) await minJS(f);
  for (const f of cssFiles) minCSS(f);

  let tb = 0;
  let ta = 0;
  console.log('=== MINIFY ===');
  rows.forEach((r) => {
    tb += r.before;
    ta += r.after;
    const pct = r.before ? (((1 - r.after / r.before) * 100).toFixed(0)) : '0';
    console.log(
      `${(r.before / 1024).toFixed(1).padStart(8)}KB -> ${(r.after / 1024).toFixed(1).padStart(7)}KB (-${pct}%)  ${r.rel}`
    );
  });
  console.log(`TOTAL: ${(tb / 1024).toFixed(1)}KB -> ${(ta / 1024).toFixed(1)}KB`);
  fs.writeFileSync(
    path.join(ROOT, '_perf-backup', 'minify-production.json'),
    JSON.stringify(rows, null, 2)
  );
})();
