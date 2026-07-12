'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

/**
 * پل ورود تلگرام. اگر صفحه داخل Telegram Mini App باز شده باشد
 * (window.Telegram.WebApp.initData موجود است)، خودکار initData را به
 * سرور می‌فرستد و کاربر را بدون هیچ فرمی وارد می‌کند. اگر در مرورگر
 * معمولی باز شده باشد (initData خالی)، این کامپوننت چیزی رندر نمی‌کند
 * و فرم ورود با موبایل (PhoneLoginForm) به‌صورت عادی نمایش داده می‌شود.
 */

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

type Status = 'checking' | 'authenticating' | 'error' | 'not-telegram';

export default function TelegramLoginBridge() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    const initData = webApp?.initData;

    if (!initData) {
      setStatus('not-telegram');
      return;
    }

    webApp.ready();
    webApp.expand();
    setStatus('authenticating');

    apiClient
      .post('/api/auth/telegram', { initData })
      .then(() => {
        router.push('/dashboard');
        router.refresh();
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'ورود با تلگرام ناموفق بود');
        setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'not-telegram') return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: '#fff', zIndex: 50,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}
    >
      {status === 'error' ? (
        <>
          <p style={{ color: '#E0554F', fontSize: 14, textAlign: 'center', padding: '0 24px' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#5B5FEF', color: '#fff', fontWeight: 700 }}
          >
            تلاش دوباره
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 28 }}>🪪</div>
          <p style={{ fontSize: 13, color: '#6B7280' }}>در حال ورود با تلگرام...</p>
        </>
      )}
    </div>
  );
}
