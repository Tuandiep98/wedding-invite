/**
 * Khách bên nhà trai (bạn chú rể).
 *
 * - code: mã trong link, duy nhất trên CẢ 2 file khách (links.html cảnh báo nếu trùng).
 * - name: tên hiển thị trên thiệp.
 * - xung: cách xưng hô trong câu mời, mặc định "bạn".
 * - alias: biệt danh/ghi chú chỉ dùng để tìm link trong links.html, không hiện trên thiệp.
 * - event: (tuỳ chọn) ghi đè defaultEvent cho riêng người này, vd "bao-hi".
 */
(function () {
  "use strict";

  window.WEDDING_GUESTS = window.WEDDING_GUESTS || [];
  window.WEDDING_GUESTS.push({
    side: "trai",
    label: "Nhà trai",
    defaultEvent: "nha-trai",
    groups: [
      {
        id: "cong-ty",
        label: "Công ty",
        guests: [
          { code: "phu", name: "Anh Phú", xung: "anh", alias: [] },
          { code: "chi", name: "Chị Chi", xung: "chị", alias: [] },
          { code: "thao", name: "Thảo", alias: [] },
          { code: "cuong-linh", name: "Cường & Linh", xung: "hai bạn", alias: [] },
          { code: "ha", name: "Hà", alias: [] },
          { code: "khang", name: "Khang", alias: [] },
          { code: "thang", name: "Thắng", alias: [] },
          { code: "my", name: "My", alias: [] },
          { code: "tu-cty", name: "Tú", alias: [] },
          { code: "khai", name: "Khải", alias: [] },
          { code: "bao", name: "Bảo & người thương", xung: "hai bạn", alias: ["ny"] },
          { code: "linh-pham", name: "Linh Phạm", alias: ["ny hà"] },
          { code: "linh", name: "Linh", alias: [] },
          { code: "duong", name: "Anh Dương", xung: "anh", alias: [] },
          { code: "hau-cty", name: "Hậu", alias: [] },
          { code: "tuan", name: "Tuấn", alias: [] },
          { code: "trang", name: "Trang", alias: [] },
          { code: "binh", name: "Anh Bình", xung: "anh", alias: [] },
        ],
      },
      {
        id: "janeto-cu",
        label: "Janeto cũ",
        guests: [
          { code: "vu-jame", name: "Chị Vũ & anh Jame", xung: "anh chị", alias: [] },
          { code: "hanh", name: "Anh Hạnh", xung: "anh", alias: [] },
          { code: "thien", name: "Anh Thiên", xung: "anh", alias: [] },
          { code: "huy", name: "Huy", alias: [] },
        ],
      },
      {
        id: "dai-hoc",
        label: "Bạn đại học",
        guests: [
          { code: "hoa-dh", name: "Hoà", alias: [] },
          { code: "quoc-huy", name: "Quốc Huy", alias: [] },
          { code: "nhat-truong", name: "Nhật Trường", alias: [] },
          { code: "van-truong", name: "Văn Trường", alias: [] },
          { code: "tin", name: "Tín", alias: [] },
          { code: "kim", name: "Kim", alias: [] },
          { code: "thien-dh", name: "Thiện", alias: [] },
          { code: "anh-huy", name: "Anh Huy", alias: [] },
          { code: "nam", name: "Nam", alias: [] },
          { code: "tu-dh", name: "Tú", alias: [] },
          { code: "hieu", name: "Hiếu", alias: ["hà nội"] },
        ],
      },
      {
        id: "cap-3",
        label: "Bạn cấp 3, ở quê",
        guests: [
          { code: "hoa-c3", name: "Hoà", alias: [] },
          { code: "duc", name: "Đức", alias: [] },
          { code: "ngoc", name: "Ngọc", alias: [] },
          { code: "van", name: "Vân", alias: [] },
          { code: "duy", name: "Duy", alias: [] },
          { code: "ly", name: "Lý", alias: [] },
          { code: "cuong", name: "Cường", alias: [] },
          { code: "vuong", name: "Vương", alias: [] },
          { code: "lan-huong", name: "Lan Hương", alias: [] },
          { code: "tai", name: "Tài", alias: [] },
          { code: "nga", name: "Nga", alias: [] },
          { code: "ninh", name: "Ninh", alias: [] },
          { code: "thinh", name: "Thịnh", alias: [] },
          { code: "hau-c3", name: "Hậu", alias: [] },
        ],
      },
    ],
  });
})();
