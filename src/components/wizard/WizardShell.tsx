'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardState } from './useWizardState';
import StepAvatar from './steps/StepAvatar';
import StepTheme from './steps/StepTheme';
import { StepName, StepJobTitle, StepDescription } from './steps/StepTextFields';
import StepContacts from './steps/StepContacts';
import StepServices from './steps/StepServices';
import StepGallery from './steps/StepGallery';
import StepAddress from './steps/StepAddress';
import StepIndustry from './steps/StepIndustry';
import CardView from '@/components/card/CardView';
import { apiClient } from '@/lib/api-client';
import type { Card, CardDraft } from '@/types/card';

/**
 * Orchestrator مرکزی Wizard — نسخه‌ی React همان App.Wizard قدیمی.
 * هر مرحله کامپوننت render/validate خودش را دارد؛ این فایل فقط ناوبری،
 * progress bar، و ارسال نهایی را مدیریت می‌کند — دقیقاً همان تفکیک
 * مسئولیتی که در نسخه‌ی Vanilla هم رعایت شده بود.
 */

interface StepDefinition {
  key: string;
  title: string;
  hint: string;
  render: (draft: CardDraft, update: (patch: Partial<CardDraft>) => void) => React.ReactNode;
  validate?: (draft: CardDraft) => string | null; // پیام خطا یا null اگر معتبر بود
}

const STEPS: StepDefinition[] = [
  {
    key: 'avatar',
    title: 'یک تصویر انتخاب کنید',
    hint: 'لوگو یا عکس پروفایل — اختیاری',
    render: (draft, update) => <StepAvatar draft={draft} onUpdate={update} />,
  },
  {
    key: 'theme',
    title: 'رنگ کارت را انتخاب کنید',
    hint: 'یکی از تم‌های آماده را برگزینید',
    render: (draft, update) => <StepTheme draft={draft} onUpdate={update} />,
  },
  {
    key: 'name',
    title: 'نام یا نام شرکت',
    hint: 'این عنوان اصلی کارت شماست',
    render: (draft, update) => <StepName draft={draft} onUpdate={update} />,
    validate: (draft) => (draft.name.trim() ? null : 'وارد کردن نام الزامی است'),
  },
  {
    key: 'jobTitle',
    title: 'سمت شغلی',
    hint: 'زیرعنوان کوتاه — اختیاری',
    render: (draft, update) => <StepJobTitle draft={draft} onUpdate={update} />,
  },
  {
    key: 'industry',
    title: 'حوزه فعالیت',
    hint: 'صنعت یا حوزه‌ی کاری شما — به بهبود آمار و پیشنهادها کمک می‌کند',
    render: (draft, update) => <StepIndustry draft={draft} onUpdate={update} />,
  },
  {
    key: 'description',
    title: 'کمی درباره خودتان بنویسید',
    hint: 'حداکثر ۱۲۰ کلمه',
    render: (draft, update) => <StepDescription draft={draft} onUpdate={update} />,
  },
  {
    key: 'contacts',
    title: 'راه‌های ارتباطی',
    hint: 'تلفن، ایمیل، شبکه‌های اجتماعی و...',
    render: (draft, update) => <StepContacts draft={draft} onUpdate={update} />,
  },
  {
    key: 'services',
    title: 'خدمات شما',
    hint: 'کارهایی که ارائه می‌دهید',
    render: (draft, update) => <StepServices draft={draft} onUpdate={update} />,
  },
  {
    key: 'gallery',
    title: 'نمونه‌کارها',
    hint: 'چند تصویر از نمونه‌کارهایتان اضافه کنید',
    render: (draft, update) => <StepGallery draft={draft} onUpdate={update} />,
  },
  {
    key: 'address',
    title: 'آدرس',
    hint: 'آدرس متنی و مختصات جغرافیایی',
    render: (draft, update) => <StepAddress draft={draft} onUpdate={update} />,
  },
];

// یک Card موقت برای پیش‌نمایش زنده، قبل از اینکه سرور id/slug واقعی بدهد
function draftToPreviewCard(draft: CardDraft): Card {
  return {
    id: 'preview',
    ownerId: 'preview',
    slug: 'preview',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...draft,
  };
}

interface WizardShellProps {
  initialCard?: Card;
}

export default function WizardShell({ initialCard }: WizardShellProps) {
  const router = useRouter();
  const { draft, update, reset, hydrated, isEditMode } = useWizardState(initialCard);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  function handleNext() {
    const validationError = currentStep.validate?.(draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    if (isLastStep) {
      void handleSubmit();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function handlePrev() {
    setError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      if (isEditMode && initialCard) {
        await apiClient.patch(`/api/cards/${initialCard.id}`, draft);
        router.push(`/card/${initialCard.slug}`);
      } else {
        const card = await apiClient.post<Card>('/api/cards', draft);
        reset();
        router.push(`/card/${card.slug}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ذخیره‌ی کارت ناموفق بود');
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    // جلوگیری از فلش محتوای خالی قبل از بارگذاری پیش‌نویس از localStorage
    return null;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="wizard-grid">
      <section style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', border: '1px solid #E4E7EC' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 8 }}>
            <span>مرحله {stepIndex + 1} از {STEPS.length}</span>
            <span>{currentStep.title}</span>
          </div>
          <div style={{ height: 6, background: '#E4E7EC', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${((stepIndex + 1) / STEPS.length) * 100}%`,
                background: 'linear-gradient(90deg, #5B5FEF, #8B5CF6)',
                transition: 'width 300ms ease',
              }}
            />
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>{currentStep.title}</h2>
        <p style={{ fontSize: 13, color: '#8A8F98', margin: '0 0 20px' }}>{currentStep.hint}</p>

        <div>{currentStep.render(draft, update)}</div>

        {error && <p style={{ color: '#E0554F', fontSize: 13, marginTop: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 14, borderTop: '1px solid #E4E7EC' }}>
          <button
            type="button"
            onClick={handlePrev}
            disabled={stepIndex === 0}
            style={{
              padding: '12px 20px',
              borderRadius: 10,
              border: 'none',
              background: '#F1F2F6',
              color: '#374151',
              fontWeight: 600,
              fontSize: 14,
              opacity: stepIndex === 0 ? 0.5 : 1,
            }}
          >
            قبلی
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: 10,
              border: 'none',
              background: '#5B5FEF',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {submitting ? 'در حال ذخیره...' : isLastStep ? (isEditMode ? 'ذخیره‌ی تغییرات' : 'پایان و ساخت کارت') : 'بعدی'}
          </button>
        </div>
      </section>

      <section style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <CardView card={draftToPreviewCard(draft)} />
        </div>
      </section>
    </div>
  );
}
