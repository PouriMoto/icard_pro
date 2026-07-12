/**
 * تایپ‌های مشترک دامنه‌ی «کارت ویزیت». این فایل منبع واحد حقیقت (single
 * source of truth) برای شکل داده‌ی کارت است — هم UI، هم Service، هم
 * Repository از همین تایپ‌ها استفاده می‌کنند تا هرگز ناهماهنگ نشوند.
 */

export type ThemeId =
  | 'solid-indigo'
  | 'solid-teal'
  | 'solid-rose'
  | 'solid-charcoal'
  | 'grad-sunset'
  | 'grad-ocean'
  | 'grad-violet'
  | 'grad-forest';

export type ContactType =
  | 'phone'
  | 'mobile'
  | 'email'
  | 'website'
  | 'instagram'
  | 'telegram'
  | 'whatsapp'
  | 'linkedin'
  | 'twitter'
  | 'facebook'
  | 'youtube'
  | 'github'
  | 'bale'
  | 'eitaa'
  | 'rubika'
  | 'soroush';

export interface Contact {
  id: string;
  type: ContactType;
  value: string;
}

export interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  desc?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  // شناسه‌ی Cloudinary برای امکان حذف بعدی از CDN
  cloudinaryPublicId?: string;
}

export interface CardAddress {
  text: string;
  lat?: string;
  lng?: string;
}

export type CardStatus = 'active' | 'draft' | 'archived';

export interface Card {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  jobTitle?: string;
  description?: string;
  theme: ThemeId;
  avatarUrl?: string;
  avatarCloudinaryPublicId?: string;
  contacts: Contact[];
  services: ServiceItem[];
  gallery: GalleryItem[];
  address?: CardAddress;
  industry?: string;
  createdAt: string;
  updatedAt: string;
  status: CardStatus;
}

// شکل داده‌ای که هنگام ساخت کارت جدید نیاز داریم (بدون id/تاریخ‌ها/slug که سرور می‌سازد)
export type CardDraft = Omit<Card, 'id' | 'ownerId' | 'slug' | 'createdAt' | 'updatedAt' | 'status'>;

export interface User {
  id: string;
  phone?: string;
  telegramId?: string;
  name?: string;
  createdAt: string;
  plan: 'free' | 'pro';
  phoneVerified: boolean;
  role: 'user' | 'admin';
}

export interface AnalyticsEvent {
  eventId: string;
  cardId: string;
  userId?: string;
  visitorId: string;
  sessionId: string;
  eventName: AnalyticsEventName;
  params?: Record<string, unknown>;
  timestamp: string;
  device?: string;
  browser?: string;
  country?: string;
  city?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
}

export type AnalyticsEventName =
  | 'card_open'
  | 'card_close'
  | 'phone_click'
  | 'email_click'
  | 'website_click'
  | 'portfolio_open'
  | 'share_click'
  | 'copy_link'
  | 'download_vcf'
  | 'qr_scan'
  | 'scroll_depth'
  | 'time_on_page'
  | 'button_click';
