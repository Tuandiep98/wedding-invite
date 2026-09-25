/** Trang nội bộ links.html: tìm khách, copy link thiệp, đánh dấu đã gửi. */
(function () {
  "use strict";

  var EVENTS = window.WEDDING_EVENTS || {};
  var LISTS = window.WEDDING_GUESTS || [];

  var SITE_URL = window.WEDDING_SITE_URL;
  var searchInput = document.getElementById("search");
  var statsEl = document.getElementById("stats");
  var warningsEl = document.getElementById("warnings");
  var resultsEl = document.getElementById("results");

  function load(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (err) {
      return fallback;
    }
  }
  function save(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (err) {
      /* bỏ qua: trình duyệt chặn storage */
    }
  }

  /** Bỏ dấu tiếng Việt + lowercase để gõ "ha noi" vẫn ra "Hà Nội". */
  function norm(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .toLowerCase()
      .trim();
  }

  /** Gom toàn bộ khách thành danh sách phẳng. */
  var guests = [];
  LISTS.forEach(function (list) {
    (list.groups || []).forEach(function (group) {
      (group.guests || []).forEach(function (g) {
        guests.push({
          data: g,
          side: list.side,
          sideLabel: list.label,
          group: group,
          defaultEvent: g.event || list.defaultEvent,
          haystack: norm(
            [g.name, g.code, (g.alias || []).join(" "), group.label].join(" "),
          ),
        });
      });
    });
  });

  function checkData() {
    var seen = {};
    var problems = [];
    guests.forEach(function (g) {
      var code = String(g.data.code || "").toLowerCase();
      if (!code) problems.push("Thiếu mã: " + (g.data.name || "(không tên)"));
      else if (seen[code])
        problems.push(
          'Trùng mã "' + code + '": ' + seen[code] + " và " + g.data.name + " (" + g.group.label + ")",
        );
      else seen[code] = g.data.name + " (" + g.group.label + ")";
      if (!g.data.name) problems.push('Thiếu tên cho mã "' + code + '"');
      if (!EVENTS[g.defaultEvent])
        problems.push('Loại thiệp không tồn tại "' + g.defaultEvent + '" cho ' + g.data.name);
    });
    warningsEl.textContent = problems.length ? "⚠ " + problems.join(" · ") : "";
  }

  /** Link gửi khách: ?<mã> khi dùng loại thiệp mặc định của khách, chọn loại khác thì ?e=…&k=…. */
  function linkFor(g, eventId) {
    var code = encodeURIComponent(g.data.code);
    if (eventId === g.defaultEvent) return SITE_URL + "?" + code;
    return SITE_URL + "?e=" + eventId + "&k=" + code;
  }

  function sentKey(g) {
    return "sent:" + g.side + ":" + g.data.code;
  }

  function copy(text, btn) {
    function done() {
      var old = btn.textContent;
      btn.textContent = "Đã copy";
      btn.classList.add("done");
      setTimeout(function () {
        btn.textContent = old;
        btn.classList.remove("done");
      }, 1400);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch (err) {
        window.prompt("Copy link:", text);
      }
      ta.remove();
    }
  }

  function renderRow(g) {
    var li = document.createElement("li");
    var eventId = g.defaultEvent;

    var sent = document.createElement("input");
    sent.type = "checkbox";
    sent.className = "sent";
    sent.title = "Đã gửi thiệp";
    sent.setAttribute("aria-label", "Đã gửi thiệp cho " + g.data.name);
    sent.checked = load(sentKey(g), "") === "1";
    li.classList.toggle("is-sent", sent.checked);
    sent.addEventListener("change", function () {
      save(sentKey(g), sent.checked ? "1" : null);
      li.classList.toggle("is-sent", sent.checked);
      renderStats();
    });

    var who = document.createElement("div");
    who.className = "who";
    var name = who.appendChild(document.createElement("div"));
    name.className = "name";
    name.textContent = g.data.name;
    var meta = who.appendChild(document.createElement("div"));
    meta.className = "meta";
    meta.textContent =
      g.group.label +
      " · xưng " +
      (g.data.xung || "bạn") +
      " · mã " +
      g.data.code +
      ((g.data.alias || []).length ? " · " + g.data.alias.join(", ") : "");

    var actions = document.createElement("div");
    actions.className = "actions";
    var select = actions.appendChild(document.createElement("select"));
    select.setAttribute("aria-label", "Loại thiệp");
    Object.keys(EVENTS).forEach(function (id) {
      var opt = select.appendChild(document.createElement("option"));
      opt.value = id;
      opt.textContent = EVENTS[id].label;
      opt.selected = id === eventId;
    });
    var link = actions.appendChild(document.createElement("a"));
    link.className = "link";
    link.target = "_blank";
    link.rel = "noopener";
    var btn = actions.appendChild(document.createElement("button"));
    btn.type = "button";
    btn.textContent = "Copy link";

    function refreshLink() {
      var url = linkFor(g, select.value);
      link.href = url;
      link.textContent = url;
    }
    select.addEventListener("change", refreshLink);
    btn.addEventListener("click", function () {
      copy(link.href, btn);
    });
    refreshLink();

    li.appendChild(sent);
    li.appendChild(who);
    li.appendChild(actions);
    return li;
  }

  function renderStats() {
    var total = guests.length;
    var sent = guests.filter(function (g) {
      return load(sentKey(g), "") === "1";
    }).length;
    statsEl.textContent = "";
    [
      ["Tổng", total],
      ["Đã gửi", sent],
      ["Chưa gửi", total - sent],
    ].forEach(function (pair) {
      var span = statsEl.appendChild(document.createElement("span"));
      span.appendChild(document.createTextNode(pair[0] + ": "));
      span.appendChild(document.createElement("b")).textContent = pair[1];
    });
  }

  function render() {
    var tokens = norm(searchInput.value).split(/\s+/).filter(Boolean);
    var matches = guests.filter(function (g) {
      return tokens.every(function (t) {
        return g.haystack.indexOf(t) !== -1;
      });
    });

    resultsEl.textContent = "";
    if (!matches.length) {
      var empty = resultsEl.appendChild(document.createElement("p"));
      empty.className = "empty";
      empty.textContent = "Không tìm thấy khách nào.";
      return;
    }

    var currentKey = null;
    var ul = null;
    matches.forEach(function (g) {
      var key = g.side + "/" + g.group.id;
      if (key !== currentKey) {
        currentKey = key;
        var h = resultsEl.appendChild(document.createElement("h2"));
        h.appendChild(document.createTextNode(g.sideLabel + " · " + g.group.label + " "));
        var count = matches.filter(function (m) {
          return m.side === g.side && m.group === g.group;
        }).length;
        h.appendChild(document.createElement("small")).textContent = "(" + count + ")";
        ul = resultsEl.appendChild(document.createElement("ul"));
      }
      ul.appendChild(renderRow(g));
    });
  }

  /**
   * Dấu "Đã gửi" nằm trong localStorage, tách riêng theo từng địa chỉ trang. Trang github.io cũ
   * có nút mở trang mới kèm #sent=<bên>:<mã>,…; trang mới nhận rồi xoá hash khỏi URL.
   */
  function setupMigrate() {
    var box = document.getElementById("migrate");
    var text = document.getElementById("migrate-text");
    var btn = document.getElementById("migrate-btn");
    var m = location.hash.match(/^#sent=(.*)$/);
    if (m) {
      var n = 0;
      decodeURIComponent(m[1])
        .split(",")
        .forEach(function (item) {
          if (/^(trai|gai):[a-z0-9-]+$/.test(item)) {
            save("sent:" + item, "1");
            n++;
          }
        });
      history.replaceState(null, "", location.pathname + location.search);
      text.textContent = "Đã nhận " + n + " dấu Đã gửi từ trang cũ.";
      box.hidden = false;
      return;
    }
    if (!/\.github\.io$/i.test(location.hostname)) return;
    var sent = guests
      .filter(function (g) {
        return load(sentKey(g), "") === "1";
      })
      .map(function (g) {
        return g.side + ":" + g.data.code;
      });
    if (!sent.length) return;
    // Gắn tên miền xong thì trang github.io tự chuyển sang tên miền mới, không mở lại được:
    // sao chép link trước, mở link đó sau khi tên miền đã chạy.
    text.textContent =
      "Trang sắp chuyển sang " +
      SITE_URL.replace(/^https:\/\/|\/$/g, "") +
      ". Trước khi gắn tên miền, sao chép link dưới đây và lưu lại (" +
      sent.length +
      " dấu Đã gửi); mở link đó khi tên miền đã chạy để giữ các dấu này.";
    btn.hidden = false;
    btn.addEventListener("click", function () {
      copy(SITE_URL + "links.html#sent=" + encodeURIComponent(sent.join(",")), btn);
    });
    box.hidden = false;
  }

  searchInput.addEventListener("input", render);

  setupMigrate();
  checkData();
  renderStats();
  render();
})();
