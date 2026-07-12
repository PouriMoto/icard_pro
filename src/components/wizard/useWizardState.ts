'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Card, CardDraft } from '@/types/card';
import { DEFAULT_THEME } from '@/core/config/constants';

/**
 * هوک مدیریت وضعیت فرم Wizard — نسخه‌ی React همان App.State قدیمی.
 * تفاوت اصلی: به‌جای Event Bus برای اطلاع‌رسانی تغییرات، از useState
 * ری‌اکت استفاده می‌شود که خودش re-render را مدیریت می‌کند؛ Event Bus
 * پروژه برای رویدادهای واقعاً cross-module (مثل analytics) نگه داشته
 * شده، نه برای state محلی یک فرم.
 *
 * دو حالت کاری:
 *  - ساخت کارت جدید: پیش‌نویس در localStorage ذخیره می‌شود (تا با
 *    رفرش صفحه از دست نرود)
 *  - ویرایش کارت موجود (وقتی seedCard داده شود): از localStorage
 *    استفاده نمی‌شود — چون این می‌تواند با پیش‌نویس «کارت جدید» تداخل
 *    ایجاد کند؛ فرم مستقیم از داده‌ی کارت موجود پر می‌شود.
 */

const DRAFT_STORAGE_KEY = 'icard_wizard_draft_v1';

function emptyDraft(): CardDraft {
  return {
    name: '',
    jobTitle: '',
    description: '',
    theme: DEFAULT_THEME,
    avatarUrl: undefined,
    contacts: [],
    services: [],
    gallery: [],
    address: { text: '', lat: '', lng: '' },
    industry: '',
  };
}

function cardToDraft(card: Card): CardDraft {
  const { id, ownerId, slug, createdAt, updatedAt, status, ...draft } = card;
  return draft;
}

function loadDraft(): CardDraft {
  if (typeof window === 'undefined') return emptyDraft();
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return emptyDraft();
    return { ...emptyDraft(), ...JSON.parse(raw) };
  } catch {
    return emptyDraft();
  }
}

export function useWizardState(seedCard?: Card) {
  const isEditMode = Boolean(seedCard);
  const [draft, setDraft] = useState<CardDraft>(() => (seedCard ? cardToDraft(seedCard) : emptyDraft()));
  // در حالت ویرایش نیازی به بارگذاری async از localStorage نیست، پس از همان ابتدا hydrated است
  const [hydrated, setHydrated] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) return;
    setDraft(loadDraft());
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated || isEditMode) return;
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // خطای quota یا مشابه — نادیده گرفته می‌شود، چون ذخیره‌ی پیش‌نویس
      // یک قابلیت کمکی است نه حیاتی
    }
  }, [draft, hydrated, isEditMode]);

  const update = useCallback((patch: Partial<CardDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setDraft(emptyDraft());
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // نادیده گرفته می‌شود
    }
  }, []);

  return { draft, update, reset, hydrated, isEditMode };
}
