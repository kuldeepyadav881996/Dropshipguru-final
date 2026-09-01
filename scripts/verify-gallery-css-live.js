'use strict';
const https = require('https');
https
  .get('https://dropshipguru.in/?v=' + Date.now(), (res) => {
    let d = '';
    res.on('data', (c) => (d += c));
    res.on('end', () => {
      const i = d.indexOf('product-gallery.css');
      console.log('last-modified', res.headers['last-modified']);
      console.log('etag', res.headers.etag);
      console.log('snippet', d.slice(Math.max(0, i - 80), i + 90));
      console.log(
        'insideNoscript',
        /<noscript>[\s\S]*product-gallery\.css[\s\S]*<\/noscript>/.test(d)
      );
      console.log(
        'hasOpenLink',
        /<link rel="stylesheet" href="product-gallery\.css/.test(d)
      );
    });
  })
  .on('error', (e) => console.error(e));
