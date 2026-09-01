'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const h = fs.readFileSync(path.join(root, 'consultation.html'), 'utf8');
const checks = [
  ['payment-client defer', /payment-client\.js"\s+defer/],
  ['sheets defer', /google-sheet-submit\.js"\s+defer/],
  ['DropshipGuruPayments', /DropshipGuruPayments/],
  ['startCheckout', /startCheckout/],
  ['consultation.css', /assets\/consultation\.css/],
  ['mobile.css', /assets\/mobile\.css/],
  ['base.css', /assets\/base\.css/],
  ['premium-ui', /assets\/premium-ui\.(css|js)/],
];
let ok = true;
checks.forEach(([label, re]) => {
  const pass = re.test(h);
  console.log((pass ? 'OK' : 'FAIL') + '  ' + label);
  if (!pass) ok = false;
});
console.log('consultation.html KB', (fs.statSync(path.join(root, 'consultation.html')).size / 1024).toFixed(1));
console.log('index.html KB', (fs.statSync(path.join(root, 'index.html')).size / 1024).toFixed(1));
process.exit(ok ? 0 : 1);
