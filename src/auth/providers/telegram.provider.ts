import { createHmac, timingSafeEqual } from 'crypto';
import type { AuthProvider } from './auth-provider.interface';
import type { User } from '@/types/card';
import { userRepository } from '@/repositories';

/**
 * Provider ورود با تلگرام — فعال (برای Telegram Mini App).
 *
 * الگوریتم تایید امضا طبق مستندات رسمی تلگرام:
 *   ۱. رشته‌ی initData را به جفت‌های key=value تفکیک می‌کنیم
 *   ۲. فیلد hash را جدا می‌کنیم، بقیه را بر اساس کلید مرتب و با \n می‌چسبانیم
 *   ۳. secretKey = HMAC_SHA256(key="WebAppData", message=botToken)
 *   ۴. computedHash = HMAC_SHA256(key=secretKey, message=dataCheckString)
 *   ۵. اگر computedHash با hash دریافتی برابر بود، امضا معتبر است
 *
 * جلوگیری از Replay Attack: اگر auth_date قدیمی‌تر از ۲۴ ساعت باشد، رد
 * می‌شود — چون initData قدیمی نباید بتواند دوباره برای ورود استفاده شود.
 */

export interface TelegramCredentials {
  initData: string;
}

const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60;

interface TelegramUserPayload {
  id: number;
  first_name?: string;
  username?: string;
}

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN تنظیم نشده است (.env.local را بررسی کنید)');
  }
  return token;
}

function verifyInitData(initData: string, botToken: string): Record<string, string> | null {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const sortedKeys = Array.from(params.keys()).sort();
  const dataCheckString = sortedKeys.map((key) => `${key}=${params.get(key)}`).join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const computedBuffer = Buffer.from(computedHash);
  const receivedBuffer = Buffer.from(hash);
  if (computedBuffer.length !== receivedBuffer.length || !timingSafeEqual(computedBuffer, receivedBuffer)) {
    return null;
  }

  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export const telegramAuthProvider: AuthProvider = {
  id: 'telegram',
  enabled: true,

  async authenticate(credentials: unknown): Promise<User> {
    const { initData } = credentials as TelegramCredentials;
    if (!initData) {
      throw new Error('اطلاعات ورود تلگرام دریافت نشد');
    }

    const botToken = getBotToken();
    const verified = verifyInitData(initData, botToken);
    if (!verified) {
      throw new Error('اعتبارسنجی داده تلگرام ناموفق بود');
    }

    const authDate = Number(verified.auth_date);
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (!authDate || nowSeconds - authDate > MAX_AUTH_AGE_SECONDS) {
      throw new Error('این نشست تلگرام منقضی شده است؛ لطفاً دوباره باز کنید');
    }

    let telegramUser: TelegramUserPayload;
    try {
      telegramUser = JSON.parse(verified.user ?? '{}');
    } catch {
      throw new Error('اطلاعات کاربر تلگرام نامعتبر است');
    }
    if (!telegramUser.id) {
      throw new Error('شناسه کاربر تلگرام یافت نشد');
    }

    const telegramId = String(telegramUser.id);
    const existingUser = await userRepository.findByTelegramId(telegramId);
    if (existingUser) {
      return existingUser;
    }

    const name = telegramUser.first_name ?? telegramUser.username ?? undefined;
    return userRepository.createFromTelegram(telegramId, name);
  },
};
