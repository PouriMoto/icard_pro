'use client';

import { nanoid } from 'nanoid';
import type { CardDraft, Contact, ContactType } from '@/types/card';
import { CONTACT_TYPES, LIMITS } from '@/core/config/constants';

interface StepContactsProps {
  draft: CardDraft;
  onUpdate: (patch: Partial<CardDraft>) => void;
}

export default function StepContacts({ draft, onUpdate }: StepContactsProps) {
  const contacts = draft.contacts ?? [];

  function updateContact(id: string, patch: Partial<Contact>) {
    onUpdate({ contacts: contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  }

  function removeContact(id: string) {
    onUpdate({ contacts: contacts.filter((c) => c.id !== id) });
  }

  function addContact() {
    if (contacts.length >= LIMITS.MAX_CONTACTS) return;
    const newContact: Contact = { id: nanoid(8), type: 'mobile', value: '' };
    onUpdate({ contacts: [...contacts, newContact] });
  }

  return (
    <div>
      {contacts.map((contact) => {
        const meta = CONTACT_TYPES[contact.type];
        return (
          <div key={contact.id} style={{ border: '1.5px solid #E4E7EC', borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <select
                value={contact.type}
                onChange={(e) => updateContact(contact.id, { type: e.target.value as ContactType, value: '' })}
                style={{ flex: 1, padding: '9px 10px', borderRadius: 10, border: '1.5px solid #E4E7EC', fontSize: 13 }}
              >
                {Object.entries(CONTACT_TYPES).map(([key, m]) => (
                  <option key={key} value={key}>{m.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeContact(contact.id)}
                style={{ background: 'none', border: 'none', color: '#C0392B', fontSize: 13 }}
              >
                حذف
              </button>
            </div>
            <input
              type="text"
              placeholder={meta.placeholder}
              value={contact.value}
              onChange={(e) => updateContact(contact.id, { value: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E4E7EC', fontSize: 13 }}
            />
          </div>
        );
      })}

      <button
        type="button"
        onClick={addContact}
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
        + افزودن راه ارتباطی
      </button>
    </div>
  );
}
