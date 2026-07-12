import { cardRepository } from '@/repositories';
import { eventBus } from '@/core/events/event-bus';
import { slugify } from '@/lib/utils';
import { DEFAULT_THEME } from '@/core/config/constants';
import { submitIndustryIfUnknown } from '@/services/industry.service';
import type { Card, CardDraft } from '@/types/card';

/**
 * لایه‌ی منطق کسب‌وکار برای کارت‌ها. قانون معماری: هیچ API Route یا UI
 * مستقیم با cardRepository صحبت نمی‌کند — همیشه از این Service عبور
 * می‌کند. اینجا جایی است که قوانین کسب‌وکار (مثل یکتا بودن slug) و
 * انتشار رویداد (برای Analytics/سایر ماژول‌ها) قرار می‌گیرد.
 */

export async function createCard(ownerId: string, draft: Partial<CardDraft>): Promise<Card> {
  const name = draft.name?.trim();
  if (!name) {
    throw new Error('نام کارت الزامی است');
  }

  // ساخت slug و اطمینان از یکتا بودن (نانوایید احتمال تصادف را عملاً صفر می‌کند،
  // اما این چک برای اطمینان کامل نگه داشته شده)
  let slug = slugify(name);
  let attempts = 0;
  while (await cardRepository.slugExists(slug) && attempts < 5) {
    slug = slugify(name);
    attempts += 1;
  }

  const fullDraft: CardDraft = {
    name,
    jobTitle: draft.jobTitle,
    description: draft.description,
    theme: draft.theme ?? DEFAULT_THEME,
    avatarUrl: draft.avatarUrl,
    contacts: draft.contacts ?? [],
    services: draft.services ?? [],
    gallery: draft.gallery ?? [],
    address: draft.address,
    industry: draft.industry,
  };

  const card = await cardRepository.create(ownerId, fullDraft, slug);

  // ثبت صنعت جدید (اگر خارج از فهرست ثابت باشد) در صف بازبینی ادمین —
  // این هرگز نباید ساخت کارت را کند یا شکست دهد، پس خطایش فقط لاگ می‌شود
  if (fullDraft.industry) {
    submitIndustryIfUnknown(fullDraft.industry).catch((err) => {
      console.error('[industry submission error]', err);
    });
  }

  eventBus.emit('card:created', { cardId: card.id });

  return card;
}

export async function updateCard(cardId: string, ownerId: string, patch: Partial<CardDraft>): Promise<void> {
  const existing = await cardRepository.findById(cardId);
  if (!existing) {
    throw new Error('کارت پیدا نشد');
  }
  if (existing.ownerId !== ownerId) {
    throw new Error('اجازه‌ی ویرایش این کارت را ندارید');
  }

  await cardRepository.update(cardId, patch);

  if (patch.industry) {
    submitIndustryIfUnknown(patch.industry).catch((err) => {
      console.error('[industry submission error]', err);
    });
  }

  eventBus.emit('card:updated', { cardId });
}

export async function deleteCard(cardId: string, ownerId: string): Promise<void> {
  const existing = await cardRepository.findById(cardId);
  if (!existing) {
    throw new Error('کارت پیدا نشد');
  }
  if (existing.ownerId !== ownerId) {
    throw new Error('اجازه‌ی حذف این کارت را ندارید');
  }

  await cardRepository.remove(cardId);
  eventBus.emit('card:deleted', { cardId });
}

export async function getCardBySlug(slug: string): Promise<Card | null> {
  return cardRepository.findBySlug(slug);
}

export async function getCardById(id: string): Promise<Card | null> {
  return cardRepository.findById(id);
}

export async function getCardsByOwner(ownerId: string): Promise<Card[]> {
  return cardRepository.findAllByOwnerId(ownerId);
}

// فقط برای Admin Dashboard استفاده شود (بدون فیلتر مالکیت)
export async function getAllCardsForAdmin(): Promise<Card[]> {
  return cardRepository.findAll();
}
