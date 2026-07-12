'use client';

import { nanoid } from 'nanoid';
import type { CardDraft, ServiceItem } from '@/types/card';
import { SERVICE_ICON_KEYS, LIMITS } from '@/core/config/constants';
import Icon, { type IconName } from '@/components/ui/Icon';

interface StepServicesProps {
  draft: CardDraft;
  onUpdate: (patch: Partial<CardDraft>) => void;
}

export default function StepServices({ draft, onUpdate }: StepServicesProps) {
  const services = draft.services ?? [];

  function updateService(id: string, patch: Partial<ServiceItem>) {
    onUpdate({ services: services.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }

  function removeService(id: string) {
    onUpdate({ services: services.filter((s) => s.id !== id) });
  }

  function addService() {
    if (services.length >= LIMITS.MAX_SERVICES) return;
    const newService: ServiceItem = { id: nanoid(8), icon: SERVICE_ICON_KEYS[0], title: '', desc: '' };
    onUpdate({ services: [...services, newService] });
  }

  return (
    <div>
      {services.map((service) => (
        <div key={service.id} style={{ border: '1.5px solid #E4E7EC', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => removeService(service.id)}
              style={{ background: 'none', border: 'none', color: '#C0392B', fontSize: 13 }}
            >
              حذف
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 10 }}>
            {SERVICE_ICON_KEYS.map((iconKey) => (
              <div
                key={iconKey}
                onClick={() => updateService(service.id, { icon: iconKey })}
                style={{
                  aspectRatio: '1',
                  border: service.icon === iconKey ? '1.5px solid #5B5FEF' : '1.5px solid #E4E7EC',
                  background: service.icon === iconKey ? '#EEF0FF' : '#FAFBFC',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: service.icon === iconKey ? '#5B5FEF' : '#6B7280',
                }}
              >
                <Icon name={iconKey as IconName} size={16} />
              </div>
            ))}
          </div>

          <input
            type="text"
            placeholder="عنوان خدمت"
            value={service.title}
            onChange={(e) => updateService(service.id, { title: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E4E7EC', fontSize: 13, marginBottom: 8 }}
          />
          <input
            type="text"
            placeholder="توضیح کوتاه"
            value={service.desc ?? ''}
            onChange={(e) => updateService(service.id, { desc: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E4E7EC', fontSize: 13 }}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addService}
        style={{
          width: '100%',
          padding: 10,
          border: '1.5px dashed #C7CAD1',
          borderRadius: 10,
          background: 'transparent',
          color: '#5B5FEF',
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        + افزودن خدمت
      </button>
    </div>
  );
}
