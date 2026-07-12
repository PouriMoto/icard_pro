import type { User } from '@/types/card';

/**
 * قرارداد مشترک هر روش ورود (Provider). طبق تصمیم محصول:
 *   - Phone: فعال در فاز ۰ (بدون OTP)
 *   - Google: اسکلت آماده، غیرفعال تا فاز بعد
 *   - Telegram: اسکلت آماده، غیرفعال تا ساخت واقعی Mini App
 *
 * فعال‌کردن هر Provider جدید یعنی فقط پیاده‌سازی همین اینترفیس — بدون
 * تغییر در بقیه‌ی سیستم Auth یا UI.
 */
export interface AuthProvider {
  readonly id: 'phone' | 'google' | 'telegram';
  readonly enabled: boolean;

  // ورودی هر Provider متفاوت است (شماره تلفن، توکن گوگل، initData تلگرام)
  // پس امضای دقیق متد در هر پیاده‌سازی مشخص می‌شود؛ اینجا فقط شکل کلی خروجی مهم است.
  authenticate(credentials: unknown): Promise<User>;
}
