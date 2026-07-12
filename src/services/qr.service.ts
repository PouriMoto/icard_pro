import { nanoid } from 'nanoid';
import { qrCodeRepository, cardRepository } from '@/repositories';
import { generateScanId } from '@/lib/utils';
import type { DynamicQrCode, DynamicQrCodeDraft, QrScanEvent } from '@/types/qr';

/**
 * منطق کسب‌وکار QR پویا. مثل card.service.ts، هیچ API Route یا UI
 * مستقیم با qrCodeRepository صحبت نمی‌کند.
 */

const SHORT_CODE_LENGTH = 7;

async function generateUniqueShortCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = nanoid(SHORT_CODE_LENGTH).toLowerCase();
    // eslint-disable-next-line no-await-in-loop
    const exists = await qrCodeRepository.shortCodeExists(code);
    if (!exists) return code;
  }
  throw new Error('تولید کد کوتاه یکتا ناموفق بود، دوباره تلاش کنید');
}

async function assertTargetCardOwnedBy(targetCardId: string, ownerId: string): Promise<void> {
  const targetCard = await cardRepository.findById(targetCardId);
  if (!targetCard || targetCard.ownerId !== ownerId) {
    throw new Error('کارت مقصد معتبر نیست');
  }
}

export async function createQrCode(ownerId: string, draft: DynamicQrCodeDraft): Promise<DynamicQrCode> {
  if (!draft.label?.trim()) {
    throw new Error('عنوان QR الزامی است');
  }
  if (!draft.targetCardId) {
    throw new Error('انتخاب کارت مقصد الزامی است');
  }

  // اطمینان از این‌که کارت مقصد واقعاً متعلق به همین کاربر است — جلوگیری
  // از ساخت QR که به کارت شخص دیگری اشاره کند
  await assertTargetCardOwnedBy(draft.targetCardId, ownerId);

  const shortCode = await generateUniqueShortCode();
  return qrCodeRepository.create(ownerId, draft, shortCode);
}

export async function updateQrCode(
  id: string,
  ownerId: string,
  patch: Partial<DynamicQrCodeDraft & { status: DynamicQrCode['status'] }>
): Promise<void> {
  const existing = await qrCodeRepository.findById(id);
  if (!existing) {
    throw new Error('QR پیدا نشد');
  }
  if (existing.ownerId !== ownerId) {
    throw new Error('اجازه‌ی ویرایش این QR را ندارید');
  }
  if (patch.targetCardId) {
    await assertTargetCardOwnedBy(patch.targetCardId, ownerId);
  }

  await qrCodeRepository.update(id, patch);
}

export async function deleteQrCode(id: string, ownerId: string): Promise<void> {
  const existing = await qrCodeRepository.findById(id);
  if (!existing) {
    throw new Error('QR پیدا نشد');
  }
  if (existing.ownerId !== ownerId) {
    throw new Error('اجازه‌ی حذف این QR را ندارید');
  }
  await qrCodeRepository.remove(id);
}

export async function getQrCodesByOwner(ownerId: string): Promise<DynamicQrCode[]> {
  return qrCodeRepository.findAllByOwnerId(ownerId);
}

export async function getQrCodeById(id: string): Promise<DynamicQrCode | null> {
  return qrCodeRepository.findById(id);
}

export async function getQrCodeByShortCode(shortCode: string): Promise<DynamicQrCode | null> {
  return qrCodeRepository.findByShortCode(shortCode);
}

export interface RecordScanInput {
  device?: string;
  browser?: string;
  referrer?: string;
}

export async function recordScan(qrCode: DynamicQrCode, details: RecordScanInput): Promise<void> {
  const event: QrScanEvent = {
    scanId: generateScanId(),
    qrCodeId: qrCode.id,
    cardId: qrCode.targetCardId,
    timestamp: new Date().toISOString(),
    ...details,
  };
  await qrCodeRepository.recordScan(event);
  await qrCodeRepository.incrementScanCount(qrCode.id);
}

export async function getScansForQrCode(qrCodeId: string): Promise<QrScanEvent[]> {
  return qrCodeRepository.findScansByQrCodeId(qrCodeId);
}
