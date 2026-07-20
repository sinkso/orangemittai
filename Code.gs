/**
 * Orange Mittai — Google Apps Script for Order Logging
 *
 * SETUP:
 * 1. Create TWO Google Sheets:
 *
 *    Sheet 1 — Products & Config (public / view-only):
 *      - "Config" tab — columns: key, value
 *        Rows: SITE_OPEN | TRUE
 *      - "Categories" tab — columns: id, name, image_url
 *      - "Products" tab — columns: id, name, emoji, category, available, label, price, description
 *        One row per weight/pack option; repeat id/name/emoji/category/available
 *        across rows for products with multiple options.
 *      - "Payment" tab — columns: label, value (rendered as-is in the WhatsApp message)
 *      - Copy its Spreadsheet ID into SPREADSHEET_ID in index.html
 *
 *    Sheet 2 — Orders (private, restricted access):
 *      - Open Extensions → Apps Script from this spreadsheet
 *      - Paste this code into Code.gs
 *      - "Orders" tab is created automatically on first order
 *
 * 2. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 3. Copy the Web App URL and paste it into GOOGLE_SCRIPT_URL in index.html
 */

var ORDERS_SHEET_NAME = 'Orders';

function doPost(e) {
  try {
    var payload = JSON.parse(e.parameter.payload || '{}');
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(ORDERS_SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(ORDERS_SHEET_NAME);
      sheet.appendRow([
        'Timestamp',
        'Name',
        'Phone',
        'Postal Code',
        'Door Number',
        'Order Items',
        'Total',
        'Coupon Code',
        'Discount',
        'Special Instructions',
        'Status'
      ]);
      sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
    }

    // Force the Phone column to plain text so a leading "+" isn't parsed as a formula
    sheet.getRange(2, 3, Math.max(sheet.getMaxRows() - 1, 1), 1).setNumberFormat('@');

    sheet.appendRow([
      new Date(),
      payload.name || '',
      payload.phone ? "'" + payload.phone : '',
      payload.postal || '',
      payload.door || '',
      payload.orderItems || '',
      payload.grandTotal || '',
      payload.couponCode || '',
      payload.discount || '',
      payload.specialInstructions || '',
      'New'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: 'Orange Mittai Orders' }))
    .setMimeType(ContentService.MimeType.JSON);
}
