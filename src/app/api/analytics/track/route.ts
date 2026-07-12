import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/services/analytics.service';
import { parseDeviceFromUserAgent, parseBrowserFromUserAgent } from '@/lib/utils';
import type { AnalyticsEventName } from '@/types/card';

/**
 * POST /api/analytics/track
 * نقطه‌ی ورودی عمومی (بدون نیاز به جلسه — بازدیدکننده‌ی ناشناس هم باید
 * بتواند رویداد بفرستد). device/browser از User-Agent سمت سرور استخراج
 * می‌شود تا کلاینت مجبور نباشد این منطق را تکرار کند و قابل‌اعتمادتر
 * باشد.
 *
 * تصمیم مستند: تشخیص کشور/شهر از روی IP عمداً در این فاز پیاده‌سازی
 * نشده (نیاز به سرویس ثالث دارد) — طبق تصمیم گرفته‌شده در
 * PROJECT_STATUS.md، اول سرعت پیاده‌سازی اولویت دارد. این دو فیلد فعلاً
 * خالی می‌مانند و بعداً بدون نیاز به تغییر مدل داده اضافه می‌شوند.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cardId, visitorId, sessionId, eventName, params,
      referrer, utmSource, utmMedium, utmCampaign,
    } = body as {
      cardId?: string; visitorId?: string; sessionId?: string;
      eventName?: string; params?: Record<string, unknown>;
      referrer?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string;
    };

    if (!cardId || !visitorId || !sessionId || !eventName) {
      return NextResponse.json({ status: 'error', message: 'فیلدهای الزامی رویداد ناقص است' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') ?? '';

    await trackEvent({
      cardId,
      visitorId,
      sessionId,
      eventName: eventName as AnalyticsEventName,
      params,
      device: parseDeviceFromUserAgent(userAgent),
      browser: parseBrowserFromUserAgent(userAgent),
      utmSource,
      utmMedium,
      utmCampaign,
      referrer,
    });

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    // ثبت آنالیز هرگز نباید تجربه‌ی کاربر را مختل کند؛ خطا فقط سمت سرور
    // لاگ می‌شود و به کلاینت پاسخ عادی داده می‌شود.
    console.error('[analytics track error]', err);
    return NextResponse.json({ status: 'ok' });
  }
}
