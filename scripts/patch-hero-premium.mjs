import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const indexPath = join(__dirname, "..", "Index.html");
let html = readFileSync(indexPath, "utf8");

const start = html.indexOf("<!-- Hero -->");
const end = html.indexOf("<!-- Stats -->");
if (start === -1 || end === -1) {
  console.error("Could not find hero section markers");
  process.exit(1);
}

const heroHtml = `<!-- Hero -->
<section class="hero">
  <div class="hero-bg-scene" aria-hidden="true">
    <div class="hero-bg-base"></div>
    <div class="hero-bg-noise"></div>
    <div class="hero-bg-mesh"></div>
    <div class="hero-bg-grid"></div>
    <div class="hero-bg-vignette"></div>
    <div class="hero-bg-glow hero-bg-glow-a"></div>
    <div class="hero-bg-glow hero-bg-glow-b"></div>
    <div class="hero-bg-glow hero-bg-glow-c"></div>
    <div class="hero-bg-glow hero-bg-glow-d"></div>
    <div class="hero-bg-spotlight"></div>
    <div class="hero-bg-shimmer"></div>
    <div class="hero-bg-orbit hero-bg-orbit-1"></div>
    <div class="hero-bg-orbit hero-bg-orbit-2"></div>
    <div class="hero-bg-orbit hero-bg-orbit-3"></div>
    <div class="hero-bg-map">
      <svg viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <g fill="currentColor" opacity="0.9">
          <path d="M148 198c28-18 62-28 98-26 34 2 64 16 88 38 22 20 36 48 38 78 2 32-8 62-28 86-18 22-44 38-72 44-30 6-62 2-90-12-26-14-46-36-56-62-10-28-8-58 4-84 12-26 32-48 58-62z"/>
          <path d="M318 142c22-8 46-10 68-4 24 6 44 22 56 42 12 20 14 44 6 66-8 22-26 40-48 50-22 10-48 10-70 0-24-10-42-30-50-54-8-26-4-54 10-76 14-22 38-38 64-44 8-2 16-2 24 0-6-8-10-16-10-26 0-14 8-26 20-32 12-6 26-4 36 4 10 8 14 22 10 34-4 12-14 22-26 26-12 4-26 2-36-6z"/>
          <path d="M468 118c34-6 70-2 100 12 28 14 50 38 60 66 10 30 6 62-10 88-16 26-42 46-72 54-30 8-62 4-88-12-26-16-44-42-48-72-4-30 8-60 30-82 22-22 52-34 82-34 6 0 12 0 18 2-4-18-2-38 8-54 10-16 28-26 48-26 22 0 42 12 52 30 10 18 10 40 0 58-10 18-30 30-52 30-12 0-24-4-34-10 8 14 12 30 10 46-2 16-10 30-22 40-12 10-28 14-44 10z"/>
          <path d="M612 168c26-10 56-12 82-4 28 8 50 28 62 54 12 26 12 56 0 82-12 26-36 46-64 54-28 8-58 4-82-12-24-16-40-42-42-70-2-28 10-56 32-76 22-20 52-30 82-28 4 0 8 0 12 0-2-16 4-32 16-42 12-10 28-12 42-6 16 6 26 20 26 36 0 16-10 30-26 36-8 4-18 4-26 0 6 10 8 22 4 34-4 12-14 22-26 26-12 4-26 0-34-10z"/>
          <path d="M752 152c20-12 44-16 66-10 24 6 44 22 54 44 10 22 8 48-4 68-12 20-34 34-58 38-24 4-48-4-66-22-18-18-26-44-20-68 6-24 22-44 44-54 8-4 16-6 24-6-2-12 2-24 12-32 10-8 24-8 34 0 10 8 14 22 10 34-4 12-14 20-26 20-6 0-12-2-16-4 4 8 6 18 4 28-2 10-8 18-16 22-8 4-18 4-26 0z"/>
          <path d="M228 268c18-14 42-20 64-16 24 4 44 20 54 42 10 22 8 48-6 68-14 20-38 32-62 32-26 0-50-14-62-36-12-22-10-48 4-68 14-20 38-32 62-32 2 0 4 0 6 0z"/>
          <path d="M538 278c16-10 36-14 54-8 20 6 36 22 42 42 6 20 0 42-14 58-14 16-36 24-56 20-22-4-40-20-48-40-8-20-4-44 10-60 14-16 36-22 56-18 2 0 4 0 6 0z"/>
        </g>
      </svg>
    </div>
    <div class="hero-bg-glass hero-bg-glass-1"></div>
    <div class="hero-bg-glass hero-bg-glass-2"></div>
    <div class="hero-bg-glass hero-bg-glass-3"></div>
    <div class="hero-bg-glass hero-bg-glass-4"></div>
    <div class="hero-bg-trails">
      <svg viewBox="0 0 1200 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <path class="hero-bg-trail" d="M-20 420 Q 280 280, 520 360 T 980 300 T 1240 380"/>
        <path class="hero-bg-trail hero-bg-trail-2" d="M-40 180 Q 320 80, 580 160 T 920 120 T 1260 200"/>
        <path class="hero-bg-trail hero-bg-trail-3" d="M80 520 Q 360 440, 640 480 T 1100 420"/>
      </svg>
    </div>
    <div class="hero-bg-rays"></div>
    <div class="hero-bg-stars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="hero-bg-particles"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="hero-bg-icons">
      <span class="hero-bg-icon hero-bg-icon-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg></span>
      <span class="hero-bg-icon hero-bg-icon-2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg></span>
      <span class="hero-bg-icon hero-bg-icon-3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></span>
      <span class="hero-bg-icon hero-bg-icon-4"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg></span>
      <span class="hero-bg-icon hero-bg-icon-5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg></span>
      <span class="hero-bg-icon hero-bg-icon-6"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg></span>
      <span class="hero-bg-icon hero-bg-icon-7"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></span>
    </div>
  </div>
  <div class="hero-inner">

    <div class="hero-text-col">
      <span class="hero-sub">Trusted Ecommerce Partner — India</span>
      <h1>
        Launch &amp; Scale Your
        <span class="gold-line">Dropshipping Business</span>
        <span class="hero-h1-sub">with AI-Powered Automation</span>
      </h1>
      <p class="hero-desc">We build profitable online businesses by managing products, suppliers, marketplace setup, automation and growth — so you focus only on sales.</p>
      <div class="hero-actions">
        <a href="consultation.html" class="btn primary">
          <span>Start Selling Today</span>
          <svg class="hero-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
        <a href="https://wa.me/917428329102" class="btn ghost hero-btn-glass" target="_blank">Call Now</a>
      </div>
      <div class="hero-trust-row">
        <div class="hero-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          2,500+ Entrepreneurs
        </div>
        <div class="hero-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          95% Client Satisfaction
        </div>
        <div class="hero-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          Lifetime Expert Support
        </div>
        <div class="hero-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          AI Powered Setup
        </div>
      </div>
      <div class="hero-metrics">
        <div class="hero-metric">
          <strong data-hero-count="95" data-suffix="%">0%</strong>
          <span>Client Satisfaction</span>
        </div>
        <div class="hero-metric">
          <strong data-hero-count="2500" data-suffix="+">0</strong>
          <span>Businesses Launched</span>
        </div>
        <div class="hero-metric">
          <strong data-hero-count="3" data-prefix="₹" data-suffix="Cr+">₹0</strong>
          <span>Seller Revenue</span>
        </div>
        <div class="hero-metric">
          <strong>24/7</strong>
          <span>Expert Support</span>
        </div>
      </div>
    </div>

    <div class="hero-visual">
      <div class="hero-visual-stage hero-3d-stage" id="heroVisualStage">
        <div class="hero-holo-dash" aria-hidden="true">
          <div class="hero-holo-widget hero-holo-chart">
            <span class="hero-holo-label">Sales</span>
            <svg viewBox="0 0 120 48" preserveAspectRatio="none"><polyline points="0,40 20,32 40,36 60,22 80,26 100,14 120,18" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
          </div>
          <div class="hero-holo-widget hero-holo-revenue">
            <span class="hero-holo-label">Revenue</span>
            <strong>₹3.2L</strong>
            <span class="hero-holo-up">+28%</span>
          </div>
          <div class="hero-holo-widget hero-holo-orders">
            <span class="hero-holo-label">Orders</span>
            <strong>148</strong>
            <span class="hero-holo-dot"></span>
          </div>
          <div class="hero-holo-widget hero-holo-ai">
            <span class="hero-holo-label">AI Assistant</span>
            <span class="hero-holo-pulse"></span>
          </div>
          <div class="hero-holo-widget hero-holo-market">
            <span class="hero-holo-label">Marketplace</span>
            <div class="hero-holo-bars"><i></i><i></i><i></i><i></i></div>
          </div>
        </div>

        <div class="hero-char-fx" aria-hidden="true">
          <div class="hero-char-halo"></div>
          <div class="hero-char-beam"></div>
          <div class="hero-char-ring hero-char-ring-1"></div>
          <div class="hero-char-ring hero-char-ring-2"></div>
          <div class="hero-char-ring hero-char-ring-3"></div>
          <div class="hero-char-glass"></div>
        </div>
        <div class="hero-3d-gold" aria-hidden="true"></div>
        <div class="hero-3d-purple" aria-hidden="true"></div>
        <div class="hero-3d-particles" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>

        <div class="hf-card card-pos-1" data-parallax="0.18">
          <div class="hf-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.75"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg></div>
          <strong>AI Product Research</strong>
        </div>
        <div class="hf-card card-pos-2" data-parallax="0.22">
          <div class="hf-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.75"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg></div>
          <strong>Automated Orders</strong>
        </div>
        <div class="hf-card card-pos-3" data-parallax="0.14">
          <div class="hf-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.75"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h2M10 15h4"/></svg></div>
          <strong>Secure Payments</strong>
        </div>
        <div class="hf-card card-pos-4" data-parallax="0.2">
          <div class="hf-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.75"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>
          <strong>Fast Dispatch</strong>
        </div>
        <div class="hf-card card-pos-5" data-parallax="0.16">
          <div class="hf-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
          <strong>Real-time Tracking</strong>
        </div>
        <div class="hf-card card-pos-6" data-parallax="0.24">
          <div class="hf-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.75"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
          <strong>Revenue Growth</strong>
        </div>
        <div class="hf-card card-pos-7" data-parallax="0.12">
          <div class="hf-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.75"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></div>
          <strong>Supplier Network</strong>
        </div>
        <div class="hf-card card-pos-8" data-parallax="0.26">
          <div class="hf-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.75"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
          <strong>24/7 Support</strong>
        </div>

        <div class="hero-3d-char-wrap">
          <img src="hero-character.png" alt="" class="hero-3d-char" width="800" height="1000" decoding="async">
        </div>
      </div>
    </div>

  </div>
</section>

`;

html = html.slice(0, start) + heroHtml + html.slice(end);
writeFileSync(indexPath, html, "utf8");
console.log("Hero section patched successfully");
