// Phase 1 image optimizer. Re-encodes referenced raster images >150KB to WebP
// bytes IN PLACE (same filename) so every existing reference keeps working via
// browser content-sniffing (the site already ships webp-in-.jpg for Kitchen*).
// Originals are backed up to _perf-backup/originals/<relpath> before overwrite.
const fs = require("fs");
const path = require("path");
const sharp = require(path.join(__dirname, "..", "dropshipguru-landing", "node_modules", "sharp"));

const ROOT = path.join(__dirname, "..");
const BACKUP = path.join(ROOT, "_perf-backup", "originals");
const results = [];

function backup(rel) {
  const src = path.join(ROOT, rel);
  const dst = path.join(BACKUP, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (!fs.existsSync(dst)) fs.copyFileSync(src, dst);
}

async function reencodeInPlace(rel, { maxEdge = 1600, quality = 82 } = {}) {
  const abs = path.join(ROOT, rel);
  const before = fs.statSync(abs).size;
  backup(rel);
  const img = sharp(path.join(BACKUP, rel)); // read from pristine backup
  const meta = await img.metadata();
  const resize =
    Math.max(meta.width, meta.height) > maxEdge
      ? { width: meta.width >= meta.height ? maxEdge : null, height: meta.height > meta.width ? maxEdge : null, fit: "inside", withoutEnlargement: true }
      : null;
  let pipe = sharp(path.join(BACKUP, rel));
  if (resize) pipe = pipe.resize(resize);
  const buf = await pipe.webp({ quality, effort: 5, alphaQuality: 90 }).toBuffer();
  const outMeta = await sharp(buf).metadata();
  fs.writeFileSync(abs, buf);
  results.push({ rel, before, after: buf.length, dims: `${meta.width}x${meta.height}->${outMeta.width}x${outMeta.height}`, fmt: "webp(in-place)" });
}

async function optimizeLogo() {
  const rel = "logo.png";
  const abs = path.join(ROOT, rel);
  const before = fs.statSync(abs).size; // already backed up earlier
  const buf = await sharp(path.join(BACKUP, rel))
    .resize(512, 512, { fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 90, effort: 8 })
    .toBuffer();
  fs.writeFileSync(abs, buf);
  results.push({ rel, before, after: buf.length, dims: "1254x1254->512x512", fmt: "png(kept: favicon/og)" });
}

async function makeHeroWebp() {
  const relSrc = "hero-character.png";
  const relOut = "hero-character.webp";
  const before = fs.statSync(path.join(ROOT, relSrc)).size;
  const buf = await sharp(path.join(BACKUP, relSrc))
    .webp({ quality: 90, effort: 6, alphaQuality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(ROOT, relOut), buf);
  results.push({ rel: relOut + " (new desktop src)", before, after: buf.length, dims: "595x1009", fmt: "webp(new)" });
}

(async () => {
  const catalogueTargets = [
    "assets/catalogues/Home Decor/01.jpg",
    "assets/catalogues/Home Decor/02.jpg",
    "assets/catalogues/Home Decor/03.jpg",
    "assets/catalogues/Home Decor/04.jpg",
    "assets/catalogues/Home Decor/05.jpg",
    "assets/catalogues/Home Decor/06.jpg",
    "assets/catalogues/Hnad Bag/01.jpg",
    "assets/catalogues/Hnad Bag/02.jpg",
    "assets/catalogues/Hnad Bag/03.jpg",
    "assets/catalogues/Hnad Bag/04.jpg",
    "assets/catalogues/Hnad Bag/05.jpg",
    "assets/catalogues/Hnad Bag/06.jpg",
  ];
  for (const rel of catalogueTargets) {
    if (fs.existsSync(path.join(ROOT, rel))) await reencodeInPlace(rel, { maxEdge: 1600, quality: 82 });
  }
  await optimizeLogo();
  await makeHeroWebp();

  let tb = 0, ta = 0;
  console.log("=== IMAGE OPTIMIZATION RESULTS ===");
  for (const r of results) {
    tb += r.before; ta += r.after;
    const pct = ((1 - r.after / r.before) * 100).toFixed(0);
    console.log(`${(r.before / 1024).toFixed(1).padStart(8)}KB -> ${(r.after / 1024).toFixed(1).padStart(7)}KB (-${pct}%)  ${r.dims.padEnd(20)} ${r.fmt}  ${r.rel}`);
  }
  console.log(`TOTAL: ${(tb / 1024 / 1024).toFixed(2)}MB -> ${(ta / 1024 / 1024).toFixed(2)}MB (saved ${((tb - ta) / 1024 / 1024).toFixed(2)}MB)`);
  fs.writeFileSync(path.join(ROOT, "_perf-backup", "image-results.json"), JSON.stringify(results, null, 2));
})();
