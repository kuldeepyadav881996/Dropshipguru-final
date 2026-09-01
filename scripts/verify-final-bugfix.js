'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const issues = [];

function fail(msg) {
  issues.push(msg);
  console.log('❌', msg);
}
function ok(msg) {
  console.log('✅', msg);
}

const pay = fs.readFileSync(path.join(ROOT, 'payment-client.js'), 'utf8');
const sheet = fs.readFileSync(path.join(ROOT, 'google-sheet-submit.js'), 'utf8');
const consult = fs.readFileSync(path.join(ROOT, 'consultation.html'), 'utf8');
const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const gss = fs.readFileSync(
  path.join(ROOT, 'backend', 'services', 'googleSheetsService.js'),
  'utf8'
);

if (/localhost:5000|127\.0\.0\.1:5000/.test(pay)) fail('payment-client still has localhost');
else ok('payment-client has no localhost');

if (!pay.includes('https://dropshipgurufi-api.onrender.com')) fail('payment-client missing Render API');
else ok('payment-client uses Render API');

[
  'fullName',
  'mobile',
  'email',
  'state',
  'profession',
  'selectedPlan',
  'selectedPlatform',
  'selectedService',
  'budget',
  'price',
  'message',
].forEach((f) => {
  if (!pay.includes("'" + f + "'") && !pay.includes('"' + f + '"')) fail('payment-client missing field ' + f);
});
ok('payment-client customer field list present');

if (!pay.includes('/api/payment/verify')) fail('verify path missing');
else ok('verify path present');

if (/\/a\/macros\//.test(sheet)) fail('google-sheet-submit uses workspace GAS URL');
else ok('google-sheet-submit uses public macros URL');

if (!/script\.google\.com\/macros\/s\//.test(sheet)) fail('public GAS URL missing');
else ok('public GAS URL present');

if (/localhost:5000/.test(consult)) fail('consultation.html still sets localhost API');
else ok('consultation.html has no localhost API');

if (!consult.includes("DROPSHIPGURU_API_BASE = 'https://dropshipgurufi-api.onrender.com'")) {
  fail('consultation API base not forced to Render');
} else ok('consultation API base is Render');

if (!consult.includes("budget:formData.budget") && !consult.includes('budget:formData.budget||')) {
  // check formData block
  if (!/budget:\s*formData\.budget/.test(consult)) fail('consultation paid formData missing budget');
  else ok('consultation paid formData includes budget');
} else ok('consultation paid formData includes budget');

if (!consult.includes('id="budget"')) fail('budget field missing from consultation form');
else ok('budget field in consultation form');

if (/Index\.html/.test(index)) fail('index.html still contains Index.html');
else ok('index.html has no Index.html links');

if (!gss.includes("'budget'")) fail('backend sheets service missing budget');
else ok('backend sheets service includes budget');

if (!/orderId|paymentId|timestamp/.test(gss)) fail('backend sheets missing payment meta');
else ok('backend sheets includes payment meta');

// Scan production frontend files for leftovers
function walk(d, out) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', '.git', '_perf-backup', 'scripts', 'backend'].includes(e.name) && d === ROOT)
      continue;
    if (['node_modules', '.git'].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(html|js)$/i.test(e.name)) out.push(p);
  }
  return out;
}

const files = walk(ROOT, []);
files.forEach((f) => {
  const rel = path.relative(ROOT, f);
  if (rel.startsWith('backend' + path.sep)) return;
  if (rel.startsWith('scripts' + path.sep)) return;
  const s = fs.readFileSync(f, 'utf8');
  if (/Index\.html/.test(s)) fail(rel + ' contains Index.html');
  if (/\/a\/macros\//.test(s)) fail(rel + ' contains workspace GAS URL');
  if (/localhost:5000/.test(s) && !/ENV_SETUP|BACKEND_SETUP|DEPLOYMENT/.test(rel)) {
    // allow nothing in shipped html/js
    if (/\.(html|js)$/.test(rel)) fail(rel + ' contains localhost:5000');
  }
});

function get(url) {
  return new Promise((resolve) => {
    https
      .get(url, { timeout: 25000 }, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      })
      .on('error', (e) => resolve({ status: 0, err: e.message }));
  });
}

function post(hostname, pathName, body) {
  const data = JSON.stringify(body);
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname,
        path: pathName,
        method: 'POST',
        timeout: 45000,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          Origin: 'https://dropshipguru.in',
        },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      }
    );
    req.on('error', (e) => resolve({ status: 0, err: e.message }));
    req.write(data);
    req.end();
  });
}

(async () => {
  console.log('\n=== LIVE RE-AUDIT (deployed site) ===');
  const livePay = await get('https://dropshipguru.in/payment-client.js');
  const liveSheet = await get('https://dropshipguru.in/google-sheet-submit.js');
  const liveConsult = await get('https://dropshipguru.in/consultation.html');
  const liveIndex = await get('https://dropshipguru.in/');

  const liveIssues = [];
  const note = (msg, bad) => {
    console.log(bad ? '❌ LIVE' : '✅ LIVE', msg);
    if (bad) liveIssues.push(msg);
  };

  note(
    'payment-client uses Render only',
    !(
      livePay.body.includes('dropshipgurufi-api.onrender.com') &&
      !/localhost:5000/.test(livePay.body)
    )
  );
  note(
    'payment verify includes customer fields (fullName)',
    !/fullName/.test(livePay.body)
  );
  note('GAS public macros URL', !/\/macros\/s\//.test(liveSheet.body) || /\/a\/macros\//.test(liveSheet.body));
  note('consultation no localhost API', /localhost:5000/.test(liveConsult.body));
  note('index has no Index.html', /Index\.html/.test(liveIndex.body));

  const health = await get('https://dropshipgurufi-api.onrender.com/api/health');
  note('API health 200', health.status !== 200);

  const order = await post('dropshipgurufi-api.onrender.com', '/api/payment/create-order', {
    amount: 100,
    currency: 'INR',
    customer: { name: 'Audit', email: 'a@b.com', contact: '9999999999' },
  });
  note('create-order 201', order.status !== 201);

  console.log('\nLOCAL_FAILS', issues.length);
  console.log('LIVE_FAILS', liveIssues.length);
  if (liveIssues.length) {
    console.log('\nLIVE still broken until deploy:');
    liveIssues.forEach((i) => console.log(' -', i));
  }
  process.exit(issues.length ? 1 : 0);
})();
