import { redirect, notFound } from 'next/navigation';
import { getSessionFromCookies } from '@/auth/session';
import { getCardById } from '@/services/card.service';
import WizardShell from '@/components/wizard/WizardShell';

/**
 * صفحه‌ی ویرایش کارت موجود. همان WizardShell صفحه‌ی ساخت کارت است، فقط
 * با initialCard پر می‌شود که آن را به حالت ویرایش (PATCH به‌جای POST)
 * می‌برد. چک مالکیت اینجا (سمت سرور) انجام می‌شود؛ چک دوباره‌ی مالکیت
 * در card.service.ts هم هست (لایه‌ی دفاعی دوم برای درخواست‌های مستقیم API).
 */

interface PageProps {
  params: { id: string };
}

export default async function EditCardPage({ params }: PageProps) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/');
  }

  const card = await getCardById(params.id);
  if (!card) {
    notFound();
  }
  if (card.ownerId !== session.userId) {
    redirect('/dashboard');
  }

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 60px' }}>
      <WizardShell initialCard={card} />
    </main>
  );
}
