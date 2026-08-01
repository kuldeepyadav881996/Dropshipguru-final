import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = "http://localhost:8765/Index.html?v=pgverify";

const FOLDER_MAP = {
  "Beauty & Care": "Beauty & Care",
  "Eco-Friendly Products": "Eco Friendly Product",
  Gardening: "Gardning",
  "Gift Items": "Gift Items",
  "Hand Bags": "Hnad Bag",
  "Home & Kitchen": "Home & Kitchen",
  "Home Decor": "Home Decor",
  "Ladies Wear": "Ladies Wear",
  "Ladies Footwear": "Ldies Foot wear",
  "Spiritual Products": "Spiritual Product",
  "Toys & Baby": "Toys & Baby",
  "Travel Backpack": "Travel Bagpack",
};

function folderPath(folder) {
  return (
    "assets/catalogues/" +
    folder
      .split("/")
      .filter(Boolean)
      .map(encodeURIComponent)
      .join("/") +
    "/"
  );
}

function absUrl(pageUrl, rel) {
  return new URL(rel, pageUrl).href;
}

async function testCategory(pageUrl, category, folder) {
  const manifestUrl = absUrl(pageUrl, folderPath(folder) + "manifest.json");
  const manifestRes = await fetch(manifestUrl);
  if (!manifestRes.ok) {
    return { category, folder, ok: false, reason: "manifest " + manifestRes.status };
  }
  const data = await manifestRes.json();
  const files = (data.images || []).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  if (!files.length) {
    return { category, folder, ok: false, reason: "no images in manifest" };
  }
  let loaded = 0;
  for (const file of files) {
    const imgUrl = absUrl(pageUrl, folderPath(folder) + encodeURIComponent(file).replace(/%20/g, "%20"));
    const url = absUrl(
      pageUrl,
      folderPath(folder) + file.split("/").map(encodeURIComponent).join("/")
    );
    const head = await fetch(url, { method: "HEAD" });
    if (head.ok) loaded++;
  }
  return {
    category,
    folder,
    ok: loaded === files.length,
    images: files.length,
    loaded,
  };
}

const mapped = Object.entries(FOLDER_MAP);
const results = [];
for (const [category, folder] of mapped) {
  results.push(await testCategory(base, category, folder));
}

const report = {
  tested: results.length,
  passed: results.filter((r) => r.ok).length,
  results,
};
fs.writeFileSync(path.join(root, "scripts", "gallery-verify-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.passed === report.tested ? 0 : 1);
