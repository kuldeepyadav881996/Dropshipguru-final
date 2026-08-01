// Read-only inventory: raster images (size+dims) and base64 blobs in index.html
const fs = require("fs");
const path = require("path");
const sharp = require(path.join(__dirname, "..", "dropshipguru-landing", "node_modules", "sharp"));

const ROOT = path.join(__dirname, "..");
const SKIP_DIRS = new Set(["node_modules", "dropshipguru-landing", ".git", "_perf-backup"]);
const RASTER = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(ROOT, full);
    const top = rel.split(path.sep)[0];
    if (SKIP_DIRS.has(name) || SKIP_DIRS.has(top)) continue;
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (RASTER.has(path.extname(name).toLowerCase())) out.push({ rel, size: st.size });
  }
}

(async () => {
  const files = [];
  walk(ROOT, files);
  files.sort((a, b) => b.size - a.size);
  console.log("=== RASTER IMAGE FILES (excluding node_modules & dropshipguru-landing) ===");
  for (const f of files) {
    let dims = "?";
    try {
      const m = await sharp(path.join(ROOT, f.rel)).metadata();
      dims = `${m.width}x${m.height} ${m.format}${m.hasAlpha ? " alpha" : ""}`;
    } catch (e) {
      dims = "meta-fail:" + e.message.slice(0, 40);
    }
    console.log(`${(f.size / 1024).toFixed(1).padStart(9)} KB  ${dims.padEnd(24)}  ${f.rel}`);
  }

  console.log("\n=== BASE64 BLOBS IN index.html ===");
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const re = /data:image\/(png|jpe?g|gif|webp);base64,([A-Za-z0-9+/=]+)/g;
  let m, i = 0, total = 0;
  const byType = {};
  while ((m = re.exec(html)) !== null) {
    i++;
    const bytes = Math.floor(m[2].length * 0.75);
    total += bytes;
    byType[m[1]] = (byType[m[1]] || 0) + 1;
    if (bytes > 5000) console.log(`#${i} ${m[1]} ~${(bytes / 1024).toFixed(1)} KB`);
  }
  console.log(`Total blobs: ${i}, combined ~${(total / 1024 / 1024).toFixed(2)} MB, byType=${JSON.stringify(byType)}`);
  console.log(`index.html on-disk: ${(fs.statSync(path.join(ROOT, "index.html")).size / 1024 / 1024).toFixed(2)} MB`);
})();
