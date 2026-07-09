/**
 * Orange Mittai — Google Apps Script for Order Logging
 *
 * SETUP:
 * 1. Create a new Google Sheet with two tabs:
 *    - "Config" — columns: key, value
 *      Rows: SITE_OPEN | TRUE
 *    - "Products" — columns: id, name, emoji, category, available, price_per_250g
 *      Fill in your product data (matches the PRODUCTS array in index.html)
 *    - "Orders" — columns created automatically on first order
 *
 * 2. Open Extensions → Apps Script in the Google Sheet
 * 3. Paste this code into Code.gs
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL and paste it into GOOGLE_SCRIPT_URL in index.html
 * 6. Copy the Spreadsheet ID from the sheet URL and paste it into SPREADSHEET_ID in index.html
 *
 * The Spreadsheet ID is the long string in the Google Sheets URL:
 *   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
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
