import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/auth/session';
import PhoneLoginForm from '@/components/auth/PhoneLoginForm';
import TelegramLoginBridge from '@/components/auth/TelegramLoginBridge';

/**
 * صفحه‌ی اصلی/ورود. اگر کاربر از قبل جلسه‌ی معتبر دارد، مستقیم به
 * داشبورد هدایت می‌شود (نیازی به دیدن دوباره‌ی فرم ورود نیست).
 *
 * TelegramLoginBridge به‌طور خودکار تشخیص می‌دهد آیا صفحه داخل Telegram
 * Mini App باز شده یا نه. اگر بله، یک پوشش تمام‌صفحه نشان می‌دهد و ورود
 * خودکار انجام می‌شود؛ اگر نه (مرورگر معمولی)، چیزی رندر نمی‌کند و فرم
 * شماره موبایل به‌صورت عادی در دسترس می‌ماند.
 */
export default async function HomePage() {
  const session = await getSessionFromCookies();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        gap: 28,
      }}
    >
      <TelegramLoginBridge />

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>
          🪪 iCard
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
          کارت ویزیت دیجیتال خود را بسازید
        </p>
      </div>

      <PhoneLoginForm />
    </main>
  );
}
