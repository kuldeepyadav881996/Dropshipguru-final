'use strict';
const https = require('https');

function get(hostname, path, opts = {}) {
  return new Promise((resolve) => {
    const req = https.get(
      {
        hostname,
        path,
        timeout: opts.timeout || 20000,
        headers: { 'User-Agent': 'DropshipGuru-LiveAudit/1.0', ...(opts.headers || {}) },
      },
      (r) => {
        const chunks = [];
        r.on('data', (c) => chunks.push(c));
        r.on('end', () => {
          const buf = Buffer.concat(chunks);
          resolve({
            status: r.statusCode,
            headers: r.headers,
            body: buf.toString('utf8'),
            bytes: buf.length,
          });
        });
      }
    );
    req.on('error', (e) => resolve({ status: 0, err: e.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, err: 'timeout' });
    });
  });
}

function post(hostname, path, bodyObj, origin) {
  const data = JSON.stringify(bodyObj || {});
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname,
        path,
        method: 'POST',
        timeout: 45000,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          Origin: origin || 'https://dropshipguru.in',
          'User-Agent': 'DropshipGuru-LiveAudit/1.0',
        },
      },
      (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () =>
          resolve({ status: r.statusCode, body: d, acao: r.headers['access-control-allow-origin'] })
        );
      }
    );
    req.on('error', (e) => resolve({ status: 0, err: e.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, err: 'timeout' });
    });
    req.write(data);
    req.end();
  });
}

function refs(html, re) {
  return [...html.matchAll(re)].map((m) => m[1] || m[0]);
}

(async () => {
  const pages = [
    '/',
    '/consultation.html',
    '/plan-details.html',
    '/about/',
    '/contact/',
    '/privacy-policy/',
    '/refund-policy/',
    '/terms-conditions/',
    '/earnings-disclaimer/',
  ];

  console.log('=== PAGE STATUS ===');
  for (const p of pages) {
    const r = await get('dropshipguru.in', p);
    console.log(r.status, p, r.bytes, 'bytes');
  }

  const idx = await get('dropshipguru.in', '/');
  const consult = await get('dropshipguru.in', '/consultation.html');

  console.log('\n=== INDEX ASSET REFS ===');
  const idxHrefs = refs(idx.body, /(?:href|src)=["']([^"']+)["']/g);
  const localIdx = idxHrefs.filter((h) => !/^(https?:|mailto:|tel:|#|\/\/)/i.test(h));
  console.log('local ref count', localIdx.length);

  console.log('\n=== CONSULT ASSET REFS ===');
  const cHrefs = refs(consult.body, /(?:href|src)=["']([^"']+)["']/g);
  const localC = [...new Set(cHrefs.filter((h) => !/^(https?:|mailto:|tel:|#|\/\/)/i.test(h)))];
  console.log(localC.join('\n'));

  console.log('\n=== RESOLVE LOCAL REFS (index+consult unique) ===');
  const all = [...new Set([...localIdx, ...localC])].filter((h) => !h.includes('{{'));
  const missing = [];
  for (const ref of all) {
    const clean = ref.split('?')[0].split('#')[0];
    if (!clean || clean.endsWith('/')) continue;
    const path = clean.startsWith('/') ? clean : '/' + clean;
    // skip anchors-only already filtered
    if (path === '/' || path.endsWith('.html') && path.includes('?')) continue;
    const r = await get('dropshipguru.in', path);
    if (r.status === 404) {
      missing.push(path);
      console.log('404', path, 'referenced');
    }
  }
  if (!missing.length) console.log('No 404s among referenced local assets');

  console.log('\n=== LIVE HTML FEATURE FLAGS ===');
  console.log('index premium-ui.css', idx.body.includes('premium-ui.css'));
  console.log('index app-core.css', idx.body.includes('app-core.css'));
  console.log('index assets/mobile.css', idx.body.includes('assets/mobile.css'));
  console.log('index mobile-layout.css', idx.body.includes('mobile-layout.css'));
  console.log('consult style blocks', (consult.body.match(/<style/gi) || []).length);
  console.log('consult consultation.css', consult.body.includes('consultation.css'));
  console.log('consult premium-ui', consult.body.includes('premium-ui'));
  console.log('consult payment-client', consult.body.includes('payment-client.js'));
  console.log('consult google-sheet', consult.body.includes('google-sheet-submit.js'));
  console.log('consult localhost API force', /localhost:5000/.test(consult.body));
  console.log(
    'consult DROPSHIPGURU_API_BASE logic',
    consult.body.includes('DROPSHIPGURU_API_BASE')
  );

  const payJs = await get('dropshipguru.in', '/payment-client.js');
  const sheetJs = await get('dropshipguru.in', '/google-sheet-submit.js');
  console.log('\n=== CLIENT JS ===');
  console.log('payment-client', payJs.status, payJs.bytes);
  console.log('has create-order', payJs.body.includes('create-order'));
  console.log('has verify', payJs.body.includes('verify'));
  console.log('has ondismiss', payJs.body.includes('ondismiss'));
  console.log('API base prod', payJs.body.includes('dropshipgurufi-api.onrender.com'));
  console.log('sheet js', sheetJs.status, sheetJs.bytes);
  console.log('GAS macros', /script\.google\.com\/macros/.test(sheetJs.body));
  const gas = (sheetJs.body.match(/https:\/\/script\.google\.com[^"'\s]+/) || [])[0];
  console.log('GAS url', gas);

  console.log('\n=== API ===');
  const health = await get('dropshipgurufi-api.onrender.com', '/api/health', { timeout: 45000 });
  console.log('health', health.status, (health.body || '').slice(0, 160));
  const order = await post('dropshipgurufi-api.onrender.com', '/api/payment/create-order', {
    amount: 100,
    currency: 'INR',
    customer: { name: 'Live Audit', email: 'audit@example.com', contact: '9999999999' },
  });
  console.log('create-order', order.status, order.acao, (order.body || '').slice(0, 220));
  const verify = await post('dropshipgurufi-api.onrender.com', '/api/payment/verify', {
    razorpay_order_id: 'order_x',
    razorpay_payment_id: 'pay_x',
    razorpay_signature: 'bad',
  });
  console.log('verify-bad', verify.status, (verify.body || '').slice(0, 220));

  if (gas) {
    const gasHost = 'script.google.com';
    const gasPath = gas.replace('https://script.google.com', '');
    // Apps Script often 302; just check reachable
    const g = await get(gasHost, gasPath, { timeout: 30000 });
    console.log('GAS GET', g.status, g.bytes, (g.headers && g.headers.location) || '');
  }

  console.log('\nMISSING_COUNT', missing.length);
})();
