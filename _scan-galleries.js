const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

async function galleryUrls(galleryPath, limit = 8) {
  const html = await fetchUrl(`https://pngimg.com/images/${galleryPath}`);
  const re = /href="https:\/\/pngimg\.com\/image\/(\d+)"[^>]*title="([^"]+)"/g;
  const items = [];
  let m;
  while ((m = re.exec(html)) && items.length < limit) {
    items.push({ id: m[1], title: m[2] });
  }
  return items;
}

async function ogImage(pageId) {
  const html = await fetchUrl(`https://pngimg.com/image/${pageId}`);
  const m = html.match(/property="og:image"\s+content="([^"]+)"/);
  return m ? m[1] : null;
}

async function main() {
  const galleries = [
    'objects/frying_pan',
    'objects/lipstick',
    'electronics/iphone',
    'sport/dumbbell',
    'flowers/vase',
    'electronics/headphones',
  ];
  for (const g of galleries) {
    console.log('\n##', g);
    const items = await galleryUrls(g, 5);
    for (const item of items) {
      const url = await ogImage(item.id);
      console.log(item.id, item.title.slice(0, 60), url);
    }
  }
  // lamp search
  for (const g of ['objects/lamp', 'electronics/lamp', 'furniture/lamp', 'objects/table_lamp']) {
    try {
      const html = await fetchUrl(`https://pngimg.com/images/${g}`);
      if (!html.includes('404')) {
        console.log('\n## FOUND', g);
        const items = await galleryUrls(g, 3);
        for (const item of items) {
          const url = await ogImage(item.id);
          console.log(item.id, item.title.slice(0, 60), url);
        }
      }
    } catch (e) {}
  }
  // shaker / bottle
  for (const g of ['sport/shaker', 'objects/bottle', 'sport/bottle', 'objects/water_bottle']) {
    try {
      const html = await fetchUrl(`https://pngimg.com/images/${g}`);
      if (html.length > 10000 && !html.includes('404 Not Found')) {
        console.log('\n## FOUND', g);
        const items = await galleryUrls(g, 3);
        for (const item of items) {
          const url = await ogImage(item.id);
          console.log(item.id, item.title.slice(0, 60), url);
        }
      }
    } catch (e) {}
  }
}

main().catch(console.error);
