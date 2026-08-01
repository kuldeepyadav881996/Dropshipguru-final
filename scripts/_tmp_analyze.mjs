import fs from 'node:fs';

const files = ['index.html', 'consultation.html', 'plan-details.html'];
for (const f of files) {
  const p = new URL('../' + f, import.meta.url);
  let c;
  try { c = fs.readFileSync(p, 'utf8'); } catch { console.log(`(skip ${f})`); continue; }
  const re = /data:image\/([a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)/g;
  let m, i = 0;
  const rows = [];
  while ((m = re.exec(c)) !== null) {
    i++;
    const start = m.index;
    const before = c.slice(Math.max(0, start - 30), start);
    const ctx = /src\s*=\s*["']?$/.test(before) ? 'img-src'
      : /url\(\s*$/.test(before) ? 'css-url'
      : 'other:' + JSON.stringify(before.slice(-14));
    rows.push({ n: i, ext: m[1], b64len: m[2].length, approxKB: Math.round(m[2].length * 0.75 / 1024), ctx });
  }
  console.log(`\n===== ${f} =====  base64 images: ${rows.length}`);
  for (const r of rows) console.log(`  #${r.n} ${r.ext} ~${r.approxKB}KB ${r.ctx}`);
}

// On-disk image references
const idx = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
for (const pat of ['hero-character', 'logo.png', 'logo (1)', 'assets/categories', 'assets/catalogues']) {
  const count = (idx.match(new RegExp(pat.replace(/[.()/]/g, '\\$&'), 'g')) || []).length;
  console.log(`ref index.html "${pat}": ${count}`);
}
