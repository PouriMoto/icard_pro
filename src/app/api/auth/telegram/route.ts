import { NextRequest, NextResponse } from 'next/server';
import { telegramAuthProvider } from '@/auth/providers/telegram.provider';
import { setSessionCookie } from '@/auth/session';

/**
 * POST /api/auth/telegram
 * بدنه: { initData: string }
 *
 * initData مستقیماً از window.Telegram.WebApp.initData در کلاینت گرفته
 * می‌شود و اینجا (سمت سرور) با HMAC تایید می‌شود — کلاینت هرگز به‌تنهایی
 * قابل‌اعتماد نیست.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initData } = body as { initData?: string };

    if (!initData) {
      return NextResponse.json({ status: 'error', message: 'initData ارسال نشد' }, { status: 400 });
    }

    const user = await telegramAuthProvider.authenticate({ initData });

    await setSessionCookie({ userId: user.id, phone: user.phone });

    return NextResponse.json({
      status: 'ok',
      data: { id: user.id, name: user.name, plan: user.plan },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطای نامشخص';
    return NextResponse.json({ status: 'error', message }, { status: 400 });
  }
}
