import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const base = "http://localhost:8765";

const FOLDER_MAP = {
  "Beauty & Care": "Beauty & Care",
  "Eco-Friendly Products": "Eco Friendly Product",
  "Eco Friendly Product": "Eco Friendly Product",
  Gardening: "Gardning",
  "Gift Items": "Gift Items",
  "Hand Bags": "Hnad Bag",
  "Hand Bag": "Hnad Bag",
  "Home & Kitchen": "Home & Kitchen",
  "Home Decor": "Home Decor",
  "Ladies Wear": "Ladies Wear",
  "Ladies Footwear": "Ldies Foot wear",
  "Ladies Foot Wear": "Ldies Foot wear",
  "Spiritual Products": "Spiritual Product",
  "Spiritual Product": "Spiritual Product",
  "Toys & Baby": "Toys & Baby",
  "Travel Backpack": "Travel Bagpack",
  Jewellery: "Jewellery",
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

function fileUrl(folder, file) {
  return folderPath(folder) + file.split("/").map(encodeURIComponent).join("/");
}

async function checkFolder(folder) {
  const basePath = folderPath(folder);
  const manifestUrl = base + "/" + basePath + "manifest.json";
  const manifestRes = await fetch(manifestUrl);
  let files = [];
  if (manifestRes.ok) {
    const data = await manifestRes.json();
    files = (data.images || data.files || []).filter((f) =>
      /\.(jpe?g|png|webp)$/i.test(f)
    );
  }
  const imageResults = [];
  for (const file of files) {
    const url = base + "/" + fileUrl(folder, file);
    const imgRes = await fetch(url, { method: "HEAD" });
    imageResults.push({ file, status: imgRes.status, ok: imgRes.ok });
  }
  return { folder, manifestStatus: manifestRes.status, files, imageResults };
}

const folders = [...new Set(Object.values(FOLDER_MAP))].sort();
const results = [];
for (const folder of folders) {
  results.push(await checkFolder(folder));
}

const html = fs.readFileSync(path.join(root, "Index.html"), "utf8");
const categories = [...html.matchAll(/<h3>([^<]+)<\/h3>/g)]
  .map((m) => m[1].trim())
  .filter((name, i, arr) => {
    const section = html.indexOf('id="categories"');
    const pos = html.indexOf("<h3>" + name + "</h3>");
    return pos > section && pos < html.indexOf('id="tools"');
  });

console.log("=== CATEGORY MAP ===");
for (const cat of categories) {
  console.log(cat + " -> " + (FOLDER_MAP[cat] || "NO MAP"));
}

console.log("\n=== FOLDER CHECKS ===");
let failures = 0;
for (const r of results) {
  const bad = r.imageResults.filter((x) => !x.ok);
  console.log(
    r.folder +
      ": manifest=" +
      r.manifestStatus +
      " images=" +
      r.files.length +
      " ok=" +
      (r.files.length - bad.length) +
      "/" +
      r.files.length
  );
  bad.forEach((b) => console.log("  FAIL " + b.file + " HTTP " + b.status));
  if (bad.length || r.manifestStatus !== 200) failures++;
}
console.log("\nTotal failures: " + failures);
process.exit(failures ? 1 : 0);
