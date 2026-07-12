import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/auth/session';
import { createCard, getCardsByOwner } from '@/services/card.service';

/**
 * GET /api/cards       -> لیست کارت‌های کاربر جاری (نیاز به جلسه‌ی فعال)
 * POST /api/cards      -> ساخت کارت جدید (نیاز به جلسه‌ی فعال)
 */

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ status: 'error', message: 'ابتدا وارد شوید' }, { status: 401 });
  }

  const cards = await getCardsByOwner(session.userId);
  return NextResponse.json({ status: 'ok', data: cards });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ status: 'error', message: 'ابتدا وارد شوید' }, { status: 401 });
  }

  try {
    const draft = await request.json();
    const card = await createCard(session.userId, draft);
    return NextResponse.json({ status: 'ok', data: card });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطای نامشخص';
    return NextResponse.json({ status: 'error', message }, { status: 400 });
  }
}
