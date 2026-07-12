'use client';

import type { CardDraft } from '@/types/card';

interface StepAddressProps {
  draft: CardDraft;
  onUpdate: (patch: Partial<CardDraft>) => void;
}

export default function StepAddress({ draft, onUpdate }: StepAddressProps) {
  const address = draft.address ?? { text: '', lat: '', lng: '' };

  function updateAddress(patch: Partial<typeof address>) {
    onUpdate({ address: { ...address, ...patch } });
  }

  return (
    <div>
      <textarea
        placeholder="مثلاً: تهران، خیابان ولیعصر"
        value={address.text}
        onChange={(e) => updateAddress({ text: e.target.value })}
        style={{
          width: '100%',
          minHeight: 60,
          padding: '11px 14px',
          borderRadius: 10,
          border: '1.5px solid #E4E7EC',
          fontSize: 14,
          marginBottom: 12,
        }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 4 }}>عرض جغرافیایی</label>
          <input
            type="number"
            step="any"
            placeholder="35.6892"
            value={address.lat ?? ''}
            onChange={(e) => updateAddress({ lat: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E4E7EC', fontSize: 13 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 4 }}>طول جغرافیایی</label>
          <input
            type="number"
            step="any"
            placeholder="51.3890"
            value={address.lng ?? ''}
            onChange={(e) => updateAddress({ lng: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E4E7EC', fontSize: 13 }}
          />
        </div>
      </div>
    </div>
  );
}
