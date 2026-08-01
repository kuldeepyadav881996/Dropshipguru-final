/**
 * DropshipGuru Legal Pages Builder
 * Reads content partials from legal/content/*.html and outputs full pages.
 * Run: node _build-legal-pages.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, "legal", "content");

const PAGES = [
  {
    slug: "terms-conditions",
    folder: "terms-conditions",
    title: "Terms & Conditions",
    icon: "scale",
    pdf: "DropshipGuru_Terms_and_Conditions.pdf",
    desc: "Governing the use of DropshipGuru's services",
    partial: "terms.html",
  },
  {
    slug: "privacy-policy",
    folder: "privacy-policy",
    title: "Privacy Policy",
    icon: "shield",
    pdf: "DropshipGuru_Privacy_Policy.pdf",
    desc: "How we collect, use, and protect your information",
    partial: "privacy.html",
  },
  {
    slug: "refund-policy",
    folder: "refund-policy",
    title: "Refund & Cancellation Policy",
    icon: "rotate-ccw",
    pdf: "DropshipGuru_Refund_and_Cancellation_Policy.pdf",
    desc: "Cancellation, refund eligibility, and related terms",
    partial: "refund.html",
  },
  {
    slug: "earnings-disclaimer",
    folder: "earnings-disclaimer",
    title: "Earnings Disclaimer",
    icon: "trending-up",
    pdf: null,
    desc: "Important information about income expectations and business results",
    partial: "earnings-disclaimer.html",
  },
];

function extractToc(html) {
  const items = [];
  const re = /<section[^>]*class="legal-section"[^>]*id="([^"]+)"[^>]*>[\s\S]*?<h2[^>]*>([^<]+)<\/h2>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    items.push({ id: m[1], label: m[2].trim() });
  }
  return items;
}

function buildTocList(items) {
  return items
    .map(
      (item) =>
        `        <li><a href="#${item.id}" data-section="${item.id}">${item.label}</a></li>`
    )
    .join("\n");
}

function buildPage(page, contentHtml) {
  const toc = extractToc(contentHtml);
  const tocList = buildTocList(toc);
  const canonical = `https://dropshipguru.in/${page.slug}/`;
  const seoTitle = `${page.title} | DropshipGuru`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${seoTitle}</title>
<meta name="description" content="${page.desc}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#0E1013">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:title" content="${seoTitle}">
<meta property="og:description" content="${page.desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="https://dropshipguru.in/logo.png">
<meta property="og:locale" content="en_IN">
<meta property="og:site_name" content="Dropship Guru">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${seoTitle}">
<meta name="twitter:description" content="${page.desc}">
<meta name="twitter:image" content="https://dropshipguru.in/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../brand-icons.css">
<link rel="stylesheet" href="../legal-page.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "${canonical}#webpage",
      "url": "${canonical}",
      "name": "${seoTitle}",
      "description": "${page.desc}",
      "isPartOf": { "@id": "https://dropshipguru.in/#website" },
      "about": { "@id": "https://dropshipguru.in/#organization" },
      "inLanguage": "en-IN"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dropshipguru.in/" },
        { "@type": "ListItem", "position": 2, "name": "${page.title}", "item": "${canonical}" }
      ]
    }
  ]
}
</script>
<style>
:root {
  --bg: #050608; --panel: #0a0e1a; --text: #fdf9ef; --muted: #beb6a6;
  --blue: #14a8ff; --violet: #8b74ff; --green: #24d56a; --green-dark: #15b85a;
  --gold: #f7b824; --gold-light: #ffe3a0; --gold-dark: #d88a00; --danger: #ff5b6c;
  --line: rgba(247, 184, 36, 0.26);
  --glow-gold: 0 0 40px rgba(247,184,36,0.32), 0 0 90px rgba(247,184,36,0.14);
  --ease-premium: cubic-bezier(0.16, 1, 0.3, 1);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0; min-height: 100vh; background: #050608; color: #f0efe8;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  overflow-x: hidden;
}
a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; }
::selection { background: rgba(247,184,36,0.3); color: #fff; }

.site-header {
  position: sticky; top: 0; z-index: 50; display: flex; align-items: center;
  justify-content: space-between; gap: 24px; min-height: 76px;
  padding: 14px clamp(18px, 5vw, 72px);
  background: rgba(6,7,9,0.75);
  border-bottom: 1px solid rgba(247,184,36,0.22);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  box-shadow: 0 1px 0 rgba(247,184,36,0.1), 0 8px 32px rgba(0,0,0,0.5);
}
.brand { display: inline-flex; align-items: center; gap: 12px; color: #f0efe8; text-decoration: none; font-size: 19px; font-weight: 900; }
.brand img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; background: #05070c; }
.brand b { color: var(--gold); }
.menu-btn { display: none; width: 42px; height: 42px; border: 1px solid var(--line); border-radius: 8px; color: var(--text); background: rgba(255,255,255,0.05); font-size: 22px; cursor: pointer; }
nav { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 24px; position: absolute; left: 50%; transform: translateX(-50%); }
nav a { color: #b8b4a8; text-decoration: none; font-size: 14px; font-weight: 700; position: relative; padding-bottom: 4px; transition: color 0.25s ease; }
nav a::after { content: ''; position: absolute; left: 0; bottom: 0; width: 0; height: 2px; background: linear-gradient(90deg, var(--gold), var(--gold-light)); transition: width 0.3s var(--ease-premium); border-radius: 2px; }
nav a:hover { color: #f7b824; }
nav a:hover::after { width: 100%; }
.nav-cta { padding: 11px 18px; border-radius: 8px; color: #06110b !important; background: linear-gradient(180deg, #ffd86b, #f7b824); box-shadow: 0 12px 26px rgba(247,184,36,0.28); transition: transform 0.3s var(--ease-premium), box-shadow 0.3s var(--ease-premium); }
.nav-cta:hover { transform: translateY(-2px); box-shadow: 0 16px 34px rgba(247,184,36,0.4); }
.nav-cta::after { display: none; }

.float-wa {
  position: fixed; right: 18px; bottom: 18px; z-index: 40; display: inline-flex;
  align-items: center; gap: 8px; padding: 13px 16px; border-radius: 12px;
  color: #03180b; background: #25d366;
  box-shadow: 0 14px 40px rgba(37,211,102,0.3);
  text-decoration: none; font-weight: 900;
}
.float-wa small { font-size: 12px; }

footer {
  border-top: 1px solid rgba(247,184,36,0.14);
  background: #0E1013;
  color: var(--muted);
  position: relative;
  overflow: hidden;
}
.footer-glow {
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 55% 45% at 12% 85%, rgba(247,184,36,0.07), transparent 58%),
    radial-gradient(ellipse 45% 40% at 88% 20%, rgba(247,184,36,0.05), transparent 55%);
}
.footer-inner {
  width: min(1280px, calc(100% - 48px));
  margin: 0 auto;
  padding: 40px 24px 18px;
  display: grid;
  grid-template-columns: 1.3fr repeat(4, minmax(0, 1fr));
  gap: 48px;
  position: relative;
  z-index: 1;
}
.footer-brand { display: flex; flex-direction: column; gap: 4px; }
.footer-logo { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; align-self: flex-start; }
.footer-logo img { width: 52px; height: 52px; border-radius: 12px; object-fit: cover; background: #05070c; }
.footer-logo span { font-size: 22px; font-weight: 900; color: #f0efe8; }
.footer-logo span b { color: var(--gold); }
.footer-brand-tagline { margin: 0; font-size: 13px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #E8C872; }
.footer-desc { margin: 0; font-size: 14px; color: #7a7468; line-height: 1.6; max-width: 260px; }
.footer-socials { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 0; }
.footer-socials a {
  display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: #EDE8DF;
  text-decoration: none; transition: background 0.35s ease, border-color 0.35s ease, transform 0.35s var(--ease-premium);
}
.footer-socials a:hover { background: rgba(247,184,36,0.1); border-color: rgba(247,184,36,0.55); transform: translateY(-4px); }
.footer-col h4 { margin: 0 0 16px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.16em; color: var(--gold); position: relative; padding-bottom: 4px; }
.footer-col h4::after { content: ''; position: absolute; bottom: 0; left: 0; width: 28px; height: 2px; background: linear-gradient(90deg, var(--gold), transparent); }
.footer-col ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 10px; }
.footer-col ul li a { color: #7a7468; text-decoration: none; font-size: 14px; font-weight: 600; transition: color 0.3s ease; }
.footer-col ul li a:hover { color: #f0efe8; }
.footer-contact-list { gap: 14px !important; }
.footer-contact-block { display: flex; flex-direction: column; gap: 4px; }
.footer-contact-label { display: block; font-size: 12px; font-weight: 800; color: #EDE8DF; }
.footer-contact-text { font-size: 13px; line-height: 1.5; color: #7a7468; font-weight: 500; }
.footer-meta { position: relative; z-index: 1; width: min(1280px, calc(100% - 48px)); margin: 0 auto; padding: 0 24px 12px; }
.footer-trust-bar { border-top: 1px solid rgba(247,184,36,0.08); padding: 8px 0 0; margin: 0 0 12px; }
.footer-trust-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px; }
.footer-pill {
  display: inline-flex; align-items: center; justify-content: center; min-height: 36px; padding: 8px 16px;
  border-radius: 100px; background: rgba(247,184,36,0.05); border: 1px solid rgba(247,184,36,0.16);
  color: #9a9488; font-size: 12px; font-weight: 800; white-space: nowrap;
}
.footer-bottom { border-top: 1px solid rgba(255,255,255,0.05); }
.footer-bottom-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: nowrap; gap: 16px; padding: 10px 0; }
.footer-copy { margin: 0; font-size: 13px; color: #4a4540; font-weight: 600; line-height: 1.4; }
.footer-copy b { color: var(--gold); font-weight: 800; }
.footer-made { margin: 0; font-size: 13px; color: #4a4540; font-weight: 600; white-space: nowrap; }

@media (max-width: 1024px) {
  .footer-inner { grid-template-columns: 1fr 1fr; gap: 48px; }
  .footer-brand { grid-column: 1 / -1; }
}
@media (max-width: 640px) {
  nav { display: none; position: absolute; top: 100%; left: 0; right: 0; transform: none; flex-direction: column; padding: 16px; background: rgba(6,7,9,0.96); border-bottom: 1px solid rgba(247,184,36,0.2); }
  nav.open { display: flex; }
  .menu-btn { display: inline-grid; place-items: center; }
  .footer-inner { grid-template-columns: 1fr; gap: 24px; text-align: center; }
  .footer-brand { align-items: center; }
  .footer-logo { align-self: center; }
  .footer-desc { max-width: 100%; }
  .footer-bottom-inner { flex-wrap: wrap; justify-content: center; text-align: center; }
}
</style>
</head>
<body>
<div id="legalProgress" class="legal-progress" role="progressbar" aria-label="Reading progress"></div>

<div class="legal-page-wrap">
  <header class="site-header">
    <a href="../index.html" class="brand">
      <img src="../logo.png" alt="Dropship Guru" style="width:50px;height:50px;border-radius:8px;object-fit:cover;background:#05070c;display:block;" onerror="this.outerHTML='<span style=&quot;width:50px;height:50px;border-radius:8px;background:linear-gradient(135deg,#f7b824,#14a8ff);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;color:#06110b;&quot;>DG</span>'">
      <span>Dropship <b>Guru</b></span>
    </a>
    <button class="menu-btn" id="menuBtn" aria-label="Menu">☰</button>
    <nav id="navMenu">
      <a href="../index.html#products">Products</a>
      <a href="../index.html#why-us">Why Us</a>
      <a href="../index.html#categories">Categories</a>
      <a href="../index.html#roadmap">Roadmap</a>
      <a href="../index.html#plans">Plans</a>
      <a href="../index.html#courses">Courses</a>
      <a href="../index.html#reviews">Reviews</a>
      <a href="../index.html#faq">FAQ</a>
      <a href="../consultation.html" class="nav-cta">Get Started</a>
    </nav>
  </header>

  <a href="https://wa.me/917428329102" class="float-wa" target="_blank" rel="noopener">
    <span class="brand-icon-wrap" data-icon="whatsapp" aria-hidden="true"></span> <small>Chat with us</small>
  </a>

  <main>
    <header class="legal-hero">
      <div class="legal-hero-inner">
        <span class="legal-hero-badge">
          <i data-lucide="${page.icon}" class="legal-hero-icon" aria-hidden="true"></i>
          LEGAL DOCUMENT
        </span>
        <h1>${page.title}</h1>
        <p class="legal-hero-desc">${page.desc}</p>
      </div>
    </header>

    <div class="legal-layout">
      <aside class="legal-toc-wrap" aria-label="Table of contents">
        <p class="legal-toc-title">On this page</p>
        <ul class="legal-toc">
${tocList}
        </ul>
      </aside>

      <article class="legal-content">
        <details class="legal-toc-mobile">
          <summary>Table of Contents</summary>
          <ul class="legal-toc">
${tocList}
          </ul>
        </details>

${contentHtml}
      </article>
    </div>
  </main>

  <footer id="siteFooter">
    <div class="footer-glow" aria-hidden="true"></div>
    <div class="footer-inner">
      <div class="footer-brand">
        <a href="../index.html" class="footer-logo">
          <img src="../logo.png" alt="Dropship Guru Logo" style="width:52px;height:52px;border-radius:10px;object-fit:cover;background:#05070c;display:block;" onerror="this.outerHTML='<span style=&quot;width:52px;height:52px;border-radius:10px;background:linear-gradient(135deg,#f7b824,#14a8ff);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:20px;color:#06110b;&quot;>DG</span>'">
          <span>Dropship <b>Guru</b></span>
        </a>
        <p class="footer-brand-tagline">India's #1 Dropshipping Platform</p>
        <p class="footer-desc">Helping students, professionals, housewives and business owners launch profitable online businesses through complete ecommerce solutions.</p>
        <p class="footer-desc">DropshipGuru is owned and operated by <b>DropshipGuru Private Limited</b>.</p>
        <div class="footer-socials">
          <a href="https://www.instagram.com/dropshipguru.info/" target="_blank" rel="noopener" aria-label="Instagram"><span class="brand-icon-wrap" data-icon="instagram" aria-hidden="true"></span></a>
          <a href="https://www.facebook.com/dropshipguru.info/" target="_blank" rel="noopener" aria-label="Facebook"><span class="brand-icon-wrap" data-icon="facebook" aria-hidden="true"></span></a>
          <a href="https://www.youtube.com/@dropshipguru" target="_blank" rel="noopener" aria-label="YouTube"><span class="brand-icon-wrap" data-icon="google" aria-hidden="true"></span></a>
          <a href="https://wa.me/917428329102" target="_blank" rel="noopener" aria-label="WhatsApp"><span class="brand-icon-wrap" data-icon="whatsapp" aria-hidden="true"></span></a>
          <a href="https://www.linkedin.com/company/dropshipguru" target="_blank" rel="noopener" aria-label="LinkedIn"><span class="brand-icon-wrap" data-icon="professional" aria-hidden="true"></span></a>
        </div>
      </div>

      <div class="footer-col">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="../index.html#products">Products</a></li>
          <li><a href="../index.html#why-us">Why Us</a></li>
          <li><a href="../index.html#categories">Categories</a></li>
          <li><a href="../index.html#roadmap">Roadmap</a></li>
          <li><a href="../index.html#plans">Pricing Plans</a></li>
          <li><a href="../index.html#courses">Mastery Courses</a></li>
          <li><a href="../index.html#reviews">Reviews</a></li>
          <li><a href="../index.html#faq">FAQ</a></li>
          <li><a href="../about/index.html">About Us</a></li>
          <li><a href="../contact/index.html">Contact Us</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Services</h4>
        <ul>
          <li><a href="../consultation.html">Free Consultation</a></li>
          <li><a href="../consultation.html?service=store-setup">Store Setup</a></li>
          <li><a href="../consultation.html?service=marketplace-listing">Marketplace Listing</a></li>
          <li><a href="../consultation.html?service=product-research">Product Research</a></li>
          <li><a href="../consultation.html?service=branding">Branding</a></li>
          <li><a href="../consultation.html?service=marketing-support">Marketing Support</a></li>
          <li><a href="../consultation.html?service=mentorship">Mentorship</a></li>
          <li><a href="../consultation.html?service=website-development">Website Development</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Legal</h4>
        <ul>
          <li><a href="../terms-conditions/index.html">Terms &amp; Conditions</a></li>
          <li><a href="../privacy-policy/index.html">Privacy Policy</a></li>
          <li><a href="../refund-policy/index.html">Refund &amp; Cancellation Policy</a></li>
          <li><a href="../earnings-disclaimer/index.html">Earnings Disclaimer</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Contact Us</h4>
        <ul class="footer-contact-list">
          <li class="footer-contact-block">
            <span class="footer-contact-label">🏢 Legal Business Name</span>
            <span class="footer-contact-text">DropshipGuru Private Limited</span>
          </li>
          <li class="footer-contact-block">
            <span class="footer-contact-label">📍 Business Address</span>
            <span class="footer-contact-text">Webel.io Tech Garden<br>Gurugram, Haryana 122102<br>India</span>
          </li>
          <li class="footer-contact-item">
            <span class="footer-contact-label">📞 Mobile</span>
            <a href="tel:+917428329102">7428329102</a>
          </li>
          <li class="footer-contact-item">
            <span class="footer-contact-label">✉ Email</span>
            <a href="mailto:support@dropshipguru.info">support@dropshipguru.info</a>
          </li>
          <li class="footer-contact-item">
            <span class="footer-contact-label">💬 WhatsApp</span>
            <a href="https://wa.me/917428329102" target="_blank" rel="noopener">Chat With Us</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-meta">
      <div class="footer-trust-bar">
        <div class="footer-trust-inner">
          <span class="footer-pill">🔒 Secure Payments</span>
          <span class="footer-pill">⭐ 4.8/5 Customer Rating</span>
          <span class="footer-pill">🇮🇳 Proudly Indian</span>
          <span class="footer-pill">⚡ Fast Support</span>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-disclaimer" style="width:min(1280px,calc(100% - 48px));margin:0 auto;padding:14px 24px 0;font-size:11.5px;line-height:1.65;color:#6a6560;text-align:center;">Results may vary from person to person. DropshipGuru Private Limited does not guarantee any fixed income, profits, or business success. Business results depend on individual effort, investment, market conditions, and other external factors.</p>
        <div class="footer-bottom-inner">
          <p class="footer-copy">© 2026 DropshipGuru Private Limited.<br>All Rights Reserved.</p>
          <p class="footer-made">Made with ❤️ in India</p>
        </div>
      </div>
    </div>
  </footer>
</div>

<button type="button" class="legal-back-top" id="legalBackTop" aria-label="Back to top">
  <i data-lucide="chevron-up" aria-hidden="true"></i>
</button>

<script src="https://unpkg.com/lucide@latest"></script>
<script src="../brand-icons.js"></script>
<script src="../legal-page.js"></script>
</body>
</html>`;
}

function buildAll() {
  const results = [];
  for (const page of PAGES) {
    const partialPath = path.join(CONTENT_DIR, page.partial);
    if (!fs.existsSync(partialPath)) {
      throw new Error(`Missing content partial: ${partialPath}`);
    }
    const contentHtml = fs.readFileSync(partialPath, "utf8").trim();
    const outDir = path.join(ROOT, page.folder);
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, "index.html");
    const html = buildPage(page, contentHtml);
    fs.writeFileSync(outPath, html);
    const lines = html.split("\n").length;
    results.push({ path: outPath, lines, toc: extractToc(contentHtml).length });
    console.log(`✓ ${page.folder}/index.html (${lines} lines, ${extractToc(contentHtml).length} TOC items)`);
  }
  return results;
}

if (require.main === module) {
  buildAll();
}

module.exports = { buildAll, extractToc, PAGES };
