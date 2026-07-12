import { nanoid } from 'nanoid';
import type { CardRepository } from '@/repositories/interfaces/card-repository.interface';
import type { Card, CardDraft } from '@/types/card';
import { sheetGet, sheetPost } from './google-sheets-client';

/**
 * پیاده‌سازی CardRepository روی Google Sheets.
 * قاعده‌ی مهم: ستون‌های شیت snake_case هستند (طبق Code.gs) اما مدل
 * TypeScript ما camelCase است — تمام تبدیل اینجا انجام می‌شود تا بقیه‌ی
 * پروژه هرگز مستقیم با فرمت خام شیت درگیر نشود.
 */

// شکل خام یک ردیف کارت همان‌طور که از Google Sheet برمی‌گردد
interface RawCardRow {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  job_title?: string;
  description?: string;
  theme: string;
  avatar_url?: string;
  contacts_json?: string;
  services_json?: string;
  gallery_json?: string;
  address_text?: string;
  address_lat?: string;
  address_lng?: string;
  industry?: string;
  created_at: string;
  updated_at: string;
  status: string;
}

function safeJsonParse<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function rowToCard(row: RawCardRow): Card {
  return {
    id: row.id,
    ownerId: row.owner_id,
    slug: row.slug,
    name: row.name,
    jobTitle: row.job_title || undefined,
    description: row.description || undefined,
    theme: (row.theme || 'solid-indigo') as Card['theme'],
    avatarUrl: row.avatar_url || undefined,
    contacts: safeJsonParse(row.contacts_json, []),
    services: safeJsonParse(row.services_json, []),
    gallery: safeJsonParse(row.gallery_json, []),
    address: row.address_text
      ? { text: row.address_text, lat: row.address_lat, lng: row.address_lng }
      : undefined,
    industry: row.industry || undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    status: (row.status || 'active') as Card['status'],
  };
}

function draftToPayload(draft: Partial<CardDraft>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (draft.name !== undefined) payload.name = draft.name;
  if (draft.jobTitle !== undefined) payload.job_title = draft.jobTitle;
  if (draft.description !== undefined) payload.description = draft.description;
  if (draft.theme !== undefined) payload.theme = draft.theme;
  if (draft.avatarUrl !== undefined) payload.avatar_url = draft.avatarUrl;
  if (draft.contacts !== undefined) payload.contacts_json = JSON.stringify(draft.contacts);
  if (draft.services !== undefined) payload.services_json = JSON.stringify(draft.services);
  if (draft.gallery !== undefined) payload.gallery_json = JSON.stringify(draft.gallery);
  if (draft.industry !== undefined) payload.industry = draft.industry;
  if (draft.address !== undefined) {
    payload.address_text = draft.address?.text ?? '';
    payload.address_lat = draft.address?.lat ?? '';
    payload.address_lng = draft.address?.lng ?? '';
  }
  return payload;
}

export class GoogleSheetsCardRepository implements CardRepository {
  async findBySlug(slug: string): Promise<Card | null> {
    const rows = await sheetGet<RawCardRow[]>('cards', { slug });
    const row = rows[0];
    return row ? rowToCard(row) : null;
  }

  async findById(id: string): Promise<Card | null> {
    // Google Apps Script فعلی فیلتر id مستقیم ندارد؛ همه را می‌گیریم و فیلتر می‌کنیم.
    // در مقیاس بالاتر (فاز تثبیت) این باید به فیلتر سمت سرور تبدیل شود.
    const rows = await sheetGet<RawCardRow[]>('cards', {});
    const row = rows.find((r) => r.id === id);
    return row ? rowToCard(row) : null;
  }

  async findAllByOwnerId(ownerId: string): Promise<Card[]> {
    const rows = await sheetGet<RawCardRow[]>('cards', { owner_id: ownerId });
    return rows.map(rowToCard);
  }

  async findAll(): Promise<Card[]> {
    const rows = await sheetGet<RawCardRow[]>('cards', {});
    return rows.map(rowToCard);
  }

  async create(ownerId: string, draft: CardDraft, slug: string): Promise<Card> {
    const now = new Date().toISOString();
    const id = nanoid(12);

    const payload = {
      id,
      owner_id: ownerId,
      slug,
      name: draft.name,
      job_title: draft.jobTitle ?? '',
      description: draft.description ?? '',
      theme: draft.theme,
      avatar_url: draft.avatarUrl ?? '',
      contacts_json: JSON.stringify(draft.contacts ?? []),
      services_json: JSON.stringify(draft.services ?? []),
      gallery_json: JSON.stringify(draft.gallery ?? []),
      address_text: draft.address?.text ?? '',
      address_lat: draft.address?.lat ?? '',
      address_lng: draft.address?.lng ?? '',
      industry: draft.industry ?? '',
      created_at: now,
      updated_at: now,
      status: 'active',
    };

    await sheetPost('add_card', payload);

    return {
      id,
      ownerId,
      slug,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      ...draft,
    };
  }

  async update(id: string, patch: Partial<CardDraft>): Promise<void> {
    await sheetPost('update_card', { id, patch: draftToPayload(patch) });
  }

  async remove(id: string): Promise<void> {
    await sheetPost('remove_card', { id });
  }

  async slugExists(slug: string): Promise<boolean> {
    const existing = await this.findBySlug(slug);
    return existing !== null;
  }
}
