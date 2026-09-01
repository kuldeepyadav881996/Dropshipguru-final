import fs from "node:fs";

const path = "C:/Users/WeShippX/Desktop/New folder/Index.html";
let html = fs.readFileSync(path, "utf8");
const pattern =
  /<p>Everything connected and automated[^<]*you focus on selling, we handle the tech\.<\/p>/;
const replacement = `<p>Everything connected and automated \u2726 you focus on selling, we handle the tech.</p>
    <div class="tools-platform-trust" aria-label="Service guarantees">
      <span class="tools-platform-trust-chip">Verified Setup</span>
      <span class="tools-platform-trust-chip">Lifetime Support</span>
      <span class="tools-platform-trust-chip">Dedicated Experts</span>
    </div>`;

if (!pattern.test(html)) {
  console.error("Pattern not found");
  process.exit(1);
}

html = html.replace(pattern, replacement);
fs.writeFileSync(path, html);
console.log("Patched trust chips");
