'use strict';
const https = require('https');

function get(url) {
  return new Promise((resolve) => {
    https
      .get(url, { headers: { 'User-Agent': 'dropshipguru-deploy-check', Accept: 'application/vnd.github+json' } }, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(d) });
          } catch {
            resolve({ status: res.statusCode, body: d });
          }
        });
      })
      .on('error', (e) => resolve({ status: 0, err: e.message }));
  });
}

(async () => {
  const users = ['chandrahas8877', 'WeShippX', 'dropshipguru', 'DropshipGuru'];
  for (const u of users) {
    const repos = await get(`https://api.github.com/users/${u}/repos?per_page=100&type=all`);
    console.log('\nUSER', u, 'status', repos.status, Array.isArray(repos.body) ? repos.body.length : typeof repos.body);
    if (!Array.isArray(repos.body)) {
      console.log(repos.body && repos.body.message);
      continue;
    }
    for (const r of repos.body) {
      console.log('-', r.full_name, 'default:', r.default_branch, 'home:', r.homepage || '', 'pushed:', r.pushed_at);
      const pages = await get(`https://api.github.com/repos/${r.full_name}/pages`);
      if (pages.status === 200 && pages.body) {
        console.log('  PAGES:', pages.body.html_url, pages.body.cname || '', pages.body.status, pages.body.source);
      }
    }
  }

  // Also probe common github.io hosts
  const probes = [
    'https://chandrahas8877.github.io/',
    'https://weshippx.github.io/',
    'https://chandrahas8877.github.io/dropshipguru-platform/',
    'https://weshippx.github.io/DropshipGuru-Final/',
  ];
  for (const p of probes) {
    const res = await new Promise((resolve) => {
      https
        .get(p, { headers: { 'User-Agent': 'dg' } }, (r) => {
          resolve({ status: r.statusCode, url: p });
          r.resume();
        })
        .on('error', () => resolve({ status: 0, url: p }));
    });
    console.log('PROBE', res.status, res.url);
  }
})();
