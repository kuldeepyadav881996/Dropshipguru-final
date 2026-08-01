(function (global) {
  "use strict";

  var SVGS = {
    whatsapp:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',

    instagram:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FD5949"/><stop offset="50%" stop-color="#D6249F"/><stop offset="100%" stop-color="#285AEB"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig)"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="17.4" cy="6.6" r="1.2" fill="#fff"/></svg>',

    facebook:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>',

    amazon:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="#FF9900" d="M13.2 13.8c-2.9 2.1-6.8 3.2-9.8 3.2-4.2 0-4.7-.1-4.7-.5 0-.3.3-2.1 1.3-3.9 1.2-2.1 2.8-3.6 4.7-4.4.3-.2.6 0 .5.3-.2.6-.7 2-.7 3 0 1.1.6 2.2 1.9 2.2 1.1 0 2.2-.6 3.1-1.5l-1.3-5H5.8l.3-1h7.5l1 3.7z"/><path fill="#FF9900" d="M17.2 18.5c-3.4 2.5-8 3.8-11.7 3.8-.4 0-.7 0-1-.1 3.6 2.1 8.3 3.3 13 3.3 5.3 0 9.8-1.2 13.5-3.3-.3.1-.6.1-1 .1-3.7 0-8.3-1.3-11.8-3.8z"/></svg>',

    meesho:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="#F43361" d="M4 4h6.5l1.8 12.5L12 20l-2.3-3.5L7.9 4H4zm10 0h6l-2.4 16h-3.1l.5-3.5h-3.8l-.6 3.5H9.5L12 4h2zm-1.2 9.5h3.3l.9-6h-3.3l-.9 6z"/></svg>',

    flipkart:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="#2874F0" d="M4 18.5L7 5.5h3.2l2.2 8.2 2.3-8.2H18l-3 13H14l-2.4-8.5L9.2 18.5H4z"/><path fill="#F9D71C" d="M6.5 7.5h9.5l-.8 2.5H7.3l-.8-2.5z"/></svg>',

    shopify:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="#95BF47" d="M15.3 3.4l-.2 1.2c-.4-.1-.9-.2-1.5-.2-1.5 0-2.5.7-2.5 1.9 0 .8.5 1.3 1.3 1.7l-1.1 4.2h2.3l.8-3.1c.3.1.7.1 1 .1 1.5 0 2.5-.7 2.5-1.9 0-.7-.4-1.2-1.1-1.5l.5-2.3h-2zm-5.8 0L4.2 20.2h2.4l1.1-4.3.9 4.3h2.3l1.5-6.1c-.9-.3-1.5-.9-1.5-1.8 0-1.2 1-1.9 2.5-1.9.5 0 1 .1 1.4.2l.2-1.2H9.5z"/></svg>',

    razorpay:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="#0C2451" d="M4 6h16v2.2H9.8L16 18h-2.8l-4.2-7.2V18H6V6z"/><path fill="#3395FF" d="M14.5 6H18v12h-2.2l-1.3-8z"/></svg>',

    google:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.6 3.5-5.4 3.5-3.3 0-5.9-2.7-5.9-6.1S8.7 5.4 12 5.4c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.8 2.9 14.6 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.9 0 8.6-4.8 8.6-7.2 0-.5 0-.9-.1-1.2H12z"/></svg>',

    website:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><defs><linearGradient id="globe-g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E8C872"/><stop offset="100%" stop-color="#D4AF37"/></linearGradient></defs><circle cx="12" cy="12" r="9" stroke="url(#globe-g)" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="4" ry="9" stroke="url(#globe-g)" stroke-width="1.2"/><path d="M3 12h18M4.5 7.5h15M4.5 16.5h15" stroke="url(#globe-g)" stroke-width="1.1" stroke-linecap="round"/></svg>',

    ecommerce:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6h15l-1.5 9H7.5L6 6z" stroke="#D4AF37" stroke-width="1.6" stroke-linejoin="round"/><circle cx="9" cy="19" r="1.4" fill="#D4AF37"/><circle cx="17" cy="19" r="1.4" fill="#D4AF37"/><path d="M6 6L5 3H2" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round"/></svg>',

    seo:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="#D4AF37" stroke-width="1.6"/><path d="M15.5 15.5L21 21" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round"/><path d="M8 10.5h5M10.5 8v5" stroke="#D4AF37" stroke-width="1.4" stroke-linecap="round"/></svg>',

    branding:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l1.8 5.5H19l-4.6 3.3 1.8 5.5L12 14l-4.2 3.3 1.8-5.5L5 8.5h5.2L12 3z" stroke="#D4AF37" stroke-width="1.5" stroke-linejoin="round"/></svg>',

    "product-listing":
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.2" stroke="#D4AF37" stroke-width="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.2" stroke="#D4AF37" stroke-width="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.2" stroke="#D4AF37" stroke-width="1.5"/><path d="M13 16.5h7M13 19.5h5" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round"/></svg>',

    marketing:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10v4l12 3V7L4 10z" stroke="#D4AF37" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 8.5c1.8 1.2 3 3.2 3 5.5s-1.2 4.3-3 5.5" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round"/></svg>',

    dispatch:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 7h11v9H3z" stroke="#D4AF37" stroke-width="1.6"/><path d="M14 10h4l3 3v3h-7v-6z" stroke="#D4AF37" stroke-width="1.6" stroke-linejoin="round"/><circle cx="7" cy="18" r="1.8" stroke="#D4AF37" stroke-width="1.4"/><circle cx="18" cy="18" r="1.8" stroke="#D4AF37" stroke-width="1.4"/></svg>',

    warehouse:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 10l9-6 9 6v10H3V10z" stroke="#D4AF37" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 20v-6h6v6" stroke="#D4AF37" stroke-width="1.5"/></svg>',

    "customer-support":
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12a8 8 0 0116 0" stroke="#D4AF37" stroke-width="1.6"/><path d="M4 12v3a2 2 0 002 2h1v-5H4zm16 0v3a2 2 0 01-2 2h-1v-5h3z" stroke="#D4AF37" stroke-width="1.5" stroke-linejoin="round"/></svg>',

    consultation:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" stroke="#D4AF37" stroke-width="1.6"/><path d="M8 3v4M16 3v4M4 10h16" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="15" r="2" fill="#D4AF37"/></svg>',

    "product-research":
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="#D4AF37" stroke-width="1.6"/><path d="M16 16l4.5 4.5" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round"/><circle cx="11" cy="11" r="2" fill="#D4AF37"/></svg>',

    "account-management":
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.5" stroke="#D4AF37" stroke-width="1.6"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round"/></svg>',

    mentorship:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 10a4 4 0 118 0" stroke="#D4AF37" stroke-width="1.6"/><path d="M6 20v-1a6 6 0 0112 0v1" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round"/><path d="M12 14v3" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round"/></svg>',

    growth:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 18V6M4 18h16" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round"/><path d="M7 14l4-4 3 3 5-6" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',

    students:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4L3 9l9 5 9-5-9-5z" stroke="#D4AF37" stroke-width="1.6" stroke-linejoin="round"/><path d="M6 12v4c0 0 2.7 3 6 3s6-3 6-3v-4" stroke="#D4AF37" stroke-width="1.6"/></svg>',

    professional:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="8" width="16" height="11" rx="1.5" stroke="#D4AF37" stroke-width="1.6"/><path d="M9 8V6a3 3 0 016 0v2" stroke="#D4AF37" stroke-width="1.6"/></svg>',

    housewife:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 11l8-7 8 7v9H4v-9z" stroke="#D4AF37" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 20v-6h4v6" stroke="#D4AF37" stroke-width="1.5"/></svg>',

    business:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="6" width="14" height="14" rx="1.5" stroke="#D4AF37" stroke-width="1.6"/><path d="M9 6V4h6v2M9 11h2M13 11h2M9 15h2M13 15h2" stroke="#D4AF37" stroke-width="1.4" stroke-linecap="round"/></svg>',

    entrepreneur:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l2.2 6.8H21l-5.7 4.1 2.2 6.8L12 16.6 6.5 20.7l2.2-6.8L3 9.8h6.8L12 3z" stroke="#D4AF37" stroke-width="1.5" stroke-linejoin="round"/></svg>',

    check:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="#24D56A" stroke-width="1.6"/><path d="M8 12l3 3 5-6" stroke="#24D56A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',

    star:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="#D4AF37" d="M12 2l2.9 6.9H22l-5.8 4.2 2.2 6.9L12 15.8 5.6 20l2.2-6.9L2 8.9h7.1L12 2z"/></svg>',

    rocket:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3c3 4 4 8 4 12a4 4 0 01-8 0c0-4 1-8 4-12z" stroke="#D4AF37" stroke-width="1.6"/><path d="M10 15l-3 4M14 15l3 4" stroke="#D4AF37" stroke-width="1.4" stroke-linecap="round"/><circle cx="12" cy="11" r="1.5" fill="#D4AF37"/></svg>',

    money:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2" stroke="#D4AF37" stroke-width="1.6"/><circle cx="12" cy="12" r="2.5" stroke="#D4AF37" stroke-width="1.5"/></svg>',

    time:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="#D4AF37" stroke-width="1.6"/><path d="M12 8v4l3 2" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round"/></svg>',

    book:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h9a3 3 0 013 3v14l-4-2-4 2-4-2-4 2V7a3 3 0 013-3z" stroke="#D4AF37" stroke-width="1.6" stroke-linejoin="round"/></svg>',

    tools:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.7 6.3a4 4 0 00-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 005.4-5.4l-2.1 2.1-2.8-2.8 2.1-2.1z" stroke="#D4AF37" stroke-width="1.6" stroke-linejoin="round"/></svg>',

    phone:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 4h3l1 4-2 1a11 11 0 005 5l1-2 4 1v3a2 2 0 01-2 2A14 14 0 017 6a2 2 0 012-2z" stroke="#D4AF37" stroke-width="1.6" stroke-linejoin="round"/></svg>',

    email:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2" stroke="#D4AF37" stroke-width="1.6"/><path d="M3 8l9 6 9-6" stroke="#D4AF37" stroke-width="1.5"/></svg>',

    location:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" stroke="#D4AF37" stroke-width="1.6"/><circle cx="12" cy="11" r="2" fill="#D4AF37"/></svg>',

    user:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.5" stroke="#D4AF37" stroke-width="1.6"/><path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round"/></svg>',

    shield:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" stroke="#D4AF37" stroke-width="1.6" stroke-linejoin="round"/></svg>',

    lightning:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="#D4AF37" d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>',

    fire:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="#FF6B35" d="M12 2c1 3 3 4.5 3 7.5a3.5 3.5 0 01-7 0C8 6.5 10 5 12 2zm0 9c2.5 0 4.5 2 4.5 4.5S14.5 20 12 20s-4.5-2-4.5-4.5S9.5 11 12 11z"/></svg>',

    target:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="#D4AF37" stroke-width="1.6"/><circle cx="12" cy="12" r="4" stroke="#D4AF37" stroke-width="1.5"/><circle cx="12" cy="12" r="1.2" fill="#D4AF37"/></svg>',

    package:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="#D4AF37" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" stroke="#D4AF37" stroke-width="1.4"/></svg>',

    chart:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 18V10M10 18V6M15 18v-5M20 18V8" stroke="#D4AF37" stroke-width="1.8" stroke-linecap="round"/></svg>',

    handshake:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12l3-2 4 3 5-4 4 3" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16l3 2M17 14l3 2" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round"/></svg>',

    calendar:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" stroke="#D4AF37" stroke-width="1.6"/><path d="M8 3v4M16 3v4M4 10h16" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round"/></svg>',

    document:
      '<svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 4h8l4 4v12H8V4z" stroke="#D4AF37" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 4v4h4M10 12h8M10 16h6" stroke="#D4AF37" stroke-width="1.4" stroke-linecap="round"/></svg>'
  };

  var ALIASES = {
    "whatsapp-business": "whatsapp",
    wa: "whatsapp",
    "instagram-facebook": "social",
    insta: "social",
    social: "social",
    "amazon-in": "amazon-in",
    "amazon-com": "amazon-com",
    amazon: "amazon-in",
    meesho: "meesho",
    flipkart: "flipkart",
    shopify: "shopify",
    website: "website",
    "ecommerce-website": "ecommerce",
    "marketplace-mastery": "meesho",
    "amazon-seller": "amazon-in",
    razorpay: "razorpay",
    facebook: "facebook",
    google: "google",
    "🛍️": "shopify",
    "📊": "meesho",
    "🛒": "amazon-in",
    "🏬": "flipkart",
    "📱": "whatsapp",
    "💬": "whatsapp",
    "📸": "instagram",
    "🌐": "website",
    "🌍": "amazon-com",
    "🌎": "amazon-com",
    "⏱️": "time",
    "🎯": "target",
    "🚀": "rocket",
    "📈": "growth",
    "💰": "money",
    "📚": "book",
    "🛠️": "tools",
    "📦": "package",
    "📊": "chart",
    "💡": "lightning",
    "🤝": "handshake",
    "✅": "check",
    "⭐": "star",
    "🎓": "students",
    "💼": "professional",
    "🏠": "housewife",
    "🏢": "business",
    "🔥": "fire",
    "⚡": "lightning",
    "📅": "calendar",
    "📍": "location",
    "📞": "phone",
    "✉": "email",
    "✉️": "email",
    "🔒": "shield"
  };

  var SERVICE_MAP = {
    "Business Setup Guide": "consultation",
    "Product Research": "product-research",
    "Supplier Contacts": "dispatch",
    "Marketing Tips": "marketing",
    "Support & Guidance": "customer-support",
    "Winning Product Ideas": "target",
    "Account Management & Support": "account-management",
    "Branding": "branding",
    "Product Listing": "product-listing",
    "SEO": "seo",
    "Website Development": "website",
    "Ecommerce Website": "ecommerce"
  };

  var _svgUid = 0;

  function normalizeSvg(svg) {
    if (!svg) return "";
    var cleaned = svg.replace(/\s(width|height)="[^"]*"/gi, "");
    cleaned = cleaned.replace(
      /<svg([^>]*)>/i,
      '<svg$1 width="24" height="24" preserveAspectRatio="xMidYMid meet">'
    );
    return cleaned;
  }

  function uniqueGradients(svg) {
    var id = "ig-" + ++_svgUid;
    return svg
      .replace(/id="ig"/g, 'id="' + id + '"')
      .replace(/url\(#ig\)/g, "url(#" + id + ")");
  }

  function prepareSvg(svg) {
    return normalizeSvg(uniqueGradients(svg));
  }

  function isPlatformContainer(el) {
    return (
      el.classList.contains("plan-platform-icon") ||
      el.classList.contains("consult-plan-icon") ||
      el.classList.contains("plat-logo-wrap") ||
      el.classList.contains("pd-hero-icon-inline") ||
      el.classList.contains("tools-platform-icon") ||
      el.classList.contains("ec-platform-logo")
    );
  }

  function amazonHtml(variant) {
    var isGlobal = variant === "com" || variant === "global";
    var badge = isGlobal ? "GLOBAL" : "IN";
    return (
      '<div class="amazon-icon-stack">' +
      prepareSvg(SVGS.amazon) +
      '<span class="amazon-market-badge">' +
      badge +
      "</span></div>"
    );
  }

  function dualSvg(svg) {
    return normalizeSvg(svg)
      .replace(/width="24"/g, 'width="18"')
      .replace(/height="24"/g, 'height="18"');
  }

  function socialHtml() {
    return (
      '<div class="social-dual-icons">' +
      uniqueGradients(dualSvg(SVGS.instagram)) +
      dualSvg(SVGS.facebook) +
      "</div>"
    );
  }

  function resolve(name, variant) {
    if (!name) return prepareSvg(SVGS.target);
    var key = String(name).toLowerCase().trim();
    if (ALIASES[key]) key = ALIASES[key];
    if (key === "amazon-in") return amazonHtml("in");
    if (key === "amazon-com") return amazonHtml("com");
    if (key === "social") return socialHtml();
    var svg = SVGS[key];
    if (!svg) return prepareSvg(SVGS.target);
    return prepareSvg(svg);
  }

  function html(name, variant) {
    return resolve(name, variant);
  }

  var PLATFORM_KEYS = {
    whatsapp: true,
    instagram: true,
    facebook: true,
    social: true,
    meesho: true,
    flipkart: true,
    amazon: true,
    "amazon-in": true,
    "amazon-com": true,
    shopify: true,
    website: true,
    ecommerce: true
  };

  var OFFICIAL_TOOL_LOGOS = {
    "amazon-in": { src: "assets/logo/amazon.png?v=2", amazon: true },
    "amazon-com": { src: "assets/logo/amazon-com.png?v=2", amazon: true },
    meesho: { src: "assets/logo/meesho.png?v=2" },
    flipkart: { src: "assets/logo/flipkart.png?v=2" },
    shopify: { src: "assets/logo/shopify.png?v=2" },
    instagram: { src: "assets/logo/instagram.png?v=2" }
  };

  function logoUrl(relPath) {
    try {
      var base = document.baseURI || window.location.href;
      var resolved = new URL(relPath, base).href;
      return resolved;
    } catch (err) {
      console.error("[BrandIcons] logoUrl resolve failed:", relPath, err.message || err);
      return relPath;
    }
  }

  function mountOfficialToolLogo(el, icon) {
    var cfg = OFFICIAL_TOOL_LOGOS[icon];
    if (!cfg) return false;
    if (el.dataset.logoLoading === "1") return true;
    applyVariant(el);
    var relSrc = cfg.src;
    var absSrc = logoUrl(relSrc);
    console.log(icon, absSrc);

    el.dataset.logoLoading = "1";
    el.innerHTML = "";
    el.classList.add("tools-official-logo");
    el.dataset.brandMounted = "1";

    var cls = "official-brand-img";
    if (cfg.amazon) cls += " official-brand-img--amazon";
    if (icon === "shopify") cls += " official-brand-img--shopify";
    if (icon === "meesho") cls += " official-brand-img--meesho";
    var img = document.createElement("img");
    img.className = cls;
    img.alt = "";
    img.decoding = "async";
    img.draggable = false;
    img.dataset.logoPath = relSrc;

    img.addEventListener("load", function () {
      el.dataset.logoLoading = "0";
      console.log("[BrandIcons] Logo rendered:", icon, img.src, img.naturalWidth + "x" + img.naturalHeight);
    });

    img.addEventListener("error", function onImgError() {
      if (/\.png$/i.test(relSrc)) {
        var svgRel = relSrc.replace(/\.png$/i, ".svg");
        var svgAbs = logoUrl(svgRel);
        console.warn("[BrandIcons] PNG unavailable, trying SVG:", icon, svgAbs);
        relSrc = svgRel;
        img.dataset.logoPath = svgRel;
        img.removeEventListener("error", onImgError);
        img.addEventListener("error", function () {
          el.dataset.logoLoading = "0";
          console.error("[BrandIcons] Logo load failed:", icon, svgAbs, "PNG and SVG both failed to load");
        });
        img.src = svgAbs;
        return;
      }
      el.dataset.logoLoading = "0";
      console.error("[BrandIcons] Logo load failed:", icon, absSrc, "Image failed to load");
    });

    img.src = absSrc;
    el.appendChild(img);

    return true;
  }

  function mountToolsPlatformLogos() {
    document.querySelectorAll("#tools .tools-platform-icon[data-icon]").forEach(function (el) {
      var icon = el.getAttribute("data-icon");
      el.removeAttribute("data-brand-mounted");
      delete el.dataset.logoLoading;
      if (OFFICIAL_TOOL_LOGOS[icon]) {
        mountOfficialToolLogo(el, icon);
      } else {
        mount(el);
      }
    });
  }

  function applyVariant(el) {
    if (!el) return;
    el.classList.add("brand-icon-wrap");
    if (isPlatformContainer(el)) {
      el.classList.add("platform-icon", "platform-logo");
    }
  }

  function mount(el) {
    if (!el || el.dataset.brandMounted === "1") return;
    var icon = el.getAttribute("data-icon") || el.getAttribute("data-brand");
    var variant = el.getAttribute("data-variant") || "";
    if (!icon) return;
    if (el.classList.contains("tools-platform-icon") && mountOfficialToolLogo(el, icon)) {
      return;
    }
    applyVariant(el);
    var content = resolve(icon, variant);
    if (!content || content.indexOf("<svg") === -1) {
      content = prepareSvg(SVGS.target);
    }
    if (el.classList.contains("field-ico")) {
      content = content.replace(/width="24"/g, 'width="18"').replace(/height="24"/g, 'height="18"');
    }
    el.innerHTML = content;
    el.dataset.brandMounted = "1";
  }

  function createElement(platform) {
    var el = document.createElement("span");
    el.className = "platform-icon platform-logo brand-icon-wrap";
    el.setAttribute("data-icon", platform);
    el.setAttribute("aria-hidden", "true");
    mount(el);
    return el;
  }

  function htmlFor(platform) {
    var wrap = document.createElement("div");
    var el = createElement(platform);
    wrap.appendChild(el);
    return wrap.innerHTML;
  }

  function mountAll(root) {
    var scope = root || document;
    scope.querySelectorAll("[data-icon], [data-brand]").forEach(function (el) {
      if (
        el.tagName === "A" &&
        el.getAttribute("data-brand") &&
        !el.getAttribute("data-icon") &&
        el.querySelector(".tool-chip-icon")
      ) {
        return;
      }
      if (el.getAttribute("data-brand") && el.tagName === "A" && el.classList.contains("tool-chip-link-processed")) {
        return;
      }
      if (el.classList.contains("tools-platform-icon")) {
        return;
      }
      mount(el);
    });
  }

  function enhanceToolChips(root) {
    var scope = root || document;
    scope.querySelectorAll(".tool-chips a[data-brand]").forEach(function (a) {
      if (a.dataset.toolChipDone === "1") return;
      var brand = a.getAttribute("data-brand");
      var text = a.textContent.replace(/^[\u{1F300}-\u{1FAFF}\u2600-\u27BF]\s*/u, "").trim();
      a.innerHTML =
        '<span class="tool-chip-icon brand-icon-wrap" data-icon="' +
        brand +
        '"></span><span>' +
        text +
        "</span>";
      mount(a.querySelector(".tool-chip-icon"));
      a.dataset.toolChipDone = "1";
    });
  }

  function benefitIcon(title, fallback) {
    if (SERVICE_MAP[title]) return html(SERVICE_MAP[title]);
    return resolve(fallback || "check");
  }

  global.BrandIcons = {
    html: html,
    resolve: resolve,
    mount: mount,
    mountAll: mountAll,
    enhanceToolChips: enhanceToolChips,
    benefitIcon: benefitIcon,
    amazonHtml: amazonHtml,
    socialHtml: socialHtml,
    ALIASES: ALIASES,
    applyVariant: applyVariant,
    isPlatformContainer: isPlatformContainer,
    createElement: createElement,
    htmlFor: htmlFor,
    normalizeSvg: normalizeSvg,
    PLATFORM_KEYS: PLATFORM_KEYS,
    OFFICIAL_TOOL_LOGOS: OFFICIAL_TOOL_LOGOS,
    mountToolsPlatformLogos: mountToolsPlatformLogos,
    logoUrl: logoUrl
  };

  global.PlatformLogo = {
    mount: mount,
    mountAll: mountAll,
    create: createElement,
    html: htmlFor,
    resolve: resolve,
    applyVariant: applyVariant,
    normalizeSvg: normalizeSvg,
    ICON_SIZE: 24,
    BOX_SIZE: 44
  };

  global.PlatformIcon = global.PlatformLogo;

  function enhanceFloatWa(root) {
    var scope = root || document;
    scope.querySelectorAll(".float-wa").forEach(function (a) {
      if (a.dataset.waDone === "1") return;
      var first = a.childNodes[0];
      if (first && first.nodeType === 3 && /💬|📱/.test(first.textContent)) {
        a.insertAdjacentHTML(
          "afterbegin",
          '<span class="brand-icon-wrap" data-icon="whatsapp" aria-hidden="true"></span>'
        );
        first.textContent = first.textContent.replace(/💬|📱\s*/, "");
        mount(a.querySelector(".brand-icon-wrap"));
      }
    });
  }

  function enhanceFooterSocials(root) {
    var scope = root || document;
    var map = [
      ["instagram", /instagram/i],
      ["facebook", /facebook/i],
      ["google", /youtube/i],
      ["whatsapp", /wa\.me|whatsapp/i],
      ["professional", /linkedin/i]
    ];
    scope.querySelectorAll(".footer-socials a").forEach(function (a) {
      if (a.dataset.socialDone === "1") return;
      var href = a.getAttribute("href") || "";
      var label = a.getAttribute("aria-label") || a.textContent || "";
      var icon = "star";
      for (var i = 0; i < map.length; i++) {
        if (map[i][1].test(href) || map[i][1].test(label)) {
          icon = map[i][0];
          break;
        }
      }
      if (/[📸📘▶️💬💼🎓]/.test(a.textContent)) {
        a.innerHTML =
          '<span class="brand-icon-wrap" data-icon="' +
          icon +
          '" aria-hidden="true"></span>';
        mount(a.querySelector(".brand-icon-wrap"));
        a.dataset.socialDone = "1";
      }
    });
  }

  function init() {
    mountAll();
    mountToolsPlatformLogos();
    enhanceToolChips();
    enhanceFloatWa();
    enhanceFooterSocials();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : globalThis);
