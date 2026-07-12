import type { DynamicQrCode, DynamicQrCodeDraft, QrScanEvent } from '@/types/qr';

/**
 * قرارداد لایه‌ی داده برای QR های پویا — دقیقاً همان الگوی
 * CardRepository/UserRepository. پیاده‌سازی فعلی Google Sheets خواهد
 * بود؛ در فاز ۵ با همان composition root سوییچ می‌شود.
 */
export interface QrCodeRepository {
  findByShortCode(shortCode: string): Promise<DynamicQrCode | null>;
  findById(id: string): Promise<DynamicQrCode | null>;
  findAllByOwnerId(ownerId: string): Promise<DynamicQrCode[]>;
  create(ownerId: string, draft: DynamicQrCodeDraft, shortCode: string): Promise<DynamicQrCode>;
  update(id: string, patch: Partial<DynamicQrCodeDraft & { status: DynamicQrCode['status'] }>): Promise<void>;
  remove(id: string): Promise<void>;
  incrementScanCount(id: string): Promise<void>;
  shortCodeExists(shortCode: string): Promise<boolean>;

  recordScan(event: QrScanEvent): Promise<void>;
  findScansByQrCodeId(qrCodeId: string): Promise<QrScanEvent[]>;
}
