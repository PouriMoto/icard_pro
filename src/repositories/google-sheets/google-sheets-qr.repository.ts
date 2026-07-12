import { nanoid } from 'nanoid';
import type { QrCodeRepository } from '@/repositories/interfaces/qr-repository.interface';
import type { DynamicQrCode, DynamicQrCodeDraft, QrScanEvent } from '@/types/qr';
import { sheetGet, sheetPost } from './google-sheets-client';

/**
 * پیاده‌سازی QrCodeRepository روی Google Sheets — همان الگوی دقیق
 * GoogleSheetsCardRepository (نگاشت snake_case شیت به camelCase تایپ).
 */

interface RawQrCodeRow {
  id: string;
  owner_id: string;
  short_code: string;
  label: string;
  target_card_id: string;
  campaign?: string;
  source?: string;
  status: string;
  scan_count: number | string;
  created_at: string;
  updated_at: string;
}

interface RawQrScanRow {
  scan_id: string;
  qr_code_id: string;
  card_id: string;
  timestamp: string;
  device?: string;
  browser?: string;
  country?: string;
  city?: string;
  referrer?: string;
}

function rowToQrCode(row: RawQrCodeRow): DynamicQrCode {
  return {
    id: row.id,
    ownerId: row.owner_id,
    shortCode: row.short_code,
    label: row.label,
    targetCardId: row.target_card_id,
    campaign: row.campaign || undefined,
    source: row.source || undefined,
    status: (row.status === 'paused' ? 'paused' : 'active') as DynamicQrCode['status'],
    scanCount: Number(row.scan_count) || 0,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function rowToScanEvent(row: RawQrScanRow): QrScanEvent {
  return {
    scanId: row.scan_id,
    qrCodeId: row.qr_code_id,
    cardId: row.card_id,
    timestamp: String(row.timestamp),
    device: row.device || undefined,
    browser: row.browser || undefined,
    country: row.country || undefined,
    city: row.city || undefined,
    referrer: row.referrer || undefined,
  };
}

export class GoogleSheetsQrCodeRepository implements QrCodeRepository {
  async findByShortCode(shortCode: string): Promise<DynamicQrCode | null> {
    const rows = await sheetGet<RawQrCodeRow[]>('qrcodes', { short_code: shortCode });
    const row = rows[0];
    return row ? rowToQrCode(row) : null;
  }

  async findById(id: string): Promise<DynamicQrCode | null> {
    const rows = await sheetGet<RawQrCodeRow[]>('qrcodes', {});
    const row = rows.find((r) => r.id === id);
    return row ? rowToQrCode(row) : null;
  }

  async findAllByOwnerId(ownerId: string): Promise<DynamicQrCode[]> {
    const rows = await sheetGet<RawQrCodeRow[]>('qrcodes', { owner_id: ownerId });
    return rows.map(rowToQrCode);
  }

  async create(ownerId: string, draft: DynamicQrCodeDraft, shortCode: string): Promise<DynamicQrCode> {
    const now = new Date().toISOString();
    const id = nanoid(12);

    await sheetPost('add_qr_code', {
      id,
      owner_id: ownerId,
      short_code: shortCode,
      label: draft.label,
      target_card_id: draft.targetCardId,
      campaign: draft.campaign ?? '',
      source: draft.source ?? '',
      status: 'active',
      scan_count: 0,
      created_at: now,
      updated_at: now,
    });

    return {
      id,
      ownerId,
      shortCode,
      status: 'active',
      scanCount: 0,
      createdAt: now,
      updatedAt: now,
      ...draft,
    };
  }

  async update(
    id: string,
    patch: Partial<DynamicQrCodeDraft & { status: DynamicQrCode['status'] }>
  ): Promise<void> {
    const payload: Record<string, unknown> = {};
    if (patch.label !== undefined) payload.label = patch.label;
    if (patch.targetCardId !== undefined) payload.target_card_id = patch.targetCardId;
    if (patch.campaign !== undefined) payload.campaign = patch.campaign;
    if (patch.source !== undefined) payload.source = patch.source;
    if (patch.status !== undefined) payload.status = patch.status;

    await sheetPost('update_qr_code', { id, patch: payload });
  }

  async remove(id: string): Promise<void> {
    await sheetPost('remove_qr_code', { id });
  }

  async incrementScanCount(id: string): Promise<void> {
    await sheetPost('increment_qr_scan_count', { id });
  }

  async shortCodeExists(shortCode: string): Promise<boolean> {
    const existing = await this.findByShortCode(shortCode);
    return existing !== null;
  }

  async recordScan(event: QrScanEvent): Promise<void> {
    await sheetPost('add_qr_scan', {
      scan_id: event.scanId,
      qr_code_id: event.qrCodeId,
      card_id: event.cardId,
      timestamp: event.timestamp,
      device: event.device ?? '',
      browser: event.browser ?? '',
      country: event.country ?? '',
      city: event.city ?? '',
      referrer: event.referrer ?? '',
    });
  }

  async findScansByQrCodeId(qrCodeId: string): Promise<QrScanEvent[]> {
    const rows = await sheetGet<RawQrScanRow[]>('qrscans', { qr_code_id: qrCodeId });
    return rows.map(rowToScanEvent);
  }
}
