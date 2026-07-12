import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/auth/session';
import { updateQrCode, deleteQrCode } from '@/services/qr.service';

/**
 * PATCH  /api/qr-codes/:id   -> ویرایش (تغییر مقصد، برچسب، وضعیت و...)
 * DELETE /api/qr-codes/:id   -> حذف
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
    await updateQrCode(params.id, session.userId, patch);
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
    await deleteQrCode(params.id, session.userId);
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطای نامشخص';
    return NextResponse.json({ status: 'error', message }, { status: 400 });
  }
}
