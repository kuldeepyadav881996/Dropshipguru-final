'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const file = path.join(root, 'consultation.html');
let html = fs.readFileSync(file, 'utf8');

const names = ['consultation.css', 'consultation-footer.css', 'consultation-motion.css'];
const blocks = [];
const re = /<style([^>]*)>([\s\S]*?)<\/style>/gi;
let m;
while ((m = re.exec(html))) {
  blocks.push({ full: m[0], css: m[2] });
}

if (blocks.length < 3) {
  console.error('Expected >=3 style blocks, found', blocks.length);
  process.exit(1);
}

blocks.slice(0, 3).forEach((b, i) => {
  const outPath = path.join(root, 'assets', names[i]);
  fs.writeFileSync(outPath, b.css.trim() + '\n', 'utf8');
  console.log('wrote', names[i], Buffer.byteLength(b.css), 'bytes');
});

const critical =
  '<style id="consult-critical">' +
  'html{scroll-behavior:smooth}body{margin:0;background:#0e1013;color:#b7bdc8;font-family:Inter,system-ui,sans-serif}' +
  '.lead-page{min-height:100vh}' +
  '#consultPlanMode .submit-btn{display:none}#consultPlanMode.step-2 .submit-btn{display:flex!important}' +
  '</style>\n' +
  '<link rel="stylesheet" href="assets/consultation.css">\n' +
  '<link rel="stylesheet" href="assets/consultation-footer.css">\n' +
  '<link rel="stylesheet" href="assets/consultation-motion.css">';

let count = 0;
html = html.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, function () {
  if (count < 3) {
    count += 1;
    return count === 1 ? critical : '';
  }
  return arguments[0];
});

fs.writeFileSync(file, html, 'utf8');
console.log('consultation.html bytes now', fs.statSync(file).size);
