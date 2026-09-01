(function () {
  "use strict";

  function initMenu() {
    var btn = document.getElementById("menuBtn");
    var nav = document.getElementById("navMenu");
    if (btn && nav) {
      btn.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }
  }

  function initProgress() {
    var bar = document.getElementById("legalProgress");
    if (!bar) return;
    function update() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + "%";
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initTocSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".legal-toc a[data-section]"));
    if (!links.length) return;
    var sections = links
      .map(function (link) {
        var id = link.getAttribute("data-section");
        return document.getElementById(id);
      })
      .filter(Boolean);

    function setActive(id) {
      links.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("data-section") === id);
      });
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) setActive(entry.target.id);
          });
        },
        { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
      );
      sections.forEach(function (section) {
        observer.observe(section);
      });
    } else {
      window.addEventListener("scroll", function () {
        var current = sections[0] ? sections[0].id : "";
        sections.forEach(function (section) {
          if (section.getBoundingClientRect().top <= 120) current = section.id;
        });
        setActive(current);
      });
    }

    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("data-section");
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", "#" + id);
        }
      });
    });
  }

  function initBackTop() {
    var btn = document.getElementById("legalBackTop");
    if (!btn) return;
    window.addEventListener(
      "scroll",
      function () {
        btn.classList.toggle("is-visible", window.scrollY > 480);
      },
      { passive: true }
    );
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initLucide() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function init() {
    initMenu();
    initProgress();
    initTocSpy();
    initBackTop();
    initLucide();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
