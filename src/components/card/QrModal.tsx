'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { Card } from '@/types/card';
import { buildVCardText } from '@/services/vcard.service';

/**
 * مودال QR — نسخه‌ی React با کتابخانه‌ی npm `qrcode` (به‌جای CDN که در
 * MVP اول استفاده شده بود). این یعنی دیگر وابستگی به شبکه در لحظه‌ی
 * اجرا نداریم؛ کتابخانه بخشی از باندل پروژه است.
 *
 * دو تب: «آفلاین» (کد QR حاوی مستقیم vCard) و «آنلاین» (کد QR حاوی
 * لینک صفحه‌ی عمومی کارت).
 */

interface QrModalProps {
  card: Card;
  open: boolean;
  onClose: () => void;
}

export default function QrModal({ card, open, onClose }: QrModalProps) {
  const [tab, setTab] = useState<'offline' | 'online'>('offline');
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setError(null);
    const text =
      tab === 'offline'
        ? buildVCardText(card)
        : `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/card/${card.slug}`;

    QRCode.toDataURL(text, { width: 240, margin: 1 })
      .then(setDataUrl)
      .catch(() => setError('تولید QR ناموفق بود'));
  }, [open, tab, card]);

  if (!open) return null;

  function handleDownload() {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'qr-code.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(20,22,30,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, padding: 22, width: '100%', maxWidth: 340 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>کد QR کارت</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#9CA3AF' }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 6, background: '#F1F2F6', borderRadius: 10, padding: 4, marginBottom: 16 }}>
          <button
            onClick={() => setTab('offline')}
            style={{ flex: 1, border: 'none', padding: 8, borderRadius: 8, fontSize: 13, fontWeight: 600, background: tab === 'offline' ? '#fff' : 'transparent' }}
          >
            آفلاین (vCard)
          </button>
          <button
            onClick={() => setTab('online')}
            style={{ flex: 1, border: 'none', padding: 8, borderRadius: 8, fontSize: 13, fontWeight: 600, background: tab === 'online' ? '#fff' : 'transparent' }}
          >
            آنلاین (لینک)
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', minHeight: 220, alignItems: 'center', background: '#FAFBFC', borderRadius: 12, marginBottom: 14 }}>
          {error ? (
            <p style={{ color: '#E0554F', fontSize: 13, padding: 20, textAlign: 'center' }}>{error}</p>
          ) : dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="QR Code" width={220} height={220} />
          ) : (
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>در حال تولید...</p>
          )}
        </div>

        <button
          onClick={handleDownload}
          disabled={!dataUrl}
          style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: '#F1F2F6', color: '#374151', fontWeight: 600, fontSize: 13 }}
        >
          دانلود تصویر QR
        </button>
      </div>
    </div>
  );
}
