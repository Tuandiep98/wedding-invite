(function () {
  "use strict";

  /** Ngày giờ đám cưới (GMT+7) — chỉnh tại đây */
  var WEDDING_ISO = "2026-06-15T11:00:00+07:00";

  var countdownEl = document.getElementById("countdown");
  var cdDays = document.getElementById("cd-days");
  var cdHours = document.getElementById("cd-hours");
  var cdMins = document.getElementById("cd-mins");
  var cdSecs = document.getElementById("cd-secs");
  var countdownDone = document.getElementById("countdown-done");
  var introEl = document.getElementById("invite-intro");
  var openInviteBtn = document.getElementById("open-invite-btn");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tickCountdown() {
    var target = new Date(WEDDING_ISO).getTime();
    var now = Date.now();
    var diff = target - now;

    if (diff <= 0) {
      if (countdownEl) countdownEl.classList.add("is-ended");
      if (countdownDone) countdownDone.hidden = false;
      return false;
    }

    var s = Math.floor(diff / 1000);
    var days = Math.floor(s / 86400);
    var hours = Math.floor((s % 86400) / 3600);
    var mins = Math.floor((s % 3600) / 60);
    var secs = s % 60;

    if (cdDays) cdDays.textContent = pad(days);
    if (cdHours) cdHours.textContent = pad(hours);
    if (cdMins) cdMins.textContent = pad(mins);
    if (cdSecs) cdSecs.textContent = pad(secs);
    return true;
  }

  if (tickCountdown() !== false) {
    var countdownTimer = setInterval(function () {
      if (tickCountdown() === false) {
        clearInterval(countdownTimer);
      }
    }, 1000);
  }

  /** Scroll reveal */
  var prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Intro card mở thiệp */
  function unlockInviteContent() {
    document.body.classList.remove("is-intro-active");
    document.body.classList.add("is-invite-open");
    if (introEl) introEl.setAttribute("aria-hidden", "true");
    var heroTitle = document.querySelector(".hero__names");
    if (heroTitle) heroTitle.setAttribute("tabindex", "-1");
    if (heroTitle && typeof heroTitle.focus === "function") heroTitle.focus();
  }

  if (!introEl || !openInviteBtn) {
    unlockInviteContent();
  } else if (prefersReduced) {
    introEl.classList.add("is-opened");
    unlockInviteContent();
  } else {
    openInviteBtn.addEventListener("click", function () {
      if (introEl.classList.contains("is-opening")) return;
      introEl.classList.add("is-opening");
      window.setTimeout(function () {
        introEl.classList.add("is-expanding");
      }, 700);
      window.setTimeout(function () {
        introEl.classList.add("is-opened");
        unlockInviteContent();
      }, 1450);
    });
  }

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
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /** Gallery parallax + chuyển trạng thái caption theo section */
  function setupGalleryStoryEffects() {
    var panels = document.querySelectorAll(".gallery__panel");
    if (!panels.length || prefersReduced) return;

    if ("IntersectionObserver" in window) {
      var panelObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            panels.forEach(function (panel) {
              panel.classList.remove("is-active");
            });
            entry.target.classList.add("is-active");
          });
        },
        { root: null, threshold: 0.45, rootMargin: "-8% 0px -8% 0px" }
      );
      panels.forEach(function (panel) {
        panelObserver.observe(panel);
      });
    }

    var ticking = false;
    function updateParallax() {
      var viewportCenter = window.innerHeight / 2;
      panels.forEach(function (panel) {
        var rect = panel.getBoundingClientRect();
        var panelCenter = rect.top + rect.height / 2;
        var delta = (panelCenter - viewportCenter) * -0.08;
        var capped = Math.max(-42, Math.min(42, delta));
        var image = panel.querySelector("img");
        if (image) {
          image.style.setProperty("--img-parallax", capped.toFixed(2) + "px");
        }
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

  /** Lightbox */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxClose = document.getElementById("lightbox-close");

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.showModal();
  }

  function closeLightbox() {
    if (lightbox && lightbox.open) {
      lightbox.close();
      lightboxImg.src = "";
    }
  }

  document.querySelectorAll("[data-lightbox]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var img = btn.querySelector("img");
      if (img) openLightbox(img.src, img.alt);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener("cancel", function () {
      closeLightbox();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox && lightbox.open) closeLightbox();
  });

  /** Nhạc nền */
  var audio = document.getElementById("bg-music");
  var audioBtn = document.getElementById("audio-toggle");
  var iconOff = document.getElementById("icon-music-off");
  var iconOn = document.getElementById("icon-music-on");

  function setAudioUi(playing) {
    if (!audioBtn) return;
    audioBtn.setAttribute("aria-pressed", playing ? "true" : "false");
    audioBtn.setAttribute(
      "aria-label",
      playing ? "Tắt nhạc nền" : "Bật nhạc nền"
    );
    if (iconOff) iconOff.style.display = playing ? "none" : "block";
    if (iconOn) iconOn.style.display = playing ? "block" : "none";
  }

  if (audioBtn && audio) {
    audioBtn.addEventListener("click", function () {
      if (audio.paused) {
        audio.play().then(
          function () {
            setAudioUi(true);
          },
          function () {
            setAudioUi(false);
          }
        );
      } else {
        audio.pause();
        setAudioUi(false);
      }
    });
  }

  /** RSVP — thông báo khi chưa đổi Formspree */
  var form = document.getElementById("rsvp-form");
  var formStatus = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", function (e) {
      var action = form.getAttribute("action") || "";
      if (action.indexOf("YOUR_FORM_ID") !== -1) {
        e.preventDefault();
        if (formStatus) {
          formStatus.textContent =
            "Vui lòng thay YOUR_FORM_ID trong action của form bằng mã Formspree của bạn, rồi thử lại.";
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
