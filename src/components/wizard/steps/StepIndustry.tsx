'use client';

import type { CardDraft } from '@/types/card';
import { CURATED_INDUSTRIES } from '@/core/config/industries';

/**
 * مرحله‌ی انتخاب صنعت — با datalist بومی HTML به‌عنوان autocomplete
 * (بدون کامپوننت سفارشی سنگین، طبق اصل «بدون over-engineering» پروژه).
 * اگر کاربر مقداری خارج از فهرست ثابت بنویسد، در سرور (هنگام ساخت/ویرایش
 * کارت) به‌عنوان «صنعت جدید در انتظار تایید» ثبت می‌شود.
 */

interface StepIndustryProps {
  draft: CardDraft;
  onUpdate: (patch: Partial<CardDraft>) => void;
}

export default function StepIndustry({ draft, onUpdate }: StepIndustryProps) {
  return (
    <div>
      <input
        type="text"
        list="industries-datalist"
        placeholder="مثلاً: طراحی گرافیک"
        value={draft.industry ?? ''}
        onChange={(e) => onUpdate({ industry: e.target.value })}
        style={{
          width: '100%',
          padding: '11px 14px',
          borderRadius: 10,
          border: '1.5px solid #E4E7EC',
          fontSize: 14,
          background: '#FAFBFC',
        }}
      />
      <datalist id="industries-datalist">
        {CURATED_INDUSTRIES.map((industry) => (
          <option key={industry} value={industry} />
        ))}
      </datalist>
      <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 6 }}>
        می‌توانید از فهرست انتخاب کنید یا مقدار دلخواه خود را بنویسید.
      </p>
    </div>
  );
}
