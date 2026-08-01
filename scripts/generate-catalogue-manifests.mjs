import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../assets/catalogues");
const outJs = path.resolve(__dirname, "../catalogues-data.js");
const exts = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const data = {};

for (const dir of fs.readdirSync(root, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const folder = path.join(root, dir.name);
  const images = fs
    .readdirSync(folder)
    .filter((f) => exts.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const manifest = { images };
  fs.writeFileSync(
    path.join(folder, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n"
  );
  data[dir.name] = { folder: dir.name, images };
  console.log(dir.name + ": " + images.length + " images");
}

const js =
  "window.CATALOGUES_DATA = " +
  JSON.stringify(data, null, 2) +
  ";\n";

fs.writeFileSync(outJs, js);
console.log("Wrote catalogues-data.js (" + Object.keys(data).length + " folders)");
