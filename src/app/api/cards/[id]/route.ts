import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/auth/session';
import { updateCard, deleteCard } from '@/services/card.service';

/**
 * PATCH  /api/cards/:id   -> ویرایش کارت (فقط مالک)
 * DELETE /api/cards/:id   -> حذف کارت (فقط مالک)
 *
 * چک مالکیت واقعی داخل card.service.ts انجام می‌شود (ownerId مقایسه
 * می‌شود)؛ اینجا فقط مطمئن می‌شویم اصلاً یک جلسه‌ی معتبر وجود دارد.
 */

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ status: 'error', message: 'ابتدا وارد شوید' }, { status: 401 });
  }

  try {
    const patch = await request.json();
    await updateCard(params.id, session.userId, patch);
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطای نامشخص';
    return NextResponse.json({ status: 'error', message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ status: 'error', message: 'ابتدا وارد شوید' }, { status: 401 });
  }

  try {
    await deleteCard(params.id, session.userId);
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطای نامشخص';
    return NextResponse.json({ status: 'error', message }, { status: 400 });
  }
}
