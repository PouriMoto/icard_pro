'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Card } from '@/types/card';
import { apiClient } from '@/lib/api-client';

interface CreateQrCodeFormProps {
  ownCards: Card[];
}

export default function CreateQrCodeForm({ ownCards }: CreateQrCodeFormProps) {
  const router = useRouter();
  const [label, setLabel] = useState('');
  const [targetCardId, setTargetCardId] = useState(ownCards[0]?.id ?? '');
  const [campaign, setCampaign] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!targetCardId) {
      setError('ابتدا باید حداقل یک کارت ساخته باشید');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/qr-codes', { label, targetCardId, campaign, source });
      setLabel('');
      setCampaign('');
      setSource('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ساخت QR ناموفق بود');
    } finally {
      setLoading(false);
    }
  }

  if (ownCards.length === 0) {
    return (
      <div style={{ background: '#fff', border: '1px dashed #E4E7EC', borderRadius: 14, padding: 20, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
        برای ساخت QR پویا، ابتدا باید حداقل یک کارت بسازید.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>عنوان QR</label>
        <input
          type="text"
          placeholder="مثلاً: QR روی غرفه نمایشگاه"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>کارت مقصد</label>
        <select value={targetCardId} onChange={(e) => setTargetCardId(e.target.value)} style={inputStyle}>
          {ownCards.map((card) => (
            <option key={card.id} value={card.id}>{card.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>کمپین (اختیاری)</label>
          <input type="text" placeholder="مثلاً: نمایشگاه بهار" value={campaign} onChange={(e) => setCampaign(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>منبع (اختیاری)</label>
          <input type="text" placeholder="مثلاً: استیکر مغازه" value={source} onChange={(e) => setSource(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {error && <p style={{ color: '#E0554F', fontSize: 12.5, margin: 0 }}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        style={{ padding: '11px 18px', borderRadius: 10, border: 'none', background: '#5B5FEF', color: '#fff', fontWeight: 700, fontSize: 13.5 }}
      >
        {loading ? 'در حال ساخت...' : '+ ساخت QR جدید'}
      </button>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1.5px solid #E4E7EC',
  fontSize: 13.5,
  background: '#FAFBFC',
};
