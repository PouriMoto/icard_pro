import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/auth/session';
import { getQrCodesByOwner } from '@/services/qr.service';
import { getCardsByOwner } from '@/services/card.service';
import CreateQrCodeForm from '@/components/qr/CreateQrCodeForm';

/**
 * صفحه‌ی مدیریت QR های پویا. هر QR یک لینک کوتاه ثابت (/q/شناسه) دارد که
 * کاربر می‌تواند مقصدش را بین کارت‌های خودش عوض کند، بدون چاپ دوباره.
 */
export default async function QrCodesPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/');
  }

  const [qrCodes, ownCards] = await Promise.all([
    getQrCodesByOwner(session.userId),
    getCardsByOwner(session.userId),
  ]);

  const cardNameById = new Map(ownCards.map((c) => [c.id, c.name]));

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>QR های پویا</h1>
      <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>
        هر QR یک لینک کوتاه ثابت دارد؛ می‌توانید مقصدش را بدون چاپ دوباره تغییر دهید.
      </p>

      <div style={{ marginBottom: 24 }}>
        <CreateQrCodeForm ownCards={ownCards} />
      </div>

      {qrCodes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF', fontSize: 13 }}>
          هنوز QR پویایی نساخته‌اید.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {qrCodes.map((qr) => (
            <div key={qr.id} style={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 14, padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 2px' }}>{qr.label}</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
                    مقصد: {cardNameById.get(qr.targetCardId) ?? 'نامشخص'}
                  </p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#5B5FEF' }}>{qr.scanCount} اسکن</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#9CA3AF' }}>
                <code>/q/{qr.shortCode}</code>
                {(qr.campaign || qr.source) && (
                  <span>
                    {qr.campaign && `کمپین: ${qr.campaign}`} {qr.source && `· منبع: ${qr.source}`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
