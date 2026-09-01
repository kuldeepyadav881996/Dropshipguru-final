'use strict';
const https = require('https');

function get(url) {
  return new Promise((resolve) => {
    https
      .get(url, { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } }, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            body: d,
            lastModified: res.headers['last-modified'],
            etag: res.headers.etag,
          })
        );
      })
      .on('error', (e) => resolve({ status: 0, err: e.message, body: '' }));
  });
}

(async () => {
  const bust = Date.now();
  const idx = await get('https://dropshipguru.in/?v=' + bust);
  console.log('index', idx.status, 'last-modified', idx.lastModified, 'etag', idx.etag);
  const hrefs = [...idx.body.matchAll(/href=["']([^"']+\.css[^"']*)["']/gi)].map((m) => m[1]);
  console.log('CSS refs:');
  for (const h of hrefs) {
    if (/^https?:\/\//i.test(h)) {
      console.log('  EXT', h);
      continue;
    }
    const path = h.split('?')[0].replace(/^\//, '');
    const res = await get('https://dropshipguru.in/' + path + '?v=' + bust);
    console.log(res.status === 200 ? '  OK ' : '  BAD', res.status, h);
  }
  console.log('has app-core?', /app-core\.css/.test(idx.body));
  console.log('has app.css?', /assets\/app\.css/.test(idx.body));
  console.log('has refinements?', /app-premium-refinements\.css/.test(idx.body));
})();
