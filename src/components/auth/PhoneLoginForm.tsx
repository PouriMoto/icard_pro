'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * فرم ورود با شماره موبایل. یک کامپوننت کلاینتی مجزا از صفحه است تا
 * صفحه‌ی اصلی (page.tsx) بتواند به‌صورت Server Component بماند —
 * فقط بخشی که نیاز به تعامل/state دارد کلاینتی است.
 */
export default function PhoneLoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name }),
      });
      const json = await res.json();

      if (json.status !== 'ok') {
        setError(json.message || 'ورود ناموفق بود');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('خطا در ارتباط با سرور. اتصال اینترنت را بررسی کنید.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.fieldGroup}>
        <label style={styles.label} htmlFor="phone">شماره موبایل</label>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          placeholder="09xxxxxxxxx"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={styles.input}
          required
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label} htmlFor="name">نام شما (اختیاری)</label>
        <input
          id="name"
          type="text"
          placeholder="مثلاً: سارا محمدی"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
      </div>

      {error && <p style={styles.errorText}>{error}</p>}

      <button type="submit" disabled={loading} style={styles.submitBtn}>
        {loading ? 'در حال ورود...' : 'ورود / ثبت‌نام'}
      </button>
    </form>
  );
}

// استایل inline موقت — در فاز بعد با کلاس‌های CSS مشترک جایگزین می‌شود
const styles: Record<string, React.CSSProperties> = {
  form: { display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 360 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: {
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #E4E7EC',
    fontSize: 14,
    background: '#FAFBFC',
  },
  errorText: { color: '#E0554F', fontSize: 13, margin: 0 },
  submitBtn: {
    padding: '13px 20px',
    borderRadius: 10,
    border: 'none',
    background: '#5B5FEF',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
  },
};
