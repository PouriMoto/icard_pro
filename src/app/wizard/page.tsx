import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/auth/session';
import WizardShell from '@/components/wizard/WizardShell';

/**
 * صفحه‌ی Wizard. چک احراز هویت سمت سرور انجام می‌شود (قبل از رندر حتی
 * یک بایت از فرم) تا کاربر واردنشده هرگز فرم را نبیند؛ خود فرم و
 * state تعاملی آن در WizardShell (کلاینتی) است.
 */
export default async function WizardPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/');
  }

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 60px' }}>
      <WizardShell />
    </main>
  );
}
