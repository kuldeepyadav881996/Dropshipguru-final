// Minifies external JS/CSS in place and inline <style> blocks in the two large
// HTML files. Inline <script> is intentionally left untouched (zero behavioral
// risk). Each file is backed up to _perf-backup/originals/<name> first.
const fs = require("fs");
const path = require("path");
const { minify: terser } = require(path.join(__dirname, "..", "node_modules", "terser"));
const CleanCSS = require(path.join(__dirname, "..", "node_modules", "clean-css"));

const ROOT = path.join(__dirname, "..");
const BACKUP = path.join(ROOT, "_perf-backup", "originals");
const cleaner = new CleanCSS({ level: 2, returnPromise: false });
const rows = [];

function backup(rel) {
  const dst = path.join(BACKUP, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (!fs.existsSync(dst)) fs.copyFileSync(path.join(ROOT, rel), dst);
}

async function minJS(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return;
  const src = fs.readFileSync(abs, "utf8");
  backup(rel);
  const res = await terser(src, { compress: true, mangle: true });
  if (res.error) { console.log("JS ERROR " + rel + ": " + res.error); return; }
  fs.writeFileSync(abs, res.code);
  rows.push({ rel, before: Buffer.byteLength(src), after: Buffer.byteLength(res.code), kind: "js" });
}

function minCSSfile(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return;
  const src = fs.readFileSync(abs, "utf8");
  backup(rel);
  const out = cleaner.minify(src);
  if (out.errors.length) { console.log("CSS ERROR " + rel + ": " + out.errors.join(";")); return; }
  fs.writeFileSync(abs, out.styles);
  rows.push({ rel, before: Buffer.byteLength(src), after: Buffer.byteLength(out.styles), kind: "css" });
}

function minInlineStyles(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return;
  let html = fs.readFileSync(abs, "utf8");
  backup(rel);
  const before = Buffer.byteLength(html);
  html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, (full, open, css, close) => {
    const out = cleaner.minify(css);
    if (out.errors.length || !out.styles) return full; // keep original on any issue
    return open + out.styles + close;
  });
  fs.writeFileSync(abs, html);
  rows.push({ rel: rel + " (inline <style>)", before, after: Buffer.byteLength(html), kind: "html-css" });
}

(async () => {
  for (const f of ["brand-icons.js", "product-gallery.js", "jewellery-catalogue.js", "catalogues-data.js", "google-sheet-submit.js", "legal-page.js"]) await minJS(f);
  for (const f of ["brand-icons.css", "product-gallery.css", "jewellery-catalogue.css", "legal-page.css"]) minCSSfile(f);
  minInlineStyles("index.html");
  minInlineStyles("consultation.html");

  let tb = 0, ta = 0;
  console.log("=== MINIFICATION ===");
  for (const r of rows) {
    tb += r.before; ta += r.after;
    const pct = ((1 - r.after / r.before) * 100).toFixed(0);
    console.log(`${(r.before/1024).toFixed(1).padStart(8)}KB -> ${(r.after/1024).toFixed(1).padStart(7)}KB (-${pct}%)  ${r.kind.padEnd(8)} ${r.rel}`);
  }
  console.log(`TOTAL: ${(tb/1024).toFixed(1)}KB -> ${(ta/1024).toFixed(1)}KB (saved ${((tb-ta)/1024).toFixed(1)}KB)`);
  fs.writeFileSync(path.join(ROOT, "_perf-backup", "minify-results.json"), JSON.stringify(rows, null, 2));
})();
