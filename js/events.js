/**
 * Cấu hình 3 loại thiệp. Mỗi loại dùng chung index.html, chỉ khác dữ liệu ở đây.
 *
 * - iso: ngày giờ tiệc (GMT+7), null = chưa chốt → hiện "Sẽ thông báo sau".
 * - time: giờ hiển thị trên thẻ giờ, null = chưa chốt.
 * - venue: { name, address, mapQuery } hoặc null = chưa chốt. mapQuery là chuỗi tìm
 *   trên Google Maps hoặc toạ độ "vĩ độ,kinh độ" để ghim đúng vị trí.
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
      iso: "2026-10-11T11:00:00+07:00",
      time: "11:00",
      venue: {
        name: "Nhà hàng Đức Thắng",
        address:
          "Số 34 Phạm Ngọc Thạch, khu phố Tân Phú, phường Đồng Phú, TP. Đồng Nai",
        mapQuery: "Nhà hàng Đức Thắng, 34 Phạm Ngọc Thạch, Đồng Phú, Đồng Nai",
      },
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
        // Toạ độ chính xác của nhà (ghim tên thôn/xã trên Google Maps bị lệch)
        mapQuery: "11.713685,107.206789",
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

  /**
   * Tài khoản nhận quà mừng, QR tạo tự động qua VietQR (img.vietqr.io).
   * - bankId: mã ngân hàng theo VietQR (VCB, TCB, MB, ICB, BIDV, ACB…).
   * - null = chưa có → thẻ hiện "Sẽ cập nhật".
   */
  window.WEDDING_GIFT = {
    trai: {
      bankId: "VCB",
      bankName: "Vietcombank (VCB)",
      account: "1019652628",
      holder: "DANG TUAN DIEP",
    },
    gai: {
      bankId: "VCB",
      bankName: "Vietcombank (VCB)",
      account: "1022010541",
      holder: "NGUYEN THI THU THAO",
    },
  };

  /**
   * URL Web App của Google Apps Script nhận xác nhận tham dự (dạng .../exec).
   * Script nằm ở apps-script/rsvp.gs. Để trống = form báo "chưa mở".
   */
  window.WEDDING_RSVP_URL =
    "https://script.google.com/macros/s/AKfycbyVTXm5ID6d_2KerP3L3K-H7PC4_1cuRnhpMcv40MSXBmy667h2b5-BJHxAEzEiC-GuPw/exec";

  /** Loại thiệp khi URL không chỉ định. */
  window.WEDDING_DEFAULT_EVENT = "bao-hi";

  /** Địa chỉ chính thức của site, dùng cho link gửi khách (links.html). */
  window.WEDDING_SITE_URL = "https://tuandiepthuthao.date/";

  /**
   * Đọc loại thiệp + mã khách từ URL. Hỗ trợ các dạng:
   *   ?phu                 (link ngắn gửi khách: loại thiệp lấy theo khách)
   *   ?e=nha-trai&k=phu    (chọn loại thiệp khác mặc định của khách, link cũ)
   *   /nha-trai/phu        (host có rewrite, xem _redirects / vercel.json)
   * Link ngắn cần danh sách khách nên js/guests/*.js phải load trước file này.
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
    // Link ngắn ?<mã>: tham số đầu tiên không có giá trị
    // (Zalo/Facebook có thể nối thêm fbclid=…, zarsrc=… phía sau).
    if (!code) {
      params.forEach(function (value, key) {
        if (!code && key && value === "") code = key;
      });
    }
    code = code ? code.toLowerCase() : null;
    if (!window.WEDDING_EVENTS[eventId] && code) eventId = guestEvent(code);
    if (!window.WEDDING_EVENTS[eventId]) eventId = window.WEDDING_DEFAULT_EVENT;
    return { eventId: eventId, code: code };
  })();

  /** Loại thiệp mặc định của khách: event riêng của khách, không có thì theo danh sách. */
  function guestEvent(code) {
    var lists = window.WEDDING_GUESTS || [];
    for (var i = 0; i < lists.length; i++) {
      var groups = lists[i].groups || [];
      for (var j = 0; j < groups.length; j++) {
        var guests = groups[j].guests || [];
        for (var k = 0; k < guests.length; k++) {
          if (String(guests[k].code).toLowerCase() === code)
            return guests[k].event || lists[i].defaultEvent;
        }
      }
    }
    return null;
  }
})();
