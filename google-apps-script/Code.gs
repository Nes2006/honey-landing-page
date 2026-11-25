/**
 * Google Apps Script สำหรับระบบขายน้ำผึ้ง (Landing Page + Fulfillment)
 * วิธีใช้งาน:
 * 1. สร้าง Google Sheet ใหม่ แล้วไปที่เมนู Extensions > Apps Script
 * 2. ลบโค้ดเดิมออกทั้งหมด แล้ววางโค้ดนี้ลงไป
 * 3. กด Deploy > New deployment > เลือกประเภท Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. คัดลอก Web App URL ไปวางในไฟล์ config.js (ตัวแปร GOOGLE_SCRIPT_URL)
 */

const SHEET_NAME = 'Orders';

const HEADERS = [
  'OrderID',
  'Timestamp',
  'CustomerName',
  'Phone',
  'Address',
  'PostalCode',
  'SKU',
  'ProductName',
  'Quantity',
  'UnitPrice',
  'TotalPrice',
  'Note',
  'Status' // Pending | Picked | Packed | Shipped
];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#FEF3C7');
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#FEF3C7');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * รับคำสั่งซื้อใหม่ หรืออัปเดตสถานะการหยิบ/แพ็คสินค้า
 * ใช้ text/plain JSON เพื่อหลีกเลี่ยงปัญหา CORS preflight บนเบราว์เซอร์
 */
function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const raw = e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    // กรณีอัปเดตสถานะออเดอร์จากหน้า Fulfillment (Pick / Pack / Shipped)
    if (data.action === 'updateStatus') {
      const orderId = String(data.orderId || '').trim();
      const newStatus = String(data.status || '').trim();
      if (!orderId || !newStatus) {
        return jsonResponse({ ok: false, error: 'Missing orderId or status' });
      }

      const values = sheet.getDataRange().getValues();
      const statusColIndex = HEADERS.indexOf('Status') + 1;
      let updated = false;

      for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]).trim() === orderId) {
          sheet.getRange(i + 1, statusColIndex).setValue(newStatus);
          updated = true;
          break;
        }
      }

      return jsonResponse({ ok: updated, orderId: orderId, status: newStatus });
    }

    // กรณีสร้างออเดอร์ใหม่จาก Landing Page
    const orderId = data.orderId || ('HNY-' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd-HHmmss'));
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');

    const row = [
      orderId,
      timestamp,
      data.customerName || '',
      "'" + (data.phone || ''), // เติม ' นำหน้าเพื่อรักษาเลข 0 ตัวแรกใน Google Sheet
      data.address || '',
      "'" + (data.postalCode || ''),
      data.sku || '',
      data.productName || '',
      Number(data.quantity || 1),
      Number(data.unitPrice || 0),
      Number(data.totalPrice || 0),
      data.note || '',
      data.status || 'Pending'
    ];

    sheet.appendRow(row);
    return jsonResponse({ ok: true, orderId: orderId, timestamp: timestamp });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

/**
 * ดึงรายการออเดอร์ทั้งหมดไปแสดงในหน้า Fulfillment เพื่อหยิบสินค้า แพ็ค และพิมพ์ใบจ่าหน้า
 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      return jsonResponse({ ok: true, orders: [] });
    }

    const headers = values[0];
    const orders = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (!row[0]) continue;
      orders.push({
        orderId: String(row[0]),
        timestamp: String(row[1]),
        customerName: String(row[2]),
        phone: String(row[3]).replace(/^'/, ''),
        address: String(row[4]),
        postalCode: String(row[5]).replace(/^'/, ''),
        sku: String(row[6]),
        productName: String(row[7]),
        quantity: Number(row[8] || 1),
        unitPrice: Number(row[9] || 0),
        totalPrice: Number(row[10] || 0),
        note: String(row[11] || ''),
        status: String(row[12] || 'Pending')
      });
    }

    // เรียงออเดอร์ล่าสุดขึ้นก่อน
    orders.reverse();
    return jsonResponse({ ok: true, orders: orders });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}
