'use strict';
/**
 * Restore last working premium layout CSS (no redesign).
 * Source of truth: _perf-backup/originals/
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ORIG = path.join(ROOT, '_perf-backup', 'originals');

function extractStyles(html) {
  return [...html.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
}

function restoreAppCssBundle() {
  const src = path.join(ORIG, 'assets', 'app.css');
  const dest = path.join(ROOT, 'assets', 'app.css');
  fs.copyFileSync(src, dest);

  // Also write the original mid-page premium/hero refinement block as a dedicated file
  const origHtml = fs.readFileSync(path.join(ORIG, 'index.html'), 'utf8');
  const styles = extractStyles(origHtml);
  if (styles.length < 2) throw new Error('original index missing second style block');
  fs.writeFileSync(path.join(ROOT, 'assets', 'app-premium-refinements.css'), styles[1]);
  console.log('Restored assets/app.css', fs.statSync(dest).size);
  console.log('Wrote assets/app-premium-refinements.css', styles[1].length);
}

function restoreIndex() {
  let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  const headOpen = html.indexOf('<head>');
  const bodyOpen = html.indexOf('<body');
  if (headOpen < 0 || bodyOpen < 0) throw new Error('index.html missing head/body');

  const head = html.slice(headOpen, bodyOpen);
  let body = html.slice(bodyOpen);

  // Keep meta / SEO / favicons / ld+json from current head; rebuild CSS wiring only.
  const preconnectIdx = head.indexOf('<link rel="preconnect"');
  const ldStart = head.indexOf('<script type="application/ld+json">');
  const ldEnd = head.indexOf('</script>', ldStart) + '</script>'.length;
  if (preconnectIdx < 0 || ldStart < 0) throw new Error('index head markers missing');

  const metaPart = head.slice(0, preconnectIdx);
  const ldPart = head.slice(ldStart, ldEnd);

  const newHead =
    metaPart +
    `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
` +
    ldPart +
    `
<link rel="stylesheet" href="assets/app.css">
<link rel="stylesheet" href="assets/app-premium-refinements.css">
<link rel="stylesheet" href="brand-icons.css?v=3">
</head>
`;

  // Strip optimization CSS/JS overrides from body
  body = body
    .replace(/<link[^>]*assets\/mobile\.css[^>]*>\s*/gi, '')
    .replace(/<script[^>]*assets\/premium-ui\.js[^>]*>\s*<\/script>\s*/gi, '')
    .replace(/<link[^>]*assets\/(?:base|components|layout|premium-ui|app(?:-core|-hero|-components|-sections)?)\.css[^>]*>\s*/gi, '')
    .replace(/<noscript>\s*<link[^>]*assets\/[^>]*>\s*<\/noscript>\s*/gi, '')
    .replace(/<link[^>]*rel="preload"[^>]*as="style"[^>]*>\s*/gi, '');

  // Ensure catalogue CSS remain synchronous stylesheets
  if (!/rel=["']stylesheet["'][^>]*jewellery-catalogue\.css|jewellery-catalogue\.css["'][^>]*rel=["']stylesheet["']/.test(body)) {
    if (body.includes('jewellery-catalogue.css')) {
      body = body.replace(
        /<link[^>]*jewellery-catalogue\.css[^>]*>/i,
        '<link rel="stylesheet" href="jewellery-catalogue.css">'
      );
    }
  }
  if (!/rel=["']stylesheet["'][^>]*product-gallery\.css/.test(body) && body.includes('product-gallery.css')) {
    body = body.replace(
      /<link[^>]*product-gallery\.css[^>]*>/i,
      '<link rel="stylesheet" href="product-gallery.css?v=2">'
    );
  }

  // Remove any leftover mid-body truncated optimization style blocks that conflict
  // (keep real page styles if any non-optimization ones exist — current body should not have large style)
  body = body.replace(/<style id="mobile-perf">[\s\S]*?<\/style>\s*/gi, '');

  const out = html.slice(0, headOpen) + newHead + body;
  if (!out.includes('assets/app.css') || !out.includes('app-premium-refinements.css')) {
    throw new Error('index restore failed CSS links');
  }
  if (/app-core\.css|premium-ui\.css|assets\/base\.css|mobile-perf/.test(out.slice(0, out.indexOf('<body')))) {
    throw new Error('index head still has optimization layers');
  }

  fs.writeFileSync(path.join(ROOT, 'index.html'), out);
  console.log('Restored index.html stylesheet wiring');
}

function restoreConsultation() {
  const original = fs.readFileSync(path.join(ORIG, 'consultation.html'), 'utf8');
  let current = fs.readFileSync(path.join(ROOT, 'consultation.html'), 'utf8');

  const styles = extractStyles(original);
  if (!styles[0] || styles[0].length < 40000) {
    throw new Error('original consultation style too small');
  }

  // Persist original consultation CSS as files for sync load (keeps current HTML/JS intact)
  fs.writeFileSync(path.join(ROOT, 'assets', 'consultation-original.css'), styles[0]);
  for (let i = 1; i < styles.length; i++) {
    fs.writeFileSync(path.join(ROOT, 'assets', `consultation-original-${i}.css`), styles[i]);
  }

  const headOpen = current.indexOf('<head>');
  const bodyOpen = current.indexOf('<body');
  const head = current.slice(headOpen, bodyOpen);
  let body = current.slice(bodyOpen);

  const preconnectIdx = head.indexOf('<link rel="preconnect"');
  const metaPart = preconnectIdx >= 0 ? head.slice(0, preconnectIdx) : head.slice(0, head.indexOf('<style'));

  // Preserve ld+json and any head API bootstrap from current
  const ld = (head.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/) || [''])[0];
  const apiBoot = (head.match(/<script>[\s\S]*?DROPSHIPGURU_API_BASE[\s\S]*?<\/script>/) || [''])[0];

  let cssLinks =
    `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
` +
    (ld ? ld + '\n' : '') +
    `<link rel="stylesheet" href="assets/consultation-original.css">
`;
  for (let i = 1; i < styles.length; i++) {
    cssLinks += `<link rel="stylesheet" href="assets/consultation-original-${i}.css">\n`;
  }
  cssLinks += `<link rel="stylesheet" href="brand-icons.css">\n`;
  if (apiBoot) cssLinks += apiBoot + '\n';
  cssLinks += '</head>\n';

  body = body
    .replace(/<link[^>]*assets\/mobile\.css[^>]*>\s*/gi, '')
    .replace(/<script[^>]*assets\/premium-ui\.js[^>]*>\s*<\/script>\s*/gi, '')
    .replace(
      /<link[^>]*assets\/(?:base|components|layout|premium-ui|consultation(?:-footer|-motion)?)\.css[^>]*>\s*/gi,
      ''
    )
    .replace(/<noscript>\s*<link[^>]*>\s*<\/noscript>\s*/gi, '')
    .replace(/<link[^>]*rel="preload"[^>]*as="style"[^>]*>\s*/gi, '')
    .replace(/<style id="consult-critical">[\s\S]*?<\/style>\s*/gi, '');

  // Ensure API base still set if it lived in body (current puts it near scripts)
  const out = current.slice(0, headOpen) + metaPart + cssLinks + body;

  // Keep payment scripts
  if (!out.includes('payment-client.js') || !out.includes('google-sheet-submit.js')) {
    throw new Error('consultation restore lost payment scripts');
  }
  if (!out.includes('DROPSHIPGURU_API_BASE')) {
    console.warn('WARNING: DROPSHIPGURU_API_BASE missing after consultation restore');
  }

  fs.writeFileSync(path.join(ROOT, 'consultation.html'), out);
  console.log('Restored consultation.html stylesheet wiring');
  console.log('  consultation-original.css', styles[0].length);
}

restoreAppCssBundle();
restoreIndex();
restoreConsultation();
console.log('DONE');
