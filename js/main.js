(function () {
  "use strict";

  /** Loại thiệp + khách mời theo link (cấu hình ở js/events.js, js/guests/*.js) */
  var ROUTE = window.WEDDING_ROUTE;
  var EVENT_ID = ROUTE.eventId;
  var EVENT = window.WEDDING_EVENTS[EVENT_ID];
  var GUEST = findGuest(ROUTE.code);
  var WEDDING_ISO = EVENT.iso;

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

  var COUPLE = { trai: "Tuấn Điệp", gai: "Thu Thảo" };
  var WEEKDAYS = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  var TBD = "Sẽ thông báo sau";

  function findGuest(code) {
    if (!code) return null;
    var lists = window.WEDDING_GUESTS || [];
    for (var i = 0; i < lists.length; i++) {
      var groups = lists[i].groups || [];
      for (var j = 0; j < groups.length; j++) {
        var guests = groups[j].guests || [];
        for (var k = 0; k < guests.length; k++) {
          if (String(guests[k].code).toLowerCase() === code) return guests[k];
        }
      }
    }
    return null;
  }

  function bindText(key, text) {
    document.querySelectorAll('[data-bind="' + key + '"]').forEach(function (el) {
      el.textContent = text;
    });
  }

  /** Gán các dòng văn bản, xuống dòng bằng <br> (không dùng innerHTML vì có tên khách). */
  function setLines(el, lines) {
    if (!el) return;
    el.textContent = "";
    lines.forEach(function (line, i) {
      if (i) el.appendChild(document.createElement("br"));
      el.appendChild(document.createTextNode(line));
    });
  }

  function show(el, visible) {
    if (el) el.hidden = !visible;
  }

  /** Ngày theo giờ Việt Nam, đọc thẳng từ chuỗi ISO để không phụ thuộc múi giờ người xem. */
  function dateParts(iso) {
    var y = Number(iso.slice(0, 4));
    var m = Number(iso.slice(5, 7));
    var d = Number(iso.slice(8, 10));
    return {
      y: y,
      m: m,
      d: d,
      weekday: WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()],
    };
  }

  function buildCalendar(tbody, p) {
    tbody.textContent = "";
    // Tuần bắt đầu từ Thứ Hai.
    var lead = (new Date(Date.UTC(p.y, p.m - 1, 1)).getUTCDay() + 6) % 7;
    var days = new Date(Date.UTC(p.y, p.m, 0)).getUTCDate();
    var row = null;
    for (var cell = 0; cell < lead + days || cell % 7; cell++) {
      if (cell % 7 === 0) row = tbody.appendChild(document.createElement("tr"));
      var td = row.appendChild(document.createElement("td"));
      var day = cell - lead + 1;
      if (day < 1 || day > days) continue;
      if (day === p.d) {
        td.className = "is-marked";
        td.appendChild(document.createElement("span")).textContent = day;
      } else {
        td.textContent = day;
      }
    }
  }

  function applyEvent() {
    document.documentElement.setAttribute("data-event", EVENT_ID);

    // Bên mời đứng trước: tên cô dâu/chú rể và khối gia đình.
    var first = EVENT.firstSide === "gai" ? "gai" : "trai";
    var second = first === "gai" ? "trai" : "gai";
    bindText("name-first", COUPLE[first]);
    bindText("name-second", COUPLE[second]);
    var heroNames = document.getElementById("hero-names");
    if (heroNames)
      heroNames.setAttribute("aria-label", COUPLE[first] + " & " + COUPLE[second]);
    var families = document.getElementById("invite-families");
    var firstFamily =
      families && families.querySelector('[data-side="' + first + '"]');
    if (firstFamily) families.insertBefore(firstFamily, families.firstChild);

    bindText("ceremony", EVENT.ceremony);
    bindText("lead", EVENT.lead);
    bindText("invite-verb", EVENT.inviteVerb);

    var p = WEDDING_ISO ? dateParts(WEDDING_ISO) : null;
    var dateShort = p ? pad(p.d) + " · " + pad(p.m) + " · " + p.y : "";

    bindText("date-long", p ? p.weekday + " · " + dateShort : "");
    bindText("date-short", p ? dateShort : TBD);
    document.querySelectorAll(".hero__date, .footer__date").forEach(function (el) {
      show(el, !!p);
    });

    // Thẻ giờ + lịch tháng
    var timeTbd = document.getElementById("time-tbd");
    show(document.getElementById("invite-time-card"), !!p);
    show(document.getElementById("invite-calendar"), !!p);
    if (p) {
      bindText("time", EVENT.time || "--:--");
      bindText("weekday", p.weekday);
      bindText("day", String(p.d));
      bindText("month", "Tháng " + p.m);
      bindText("year", String(p.y));
      bindText("calendar-title", pad(p.m) + "." + p.y);
      var lunarEl = document.querySelector('[data-bind="lunar"]');
      var lunar = window.solarToLunar ? window.solarToLunar(p.d, p.m, p.y) : null;
      if (lunarEl && lunar) {
        lunarEl.textContent =
          "Tức ngày " + pad(lunar.day) + " tháng " + pad(lunar.month) +
          (lunar.leap ? " nhuận" : "") + " năm " + lunar.yearName;
      }
      show(lunarEl, !!lunar);
      var tbody = document.getElementById("calendar-body");
      if (tbody) buildCalendar(tbody, p);
      if (timeTbd) timeTbd.textContent = "Giờ đón khách sẽ thông báo sau";
      show(timeTbd, !EVENT.time);
    } else {
      if (timeTbd) timeTbd.textContent = TBD;
      show(timeTbd, true);
    }

    // Đếm ngược
    show(document.getElementById("countdown-grid"), !!p);
    show(document.getElementById("countdown-tbd"), !p);

    // Địa điểm
    var venue = EVENT.venue;
    var venueName = document.getElementById("venue-name");
    var mapFrame = document.getElementById("venue-map-frame");
    var mapLink = document.getElementById("venue-link");
    setLines(venueName, venue ? [venue.name + ",", venue.address] : [TBD]);
    if (venue) {
      var q = encodeURIComponent(venue.mapQuery || venue.name + ", " + venue.address);
      if (mapFrame) mapFrame.src = "https://www.google.com/maps?q=" + q + "&output=embed";
      if (mapLink)
        mapLink.href = "https://www.google.com/maps/search/?api=1&query=" + q;
    }
    show(document.getElementById("venue-map"), !!venue);
    show(mapLink, !!venue);

    // RSVP chỉ mở khi đã có ngày
    var rsvpEvent = document.getElementById("rsvp-event");
    if (rsvpEvent) rsvpEvent.value = EVENT_ID;
    show(document.getElementById("rsvp-form"), !!p);
    show(document.getElementById("rsvp-tbd"), !p);

    var title = COUPLE[first] + " & " + COUPLE[second] + " · " + EVENT.ceremony;
    document.title = title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc)
      desc.setAttribute(
        "content",
        "Thiệp cưới " + title + (p ? " · " + dateShort.replace(/ · /g, ".") : ""),
      );
  }

  function applyGuest() {
    var name = GUEST ? GUEST.name : "Quý khách";
    var xung = (GUEST && GUEST.xung) || "bạn";

    bindText("guest-name", name);
    setLines(document.querySelector('[data-bind="invite-message"]'), [
      "Cảm ơn " + xung + " đã luôn đồng hành cùng chúng mình.",
      EVENT.iso && EVENT_ID !== "bao-hi"
        ? "Lâu rồi không gặp, mong được gặp " + xung + " trong ngày vui này."
        : "Lâu rồi không gặp, mong nhận được lời chúc phúc từ " + xung + ".",
    ]);
    setLines(document.querySelector('[data-bind="gift-lead"]'), [
      "Sự hiện diện của " + xung + " là món quà quý giá nhất với chúng mình.",
      "Nếu muốn gửi thêm chút tấm lòng, chúng mình trân trọng nhận.",
    ]);
    bindText("rsvp-kicker", "Hẹn gặp " + xung + " trong ngày vui");

    if (!GUEST) return;
    document.title = document.title + " · Mời " + name;
    if (ringGate)
      ringGate.setAttribute("aria-label", "Thiệp mời gửi " + name + ", mở hộp nhẫn để xem");
    var rsvpGuest = document.getElementById("rsvp-guest");
    if (rsvpGuest) rsvpGuest.value = GUEST.code;
    var rsvpName = document.getElementById("name");
    if (rsvpName && !rsvpName.value) rsvpName.value = name;
  }

  /** Bỏ dấu cho nội dung chuyển khoản (ngân hàng không nhận ký tự có dấu). */
  function toAscii(s) {
    return String(s)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^A-Za-z0-9 ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function copyText(text, btn) {
    function done() {
      var old = btn.textContent;
      btn.textContent = "Đã sao chép";
      btn.classList.add("is-done");
      setTimeout(function () {
        btn.textContent = old;
        btn.classList.remove("is-done");
      }, 1400);
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch (err) {
        /* bỏ qua: người dùng vẫn đọc được STK trên màn hình */
      }
      ta.remove();
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  /** Thẻ QR mừng cưới: bên mời đứng trước, nội dung chuyển khoản kèm tên khách. */
  function renderGift() {
    var grid = document.getElementById("gift-grid");
    if (!grid) return;
    var gift = window.WEDDING_GIFT || {};
    var note = toAscii((GUEST ? GUEST.name + " " : "") + "mung cuoi Diep Thao");

    var firstCard = grid.querySelector('[data-side="' + EVENT.firstSide + '"]');
    if (firstCard) grid.insertBefore(firstCard, grid.firstChild);

    grid.querySelectorAll(".gift__card").forEach(function (card) {
      var info = gift[card.getAttribute("data-side")];
      var qr = card.querySelector(".gift__qr");
      show(qr, !!info);
      show(card.querySelector(".gift__info"), !!info);
      show(card.querySelector(".gift__pending"), !info);
      if (!info) return;

      var url =
        "https://img.vietqr.io/image/" +
        encodeURIComponent(info.bankId) +
        "-" +
        encodeURIComponent(info.account) +
        "-compact.png?accountName=" +
        encodeURIComponent(info.holder) +
        "&addInfo=" +
        encodeURIComponent(note);
      qr.href = url;
      qr.querySelector("img").src = url;
      card.querySelector(".gift__bank-name").textContent = info.bankName;
      card.querySelector(".gift__account").textContent = info.account;
      card.querySelector(".gift__holder").textContent = info.holder;
      var btn = card.querySelector(".gift__copy");
      btn.addEventListener("click", function () {
        copyText(info.account, btn);
      });
    });
  }

  /** Khi có <base> (link dạng /nha-trai/<mã>), "#section" sẽ trỏ về trang gốc:
   *  gắn lại path hiện tại để anchor vẫn cuộn trong trang. */
  function fixHashLinksUnderBase() {
    if (!document.querySelector("base")) return;
    var here = location.pathname + location.search;
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var href = a.getAttribute("href");
      if (href.length > 1) a.setAttribute("href", here + href);
    });
  }

  fixHashLinksUnderBase();
  applyEvent();
  applyGuest();
  renderGift();

  /** Ring nhẫn mở đầu (mỗi link khách xem lại một lần trong phiên) */
  var RING_GATE_KEY =
    "ringGateSeen:" + EVENT_ID + ":" + (GUEST ? GUEST.code : "");

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
    ringGate.addEventListener("click", function () {
      // Một lần chạm ở cảnh cầu hôn được xem là người xem đã đọc xong.
      if (ringGate.getAttribute("data-step") === "proposal") leaveRingGate();
    });
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

    var holdMs = prefersReduced ? 0 : 1350;
    setTimeout(startProposalSequence, holdMs);
  }

  /** Chuỗi mở đầu: bàn tay xuất hiện, nhẫn bay vào tay, rồi hé lộ khoảnh khắc cầu hôn. */
  function startProposalSequence() {
    if (prefersReduced) {
      leaveRingGate();
      return;
    }

    ringGate.setAttribute("data-step", "hand");
    setTimeout(function () {
      whooshSfx.play().catch(function () {});
      var flightMs = flyRingToHand();
      setTimeout(showProposalMoment, flightMs + 120);
    }, 420);
  }

  function showProposalMoment() {
    ringGate.setAttribute("data-step", "proposal");
    // Đủ thời gian để xem ảnh và đọc trọn lời cầu hôn trước khi vào trang chính.
    setTimeout(leaveRingGate, 8000);
  }

  function leaveRingGate() {
    whooshSfx.play().catch(function () {});
    ringGate.setAttribute("data-step", "leaving");
    if (ringGateInner) ringGateInner.classList.add("is-leaving");

    setTimeout(closeRingGate, prefersReduced ? 0 : 850);
  }

  /** Nhẫn tách khỏi hộp và bay tới đúng vị trí nhẫn trên bàn tay.
   *  Trả về thời lượng animation (ms), hoặc 0 nếu bỏ qua (rút gọn chuyển động / thiếu phần tử). */
  function flyRingToHand() {
    var duration = 1050;
    if (prefersReduced || !ringGateFly) return 0;

    var ringLift = document.querySelector(".ring-gate__ring-lift");
    var ringImg = ringLift && ringLift.querySelector(".ring-gate__ring");
    var handTarget = document.getElementById("ring-gate-hand-target");
    if (!ringLift || !ringImg || !handTarget) return 0;

    var startRect = ringImg.getBoundingClientRect();
    var endRect = handTarget.getBoundingClientRect();
    if (!startRect.width || !endRect.width) return 0;

    ringLift.classList.add("is-hidden");

    var startX = startRect.left + startRect.width / 2;
    var startY = startRect.top + startRect.height / 2;
    var endX = endRect.left + endRect.width / 2;
    var endY = endRect.top + endRect.height / 2;
    var startW = startRect.width;
    var endW = Math.max(endRect.width * 1.25, startW * 0.46);

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
      var arc = envelope * -64;
      var sway = Math.sin(raw * Math.PI * 1.6) * 18 * envelope;
      var wobble = Math.sin(raw * Math.PI * 2.2) * 14 * envelope;

      var x = startX + (endX - startX) * t + sway;
      var y = startY + (endY - startY) * t + arc;
      var w = startW + (endW - startW) * t;
      var fade = raw > 0.82 ? Math.max(0, 1 - (raw - 0.82) / 0.18) : 1;

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

  /** Sparkle burst khi mở hộp */
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

  if (WEDDING_ISO && tickCountdown() !== false) {
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

  /** Gallery caption — ảnh xếp nối tiếp để luôn nhìn thấy ảnh kế tiếp khi cuộn. */
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
  }
  setupGalleryStoryEffects();

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

  var rsvpUrl = window.WEDDING_RSVP_URL || "";
  var rsvpXung = (GUEST && GUEST.xung) || "bạn";

  function setFormStatus(text) {
    if (!formStatus) return;
    formStatus.textContent = text;
    formStatus.classList.add("is-show");
  }

  // Gửi ngầm tới Google Apps Script (apps-script/rsvp.gs), khách ở lại trang
  if (form) {
    var submitBtn = form.querySelector('button[type="submit"]');
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!rsvpUrl) {
        setFormStatus("Chưa mở nhận xác nhận, " + rsvpXung + " vui lòng thử lại sau nhé.");
        return;
      }
      if (typeof window.fetch !== "function") {
        setFormStatus("Trình duyệt chưa hỗ trợ gửi, " + rsvpXung + " nhắn trực tiếp cho chúng mình nhé.");
        return;
      }

      var data = new FormData(form);
      var attending = data.get("attending") === "yes";
      if (submitBtn) submitBtn.disabled = true;
      setFormStatus("Đang gửi…");

      fetch(rsvpUrl, { method: "POST", body: new URLSearchParams(data) })
        .then(function (res) {
          return res.json();
        })
        .then(function (result) {
          if (!result || !result.ok) throw new Error("rsvp failed");
          setFormStatus(
            attending
              ? "Cảm ơn " + rsvpXung + "! Chúng mình đã nhận được xác nhận, hẹn gặp " + rsvpXung + " nhé."
              : "Cảm ơn " + rsvpXung + " đã báo. Chúng mình đã nhận được lời nhắn của " + rsvpXung + ".",
          );
          if (submitBtn) submitBtn.textContent = "Gửi lại";
        })
        .catch(function () {
          setFormStatus("Gửi chưa được, " + rsvpXung + " thử lại giúp chúng mình nhé.");
        })
        .then(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
})();
