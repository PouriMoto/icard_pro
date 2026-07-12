import { notFound } from 'next/navigation';
import { getCardBySlug } from '@/services/card.service';
import CardInteractive from '@/components/card/CardInteractive';

/**
 * صفحه‌ی عمومی کارت — همان چیزی که با اسکن QR یا کلیک لینک باز می‌شود.
 * Server Component است تا سریع رندر شود و برای SEO آماده باشد (فاز بعد
 * متادیتای Open Graph هم اینجا اضافه می‌شود).
 *
 * تعامل‌های کلاینتی (اشتراک‌گذاری، QR، ذخیره vCard) در CardInteractive
 * پیاده‌سازی شده‌اند — یک پوسته‌ی کلاینتی جدا دور CardView که به
 * window/navigator نیاز دارد.
 */

interface PageProps {
  params: { slug: string };
}

export default async function PublicCardPage({ params }: PageProps) {
  const card = await getCardBySlug(params.slug);

  if (!card || card.status !== 'active') {
    notFound();
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        padding: '24px 16px 60px',
        background: '#ECEFF3',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <CardInteractive card={card} />
      </div>
    </main>
  );
}
