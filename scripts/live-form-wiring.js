'use strict';
const https = require('https');

function get(url) {
  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve(d));
      })
      .on('error', () => resolve(''));
  });
}

(async () => {
  const c = await get('https://dropshipguru.in/consultation.html');
  const i = c.indexOf('startCheckout');
  console.log('startCheckout idx', i);
  console.log(c.slice(Math.max(0, i - 250), i + 700));
  const j = c.indexOf('submitToGoogleSheet');
  console.log('\n--- sheets call ---');
  console.log(c.slice(Math.max(0, j - 120), j + 450));
  const s = await get('https://dropshipguru.in/google-sheet-submit.js');
  console.log('\n--- sheet js ---');
  console.log(s.slice(0, 900));
  console.log('budget in sheet js', /budget/i.test(s));
  console.log('no-cors', /no-cors/.test(s));
  console.log('mode cors', /mode:\s*['"]cors['"]/.test(s));

  // Probe index.html from gallery
  const idx = await get('https://dropshipguru.in/');
  const matches = [...idx.matchAll(/href=["']([^"']*Index\.html[^"']*)["']/g)].map((m) => m[1]);
  console.log('\nindex.html hrefs', matches);

  // Performance: transfer sizes for key assets
  const assets = [
    'https://dropshipguru.in/assets/app.css',
    'https://dropshipguru.in/hero-character.webp',
    'https://dropshipguru.in/hero-character.png',
    'https://dropshipguru.in/consultation.html',
  ];
  for (const u of assets) {
    await new Promise((resolve) => {
      https
        .get(u, (res) => {
          let n = 0;
          res.on('data', (c) => (n += c.length));
          res.on('end', () => {
            console.log(res.statusCode, n, u.replace('https://dropshipguru.in', ''));
            resolve();
          });
        })
        .on('error', resolve);
    });
  }
})();
