import { redirect, notFound } from 'next/navigation';
import { getSessionFromCookies } from '@/auth/session';
import { getCardById } from '@/services/card.service';
import { getStatsForCard } from '@/services/analytics.service';

/**
 * صفحه‌ی آمار یک کارت مشخص، فقط برای مالک آن قابل مشاهده است.
 */

interface PageProps {
  params: { id: string };
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 14, padding: 16 }}>
      <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{value}</p>
    </div>
  );
}

export default async function CardAnalyticsPage({ params }: PageProps) {
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

  const stats = await getStatsForCard(card.id);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>آمار «{card.name}»</h1>
      <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>/{card.slug}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="بازدید امروز" value={stats.todayViews} />
        <StatCard label="بازدید این هفته" value={stats.weekViews} />
        <StatCard label="بازدید این ماه" value={stats.monthViews} />
        <StatCard label="کل بازدید" value={stats.totalViews} />
        <StatCard label="نرخ کلیک (CTR)" value={`${stats.ctr}%`} />
      </div>

      <div style={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 14, padding: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>دستگاه‌های بازدیدکننده</p>
        {stats.topDevices.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>هنوز داده‌ای ثبت نشده است</p>
        ) : (
          stats.topDevices.map((d) => (
            <div
              key={d.device}
              style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid #F0F1F5' }}
            >
              <span>{d.device}</span>
              <span style={{ fontWeight: 700 }}>{d.count}</span>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
