/**
 * iCard Backend — Google Apps Script
 * ---------------------------------------------------------------------
 * این فایل را در Extensions > Apps Script شیت «vcard» قرار دهید.
 *
 * برخلاف نسخه‌های قبلی، این نسخه جدول‌ها (تب‌ها) را در اولین اجرا
 * به‌صورت خودکار با هدر درست می‌سازد — نیازی به ساخت دستی تب نیست.
 *
 * جدول‌ها:
 *   1) Users            -> کاربران ثبت‌شده (سازنده‌های کارت)
 *   2) Cards             -> داده‌ی هر کارت ویزیت
 *   3) AnalyticsEvents   -> رویدادهای آنالیز (فاز ۳)
 *   4) QrCodes           -> QR های پویا (فاز ۴)
 *   5) QrScans           -> رویدادهای اسکن هر QR (فاز ۴)
 *   6) Industries         -> صنایع ثبت‌شده توسط کاربران که در انتظار تایید ادمین‌اند (فاز ۴)
 *
 * امنیت: تمام درخواست‌ها باید یک هدر/فیلد "secret" برابر با SHARED_SECRET
 * ارسال کنند، وگرنه رد می‌شوند. این از نوشتن/خواندن غیرمجاز جلوگیری می‌کند.
 * ---------------------------------------------------------------------
 */

// TODO: این مقدار را با ID شیت واقعی خودتان جایگزین کنید (از URL شیت).
const SPREADSHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';

// TODO: این مقدار را با یک رشته‌ی تصادفی و طولانی جایگزین کنید.
// همین مقدار باید در .env.local پروژه‌ی Next.js به‌عنوان
// GOOGLE_SCRIPT_SECRET قرار بگیرد.
const SHARED_SECRET = 'PASTE_A_LONG_RANDOM_SECRET_HERE';

// ---------------------------------------------------------------------
// تعریف جدول‌ها و هدر ستون‌های هرکدام
// ---------------------------------------------------------------------
const TABLES = {
  Users: [
    'id', 'phone', 'name', 'created_at', 'plan', 'phone_verified', 'role', 'telegram_id',
  ],

  Cards: [
    'id', 'owner_id', 'slug', 'name', 'job_title', 'description',
    'theme', 'avatar_url', 'contacts_json', 'services_json',
    'gallery_json', 'address_text', 'address_lat', 'address_lng',
    'industry', 'created_at', 'updated_at', 'status',
  ],

  AnalyticsEvents: [
    'event_id', 'card_id', 'user_id', 'visitor_id', 'session_id',
    'event_name', 'params_json', 'timestamp', 'device', 'browser',
    'country', 'city', 'utm_source', 'utm_medium', 'utm_campaign',
    'referrer',
  ],

  QrCodes: [
    'id', 'owner_id', 'short_code', 'label', 'target_card_id',
    'campaign', 'source', 'status', 'scan_count', 'created_at', 'updated_at',
  ],

  QrScans: [
    'scan_id', 'qr_code_id', 'card_id', 'timestamp', 'device',
    'browser', 'country', 'city', 'referrer',
  ],

  Industries: [
    'id', 'name', 'status', 'created_at',
  ],
};

// ---------------------------------------------------------------------
// کمکی‌های عمومی
// ---------------------------------------------------------------------

function getSheet(name) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  if (TABLES[name] && sheet.getLastRow() === 0) {
    sheet.appendRow(TABLES[name]);
  }

  return sheet;
}

function sheetToObjects(sheet) {
  var rows = sheet.getDataRange().getValues();
  var headers = rows.shift();
  return rows
    .filter(function (row) { return row.join('') !== ''; })
    .map(function (row) {
      var obj = {};
      headers.forEach(function (h, i) { obj[h] = row[i]; });
      return obj;
    });
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function isAuthorized(body) {
  return body && body.secret === SHARED_SECRET;
}

function findRowIndexById(sheet, id) {
  var rows = sheet.getDataRange().getValues();
  var idCol = rows[0].indexOf('id');
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][idCol]) === String(id)) {
      return i + 1; // چون Sheets از ۱ شماره‌گذاری می‌کند
    }
  }
  return -1;
}

// ---------------------------------------------------------------------
// GET: خواندن داده
// query params: type=users|cards|analytics , secret=xxx
// ---------------------------------------------------------------------
function doGet(e) {
  try {
    var params = e.parameter;

    if (!params.secret || params.secret !== SHARED_SECRET) {
      return jsonOut({ status: 'error', message: 'Unauthorized' });
    }

    var type = (params.type || '').toLowerCase();

    if (type === 'cards') {
      var cardsSheet = getSheet('Cards');
      var allCards = sheetToObjects(cardsSheet);
      // فیلتر اختیاری بر اساس slug یا owner_id اگر داده شده باشد
      if (params.slug) {
        allCards = allCards.filter(function (c) { return c.slug === params.slug; });
      }
      if (params.owner_id) {
        allCards = allCards.filter(function (c) { return String(c.owner_id) === String(params.owner_id); });
      }
      return jsonOut({ status: 'ok', data: allCards });
    }

    if (type === 'users') {
      var usersSheet = getSheet('Users');
      var allUsers = sheetToObjects(usersSheet);
      if (params.phone) {
        allUsers = allUsers.filter(function (u) { return String(u.phone) === String(params.phone); });
      }
      if (params.telegram_id) {
        allUsers = allUsers.filter(function (u) { return String(u.telegram_id) === String(params.telegram_id); });
      }
      return jsonOut({ status: 'ok', data: allUsers });
    }

    if (type === 'analytics') {
      var analyticsSheet = getSheet('AnalyticsEvents');
      var allEvents = sheetToObjects(analyticsSheet);
      if (params.card_id) {
        allEvents = allEvents.filter(function (ev) { return String(ev.card_id) === String(params.card_id); });
      }
      return jsonOut({ status: 'ok', data: allEvents });
    }

    if (type === 'qrcodes') {
      var qrSheet = getSheet('QrCodes');
      var allQrCodes = sheetToObjects(qrSheet);
      if (params.short_code) {
        allQrCodes = allQrCodes.filter(function (q) { return q.short_code === params.short_code; });
      }
      if (params.owner_id) {
        allQrCodes = allQrCodes.filter(function (q) { return String(q.owner_id) === String(params.owner_id); });
      }
      return jsonOut({ status: 'ok', data: allQrCodes });
    }

    if (type === 'qrscans') {
      var qrScansSheet = getSheet('QrScans');
      var allQrScans = sheetToObjects(qrScansSheet);
      if (params.qr_code_id) {
        allQrScans = allQrScans.filter(function (s) { return String(s.qr_code_id) === String(params.qr_code_id); });
      }
      return jsonOut({ status: 'ok', data: allQrScans });
    }

    if (type === 'industries') {
      var industriesSheet = getSheet('Industries');
      var allIndustries = sheetToObjects(industriesSheet);
      if (params.name) {
        allIndustries = allIndustries.filter(function (i) { return i.name === params.name; });
      }
      if (params.status) {
        allIndustries = allIndustries.filter(function (i) { return i.status === params.status; });
      }
      return jsonOut({ status: 'ok', data: allIndustries });
    }

    return jsonOut({ status: 'error', message: 'Unknown type: ' + type });

  } catch (err) {
    return jsonOut({ status: 'error', message: err.toString() });
  }
}

// ---------------------------------------------------------------------
// POST: نوشتن/ویرایش/حذف داده
// بدنه‌ی JSON: { secret, action, payload }
// actions:
//   add_user, add_card, update_card, remove_card, add_analytics_event,
//   add_qr_code, update_qr_code, remove_qr_code, increment_qr_scan_count,
//   add_qr_scan
// ---------------------------------------------------------------------
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    if (!isAuthorized(body)) {
      return jsonOut({ status: 'error', message: 'Unauthorized' });
    }

    var action = body.action;
    var payload = body.payload || {};

    if (action === 'add_user') {
      var usersSheet = getSheet('Users');
      usersSheet.appendRow([
        payload.id || '',
        payload.phone || '',
        payload.name || '',
        new Date(payload.created_at || Date.now()),
        payload.plan || 'free',
        payload.phone_verified === true,
        payload.role || 'user',
        payload.telegram_id || '',
      ]);
      return jsonOut({ status: 'ok' });
    }

    if (action === 'add_card') {
      var cardsSheet = getSheet('Cards');
      cardsSheet.appendRow([
        payload.id || '',
        payload.owner_id || '',
        payload.slug || '',
        payload.name || '',
        payload.job_title || '',
        payload.description || '',
        payload.theme || '',
        payload.avatar_url || '',
        payload.contacts_json || '[]',
        payload.services_json || '[]',
        payload.gallery_json || '[]',
        payload.address_text || '',
        payload.address_lat || '',
        payload.address_lng || '',
        payload.industry || '',
        new Date(payload.created_at || Date.now()),
        new Date(payload.updated_at || Date.now()),
        payload.status || 'active',
      ]);
      return jsonOut({ status: 'ok' });
    }

    if (action === 'update_card') {
      var cardsSheet2 = getSheet('Cards');
      var rowIndex = findRowIndexById(cardsSheet2, payload.id);
      if (rowIndex === -1) {
        return jsonOut({ status: 'error', message: 'Card not found' });
      }
      var headers = cardsSheet2.getRange(1, 1, 1, cardsSheet2.getLastColumn()).getValues()[0];
      var patch = payload.patch || {};
      patch.updated_at = new Date().toISOString();
      headers.forEach(function (h, colIdx) {
        if (patch.hasOwnProperty(h)) {
          var val = patch[h];
          cardsSheet2.getRange(rowIndex, colIdx + 1).setValue(val);
        }
      });
      return jsonOut({ status: 'ok' });
    }

    if (action === 'remove_card') {
      var cardsSheet3 = getSheet('Cards');
      var rowIndex3 = findRowIndexById(cardsSheet3, payload.id);
      if (rowIndex3 === -1) {
        return jsonOut({ status: 'error', message: 'Card not found' });
      }
      cardsSheet3.deleteRow(rowIndex3);
      return jsonOut({ status: 'ok' });
    }

    if (action === 'add_analytics_event') {
      var analyticsSheet2 = getSheet('AnalyticsEvents');
      analyticsSheet2.appendRow([
        payload.event_id || '',
        payload.card_id || '',
        payload.user_id || '',
        payload.visitor_id || '',
        payload.session_id || '',
        payload.event_name || '',
        payload.params_json || '{}',
        new Date(payload.timestamp || Date.now()),
        payload.device || '',
        payload.browser || '',
        payload.country || '',
        payload.city || '',
        payload.utm_source || '',
        payload.utm_medium || '',
        payload.utm_campaign || '',
        payload.referrer || '',
      ]);
      return jsonOut({ status: 'ok' });
    }

    if (action === 'add_qr_code') {
      var qrSheet = getSheet('QrCodes');
      qrSheet.appendRow([
        payload.id || '',
        payload.owner_id || '',
        payload.short_code || '',
        payload.label || '',
        payload.target_card_id || '',
        payload.campaign || '',
        payload.source || '',
        payload.status || 'active',
        payload.scan_count || 0,
        new Date(payload.created_at || Date.now()),
        new Date(payload.updated_at || Date.now()),
      ]);
      return jsonOut({ status: 'ok' });
    }

    if (action === 'update_qr_code') {
      var qrSheet2 = getSheet('QrCodes');
      var qrRowIndex = findRowIndexById(qrSheet2, payload.id);
      if (qrRowIndex === -1) {
        return jsonOut({ status: 'error', message: 'QR code not found' });
      }
      var qrHeaders = qrSheet2.getRange(1, 1, 1, qrSheet2.getLastColumn()).getValues()[0];
      var qrPatch = payload.patch || {};
      qrPatch.updated_at = new Date().toISOString();
      qrHeaders.forEach(function (h, colIdx) {
        if (qrPatch.hasOwnProperty(h)) {
          qrSheet2.getRange(qrRowIndex, colIdx + 1).setValue(qrPatch[h]);
        }
      });
      return jsonOut({ status: 'ok' });
    }

    if (action === 'remove_qr_code') {
      var qrSheet3 = getSheet('QrCodes');
      var qrRowIndex3 = findRowIndexById(qrSheet3, payload.id);
      if (qrRowIndex3 === -1) {
        return jsonOut({ status: 'error', message: 'QR code not found' });
      }
      qrSheet3.deleteRow(qrRowIndex3);
      return jsonOut({ status: 'ok' });
    }

    if (action === 'increment_qr_scan_count') {
      var qrSheet4 = getSheet('QrCodes');
      var qrRowIndex4 = findRowIndexById(qrSheet4, payload.id);
      if (qrRowIndex4 === -1) {
        return jsonOut({ status: 'error', message: 'QR code not found' });
      }
      var qrHeaders4 = qrSheet4.getRange(1, 1, 1, qrSheet4.getLastColumn()).getValues()[0];
      var scanCountCol = qrHeaders4.indexOf('scan_count') + 1;
      var currentCount = qrSheet4.getRange(qrRowIndex4, scanCountCol).getValue() || 0;
      qrSheet4.getRange(qrRowIndex4, scanCountCol).setValue(Number(currentCount) + 1);
      return jsonOut({ status: 'ok' });
    }

    if (action === 'add_qr_scan') {
      var qrScansSheet = getSheet('QrScans');
      qrScansSheet.appendRow([
        payload.scan_id || '',
        payload.qr_code_id || '',
        payload.card_id || '',
        new Date(payload.timestamp || Date.now()),
        payload.device || '',
        payload.browser || '',
        payload.country || '',
        payload.city || '',
        payload.referrer || '',
      ]);
      return jsonOut({ status: 'ok' });
    }

    if (action === 'add_industry') {
      var industriesSheet = getSheet('Industries');
      industriesSheet.appendRow([
        payload.id || '',
        payload.name || '',
        payload.status || 'pending',
        new Date(payload.created_at || Date.now()),
      ]);
      return jsonOut({ status: 'ok' });
    }

    if (action === 'approve_industry') {
      var industriesSheet2 = getSheet('Industries');
      var industryRowIndex = findRowIndexById(industriesSheet2, payload.id);
      if (industryRowIndex === -1) {
        return jsonOut({ status: 'error', message: 'Industry not found' });
      }
      var industryHeaders = industriesSheet2.getRange(1, 1, 1, industriesSheet2.getLastColumn()).getValues()[0];
      var statusCol = industryHeaders.indexOf('status') + 1;
      industriesSheet2.getRange(industryRowIndex, statusCol).setValue('approved');
      return jsonOut({ status: 'ok' });
    }

    return jsonOut({ status: 'error', message: 'Unknown action: ' + action });

  } catch (err) {
    return jsonOut({ status: 'error', message: err.toString() });
  }
}
