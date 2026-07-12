import type { AnalyticsRepository } from '@/repositories/interfaces/analytics-repository.interface';
import type { AnalyticsEvent } from '@/types/card';
import { sheetGet, sheetPost } from './google-sheets-client';

interface RawAnalyticsRow {
  event_id: string;
  card_id: string;
  user_id?: string;
  visitor_id: string;
  session_id: string;
  event_name: string;
  params_json?: string;
  timestamp: string;
  device?: string;
  browser?: string;
  country?: string;
  city?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
}

function safeJsonParse<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function rowToEvent(row: RawAnalyticsRow): AnalyticsEvent {
  return {
    eventId: row.event_id,
    cardId: row.card_id,
    userId: row.user_id || undefined,
    visitorId: row.visitor_id,
    sessionId: row.session_id,
    eventName: row.event_name as AnalyticsEvent['eventName'],
    params: safeJsonParse(row.params_json, {}),
    timestamp: String(row.timestamp),
    device: row.device || undefined,
    browser: row.browser || undefined,
    country: row.country || undefined,
    city: row.city || undefined,
    utmSource: row.utm_source || undefined,
    utmMedium: row.utm_medium || undefined,
    utmCampaign: row.utm_campaign || undefined,
    referrer: row.referrer || undefined,
  };
}

export class GoogleSheetsAnalyticsRepository implements AnalyticsRepository {
  async record(event: AnalyticsEvent): Promise<void> {
    await sheetPost('add_analytics_event', {
      event_id: event.eventId,
      card_id: event.cardId,
      user_id: event.userId ?? '',
      visitor_id: event.visitorId,
      session_id: event.sessionId,
      event_name: event.eventName,
      params_json: JSON.stringify(event.params ?? {}),
      timestamp: event.timestamp,
      device: event.device ?? '',
      browser: event.browser ?? '',
      country: event.country ?? '',
      city: event.city ?? '',
      utm_source: event.utmSource ?? '',
      utm_medium: event.utmMedium ?? '',
      utm_campaign: event.utmCampaign ?? '',
      referrer: event.referrer ?? '',
    });
  }

  async findByCardId(cardId: string): Promise<AnalyticsEvent[]> {
    const rows = await sheetGet<RawAnalyticsRow[]>('analytics', { card_id: cardId });
    return rows.map(rowToEvent);
  }
}
