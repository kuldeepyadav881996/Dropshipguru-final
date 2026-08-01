// Generates a proper favicon/PWA icon set from the pristine logo backup.
const fs = require("fs");
const path = require("path");
const sharp = require(path.join(__dirname, "..", "dropshipguru-landing", "node_modules", "sharp"));

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "_perf-backup", "originals", "logo.png"); // 1254x1254 pristine
const OUT = path.join(ROOT, "assets", "icons");
fs.mkdirSync(OUT, { recursive: true });

const BG = { r: 14, g: 16, b: 19, alpha: 1 }; // #0E1013

(async () => {
  const plain = [
    ["favicon-16.png", 16],
    ["favicon-32.png", 32],
    ["favicon-48.png", 48],
    ["apple-touch-icon.png", 180],
    ["icon-192.png", 192],
    ["icon-512.png", 512],
  ];
  for (const [name, size] of plain) {
    await sharp(SRC).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, palette: true }).toFile(path.join(OUT, name));
  }
  // Maskable: logo at ~78% on solid brand background (safe zone for Android masks)
  const inner = Math.round(512 * 0.78);
  const logo = await sharp(SRC).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: BG } })
    .composite([{ input: logo, gravity: "center" }])
    .png({ compressionLevel: 9 }).toFile(path.join(OUT, "maskable-512.png"));

  // favicon.ico (multi-size) if the ico encoder is available; else skipped gracefully
  let icoNote = "skipped (no encoder)";
  try {
    const pngToIco = require(path.join(ROOT, "node_modules", "png-to-ico"));
    const bufs = await Promise.all([16, 32, 48].map((s) =>
      sharp(SRC).resize(s, s, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()));
    const ico = await pngToIco(bufs);
    fs.writeFileSync(path.join(ROOT, "favicon.ico"), ico);
    icoNote = "written favicon.ico";
  } catch (e) { icoNote = "skipped (" + e.code + ")"; }

  const files = fs.readdirSync(OUT).map((f) => `${f} ${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1)}KB`);
  console.log("Icons in assets/icons:\n  " + files.join("\n  "));
  console.log("favicon.ico: " + icoNote);
})();
