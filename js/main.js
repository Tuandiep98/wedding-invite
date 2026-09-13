(function () {
  "use strict";

  /** Ngày giờ đám cưới (GMT+7) — chỉnh tại đây */
  var WEDDING_ISO = "2026-10-13T11:00:00+07:00";

  var cdDays = document.getElementById("cd-days");
  var cdHours = document.getElementById("cd-hours");
  var cdMins = document.getElementById("cd-mins");
  var cdSecs = document.getElementById("cd-secs");
  var countdownEl = document.getElementById("countdown");
  var countdownDone = document.getElementById("countdown-done");
  var audio = document.getElementById("bg-music");
  var audioBtn = document.getElementById("audio-toggle");
  var iconOff = document.getElementById("icon-music-off");
  var iconOn = document.getElementById("icon-music-on");

  var ringGate = document.getElementById("ring-gate");
  var ringGateTrigger = document.getElementById("ring-gate-trigger");
  var ringGateSkip = document.getElementById("ring-gate-skip");
  var ringGateSparkles = document.getElementById("ring-gate-sparkles");
  var ringGatePrompt = document.getElementById("ring-gate-prompt");
  var ringGateInner = document.getElementById("ring-gate-inner");
  var ringGateFly = document.getElementById("ring-gate-fly");
  var openSfx = new Audio("assets/open.mp3");
  var whooshSfx = new Audio("assets/whoosh.mp3");

  var prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  /** Ring nhẫn mở đầu */
  var RING_GATE_KEY = "ringGateSeen";

  function initRingGate() {
    if (!ringGate || !ringGateTrigger) return;

    var alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(RING_GATE_KEY) === "1";
    } catch (err) {
      alreadySeen = false;
    }

    if (alreadySeen) return;

    if (prefersReduced && ringGatePrompt) {
      ringGatePrompt.textContent = "Vào thiệp cưới";
      ringGateTrigger.setAttribute("aria-label", "Vào thiệp cưới");
    }

    document.documentElement.classList.add("has-ring-gate");
    ringGate.setAttribute("data-step", "closed");
    ringGate.showModal();
    ringGateTrigger.focus();

    ringGateTrigger.addEventListener("click", openRingGate);
    if (ringGateSkip) ringGateSkip.addEventListener("click", skipRingGate);
    ringGate.addEventListener("cancel", function (e) {
      e.preventDefault();
      skipRingGate();
    });
  }

  function openRingGate() {
    if (ringGate.getAttribute("data-step") !== "closed") return;
    ringGate.setAttribute("data-step", "opening");
    if (ringGatePrompt)
      ringGatePrompt.textContent = "Dành tặng riêng cho bạn ✦";

    openSfx.play().catch(function () {});
    spawnRingGateSparkles();

    if (audio) {
      audio.play().then(
        function () {
          setAudioUi(true);
        },
        function () {
          setAudioUi(false);
        },
      );
    }

    var holdMs = prefersReduced ? 0 : 1700;
    setTimeout(leaveRingGate, holdMs);
  }

  function leaveRingGate() {
    whooshSfx.play().catch(function () {});
    ringGate.setAttribute("data-step", "leaving");
    if (ringGateInner) ringGateInner.classList.add("is-leaving");

    var flightMs = flyRingToHero();
    setTimeout(closeRingGate, flightMs > 0 ? flightMs + 80 : 750);
  }

  /** Nhẫn tách khỏi hộp và bay xuống đúng vị trí nhẫn giữa 2 tên ở Hero,
   *  đồng bộ với lúc dialog đóng — cùng pattern easing/arc với setupRingFlyScroll().
   *  Trả về thời lượng animation (ms), hoặc 0 nếu bỏ qua (rút gọn chuyển động / thiếu phần tử). */
  function flyRingToHero() {
    var duration = 950;
    if (prefersReduced || !ringGateFly) return 0;

    var ringLift = document.querySelector(".ring-gate__ring-lift");
    var ringImg = ringLift && ringLift.querySelector(".ring-gate__ring");
    var heroRing = document.querySelector(".hero__ring");
    if (!ringLift || !ringImg || !heroRing) return 0;

    var startRect = ringImg.getBoundingClientRect();
    var endRect = heroRing.getBoundingClientRect();
    if (!startRect.width || !endRect.width) return 0;

    ringLift.classList.add("is-hidden");

    var startX = startRect.left + startRect.width / 2;
    var startY = startRect.top + startRect.height / 2;
    var endX = endRect.left + endRect.width / 2;
    var endY = endRect.top + endRect.height / 2;
    var startW = startRect.width;
    var endW = endRect.width;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    ringGateFly.style.opacity = "1";
    var t0 = null;

    function frame(ts) {
      if (t0 === null) t0 = ts;
      var raw = Math.min(1, (ts - t0) / duration);
      var t = easeInOutCubic(raw);

      var envelope = Math.sin(raw * Math.PI); // 0 ở 2 đầu, đỉnh giữa hành trình
      var arc = envelope * -46;
      var sway = Math.sin(raw * Math.PI * 1.6) * 14 * envelope;
      var wobble = Math.sin(raw * Math.PI * 2.2) * 10 * envelope;

      var x = startX + (endX - startX) * t + sway;
      var y = startY + (endY - startY) * t + arc;
      var w = startW + (endW - startW) * t;
      var fade = raw > 0.76 ? Math.max(0, 1 - (raw - 0.76) / 0.24) : 1;

      ringGateFly.style.width = w.toFixed(1) + "px";
      ringGateFly.style.transform =
        "translate3d(" +
        x.toFixed(1) +
        "px," +
        y.toFixed(1) +
        "px,0) translate(-50%,-50%) rotate(" +
        wobble.toFixed(1) +
        "deg)";
      ringGateFly.style.opacity = fade.toFixed(3);

      if (raw < 1) {
        window.requestAnimationFrame(frame);
      } else {
        ringGateFly.style.opacity = "0";
      }
    }
    window.requestAnimationFrame(frame);

    return duration;
  }

  function skipRingGate() {
    closeRingGate();
  }

  function closeRingGate() {
    document.documentElement.classList.remove("has-ring-gate");
    try {
      sessionStorage.setItem(RING_GATE_KEY, "1");
    } catch (err) {
      /* bỏ qua */
    }
    if (ringGate.open) ringGate.close();
  }

  /** Sparkle burst khi mở hộp — cùng pattern với initPetals() */
  function spawnRingGateSparkles() {
    if (prefersReduced || !ringGateSparkles) return;
    var count = 16;
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var dist = 40 + Math.random() * 60;
      var s = document.createElement("span");
      s.className = "ring-gate__sparkle";
      s.style.setProperty(
        "--sparkle-size",
        (3 + Math.random() * 4).toFixed(1) + "px",
      );
      s.style.setProperty("--sx", (Math.cos(angle) * dist).toFixed(1) + "px");
      s.style.setProperty("--sy", (Math.sin(angle) * dist).toFixed(1) + "px");
      s.style.animationDelay = Math.random() * 0.25 + "s";
      ringGateSparkles.appendChild(s);
    }
  }

  initRingGate();

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
    if (cdDays) cdDays.textContent = pad(Math.floor(s / 86400));
    if (cdHours) cdHours.textContent = pad(Math.floor((s % 86400) / 3600));
    if (cdMins) cdMins.textContent = pad(Math.floor((s % 3600) / 60));
    if (cdSecs) cdSecs.textContent = pad(s % 60);
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
      { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
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
      p.style.left = Math.random() * 100 + "vw";
      p.style.animationDuration = 7 + Math.random() * 9 + "s";
      p.style.animationDelay = -Math.random() * 18 + "s";
      p.style.opacity = (0.45 + Math.random() * 0.55).toFixed(2);
      p.style.setProperty("--petal-size", size + "px");
      container.appendChild(p);
    }
  }
  initPetals();

  /** Tắt cánh hoa khi đang ở section thiệp — nền giấy kem sáng khiến cánh hoa
   *  trông như vết bẩn chứ không còn là hiệu ứng lãng mạn như trên nền tối. */
  function setupPetalPause() {
    var invite = document.getElementById("invite");
    if (!invite || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          document.documentElement.classList.toggle(
            "is-petal-paused",
            entry.isIntersecting,
          );
        });
      },
      { threshold: 0 },
    ).observe(invite);
  }
  setupPetalPause();

  /** Gallery parallax + caption */
  function setupGalleryStoryEffects() {
    var panels = document.querySelectorAll(".gallery__panel");
    if (!panels.length || prefersReduced) return;

    if ("IntersectionObserver" in window) {
      var panelObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            panels.forEach(function (p) {
              p.classList.remove("is-active");
            });
            entry.target.classList.add("is-active");
          });
        },
        { root: null, threshold: 0.45, rootMargin: "-8% 0px -8% 0px" },
      );
      panels.forEach(function (p) {
        panelObserver.observe(p);
      });
    }

    var ticking = false;
    function updateParallax() {
      var vc = window.innerHeight / 2;
      panels.forEach(function (panel) {
        var rect = panel.getBoundingClientRect();
        var delta = (rect.top + rect.height / 2 - vc) * -0.08;
        var capped = Math.max(-42, Math.min(42, delta));
        var img = panel.querySelector("img");
        if (img)
          img.style.setProperty("--img-parallax", capped.toFixed(2) + "px");
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

  /** Nhẫn bay theo scroll — từ nhẫn ở Hero tới vị trí nhẫn thật trong ảnh Story.
   *  Dùng easing + lerp/damping mỗi khung hình (thay vì gán thẳng theo scroll) để
   *  chuyển động mềm mại, có độ trễ tự nhiên như đang "đuổi theo" thay vì dính cứng
   *  vào vị trí cuộn. Nhẫn tĩnh ở Hero cũng mờ dần đi trong lúc nhẫn bay xuất hiện. */
  function setupRingFlyScroll() {
    var startEl = document.querySelector(".hero__ring");
    var endEl = document.getElementById("story-ring-target");
    var flyer = document.getElementById("ring-fly-scroll");
    var storySection = document.getElementById("story");
    if (!startEl || !endEl || !flyer || !storySection || prefersReduced) return;

    var cur = { x: 0, y: 0, w: 0, rot: 0, opacity: 0 };
    var inited = false;
    var running = false;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function frame() {
      var startRect = startEl.getBoundingClientRect();
      var endRect = endEl.getBoundingClientRect();
      var secRect = storySection.getBoundingClientRect();
      var vh = window.innerHeight;

      // Dùng CHUNG đồng hồ với setupStoryArmReveal (tâm section Story đi từ
      // 1.05vh lên 0.55vh) để nhẫn đáp xuống đúng lúc cánh tay đã vươn ra hẳn.
      // Trước đây mỗi hiệu ứng đo theo một mốc riêng nên nhẫn hạ cánh khi cánh
      // tay còn vô hình. Vị trí đáp vẫn bám endRect nên luôn trúng nhẫn trên ảnh.
      var anchorY = secRect.top + secRect.height / 2;
      var enterStart = vh * 1.05;
      var enterEnd = vh * 0.55;
      var rawT = Math.max(
        0,
        Math.min(1, (enterStart - anchorY) / (enterStart - enterEnd)),
      );
      var t = easeInOutCubic(rawT);

      // Giữ nhẫn hiện gần trọn hành trình, chỉ tan đi ngay khoảnh khắc chạm đích.
      var fade;
      if (rawT <= 0) fade = 0;
      else if (rawT < 0.12) fade = rawT / 0.12;
      else if (rawT > 0.93) fade = Math.max(0, (1 - rawT) / 0.07);
      else fade = 1;

      var startX = startRect.left + startRect.width / 2;
      // Khi nhẫn Hero đã cuộn khuất phía trên, lấy mốc xuất phát ngay trên mép
      // màn hình để nhẫn "bay vào" từ trên xuống thay vì từ ngoài xa tít.
      var startY = Math.max(
        startRect.top + startRect.height / 2,
        -window.innerHeight * 0.12,
      );
      var endX = endRect.left + endRect.width / 2;
      var endY = endRect.top + endRect.height / 2;

      var envelope = Math.sin(rawT * Math.PI); // 0 ở 2 đầu, đỉnh giữa hành trình
      var arc = envelope * -34;
      var sway = Math.sin(rawT * Math.PI * 2.4) * 10 * envelope;
      var wobble = Math.sin(rawT * Math.PI * 2.4) * 8 * envelope;

      var targetX = startX + (endX - startX) * t + sway;
      var targetY = startY + (endY - startY) * t + arc;
      var targetW =
        startRect.width + (endRect.width * 2.2 - startRect.width) * t;

      if (!inited) {
        cur.x = targetX;
        cur.y = targetY;
        cur.w = targetW;
        cur.rot = wobble;
        cur.opacity = fade;
        inited = true;
      } else {
        cur.x += (targetX - cur.x) * 0.14;
        cur.y += (targetY - cur.y) * 0.14;
        cur.w += (targetW - cur.w) * 0.14;
        cur.rot += (wobble - cur.rot) * 0.14;
        cur.opacity += (fade - cur.opacity) * 0.18;
      }

      var shownOpacity = cur.opacity < 0.004 ? 0 : cur.opacity;
      flyer.style.width = cur.w.toFixed(1) + "px";
      flyer.style.transform =
        "translate3d(" +
        cur.x.toFixed(1) +
        "px," +
        cur.y.toFixed(1) +
        "px,0) translate(-50%,-50%) rotate(" +
        cur.rot.toFixed(1) +
        "deg)";
      flyer.style.opacity = shownOpacity.toFixed(3);

      // Ẩn dần nhẫn tĩnh ở Hero đúng lúc nhẫn bay xuất hiện, tránh thấy 2 nhẫn cùng lúc
      startEl.style.opacity = (1 - fade * 0.95).toFixed(3);

      // Quầng sáng trên ảnh mạnh dần theo hành trình và sáng nhất lúc nhẫn đáp,
      // để chỗ nhẫn vừa tan đi vẫn còn dấu vết thay vì tắt phụt cùng lúc.
      endEl.style.setProperty("--ring-arrival", rawT.toFixed(3));

      var settled = rawT <= 0.001 || rawT >= 0.999;
      var atRest = shownOpacity === 0 && Math.abs(fade - cur.opacity) < 0.004;

      if (settled && atRest) {
        running = false;
        return;
      }
      window.requestAnimationFrame(frame);
    }

    function ensureRunning() {
      if (running) return;
      running = true;
      window.requestAnimationFrame(frame);
    }

    window.addEventListener("scroll", ensureRunning, { passive: true });
    window.addEventListener("resize", ensureRunning);
    ensureRunning();
  }
  setupRingFlyScroll();

  /** Ảnh cánh tay ở Story "nhô ra" đón nhẫn rồi thu lại theo scroll — nhô ra
   *  mượt mà đúng lúc nhẫn bay tới (đồng bộ mốc thời gian với setupRingFlyScroll:
   *  cùng lấy mốc ~50% chiều cao viewport làm điểm "nhẫn đã tới"), giữ nguyên
   *  trong lúc đọc nội dung, rồi thu lại khi cuộn tiếp sang section Nhẫn cưới.
   *  Đo theo vị trí tâm ảnh (anchorY) so với viewport thay vì mép section, và
   *  co hẹp mốc thu lại về vùng còn nằm trong khung hình (anchorY > 0) — tránh
   *  bị "lẹm mất góc" do ảnh đã cuộn khuất phía trên viewport trước khi hiệu
   *  ứng thu tay kịp chạy xong. Vào và ra dùng 2 đường xoay/di chuyển khác
   *  nhau để tạo cảm giác "vươn tay ra đón" rồi "vươn tay ra khỏi màn hình"
   *  chứ không phải tua ngược cùng một chuyển động.
   *  Đo theo vị trí section (không phải chính phần tử bị transform) nên không
   *  bị vòng lặp phản hồi như đã gặp ở setupRingsMergeScroll. */
  function setupStoryArmReveal() {
    var section = document.getElementById("story");
    var photoWrap = document.querySelector(".story__photo-wrap");
    if (!section || !photoWrap || prefersReduced) return;

    var ticking = false;

    function clamp01(n) {
      return Math.max(0, Math.min(1, n));
    }
    function smoothstep(t) {
      return t * t * (3 - 2 * t);
    }

    // Vào: tay xoay nghiêng, hơi lùi xa + nhỏ, "vươn ra" và xoay thẳng dần
    // về vị trí nghỉ khi t: 0 (chưa thấy) → 1 (đã yên vị đón nhẫn).
    function enterPose(t) {
      return {
        rot: -15 + 11 * t,
        tx: 18 * (1 - t),
        ty: 7 * (1 - t),
        scale: 0.78 + 0.22 * t,
      };
    }
    // Ra: từ vị trí nghỉ xoay ngược hướng và trượt lên trên như đang rụt tay
    // ra khỏi khung hình, t: 1 (đang nghỉ) → 0 (đã rút hẳn).
    function exitPose(t) {
      return {
        rot: -4 + 13 * (1 - t),
        tx: -11 * (1 - t),
        ty: -13 * (1 - t),
        scale: 1 - 0.24 * (1 - t),
      };
    }

    function update() {
      var rect = section.getBoundingClientRect();
      var vh = window.innerHeight;
      var anchorY = rect.top + rect.height / 2;

      // Nhô ra: từ lúc tâm ảnh còn ở đáy màn hình tới lúc gần giữa màn hình —
      // cùng vùng thời điểm nhẫn bay tới trong setupRingFlyScroll.
      var enterStart = vh * 1.05;
      var enterEnd = vh * 0.55;
      var enterT = clamp01((enterStart - anchorY) / (enterStart - enterEnd));

      // Thu lại: giữ nguyên một đoạn (đang ở vùng giữa-dưới màn hình), rồi
      // thu lại xong TRƯỚC KHI tâm ảnh cuộn khuất khỏi mép trên viewport
      // (exitEnd > 0) để luôn thấy trọn hiệu ứng, không bị cắt cụt.
      var exitStart = vh * 0.36;
      var exitEnd = vh * 0.06;
      var exitT = clamp01((anchorY - exitEnd) / (exitStart - exitEnd));

      var opacity = smoothstep(Math.min(enterT, exitT));
      var pose =
        enterT < 1
          ? enterPose(smoothstep(enterT))
          : exitPose(smoothstep(exitT));

      photoWrap.style.opacity = opacity.toFixed(3);
      photoWrap.style.transform =
        "translateY(-50%) translate(" +
        pose.tx.toFixed(1) +
        "%," +
        pose.ty.toFixed(1) +
        "%) rotate(" +
        pose.rot.toFixed(1) +
        "deg) scale(" +
        pose.scale.toFixed(3) +
        ")";

      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      window.requestAnimationFrame(update);
      ticking = true;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }
  setupStoryArmReveal();

  /** Nhẫn cưới "gắn kết" theo scroll — khi cuộn qua khỏi section Nhẫn cưới,
   *  2 chiếc nhẫn trôi dần về phía nhau, lệch xuống dưới và đè so le lên
   *  nhau (như 2 chiếc nhẫn lồng vào nhau). Ánh xạ trực tiếp theo vị trí
   *  cuộn (không lerp) — cùng pattern với updateParallax() ở gallery. */
  function setupRingsMergeScroll() {
    var grid = document.querySelector(".rings__grid");
    var photos = grid && grid.querySelectorAll(".rings__item");
    if (!grid || !photos || photos.length !== 2 || prefersReduced) return;

    var left = photos[0];
    var right = photos[1];
    var leftPhoto = left.querySelector(".rings__photo-wrap") || left;
    var rightPhoto = right.querySelector(".rings__photo-wrap") || right;
    var ticking = false;
    var dxMax = 0;
    var dyMax = 0;

    // Đo khoảng cách gốc (chưa transform) 1 lần — nếu đo lại mỗi frame từ
    // getBoundingClientRect() thì sẽ dính transform của chính frame trước,
    // gây phản hồi dồn (feedback loop) khiến nhẫn trôi lệch không kiểm soát.
    function measure() {
      left.style.transform = "none";
      right.style.transform = "none";
      var lRect = leftPhoto.getBoundingClientRect();
      var rRect = rightPhoto.getBoundingClientRect();
      var width = lRect.width || 100;
      var overlap = width * 0.3;
      var centerDx =
        rRect.left + rRect.width / 2 - (lRect.left + lRect.width / 2);
      var centerDy =
        rRect.top + rRect.height / 2 - (lRect.top + lRect.height / 2);
      dxMax = centerDx / 2 + (centerDx >= 0 ? overlap : -overlap);
      dyMax = centerDy / 2 + (centerDy >= 0 ? overlap : -overlap);
    }

    function update() {
      var rect = grid.getBoundingClientRect();
      var vh = window.innerHeight;
      var startY = vh * 0.32;
      var endY = -rect.height * 0.8;
      var raw = (startY - rect.top) / (startY - endY);
      var t = Math.max(0, Math.min(1, raw));
      var eased = t * t * (3 - 2 * t); // smoothstep
      var rot = 12 * eased;

      var dx = dxMax * eased;
      var dy = dyMax * eased;

      left.style.transform =
        "translate(" +
        dx.toFixed(1) +
        "px," +
        dy.toFixed(1) +
        "px) rotate(" +
        (-rot).toFixed(1) +
        "deg)";
      right.style.transform =
        "translate(" +
        (-dx).toFixed(1) +
        "px," +
        (-dy).toFixed(1) +
        "px) rotate(" +
        rot.toFixed(1) +
        "deg)";
      left.style.zIndex = "2";
      right.style.zIndex = "1";

      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      window.requestAnimationFrame(update);
      ticking = true;
    }

    function onResize() {
      measure();
      update();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    measure();
    update();
  }
  setupRingsMergeScroll();

  /** Lightbox với prev/next navigation */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxClose = document.getElementById("lightbox-close");
  var lightboxPrev = document.getElementById("lightbox-prev");
  var lightboxNext = document.getElementById("lightbox-next");
  var lightboxCounter = document.getElementById("lightbox-counter");

  var lightboxImages = [];
  var lightboxIndex = 0;

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
      lightboxCounter.textContent = idx + 1 + " / " + lightboxImages.length;
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
      lightboxIndex =
        (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
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
      lightboxIndex =
        (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
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
    audioBtn.setAttribute(
      "aria-label",
      playing ? "Tắt nhạc nền" : "Bật nhạc nền",
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
          },
        );
      } else {
        audio.pause();
        setAudioUi(false);
      }
    });
  }

  /** RSVP */
  var form = document.getElementById("rsvp-form");
  var formStatus = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", function (e) {
      var action = form.getAttribute("action") || "";
      if (action.indexOf("YOUR_FORM_ID") !== -1) {
        e.preventDefault();
        if (formStatus) {
          formStatus.textContent =
            "Vui lòng thay YOUR_FORM_ID bằng mã Formspree của bạn rồi thử lại.";
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
