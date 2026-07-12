import { analyticsRepository } from '@/repositories';
import { eventBus } from '@/core/events/event-bus';
import { generateEventId } from '@/lib/utils';
import type { AnalyticsEvent, AnalyticsEventName } from '@/types/card';

/**
 * سرویس Analytics — ثبت خام رویداد (فاز ۰/۱) + تجمیع آمار برای Dashboard
 * (فاز ۳). تجمیع فعلاً در حافظه انجام می‌شود (همه‌ی رویدادهای یک کارت
 * خوانده و پردازش می‌شوند) — برای مقیاس MVP (تا ~۱۰K کاربر) کافی است؛
 * در فاز تثبیت که حجم رویداد بالا برود، این باید به یک لایه‌ی تجمیع
 * واقعی (مثلاً query های Supabase) منتقل شود.
 *
 * الگوی رویدادمحور: هرجای دیگر کد به‌جای فراخوانی مستقیم trackEvent،
 * می‌تواند eventBus.emit('analytics:track', {...}) کند و یک listener
 * (که در نقطه‌ی راه‌اندازی سرور ثبت می‌شود) این تابع را صدا بزند —
 * این باعث می‌شود UI هرگز مستقیم به Repository وابسته نباشد.
 */

export interface TrackEventInput {
  cardId: string;
  visitorId: string;
  sessionId: string;
  eventName: AnalyticsEventName;
  userId?: string;
  params?: Record<string, unknown>;
  device?: string;
  browser?: string;
  country?: string;
  city?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
}

export async function trackEvent(input: TrackEventInput): Promise<void> {
  const event: AnalyticsEvent = {
    eventId: generateEventId(),
    timestamp: new Date().toISOString(),
    ...input,
  };

  await analyticsRepository.record(event);
}

export async function getEventsForCard(cardId: string): Promise<AnalyticsEvent[]> {
  return analyticsRepository.findByCardId(cardId);
}

export interface CardAnalyticsStats {
  totalViews: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
  eventCounts: Partial<Record<AnalyticsEventName, number>>;
  topDevices: { device: string; count: number }[];
  ctr: number; // درصد کلیک نسبت به بازدید، با یک رقم اعشار
}

const CLICK_EVENT_NAMES: AnalyticsEventName[] = ['phone_click', 'email_click', 'website_click', 'button_click'];

export async function getStatsForCard(cardId: string): Promise<CardAnalyticsStats> {
  const events = await analyticsRepository.findByCardId(cardId);
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const views = events.filter((e) => e.eventName === 'card_open');
  const totalViews = views.length;
  const todayViews = views.filter((e) => new Date(e.timestamp).getTime() >= startOfToday.getTime()).length;
  const weekViews = views.filter((e) => now - new Date(e.timestamp).getTime() <= 7 * oneDayMs).length;
  const monthViews = views.filter((e) => now - new Date(e.timestamp).getTime() <= 30 * oneDayMs).length;

  const eventCounts: Partial<Record<AnalyticsEventName, number>> = {};
  events.forEach((e) => {
    eventCounts[e.eventName] = (eventCounts[e.eventName] ?? 0) + 1;
  });

  const deviceMap = new Map<string, number>();
  events.forEach((e) => {
    if (!e.device) return;
    deviceMap.set(e.device, (deviceMap.get(e.device) ?? 0) + 1);
  });
  const topDevices = Array.from(deviceMap.entries())
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);

  const clickEvents = events.filter((e) => CLICK_EVENT_NAMES.includes(e.eventName)).length;
  const ctr = totalViews > 0 ? Math.round((clickEvents / totalViews) * 1000) / 10 : 0;

  return { totalViews, todayViews, weekViews, monthViews, eventCounts, topDevices, ctr };
}

// Listener که رویداد عمومی 'analytics:track' را به ثبت واقعی متصل می‌کند.
// این تابع باید یک‌بار، در نقطه‌ی bootstrap سرور، صدا زده شود.
export function registerAnalyticsListener(): void {
  eventBus.on('analytics:track', (detail) => {
    // این listener فقط لاگ می‌کند؛ مسیر اصلی ثبت هنوز فراخوانی مستقیم
    // trackEvent از API Route است (چون به context درخواست مثل IP نیاز دارد).
    console.log('[Analytics event received on bus]', detail.eventName, detail.params);
  });
}
