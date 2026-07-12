/**
 * کلاینت سطح‌پایین برای صحبت با Google Apps Script Web App.
 * این فایل فقط جزئیات HTTP (fetch، secret، error handling) را می‌داند؛
 * منطق تبدیل داده (row <-> Card/User) در فایل‌های Repository جداگانه است.
 *
 * هشدار امنیتی: این فایل فقط باید از سمت سرور (API Routes، Server
 * Components) import شود، هرگز از یک کامپوننت کلاینتی — چون
 * GOOGLE_SCRIPT_SECRET را می‌خواند و اگر در باندل کلاینت قرار بگیرد،
 * در مرورگر کاربر قابل مشاهده می‌شود.
 */

function getScriptUrl(): string {
  const url = process.env.GOOGLE_SCRIPT_URL;
  if (!url) {
    throw new Error('GOOGLE_SCRIPT_URL تنظیم نشده است (.env.local را بررسی کنید)');
  }
  return url;
}

function getSecret(): string {
  const secret = process.env.GOOGLE_SCRIPT_SECRET;
  if (!secret) {
    throw new Error('GOOGLE_SCRIPT_SECRET تنظیم نشده است (.env.local را بررسی کنید)');
  }
  return secret;
}

export interface SheetResponse<T> {
  status: 'ok' | 'error';
  data?: T;
  message?: string;
}

// خواندن داده (type=cards|users|analytics + فیلترهای اختیاری)
export async function sheetGet<T>(
  type: 'cards' | 'users' | 'analytics' | 'qrcodes' | 'qrscans' | 'industries',
  filters: Record<string, string> = {}
): Promise<T> {
  const url = new URL(getScriptUrl());
  url.searchParams.set('type', type);
  url.searchParams.set('secret', getSecret());
  Object.entries(filters).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const res = await fetch(url.toString(), {
    method: 'GET',
    // هرگز پاسخ Google Sheet را کش نکن — داده باید همیشه تازه باشد
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`درخواست به Google Sheet ناموفق بود: HTTP ${res.status}`);
  }

  const json = (await res.json()) as SheetResponse<T>;
  if (json.status === 'error') {
    throw new Error(`خطای Google Sheet: ${json.message ?? 'نامشخص'}`);
  }

  return json.data as T;
}

// نوشتن/ویرایش/حذف داده
export async function sheetPost(
  action: string,
  payload: Record<string, unknown>
): Promise<void> {
  const res = await fetch(getScriptUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: getSecret(), action, payload }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`درخواست نوشتن به Google Sheet ناموفق بود: HTTP ${res.status}`);
  }

  const json = (await res.json()) as SheetResponse<unknown>;
  if (json.status === 'error') {
    throw new Error(`خطای نوشتن در Google Sheet: ${json.message ?? 'نامشخص'}`);
  }
}
