'use client';

import { useCallback, useEffect, useRef } from 'react';
import { generateVisitorId, generateSessionId } from '@/lib/utils';
import type { AnalyticsEventName } from '@/types/card';

/**
 * هوک ردیابی آنالیز سمت کلاینت. مسئولیت‌ها:
 *  - ساخت/بازیابی visitorId (ماندگار در localStorage — یک بازدیدکننده
 *    یکتا در طول زمان) و sessionId (در sessionStorage — هر تب/جلسه یکی)
 *  - ثبت خودکار card_open هنگام mount و time_on_page + card_close هنگام
 *    ترک صفحه
 *  - ثبت scroll_depth در آستانه‌های ۲۵/۵۰/۷۵/۱۰۰ درصد (هرکدام فقط یک‌بار)
 *  - در اختیار گذاشتن تابع track برای رویدادهای دستی (کلیک تماس، اشتراک و...)
 */

const VISITOR_ID_KEY = 'icard_visitor_id';
const SESSION_ID_KEY = 'icard_session_id';

function getOrCreateVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = generateVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = generateSessionId();
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') ?? undefined,
    utmMedium: params.get('utm_medium') ?? undefined,
    utmCampaign: params.get('utm_campaign') ?? undefined,
  };
}

export function useAnalyticsTracker(cardId: string) {
  const scrollMarksRef = useRef<Set<number>>(new Set());
  const startTimeRef = useRef<number>(Date.now());

  const track = useCallback(
    (eventName: AnalyticsEventName, params?: Record<string, unknown>) => {
      if (typeof window === 'undefined') return;

      const visitorId = getOrCreateVisitorId();
      const sessionId = getOrCreateSessionId();
      const utm = getUtmParams();

      // keepalive تضمین می‌کند درخواست حتی هنگام ترک صفحه (beforeunload)
      // هم کامل ارسال شود، نه اینکه مرورگر آن را قطع کند.
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          visitorId,
          sessionId,
          eventName,
          params,
          referrer: document.referrer || undefined,
          ...utm,
        }),
        keepalive: true,
      }).catch(() => {
        // شکست ارسال آنالیز نباید تجربه‌ی کاربر را مختل کند — عمداً نادیده گرفته می‌شود
      });
    },
    [cardId]
  );

  useEffect(() => {
    track('card_open');
    startTimeRef.current = Date.now();
    scrollMarksRef.current = new Set();

    function handleScroll() {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;
      const scrollPercent = Math.round((window.scrollY / scrollableHeight) * 100);

      [25, 50, 75, 100].forEach((mark) => {
        if (scrollPercent >= mark && !scrollMarksRef.current.has(mark)) {
          scrollMarksRef.current.add(mark);
          track('scroll_depth', { percent: mark });
        }
      });
    }

    function handleUnload() {
      const seconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      track('time_on_page', { seconds });
      track('card_close');
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId]);

  return { track };
}
