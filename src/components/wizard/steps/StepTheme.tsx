'use client';

import type { CardDraft } from '@/types/card';
import { THEMES } from '@/core/config/constants';

interface StepThemeProps {
  draft: CardDraft;
  onUpdate: (patch: Partial<CardDraft>) => void;
}

export default function StepTheme({ draft, onUpdate }: StepThemeProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
      {THEMES.map((theme) => {
        const selected = draft.theme === theme.id;
        return (
          <div
            key={theme.id}
            onClick={() => onUpdate({ theme: theme.id })}
            style={{
              aspectRatio: '1',
              borderRadius: 14,
              background: theme.css,
              border: selected ? '3px solid #1F2430' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {selected && <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>✓</span>}
          </div>
        );
      })}
    </div>
  );
}
