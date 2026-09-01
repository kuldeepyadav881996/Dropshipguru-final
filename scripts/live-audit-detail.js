'use strict';
const https = require('https');
const http = require('http');

function get(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: 20000 }, (r) => {
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => resolve({ status: r.statusCode, body: d, headers: r.headers }));
    });
    req.on('error', (e) => resolve({ status: 0, err: e.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, err: 'timeout' });
    });
  });
}

(async () => {
  const c = await get('https://dropshipguru.in/consultation.html');
  const pay = await get('https://dropshipguru.in/payment-client.js');
  const sheet = await get('https://dropshipguru.in/google-sheet-submit.js');
  const idx = await get('https://dropshipguru.in/');

  console.log('=== consultation API bootstrap ===');
  const snip = c.body.match(/DROPSHIPGURU_API_BASE[\s\S]{0,500}/);
  console.log(snip ? snip[0] : 'NOT FOUND');

  console.log('\n=== payment-client localhost guard? ===');
  console.log('mentions localhost', /localhost/.test(pay.body));
  console.log('mentions render API', /dropshipgurufi-api\.onrender\.com/.test(pay.body));
  console.log('ignores localhost on deployed?', /pageIsLocal|isLocal|127\.0\.0\.1/.test(pay.body));

  console.log('\n=== GAS ===');
  console.log((sheet.body.match(/https:\/\/script\.google\.com[^'"`]+/) || [])[0]);
  console.log('uses /a/macros/', /\/a\/macros\//.test(sheet.body));
  console.log('uses /macros/s/', /\/macros\/s\//.test(sheet.body));

  console.log('\n=== index.html casing ===');
  console.log('index.html count', (idx.body.match(/Index\.html/g) || []).length);
  const ix = await get('https://dropshipguru.in/index.html');
  console.log('GET /index.html', ix.status);

  // Compare public vs org GAS
  const publicGas =
    'https://script.google.com/macros/s/AKfycbzpPiH8gpzHvk9-AEHEKDq5WT7XnEsfJVIIz-ki3-BCprd4xLGaNQ2FJFHoyfy-qtlafQ/exec';
  const orgGas =
    'https://script.google.com/macros/s/AKfycbzpPiH8gpzHvk9-AEHEKDq5WT7XnEsfJVIIz-ki3-BCprd4xLGaNQ2FJFHoyfy-qtlafQ/exec';
  for (const u of [publicGas, orgGas]) {
    const r = await get(u);
    console.log('GAS', u.includes('/a/') ? 'ORG' : 'PUBLIC', r.status, r.err || '', (r.headers && r.headers.location) || '');
  }
})();
