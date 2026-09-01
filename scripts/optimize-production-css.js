'use strict';
/**
 * Split + purge assets/app.css, update index.html links.
 * Does not alter visual class names or JS behavior.
 */
const fs = require('fs');
const path = require('path');
const { PurgeCSS } = require('purgecss');
const CleanCSS = require('clean-css');

const ROOT = path.join(__dirname, '..');
const APP = path.join(ROOT, 'assets', 'app.css');
const BACKUP = path.join(ROOT, '_perf-backup', 'originals', 'assets', 'app.css');

function ensureBackup() {
  fs.mkdirSync(path.dirname(BACKUP), { recursive: true });
  if (!fs.existsSync(BACKUP)) fs.copyFileSync(APP, BACKUP);
}

/** Split CSS into top-level rules preserving @media/@keyframes/@font-face blocks. */
function splitTopLevel(css) {
  const parts = [];
  let i = 0;
  const n = css.length;
  while (i < n) {
    while (i < n && /\s/.test(css[i])) i++;
    if (i >= n) break;
    const start = i;
    if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i + 2);
      i = end < 0 ? n : end + 2;
      continue;
    }
    // Find first { for this statement
    let depth = 0;
    let inStr = null;
    let j = i;
    let sawBrace = false;
    for (; j < n; j++) {
      const c = css[j];
      if (inStr) {
        if (c === inStr && css[j - 1] !== '\\') inStr = null;
        continue;
      }
      if (c === '"' || c === "'") {
        inStr = c;
        continue;
      }
      if (c === '{') {
        depth++;
        sawBrace = true;
      } else if (c === '}') {
        depth--;
        if (sawBrace && depth === 0) {
          j++;
          break;
        }
      } else if (c === ';' && !sawBrace) {
        j++;
        break;
      }
    }
    const chunk = css.slice(start, j).trim();
    if (chunk) parts.push(chunk);
    i = j;
  }
  return parts;
}

function categorize(rule) {
  const head = rule.slice(0, 80).toLowerCase();
  if (head.startsWith('@keyframes') || head.startsWith('@-webkit-keyframes')) return 'motion';
  if (head.startsWith('@media')) {
    if (/max-width:\s*(480|640|680|767|768|900)/.test(head)) return 'responsive';
    return 'sections';
  }
  if (
    /:root|html|body|\*|preloader|announce|site-header|\bnav\b|brand|float-wa|cursor-glow|constellation/.test(
      head
    )
  ) {
    return 'core';
  }
  if (/hero|hf-card|stats-band|\.stat\b/.test(head)) return 'hero';
  if (
    /plan|course|faq|review|footer|category|tool|roadmap|final-cta|audience|week|diff|jewel|pd-/.test(
      head
    )
  ) {
    return 'sections';
  }
  return 'components';
}

async function main() {
  ensureBackup();
  const source = fs.readFileSync(existsPreferBackup(), 'utf8');
  console.log('source bytes', Buffer.byteLength(source));

  const content = [
    { raw: fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), extension: 'html' },
  ];
  // Include plan-details if present (may share some classes)
  const pd = path.join(ROOT, 'plan-details.html');
  if (fs.existsSync(pd)) content.push({ raw: fs.readFileSync(pd, 'utf8'), extension: 'html' });

  const purged = await new PurgeCSS().purge({
    content,
    css: [{ raw: source }],
    safelist: {
      standard: [
        /^pm-/,
        /^is-/,
        /^open$/,
        /^hidden$/,
        /^visible$/,
        /^reveal$/,
        /^active$/,
        /^dg-/,
        /^ab-/,
        /^hf-/,
        /^hero-/,
        /^nav-/,
        /^btn/,
        /^plan-/,
        /^course-/,
        /^faq/,
        /^review/,
        /^pg-/,
        /^jc-/,
        /^cat-/,
        /^announce/,
        /^preloader/,
        /^float-wa/,
        /^menu-btn/,
        /^site-header/,
        /^brand/,
        /^stats/,
        /^section/,
        /^final-cta/,
        /^tools-/,
        /^audience/,
        /^week/,
        /^ps-/,
        /^pill/,
        /^gold/,
        /^accent/,
      ],
      deep: [/data-/, /hover/, /focus/, /active/, /open/],
      greedy: [/swiper/, /marquee/, /track/, /slide/],
    },
    defaultExtractor: (content) => content.match(/[A-Za-z0-9_-]+/g) || [],
  });

  let css = purged[0].css;
  const cleaner = new CleanCSS({ level: 2 });
  const min = cleaner.minify(css);
  if (min.errors.length) {
    console.warn('clean-css errors', min.errors);
  } else {
    css = min.styles;
  }
  console.log('purged+min bytes', Buffer.byteLength(css));

  const rules = splitTopLevel(css);
  const buckets = {
    core: [],
    hero: [],
    components: [],
    sections: [],
    responsive: [],
    motion: [],
  };
  rules.forEach((r) => buckets[categorize(r)].push(r));

  // Merge small buckets for fewer requests while keeping splits
  const files = {
    'app-core.css': [...buckets.core, ...buckets.motion].join(''),
    'app-hero.css': buckets.hero.join(''),
    'app-components.css': buckets.components.join(''),
    'app-sections.css': [...buckets.sections, ...buckets.responsive].join(''),
  };

  Object.entries(files).forEach(([name, body]) => {
    const out = path.join(ROOT, 'assets', name);
    fs.writeFileSync(out, body || '/* empty */\n', 'utf8');
    console.log('wrote', name, Buffer.byteLength(body || ''), 'bytes');
  });

  // Keep app.css as a thin re-export via @import for any old links — but avoid @import cost:
  // Write concatenated min file as app.css for backward compat + update index to split.
  const concat = Object.values(files).join('');
  fs.writeFileSync(APP, concat, 'utf8');
  console.log('rewrote app.css', Buffer.byteLength(concat), 'bytes');

  // Update index.html to load split CSS (async) instead of single app.css
  const indexPath = path.join(ROOT, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  const oldBlock =
    /<link rel="preload" href="assets\/app\.css" as="style" onload="this\.onload=null;this\.rel='stylesheet'">\s*<noscript><link rel="stylesheet" href="assets\/app\.css"><\/noscript>/;

  const newBlock = [
    'app-core.css',
    'app-hero.css',
    'app-components.css',
    'app-sections.css',
  ]
    .map(
      (f) =>
        `<link rel="preload" href="assets/${f}" as="style" onload="this.onload=null;this.rel='stylesheet'">\n` +
        `<noscript><link rel="stylesheet" href="assets/${f}"></noscript>`
    )
    .join('\n');

  if (!oldBlock.test(html)) {
    console.warn('index app.css preload block not found — inserting after critical style');
  } else {
    html = html.replace(oldBlock, newBlock);
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('updated index.html app.css links');
  }

  fs.writeFileSync(
    path.join(ROOT, '_perf-backup', 'app-css-split.json'),
    JSON.stringify(
      {
        before: Buffer.byteLength(source),
        after: Buffer.byteLength(concat),
        files: Object.fromEntries(
          Object.entries(files).map(([k, v]) => [k, Buffer.byteLength(v || '')])
        ),
      },
      null,
      2
    )
  );
}

function existsPreferBackup() {
  // Prefer pristine backup if already created in prior run
  if (fs.existsSync(BACKUP) && fs.statSync(BACKUP).size > 100000) return BACKUP;
  return APP;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
