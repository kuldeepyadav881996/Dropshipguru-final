// Read-only verification: internal link resolution, JSON-LD validity,
// canonical presence, leftover placeholders.
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const PAGES = [
  "index.html",
  "consultation.html",
  "plan-details.html",
  "about/index.html",
  "contact/index.html",
  "privacy-policy/index.html",
  "terms-conditions/index.html",
  "refund-policy/index.html",
  "earnings-disclaimer/index.html",
];

const SKIP = /^(https?:|mailto:|tel:|javascript:|data:|#|\/\/)/i;
let problems = 0;

function resolveHref(pageRel, href) {
  href = href.split("#")[0].split("?")[0];
  if (!href) return null;
  let target;
  if (href.startsWith("/")) target = path.join(ROOT, href);
  else target = path.join(ROOT, path.dirname(pageRel), href);
  // directory -> index.html
  if (href.endsWith("/") || (!path.extname(target) && fs.existsSync(target) && fs.statSync(target).isDirectory()))
    target = path.join(target, "index.html");
  if (!path.extname(target)) target = path.join(target, "index.html");
  return target;
}

for (const pageRel of PAGES) {
  const abs = path.join(ROOT, pageRel);
  if (!fs.existsSync(abs)) { console.log(`MISSING PAGE: ${pageRel}`); problems++; continue; }
  const html = fs.readFileSync(abs, "utf8");

  // canonical
  if (!/<link\s+rel="canonical"/i.test(html)) { console.log(`NO CANONICAL: ${pageRel}`); problems++; }
  // placeholders
  if (/XXXX/.test(html)) { console.log(`PLACEHOLDER (XXXX): ${pageRel}`); problems++; }

  // JSON-LD validity
  const ld = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  let ldCount = 0;
  for (const m of ld) {
    ldCount++;
    try { JSON.parse(m[1]); } catch (e) { console.log(`BAD JSON-LD in ${pageRel}: ${e.message}`); problems++; }
  }

  // internal links
  const links = [...html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
  const broken = [];
  for (const href of links) {
    if (SKIP.test(href)) continue;
    const t = resolveHref(pageRel, href);
    if (t && !fs.existsSync(t)) broken.push(`${href} -> ${path.relative(ROOT, t)}`);
  }
  if (broken.length) { problems += broken.length; console.log(`BROKEN LINKS in ${pageRel}:\n   ` + broken.join("\n   ")); }
  console.log(`OK ${pageRel}: ${links.length} links, ${ldCount} JSON-LD blocks`);
}

// static production files
for (const f of ["robots.txt", "sitemap.xml", "site.webmanifest", "favicon.ico",
  "assets/icons/favicon-32.png", "assets/icons/apple-touch-icon.png",
  "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/maskable-512.png"]) {
  if (!fs.existsSync(path.join(ROOT, f))) { console.log(`MISSING FILE: ${f}`); problems++; }
}

console.log(problems === 0 ? "\nALL CHECKS PASSED ✅" : `\n${problems} PROBLEM(S) FOUND ❌`);
