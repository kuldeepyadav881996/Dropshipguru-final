'use strict';
const https = require('https');
const crypto = require('crypto');

function get(url, opts = {}) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: opts.method || 'GET',
        headers: Object.assign(
          {
            'User-Agent': 'dropshipguru-live-verify',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
          opts.headers || {}
        ),
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: opts.raw ? buf : buf.toString('utf8'),
            buf,
          });
        });
      }
    );
    req.on('error', (e) => resolve({ status: 0, err: e.message, headers: {}, body: '', buf: Buffer.alloc(0) }));
    req.setTimeout(25000, () => {
      req.destroy();
      resolve({ status: 0, err: 'timeout', headers: {}, body: '', buf: Buffer.alloc(0) });
    });
    req.end();
  });
}

function sha1(buf) {
  return crypto.createHash('sha1').update(buf).digest('hex');
}

(async () => {
  const bust = Date.now();
  const idx = await get('https://dropshipguru.in/?v=' + bust);
  const idxNoBust = await get('https://dropshipguru.in/');
  const app = await get('https://dropshipguru.in/assets/app.css?v=' + bust);
  const refinements = await get('https://dropshipguru.in/assets/app-premium-refinements.css?v=' + bust);

  const hrefs = [...idx.body.matchAll(/href=["']([^"']+\.css[^"']*)["']/gi)].map((m) => m[1]);
  const cssResults = [];
  for (const h of hrefs) {
    if (/^https?:\/\//i.test(h)) {
      cssResults.push({ href: h, status: 'external' });
      continue;
    }
    const path = h.split('?')[0].replace(/^\//, '');
    const res = await get('https://dropshipguru.in/' + path + '?v=' + bust);
    cssResults.push({ href: h, status: res.status, bytes: res.buf.length });
  }

  // also probe known-bad old paths
  const oldPaths = [
    'assets/app-core.css',
    'assets/app-hero.css',
    'assets/app-components.css',
    'assets/app-sections.css',
    'assets/base.css',
    'assets/layout.css',
    'assets/components.css',
    'assets/mobile.css',
    'assets/premium-ui.css',
  ];
  const old = [];
  for (const p of oldPaths) {
    const res = await get('https://dropshipguru.in/' + p + '?v=' + bust);
    old.push({ path: p, status: res.status });
  }

  const markers = {
    hasAppCoreRef: /app-core\.css/.test(idx.body),
    hasAppCssRef: /assets\/app\.css/.test(idx.body),
    hasRefinementsRef: /app-premium-refinements\.css/.test(idx.body),
    hasBaseCssRef: /assets\/base\.css/.test(idx.body),
    hasPremiumUiRef: /premium-ui\.css/.test(idx.body),
  };

  console.log(
    JSON.stringify(
      {
        index: {
          status: idx.status,
          lastModified: idx.headers['last-modified'],
          etag: idx.headers.etag,
          cacheControl: idx.headers['cache-control'],
          age: idx.headers.age,
          xCache: idx.headers['x-cache'],
          via: idx.headers.via,
          server: idx.headers.server,
          bytes: idx.buf.length,
          sha1: sha1(idx.buf),
        },
        indexNoBust: {
          status: idxNoBust.status,
          lastModified: idxNoBust.headers['last-modified'],
          etag: idxNoBust.headers.etag,
          age: idxNoBust.headers.age,
          xCache: idxNoBust.headers['x-cache'],
          sha1: sha1(idxNoBust.buf),
        },
        appCss: {
          status: app.status,
          lastModified: app.headers['last-modified'],
          etag: app.headers.etag,
          bytes: app.buf.length,
          cacheControl: app.headers['cache-control'],
          xCache: app.headers['x-cache'],
        },
        refinements: {
          status: refinements.status,
          bytes: refinements.buf.length,
        },
        markers,
        cssResults,
        oldPathProbes: old,
        css404Count: cssResults.filter((r) => typeof r.status === 'number' && r.status === 404).length,
      },
      null,
      2
    )
  );
})();
