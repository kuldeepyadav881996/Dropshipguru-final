'use strict';
/**
 * Read-only QA audit — does not modify project files.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const report = { passed: [], warn: [], fail: [] };

function ok(msg) { report.passed.push(msg); }
function warn(msg, file, line, reason, fix) {
  report.warn.push({ msg, file, line, reason, fix });
}
function fail(msg, file, line, reason, fix) {
  report.fail.push({ msg, file, line, reason, fix });
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function lineOf(hay, needle) {
  const i = hay.indexOf(needle);
  if (i < 0) return null;
  return hay.slice(0, i).split(/\r?\n/).length;
}

// --- HTML / assets ---
const pages = [
  'index.html',
  'consultation.html',
  'plan-details.html',
  'about/index.html',
  'contact/index.html',
  'privacy-policy/index.html',
  'refund-policy/index.html',
  'terms-conditions/index.html',
  'earnings-disclaimer/index.html',
];

pages.forEach((p) => {
  if (!exists(p)) fail('Missing page', p, null, 'File not found', 'Restore or fix links');
  else ok('Page exists: ' + p);
});

const criticalAssets = [
  'assets/base.css',
  'assets/components.css',
  'assets/layout.css',
  'assets/mobile.css',
  'assets/premium-ui.css',
  'assets/premium-ui.js',
  'assets/app.css',
  'assets/consultation.css',
  'assets/consultation-footer.css',
  'assets/consultation-motion.css',
  'payment-client.js',
  'google-sheet-submit.js',
  'brand-icons.css',
  'brand-icons.js',
  'logo.png',
  'hero-character.png',
  'hero-character.webp',
  'hero-character-mobile.webp',
  'favicon.ico',
  'site.webmanifest',
  'assets/icons/favicon-32.png',
  'assets/icons/favicon-16.png',
  'assets/icons/apple-touch-icon.png',
];

criticalAssets.forEach((a) => {
  if (!exists(a)) fail('Missing asset', a, null, 'Referenced asset missing', 'Add file or fix reference');
  else ok('Asset exists: ' + a);
});

// Extract local href/src from HTML pages
const localRefRe = /(?:href|src)=["']([^"'#?][^"']*)["']/gi;
const missingRefs = new Map();

pages.forEach((page) => {
  if (!exists(page)) return;
  const html = read(page);
  const baseDir = path.dirname(path.join(ROOT, page));
  let m;
  while ((m = localRefRe.exec(html))) {
    let ref = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(ref)) continue;
    if (ref.startsWith('//')) continue;
    // strip leading /
    const relFromRoot = ref.startsWith('/')
      ? ref.slice(1)
      : path.relative(ROOT, path.resolve(baseDir, ref)).replace(/\\/g, '/');
    if (relFromRoot.startsWith('..')) continue;
    if (!exists(relFromRoot)) {
      const key = page + ' -> ' + ref;
      if (!missingRefs.has(key)) missingRefs.set(key, lineOf(html, m[0]));
    }
  }
});

if (missingRefs.size === 0) ok('No missing local href/src assets on audited pages');
else {
  [...missingRefs.entries()].slice(0, 40).forEach(([key, line]) => {
    const [file, ref] = key.split(' -> ');
    fail('Broken local link/asset', file, line, 'Missing: ' + ref, 'Restore asset or update URL');
  });
}

// Tag balance heuristics (not a full HTML parser)
pages.forEach((page) => {
  if (!exists(page)) return;
  const html = read(page);
  ['html', 'head', 'body', 'form'].forEach((tag) => {
    const open = (html.match(new RegExp('<' + tag + '\\b', 'gi')) || []).length;
    const close = (html.match(new RegExp('</' + tag + '>', 'gi')) || []).length;
    if (open !== close) {
      warn(
        'Possible unclosed <' + tag + '>',
        page,
        null,
        'open=' + open + ' close=' + close,
        'Validate HTML in browser / W3C validator'
      );
    }
  });
  if (!/<\/html>/i.test(html)) fail('Missing </html>', page, null, 'Document not closed', 'Add closing tag');
  else ok('Has </html>: ' + page);
});

// --- JS deferred race on consultation ---
const consult = read('consultation.html');
const deferPay = /payment-client\.js"\s+defer/.test(consult);
const deferSheet = /google-sheet-submit\.js"\s+defer/.test(consult);
if (deferPay && deferSheet) ok('Payment/Sheets scripts deferred on consultation');
else fail('Payment scripts not deferred as expected', 'consultation.html', null, 'defer missing', 'Confirm script tags');

// Inline uses guarded window.DropshipGuruPayments?
if (/window\.DropshipGuruPayments\?/.test(consult) || /window\.DropshipGuruPayments/.test(consult)) {
  ok('Consultation guards DropshipGuruPayments usage');
} else {
  warn('No DropshipGuruPayments guard found', 'consultation.html', null, 'May throw if script fails to load', 'Guard with window.DropshipGuruPayments checks');
}

// Form required fields
const requiredCount = (consult.match(/\brequired\b/g) || []).length;
if (requiredCount >= 5) ok('Form has required attributes (count=' + requiredCount + ')');
else warn('Few required attributes', 'consultation.html', null, 'count=' + requiredCount, 'Confirm validation coverage');

// --- Payment client static analysis ---
const pay = read('payment-client.js');
[
  ['create-order', "/api/payment/create-order"],
  ['verify', "/api/payment/verify"],
  ['ondismiss', 'ondismiss'],
  ['payment.failed', "payment.failed"],
  ['loadRazorpayCheckout', 'loadRazorpayCheckout'],
  ['customer fields', 'pickCustomerFields'],
].forEach(([label, needle]) => {
  if (pay.includes(needle)) ok('payment-client has ' + label);
  else fail('payment-client missing ' + label, 'payment-client.js', lineOf(pay, needle), 'Logic absent', 'Restore payment flow');
});

const sheet = read('google-sheet-submit.js');
if (/script\.google\.com\/macros/.test(sheet)) ok('Google Apps Script URL present');
else fail('GAS URL missing', 'google-sheet-submit.js', null, 'Sheets integration URL not found', 'Restore public GAS URL');

// Backend routes
const routes = exists('backend/routes/paymentRoutes.js') ? read('backend/routes/paymentRoutes.js') : '';
if (/create-order/.test(routes) && /verify/.test(routes)) ok('Backend payment routes present');
else warn('Backend routes not verified locally', 'backend/routes/paymentRoutes.js', null, 'File missing or incomplete', 'Ensure Render deploy has routes');

// CSS architecture
['base.css', 'components.css', 'layout.css', 'mobile.css', 'premium-ui.css'].forEach((f) => {
  const p = 'assets/' + f;
  if (exists(p) && fs.statSync(path.join(ROOT, p)).size > 0) ok('CSS layer present: ' + f);
  else fail('CSS layer missing', p, null, 'Empty or absent', 'Restore CSS file');
});

// Duplicate / conflict signals
if (exists('mobile-layout.css')) {
  const ml = read('mobile-layout.css');
  if (/@import\s+url\(["']assets\/mobile\.css["']\)/.test(ml)) {
    warn(
      'mobile-layout.css is @import shim',
      'mobile-layout.css',
      1,
      '@import adds extra request if anything still links mobile-layout.css',
      'Prefer linking assets/mobile.css only'
    );
  }
}

// Index still links end-body CSS + head preload (possible double fetch)
const index = read('index.html');
const premiumHead = (index.match(/premium-ui\.css/g) || []).length;
if (premiumHead >= 2) {
  warn(
    'premium-ui.css referenced multiple times on index',
    'index.html',
    lineOf(index, 'premium-ui.css'),
    'count=' + premiumHead + ' may download twice',
    'Keep async preload OR end sync, not both'
  );
} else ok('premium-ui.css reference count OK on index');

// Font weights
if (/Inter:wght@400;600;700/.test(consult) && /Playfair\+Display:wght@600/.test(consult)) {
  ok('Consultation fonts slimmed');
} else warn('Unexpected font URL on consultation', 'consultation.html', null, 'Font weights not as expected', 'Verify font link');

// Horizontal overflow CSS
const mobile = read('assets/mobile.css');
if (/overflow-x:\s*clip/.test(mobile)) ok('mobile.css clips horizontal overflow');
else warn('No overflow-x:clip in mobile.css', 'assets/mobile.css', null, 'Possible H-scroll risk', 'Add overflow-x:clip on html/body');

// API live health (optional)
function getJson(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: 12000 }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', (e) => resolve({ status: 0, data: String(e.message) }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, data: 'timeout' });
    });
  });
}

(async () => {
  const health = await getJson('https://dropshipgurufi-api.onrender.com/api/health');
  if (health.status === 200) ok('Live API /api/health → 200');
  else warn('Live API health not 200', 'backend', null, 'status=' + health.status + ' body=' + String(health.data).slice(0, 120), 'Wake Render service / check deploy');

  // Print report
  console.log('\n=== QA AUDIT RESULTS ===\n');
  console.log('PASSED:', report.passed.length);
  report.passed.forEach((p) => console.log('  ✅', p));
  console.log('\nWARNINGS:', report.warn.length);
  report.warn.forEach((w) => {
    console.log('  ⚠', w.msg);
    if (w.file) console.log('     file:', w.file, w.line != null ? 'line ' + w.line : '');
    if (w.reason) console.log('     reason:', w.reason);
    if (w.fix) console.log('     fix:', w.fix);
  });
  console.log('\nFAILURES:', report.fail.length);
  report.fail.forEach((f) => {
    console.log('  ❌', f.msg);
    if (f.file) console.log('     file:', f.file, f.line != null ? 'line ' + f.line : '');
    if (f.reason) console.log('     reason:', f.reason);
    if (f.fix) console.log('     fix:', f.fix);
  });

  const score = Math.max(
    0,
    Math.min(100, 100 - report.fail.length * 8 - report.warn.length * 2)
  );
  console.log('\nSTATIC_SCORE_HINT:', score);
  console.log('FAIL_COUNT:', report.fail.length);
  console.log('WARN_COUNT:', report.warn.length);

  fs.writeFileSync(
    path.join(ROOT, 'QA_AUDIT_RAW.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );
})();
