import { NextRequest, NextResponse } from 'next/server';
import { cardRepository } from '@/repositories';
import { buildVCardText, vCardFileName } from '@/services/vcard.service';

/**
 * GET /api/cards/:id/vcard
 * این مسیر عمداً عمومی است (بدون نیاز به جلسه) — چون بازدیدکننده‌ی
 * صفحه‌ی کارت (نه فقط مالک) باید بتواند فایل vCard را دانلود کند.
 * فقط کارت‌های status=active قابل دانلود هستند.
 */

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const card = await cardRepository.findById(params.id);

  if (!card || card.status !== 'active') {
    return NextResponse.json({ status: 'error', message: 'کارت پیدا نشد' }, { status: 404 });
  }

  const vcardText = buildVCardText(card);

  return new NextResponse(vcardText, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${vCardFileName(card)}"`,
    },
  });
}
