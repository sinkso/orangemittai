/**
 * Orange Mittai — Google Apps Script for Order Logging
 *
 * SETUP:
 * 1. Create TWO Google Sheets:
 *
 *    Sheet 1 — Products & Config (public / view-only):
 *      - "Config" tab — columns: key, value
 *        Rows: SITE_OPEN | TRUE
 *      - "Products" tab — columns: id, name, emoji, category, available, price_per_250g
 *
 *    Sheet 2 — Orders (private, restricted access):
 *      - "Orders" tab — created automatically on first order
 *      - Copy its Spreadsheet ID and paste it into ORDERS_SPREADSHEET_ID below
 *
 * 2. Open the ORDERS spreadsheet → Extensions → Apps Script
 * 3. Paste this code into Code.gs
 * 4. Set ORDERS_SPREADSHEET_ID below to the Orders spreadsheet ID
 * 5. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web App URL and paste it into GOOGLE_SCRIPT_URL in index.html
 * 7. Copy the Products & Config Spreadsheet ID into SPREADSHEET_ID in index.html
 *
 * The Spreadsheet ID is the long string in the Google Sheets URL:
 *   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
 */

var ORDERS_SPREADSHEET_ID = '';  // <-- paste your Orders spreadsheet ID here
var ORDERS_SHEET_NAME = 'Orders';

function getOrdersSpreadsheet() {
  if (ORDERS_SPREADSHEET_ID) {
    return SpreadsheetApp.openById(ORDERS_SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.parameter.payload || '{}');
    var ss = getOrdersSpreadsheet();
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

    sheet.appendRow([
      new Date(),
      payload.name || '',
      payload.phone || '',
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
