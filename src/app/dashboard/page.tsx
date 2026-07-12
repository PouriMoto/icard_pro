import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/auth/session';
import { getCardsByOwner } from '@/services/card.service';

/**
 * داشبورد کاربر — نسخه‌ی حداقلی فاز ۰. فقط لیست کارت‌های خود کاربر و
 * دکمه‌ی ساخت کارت جدید. آمار/ویرایش کامل/QR در فاز ۲ اضافه می‌شود
 * (طبق نقشه‌ی راه).
 */
export default async function DashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/');
  }

  const cards = await getCardsByOwner(session.userId);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>کارت‌های من</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href="/dashboard/qr-codes"
            style={{
              background: '#F1F2F6',
              color: '#374151',
              padding: '10px 18px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            QR های پویا
          </Link>
          <Link
            href="/wizard"
            style={{
              background: '#5B5FEF',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: 10,
              fontSize: 13,
            fontWeight: 700,
          }}
        >
          + ساخت کارت جدید
          </Link>
        </div>
      </div>

      {cards.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#9CA3AF',
            background: '#fff',
            borderRadius: 16,
            border: '1px dashed #E4E7EC',
          }}
        >
          هنوز کارتی نساخته‌اید. با دکمه‌ی بالا اولین کارت خود را بسازید.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {cards.map((card) => (
            <div
              key={card.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fff',
                border: '1px solid #E4E7EC',
                borderRadius: 14,
                padding: '14px 18px',
              }}
            >
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 2px' }}>{card.name}</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>/{card.slug}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link
                  href={`/dashboard/edit/${card.id}`}
                  style={{ fontSize: 12.5, color: '#5B5FEF', fontWeight: 600, padding: '8px 12px' }}
                >
                  ویرایش
                </Link>
                <Link
                  href={`/dashboard/analytics/${card.id}`}
                  style={{ fontSize: 12.5, color: '#5B5FEF', fontWeight: 600, padding: '8px 12px' }}
                >
                  آمار
                </Link>
                <Link
                  href={`/card/${card.slug}`}
                  style={{ fontSize: 12.5, color: '#5B5FEF', fontWeight: 600, padding: '8px 12px' }}
                >
                  مشاهده
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
