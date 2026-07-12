import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/auth/session';
import { createQrCode, getQrCodesByOwner } from '@/services/qr.service';

/**
 * GET /api/qr-codes    -> لیست QR های کاربر جاری
 * POST /api/qr-codes   -> ساخت QR پویا جدید
 */

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ status: 'error', message: 'ابتدا وارد شوید' }, { status: 401 });
  }

  const qrCodes = await getQrCodesByOwner(session.userId);
  return NextResponse.json({ status: 'ok', data: qrCodes });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ status: 'error', message: 'ابتدا وارد شوید' }, { status: 401 });
  }

  try {
    const draft = await request.json();
    const qrCode = await createQrCode(session.userId, draft);
    return NextResponse.json({ status: 'ok', data: qrCode });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطای نامشخص';
    return NextResponse.json({ status: 'error', message }, { status: 400 });
  }
}
