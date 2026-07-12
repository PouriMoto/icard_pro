import type { Card, CardDraft } from '@/types/card';

/**
 * قرارداد (interface) لایه‌ی داده برای کارت‌ها. هیچ Service یا UI مستقیم
 * نباید بداند داده از کجا می‌آید (Google Sheets، Supabase، هرچیز دیگر) —
 * فقط با همین متدها کار می‌کند. این یعنی فاز ۵ (مهاجرت به Supabase) فقط
 * نیاز به یک پیاده‌سازی جدید از همین اینترفیس دارد.
 */
export interface CardRepository {
  findBySlug(slug: string): Promise<Card | null>;
  findById(id: string): Promise<Card | null>;
  findAllByOwnerId(ownerId: string): Promise<Card[]>;
  findAll(): Promise<Card[]>; // برای Admin Dashboard
  create(ownerId: string, draft: CardDraft, slug: string): Promise<Card>;
  update(id: string, patch: Partial<CardDraft>): Promise<void>;
  remove(id: string): Promise<void>;
  slugExists(slug: string): Promise<boolean>;
}
