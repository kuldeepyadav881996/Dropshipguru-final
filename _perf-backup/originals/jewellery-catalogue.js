(function () {
  "use strict";

  var BASE = "assets/catalogues/Jewellery/";
  var META_POOL = [
    { title: "Royal Diamond Necklace", collection: "Heritage Collection", category: "necklaces" },
    { title: "Emerald Drop Earrings", collection: "Signature Series", category: "earrings" },
    { title: "Gold Cuff Bracelet", collection: "Premium Collection", category: "bracelets" },
    { title: "Solitaire Diamond Ring", collection: "Luxury Edition", category: "rings" },
    { title: "Bridal Kundan Set", collection: "Wedding Collection", category: "bridal" },
    { title: "Diamond Pendant Suite", collection: "Elite Collection", category: "diamond" },
    { title: "Pearl Choker Necklace", collection: "Classic Collection", category: "necklaces" },
    { title: "Ruby Stud Earrings", collection: "Royal Series", category: "earrings" },
    { title: "Platinum Tennis Bracelet", collection: "Prestige Line", category: "bracelets" },
    { title: "Vintage Gold Ring", collection: "Artisan Collection", category: "rings" },
    { title: "Temple Bridal Set", collection: "Heritage Bridal", category: "bridal" },
    { title: "Brilliant Cut Diamond", collection: "Solitaire Series", category: "diamond" }
  ];

  var openBtn = document.getElementById("jewelCatalogueOpen");
  var catalogue = document.getElementById("jewelCatalogueGallery");
  if (!openBtn || !catalogue) return;

  var grid = document.getElementById("jcCatGrid");
  var filtersWrap = document.getElementById("jcCatFilters");
  var closeBtn = document.getElementById("jcCatClose");
  var backdrop = catalogue.querySelector("[data-jc-close]");
  var viewer = document.getElementById("jcCatViewer");
  var viewerImg = document.getElementById("jcCatViewerImg");
  var viewerCounter = document.getElementById("jcCatViewerCounter");
  var viewerClose = document.getElementById("jcCatViewerClose");
  var viewerPrev = document.getElementById("jcCatViewerPrev");
  var viewerNext = document.getElementById("jcCatViewerNext");
  var viewerStage = document.getElementById("jcCatViewerStage");

  var items = [];
  var filtered = [];
  var viewerList = [];
  var viewerIndex = 0;
  var activeFilter = "all";
  var loaded = false;
  var touchStartX = 0;
  var touchStartY = 0;
  var viewerAnimating = false;

  function encodeFile(name) {
    return BASE + encodeURIComponent(name).replace(/%20/g, "%20");
  }

  function metaForIndex(i) {
    var m = META_POOL[i % META_POOL.length];
    var cycle = Math.floor(i / META_POOL.length);
    return {
      title: cycle ? m.title + " " + (cycle + 1) : m.title,
      collection: m.collection,
      category: m.category
    };
  }

  function parseListing(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var names = [];
    doc.querySelectorAll("a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var name = href.split("/").pop().split("?")[0];
      if (/\.(jpe?g|png|webp|gif)$/i.test(name) && name !== "manifest.json") {
        names.push(decodeURIComponent(name));
      }
    });
    return names.sort();
  }

  function loadImages() {
    if (loaded) return Promise.resolve(items);
    return fetch(BASE + "manifest.json")
      .then(function (r) {
        if (!r.ok) throw new Error("no manifest");
        return r.json();
      })
      .then(function (data) {
        var files = data.images || data.files || [];
        return files.filter(function (f) {
          return /\.(jpe?g|png|webp|gif)$/i.test(f);
        });
      })
      .catch(function () {
        return fetch(BASE)
          .then(function (r) {
            if (!r.ok) throw new Error("no listing");
            return r.text();
          })
          .then(parseListing);
      })
      .catch(function () {
        return ["01.jpg", "02.jpg", "03 (2).jpg", "04.jpg", "05.jpg", "06.jpg"];
      })
      .then(function (files) {
        items = files.map(function (file, i) {
          var meta = metaForIndex(i);
          return {
            file: file,
            src: encodeFile(file),
            title: meta.title,
            collection: meta.collection,
            category: meta.category
          };
        });
        loaded = true;
        return items;
      });
  }

  function viewIconSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  }

  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = "";
    filtered = items.filter(function (item) {
      return activeFilter === "all" || item.category === activeFilter;
    });

    if (!filtered.length) {
      grid.innerHTML = '<p class="jc-cat-empty">No pieces in this collection yet.</p>';
      return;
    }

    filtered.forEach(function (item, i) {
      var card = document.createElement("article");
      card.className = "jc-cat-card";
      card.dataset.index = String(i);
      card.style.transitionDelay = Math.min(i * 0.07, 0.42) + "s";
      card.innerHTML =
        '<div class="jc-cat-card-media">' +
          '<img src="' + item.src + '" alt="' + item.title + '" loading="lazy">' +
          '<div class="jc-cat-card-overlay"></div>' +
        '</div>' +
        '<div class="jc-cat-card-foot">' +
          '<div class="jc-cat-card-info">' +
            '<h3>' + item.title + '</h3>' +
            '<span>' + item.collection + '</span>' +
          '</div>' +
          '<span class="jc-cat-card-view" aria-hidden="true">' + viewIconSvg() + '</span>' +
        '</div>';
      grid.appendChild(card);
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        catalogue.classList.add("is-ready");
        grid.querySelectorAll(".jc-cat-card").forEach(function (c) {
          c.classList.add("is-visible");
        });
      });
    });
  }

  function setFilter(filter) {
    activeFilter = filter;
    catalogue.classList.remove("is-ready");
    if (filtersWrap) {
      filtersWrap.querySelectorAll(".jc-cat-filter").forEach(function (btn) {
        btn.classList.toggle("is-active", btn.dataset.filter === filter);
      });
    }
    renderGrid();
  }

  function openCatalogue() {
    loadImages().then(function () {
      setFilter("all");
      catalogue.classList.add("is-open");
      catalogue.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (closeBtn) closeBtn.focus();
    });
  }

  function closeCatalogue() {
    closeViewer();
    catalogue.classList.remove("is-open", "is-ready");
    catalogue.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    openBtn.focus();
  }

  function updateViewerUI() {
    if (!viewerList.length) return;
    viewerCounter.textContent = (viewerIndex + 1) + " / " + viewerList.length;
    viewerPrev.disabled = viewerIndex === 0;
    viewerNext.disabled = viewerIndex === viewerList.length - 1;
  }

  function showViewerIndex(next) {
    if (viewerAnimating || next === viewerIndex) return;
    if (next < 0 || next >= viewerList.length) return;
    viewerAnimating = true;
    viewerImg.classList.remove("is-active");
    window.setTimeout(function () {
      viewerIndex = next;
      var item = viewerList[viewerIndex];
      viewerImg.src = item.src;
      viewerImg.alt = item.title;
      void viewerImg.offsetWidth;
      viewerImg.classList.add("is-active");
      updateViewerUI();
      if (viewerStage) viewerStage.scrollTop = 0;
      viewerAnimating = false;
    }, 180);
  }

  function openViewer(listIndex) {
    viewerList = filtered.slice();
    viewerIndex = listIndex;
    if (!viewerList.length) return;
    var item = viewerList[viewerIndex];
    viewerImg.src = item.src;
    viewerImg.alt = item.title;
    viewerImg.classList.add("is-active");
    updateViewerUI();
    viewer.classList.add("is-open");
    viewer.setAttribute("aria-hidden", "false");
    if (viewerClose) viewerClose.focus();
  }

  function closeViewer() {
    if (!viewer.classList.contains("is-open")) return;
    viewer.classList.remove("is-open");
    viewer.setAttribute("aria-hidden", "true");
    viewerImg.classList.remove("is-active");
  }

  openBtn.addEventListener("click", function (e) {
    e.preventDefault();
    openCatalogue();
  });

  if (closeBtn) closeBtn.addEventListener("click", closeCatalogue);
  if (backdrop) backdrop.addEventListener("click", closeCatalogue);

  if (filtersWrap) {
    filtersWrap.addEventListener("click", function (e) {
      var btn = e.target.closest(".jc-cat-filter");
      if (!btn) return;
      setFilter(btn.dataset.filter || "all");
    });
  }

  if (grid) {
    grid.addEventListener("click", function (e) {
      var card = e.target.closest(".jc-cat-card");
      if (!card) return;
      var i = parseInt(card.dataset.index, 10);
      if (!isNaN(i)) openViewer(i);
    });
  }

  if (viewerClose) viewerClose.addEventListener("click", closeViewer);
  if (viewerPrev) viewerPrev.addEventListener("click", function () { showViewerIndex(viewerIndex - 1); });
  if (viewerNext) viewerNext.addEventListener("click", function () { showViewerIndex(viewerIndex + 1); });

  document.addEventListener("keydown", function (e) {
    if (viewer.classList.contains("is-open")) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeViewer();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        showViewerIndex(viewerIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        showViewerIndex(viewerIndex + 1);
      }
      return;
    }
    if (!catalogue.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeCatalogue();
    }
  });

  if (viewerStage) {
    viewerStage.addEventListener("touchstart", function (e) {
      if (!e.changedTouches[0]) return;
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    viewerStage.addEventListener("touchend", function (e) {
      if (!viewer.classList.contains("is-open") || !e.changedTouches[0]) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) showViewerIndex(viewerIndex + 1);
      else showViewerIndex(viewerIndex - 1);
    }, { passive: true });
  }
})();
