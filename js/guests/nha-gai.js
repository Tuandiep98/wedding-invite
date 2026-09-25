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
    ],
  });
})();
