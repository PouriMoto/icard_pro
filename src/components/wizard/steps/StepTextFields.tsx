'use client';

import type { CardDraft } from '@/types/card';
import { LIMITS } from '@/core/config/constants';
import { countWords, limitWords } from '@/lib/utils';

/**
 * سه مرحله‌ی ساده‌ی متنی (نام، سمت شغلی، توضیحات) در یک فایل گروه‌بندی
 * شده‌اند چون هرکدام فقط یک input/textarea هستند — این نقض اصل «بدون
 * تابع غول‌پیکر renderEverything» نیست، چون هرکدام کامپوننت export شده‌ی
 * کاملاً مستقل با validate/render خودش است؛ فقط در یک فایل کنار هم
 * قرار گرفته‌اند برای مدیریت بهتر تعداد فایل‌های کوچک.
 */

interface FieldStepProps {
  draft: CardDraft;
  onUpdate: (patch: Partial<CardDraft>) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: '1.5px solid #E4E7EC',
  fontSize: 14,
  background: '#FAFBFC',
};

export function StepName({ draft, onUpdate }: FieldStepProps) {
  return (
    <input
      type="text"
      placeholder="مثلاً: سارا محمدی"
      value={draft.name}
      onChange={(e) => onUpdate({ name: e.target.value })}
      style={inputStyle}
    />
  );
}

export function StepJobTitle({ draft, onUpdate }: FieldStepProps) {
  return (
    <input
      type="text"
      placeholder="مثلاً: طراح محصول"
      value={draft.jobTitle ?? ''}
      onChange={(e) => onUpdate({ jobTitle: e.target.value })}
      style={inputStyle}
    />
  );
}

export function StepDescription({ draft, onUpdate }: FieldStepProps) {
  const words = countWords(draft.description ?? '');

  function handleChange(value: string) {
    const trimmed = countWords(value) > LIMITS.DESCRIPTION_MAX_WORDS
      ? limitWords(value, LIMITS.DESCRIPTION_MAX_WORDS)
      : value;
    onUpdate({ description: trimmed });
  }

  return (
    <div>
      <textarea
        placeholder="چند جمله کوتاه بنویسید..."
        value={draft.description ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
      />
      <div
        style={{
          fontSize: 12,
          color: words >= LIMITS.DESCRIPTION_MAX_WORDS ? '#E0554F' : '#9CA3AF',
          textAlign: 'left',
          marginTop: 4,
        }}
      >
        {words} از {LIMITS.DESCRIPTION_MAX_WORDS} کلمه
      </div>
    </div>
  );
}
