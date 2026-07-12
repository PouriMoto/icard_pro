'use client';

import { useRef, useState } from 'react';
import type { CardDraft } from '@/types/card';
import { apiClient } from '@/lib/api-client';

/**
 * مرحله‌ی آپلود عکس پروفایل/لوگو.
 *
 * تفاوت کلیدی با MVP اول: آنجا عکس با Canvas سمت کلاینت فشرده و به‌صورت
 * Base64 در state ذخیره می‌شد. اینجا عکس مستقیماً (بدون عبور از سرور ما)
 * با یک امضای امن به Cloudinary آپلود می‌شود و فقط URL نهایی در state
 * ذخیره می‌شود — هم سریع‌تر، هم بدون محدودیت حجم localStorage.
 */

interface UploadSignature {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

interface StepAvatarProps {
  draft: CardDraft;
  onUpdate: (patch: Partial<CardDraft>) => void;
}

export default function StepAvatar({ draft, onUpdate }: StepAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      // مرحله ۱: گرفتن امضای معتبر از سرور خودمان
      const signature = await apiClient.post<UploadSignature>('/api/upload');

      // مرحله ۲: آپلود مستقیم فایل به Cloudinary با همان امضا
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signature.apiKey);
      formData.append('timestamp', String(signature.timestamp));
      formData.append('signature', signature.signature);
      formData.append('folder', signature.folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadJson?.error?.message || 'آپلود به Cloudinary ناموفق بود');
      }

      onUpdate({ avatarUrl: uploadJson.secure_url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در آپلود تصویر');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed #D1D5DB',
          borderRadius: 14,
          padding: 24,
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        {draft.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={draft.avatarUrl}
            alt="پیش‌نمایش"
            style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 10px' }}
          />
        ) : (
          <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 6 }}>
            {uploading ? 'در حال آپلود...' : 'برای انتخاب تصویر کلیک کنید'}
          </div>
        )}
        <div style={{ fontSize: 11, color: '#9CA3AF' }}>حداکثر حجم پیشنهادی ۳۰۰ کیلوبایت</div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {error && <p style={{ color: '#E0554F', fontSize: 12.5, marginTop: 8 }}>{error}</p>}

      {draft.avatarUrl && (
        <button
          type="button"
          onClick={() => onUpdate({ avatarUrl: undefined })}
          style={{
            marginTop: 10,
            background: 'transparent',
            border: '1.5px solid #E4E7EC',
            borderRadius: 10,
            padding: '8px 14px',
            fontSize: 12.5,
            color: '#6B7280',
          }}
        >
          حذف تصویر
        </button>
      )}
    </div>
  );
}
