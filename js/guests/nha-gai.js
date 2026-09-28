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
        id: "ho-ngoai",
        label: "Họ ngoại",
        guests: [
          { code: "thuy-sac", name: "Vợ chồng em Thuý", xung: "hai em", alias: ["vợ chồng em thuý"] },
          { code: "thuy-huyen", name: "Vợ chồng em Thuỳ", xung: "hai em", alias: ["vợ chồng em thuỳ"] },
          { code: "vinh-nhung", name: "Vợ chồng em Vinh Nhung", xung: "hai em", alias: ["vợ chồng em vinh nhung"] },
          { code: "thanh-ngoai", name: "Em Thanh", xung: "em", alias: [] },
          { code: "thuong-nhung", name: "Vợ chồng anh Thường Nhung", xung: "anh chị", alias: ["vợ chồng a thường nhung"] },
          { code: "anh-vu", name: "Vợ chồng anh Vụ", xung: "anh chị", alias: ["vợ chồng a vụ"] },
          { code: "chi-yen", name: "Vợ chồng chị Yên", xung: "anh chị", alias: ["vợ chồng chị yên"] },
          { code: "huong", name: "Vợ chồng em Hướng", xung: "hai em", alias: ["vợ chồng em hướng"] },
          { code: "son-ngoai", name: "Vợ chồng em Sơn", xung: "hai em", alias: ["vợ chồng em sơn"] },
          { code: "ngan", name: "Vợ chồng em Ngân", xung: "hai em", alias: ["vợ chồng em ngân"] },
          { code: "nga-ngoai", name: "Em Nga", xung: "em", alias: [] },
          { code: "doan", name: "Vợ chồng em Doan", xung: "hai em", alias: ["vợ chồng em doan"] },
          { code: "doanh", name: "Vợ chồng em Doanh", xung: "hai em", alias: ["vợ chồng em doanh"] },
          { code: "hieu-ngoai", name: "Em Hiếu", xung: "em", alias: [] },
          { code: "trang-ngoai", name: "Em Tráng", xung: "em", alias: [] },
        ],
      },
      {
        id: "ho-noi",
        label: "Họ nội",
        guests: [
          { code: "anh-hoang", name: "Anh Hoàng", xung: "anh", alias: [] },
          { code: "tuan-mai", name: "Vợ chồng anh Tuấn Mai", xung: "anh chị", alias: ["vợ chồng anh tuấn mai"] },
          { code: "quynh-huong", name: "Em Quỳnh Hương", xung: "em", alias: [] },
          { code: "huy-noi", name: "Vợ chồng em Huy", xung: "hai em", alias: ["vợ chồng em huy"] },
          { code: "co-thao", name: "Anh Cò Thảo", xung: "anh", alias: ["anh cò thảo"] },
          { code: "son-phuong", name: "Vợ chồng em Sơn Phượng", xung: "hai em", alias: ["vợ chồng em sơn phượng"] },
          { code: "cuong-hue", name: "Vợ chồng em Cường Huệ", xung: "hai em", alias: ["vợ chồng em cường huệ"] },
        ],
      },
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
