import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "Index.html"), "utf8");
const start = html.indexOf('id="categories"');
const end = html.indexOf('id="tools"');
const section = html.slice(start, end);
const titles = [...section.matchAll(/<h3>([^<]+)<\/h3>/g)].map((m) => m[1].trim());
console.log(titles.join("\n"));
