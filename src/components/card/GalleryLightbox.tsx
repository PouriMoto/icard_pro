'use client';

import { useEffect, useState } from 'react';
import type { GalleryItem } from '@/types/card';

/**
 * مودال بزرگ‌نمایی گالری. با کلیک روی هر تصویر گالری در CardView باز
 * می‌شود (از طریق CardInteractive)؛ ناوبری بعدی/قبلی و بستن با کلید Esc.
 */

interface GalleryLightboxProps {
  images: GalleryItem[];
  initialIndex: number;
  onClose: () => void;
}

export default function GalleryLightbox({ images, initialIndex, onClose }: GalleryLightboxProps) {
  const [index, setIndex] = useState(initialIndex % Math.max(images.length, 1));

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowRight') setIndex((i) => (i - 1 + images.length) % images.length);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  if (images.length === 0) return null;
  const current = images[index];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10,10,14,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1100, padding: 20, animation: 'fadeIn 200ms ease',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, left: 20, width: 36, height: 36,
          borderRadius: '50%', background: 'rgba(255,255,255,0.15)', color: '#fff',
          border: 'none', fontSize: 18,
        }}
      >
        ✕
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIndex((i) => (i - 1 + images.length) % images.length); }}
            style={navBtnStyle('right')}
          >
            ›
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIndex((i) => (i + 1) % images.length); }}
            style={navBtnStyle('left')}
          >
            ‹
          </button>
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.url}
        alt="نمونه کار"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)', transition: 'opacity 200ms ease',
        }}
      />

      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: 20, color: '#fff', fontSize: 13, opacity: 0.8 }}>
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

function navBtnStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    [side]: 20,
    transform: 'translateY(-50%)',
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: 'none',
    fontSize: 24,
  };
}
