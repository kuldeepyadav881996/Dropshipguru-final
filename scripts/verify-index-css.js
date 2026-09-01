'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const hrefs = [...html.matchAll(/href=["']([^"']+\.css[^"']*)["']/gi)].map((m) => m[1]);
const local = [];
const missing = [];

hrefs.forEach((href) => {
  if (/^https?:\/\//i.test(href)) {
    local.push({ href, status: 'external' });
    return;
  }
  const file = path.join(ROOT, href.split('?')[0]);
  if (fs.existsSync(file)) local.push({ href, status: 'OK', bytes: fs.statSync(file).size });
  else {
    missing.push(href);
    local.push({ href, status: 'MISSING' });
  }
});

console.log('=== LOCAL index.html CSS ===');
local.forEach((r) =>
  console.log(
    (r.status === 'OK' || r.status === 'external' ? '✅' : '❌'),
    r.href,
    r.bytes != null ? '(' + r.bytes + ' bytes)' : r.status
  )
);
console.log('MISSING_LOCAL', missing.length);

function get(url) {
  const lib = url.startsWith('https') ? https : http;
  return new Promise((resolve) => {
    lib
      .get(url, { timeout: 20000 }, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      })
      .on('error', (e) => resolve({ status: 0, body: '', err: e.message }));
  });
}

(async () => {
  const live = await get('https://dropshipguru.in/');
  const liveHrefs = [...live.body.matchAll(/href=["']([^"']+\.css[^"']*)["']/gi)].map((m) => m[1]);
  console.log('\n=== LIVE index.html CSS refs ===');
  for (const href of liveHrefs) {
    if (/^https?:\/\//i.test(href)) {
      console.log('🔗', href);
      continue;
    }
    const abs = href.startsWith('/')
      ? 'https://dropshipguru.in' + href.split('?')[0]
      : 'https://dropshipguru.in/' + href.split('?')[0];
    const res = await get(abs);
    console.log(res.status === 200 ? '✅' : '❌', res.status, href);
  }

  if (missing.length) process.exit(1);
})();
