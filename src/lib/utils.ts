import { nanoid } from 'nanoid';

/**
 * توابع کمکی عمومی و خالص — بدون وابستگی به state یا سرویس خاصی.
 */

// ساخت slug از نام فارسی/انگلیسی برای URL کارت (مثلاً /card/sara-mohammadi-x7f2)
export function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    // فاصله‌ها به خط‌تیره
    .replace(/\s+/g, '-')
    // حذف کاراکترهای غیرمجاز در URL (حروف فارسی/عربی و لاتین و اعداد و خط‌تیره نگه داشته می‌شوند)
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const suffix = nanoid(5).toLowerCase();
  return base ? `${base}-${suffix}` : suffix;
}

// جلوگیری از XSS ساده هنگام رندر داده‌ی کاربر در HTML
export function sanitizeText(str: string | null | undefined): string {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function countWords(str: string): number {
  const trimmed = str.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function limitWords(str: string, maxWords: number): string {
  const words = str.trim().split(/\s+/);
  if (words.length <= maxWords) return str;
  return words.slice(0, maxWords).join(' ');
}

// شناسه‌ی مرورگر بازدیدکننده (برای Analytics فاز ۳) — باید سمت کلاینت
// در localStorage ذخیره و بازاستفاده شود تا یک بازدیدکننده یکتا بماند.
export function generateVisitorId(): string {
  return 'v_' + nanoid(16);
}

// شناسه‌ی هر بازدید/جلسه‌ی مرورگر (per browser session)
export function generateSessionId(): string {
  return 's_' + nanoid(16);
}

export function generateEventId(): string {
  return 'e_' + nanoid(16);
}

export function generateScanId(): string {
  return 'scan_' + nanoid(16);
}

// تشخیص ساده‌ی نوع دستگاه از User-Agent — بدون کتابخانه‌ی خارجی.
// در api/analytics/track و app/q/[shortCode] (ریدایرکت QR) هر دو استفاده
// می‌شود تا منطق تکراری نشود.
export function parseDeviceFromUserAgent(userAgent: string): string {
  if (/tablet|ipad/i.test(userAgent)) return 'tablet';
  if (/mobile|android|iphone/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

export function parseBrowserFromUserAgent(userAgent: string): string {
  if (/edg\//i.test(userAgent)) return 'Edge';
  if (/chrome\//i.test(userAgent) && !/edg\//i.test(userAgent)) return 'Chrome';
  if (/firefox\//i.test(userAgent)) return 'Firefox';
  if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) return 'Safari';
  return 'Other';
}
