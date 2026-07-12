/**
 * تایپ‌های QR پویا (Dynamic QR) — فاز ۴.
 *
 * ایده‌ی اصلی: یک QR چاپ‌شده (مثلاً روی کارت ویزیت فیزیکی یا غرفه‌ی
 * نمایشگاه) یک شناسه‌ی ثابت دارد (`shortCode`) که هرگز عوض نمی‌شود،
 * اما مقصدش (`targetCardId`) در هر لحظه قابل تغییر است — یعنی صاحب کارت
 * می‌تواند بدون چاپ دوباره‌ی QR، مقصد را عوض کند (مثلاً بین چند کارت
 * مختلف که خودش دارد).
 *
 * تصمیم امنیتی عمدی: مقصد فقط می‌تواند یک کارت داخلی پروژه باشد
 * (targetCardId)، نه هر URL دلخواه (targetUrl آزاد). اگر کاربر می‌توانست
 * مقصد را به هر آدرسی تغییر دهد، این یک آسیب‌پذیری کلاسیک «Open
 * Redirect» می‌ساخت که می‌تواند برای فیشینگ سوءاستفاده شود.
 *
 * هر اسکن به‌عنوان یک QrScanEvent جداگانه ثبت می‌شود (شبیه
 * AnalyticsEvent ولی مخصوص QR، چون نیاز به فیلدهای مختص کمپین دارد).
 */

export type QrCodeStatus = 'active' | 'paused';

export interface DynamicQrCode {
  id: string;
  ownerId: string;
  // کد کوتاه که در URL نمایش داده می‌شود، مثلاً /q/ab12cd
  shortCode: string;
  label: string; // نام دلخواه برای شناسایی توسط کاربر، مثلاً «QR روی غرفه نمایشگاه تهران»
  targetCardId: string;
  campaign?: string;
  source?: string; // مثلاً «چاپ کارت ویزیت»، «بنر نمایشگاه»، «استیکر مغازه»
  status: QrCodeStatus;
  scanCount: number;
  createdAt: string;
  updatedAt: string;
}

export type DynamicQrCodeDraft = Pick<DynamicQrCode, 'label' | 'targetCardId' | 'campaign' | 'source'>;

export interface QrScanEvent {
  scanId: string;
  qrCodeId: string;
  cardId: string;
  timestamp: string;
  device?: string;
  browser?: string;
  country?: string;
  city?: string;
  referrer?: string;
}
