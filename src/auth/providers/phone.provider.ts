import type { AuthProvider } from './auth-provider.interface';
import type { User } from '@/types/card';
import { userRepository } from '@/repositories';

/**
 * Provider ورود با شماره موبایل — فعال در MVP.
 *
 * تصمیم محصول صریح: بدون OTP در این فاز. یعنی صرفاً با دادن شماره،
 * حساب ساخته یا پیدا می‌شود. این یعنی phoneVerified همیشه false می‌ماند
 * تا وقتی OTP در فاز بعد اضافه شود — از همان اول این فیلد در مدل داده
 * وجود دارد تا نیازی به migrate کردن داده‌ی قدیمی نباشد.
 *
 * اعتبارسنجی حداقلی فرمت شماره اینجا انجام می‌شود؛ این جایگزین OTP
 * واقعی نیست، فقط از ورود داده‌ی کاملاً نامعتبر جلوگیری می‌کند.
 */

export interface PhoneCredentials {
  phone: string;
  name?: string;
}

function normalizePhone(raw: string): string {
  // حذف فاصله، خط‌تیره، پرانتز — فقط ارقام و + مجاز است
  return raw.replace(/[^\d+]/g, '');
}

function isValidIranianMobile(phone: string): boolean {
  // فرمت‌های رایج: 09xxxxxxxxx یا +989xxxxxxxxx
  return /^(?:\+98|0)?9\d{9}$/.test(phone);
}

export const phoneAuthProvider: AuthProvider = {
  id: 'phone',
  enabled: true,

  async authenticate(credentials: unknown): Promise<User> {
    const { phone: rawPhone, name } = credentials as PhoneCredentials;

    const phone = normalizePhone(rawPhone);
    if (!isValidIranianMobile(phone)) {
      throw new Error('شماره موبایل معتبر نیست');
    }

    const existingUser = await userRepository.findByPhone(phone);
    if (existingUser) {
      return existingUser;
    }

    return userRepository.create(phone, name);
  },
};
