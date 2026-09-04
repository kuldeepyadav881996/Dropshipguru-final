(function () {
  "use strict";

  var CATALOGUE_ROOT = "assets/catalogues/";
  var IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

  var FOLDER_MAP = {
    "Beauty & Care": "Beauty & Care",
    "Eco-Friendly Products": "Eco Friendly Product",
    "Eco Friendly Product": "Eco Friendly Product",
    Gardening: "Gardning",
    "Gift Items": "Gift Items",
    "Hand Bags": "Hnad Bag",
    "Hand Bag": "Hnad Bag",
    "Home & Kitchen": "Home & Kitchen",
    "Home Decor": "Home Decor",
    "Ladies Wear": "Ladies Wear",
    "Ladies Footwear": "Ldies Foot wear",
    "Ladies Foot Wear": "Ldies Foot wear",
    "Spiritual Products": "Spiritual Product",
    "Spiritual Product": "Spiritual Product",
    "Toys & Baby": "Toys & Baby",
    "Travel Backpack": "Travel Bagpack",
    Jewellery: "Jewellery"
  };

  var gallery = document.getElementById("productGallery");
  if (!gallery) return;

  var closeBtn = document.getElementById("pgGalleryClose");
  var backdrop = gallery.querySelector("[data-pg-close]");
  var grid = document.getElementById("pgGalleryGrid");
  var titleEl = document.getElementById("pgGalleryTitle");
  var countEl = document.getElementById("pgGalleryCount");
  var descEl = document.getElementById("pgGalleryDesc");
  var coverImg = document.getElementById("pgGalleryCoverImg");
  var backBtn = document.getElementById("pgGalleryBack");
  var breadcrumbCurrent = document.getElementById("pgBreadcrumbCurrent");

  var lightbox = document.getElementById("pgLightbox");
  var lightboxImg = document.getElementById("pgLightboxImg");
  var lightboxCounter = document.getElementById("pgLightboxCounter");
  var lightboxClose = document.getElementById("pgLightboxClose");
  var lightboxPrev = document.getElementById("pgLightboxPrev");
  var lightboxNext = document.getElementById("pgLightboxNext");

  var items = [];
  var currentCategory = "";
  var viewerIndex = 0;
  var viewerAnimating = false;
  var cache = {};
  var lastFocus = null;
  var touchStartX = 0;
  var touchStartY = 0;
  var pageBase = "";

  function resolvePageBase() {
    if (pageBase) return pageBase;
    var ref =
      document.querySelector('script[src*="product-gallery.js"]') ||
      document.querySelector('link[href*="product-gallery.css"]') ||
      document.querySelector('link[href*="brand-icons.css"]');
    if (ref) {
      var attr = ref.getAttribute("src") || ref.getAttribute("href") || "";
      pageBase = new URL("./", new URL(attr, window.location.href)).href;
    } else {
      pageBase = new URL("./", window.location.href).href;
    }
    return pageBase;
  }

  function relFolderPath(folder) {
    return CATALOGUE_ROOT + folder + "/";
  }

  function relFilePath(folder, file) {
    return relFolderPath(folder) + file;
  }

  function encodedFileUrl(folder, file) {
    var segments = ["assets", "catalogues", folder, file];
    var encoded = segments.map(encodeURIComponent).join("/");
    return absUrl(encoded);
  }

  function absUrl(relPath) {
    try {
      return new URL(relPath, resolvePageBase()).href;
    } catch (err) {
      console.error("[ProductGallery] absUrl failed:", relPath, err);
      return relPath;
    }
  }

  function parseListing(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var names = [];
    doc.querySelectorAll("a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var name = href.split("/").pop().split("?")[0];
      if (IMAGE_EXT.test(name) && name !== "manifest.json") {
        names.push(decodeURIComponent(name));
      }
    });
    return names.sort(function (a, b) {
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }

  function buildItems(folder, files) {
    var valid = files.filter(function (f) {
      return IMAGE_EXT.test(f);
    });
    var list = valid.map(function (file, i) {
      var rel = relFilePath(folder, file);
      var src = encodedFileUrl(folder, file);
      console.log("[ProductGallery] Loading:", rel);
      return { file: file, rel: rel, src: src, index: i };
    });
    cache[folder] = list;
    return list.slice();
  }

  function loadFromEmbedded(folder) {
    var data = window.CATALOGUES_DATA;
    if (!data || !data[folder]) return null;
    var entry = data[folder];
    var files = entry.images || entry.files || [];
    console.log("[ProductGallery] Using embedded manifest:", folder, files.length, "images");
    return buildItems(folder, files);
  }

  function loadImages(folder) {
    console.log("[ProductGallery] loadImages:", folder);
    if (cache[folder]) {
      console.log("[ProductGallery] Cache hit:", folder, cache[folder].length);
      return Promise.resolve(cache[folder].slice());
    }

    var embedded = loadFromEmbedded(folder);
    if (embedded && embedded.length) {
      return Promise.resolve(embedded);
    }

    var manifestRel = relFolderPath(folder) + "manifest.json";
    var manifestUrl = absUrl(
      ["assets", "catalogues", folder, "manifest.json"].map(encodeURIComponent).join("/")
    );
    console.log("[ProductGallery] Fetching manifest:", manifestRel);

    return fetch(manifestUrl, { credentials: "same-origin" })
      .then(function (r) {
        if (!r.ok) {
          throw new Error("manifest HTTP " + r.status + " for " + manifestRel);
        }
        return r.json();
      })
      .then(function (data) {
        var files = data.images || data.files || [];
        console.log("[ProductGallery] Manifest loaded:", folder, files.length, "files");
        if (!files.length) throw new Error("empty manifest for " + folder);
        return buildItems(folder, files);
      })
      .catch(function (err) {
        console.warn("[ProductGallery] Manifest failed:", err.message || err);
        var listingRel = relFolderPath(folder);
        console.log("[ProductGallery] Trying directory listing:", listingRel);
        return fetch(
          absUrl(["assets", "catalogues", folder].map(encodeURIComponent).join("/") + "/"),
          { credentials: "same-origin" }
        )
          .then(function (r) {
            if (!r.ok) throw new Error("listing HTTP " + r.status + " for " + listingRel);
            return r.text();
          })
          .then(function (html) {
            var files = parseListing(html);
            console.log("[ProductGallery] Listing found:", folder, files.length, "files");
            if (!files.length) throw new Error("no images found for " + folder);
            return buildItems(folder, files);
          });
      });
  }

  function cardHeroFromExplore(card) {
    var bg = card && card.querySelector(".cat-bg");
    if (!bg) return "";
    var style = bg.getAttribute("style") || "";
    var m = style.match(/background(?:-image)?:\s*url\((['"]?)([^'")]+)\1\)/i);
    return m ? m[2] : "";
  }

  function productLabel(category) {
    var labels = {
      "Beauty & Care": "Beauty",
      "Home & Kitchen": "Kitchen",
      "Toys & Baby": "Baby",
      "Ladies Footwear": "Footwear",
      "Ladies Wear": "Wear",
      "Eco-Friendly Products": "Eco",
      "Spiritual Products": "Spiritual",
      "Hand Bags": "Handbag",
      "Gift Items": "Gift",
      "Travel Backpack": "Travel",
      "Home Decor": "Decor",
      Gardening: "Garden"
    };
    return labels[category] || category.split(" ")[0];
  }

  function productTitle(category, index) {
    var num = String(index + 1).padStart(2, "0");
    return productLabel(category) + " Product " + num;
  }

  function categoryDesc(card) {
    if (!card) return "";
    var p = card.querySelector("p");
    return p ? p.textContent.trim() : "";
  }

  function showLoading(category, card) {
    if (titleEl) titleEl.textContent = category;
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = category;
    if (countEl) countEl.textContent = "Loading…";
    if (descEl) descEl.textContent = categoryDesc(card) || "Curated premium products for your business.";
    if (grid) grid.innerHTML = '<p class="pg-gallery-empty">Loading products…</p>';
  }

  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = "";
    gallery.classList.remove("is-ready");

    if (!items.length) {
      grid.innerHTML =
        '<p class="pg-gallery-empty">Product gallery for this category is coming soon.</p>';
      return;
    }

    items.forEach(function (item, i) {
      var card = document.createElement("article");
      card.className = "pg-gallery-card";
      card.dataset.index = String(i);
      card.style.transitionDelay = Math.min(i * 0.06, 0.45) + "s";

      var inner = document.createElement("div");
      inner.className = "pg-gallery-card-inner";

      var media = document.createElement("div");
      media.className = "pg-gallery-card-media";

      var img = document.createElement("img");
      img.alt = productTitle(currentCategory, i);
      img.decoding = "async";
      img.draggable = false;
      img.loading = "eager";
      img.addEventListener("load", function () {
        console.log("[ProductGallery] Loaded:", item.rel, img.naturalWidth + "x" + img.naturalHeight);
      });
      img.addEventListener("error", function () {
        console.error("[ProductGallery] Image failed:", item.rel, "URL:", item.src);
      });
      img.src = item.src;

      var shine = document.createElement("div");
      shine.className = "pg-gallery-card-shine";
      shine.setAttribute("aria-hidden", "true");

      var view = document.createElement("div");
      view.className = "pg-gallery-card-view";
      view.setAttribute("aria-hidden", "true");
      var viewSpan = document.createElement("span");
      viewSpan.textContent = "View Product";
      view.appendChild(viewSpan);

      media.appendChild(img);
      inner.appendChild(media);
      inner.appendChild(shine);
      inner.appendChild(view);

      var foot = document.createElement("div");
      foot.className = "pg-gallery-card-foot";
      var title = document.createElement("h3");
      title.className = "pg-gallery-card-title";
      title.textContent = productTitle(currentCategory, i);
      foot.appendChild(title);

      card.appendChild(inner);
      card.appendChild(foot);
      grid.appendChild(card);
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        gallery.classList.add("is-ready");
        grid.querySelectorAll(".pg-gallery-card").forEach(function (c) {
          c.classList.add("is-visible");
        });
      });
    });
  }

  function updateHeader(category, heroSrc, card) {
    if (titleEl) titleEl.textContent = category;
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = category;
    if (countEl) {
      countEl.textContent = items.length === 1 ? "1 Product" : items.length + " Products";
    }
    if (descEl) {
      descEl.textContent =
        categoryDesc(card) || "Curated premium products for your business.";
    }
    if (coverImg) {
      var hero = items[0] ? items[0].src : heroSrc;
      if (hero && !/^data:/i.test(hero)) {
        coverImg.src = hero;
        coverImg.alt = category + " collection";
        coverImg.hidden = false;
      } else if (heroSrc && !/^data:/i.test(heroSrc)) {
        coverImg.src = heroSrc;
        coverImg.alt = category + " collection";
        coverImg.hidden = false;
      } else {
        coverImg.removeAttribute("src");
        coverImg.hidden = true;
      }
    }
  }

  function openGalleryShell(category) {
    currentCategory = category;
    lastFocus = document.activeElement;
    gallery.classList.add("is-open");
    gallery.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function openGallery(category, card) {
    var folder = FOLDER_MAP[category];
    console.log("[ProductGallery] Open:", category, "->", folder || "(no folder)");
    openGalleryShell(category);
    showLoading(category, card);

    if (!folder) {
      items = [];
      updateHeader(category, cardHeroFromExplore(card), card);
      renderGrid();
      if (closeBtn) closeBtn.focus();
      return;
    }

    loadImages(folder)
      .then(function (list) {
        items = list;
        updateHeader(category, cardHeroFromExplore(card), card);
        renderGrid();
        if (closeBtn) closeBtn.focus();
      })
      .catch(function (err) {
        console.error("[ProductGallery] Load failed:", category, folder, err && err.message ? err.message : err);
        items = [];
        if (countEl) countEl.textContent = "Unable to load";
        if (grid) {
          grid.innerHTML =
            '<p class="pg-gallery-empty">Unable to load products for this category.</p>';
        }
        if (closeBtn) closeBtn.focus();
      });
  }

  function closeGallery() {
    closeLightbox();
    gallery.classList.remove("is-open", "is-ready");
    gallery.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function updateLightboxUI() {
    if (!items.length) return;
    lightboxCounter.textContent = "Image " + (viewerIndex + 1) + " of " + items.length;
    lightboxPrev.disabled = viewerIndex === 0;
    lightboxNext.disabled = viewerIndex === items.length - 1;
  }

  function showLightboxIndex(next) {
    if (viewerAnimating || next === viewerIndex) return;
    if (next < 0 || next >= items.length) return;
    viewerAnimating = true;
    lightboxImg.classList.remove("is-active");
    window.setTimeout(function () {
      viewerIndex = next;
      lightboxImg.src = items[viewerIndex].src;
      lightboxImg.alt = currentCategory + " product";
      void lightboxImg.offsetWidth;
      lightboxImg.classList.add("is-active");
      updateLightboxUI();
      viewerAnimating = false;
    }, 180);
  }

  function openLightbox(index) {
    if (!items.length) return;
    viewerIndex = index;
    lightboxImg.src = items[viewerIndex].src;
    lightboxImg.alt = currentCategory + " product";
    lightboxImg.classList.add("is-active");
    updateLightboxUI();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox.classList.contains("is-open")) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.classList.remove("is-active");
  }

  function bindExploreButtons() {
    var cards = document.querySelectorAll("#categories .category-card");
    console.log("[ProductGallery] Binding Explore buttons:", cards.length);
    cards.forEach(function (card) {
      var titleElCard = card.querySelector("h3");
      var explore = card.querySelector(".cat-content a") || card.querySelector("a");
      if (!titleElCard || !explore) return;
      if (explore.dataset.pgBound === "1") return;
      var category = titleElCard.textContent.trim();
      explore.dataset.pgBound = "1";
      explore.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        openGallery(category, card);
      });
    });
  }

  bindExploreButtons();

  if (backBtn) {
    backBtn.addEventListener("click", function () {
      closeGallery();
      var section = document.getElementById("categories");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeGallery);
  if (backdrop) backdrop.addEventListener("click", closeGallery);

  if (grid) {
    grid.addEventListener("click", function (e) {
      var card = e.target.closest(".pg-gallery-card");
      if (!card) return;
      var i = parseInt(card.dataset.index, 10);
      if (!isNaN(i)) openLightbox(i);
    });
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", function () {
      showLightboxIndex(viewerIndex - 1);
    });
  }
  if (lightboxNext) {
    lightboxNext.addEventListener("click", function () {
      showLightboxIndex(viewerIndex + 1);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (lightbox.classList.contains("is-open")) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        showLightboxIndex(viewerIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        showLightboxIndex(viewerIndex + 1);
      }
      return;
    }
    if (!gallery.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeGallery();
    }
  });

  var lightboxStage = document.getElementById("pgLightboxStage");
  if (lightboxStage) {
    lightboxStage.addEventListener(
      "touchstart",
      function (e) {
        if (!e.changedTouches[0]) return;
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
      },
      { passive: true }
    );
    lightboxStage.addEventListener(
      "touchend",
      function (e) {
        if (!lightbox.classList.contains("is-open") || !e.changedTouches[0]) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        var dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
        if (dx < 0) showLightboxIndex(viewerIndex + 1);
        else showLightboxIndex(viewerIndex - 1);
      },
      { passive: true }
    );
  }

  window.ProductGallery = {
    open: openGallery,
    map: FOLDER_MAP,
    loadImages: loadImages,
    verifyAll: function () {
      var folders = [];
      var seen = {};
      Object.keys(FOLDER_MAP).forEach(function (cat) {
        var f = FOLDER_MAP[cat];
        if (f && !seen[f]) {
          seen[f] = true;
          folders.push({ category: cat, folder: f });
        }
      });
      return Promise.all(
        folders.map(function (entry) {
          return loadImages(entry.folder).then(function (list) {
            return {
              category: entry.category,
              folder: entry.folder,
              count: list.length,
              ok: list.length > 0
            };
          }).catch(function (err) {
            return {
              category: entry.category,
              folder: entry.folder,
              count: 0,
              ok: false,
              error: err.message || String(err)
            };
          });
        })
      );
    }
  };

  console.log("[ProductGallery] Ready. Base:", resolvePageBase(), "Embedded:", !!window.CATALOGUES_DATA);
})();
