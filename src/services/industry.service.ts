import { industryRepository } from '@/repositories';
import { CURATED_INDUSTRIES } from '@/core/config/industries';
import type { Industry } from '@/types/industry';

/**
 * سرویس Industry Taxonomy. اگر کاربر نامی وارد کند که در فهرست ثابت
 * (CURATED_INDUSTRIES) نیست، به‌عنوان یک رکورد «در انتظار تایید» ثبت
 * می‌شود — بدون اینکه جلوی ذخیره‌شدن کارت را بگیرد (کاربر همچنان
 * می‌تواند از مقدار دلخواهش استفاده کند، فقط برای آمار/فهرست آینده
 * بازبینی می‌شود).
 */

// اگر نام دقیقاً در فهرست ثابت باشد، نیازی به ثبت در جدول نیست
function isCuratedIndustry(name: string): boolean {
  return CURATED_INDUSTRIES.some((item) => item.trim() === name.trim());
}

export async function submitIndustryIfUnknown(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed || isCuratedIndustry(trimmed)) return;

  const existing = await industryRepository.findByName(trimmed);
  if (existing) return; // قبلاً (چه pending چه approved) ثبت شده

  await industryRepository.create(trimmed);
}

export async function getPendingIndustries(): Promise<Industry[]> {
  return industryRepository.findPending();
}

export async function approveIndustry(id: string): Promise<void> {
  await industryRepository.approve(id);
}
