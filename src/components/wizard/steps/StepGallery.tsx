'use client';

import { nanoid } from 'nanoid';
import { useRef, useState } from 'react';
import type { CardDraft, GalleryItem } from '@/types/card';
import { LIMITS } from '@/core/config/constants';
import { apiClient } from '@/lib/api-client';

interface UploadSignature {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

interface StepGalleryProps {
  draft: CardDraft;
  onUpdate: (patch: Partial<CardDraft>) => void;
}

async function uploadOneFile(file: File): Promise<GalleryItem> {
  const signature = await apiClient.post<UploadSignature>('/api/upload');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signature.apiKey);
  formData.append('timestamp', String(signature.timestamp));
  formData.append('signature', signature.signature);
  formData.append('folder', signature.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'آپلود تصویر ناموفق بود');
  }

  return { id: nanoid(8), url: json.secure_url, cloudinaryPublicId: json.public_id };
}

export default function StepGallery({ draft, onUpdate }: StepGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const gallery = draft.gallery ?? [];

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = LIMITS.GALLERY_MAX_ITEMS - gallery.length;
    if (remaining <= 0) {
      setError('حداکثر تعداد تصاویر گالری رسیده است');
      return;
    }

    setError(null);
    setUploading(true);

    const toProcess = files.slice(0, remaining);
    const results: GalleryItem[] = [];

    for (const file of toProcess) {
      try {
        const item = await uploadOneFile(file);
        results.push(item);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در آپلود یکی از تصاویر');
      }
    }

    onUpdate({ gallery: [...gallery, ...results] });
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  function removeImage(id: string) {
    onUpdate({ gallery: gallery.filter((g) => g.id !== id) });
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        style={{ border: '2px dashed #D1D5DB', borderRadius: 14, padding: 24, textAlign: 'center', cursor: 'pointer' }}
      >
        <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 4 }}>
          {uploading ? 'در حال آپلود...' : 'افزودن تصویر به گالری'}
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF' }}>
          حداکثر {LIMITS.GALLERY_MAX_ITEMS} تصویر
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFilesChange}
      />

      {error && <p style={{ color: '#E0554F', fontSize: 12.5, marginTop: 8 }}>{error}</p>}

      {gallery.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
          {gallery.map((item) => (
            <div key={item.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="نمونه کار" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => removeImage(item.id)}
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.55)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 12,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
