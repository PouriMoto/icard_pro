import type { AuthProvider } from './auth-provider.interface';
import type { User } from '@/types/card';

/**
 * Provider ورود با گوگل — اسکلت آماده، غیرفعال در فاز ۰.
 *
 * پیاده‌سازی واقعی (فاز بعد) نیاز به موارد زیر دارد:
 *   - ثبت پروژه در Google Cloud Console و گرفتن Client ID/Secret
 *   - تایید توکن OAuth دریافتی از کلاینت (google-auth-library یا مشابه)
 *   - نگاشت ایمیل گوگل به یک رکورد User (احتمالاً نیاز به فیلد email
 *     در جدول Users که هنوز اضافه نشده)
 *
 * تا آن زمان، این Provider فقط پیام خطای مشخص می‌دهد تا اگر جایی در UI
 * به‌اشتباه صدا زده شود، رفتار پیش‌بینی‌پذیر باشد نه یک کرش نامشخص.
 */
export const googleAuthProvider: AuthProvider = {
  id: 'google',
  enabled: false,

  async authenticate(): Promise<User> {
    throw new Error('ورود با گوگل هنوز فعال نشده است (به‌زودی در فازهای بعدی)');
  },
};
