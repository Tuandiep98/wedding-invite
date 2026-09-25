/**
 * Nhận xác nhận tham dự từ thiệp cưới và ghi vào Google Sheet.
 *
 * Cài đặt: mở Google Sheet → Tiện ích mở rộng → Apps Script → dán toàn bộ file này
 * → Triển khai → Tùy chọn triển khai mới → Ứng dụng web
 *   (Thực thi với tư cách: Tôi · Người có quyền truy cập: Bất kỳ ai)
 * → copy URL /exec vào window.WEDDING_RSVP_URL trong js/events.js.
 *
 * Khách có mã riêng gửi lại nhiều lần → cập nhật đúng dòng cũ (không nhân đôi).
 * Link chung (không có mã khách) → mỗi lần gửi là một dòng mới.
 */

var SHEET_NAME = "RSVP";
var TIMEZONE = "Asia/Ho_Chi_Minh";
var HEADERS = [
  "Thời gian",
  "Thiệp",
  "Mã khách",
  "Tên",
  "Tham dự",
  "Người đi cùng",
  "Tổng số người",
  "Lời nhắn",
  "Số lần gửi",
];
var EVENT_NAMES = {
  "nha-trai": "Nhà trai",
  "nha-gai": "Nhà gái",
  "bao-hi": "Báo hỉ",
};

function doPost(e) {
  var p = (e && e.parameter) || {};
  // Ô bẫy bot: người thật không thấy ô này nên luôn để trống
  if (p.website) return json({ ok: true });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getSheet();
    var attending = p.attending === "yes";
    var extra = attending ? Math.max(0, Math.min(10, parseInt(p.guests, 10) || 0)) : 0;
    var code = clip(p.guest, 40);
    var eventName = EVENT_NAMES[p.event] || clip(p.event, 20);

    var row = [
      Utilities.formatDate(new Date(), TIMEZONE, "dd/MM/yyyy HH:mm"),
      eventName,
      code,
      clip(p.name, 100),
      attending ? "Có" : "Không",
      extra,
      attending ? 1 + extra : 0,
      clip(p.message, 1000),
    ];

    var at = code ? findRow(sheet, eventName, code) : 0;
    if (at) {
      var count = Number(sheet.getRange(at, HEADERS.length).getValue()) || 1;
      row.push(count + 1);
      sheet.getRange(at, 1, 1, row.length).setValues([row]);
    } else {
      row.push(1);
      sheet.appendRow(row);
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Mở URL /exec trên trình duyệt để kiểm tra script đã chạy. */
function doGet() {
  return json({ ok: true, message: "RSVP đang hoạt động" });
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findRow(sheet, eventName, code) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var values = sheet.getRange(2, 2, last - 1, 2).getValues(); // cột Thiệp + Mã khách
  for (var i = 0; i < values.length; i++) {
    if (values[i][0] === eventName && values[i][1] === code) return i + 2;
  }
  return 0;
}

/** Cắt độ dài và chặn chữ bị Sheet hiểu thành công thức (=, +, -, @). */
function clip(value, max) {
  var s = String(value == null ? "" : value).trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
