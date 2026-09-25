/**
 * Khách bên nhà gái (bạn cô dâu). Cùng cấu trúc với nha-trai.js.
 * Mã (code) không được trùng với mã bên nhà trai.
 */
(function () {
  "use strict";

  window.WEDDING_GUESTS = window.WEDDING_GUESTS || [];
  window.WEDDING_GUESTS.push({
    side: "gai",
    label: "Nhà gái",
    defaultEvent: "nha-gai",
    groups: [
      {
        id: "ban-be",
        label: "Bạn bè",
        guests: [
          // { code: "g-lan", name: "Chị Lan", xung: "chị", alias: ["lan cty"] },
        ],
      },
      {
        id: "que",
        label: "Bạn ở quê",
        guests: [
          { code: "tien", name: "Tiến", alias: ["tiến mập"] },
          {
            code: "toan",
            name: "Anh Hai Toàn",
            xung: "anh",
            alias: ["anh 2 toàn"],
          },
          { code: "nam-pham", name: "Nam Phạm", alias: [] },
          { code: "tuan-anh", name: "Tuấn Anh", alias: [] },
          { code: "hung", name: "Hùng", alias: [] },
          { code: "phat", name: "Phát", alias: [] },
          { code: "phuc", name: "Phúc", alias: [] },
          { code: "kim-anh", name: "Kim Anh", alias: [] },
          { code: "truc", name: "Trúc", alias: [] },
          { code: "thuong", name: "Thương", alias: [] },
          { code: "phuong-thao", name: "Phương Thảo", alias: [] },
          { code: "oanh", name: "Oanh", alias: [] },
          { code: "pho", name: "Phố", alias: [] },
          { code: "thang-que", name: "Thắng", alias: [] },
          { code: "minh-luong", name: "Minh Lượng", alias: [] },
          { code: "minh", name: "Minh", alias: [] },
          { code: "thuy-lam", name: "Thuý & Lâm", xung: "hai bạn", alias: [] },
          { code: "duc-que", name: "Đức", alias: [] },
          { code: "thanh", name: "Thành", alias: [] },
          { code: "luan", name: "Luân", alias: [] },
          { code: "ho-viet-lam", name: "Hồ Viết Lâm", alias: [] },
          { code: "binh-que", name: "Bình", alias: [] },
          { code: "nhan", name: "Nhân", alias: [] },
          { code: "nga-pham", name: "Nga Phạm", alias: [] },
          { code: "thanh-pham", name: "Thành Phạm", alias: [] },
        ],
      },
      {
        id: "sai-gon",
        label: "Bạn ở Sài Gòn",
        guests: [
          {
            code: "the-thanh",
            name: "Anh Thế & Thanh",
            xung: "anh và Thanh",
            minh: "hai vợ chồng em",
            alias: ["thanh + a thế"],
          },
          { code: "nuong", name: "Nương", alias: [] },
          { code: "sen", name: "Sen", alias: [] },
          { code: "hang", name: "Hằng", alias: [] },
          { code: "thu", name: "Thư", xung: "em", alias: [] },
          { code: "quan", name: "Quân", xung: "em", alias: [] },
          {
            code: "anh-thanh",
            name: "Anh Thanh",
            xung: "anh",
            alias: ["a thanh"],
          },
          { code: "anh-nam", name: "Anh Nam", xung: "anh", alias: [] },
          { code: "trang-dh", name: "Trang", alias: ["đại học"] },
        ],
      },
    ],
  });
})();
