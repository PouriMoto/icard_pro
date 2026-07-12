import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/auth/session';
import { createUploadSignature } from '@/services/cloudinary.service';

/**
 * POST /api/upload
 * نیاز به جلسه‌ی فعال (فقط کاربر واردشده می‌تواند عکس آپلود کند).
 *
 * این Route فایل واقعی را دریافت نمی‌کند — فقط یک امضای معتبر برای
 * مدت کوتاه صادر می‌کند. آپلود واقعی فایل مستقیماً از مرورگر کاربر به
 * Cloudinary انجام می‌شود (سریع‌تر، بدون عبور فایل از سرور ما).
 */
export async function POST() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ status: 'error', message: 'ابتدا وارد شوید' }, { status: 401 });
  }

  try {
    // پوشه‌بندی بر اساس شناسه‌ی کاربر — هم برای نظم، هم برای اینکه بعداً
    // بشود عکس‌های یک کاربر را دسته‌جمعی مدیریت/حذف کرد
    const signaturePayload = createUploadSignature(`icard/${session.userId}`);
    return NextResponse.json({ status: 'ok', data: signaturePayload });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطای نامشخص';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
