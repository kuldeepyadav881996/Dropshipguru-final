'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const checks = [];

function ok(m) { checks.push(['PASS', m]); }
function warn(m) { checks.push(['WARN', m]); }
function fail(m) { checks.push(['FAIL', m]); }

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }

// Syntax via require of files as text + key markers
['payment-client.js', 'google-sheet-submit.js', 'assets/premium-ui.js'].forEach((f) => {
  try {
    require('child_process').execFileSync(process.execPath, ['--check', path.join(ROOT, f)], {
      stdio: 'pipe',
    });
    ok('syntax ' + f);
  } catch (e) {
    fail('syntax ' + f + ' ' + e.message);
  }
});

const pay = read('payment-client.js');
[
  ['create-order', 'create-order'],
  ['verify', 'verify'],
  ['DropshipGuruPayments', 'DropshipGuruPayments'],
  ['ondismiss', 'ondismiss'],
  ['payment.failed', 'payment.failed'],
].forEach(([l, n]) => (pay.includes(n) ? ok('payment has ' + l) : fail('payment missing ' + l)));

const sheet = read('google-sheet-submit.js');
/script\.google\.com\/macros/.test(sheet) ? ok('GAS URL') : fail('GAS URL missing');
sheet.includes('GoogleSheetSubmit') ? ok('GoogleSheetSubmit export') : fail('GoogleSheetSubmit missing');

const index = read('index.html');
const premiumCount = (index.match(/premium-ui\.css/g) || []).length;
premiumCount <= 2 ? ok('index premium-ui refs=' + premiumCount + ' (preload+noscript)') : fail('index premium-ui duplicate count=' + premiumCount);

!/assets\/premium-ui\.css">\s*<link rel="stylesheet" href="assets\/mobile/.test(index)
  ? ok('index end-body has no premium-ui sync duplicate')
  : fail('index still sync-loads premium-ui at end');

['app-core.css', 'app-hero.css', 'app-components.css', 'app-sections.css'].forEach((f) => {
  index.includes('assets/' + f) && exists('assets/' + f)
    ? ok('split css linked: ' + f)
    : fail('missing split css: ' + f);
});

const ml = read('mobile-layout.css');
ml.includes('@import') ? fail('mobile-layout still uses @import') : ok('mobile-layout has no @import');

// HTTP checks
function get(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: 20000 }, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on('error', () => resolve(0));
    req.on('timeout', () => {
      req.destroy();
      resolve(0);
    });
  });
}

(async () => {
  const bases = ['http://127.0.0.1:5500', 'http://127.0.0.1:64679'];
  let base = null;
  for (const b of bases) {
    const s = await get(b + '/');
    if (s === 200 || s === 301 || s === 302) {
      base = b;
      break;
    }
  }
  if (!base) {
    warn('local server not reachable on 5500/64679');
  } else {
    ok('local server ' + base);
    const paths = [
      '/',
      '/assets/app-core.css',
      '/assets/app-hero.css',
      '/assets/app-components.css',
      '/assets/app-sections.css',
      '/assets/premium-ui.css',
      '/assets/mobile.css',
      '/payment-client.js',
      '/google-sheet-submit.js',
      '/consultation.html',
    ];
    for (const p of paths) {
      const st = await get(base + p);
      st === 200 || st === 301 ? ok('HTTP ' + st + ' ' + p) : fail('HTTP ' + st + ' ' + p);
    }
  }

  const health = await get('https://dropshipgurufi-api.onrender.com/api/health');
  health === 200 ? ok('API health 200') : warn('API health ' + health);

  console.log('\n=== PRODUCTION PASS VERIFY ===');
  checks.forEach(([k, m]) => console.log(k === 'PASS' ? '✅' : k === 'WARN' ? '⚠' : '❌', m));
  const fails = checks.filter((c) => c[0] === 'FAIL').length;
  console.log('FAILS', fails);
  process.exit(fails ? 1 : 0);
})();
