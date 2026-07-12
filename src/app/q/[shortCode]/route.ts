import { NextRequest, NextResponse } from 'next/server';
import { getQrCodeByShortCode, recordScan } from '@/services/qr.service';
import { getCardById } from '@/services/card.service';
import { parseDeviceFromUserAgent, parseBrowserFromUserAgent } from '@/lib/utils';

/**
 * GET /q/:shortCode
 * مسیر عمومی که با اسکن QR چاپ‌شده باز می‌شود. رویداد اسکن ثبت و شمارنده
 * افزایش می‌یابد، سپس کاربر به صفحه‌ی عمومی کارت مقصد ریدایرکت می‌شود.
 *
 * نکته‌ی فنی: برخلاف الگوی معمول «fire and forget» برای آنالیز، اینجا
 * عمداً ثبت اسکن await می‌شود. در محیط‌های Serverless (مثل Vercel)،
 * تابع می‌تواند بلافاصله بعد از ارسال پاسخ خاتمه یابد؛ اگر ثبت رویداد
 * بدون await رها شود، ممکن است هرگز کامل نشود. هزینه‌ی این تأخیر
 * (چند ده میلی‌ثانیه) در برابر از‌دست‌ندادن داده‌ی آنالیز توجیه‌پذیر است.
 */

interface RouteParams {
  params: { shortCode: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const qrCode = await getQrCodeByShortCode(params.shortCode);

  if (!qrCode || qrCode.status !== 'active') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const targetCard = await getCardById(qrCode.targetCardId);
  if (!targetCard || targetCard.status !== 'active') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const userAgent = request.headers.get('user-agent') ?? '';

  try {
    await recordScan(qrCode, {
      device: parseDeviceFromUserAgent(userAgent),
      browser: parseBrowserFromUserAgent(userAgent),
      referrer: request.headers.get('referer') ?? undefined,
    });
  } catch (err) {
    // شکست ثبت آمار هرگز نباید مانع رسیدن کاربر به کارت مقصد شود
    console.error('[qr scan record error]', err);
  }

  return NextResponse.redirect(new URL(`/card/${targetCard.slug}`, request.url));
}
