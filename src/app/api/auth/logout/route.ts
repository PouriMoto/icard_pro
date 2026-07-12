import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/auth/session';

/**
 * POST /api/auth/logout
 * کوکی جلسه را پاک می‌کند. نیازی به بدنه‌ی درخواست نیست.
 */
export async function POST() {
  clearSessionCookie();
  return NextResponse.json({ status: 'ok' });
}
