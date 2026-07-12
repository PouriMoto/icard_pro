import type { ContactType, ThemeId } from '@/types/card';

/**
 * تمام مقادیر ثابت پروژه اینجا جمع می‌شوند — طبق الزام «بدون هاردکود
 * پخش‌شده در کل کد». هر جزء دیگر پروژه (UI، Service) این‌ها را import
 * می‌کند، هرگز رنگ/آیکن/عدد را خودش تکرار نمی‌کند.
 */

export interface ThemeDefinition {
  id: ThemeId;
  kind: 'solid' | 'gradient';
  css: string;
  base: string; // رنگ پایه برای محاسبه‌ی کنتراست (اولین رنگ گرادیانت)
}

export const THEMES: ThemeDefinition[] = [
  { id: 'solid-indigo', kind: 'solid', css: '#5B5FEF', base: '#5B5FEF' },
  { id: 'solid-teal', kind: 'solid', css: '#0F9D8A', base: '#0F9D8A' },
  { id: 'solid-rose', kind: 'solid', css: '#E0557E', base: '#E0557E' },
  { id: 'solid-charcoal', kind: 'solid', css: '#22262E', base: '#22262E' },
  { id: 'grad-sunset', kind: 'gradient', css: 'linear-gradient(135deg,#FF7A5C,#E0557E)', base: '#FF7A5C' },
  { id: 'grad-ocean', kind: 'gradient', css: 'linear-gradient(135deg,#3B82F6,#0F9D8A)', base: '#3B82F6' },
  { id: 'grad-violet', kind: 'gradient', css: 'linear-gradient(135deg,#8B5CF6,#5B5FEF)', base: '#8B5CF6' },
  { id: 'grad-forest', kind: 'gradient', css: 'linear-gradient(135deg,#0F9D8A,#22262E)', base: '#0F9D8A' },
];

export const DEFAULT_THEME: ThemeId = 'solid-indigo';

export interface ContactTypeMeta {
  label: string;
  placeholder: string;
  kind: 'tel' | 'email' | 'url';
}

// شامل شبکه‌های اجتماعی بین‌المللی + پیام‌رسان‌های داخلی (طبق درخواست فاز ۱)
export const CONTACT_TYPES: Record<ContactType, ContactTypeMeta> = {
  phone: { label: 'تلفن', placeholder: '021xxxxxxxx', kind: 'tel' },
  mobile: { label: 'موبایل', placeholder: '09xxxxxxxxx', kind: 'tel' },
  email: { label: 'ایمیل', placeholder: 'name@example.com', kind: 'email' },
  website: { label: 'وبسایت', placeholder: 'https://example.com', kind: 'url' },
  instagram: { label: 'اینستاگرام', placeholder: '@username', kind: 'url' },
  telegram: { label: 'تلگرام', placeholder: '@username', kind: 'url' },
  whatsapp: { label: 'واتساپ', placeholder: '09xxxxxxxxx', kind: 'url' },
  linkedin: { label: 'لینکدین', placeholder: 'لینک پروفایل', kind: 'url' },
  twitter: { label: 'توییتر/X', placeholder: '@username', kind: 'url' },
  facebook: { label: 'فیسبوک', placeholder: 'لینک پروفایل', kind: 'url' },
  youtube: { label: 'یوتیوب', placeholder: 'لینک کانال', kind: 'url' },
  github: { label: 'گیت‌هاب', placeholder: '@username', kind: 'url' },
  bale: { label: 'بله', placeholder: '@username', kind: 'url' },
  eitaa: { label: 'ایتا', placeholder: '@username', kind: 'url' },
  rubika: { label: 'روبیکا', placeholder: '@username', kind: 'url' },
  soroush: { label: 'سروش پلاس', placeholder: '@username', kind: 'url' },
};

export const LIMITS = {
  AVATAR_MAX_BYTES: 300 * 1024,
  AVATAR_MAX_DIM: 500,
  GALLERY_MAX_BYTES: 400 * 1024,
  GALLERY_MAX_DIM: 1200,
  GALLERY_MAX_ITEMS: 9,
  DESCRIPTION_MAX_WORDS: 120,
  MAX_CONTACTS: 14,
  MAX_SERVICES: 8,
} as const;

export const SERVICE_ICON_KEYS = [
  'website', 'phone', 'email', 'checkmark', 'save', 'share', 'qr', 'address',
] as const;

// نام کوکی سشن کاربر
export const SESSION_COOKIE_NAME = 'icard_session';

// طول عمر سشن (به ثانیه) — ۳۰ روز
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
