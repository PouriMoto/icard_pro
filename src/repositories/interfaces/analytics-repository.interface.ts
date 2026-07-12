import type { AnalyticsEvent } from '@/types/card';

/**
 * اینترفیس Repository آنالیز. پیاده‌سازی کامل (پردازش/تجمیع برای
 * dashboard) در فاز ۳ اضافه می‌شود؛ اینجا فقط قرارداد پایه (ثبت و خواندن
 * خام رویدادها) گذاشته شده تا فاز ۰/۱ بتواند رویداد ثبت کند بدون اینکه
 * منتظر فاز ۳ بماند.
 */
export interface AnalyticsRepository {
  record(event: AnalyticsEvent): Promise<void>;
  findByCardId(cardId: string): Promise<AnalyticsEvent[]>;
}
