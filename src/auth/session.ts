import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/core/config/constants';

/**
 * مدیریت جلسه‌ی کاربر با JWT امضاشده در یک کوکی httpOnly.
 * httpOnly یعنی جاوااسکریپت سمت کلاینت نمی‌تواند این کوکی را بخواند —
 * جلوی حملات XSS برای دزدیدن سشن را می‌گیرد.
 */

interface SessionPayload {
  userId: string;
  phone?: string;
  [key: string]: unknown; // برای سازگاری با نیاز jose به JWTPayload عمومی
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET تنظیم نشده است (.env.local را بررسی کنید)');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as SessionPayload;
  } catch {
    // توکن نامعتبر یا منقضی‌شده — کاربر باید دوباره وارد شود
    return null;
  }
}

// این تابع را فقط در API Route ها یا Server Action ها صدا بزنید
export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  });
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function clearSessionCookie(): void {
  cookies().delete(SESSION_COOKIE_NAME);
}
