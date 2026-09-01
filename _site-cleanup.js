/**
 * One-shot website cleanup. Run: node _site-cleanup.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SKIP = new Set(["node_modules", "_perf-backup", ".git"]);
const EXT = new Set([".html", ".js", ".css", ".xml", ".txt", ".json", ".md"]);
const NEW_NAME = "DropShipGuru ( Chandrahas )";

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    if (name === "_site-cleanup.js") continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(name).toLowerCase())) out.push(p);
  }
  return out;
}

function cutBetween(src, startMarker, endMarker) {
  const a = src.indexOf(startMarker);
  const b = src.indexOf(endMarker);
  if (a === -1 || b === -1 || b < a) return src;
  return src.slice(0, a) + src.slice(b);
}

function applyChrome(s) {
  s = s.replace(/<!--\s*Floating WhatsApp\s*-->\s*/gi, "");
  s = s.replace(
    /<a href="https:\/\/wa\.me\/[^"]+" class="float-wa"[\s\S]*?<\/a>\s*/gi,
    ""
  );

  s = s.replace(
    /\s*<a href="https:\/\/www\.instagram\.com\/[^"]+"[^>]*>[\s\S]*?<\/a>/gi,
    ""
  );
  s = s.replace(
    /\s*<a href="https:\/\/www\.facebook\.com\/[^"]+"[^>]*>[\s\S]*?<\/a>/gi,
    ""
  );
  s = s.replace(
    /\s*<a href="https:\/\/wa\.me\/[^"]+"[^>]*aria-label="WhatsApp"[^>]*>[\s\S]*?<\/a>/gi,
    ""
  );

  s = s.replace(
    /\s*<a href="(?:\.\.\/)?index\.html#products">Products<\/a>\s*/g,
    "\n      "
  );
  s = s.replace(/\s*<a href="#products">Products<\/a>\s*/g, "\n    ");
  s = s.replace(
    /\s*<a href="(?:\.\.\/)?index\.html#categories">Categories<\/a>\s*/g,
    "\n      "
  );
  s = s.replace(/\s*<a href="#categories">Categories<\/a>\s*/g, "\n    ");

  s = s.replace(/\s*<li><a href="(?:\.\.\/)?index\.html#products">Products<\/a><\/li>/g, "");
  s = s.replace(/\s*<li><a href="#products">Products<\/a><\/li>/g, "");
  s = s.replace(/\s*<li><a href="(?:\.\.\/)?index\.html#categories">Categories<\/a><\/li>/g, "");
  s = s.replace(/\s*<li><a href="#categories">Categories<\/a><\/li>/g, "");

  s = s.replace(
    /\s*<li class="footer-contact-item">\s*(?:<span class="footer-contact-ico"[^>]*>💬<\/span>\s*)?<div class="footer-contact-body">\s*<span class="footer-contact-label">(?:💬 )?WhatsApp<\/span>\s*<a href="https:\/\/wa\.me\/[^"]+"[^>]*>[\s\S]*?<\/a>\s*<\/div>\s*<\/li>/gi,
    ""
  );
  s = s.replace(
    /\s*<li class="footer-contact-item">\s*<span class="footer-contact-label">💬 WhatsApp<\/span>\s*<a href="https:\/\/wa\.me\/[^"]+"[^>]*>[\s\S]*?<\/a>\s*<\/li>/gi,
    ""
  );

  s = s.replace(
    /href="https:\/\/wa\.me\/917428329102"/g,
    'href="tel:+917428329102"'
  );

  s = s.replace(/DropshipGuru Private Limited/g, NEW_NAME);
  s = s.replace(/Dropshipguru Private Limited/g, NEW_NAME);
  s = s.replace(/DropshipGuru Pvt\.?\s*Ltd\.?/g, NEW_NAME);
  s = s.replace(/Dropshipguru Pvt\.?\s*Ltd\.?/g, NEW_NAME);

  s = s.replace(/'WhatsApp Support'/g, "'Email & Phone Support'");
  s = s.replace(/WhatsApp Support/g, "Email & Phone Support");
  return s;
}

function patchIndex(s) {
  s = s.replace(
    'content="Dropship Guru helps beginners launch profitable dropshipping businesses in India with Shopify setup, winning products, automation, store setup and ecommerce guidance."',
    'content="DropShipGuru ( Chandrahas ) helps beginners launch dropshipping and ecommerce businesses in India with store setup, marketplace onboarding, supplier coordination, and business guidance."'
  );
  s = s.replace(
    'content="Start your dropshipping business with expert setup, winning products and ecommerce growth strategies."',
    'content="Start your dropshipping business with expert store setup, marketplace onboarding, and ecommerce guidance."'
  );
  s = s.replace(
    '"legalName": "DropshipGuru Private Limited"',
    `"legalName": "${NEW_NAME}"`
  );
  s = s.replace(
    '"sameAs": ["https://www.instagram.com/dropshipguru.info/", "https://youtube.com/@drop_guruship?si=fOIyn08aKyOjVrT6", "https://www.facebook.com/profile.php?id=61590783530879"]',
    '"sameAs": ["https://youtube.com/@drop_guruship?si=fOIyn08aKyOjVrT6"]'
  );

  s = s.replace(
    "Complete setup for Amazon, Meesho, Flipkart, WhatsApp, Instagram &amp; your own store — pick a plan and start selling.",
    "Complete setup for Amazon, Meesho, Flipkart, Shopify and your own store — pick a plan and start selling."
  );

  s = s.replace(
    /<a href="https:\/\/wa\.me\/917428329102" class="btn ghost hero-btn-glass"[\s\S]*?Talk to Expert\s*<\/a>/,
    `<a href="tel:+917428329102" class="btn ghost hero-btn-glass">
          <svg class="hero-call-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.12.9.33 1.77.63 2.6a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.48-1.2a2 2 0 012.11-.45c.83.3 1.7.51 2.6.63A2 2 0 0122 16.92z"/></svg>
          Talk to Expert
        </a>`
  );

  s = s.replace(
    '<div class="stat"><strong data-count-to="1000" data-suffix="+">0</strong><span>Products Researched</span></div>',
    '<div class="stat"><strong data-count-to="1000" data-suffix="+">0</strong><span>Sellers Guided</span></div>'
  );

  s = s.replace(
    "Dedicated WhatsApp support, real humans",
    "Dedicated email and phone support, real humans"
  );

  s = s.replace(
    `<article class="afu-card">
            <span class="afu-ico brand-icon-wrap" data-icon="target" aria-hidden="true"></span>
            <div class="afu-copy"><h4>Winning Products</h4><p>Hand-picked products with proven Indian demand.</p></div>
          </article>`,
    `<article class="afu-card">
            <span class="afu-ico brand-icon-wrap" data-icon="target" aria-hidden="true"></span>
            <div class="afu-copy"><h4>Supplier Coordination</h4><p>Sourcing support and order-flow guidance for your store.</p></div>
          </article>`
  );

  s = s.replace(
    '<a href="https://wa.me/917428329102" class="btn ghost" target="_blank" rel="noopener">Talk to Expert</a>',
    '<a href="tel:+917428329102" class="btn ghost">Talk to Expert</a>'
  );

  s = cutBetween(s, "<!-- CATEGORIES -->", "<!-- TOOLS -->");
  s = cutBetween(s, "<!-- JEWELRY PRODUCTS -->", "<!-- TOOLS -->");

  s = s.replace(
    /\s*<a href="consultation.html\?plan=whatsapp" class="tools-platform-card reveal" style="--i:5">[\s\S]*?<\/a>/,
    ""
  );
  s = s.replace(
    /\s*<a href="consultation.html\?plan=instagram" class="tools-platform-card reveal" style="--i:6">[\s\S]*?<\/a>/,
    ""
  );
  s = s.replace(
    /\s*<a href="consultation.html\?plan=instagram" class="tools-platform-card reveal" style="--i:7">[\s\S]*?<\/a>/,
    ""
  );

  s = s.replace(
    "<li>Business profile setup (WhatsApp / Instagram / Marketplace)</li>",
    "<li>Marketplace / store profile setup and branding</li>"
  );
  s = s.replace(
    "<li>WhatsApp auto-reply &amp; broadcast lists configured</li>",
    "<li>Order process and store notifications configured</li>"
  );
  s = s.replace(
    "<li>Social media content calendar created</li>",
    "<li>Store listing and catalog structure prepared</li>"
  );
  s = s.replace(
    "<li>Ad campaigns launched (Meta / Google Ads)</li>",
    "<li>Marketplace visibility and listing quality reviewed</li>"
  );
  s = s.replace(
    "<li>Organic content &amp; reels posted with viral hooks</li>",
    "<li>First-week order handling and fulfillment walkthrough</li>"
  );
  s = s.replace(
    "<li>Hashtag &amp; outreach strategy executed</li>",
    "<li>Supplier coordination and dispatch process explained</li>"
  );

  s = s.replace(
    /\s*<div class="plan-card plan-wa">[\s\S]*?<\/div>\s*(?=\s*<div class="plan-card plan-insta)/,
    "\n\n      "
  );
  s = s.replace(
    /\s*<div class="plan-card plan-insta popular">[\s\S]*?<\/div>\s*(?=\s*<div class="plan-card plan-meesho)/,
    "\n\n      "
  );

  s = s.replace(
    "Affordable, beginner-friendly courses to master every platform � from WhatsApp to your own ecommerce website.",
    "Affordable, beginner-friendly courses to master marketplaces and your own ecommerce website."
  );
  s = s.replace(
    "Affordable, beginner-friendly courses to master every platform from WhatsApp to your own ecommerce website.",
    "Affordable, beginner-friendly courses to master marketplaces and your own ecommerce website."
  );

  s = s.replace(
    /\s*<!-- ELITE - WhatsApp Business Mastery -->[\s\S]*?(?=<!-- STARTER - Instagram)/,
    "\n\n      "
  );
  s = s.replace(
    /\s*<!-- STARTER - Instagram & Facebook Mastery \(Featured\) -->[\s\S]*?(?=<!-- GROWTH - Meesho)/,
    "\n\n      "
  );

  s = s.replace(
    `"Shopify store setup was done in 3 days. Products are selling like crazy on Instagram."`,
    `"Shopify store setup was done in 3 days. Orders started coming in smoothly after launch."`
  );
  s = s.replace(
    `"Inki WhatsApp support 24 ghante rehti hai. Kabhi bhi koi problem ho, turat solve!"`,
    `"Inki team support bahut fast hai. Kabhi bhi koi problem ho, turat solve!"`
  );

  s = s.replace(
    "<div class=\"faq-item\"><button>Do you provide products? <span>+</span></button><p>Yes! We provide hand-picked winning products with reliable suppliers.</p></div>",
    "<div class=\"faq-item\"><button>Do you help with suppliers and listings? <span>+</span></button><p>Yes. We help with supplier coordination, listing guidance, and store setup so you can start selling without holding inventory.</p></div>"
  );
  s = s.replace(
    "Absolutely. Depending on your plan, you get email, WhatsApp, or dedicated manager support.",
    "Absolutely. Depending on your plan, you get email, phone, or dedicated manager support."
  );

  s = s.replace("'Dedicated WhatsApp support'", "'Dedicated email and phone support'");

  const galStart = s.indexOf('<link rel="stylesheet" href="jewellery-catalogue.css">');
  const galEnd = s.indexOf('<script src="brand-icons.js');
  if (galStart !== -1 && galEnd !== -1 && galEnd > galStart) {
    s = s.slice(0, galStart) + s.slice(galEnd);
  }
  return s;
}

function patchPlanDetails(s) {
  s = s.replace(
    /whatsapp: \{[\s\S]*?\n    instagram: \{[\s\S]*?\n    meesho: \{/,
    "meesho: {"
  );
  s = s.replace(
    "var FEATURE_ICONS = ['check','package','tools','chart','lightning','handshake','whatsapp','rocket','star','target'];",
    "var FEATURE_ICONS = ['check','package','tools','chart','lightning','handshake','rocket','star','target'];"
  );
  s = s.replace(
    "if (n.indexOf('whatsapp') !== -1 || n.indexOf('mobile') !== -1) return 'whatsapp';",
    "if (n.indexOf('mobile') !== -1) return 'email';"
  );
  s = s.replace(
    `+ '<a href="https://wa.me/917428329102" class="' + secondaryClass + '" target="_blank" rel="noopener">Talk to Expert</a>';`,
    `+ '<a href="tel:+917428329102" class="' + secondaryClass + '">Talk to Expert</a>';`
  );
  s = s.replace(
    `+ '<a href="tel:+917428329102" class="' + secondaryClass + '" target="_blank" rel="noopener">Talk to Expert</a>';`,
    `+ '<a href="tel:+917428329102" class="' + secondaryClass + '">Talk to Expert</a>';`
  );
  return s;
}

function patchConsultation(s) {
  s = s.replace(
    '  <span class="field-ico brand-icon-wrap" data-icon="whatsapp" aria-hidden="true"></span>',
    '            <span class="field-ico brand-icon-wrap" data-icon="email" aria-hidden="true"></span>'
  );
  s = s.replace(
    "Our expert will contact you on WhatsApp within 24 hours.",
    "Our expert will contact you by phone or email within 24 hours."
  );
  s = s.replace(
    "You get a dedicated account manager, product listing support, order processing help, monthly strategy calls, and 24/7 WhatsApp support for the full year.",
    "You get a dedicated account manager, listing support, order processing help, monthly strategy calls, and email and phone support for the full year."
  );
  s = s.replace(
    /<a href="https:\/\/wa\.me\/917428329102" class="cta-secondary"[\s\S]*?<\/a>/,
    '<a href="tel:+917428329102" class="cta-secondary">📞 Call an Expert</a>'
  );
  s = s.replace(
    /  whatsapp:\{name:'WhatsApp Business'[\s\S]*?\},\r?\n  instagram:\{name:'Instagram & Facebook'[\s\S]*?\},\r?\n/,
    ""
  );
  s = s.replace(
    /  'whatsapp-business':\{name:'WhatsApp Business Mastery Course'[\s\S]*?\},\r?\n  'instagram-facebook':\{name:'Instagram & Facebook Mastery Course'[\s\S]*?\},\r?\n/,
    ""
  );
  s = s.replace(
    /<a href="https:\/\/wa\.me\/917428329102" class="consult-sticky-wa"[\s\S]*?<\/a>/,
    '<a href="tel:+917428329102" class="consult-sticky-call">📞 Talk to Expert</a>'
  );
  s = s.replace(
    /<a href="tel:\+917428329102" class="consult-sticky-wa"[\s\S]*?<\/a>/,
    '<a href="tel:+917428329102" class="consult-sticky-call">📞 Talk to Expert</a>'
  );
  return s;
}

function patchAbout(s) {
  s = s.replace(
    contentAboutOld,
    contentAboutNew
  );
  return s;
}

const contentAboutOld = `          <p>From marketplace seller-account setup and product research to store development, branding, marketing support, and one-on-one mentorship, our mission is to make selling online simple, transparent, and achievable for everyone — regardless of their background or prior experience.</p>
        </div>

        <section class="legal-section" id="what-we-do">
          <h2>What We Do</h2>
          <p>DropShipGuru ( Chandrahas ) provides end-to-end digital ecommerce and business-support services, including:</p>
          <ul>
            <li>Seller account setup on Amazon, Flipkart, and Meesho;</li>
            <li>Shopify store setup and custom ecommerce website development;</li>
            <li>Product research, listing creation, and catalogue management;</li>
            <li>Branding, creative, and digital marketing support (Meta &amp; Google Ads);</li>
            <li>Business consultation, mentorship, and structured mastery courses;</li>
            <li>Ongoing account management and dispatch support.</li>
          </ul>
        </section>`;

const contentAboutNew = `          <p>From marketplace seller-account setup and store development to supplier coordination, order fulfillment support, and one-on-one mentorship, our mission is to make selling online simple, transparent, and achievable for everyone — regardless of their background or prior experience.</p>
        </div>

        <section class="legal-section" id="what-we-do">
          <h2>What We Do</h2>
          <p>DropShipGuru ( Chandrahas ) provides end-to-end digital ecommerce and business-support services, including:</p>
          <ul>
            <li>Seller account setup on Amazon, Flipkart, and Meesho;</li>
            <li>Shopify store setup and custom ecommerce website development;</li>
            <li>Supplier coordination and order fulfillment support;</li>
            <li>Store management support and ecommerce guidance;</li>
            <li>Business consultation, mentorship, and structured mastery courses;</li>
            <li>Ongoing account management and dispatch support.</li>
          </ul>
        </section>`;

function main() {
  const files = walk(ROOT);
  let changed = 0;
  for (const file of files) {
    let s = fs.readFileSync(file, "utf8");
    const orig = s;
    s = applyChrome(s);
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    if (rel === "index.html") s = patchIndex(s);
    if (rel === "plan-details.html") s = patchPlanDetails(s);
    if (rel === "consultation.html") s = patchConsultation(s);
    if (rel === "about/index.html") s = patchAbout(s);
    if (rel === "contact/index.html") {
      s = s.replace(
        /Reach our team by email, phone, or WhatsApp for support and business enquiries\./g,
        "Reach our team by email or phone for support and business enquiries."
      );
      s = s.replace(
        /Get in touch with DropShipGuru \( Chandrahas \) by email, phone, or WhatsApp\./g,
        "Get in touch with DropShipGuru ( Chandrahas ) by email or phone."
      );
      s = s.replace(
        /Reach the DropShipGuru \( Chandrahas \) team by email, phone, or WhatsApp for support, billing, or business enquiries\./g,
        "Reach the DropShipGuru ( Chandrahas ) team by email or phone for support, billing, or business enquiries."
      );
      s = s.replace(
        /\s*<div class="legal-card"><p><strong>💬 WhatsApp<\/strong><br><a href="[^"]+"[^>]*>Talk to Expert<\/a><\/p><\/div>/,
        ""
      );
      s = s.replace(/Phone \/ WhatsApp:/g, "Phone:");
    }
    if (s !== orig) {
      fs.writeFileSync(file, s);
      changed++;
      console.log("updated", rel);
    }
  }
  console.log("files changed:", changed);

  for (const f of [
    "product-gallery.js",
    "product-gallery.css",
    "jewellery-catalogue.js",
    "jewellery-catalogue.css",
    "catalogues-data.js",
  ]) {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log("deleted", f);
    }
  }
}

main();
