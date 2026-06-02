(function () {
  "use strict";

  /** Ngày giờ đám cưới (GMT+7) — chỉnh tại đây */
  var WEDDING_ISO = "2026-06-15T11:00:00+07:00";

  var cdDays  = document.getElementById("cd-days");
  var cdHours = document.getElementById("cd-hours");
  var cdMins  = document.getElementById("cd-mins");
  var cdSecs  = document.getElementById("cd-secs");
  var countdownEl   = document.getElementById("countdown");
  var countdownDone = document.getElementById("countdown-done");
  var audio    = document.getElementById("bg-music");
  var audioBtn = document.getElementById("audio-toggle");
  var iconOff  = document.getElementById("icon-music-off");
  var iconOn   = document.getElementById("icon-music-on");

  var prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pad(n) { return String(n).padStart(2, "0"); }

  /** Countdown */
  function tickCountdown() {
    var target = new Date(WEDDING_ISO).getTime();
    var diff = target - Date.now();

    if (diff <= 0) {
      if (countdownEl) countdownEl.classList.add("is-ended");
      if (countdownDone) countdownDone.hidden = false;
      return false;
    }

    var s = Math.floor(diff / 1000);
    if (cdDays)  cdDays.textContent  = pad(Math.floor(s / 86400));
    if (cdHours) cdHours.textContent = pad(Math.floor((s % 86400) / 3600));
    if (cdMins)  cdMins.textContent  = pad(Math.floor((s % 3600) / 60));
    if (cdSecs)  cdSecs.textContent  = pad(s % 60);
    return true;
  }

  if (tickCountdown() !== false) {
    var timer = setInterval(function () {
      if (!tickCountdown()) clearInterval(timer);
    }, 1000);
  }

  /** Scroll reveal — hỗ trợ --d (delay) qua inline style */
  var revealEls = document.querySelectorAll(".reveal");
  if (!prefersReduced && revealEls.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /** Cánh hoa rơi */
  function initPetals() {
    if (prefersReduced) return;
    var container = document.getElementById("petals");
    if (!container) return;
    var count = 22;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("div");
      var size = (9 + Math.random() * 10).toFixed(1);
      p.className = "petal";
      p.style.left = (Math.random() * 100) + "vw";
      p.style.animationDuration = (7 + Math.random() * 9) + "s";
      p.style.animationDelay = (-Math.random() * 18) + "s";
      p.style.opacity = (0.45 + Math.random() * 0.55).toFixed(2);
      p.style.setProperty("--petal-size", size + "px");
      container.appendChild(p);
    }
  }
  initPetals();

  /** Gallery parallax + caption */
  function setupGalleryStoryEffects() {
    var panels = document.querySelectorAll(".gallery__panel");
    if (!panels.length || prefersReduced) return;

    if ("IntersectionObserver" in window) {
      var panelObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            panels.forEach(function (p) { p.classList.remove("is-active"); });
            entry.target.classList.add("is-active");
          });
        },
        { root: null, threshold: 0.45, rootMargin: "-8% 0px -8% 0px" }
      );
      panels.forEach(function (p) { panelObserver.observe(p); });
    }

    var ticking = false;
    function updateParallax() {
      var vc = window.innerHeight / 2;
      panels.forEach(function (panel) {
        var rect  = panel.getBoundingClientRect();
        var delta = ((rect.top + rect.height / 2) - vc) * -0.08;
        var capped = Math.max(-42, Math.min(42, delta));
        var img = panel.querySelector("img");
        if (img) img.style.setProperty("--img-parallax", capped.toFixed(2) + "px");
      });
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateParallax();
  }
  setupGalleryStoryEffects();

  /** Lightbox với prev/next navigation */
  var lightbox      = document.getElementById("lightbox");
  var lightboxImg   = document.getElementById("lightbox-img");
  var lightboxClose = document.getElementById("lightbox-close");
  var lightboxPrev  = document.getElementById("lightbox-prev");
  var lightboxNext  = document.getElementById("lightbox-next");
  var lightboxCounter = document.getElementById("lightbox-counter");

  var lightboxImages = [];
  var lightboxIndex  = 0;

  document.querySelectorAll("[data-lightbox]").forEach(function (btn, idx) {
    var img = btn.querySelector("img");
    if (img) {
      lightboxImages.push({ src: img.src, alt: img.alt || "" });
      btn.addEventListener("click", function () {
        lightboxIndex = idx;
        showAt(idx);
      });
    }
  });

  function showAt(idx) {
    if (!lightbox || !lightboxImg) return;
    var item = lightboxImages[idx];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    if (lightboxCounter) {
      lightboxCounter.textContent = (idx + 1) + " / " + lightboxImages.length;
    }
    if (!lightbox.open) lightbox.showModal();
  }

  function closeLightbox() {
    if (lightbox && lightbox.open) {
      lightbox.close();
      lightboxImg.src = "";
    }
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", function () {
      lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
      showAt(lightboxIndex);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", function () {
      lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
      showAt(lightboxIndex);
    });
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener("cancel", closeLightbox);
  }

  document.addEventListener("keydown", function (e) {
    if (!lightbox || !lightbox.open) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") {
      lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
      showAt(lightboxIndex);
    }
    if (e.key === "ArrowRight") {
      lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
      showAt(lightboxIndex);
    }
  });

  /** Nhạc nền */
  function setAudioUi(playing) {
    if (!audioBtn) return;
    audioBtn.setAttribute("aria-pressed", playing ? "true" : "false");
    audioBtn.setAttribute("aria-label", playing ? "Tắt nhạc nền" : "Bật nhạc nền");
    if (iconOff) iconOff.style.display = playing ? "none" : "block";
    if (iconOn)  iconOn.style.display  = playing ? "block" : "none";
  }

  if (audioBtn && audio) {
    audioBtn.addEventListener("click", function () {
      if (audio.paused) {
        audio.play().then(
          function () { setAudioUi(true); },
          function () { setAudioUi(false); }
        );
      } else {
        audio.pause();
        setAudioUi(false);
      }
    });
  }

  /** RSVP */
  var form       = document.getElementById("rsvp-form");
  var formStatus = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", function (e) {
      var action = form.getAttribute("action") || "";
      if (action.indexOf("YOUR_FORM_ID") !== -1) {
        e.preventDefault();
        if (formStatus) {
          formStatus.textContent = "Vui lòng thay YOUR_FORM_ID bằng mã Formspree của bạn rồi thử lại.";
          formStatus.classList.add("is-show");
        }
        return;
      }
      if (formStatus) {
        formStatus.textContent = "Đang gửi…";
        formStatus.classList.add("is-show");
      }
    });
  }
})();
