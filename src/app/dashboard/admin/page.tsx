import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/auth/session';
import { getAllCardsForAdmin } from '@/services/card.service';
import { getStatsForCard } from '@/services/analytics.service';
import { getPendingIndustries } from '@/services/industry.service';
import { userRepository } from '@/repositories';
import PendingIndustriesList from '@/components/admin/PendingIndustriesList';

/**
 * داشبورد ادمین. نقش واقعی کاربر چک می‌شود (نه فقط وجود جلسه).
 *
 * برای ساخت اولین ادمین: در ردیف مربوط به کاربر موردنظر در شیت Users،
 * مقدار ستون role را دستی به admin تغییر دهید.
 *
 * نکته‌ی مقیاس: محاسبه‌ی «کارت‌های برتر» فعلاً برای هر کارت جداگانه
 * getStatsForCard صدا می‌زند (N درخواست برای N کارت). برای MVP با تعداد
 * کارت محدود قابل قبول است؛ در فاز تثبیت باید به یک کوئری تجمیعی واحد
 * تبدیل شود (وقتی به Supabase مهاجرت کردیم، این با یک GROUP BY ساده
 * جایگزین می‌شود).
 */
export default async function AdminDashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/');
  }

  const currentUser = await userRepository.findById(session.userId);
  if (!currentUser || currentUser.role !== 'admin') {
    redirect('/dashboard');
  }

  const allCards = await getAllCardsForAdmin();
  const pendingIndustries = await getPendingIndustries();

  // فقط ۲۰ کارت اول برای محاسبه‌ی «برترین‌ها» بررسی می‌شود تا در مقیاس
  // فعلی سرعت صفحه قابل قبول بماند
  const cardsToAnalyze = allCards.slice(0, 20);
  const statsPerCard = await Promise.all(
    cardsToAnalyze.map(async (card) => ({
      card,
      stats: await getStatsForCard(card.id),
    }))
  );
  const topCards = statsPerCard
    .filter((entry) => entry.stats.totalViews > 0)
    .sort((a, b) => b.stats.totalViews - a.stats.totalViews)
    .slice(0, 5);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>داشبورد ادمین</h1>

      <div
        style={{
          background: '#fff',
          border: '1px solid #E4E7EC',
          borderRadius: 14,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 4px' }}>تعداد کل کارت‌ها</p>
        <p style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{allCards.length}</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>پربازدیدترین کارت‌ها</p>
        {topCards.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>هنوز داده‌ی بازدیدی ثبت نشده است</p>
        ) : (
          topCards.map(({ card, stats }) => (
            <div
              key={card.id}
              style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid #F0F1F5' }}
            >
              <span>{card.name}</span>
              <span style={{ fontWeight: 700 }}>{stats.totalViews} بازدید</span>
            </div>
          ))
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 14, padding: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>صنایع در انتظار تایید</p>
        <PendingIndustriesList industries={pendingIndustries} />
      </div>
    </main>
  );
}
