/**
 * Speakvest.ae — website form receiver (Google Apps Script)
 *
 * Every form on the website sends its answers here, and this script
 * adds one new row to your Google Sheet.
 *
 * Setup (5 minutes) is explained step by step in SETUP-GUIDE.md.
 * Short version:
 *  1. Open your Google Sheet > Extensions > Apps Script.
 *  2. Delete what's there, paste this whole file, click Save.
 *  3. Deploy > New deployment > type "Web app"
 *       Execute as: Me
 *       Who has access: Anyone
 *  4. Copy the Web app URL (ends in /exec) into data/site.json -> "formEndpoint".
 */

// Optional: put an email address here to get an email for every new lead.
// Leave it as '' if you don't want emails.
var NOTIFY_EMAIL = '';

// Name of the tab (sheet) inside your spreadsheet where leads are stored.
var SHEET_NAME = 'Leads';

// The columns, in order. You can add more later; new fields sent by the
// website are added as new columns automatically.
var COLUMNS = ['submittedAt', 'formType', 'name', 'phone', 'email', 'project', 'budget', 'timeline',
               'message', 'extra', 'page', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign',
               'utm_content', 'utm_term'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var data = JSON.parse(e.postData.contents || '{}');
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Header row (created once, extended if new fields appear)
    var header = sh.getLastRow() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
    if (!header.length || header[0] === '') { header = COLUMNS.slice(); }
    Object.keys(data).forEach(function (k) { if (header.indexOf(k) < 0) header.push(k); });
    sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
    sh.setFrozenRows(1);

    // Clean values: stop spreadsheet formulas being injected
    var row = header.map(function (k) {
      var v = data[k] == null ? '' : String(data[k]);
      if (/^[=+\-@]/.test(v) && k !== 'phone') v = "'" + v;
      return v;
    });
    sh.appendRow(row);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, 'New Speakvest lead: ' + (data.name || '') + ' (' + (data.formType || '') + ')',
        header.map(function (k, i) { return k + ': ' + row[i]; }).join('\n'));
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Open the web app URL in a browser to check it's live.
function doGet() {
  return ContentService.createTextOutput('Speakvest form receiver is running.');
}
