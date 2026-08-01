// Extracts inline base64 images from index.html into external optimized WebP
// files and rewrites each reference (works for src="..." and url(...)).
// index.html is already backed up in _perf-backup/originals/index.html.
const fs = require("fs");
const path = require("path");
const sharp = require(path.join(__dirname, "..", "dropshipguru-landing", "node_modules", "sharp"));

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "assets", "inline");
fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const htmlPath = path.join(ROOT, "index.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const re = /data:image\/(png|jpe?g|gif|webp);base64,([A-Za-z0-9+/=]+)/g;

  const matches = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    matches.push({ full: m[0], type: m[1], b64: m[2], start: m.index, end: m.index + m[0].length });
  }
  console.log(`Found ${matches.length} base64 blobs`);

  const rows = [];
  for (let i = 0; i < matches.length; i++) {
    const mt = matches[i];
    const beforeCtx = html.slice(Math.max(0, mt.start - 60), mt.start);
    const isImgSrc = /src\s*=\s*["']?$/.test(beforeCtx);
    const isUrl = /url\(\s*["']?$/.test(beforeCtx);
    const ctx = isImgSrc ? "img" : isUrl ? "bg" : "other";
    const input = Buffer.from(mt.b64, "base64");
    const meta = await sharp(input).metadata();
    const resize = Math.max(meta.width || 0, meta.height || 0) > 1200
      ? { width: (meta.width >= meta.height) ? 1200 : null, height: (meta.height > meta.width) ? 1200 : null, fit: "inside", withoutEnlargement: true }
      : null;
    let pipe = sharp(input);
    if (resize) pipe = pipe.resize(resize);
    const buf = await pipe.webp({ quality: 80, effort: 5, alphaQuality: 90 }).toBuffer();
    const name = `inline-${String(i + 1).padStart(2, "0")}.webp`;
    fs.writeFileSync(path.join(OUT_DIR, name), buf);
    mt.newRef = `assets/inline/${name}`;
    rows.push({ name, ctx, type: mt.type, before: input.length, after: buf.length, dims: `${meta.width}x${meta.height}` });
  }

  // Rebuild HTML by slicing (right-to-left safe since we use absolute indices)
  let out = "";
  let cursor = 0;
  for (const mt of matches) {
    out += html.slice(cursor, mt.start) + mt.newRef;
    cursor = mt.end;
  }
  out += html.slice(cursor);
  fs.writeFileSync(htmlPath, out);

  let tb = 0, ta = 0;
  console.log("=== BASE64 EXTRACTION ===");
  for (const r of rows) {
    tb += r.before; ta += r.after;
    console.log(`${r.name}  ${r.ctx.padEnd(5)} ${r.type.padEnd(4)} ${(r.before/1024).toFixed(1).padStart(7)}KB -> ${(r.after/1024).toFixed(1).padStart(6)}KB  ${r.dims}`);
  }
  console.log(`Inline total: ${(tb/1024/1024).toFixed(2)}MB -> external ${(ta/1024).toFixed(1)}KB`);
  console.log(`index.html: ${(Buffer.byteLength(html)/1024/1024).toFixed(2)}MB -> ${(Buffer.byteLength(out)/1024/1024).toFixed(2)}MB`);
  fs.writeFileSync(path.join(ROOT, "_perf-backup", "base64-results.json"), JSON.stringify(rows, null, 2));
})();
