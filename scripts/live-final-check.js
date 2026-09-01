'use strict';
const https = require('https');

function get(u) {
  return new Promise((resolve) => {
    https
      .get(u, { timeout: 25000 }, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      })
      .on('error', (e) => resolve({ status: 0, body: '', err: e.message }));
  });
}

(async () => {
  const idx = await get('https://dropshipguru.in/');
  const pay = await get('https://dropshipguru.in/payment-client.js');
  const sheet = await get('https://dropshipguru.in/google-sheet-submit.js');
  const consult = await get('https://dropshipguru.in/consultation.html');
  const health = await get('https://dropshipgurufi-api.onrender.com/health');

  const issues = [];
  if (/Index\.html/.test(idx.body)) issues.push('LIVE index still links Index.html (404)');
  if (!/fullName/.test(pay.body) || !/CUSTOMER_FIELDS|budget/.test(pay.body)) {
    issues.push('LIVE payment-client verify lacks full customer fields');
  }
  if (/\/a\/macros\//.test(sheet.body)) issues.push('LIVE google-sheet-submit uses workspace GAS URL');
  if (!/script\.google\.com\/macros\/s\//.test(sheet.body)) {
    issues.push('LIVE google-sheet-submit missing public macros URL');
  }
  if (/localhost:5000/.test(consult.body)) issues.push('LIVE consultation forces localhost API');
  if (health.status !== 200) issues.push('LIVE API health not 200');

  console.log('LIVE Index.html count', (idx.body.match(/Index\.html/g) || []).length);
  console.log('LIVE payment size', pay.body.length, 'has fullName', /fullName/.test(pay.body));
  console.log(
    'LIVE GAS',
    (sheet.body.match(/https:\/\/script\.google\.com[^"'\s]+/) || [])[0] || '(none)'
  );
  console.log('LIVE consult localhost', /localhost:5000/.test(consult.body));
  console.log('LIVE API health', health.status);
  console.log('REAL_LIVE_ISSUES', issues.length);
  issues.forEach((i) => console.log(' -', i));
})();
