'use client';

import { useState } from 'react';
import type { Card, Contact } from '@/types/card';
import CardView from './CardView';
import QrModal from './QrModal';
import GalleryLightbox from './GalleryLightbox';
import { useAnalyticsTracker } from '@/components/analytics/useAnalyticsTracker';

/**
 * پوسته‌ی کلاینتی دور CardView — تنها جایی که به window/navigator نیاز
 * دارد (اشتراک‌گذاری، دانلود، باز کردن مودال‌ها). خود CardView همچنان
 * Server-renderable باقی می‌ماند و اینجا فقط رفتار تعاملی اضافه می‌شود.
 */

interface CardInteractiveProps {
  card: Card;
}

export default function CardInteractive({ card }: CardInteractiveProps) {
  const [qrOpen, setQrOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { track } = useAnalyticsTracker(card.id);

  function handleContactClick(contact: Contact) {
    // فقط سه نوع تماس رویداد اختصاصی تعریف‌شده در AnalyticsEventName دارند؛
    // بقیه (شبکه‌های اجتماعی، پیام‌رسان‌ها) به‌عنوان button_click با جزئیات
    // نوع در params ثبت می‌شوند تا هرگز رشته‌ی نامعتبری به سرور نرود.
    const eventMap: Partial<Record<Contact['type'], 'phone_click' | 'email_click' | 'website_click'>> = {
      phone: 'phone_click',
      mobile: 'phone_click',
      email: 'email_click',
      website: 'website_click',
    };
    const eventName = eventMap[contact.type] ?? 'button_click';
    track(eventName, { contactType: contact.type, contactId: contact.id });
  }

  async function handleShareClick() {
    track('share_click');
    const url = `${window.location.origin}/card/${card.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: card.name, text: card.description, url });
      } catch {
        // کاربر لغو کرد — نیازی به ثبت خطا نیست
      }
    } else {
      await navigator.clipboard.writeText(url);
      track('copy_link');
      alert('لینک کارت کپی شد');
    }
  }

  function handleSaveVcardClick() {
    track('download_vcf');
    window.location.href = `/api/cards/${card.id}/vcard`;
  }

  function handleQrClick() {
    track('qr_scan');
    setQrOpen(true);
  }

  function handleGalleryImageClick(index: number) {
    track('portfolio_open', { index });
    setLightboxIndex(index);
  }

  return (
    <>
      <CardView
        card={card}
        onContactClick={handleContactClick}
        onMapClick={() => track('button_click', { target: 'map' })}
        onShareClick={handleShareClick}
        onQrClick={handleQrClick}
        onSaveVcardClick={handleSaveVcardClick}
        onGalleryImageClick={handleGalleryImageClick}
      />
      <QrModal card={card} open={qrOpen} onClose={() => setQrOpen(false)} />
      {lightboxIndex !== null && (
        <GalleryLightbox
          images={card.gallery}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
