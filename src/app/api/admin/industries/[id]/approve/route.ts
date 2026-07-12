import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/auth/session';
import { userRepository } from '@/repositories';
import { approveIndustry } from '@/services/industry.service';

/**
 * POST /api/admin/industries/:id/approve
 * فقط ادمین می‌تواند صنعت در‌انتظار را تایید کند.
 */

interface RouteParams {
  params: { id: string };
}

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ status: 'error', message: 'ابتدا وارد شوید' }, { status: 401 });
  }

  const currentUser = await userRepository.findById(session.userId);
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ status: 'error', message: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  try {
    await approveIndustry(params.id);
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطای نامشخص';
    return NextResponse.json({ status: 'error', message }, { status: 400 });
  }
}
