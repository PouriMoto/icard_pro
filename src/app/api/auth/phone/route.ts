import { NextRequest, NextResponse } from 'next/server';
import { phoneAuthProvider } from '@/auth/providers/phone.provider';
import { setSessionCookie } from '@/auth/session';

/**
 * POST /api/auth/phone
 * بدنه: { phone: string, name?: string }
 *
 * طبق تصمیم محصول: بدون OTP در فاز MVP. با دادن شماره، اگر حساب موجود
 * نباشد ساخته می‌شود، سپس یک کوکی جلسه (httpOnly) صادر می‌شود.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name } = body as { phone?: string; name?: string };

    if (!phone) {
      return NextResponse.json({ status: 'error', message: 'شماره موبایل الزامی است' }, { status: 400 });
    }

    const user = await phoneAuthProvider.authenticate({ phone, name });

    await setSessionCookie({ userId: user.id, phone: user.phone });

    return NextResponse.json({
      status: 'ok',
      data: { id: user.id, phone: user.phone, name: user.name, plan: user.plan },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطای نامشخص';
    return NextResponse.json({ status: 'error', message }, { status: 400 });
  }
}
