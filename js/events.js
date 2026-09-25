/**
 * Cấu hình 3 loại thiệp. Mỗi loại dùng chung index.html, chỉ khác dữ liệu ở đây.
 *
 * - iso: ngày giờ tiệc (GMT+7), null = chưa chốt → hiện "Sẽ thông báo sau".
 * - time: giờ hiển thị trên thẻ giờ, null = chưa chốt.
 * - venue: { name, address, mapQuery } hoặc null = chưa chốt.
 * - heroImage: ảnh đầu tiên của trang. heroPoster = true khi ảnh đã in sẵn tên + ngày
 *   (ẩn phần chữ Hero để không bị lặp). heroPosition: object-position để giữ phần chữ
 *   trên poster khi ảnh bị cắt. heroFallback dùng khi file ảnh chưa có.
 * - firstSide: bên nào đứng trước (tên cô dâu/chú rể và khối gia đình).
 */
(function () {
  "use strict";

  window.WEDDING_EVENTS = {
    "nha-gai": {
      label: "Nhà gái",
      ceremony: "Lễ Vu Quy",
      inviteVerb: "Trân trọng kính mời",
      lead: "Tới dự bữa tiệc chung vui cùng gia đình",
      iso: "2026-10-11T10:30:00+07:00",
      time: "10:30",
      venue: null, // TODO: { name: "…", address: "…", mapQuery: "…" }
      heroImage: "assets/save-the-date-poster.jpg",
      heroPoster: true,
      // Chữ in trên poster nằm lệch phải (~68–93% ngang): neo 85% để màn dọc không cắt mất chữ.
      heroPosition: "85% top",
      firstSide: "gai",
    },
    "nha-trai": {
      label: "Nhà trai",
      ceremony: "Lễ Tân Hôn",
      inviteVerb: "Trân trọng kính mời",
      lead: "Tới dự bữa tiệc chung vui cùng gia đình",
      iso: "2026-10-13T10:30:00+07:00",
      time: "10:30",
      venue: {
        name: "Tư gia nhà trai",
        address: "Số nhà 05, thôn Phước Lộc, xã Phước Sơn, TP. Đồng Nai",
        mapQuery: "Thôn Phước Lộc, xã Phước Sơn, Đồng Nai",
      },
      heroImage: "assets/save-the-date-1310.jpg",
      heroPoster: true,
      // Chữ nằm giữa ảnh (~40–50% dọc): neo 30% để màn ngang vẫn giữ trọn dòng chữ.
      heroPosition: "center 30%",
      heroFallback: "assets/gallery-5.jpg",
      firstSide: "trai",
    },
    "bao-hi": {
      label: "Báo hỉ",
      ceremony: "Lễ Thành Hôn",
      inviteVerb: "Trân trọng báo tin vui đến",
      lead: "Chung vui cùng hai gia đình",
      iso: null, // TODO: ngày báo hỉ
      time: null,
      venue: null,
      heroImage: "assets/gallery-5.jpg",
      heroPoster: false,
      firstSide: "trai",
    },
  };

  /** Loại thiệp khi URL không chỉ định. */
  window.WEDDING_DEFAULT_EVENT = "bao-hi";

  /**
   * Đọc loại thiệp + mã khách từ URL. Hỗ trợ cả 2 dạng:
   *   /nha-trai/phu        (host có rewrite, xem _redirects / vercel.json)
   *   ?e=nha-trai&k=phu    (GitHub Pages qua 404.html, mở file:// khi dev)
   */
  window.WEDDING_ROUTE = (function () {
    var eventId = null;
    var code = null;
    var m = location.pathname.match(
      /\/(nha-trai|nha-gai|bao-hi)(?:\/([^/?#]+))?\/?$/,
    );
    if (m) {
      eventId = m[1];
      if (m[2]) {
        try {
          code = decodeURIComponent(m[2]);
        } catch (err) {
          code = m[2];
        }
      }
    }
    var params = new URLSearchParams(location.search);
    if (!eventId) eventId = params.get("e");
    if (!code) code = params.get("k");
    if (!window.WEDDING_EVENTS[eventId]) eventId = window.WEDDING_DEFAULT_EVENT;
    return { eventId: eventId, code: code ? code.toLowerCase() : null };
  })();
})();
